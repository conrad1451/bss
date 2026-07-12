// entities/mobs/CogTurret.js
import { MATH } from "../../utils/math.js";
import { Mob } from "./MobTemplate.js";
import { Token } from "../tokens.js";
import { collectPollen } from "../../engine/collectPollen.js";

// CHQ: Claude AI (Sonnet): Converted from legacy CogTurret to extend the refactored Mob base class.
// Key differences from a normal Mob:
//  - Stationary: never calls moveTowards/AI aggro logic, so update() does NOT call super.update()
//  - pos carries a 4th element (rotation/facing) instead of just [x,y,z]
//  - Tracks the player along a single constrained axis instead of free chasing
//  - Fires "cogs" (projectiles) that deal AoE pollen + contact damage
//  - All WebGL draw calls have been REMOVED from update() and moved to renderer.js,
//    matching how drawBees/drawMobs work — see drawTurrets() below.

export class CogTurret extends Mob {
  /**
   * @param {number} id - Unique mob id (use gameState.globalId++ at call site).
   * @param {string} field - Field key this turret belongs to (fieldInfo[field] must exist).
   * @param {number} level - Turret level; drives health scaling.
   * @param {number} side - Which edge of the field the turret sits on (0-3).
   * @param {Object} gameState - Live game state; must have gameState.fieldInfo populated.
   */
  constructor(gameState, field, level, side) {
    const fieldInfo = gameState.fieldInfo[field];
    const { pos, constraintAxis, constraintRange } = CogTurret.computeSpawn(
      fieldInfo,
      side,
    );

    const health = ((level - 1) * (level - 1) * 75 + 250) * 0.25;

    // Mob's constructor signature: (id, type, pos, hp, lvl, gameState)
    // pos here is [x, y, z] only — rotation is tracked separately as this.facing
    super(
      gameState.globalId++,
      "cogTurret",
      [pos[0], pos[1], pos[2]],
      health,
      level,
      gameState,
    );

    this.field = field;
    this.side = side;
    this.facing = pos[3]; // rotation, kept separate from this.pos (Mob expects [x,y,z])

    this.state = "attack";
    this.speed = 0; // stationary — never moves via moveTowards

    this.constraintAxis = constraintAxis;
    this.constraintRange = constraintRange;

    this.health = health; // alias kept for readability in this class; mirrors this.hp
    this.maxHealth = health;

    this.starSawHitTimer = 0;
    this.checkTimer = gameState.TIME || 0;
    this.flameTimer = 0;
    this.waitTimer = 0;
    this.damageTimer = 0;
    this.bodySize = 1.5;
    this.mindHacked = 0;

    this.cogs = [];
    this.cogFireTimer = 2;
  }

  /**
   * Computes spawn position, facing, and movement-constraint range for a given
   * field edge ("side"). Pulled out of the constructor so it can run before super().
   */
  static computeSpawn(fieldInfo, side) {
    let pos, constraintAxis, constraintRange;

    switch (side) {
      case 0: // north edge, facing into field
        pos = [
          fieldInfo.x + Math.random() * fieldInfo.width,
          fieldInfo.y + 1,
          fieldInfo.z - 0.5,
          -MATH.HALF_PI,
        ];
        constraintAxis = 0; // moves along X
        constraintRange = [
          fieldInfo.x - 0.5,
          fieldInfo.x + fieldInfo.width - 0.5,
        ];
        break;

      case 1: // south edge
        pos = [
          fieldInfo.x + Math.random() * fieldInfo.width,
          fieldInfo.y + 1,
          fieldInfo.z + fieldInfo.length - 0.5,
          MATH.HALF_PI,
        ];
        constraintAxis = 0;
        constraintRange = [
          fieldInfo.x - 0.5,
          fieldInfo.x + fieldInfo.width - 0.5,
        ];
        break;

      case 2: // west edge
        pos = [
          fieldInfo.x - 0.5,
          fieldInfo.y + 1,
          fieldInfo.z + Math.random() * fieldInfo.length,
          Math.PI,
        ];
        constraintAxis = 2; // moves along Z
        constraintRange = [
          fieldInfo.z - 0.5,
          fieldInfo.z + fieldInfo.length - 0.5,
        ];
        break;

      case 3: // east edge
        pos = [
          fieldInfo.x + fieldInfo.width - 0.5,
          fieldInfo.y + 1,
          fieldInfo.z + Math.random() * fieldInfo.length,
          0,
        ];
        constraintAxis = 2;
        constraintRange = [fieldInfo.z, fieldInfo.z + fieldInfo.length];
        break;

      default:
        pos = [fieldInfo.x, fieldInfo.y + 1, fieldInfo.z, 0];
        constraintAxis = 0;
        constraintRange = [fieldInfo.x, fieldInfo.x + fieldInfo.width];
    }

    return { pos, constraintAxis, constraintRange };
  }

  /**
   * Applies damage with crit/super-crit rolls, matching the original formula.
   * @param {number} am - Base (pre-crit) damage amount.
   * @param {Object} gameState - Live game state (needed for player crit stats + textRenderer).
   */
  damage(am, gameState) {
    const player = gameState.player;
    const crit = Math.random() < player.criticalChance;
    const superCrit = crit && Math.random() < player.superCritChance;

    let d =
      am *
      (crit
        ? superCrit
          ? player.superCritPower * player.criticalPower
          : player.criticalPower
        : 1);

    if (this.mindHacked > 0) d *= 1.25;

    d = d | 0;
    this.health -= d;
    this.hp = this.health; // keep Mob's base hp field in sync for any shared checks

    gameState.textRenderer.add(
      d + "",
      [this.pos[0], this.pos[1] + Math.random() * 2.75 + 1.5, this.pos[2]],
      [255, 0, 0],
      crit ? (superCrit ? 2 : 1) : 0,
      "",
      1, // CHQ: original indexed a lookup table by digit-count; simplified to a flat scale.
      // Restore the [0,1.25,1.275,1.3,1.65,1.75] table here if exact original sizing matters.
    );
  }

  /**
   * Per-frame turret logic: tracks the player along its constrained axis,
   * fires cog projectiles, applies flame damage, and deals contact damage.
   * No rendering happens here — see drawTurrets() in renderer.js.
   *
   * @param {number} dt - Delta time in seconds.
   * @param {Object} gameState - Live game state.
   * @returns {boolean} true if the turret died this frame.
   */
  update(dt, gameState) {
    // Intentionally NOT calling super.update() — Mob's aggro/return-home
    // state machine doesn't apply to a stationary turret.

    if (this.health <= 0 || this.isDead) {
      if (gameState.player.stats) {
        gameState.player.stats.mechsquito =
          (gameState.player.stats.mechsquito || 0) + 1;
      }
      return true;
    }

    const player = gameState.player;
    const fieldInfo = gameState.fieldInfo[this.field];

    this.mindHacked -= dt;
    this.starSawHitTimer -= dt;
    this.flameTimer -= dt;

    // Flame contact damage
    if (this.flameTimer <= 0) {
      this.flameTimer = 1;
      for (const flame of gameState.objects.flames || []) {
        if (
          Math.abs(this.pos[0] - flame.pos[0]) +
            Math.abs(this.pos[2] - flame.pos[2]) <
          this.bodySize
        ) {
          this.damage(flame.dark ? 25 : 15, gameState);
        }
      }
    }

    // Register as "being attacked" so bees can target it, mirroring bees.js's
    // player.attacked / CoconutCrab-style checks
    if (player.fieldIn === this.field) {
      if (!player.attacked) player.attacked = [];
      player.attacked.push(this);
    }

    if (this.mindHacked <= 0) {
      this.cogFireTimer -= dt;

      if (player.fieldIn === this.field) {
        if (this.cogFireTimer <= 0) {
          const v = [0, 0, 0];
          const trackedCoord = this.constraintAxis ? "x" : "z";
          v[2 - this.constraintAxis] =
            Math.sign(
              player.body.position[trackedCoord] -
                this.pos[2 - this.constraintAxis],
            ) * 8;

          this.cogs.push({
            pos: [this.pos[0], this.pos[1] - 0.75, this.pos[2], 0],
            vel: v,
            timer: 0,
            deathY: this.pos[1] - 3,
          });

          this.cogFireTimer = 2;
        }

        const trackedCoord = this.constraintAxis ? "z" : "x";
        const desiredPos = MATH.constrain(
          player.body.position[trackedCoord],
          this.constraintRange[0],
          this.constraintRange[1],
        );

        this.pos[this.constraintAxis] +=
          (desiredPos - this.pos[this.constraintAxis]) * dt * 5;
      }

      this.damageTimer -= dt;

      if (
        this.damageTimer <= 0 &&
        Math.abs(player.body.position.x - this.pos[0]) +
          Math.abs(player.body.position.y - this.pos[1]) +
          Math.abs(player.body.position.z - this.pos[2]) <
          this.bodySize
      ) {
        player.damage(20 + (this.level - 1));
        this.damageTimer = 0.5;
      }
    }

    // Update fired cogs: movement, despawn, contact damage, pollen pickup
    for (let i = this.cogs.length - 1; i >= 0; i--) {
      const s = this.cogs[i];
      s.timer -= dt;

      s.pos[0] += s.vel[0] * dt;
      s.pos[2] += s.vel[2] * dt;
      s.pos[3] += dt * 8;

      s.fx = Math.round(s.pos[0] - fieldInfo.x);
      s.fz = Math.round(s.pos[2] - fieldInfo.z);

      if (
        s.fx < 0 ||
        s.fx >= fieldInfo.width ||
        s.fz < 0 ||
        s.fz >= fieldInfo.length
      ) {
        s.pos[1] -= dt * 10;
      }

      if (s._fx !== s.fx || s._fz !== s.fz) {
        // collectPollen is assumed available in engine scope (as in the original)
        collectPollen(
          {
            x: s.fx,
            z: s.fz,
            field: this.field,
            pattern: [[0, 0]],
            amount: 1000,
            multiplier: 0.00000000001,
          },
          gameState,
        );
      }

      s._fx = s.fx;
      s._fz = s.fz;

      if (
        Math.abs(player.body.position.x - s.pos[0]) +
          Math.abs(player.body.position.z - s.pos[2]) +
          Math.abs(s.pos[1] - player.body.position.y) <
          1.5 &&
        s.timer <= 0
      ) {
        s.timer = 0.5;
        player.damage(15);
      }

      if (s.pos[1] < s.deathY) {
        this.cogs.splice(i, 1);
      }
    }

    return this.health <= 0;
  }

  /**
   * @param {number} index - Index in gameState.objects.mobs (unused; splice happens in updateEngine).
   * @param {Object} gameState - Live game state.
   */
  die(index, gameState) {
    this.isDead = true;
    // Add loot/Token drops here if CogTurrets should drop something on death —
    // the original `die` only spliced the array, which updateEngine.js already
    // handles generically for all mobs.
  }
}
