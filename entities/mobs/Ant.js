// entities/mobs/Ant.js
import { MATH } from "../../utils/math.js";
import { vec2 } from "gl-matrix";
import { Token } from "../tokens.js";
import { Mob } from "./MobTemplate.js";

// CHQ: Claude AI (Sonnet) refactored: Converted from standalone Ant class to an
// extension of Mob, following the same pattern used for BugMob.js.
// Preserves the spawning -> attack bounce-and-chase state machine,
// but routes everything through gameState instead of module-level
// globals (player/objects/fieldInfo/meshes/gl/glCache/dt/textRenderer/
// COLORS), and drops the raw gl.* draw calls (rendering is owned by
// renderer.js in this codebase, not by entity update()).

const TYPE_CONFIG = {
  ant: {},
  fireAnt: {},
  armyAnt: {
    healthMultiplier: 1.5,
    attackMultiplier: 2,
  },
  flyingAnt: {
    healthMultiplier: 0.65,
    movespeedMultiplier: 1.5,
    attackMultiplier: 1.25,
  },
  giantAnt: {
    healthMultiplier: 2,
    movespeedMultiplier: 0.75,
    attackMultiplier: 2,
    meshScale: 1.5,
    mesh: "ant",
    bodySize: 1,
  },
};

// Types that home in on the player instead of bouncing around the
// field bounds (mirrors the original's chained type === check).
const HOMING_TYPES = new Set(["armyAnt", "flyingAnt", "giantAnt"]);

export class Ant extends Mob {
  /**
   * @param {Object} gameState - The live game state object.
   * @param {number} round - Current ant-challenge round, drives level/health rolls.
   * @param {number} x - Normalized [0,1] spawn x within AntField bounds.
   * @param {number} z - Normalized [0,1] spawn z within AntField bounds.
   * @param {string} type - "ant" | "fireAnt" | "armyAnt" | "flyingAnt" | "giantAnt".
   * @param {string|number} id - Unique identifier, passed through to Mob.
   */
  constructor(gameState, round, x, z, type, id) {
    const fieldInfo = gameState.fieldManager.fieldInfo;
    const field = fieldInfo["AntField"];

    const level = ((round * MATH.random(0.4, 0.6) * 0.5) | 0) + 1;
    let health = ((level * level * level * 0.4 * MATH.random(2, 6)) | 0) + 5;

    const cfg = TYPE_CONFIG[type] || {};
    if (cfg.healthMultiplier) health = (health * cfg.healthMultiplier) | 0;

    const pos = [
      field.x + ((x * field.width) | 0),
      field.y + (cfg.meshScale || 0.75),
      field.z + ((z * field.length) | 0),
    ];

    super(id, type, pos, health, level, gameState);

    this.displayName = MATH.doGrammar(type);
    this.mesh = cfg.mesh || type;
    this.meshScale = cfg.meshScale || 0.75;
    this.movespeed = 2 * (cfg.movespeedMultiplier || 1);
    this.attack = 10 * (cfg.attackMultiplier || 1);
    this.bodySize = cfg.bodySize || 0.75;

    this.health = health;
    this.maxHealth = health;
    // keep base-class hp in sync with the health field used by Ant logic
    this.hp = this.health;

    this.state = "spawning";
    this.field = "AntField";
    this.starSawHitTimer = 0;
    this.spawnPos = [-21, 7, -61];
    this.flameTimer = 0;
    this.waitTimer = 0;
    this.damageTimer = 0;
    this.mindHacked = 0;
    this.fireTrailTimer = 0;

    this.dir = [x - 0.5, z - 0.5];
    this.dir[1] =
      this.dir[1] === 0 && this.dir[0] === 0
        ? Math.random() < 0.5
          ? -1
          : 1
        : this.dir[1];
    vec2.normalize(this.dir, this.dir);

    this.bounds = {
      minX: field.x + 1,
      maxX: field.x + field.width - 1,
      minZ: field.z + 1,
      maxZ: field.z + field.length - 1,
    };
  }

  /**
   * Applies damage with crit/super-crit rolls and mind-hack amplification,
   * mirroring the original Ant.damage but reading off gameState.
   *
   * @param {number} am - Base damage amount.
   * @param {Object} gameState - The live game state object.
   * @returns {void}
   */
  damage(am, gameState) {
    const player = gameState.player;
    const crit = Math.random() < player.criticalChance;
    const superCrit = Math.random() < (player.superCritChance || 0);
    let d =
      am *
      (crit
        ? superCrit
          ? player.superCritPower * player.criticalPower
          : player.criticalPower
        : 1);

    if (this.mindHacked > 0) d *= 1.25;

    this.health -= d | 0;
    this.hp = this.health;

    // NOTE: the original indexed a color-tier array with a comma-operator
    // expression `(Math.min(d.toString().length), 5)`, which always
    // evaluates to 5 regardless of d's length — almost certainly a bug.
    // Replaced here with a straightforward scale-by-digit-count lookup.
    const tiers = [0, 1.25, 1.275, 1.3, 1.65, 1.75];
    const tierIndex = Math.min(d.toString().length, tiers.length - 1);

    gameState.textRenderer.add(
      (d | 0) + "",
      [this.pos[0], this.pos[1] + Math.random() * 2.75 + 1.5, this.pos[2]],
      [255, 0, 0],
      crit ? (superCrit ? 2 : 1) : 0,
      "",
      tiers[tierIndex],
    );
  }

  /**
   * Per-frame state machine: spawning / attack.
   * Overrides Mob.update but does NOT call super.update(), since Ant's
   * state machine fully replaces the aggro/return logic used by the base
   * Mob (same convention as BugMob.update).
   *
   * Rendering/draw calls from the original (gl.bindBuffer, vertexAttribPointer,
   * drawElements, textRenderer decal/label calls tied to draw position) have
   * been removed; renderer.js is the single owner of mob drawing in this
   * codebase. Anything renderer.js needs (mesh name, meshScale, pos, health
   * ratio) is left available as plain fields on the instance.
   *
   * @param {number} dt - Delta time in seconds.
   * @param {Object} gameState - The live game state object.
   * @returns {boolean} true if this frame's update means the mob is dead
   *   and should be removed (engine loop owns the splice via isDead/die()).
   */
  update(dt, gameState) {
    const player = gameState.player;
    const objects = gameState.objects;

    switch (this.state) {
      case "spawning": {
        this.spawnPos[0] += (this.pos[0] - this.spawnPos[0]) * dt * 5;
        this.spawnPos[1] += (this.pos[1] - this.spawnPos[1]) * dt * 5;
        this.spawnPos[2] += (this.pos[2] - this.spawnPos[2]) * dt * 5;

        if (Math.abs(this.pos[1] - this.spawnPos[1]) < 0.1) {
          this.state = "attack";
        }

        return false;
      }

      case "attack": {
        if (this.health <= 0) {
          if (!player.stats) player.stats = {};
          player.stats.ant = (player.stats.ant || 0) + 1;

          if (this.type !== "ant") {
            player.stats[this.type] = (player.stats[this.type] || 0) + 1;
          }

          this.isDead = true;
          return true;
        }

        this.mindHacked -= dt;
        this.starSawHitTimer -= dt;
        this.flameTimer -= dt;

        if (this.flameTimer <= 0) {
          this.flameTimer = 1;

          for (const f in objects.flames) {
            if (
              Math.abs(this.pos[0] - objects.flames[f].pos[0]) +
                Math.abs(this.pos[2] - objects.flames[f].pos[2]) <
              this.bodySize
            ) {
              this.damage(objects.flames[f].dark ? 25 : 15, gameState);
            }
          }
        }

        player.attacked.push(this);

        if (this.mindHacked <= 0) {
          if (this.type === "fireAnt") {
            this.fireTrailTimer -= dt;

            if (this.fireTrailTimer <= 0) {
              // FireTrail is its own entity class elsewhere in entities/mobs/;
              // left as a TODO import since its current location wasn't
              // included in what I refactored here.
              // objects.mobs.push(new FireTrail(this.pos.slice()));
              this.fireTrailTimer = 0.75;
            }
          }

          if (HOMING_TYPES.has(this.type)) {
            this.dir = [
              player.body.position.x - this.pos[0],
              player.body.position.z - this.pos[2],
            ];
            vec2.normalize(this.dir, this.dir);
          }

          this.pos[0] += this.dir[0] * dt * this.movespeed;
          this.pos[2] += this.dir[1] * dt * this.movespeed;
          this.pos[3] = Math.atan2(this.dir[1], this.dir[0]) + MATH.HALF_PI;

          if (this.pos[0] <= this.bounds.minX) {
            this.pos[0] = this.bounds.minX;
            this.dir[0] = -this.dir[0];
          }
          if (this.pos[0] >= this.bounds.maxX) {
            this.pos[0] = this.bounds.maxX;
            this.dir[0] = -this.dir[0];
          }
          if (this.pos[2] <= this.bounds.minZ) {
            this.pos[2] = this.bounds.minZ;
            this.dir[1] = -this.dir[1];
          }
          if (this.pos[2] >= this.bounds.maxZ) {
            this.pos[2] = this.bounds.maxZ;
            this.dir[1] = -this.dir[1];
          }

          this.damageTimer -= dt;

          if (
            this.damageTimer <= 0 &&
            Math.abs(player.body.position.x - this.pos[0]) +
              Math.abs(player.body.position.y - this.pos[1]) +
              Math.abs(player.body.position.z - this.pos[2]) <
              this.bodySize * 1.5
          ) {
            player.damage(this.attack);
            this.damageTimer = 0.75;
          }
        }

        return false;
      }
    }

    return false;
  }

  /**
   * Replaces the original's direct `objects.mobs.splice(index, 1)` and
   * `player.antChallenge.score++`. Score tracking now happens here as a
   * side effect, and the actual splice is left to the engine loop per
   * this codebase's convention (see updateEngine.js / BugMob.die).
   *
   * @param {number} index - Unused, kept for signature parity with Mob.die.
   * @param {Object} gameState - The live game state object.
   * @returns {void}
   */
  die(index, gameState) {
    const player = gameState.player;
    if (player.antChallenge) player.antChallenge.score++;
    // No loot tokens in the original Ant.die — ant challenge rewards are
    // presumably granted elsewhere (end-of-challenge), so nothing to push
    // onto gameState.objects.tokens here.
  }
}
