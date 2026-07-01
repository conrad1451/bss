// entities/miscEntities/PetalShuriken.js
import { vec3 } from "gl-matrix";

import { beeInfo } from "../../data/bees.js";
// import Explosion
// import { DupedToken } from "../tokens.js";

// CHQ: Claude AI (Sonnet) refactored: threaded gameState through instead
// of relying on module-level globals (dt, objects, player, textRenderer,
// COLORS, gl, meshes, glCache), and split the raw gl.* draw calls out into
// drawEntities/drawPetalShuriken.js. Rendering is owned by renderer.js in
// this codebase, not by entity update() (see the same note in BugMob.js).
// Also fixed: `gl.FLASE` typo, `for...in` over arrays producing string
// indices, and die() incorrectly splicing from objects.mobs.

const HIT_RADIUS = 1;
const BUBBLE_POP_RADIUS_SQ = 4.5;
const FUZZBOMB_POP_RADIUS_SQ = 3.5;
const TOKEN_COLLECT_RADIUS_SQ = 3.5;
const SPIN_SPEED = 10; // radians/sec, stored in pos[3]
const LIFE_SECONDS = 1.5;

export class PetalShuriken {
  /**
   * @param {number[]} pos - Spawn position [x, y, z].
   * @param {number[]} vel - Initial velocity vector [x, y, z]; scaled by 10 internally.
   */
  constructor(pos, vel) {
    this.pos = [...pos, 0]; // pos[3] doubles as spin angle
    this.vel = vec3.scale(vec3.create(), vel, 10);
    this.life = LIFE_SECONDS;
    this.hitBees = new Set();
  }

  /**
   * Advances the shuriken, resolves collisions against bees (converting
   * pollen to honey on hit), popping bubbles/fuzz bombs, and collecting
   * nearby tokens.
   *
   * @param {number} dt - Delta time in seconds.
   * @param {Object} gameState - The live game state object.
   * @returns {boolean} true once the shuriken's life has expired, signalling
   *   the engine loop should call die() and remove it.
   */
  update(dt, gameState) {
    const { player, objects, textRenderer, COLORS } = gameState;

    this.life -= dt;
    this.pos[0] += this.vel[0] * dt;
    this.pos[2] += this.vel[2] * dt;
    this.pos[3] += dt * SPIN_SPEED;

    this._resolveBeeHits(dt, gameState, player, objects, textRenderer, COLORS);
    this._resolvePops(objects);
    this._resolveTokenPickups(objects);

    return this.life <= 0;
  }

  _resolveBeeHits(dt, gameState, player, objects, textRenderer, COLORS) {
    for (const bee of objects.bees) {
      if (this.hitBees.has(bee)) continue;

      const dist =
        Math.abs(bee.pos[0] - this.pos[0]) +
        Math.abs(bee.pos[1] - this.pos[1]) +
        Math.abs(bee.pos[2] - this.pos[2]);

      if (dist >= HIT_RADIUS) continue;

      this.hitBees.add(bee);

      objects.explosions.push(
        new Explosion({
          col: Math.random() < 0.5 ? [1, 0.9, 0] : [1, 0, 0.825],
          pos: this.pos.slice(),
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
          10000 + bee.convertAmount * 7.5 * player[convertRateKey],
        ),
      );

      if (amountToConvert) {
        player.pollen -= amountToConvert;
        const honeyGained = Math.ceil(amountToConvert * player.honeyPerPollen);
        player.honey += honeyGained;

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
    for (const bubble of objects.bubbles) {
      if (vec3.sqrDist(this.pos, bubble.pos) <= BUBBLE_POP_RADIUS_SQ) {
        bubble.pop();
      }
    }

    for (const fuzzBomb of objects.fuzzBombs) {
      if (vec3.sqrDist(this.pos, fuzzBomb.pos) <= FUZZBOMB_POP_RADIUS_SQ) {
        fuzzBomb.pop();
      }
    }
  }

  _resolveTokenPickups(objects) {
    for (const token of objects.tokens) {
      if (token instanceof DupedToken) continue;
      if (vec3.sqrDist(this.pos, token.pos) <= TOKEN_COLLECT_RADIUS_SQ) {
        token.collect();
      }
    }
  }

  /**
   * Removes this shuriken from the live projectiles list. Mirrors the
   * die(index, gameState) contract used by mobs, tokens and balloons in
   * the engine. Called by updateEngine.js after update() signals death.
   *
   * @param {number} index - Index of this shuriken in gameState.objects.projectiles.
   * @param {Object} gameState - The live game state object.
   */
  die(index, gameState) {
    gameState.objects.projectiles.splice(index, 1);
  }
}
