// entities/miscEntities/Bubble.js

// CHQ: Claude AI (Sonnet) refactored: converted from a standalone class
// reading bare globals (fieldInfo, TIME, objects, player, ParticleRenderer,
// MATH, vec3, meshes, dt, collectPollen, Explosion, LootToken) to a
// gameState-based class, following the pattern established in Flame.js
// and Explosion.js.

import { vec3 } from "gl-matrix";
import { MATH } from "../../utils/math.js";
import { ParticleRenderer } from "../../engine/particles.js";
import { Explosion } from "./Explosion.js";

// TODO: collectPollen has no home yet in this codebase (not exported from
// any file currently in the project). Flame.js has the same open call.
// This is a real gap, not a naming mismatch - until it's ported/written
// somewhere, pop() below will throw a ReferenceError when it fires.
//
// TODO: LootToken is a separate, richer token type than the Token class in
// entities/tokens.js (different constructor signature: (life, pos, type,
// amount, isBoss, label) vs Token's (type, amount, pos, isBossDrop)).
// Per project owner: implementation exists somewhere else, to be located
// and wired in later. Left as a bare reference below until then.

export class Bubble {
  /**
   * @param {string} field - Field id this bubble belongs to.
   * @param {number} x - Local x offset within the field.
   * @param {number} z - Local z offset within the field.
   * @param {boolean} golden - Whether this bubble spawns as a golden (bonus) bubble.
   * @param {Object} gameState - The live game state object.
   */
  constructor(field, x, z, golden, gameState) {
    this.gameState = gameState;

    const { fieldInfo, TIME } = gameState;

    this.golden = golden;
    this.col = this.golden ? [1, 0.6, 0.1] : [0, 0.4, 0.9];
    this.life = 10;
    this.field = field;
    this.x = x;
    this.z = z;
    this.pos = [
      fieldInfo[this.field].x + this.x,
      fieldInfo[this.field].y + 0.5,
      fieldInfo[this.field].z + this.z,
    ];
    this.birth = TIME;
  }

  /**
   * @param {number} index - This bubble's index in gameState.objects.bubbles.
   * @returns {void}
   */
  die(index) {
    this.gameState.objects.bubbles.splice(index, 1);
  }

  turnGolden() {
    if (this.golden) return;

    this.golden = true;
    this.col = [0.875 * 0.85, 0.85 * 0.85, 0.1 * 0.85];

    for (let i = 0; i < 10; i++) {
      ParticleRenderer.add({
        x: this.pos[0],
        y: this.pos[1],
        z: this.pos[2],
        vx: MATH.random(-2, 2),
        vy: MATH.random(0, 2),
        vz: MATH.random(-2, 2),
        grav: 0,
        size: MATH.random(30, 100),
        col: [1, 1, 0],
        life: 1.75,
        rotVel: MATH.random(-3, 3),
        alpha: 3,
      });
    }
  }

  pop() {
    const { player, objects } = this.gameState;

    player.stats.bubbles++;

    if (player.popStarActive) {
      player.popStarActive.popParticles.push(this.pos);
      player.stats.popStar += this.golden ? 2 : 1;
      player.addEffect("bubbleBloat", (this.golden ? 4 : 2) / (60 * 60));
    }

    if (player.currentGear.tool === "tidePopper") {
      player.addEffect("tidePower");

      if (this.golden) player.addEffect("tidePower");

      if (player.tidalSurge) {
        player.addEffect("tidalSurge", this.golden ? 0.00003 : 0.00001);
      }
    }

    objects.explosions.push(
      new Explosion(
        {
          col: this.col,
          pos: this.pos.slice(),
          life: 0.2,
          size: 4,
          speed: 0.5,
          aftershock: 0.05,
        },
        this.gameState,
      ),
    );

    const g = this.golden ? 1.5 * player.bubblePollen : player.bubblePollen;

    // eslint-disable-next-line no-undef -- collectPollen: see TODO at top of file
    const p = collectPollen({
      x: this.x,
      z: this.z,
      pattern: [
        [0, 0],
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [1, -1],
        [1, 0],
        [1, 1],
        [0, 1],
        [0, -1],
        [-2, 0],
        [2, 0],
        [0, 2],
        [0, -2],
        [2, 1],
        [2, -1],
        [-2, 1],
        [-2, -1],
        [1, 2],
        [-1, 2],
        [1, -2],
        [-1, -2],
        [3, 0],
        [-3, 0],
        [0, -3],
        [0, 3],
        [3, 1],
        [3, -1],
        [1, 3],
        [-1, 3],
        [-1, -3],
        [1, -3],
        [-3, 1],
        [-3, -1],
      ],
      amount: { r: 2, w: 6, b: 10 },
      stackHeight: 0.45 + Math.random() * 0.5,
      replenish: 1,
      field: this.field,
      multiplier: g * player.bubbleBonus,
    });

    if (this.golden && p && Math.random() < 0.25) {
      objects.tokens.push(
        // eslint-disable-next-line no-undef -- LootToken: see TODO at top of file
        new LootToken(
          30,
          [this.pos[0], this.pos[1] + 0.7, this.pos[2]],
          "honey",
          Math.ceil(p * 0.5),
          true,
          "Gold Bubble",
        ),
      );
    }

    this.life = 0;
  }

  /**
   * @param {number} dt - Delta time in seconds since the previous frame.
   * @returns {boolean} true if the bubble popped or expired this frame and
   *   should be removed by the caller (matches the tokens/mobs update-loop
   *   convention in updateEngine.js: caller checks the return value, then
   *   calls die(i) itself - unlike Flame/Explosion, which self-splice).
   */
  update(dt) {
    const { player, meshes } = this.gameState;

    this.life -= dt;

    if (
      vec3.sqrDist(this.pos, [
        player.body.position.x,
        player.body.position.y,
        player.body.position.z,
      ]) <= 4
    ) {
      this.pop();
    }

    // Same unimplemented-mesh-registry gap as Explosion.js - guarded rather
    // than assumed to exist. See TODO in Explosion.js update().
    if (meshes.explosions?.instanceData) {
      meshes.explosions.instanceData.push(
        this.pos[0],
        this.pos[1] + 0.3,
        this.pos[2],
        this.col[0] * player.isNight,
        this.col[1] * player.isNight,
        this.col[2] * player.isNight,
        Math.min(this.life * 0.35, this.golden ? 0.8 : 0.7),
        Math.min((this.gameState.TIME - this.birth) * 15, 3),
        1,
      );
    }

    return this.life <= 0;
  }
}
