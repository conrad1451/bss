// entities/fx/Explosion.js

// CHQ: Claude AI (Sonnet) refactored - converted from a standalone class
// that read bare globals (objects, dt, meshes) to a gameState-based class,
// following the pattern established in Flame.js: gameState is captured in
// the constructor, dt/index are explicit update() params, and die() reads
// state off this.gameState instead of an outer-scope global.

export class Explosion {
  /**
   * @param {Object} params - Visual params for this explosion instance.
   * @param {number[]} params.pos - World-space position [x, y, z].
   * @param {number[]} params.col - RGB color, each channel 0-1.
   * @param {number} params.life - Lifespan in seconds (drives fade-out).
   * @param {number} params.size - Target visual size the explosion grows toward.
   * @param {number} params.speed - Growth rate toward `size` each frame.
   * @param {number} params.aftershock - Minimum per-frame growth floor, so the
   *   explosion keeps expanding even once it's close to `size`.
   * @param {number} [params.height=1] - Vertical scale for the instanced quad/mesh.
   * @param {number} [params.maxAlpha=1] - Alpha ceiling for the fade calculation.
   * @param {boolean} [params.backface=false] - If true, size is pushed negative
   *   (used by whatever shader/mesh convention treats sign as facing direction).
   * @param {string} [params.primitive="explosions"] - Which instanced-mesh bucket
   *   in gameState.meshes to push this explosion's instance data into
   *   (e.g. "explosions" vs "cylinder_explosions").
   * @param {Object} gameState - The live game state object.
   */
  constructor(params, gameState) {
    this.gameState = gameState;
    this.lifespan = 1 / params.life;
    this.params = params;
    this.size = this.reverse ? params.size : 0; // CHQ: preserved as-is - `this.reverse` is never set anywhere in the original either; likely dead logic, flagging rather than silently dropping it
    this.params.height = this.params.height || 1;
    this.maxAlpha = params.maxAlpha || 1;
    this.backface = params.backface === undefined ? false : params.backface;
    this.primitive = params.primitive || "explosions";
  }

  /**
   * @param {number} index - This explosion's index in gameState.objects.explosions.
   * @returns {void}
   */
  die(index) {
    this.gameState.objects.explosions.splice(index, 1);
  }

  /**
   * @param {number} dt - Delta time in seconds since the previous frame.
   * @param {number} index - This explosion's index in gameState.objects.explosions
   *   (needed for self-die, matching Flame.js's convention below).
   * @returns {boolean} true if the explosion finished this frame (already
   *   self-spliced via die()) - mirrors Flame.update()'s contract.
   */
  update(dt, index) {
    const { meshes } = this.gameState;

    this.params.life -= dt;
    this.size += Math.max(
      (this.params.size - this.size) * this.params.speed,
      this.params.aftershock,
    );

    // TODO: gameState.meshes[this.primitive] (e.g. "explosions", "cylinder_explosions")
    // is currently just a placeholder value in createInitialState (`explosions: 0,
    // cylinder_explosions: 0`), not an instanced-mesh registry with an `instanceData`
    // array like meshes.bees/meshes.mobs have. renderer.js already has matching
    // placeholders (`explosions: null `) waiting on real upload/draw
    // functions. Until that mesh registry exists, this push is a no-op guarded
    // below rather than a crash.
    if (meshes[this.primitive]?.instanceData) {
      meshes[this.primitive].instanceData.push(
        this.params.pos[0],
        this.params.pos[1],
        this.params.pos[2],
        this.params.col[0],
        this.params.col[1],
        this.params.col[2],
        Math.min(this.params.life * this.lifespan, this.maxAlpha),
        this.backface ? -this.size : this.size,
        this.params.height,
      );
    }

    if (this.params.life <= 0) {
      this.die(index);
      return true;
    }
    return false;
  }
}
