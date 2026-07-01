// entities/projectiles/Wave.js
import { vec3 } from "gl-matrix";

import { beeInfo } from "../../data/bees.js";
import { MATH } from "../../utils/math.js";
import { Explosion } from "../miscEntities/Explosion.js";
import { LootToken, DupedToken } from "../tokens.js";
import { collectPollen } from "../../engine/collectPollen.js";
import { Projectile, PROJECTILE_SOURCE } from "./ProjectileTemplate.js";

// CHQ: Claude AI (Sonnet): now extends Projectile, threaded gameState
// through instead of relying on module-level globals (player, dt, objects,
// TIME, fieldInfo, textRenderer, COLORS, gl, meshes, glCache), and split the
// raw gl.* draw calls out into drawEntities/drawWave.js — same treatment as
// PetalShuriken. Also fixed: gl.FLASE typo, for...in over arrays producing
// string indices, and die() incorrectly splicing from objects.mobs.
//
// NOTE: the balloon-hit sweep below still calls `balloon.die(i, gameState)`
// directly from inside Wave's own update(), using an index (`i`) captured
// mid-loop over objects.balloons. updateEngine.js *also* owns a balloons
// loop that splices on its own captured indices. Calling die() on another
// entity from inside a sibling entity's update() risks the same index
// invalidation problem the engine's index-based splice loops are designed
// to avoid — this was true in the original code too, just flagging it here
// since it wasn't in scope to fix as part of the Projectile extraction.

const LIFESPAN_BASE = 3.5;
const LIFESPAN_SIZE_FACTOR = 0.25;
const BOB_FREQUENCY = 12.5;
const BOB_AMPLITUDE = 0.35;
const BUBBLE_POP_RADIUS_SQ_FACTOR = 4.5;
const FUZZBOMB_POP_RADIUS_SQ_FACTOR = 3.5;
const TOKEN_COLLECT_RADIUS_SQ_FACTOR = 3.5;
const BALLOON_HIT_SIZE_THRESHOLD = 3.25;
const BALLOON_HIT_CHANCE = 0.3333;
const BALLOON_HIT_RADIUS_FACTOR = 0.8;
const COLLECT_TICK_INTERVAL = 0.35;

export class Wave extends Projectile {
  /**
   * @param {number[]} pos - Spawn position [x, y, z].
   * @param {number[]} vel - Initial velocity vector [x, y, z]; mutated and
   *   scaled by (size + 5) internally, same as the original.
   * @param {Object} gameState - The live game state object.
   * @param {Object} gameState.player - Must expose `tidalSurge`/`tidePower`.
   */
  constructor(pos, vel, gameState) {
    const { player } = gameState;
    const size = player.tidalSurge ? 3.4 : player.tidePower * 0.85 + 0.45;
    const angle = Math.atan2(vel[2], vel[0]) + Math.PI * 0.5;
    const lifespan = LIFESPAN_BASE + size * LIFESPAN_SIZE_FACTOR;

    super([...pos, angle], lifespan, PROJECTILE_SOURCE.PLAYER, "wave");

    vec3.scale(vel, vel, size + 5);
    this.vel = vel;

    this.y = pos[1];
    this.size = size;
    this.collectTimer = 0;
    this.balloonsHit = new Set();
    this.hitBees = new Set();
  }

  /**
   * Advances the wave: moves it, bobs it vertically, resolves bee/bubble/
   * fuzzBomb/token/balloon interactions, and periodically collects pollen
   * from the field the player is standing in.
   *
   * @param {number} dt - Delta time in seconds.
   * @param {Object} gameState - The live game state object.
   * @returns {boolean} true once life has expired.
   */
  update(dt, gameState) {
    const isDead = this.tickLife(dt);
    const TIME = gameState.TIME || 0;

    this.pos[0] += this.vel[0] * dt;
    this.pos[2] += this.vel[2] * dt;
    this.pos[1] =
      Math.min(this.y, this.y - (this.lifespan - this.life) * this.size) +
      Math.sin(TIME * BOB_FREQUENCY) * BOB_AMPLITUDE * this.size;

    const { player, objects, textRenderer, COLORS, fieldManager } = gameState;

    this._resolveBeeHits(gameState, player, objects, textRenderer, COLORS);
    this._resolvePops(objects);
    this._resolveTokenPickups(objects);
    this._resolveBalloonHits(gameState, player, objects, fieldManager);
    this._collectFieldPollen(dt, gameState, player, fieldManager);

    return isDead;
  }

  _resolveBeeHits(gameState, player, objects, textRenderer, COLORS) {
    for (const bee of objects.bees) {
      if (this.hitBees.has(bee)) continue;

      const dist =
        Math.abs(bee.pos[0] - this.pos[0]) +
        Math.abs(bee.pos[1] - this.y) +
        Math.abs(bee.pos[2] - this.pos[2]);

      if (dist >= 1) continue;

      this.hitBees.add(bee);

      objects.explosions.push(
        new Explosion({
          col: [0.2, 0.5, 1],
          pos: [this.pos[0], this.y, this.pos[2]],
          life: 0.5,
          size: 1.2,
          speed: 0.35,
          aftershock: 0.005,
        }),
      );

      const convertRateKey = `${beeInfo[bee.type].color}ConvertRate`;
      const amountToConvert = Math.ceil(
        Math.min(
          player.pollen,
          10000 + bee.convertAmount * 10 * player[convertRateKey],
        ),
      );

      player.pollen -= amountToConvert;
      const honeyGained = Math.ceil(amountToConvert * player.honeyPerPollen);
      player.honey += honeyGained;

      if (amountToConvert) {
        textRenderer.add(
          honeyGained + "",
          [bee.pos[0], bee.pos[1] + 0.75, bee.pos[2]],
          COLORS.honey,
          1,
          "⇆",
        );
      }
    }
  }

  _resolvePops(objects) {
    const bubbleRadiusSq = BUBBLE_POP_RADIUS_SQ_FACTOR * this.size;
    for (const bubble of objects.bubbles) {
      if (vec3.sqrDist(this.pos, bubble.pos) <= bubbleRadiusSq) {
        bubble.pop();
      }
    }

    const fuzzBombRadiusSq = FUZZBOMB_POP_RADIUS_SQ_FACTOR * this.size;
    for (const fuzzBomb of objects.fuzzBombs) {
      if (vec3.sqrDist(this.pos, fuzzBomb.pos) <= fuzzBombRadiusSq) {
        fuzzBomb.pop();
      }
    }
  }

  _resolveTokenPickups(objects) {
    const radiusSq = TOKEN_COLLECT_RADIUS_SQ_FACTOR * this.size;
    for (const token of objects.tokens) {
      if (token.from === "Balloon") continue;
      if (token instanceof DupedToken) continue;
      if (vec3.sqrDist(this.pos, token.pos) <= radiusSq) {
        token.collect();
      }
    }
  }

  _resolveBalloonHits(gameState, player, objects, fieldManager) {
    if (this.size < BALLOON_HIT_SIZE_THRESHOLD) return;
    if (!objects.balloons) return;

    const fieldInfo = fieldManager?.fieldInfo || {};
    const hitRadius = this.size * BALLOON_HIT_RADIUS_FACTOR;

    for (let i = 0; i < objects.balloons.length; i++) {
      const balloon = objects.balloons[i];

      if (balloon.state !== "float") continue;
      if (this.balloonsHit.has(balloon.id)) continue;
      if (Math.random() >= BALLOON_HIT_CHANCE) continue;

      const dist =
        Math.abs(this.pos[0] - balloon.pos[0]) +
        Math.abs(this.pos[2] - balloon.pos[2]);
      if (dist > hitRadius) continue;

      this.balloonsHit.add(balloon.id);

      objects.explosions.push(
        new Explosion({
          col: [0.1, 0.5, 1],
          pos: [this.pos[0], this.y + 4, this.pos[2]],
          life: 0.5,
          size: balloon.displaySize * 1.5,
          speed: 0.4,
          aftershock: 0.01,
        }),
      );

      const amountDrained = Math.round(
        Math.min(balloon.pollen, balloon.cap * 0.01),
      );
      balloon.pollen -= amountDrained;

      const honeyPerToken = Math.round(
        (amountDrained * (balloon.golden ? 1.05 : 1)) / 3,
      );

      if (honeyPerToken) {
        const offset = Math.random() * MATH.TWO_PI;
        for (
          let angle = offset;
          angle < MATH.TWO_PI + offset;
          angle += MATH.TWO_PI / 3
        ) {
          objects.tokens.push(
            new LootToken(
              30,
              [
                this.pos[0] + Math.cos(angle) * 1.5,
                (fieldInfo[balloon.field]?.y || 0) + 1,
                this.pos[2] + Math.sin(angle) * 1.5,
              ],
              "honey",
              honeyPerToken,
              true,
              "Balloon",
            ),
          );
        }
      }

      player.addEffect(
        "tideBlessing",
        ((balloon.golden ? 45 : 30) / (4 * 60 * 60)) * 2,
      );

      if (balloon.pollen <= 0) {
        // See top-of-file note: calling die() directly here (rather than
        // via updateEngine.js's own balloons loop) is preserved from the
        // original behavior, not introduced by this refactor.
        balloon.die(i, gameState);
      }
    }
  }

  _collectFieldPollen(dt, gameState, player, fieldManager) {
    this.collectTimer -= dt;
    if (this.collectTimer > 0 || !player.fieldIn) return;

    this.collectTimer = COLLECT_TICK_INTERVAL;

    const field = fieldManager?.fieldInfo?.[player.fieldIn];
    if (!field) return;

    const x = Math.round(this.pos[0] - field.x);
    const z = Math.round(this.pos[2] - field.z);

    collectPollen({
      x,
      z,
      pattern: [
        [0, 0],
        [-1, 0],
        [1, 0],
        [0, 1],
        [0, -1],
        [-1, -1],
        [1, 1],
        [-1, 1],
        [1, -1],
      ],
      amount: {
        r: this.size * this.life * 0.5,
        w: 2 * this.size * this.life,
        b: 3 * this.size * this.life,
      },
      yOffset: 2.2,
      stackHeight: 0.5 + Math.random() * 0.85,
    });
  }

  // die() needs no override — base Projectile.die() splicing
  // gameState.objects.projectiles is all this entity needs.
}
