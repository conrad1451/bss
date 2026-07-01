// entities/projectiles/ProjectileTemplate.js

// CHQ: Claude AI (Sonnet): base class factored out of PetalShuriken and
// DarkScoopingTrail. Mirrors the Mob and MobTemplate.js pattern: subclasses
// implement update(dt, gameState) returning a death-signal boolean, and the
// engine loop owns splicing gameState.objects.projectiles after die() runs
// (see updateEngine.js's mob-loop for the equivalent convention).

// Where a projectile originated — used for e.g. friendly-fire / hit filtering.
export const PROJECTILE_SOURCE = {
  PLAYER: "player", // player tools/abilities (shurikens, scoops, etc.)
  BEE: "bee", // bee-fired projectiles
};

export class Projectile {
  /**
   * @param {number[]} pos - Spawn position, typically [x, y, z].
   * @param {number} lifespan - Total lifetime in seconds.
   * @param {string} source - One of PROJECTILE_SOURCE.*; who fired this.
   */
  constructor(pos, lifespan, source) {
    this.pos = [...pos];
    this.lifespan = lifespan;
    this.life = lifespan;
    this.source = source;
    this.isDead = false;
  }

  /**
   * Ticks the shared life timer down. Subclasses call this from their own
   * update() rather than duplicating the countdown, then layer their
   * movement/collision/state-machine logic on top.
   *
   * @param {number} dt - Delta time in seconds.
   * @returns {boolean} true once life has run out.
   */
  tickLife(dt) {
    this.life -= dt;
    return this.life <= 0;
  }

  /**
   * Per-frame update. Default implementation just ticks the life timer;
   * subclasses with real behavior (collision, curves, state machines)
   * override this.
   *
   * @param {number} dt - Delta time in seconds.
   * @param {Object} gameState - The live game state object.
   * @returns {boolean} true when this projectile should be removed.
   */
  update(dt, gameState) {
    return this.tickLife(dt);
  }

  /**
   * Removes this projectile from the live projectiles list. Subclasses that
   * need extra teardown (e.g. flagging a trail mesh for cleanup) should
   * override this, do their own cleanup, and then call super.die().
   *
   * @param {number} index - Index of this projectile in gameState.objects.projectiles.
   * @param {Object} gameState - The live game state object.
   */
  die(index, gameState) {
    gameState.objects.projectiles.splice(index, 1);
  }
}
