// entities/Cogmower.js
import { MATH } from "../utils/math.js";
import { vec2 } from "gl-matrix";
import { Mob } from "./mobs.js";
import { collectPollen } from "../engine/flowers.js"; // CHQ: adjust path — not present in provided files

// CHQ: Claude AI (Sonnet): Converted from standalone Cogmower to an extension of Mob.
// NOTE: despite obvious copy-paste lineage from Mechsquito (identical
// damage(), same flame-damage block), Cogmower's actual movement/attack
// behavior (bounded bouncing patrol + pollen-skim contact attack) is
// different enough that it's modeled as its own sibling Mob subclass
// rather than extending Mechsquito. Routes everything through gameState
// instead of module-level globals, and drops the raw gl.* draw call
// (rendering is owned by renderer.js in this codebase, not entity update()).

export class Cogmower extends Mob {
  /**
   * @param {Object} gameState - The live game state object.
   * @param {string} field - Field id this mob belongs to (used for bounds/spawn).
   * @param {number} level - Mob level, drives HP scaling.
   * @param {boolean} isGold - Whether this is the "goldenCogmower" variant.
   */
  constructor(gameState, field, level, isGold) {
    const fieldInfo = gameState.fieldInfo;
    const pos = [
      fieldInfo[field].x + Math.random() * fieldInfo[field].width,
      fieldInfo[field].y + 0.75,
      fieldInfo[field].z + Math.random() * fieldInfo[field].length,
    ];

    let health = ((level - 1) * (level - 1) * 70 + 100) * 0.25;
    if (isGold) health = health * 1.65;

    // Mob's constructor signature is (id, type, pos, hp, lvl, gameState)
    super(
      isGold ? "goldenCogmower" : "cogmower",
      isGold ? "goldenCogmower" : "cogmower",
      pos,
      health,
      level,
      gameState,
    );

    this.gold = isGold ? "goldenCogmower" : "cogmower";
    this.isGold = isGold;
    this.field = field;
    this.state = "attack";
    this.starSawHitTimer = 0;
    this.health = this.hp;
    this.maxHealth = this.health;

    this.moveDir = [Math.random() - 0.5, Math.random() - 0.5];
    vec2.normalize(this.moveDir, this.moveDir);
    vec2.scale(this.moveDir, this.moveDir, 4);

    this.checkTimer = gameState.TIME || 0;
    this.flameTimer = 0;
    this.waitTimer = 0;
    this.damageTimer = 0;
    this.bodySize = 1.5;
    this.mindHacked = 0;

    // CHQ: preserved as-is from the original — `timeLimit` is read/decremented
    // in update() but was never initialized in the original constructor either
    // (same ghost-variable bug present in the source Mechsquito was copied from).
    this.timeLimit = undefined;

    const r = 1;

    this.bounds = {
      minX: fieldInfo[this.field].x + r - 0.5,
      maxX: fieldInfo[this.field].x + fieldInfo[this.field].width - r - 0.5,
      minZ: fieldInfo[this.field].z + r - 0.5,
      maxZ: fieldInfo[this.field].z + fieldInfo[this.field].length - r - 0.5,
    };
  }

  /**
   * Applies damage with crit/super-crit rolls and mind-hack amplification.
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
    this.hp = this.health; // keep base-class hp in sync

    const sizeScale = [0, 1.25, 1.275, 1.3, 1.65, 1.75];
    gameState.textRenderer.add(
      (d | 0) + "",
      [this.pos[0], this.pos[1] + Math.random() * 2.75 + 1.5, this.pos[2]],
      [255, 0, 0],
      crit ? (superCrit ? 2 : 1) : 0,
      "",
      sizeScale[Math.min(d.toString().length, 5)],
    );
  }

  /**
   * Per-frame update: bounded bouncing patrol movement, flame damage,
   * contact damage + pollen-skim attack, and mind-hack idle behavior.
   * Overrides Mob.update entirely — the base Mob's aggro/return logic
   * doesn't apply to this patrol-and-skim AI.
   *
   * @param {number} dt - Delta time in seconds.
   * @param {Object} gameState - The live game state object.
   * @returns {boolean} true once health drops to 0 (mirrors the death-signal
   *   contract used by updateEngine.js), false otherwise.
   */
  update(dt, gameState) {
    const player = gameState.player;
    const fieldInfo = gameState.fieldInfo;
    const objects = gameState.objects;
    const textRenderer = gameState.textRenderer;
    const TIME = gameState.TIME || 0;

    switch (this.state) {
      case "attack": {
        if (this.health <= 0) {
          // CHQ: FIXED — original incremented player.stats.mechsquito here,
          // a copy-paste bug carried over from Mechsquito that misattributed
          // every Cogmower kill to Mechsquito's quest/stat counter. Patched
          // to increment the correct counter.
          if (!player.stats.cogmower) player.stats.cogmower = 0;
          player.stats.cogmower++;

          return true;
        }

        this.mindHacked -= dt;
        this.timeLimit -= dt;
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

        if (player.fieldIn === this.field) {
          player.attacked.push(this);
        }

        if (this.mindHacked <= 0) {
          this.pos[0] += this.moveDir[0] * dt;
          this.pos[2] += this.moveDir[1] * dt;

          if (this.pos[0] <= this.bounds.minX) {
            this.pos[0] = this.bounds.minX;
            this.moveDir[0] = -this.moveDir[0];
          }

          if (this.pos[0] >= this.bounds.maxX) {
            this.pos[0] = this.bounds.maxX;
            this.moveDir[0] = -this.moveDir[0];
          }

          if (this.pos[2] <= this.bounds.minZ) {
            this.pos[2] = this.bounds.minZ;
            this.moveDir[1] = -this.moveDir[1];
          }

          if (this.pos[2] >= this.bounds.maxZ) {
            this.pos[2] = this.bounds.maxZ;
            this.moveDir[1] = -this.moveDir[1];
          }

          this.damageTimer -= dt;

          if (this.damageTimer <= 0) {
            if (
              Math.abs(player.body.position.x - this.pos[0]) +
                Math.abs(player.body.position.y - this.pos[1]) +
                Math.abs(player.body.position.z - this.pos[2]) <
              this.bodySize
            ) {
              player.damage(15 + (this.level - 1));
            }

            this.damageTimer = 0.5;

            collectPollen({
              x: Math.round(this.pos[0] - fieldInfo[this.field].x),
              z: Math.round(this.pos[2] - fieldInfo[this.field].z),
              field: this.field,
              pattern: [
                [0, 0],
                [1, 1],
                [1, -1],
                [-1, 1],
                [-1, -1],
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
              ],
              amount: 30 + this.level,
              multiplier: 0.00000000001,
            });
          }

          this.pos[3] = TIME * 7;
        } else {
          this.pos[3] = Math.random() * 6.2;
          textRenderer.addDecalRaw(
            this.pos[0],
            this.pos[1],
            this.pos[2],
            0,
            0,
            ...textRenderer.decalUV.smiley,
            0.75,
            0,
            0,
            -2,
            -2,
            0,
          );
        }

        // NOTE: the raw gl.* draw call from the original Cogmower.update
        // was intentionally dropped here — instance/mesh drawing belongs to
        // renderer.js in this codebase (see drawMobs), not entity update().

        this.pos[1] += 1;
        textRenderer.addCTX(
          MATH.doGrammar(this.gold) + " (Level " + this.level + ")",
          [this.pos[0], this.pos[1] + 0.4, this.pos[2]],
          gameState.COLORS?.whiteArr || [255, 255, 255],
          100,
        );

        textRenderer.addDecalRaw(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          0,
          0,
          ...textRenderer.decalUV["rect"],
          0.6,
          0,
          0,
          2.5,
          0.4,
          0,
        );
        textRenderer.addDecalRaw(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          (-0.5 + (this.health / this.maxHealth) * 0.5) /
            (this.health / this.maxHealth),
          0,
          ...textRenderer.decalUV["rect"],
          0.2,
          0.85,
          0.2,
          (this.health * 2.5) / this.maxHealth,
          0.4,
          0,
        );

        textRenderer.addSingle(
          "HP: " + MATH.addCommas((this.health | 0) + ""),
          this.pos,
          gameState.COLORS?.whiteArr || [255, 255, 255],
          -1,
          false,
          false,
        );

        this.pos[1] -= 1;

        break;
      }
    }

    return false;
  }

  /**
   * Overrides Mob.die. Cogmower drops no loot in the original — this is
   * a no-op, consistent with the engine-owns-splicing contract used
   * elsewhere (see updateEngine.js): the engine splices this instance out
   * of gameState.objects.mobs after update() returns true.
   *
   * @param {number} index - Unused; kept for signature parity with Mob.die.
   * @param {Object} gameState - The live game state object.
   * @returns {void}
   */
  die(index, gameState) {
    // No loot table for Cogmower in the original implementation.
  }
}
