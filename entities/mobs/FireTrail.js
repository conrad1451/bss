// entities/mobs/FireTrail.js

// CHQ: Claude AI (Sonnet): Converted from standalone FireTrail to an
// extension of Mob, following the same pattern used for Ant.js and
// BugMob.js. Routes through gameState instead of module-level globals
// (player/objects/dt/ParticleRenderer), and delegates splicing to the
// engine loop via isDead/die() returning true.

import { MATH } from "../../utils/math.js";
import { Mob } from "./MobTemplate.js";

export class FireTrail extends Mob {
  /**
   * @param {number[]} pos - World-space spawn position [x, y, z].
   * @param {string|number} id - Unique identifier, passed through to Mob.
   */
  constructor(pos, id) {
    // FireTrail has no HP-based death — it expires by lifetime only.
    // Pass a sentinel HP of 1 so the base class is happy; health checks
    // are bypassed since update() manages its own lifetime via this.life.
    super(id, "fireTrail", pos, 1, 1, null);

    this.life = 7.5;
    this.damageTimer = 0;
    this.particleTimer = 0;

    // Render as a flat ground-level hazard box rather than a full mob-height block.
    this.meshScale = 0.4;

    // FireTrail doesn't move, aggro, or return home — disable base AI.
    this.state = "active";
    this.speed = 0;
  }

  /**
   * Advances the fire trail lifetime, spawns particles, and applies
   * contact damage to the player if they step on it.
   * Overrides Mob.update entirely — no movement or aggro logic applies.
   *
   * @param {number} dt - Delta time in seconds.
   * @param {Object} gameState - The live game state object.
   * @returns {boolean} true when the trail has expired and should be removed.
   */
  update(dt, gameState) {
    this.life -= dt;
    this.damageTimer -= dt;
    this.particleTimer -= dt;

    if (this.particleTimer <= 0) {
      this.particleTimer = 0.75;

      // ParticleRenderer is a global singleton in the current codebase;
      // accessed here the same way the original did but guarded so it
      // doesn't crash if it hasn't been initialized yet.
      if (typeof ParticleRenderer !== "undefined") {
        ParticleRenderer.add({
          x: this.pos[0] + MATH.random(-0.5, 0.5),
          y: this.pos[1],
          z: this.pos[2] + MATH.random(-0.5, 0.5),
          vx: 0,
          vy: 0,
          vz: 0,
          grav: 0,
          size: 200,
          col: [0.9, 0, 0],
          life: 2,
          rotVel: MATH.random(-0.3, 0.3),
          alpha: 2,
        });
      }
    }

    if (this.damageTimer <= 0) {
      const player = gameState.player;
      const dx = Math.abs(player.body.position.x - this.pos[0]);
      const dy = Math.abs(player.body.position.y - this.pos[1]);
      const dz = Math.abs(player.body.position.z - this.pos[2]);

      if (dx + dy + dz < 0.75) {
        player.damage(8);
        this.damageTimer = 1;
      }
    }

    // Register with the engine's attacked list so anything that iterates
    // player.attacked (e.g. star saw, honey shield, auras) also hits fire trails.
    gameState.player.attacked.push(this);

    if (this.life <= 0) {
      this.isDead = true;
      return true;
    }

    return false;
  }

  /**
   * FireTrail drops no loot and has no death side-effects.
   * Splicing out of gameState.objects.mobs is left to the engine loop
   * via isDead, per this codebase's convention (see updateEngine.js).
   *
   * @param {number} index - Unused, kept for signature parity with Mob.die.
   * @param {Object} gameState - The live game state object.
   * @returns {void}
   */
  die(index, gameState) {
    // intentionally empty
  }
}
