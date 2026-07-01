// entities/projectiles/DarkScoopingTrail.js
import { vec3 } from "gl-matrix";

import { MATH } from "../../utils/math.js";
import { TrailRenderer } from "../../engine/trailRenderer.js";
import { Projectile, PROJECTILE_SOURCE } from "./ProjectileTemplate.js";

// CHQ: Claude AI (Sonnet): now extends Projectile. The base class's
// tickLife() isn't used here since this entity has its own two-phase
// (moving -> fading) life logic instead of a single countdown, but it still
// gets pos/lifespan/source/isDead bookkeeping and array removal for free.

const LIFESPAN = 0.3;
const FADE_DURATION = 0.5;
const FADE_RECOIL_SCALE = -0.01;

export class DarkScoopingTrail extends Projectile {
  /**
   * Spawns a dark scooping trail effect centered on the player's current
   * body position, arcing along a bezier curve from one side of the player
   * to the other.
   *
   * @param {Object} gameState - The live game state object.
   * @param {Object} gameState.player - Must expose `body.position` and `bodyDir`.
   */
  constructor(gameState) {
    const { player } = gameState;
    const bodyPos = [
      player.body.position.x,
      player.body.position.y,
      player.body.position.z,
    ];

    super(bodyPos, LIFESPAN, PROJECTILE_SOURCE.PLAYER);
    this.bodyPos = bodyPos;

    const d = player.bodyDir.slice();
    const r = [-d[2], 0, d[0]];

    this.startPos = [d[0] * 2 + r[0] * 4, 0.05, d[2] * 2 + r[2] * 4];
    this.endPos = [d[0] * 2 - r[0] * 4, 0.05, d[2] * 2 - r[2] * 4];
    this.control2 = vec3.scale([], this.startPos, 2);
    this.control1 = vec3.scale([], this.endPos, 5.25);

    // "moving" — tracing the bezier curve; "fading" — trail drifting to a
    // stop on its recoil velocity before being removed.
    this.state = "moving";
    this.waitTimer = 0;

    this.trail = new TrailRenderer.Trail({
      length: 15,
      size: 0.5,
      triangle: true,
      color: [0.8, 0, 0.8, 0.6],
      fadeTo: [0.5, 0, 0, 0.6],
    });

    this.lastPos = [];
    this.lastVel = [0, 0, 0];
  }

  /**
   * Advances the trail: traces the bezier curve while `life` remains, then
   * drifts on its recoil velocity for FADE_DURATION before signalling death.
   *
   * @param {number} dt - Delta time in seconds.
   * @returns {boolean} true once the fade-out has finished and this trail
   *   should be removed via die().
   */
  update(dt) {
    if (this.state === "fading") {
      this.waitTimer -= dt;
      this.lastPos = vec3.add(this.lastPos, this.lastPos, this.lastVel);
      this.trail.addPos(this.lastPos);
      return this.waitTimer <= 0;
    }

    this.life -= dt;

    const p = MATH.generateBezierCurve(
      this.endPos,
      this.control1,
      this.control2,
      this.startPos,
      MATH.constrain(this.life / this.lifespan, 0, 1),
    );
    vec3.add(p, p, this.bodyPos);
    this.trail.addPos(p);

    this.lastVel = vec3.sub([], this.lastPos, p);
    this.lastPos = p;

    if (this.life <= 0) {
      this.state = "fading";
      this.waitTimer = FADE_DURATION;
      vec3.scale(this.lastVel, this.lastVel, FADE_RECOIL_SCALE);
    }

    return false;
  }

  /**
   * Flags the trail mesh for cleanup, then defers to the base class to
   * splice this projectile out of gameState.objects.projectiles.
   *
   * @param {number} index - Index of this trail in gameState.objects.projectiles.
   * @param {Object} gameState - The live game state object.
   */
  die(index, gameState) {
    this.trail.splice = true;
    super.die(index, gameState);
  }
}
