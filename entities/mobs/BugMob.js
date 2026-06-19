// entities/BugMob.js
import { MATH } from "../../utils/math.js";
import { vec2 } from "gl-matrix";
import { Token } from "../tokens.js";
import { Mob } from "./MobTemplate.js";

// CHQ: Claude AI (Sonnet): Converted from standalone BugMob to an extension of Mob.
// Preserves hide -> attack -> lunge -> dead -> respawn state machine,
// but routes everything through gameState instead of module-level globals,
// and drops the raw gl.* draw calls (rendering is owned by renderer.js
// in this codebase, not by entity update()).

const RESPAWN_TIME = {
  rhinoBeetle: 4 * 60,
  ladybug: 4 * 60,
  spider: 10 * 60,
  werewolf: 15 * 60,
  mantis: 7 * 60,
  scorpion: 7 * 60,
  kingBeetle: 60 * 60,
  tunnelBear: 120 * 60,
};

const CONTACT_DAMAGE = {
  rhinoBeetle: 20,
  ladybug: 18,
  spider: 25,
  werewolf: 35,
  scorpion: 30,
  mantis: 30,
  kingBeetle: 75,
  tunnelBear: 10000,
};

const STANDARD_HONEY_DROP = {
  rhinoBeetle: 15,
  ladybug: 15,
  spider: 75,
  werewolf: 900,
  scorpion: 500,
  mantis: 500,
  kingBeetle: 2500,
};

export class BugMob extends Mob {
  /**
   * @param {Object} gameState - The live game state object.
   * @param {number[]} spawnPos - World-space spawn position [x, y, z].
   * @param {Object} bounds - Aggro-zone bounding box {minX,maxX,minY,maxY,minZ,maxZ}.
   * @param {number} level - Mob level (used for grammar / display only here).
   * @param {number} health - Starting / max health.
   * @param {string} type - Bug type key, e.g. "rhinoBeetle", "spider", "tunnelBear".
   * @param {string|number} id - Unique identifier, also used as the `player.extraInfo` respawn-timer key.
   */
  constructor(gameState, spawnPos, bounds, level, health, type, id) {
    // Mob's constructor signature is (id, type, pos, hp, lvl, gameState)
    super(id, type, spawnPos, health, level, gameState);

    // BugMob-specific fields not modeled by the base Mob class
    this.starSawHitTimer = 0;
    this.maxHealth = this.hp; // alias so existing BugMob logic reading maxHealth/health keeps working
    this.health = this.hp;
    this.spawnPos = [...spawnPos];
    this.resMessPos = [
      spawnPos[0] - (type === "tunnelBear" ? 6 : 0),
      spawnPos[1] + 3,
      spawnPos[2] - (type === "spider" ? 3 : 0),
    ];
    this.state = "hide";
    this.bounds = bounds;
    this.checkTimer = gameState.TIME || 0;
    this.respawnTimer = 0;
    this.flameTimer = 0;
    this.damageTimer = 0;
    this.mindHacked = 0;
    this.aimPos = false;
    this.aimTimer = 0;

    this.grammaredName = MATH.doGrammar(type);

    const player = gameState.player;
    if (player.extraInfo && player.extraInfo[this.id] > 0) {
      this.state = "dead";
      this.respawnTimer = player.extraInfo[this.id];
    }
  }

  /**
   * Applies damage with crit/super-crit rolls and mind-hack amplification,
   * mirroring the original BugMob.damage but reading off gameState.
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

    gameState.textRenderer.add(
      (d | 0) + "",
      [this.pos[0], this.pos[1] + Math.random() * 2.75 + 1.5, this.pos[2]],
      [255, 0, 0],
      crit ? (superCrit ? 2 : 1) : 0,
      "",
      1.25,
    );
  }

  /**
   * Per-frame state machine: hide / attack / moveToHide / dead.
   * Overrides Mob.update but does NOT call super.update(), since BugMob's
   * state machine fully replaces the aggro/return logic used by the base Mob.
   *
   * @param {number} dt - Delta time in seconds.
   * @param {Object} gameState - The live game state object.
   * @returns {boolean} true if this frame's update means the mob should be
   *   removed/died this tick (mirrors Mob.update's death-signal contract);
   *   false otherwise. Actual loot/cleanup happens in die().
   */
  update(dt, gameState) {
    const player = gameState.player;
    const TIME = gameState.TIME || 0;
    const textRenderer = gameState.textRenderer;
    const objects = gameState.objects;

    switch (this.state) {
      case "hide": {
        if (TIME - this.checkTimer > 0.5) {
          this.checkTimer = TIME + Math.random() * 0.2;
          const b = this.bounds,
            p = player.body.position;

          if (
            p.x > b.minX &&
            p.x < b.maxX &&
            p.y > b.minY &&
            p.y < b.maxY &&
            p.z > b.minZ &&
            p.z < b.maxZ
          ) {
            this.state = "attack";
            this.pos = this.spawnPos.slice();
            this.aimPos = false;
          }
        }
        break;
      }

      case "attack": {
        if (this.health <= 0) {
          if (!player.stats[this.type]) player.stats[this.type] = 0;
          player.stats[this.type]++;

          this.state = "dead";
          this.respawnTimer =
            RESPAWN_TIME[this.type] / (player.monsterRespawnTime || 1);
          this.isDead = true; // signal to the engine loop that die() should run

          return true; // dead this frame
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
              2.25
            ) {
              this.damage(objects.flames[f].dark ? 25 : 15, gameState);
            }
          }
        }

        player.attacked.push(this);

        if (this.mindHacked <= 0) {
          if (TIME - this.checkTimer > 0.25) {
            this.checkTimer = TIME + Math.random() * 0.2;
            const b = this.bounds,
              p = player.body.position;

            if (
              !(
                p.x > b.minX &&
                p.x < b.maxX &&
                p.y > b.minY &&
                p.y < b.maxY &&
                p.z > b.minZ &&
                p.z < b.maxZ
              )
            ) {
              this.state = "moveToHide";
            }
          }

          this.damageTimer -= dt;

          if (
            this.damageTimer <= 0 &&
            this.aimTimer > 0 &&
            Math.abs(player.body.position.x - this.pos[0]) +
              Math.abs(player.body.position.y - this.pos[1]) +
              Math.abs(player.body.position.z - this.pos[2]) <
              (this.type === "tunnelBear" ? 5 : 1.5)
          ) {
            player.damage(CONTACT_DAMAGE[this.type]);
            this.damageTimer = 1.5;
          }

          let d = [
            player.body.position.x - this.pos[0],
            player.body.position.z - this.pos[2],
          ];

          vec2.normalize(d, d);

          if (!this.aimPos) {
            if (
              Math.abs(player.body.position.x - this.pos[0]) +
                Math.abs(player.body.position.z - this.pos[2]) >
              (this.type === "tunnelBear" ? 4 : 6)
            ) {
              this.pos[0] += d[0] * dt * (this.type === "tunnelBear" ? 2 : 5);
              this.pos[2] += d[1] * dt * (this.type === "tunnelBear" ? 2 : 5);
            } else {
              this.aimPos = [
                player.body.position.x,
                player.body.position.y,
                player.body.position.z,
              ];
              this.landPos = this.pos.slice();
              this.lungeState = 0;
              this.aimTimer = this.type === "tunnelBear" ? 0 : 1.5;
            }
          } else {
            this.aimTimer -= dt;

            if (this.aimTimer <= 0) {
              if (!this.lungeState) {
                d = [
                  this.aimPos[0] - this.pos[0],
                  this.aimPos[2] - this.pos[2],
                ];

                vec2.normalize(d, d);

                this.pos[0] += d[0] * dt * 15;
                this.pos[2] += d[1] * dt * 15;

                if (
                  Math.abs(this.aimPos[0] - this.pos[0]) +
                    Math.abs(this.aimPos[2] - this.pos[2]) <
                  1
                ) {
                  this.lungeState = 1;

                  if (
                    Math.abs(player.body.position.x - this.pos[0]) +
                      Math.abs(player.body.position.y - this.pos[1]) +
                      Math.abs(player.body.position.z - this.pos[2]) <
                    2
                  ) {
                    player.damage(CONTACT_DAMAGE[this.type]);
                  }
                }
              } else {
                d = [
                  this.landPos[0] - this.pos[0],
                  this.landPos[2] - this.pos[2],
                ];

                vec2.normalize(d, d);

                this.pos[0] += d[0] * dt * 15;
                this.pos[2] += d[1] * dt * 15;

                if (
                  Math.abs(this.landPos[0] - this.pos[0]) +
                    Math.abs(this.landPos[2] - this.pos[2]) <
                  0.75
                ) {
                  this.aimPos = undefined;
                  this.aimTimer = 1.5;
                }
              }
            }
          }

          this.pos[3] =
            Math.atan2(d[1], d[0]) +
            MATH.HALF_PI +
            (!this.aimPos ? (gameState.BEE_FLY || 0) * 0.5 : 0);
        } else {
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

        // NOTE: raw gl draw calls from the original BugMob.update were
        // intentionally dropped here — instance/mesh drawing belongs to
        // renderer.js in this codebase (see drawMobs), not entity update().

        this.pos[1] +=
          this.type === "werewolf" ||
          this.type === "mantis" ||
          this.type === "tunnelBear"
            ? 3
            : 1;
        textRenderer.addCTX(
          MATH.doGrammar(this.type) + " (Level " + this.level + ")",
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
        this.pos[1] -=
          this.type === "werewolf" ||
          this.type === "mantis" ||
          this.type === "tunnelBear"
            ? 3
            : 1;

        break;
      }

      case "moveToHide": {
        const b = this.bounds,
          p = player.body.position;

        if (
          p.x > b.minX &&
          p.x < b.maxX &&
          p.y > b.minY &&
          p.y < b.maxY &&
          p.z > b.minZ &&
          p.z < b.maxZ
        ) {
          this.state = "attack";
          break;
        }

        if (
          Math.abs(this.spawnPos[0] - this.pos[0]) +
            Math.abs(this.spawnPos[2] - this.pos[2]) <
          1
        ) {
          this.state = "hide";
          break;
        }

        const _d = [
          this.spawnPos[0] - this.pos[0],
          this.spawnPos[2] - this.pos[2],
        ];

        vec2.normalize(_d, _d);

        this.pos[0] += _d[0] * dt * 4;
        this.pos[2] += _d[1] * dt * 4;

        this.pos[3] = Math.atan2(_d[1], _d[0]) + MATH.HALF_PI;

        // NOTE: raw gl draw calls dropped (see note above)

        this.pos[1] +=
          this.type === "werewolf" || this.type === "mantis" ? 3 : 1;
        textRenderer.addCTX(
          "Rhino Beetle (Level " + this.level + ")",
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
        this.pos[1] -=
          this.type === "werewolf" || this.type === "mantis" ? 3 : 1;

        break;
      }

      case "dead": {
        this.respawnTimer -= dt;

        if (!player.extraInfo) player.extraInfo = {};
        player.extraInfo[this.id] = this.respawnTimer;

        if (this.respawnTimer <= 0) {
          if (!player.fieldIn) {
            this.state = "hide";
            this.health = this.maxHealth;
            this.hp = this.health;
          }
        } else {
          textRenderer.addSingle(
            this.grammaredName,
            this.resMessPos,
            gameState.COLORS?.whiteArr || [255, 255, 255],
            -1.5,
            false,
            false,
            0,
            0.2,
          );
          textRenderer.addSingle(
            MATH.doTime(this.respawnTimer),
            this.resMessPos,
            gameState.COLORS?.whiteArr || [255, 255, 255],
            -1.5,
            false,
            false,
            0,
            -0.2,
          );
        }

        break;
      }
    }

    return this.health <= 0 && this.state !== "dead";
  }

  /**
   * Builds the type-specific drop table and amount table used for loot rolls.
   * Extracted from the giant inline switch in the original BugMob death logic.
   *
   * @returns {{dropTable: string[], dropAmountTable: Object, amountOfTokens: number}}
   */
  getLootTable(gameState) {
    const player = gameState.player;
    let amountOfTokens = (player.lootLuck - 1) | 0;
    let dropTable, dropAmountTable;

    switch (this.type) {
      case "rhinoBeetle":
        amountOfTokens += 4;
        dropTable = [
          "blueberry",
          "blueberry",
          "blueberry",
          "blueberry",
          "blueberry",
          "blueberry",
          "blueberry",
          "blueberry",
          "blueberry",
          "blueberry",
          "blueberry",
          "blueExtract",
          "treat",
          "treat",
          "gumdrops",
          "gumdrops",
        ];
        dropAmountTable = {
          blueberry: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 5],
          blueExtract: [1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
          treat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 5, 5, 10],
          gumdrops: [1, 1, 1, 1, 1, 1, 1, 3, 3, 5],
        };
        break;

      case "ladybug":
        amountOfTokens += 4;
        dropTable = [
          "strawberry",
          "strawberry",
          "strawberry",
          "strawberry",
          "strawberry",
          "strawberry",
          "strawberry",
          "strawberry",
          "strawberry",
          "strawberry",
          "strawberry",
          "redExtract",
          "treat",
          "treat",
          "gumdrops",
          "gumdrops",
        ];
        dropAmountTable = {
          strawberry: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 5],
          redExtract: [1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
          treat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 5, 5, 10],
          gumdrops: [1, 1, 1, 1, 1, 1, 1, 3, 3, 5],
        };
        break;

      case "spider":
        amountOfTokens += 7;
        dropTable = [
          "treat",
          "treat",
          "treat",
          "pineapple",
          "sunflowerSeed",
          "gumdrops",
          "treat",
          "treat",
          "treat",
          "pineapple",
          "sunflowerSeed",
          "gumdrops",
          "glue",
          "enzymes",
          "oil",
          "fieldDice",
          "ticket",
          "ticket",
          "royalJelly",
          "ticket",
          "royalJelly",
          "magicBean",
          "magicBean",
          "magicBean",
          "magicBean",
          "microConverter",
          "microConverter",
          "microConverter",
        ];
        dropAmountTable = {
          treat: [1, 1, 1, 1, 5, 5, 5, 10, 10, 15],
          enzymes: [1, 1, 1, 1, 1, 1, 1, 2, 2, 3],
          oil: [1, 1, 1, 1, 1, 1, 1, 2, 2, 3],
          fieldDice: [1, 1, 1, 1, 1, 2, 2, 3],
          glue: [1, 1, 1, 1, 1, 1, 3, 3, 5],
          pineapple: [1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 5, 5, 10],
          sunflowerSeed: [1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 5, 5, 10],
          gumdrops: [1, 1, 1, 1, 1, 1, 1, 5, 5, 10],
          ticket: [1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 5],
          royalJelly: [1, 1, 1, 1, 1, 1, 1, 3, 3, 5],
          magicBean: [1, 1, 1, 1, 1, 1, 2, 2, 3, 5],
          microConverter: [1, 1, 1, 1, 3, 5],
        };
        break;

      case "werewolf":
        amountOfTokens += 9;
        dropTable = [
          "treat",
          "treat",
          "treat",
          "pineapple",
          "sunflowerSeed",
          "gumdrops",
          "treat",
          "treat",
          "treat",
          "pineapple",
          "sunflowerSeed",
          "gumdrops",
          "gumdrops",
          "glue",
          "enzymes",
          "oil",
          "fieldDice",
          "fieldDice",
          "smoothDice",
          "treat",
          "treat",
          "treat",
          "pineapple",
          "sunflowerSeed",
          "gumdrops",
          "treat",
          "treat",
          "treat",
          "pineapple",
          "sunflowerSeed",
          "gumdrops",
          "glue",
          "glue",
          "enzymes",
          "oil",
          "fieldDice",
          "fieldDice",
          "smoothDice",
          "loadedDice",
          "ticket",
          "royalJelly",
          "ticket",
          "royalJelly",
          "ticket",
          "ticket",
          "royalJelly",
          "antPass",
          "magicBean",
          "microConverter",
          "microConverter",
          "microConverter",
          "microConverter",
        ];
        dropAmountTable = {
          treat: [1, 1, 1, 1, 5, 5, 5, 15, 20, 35],
          enzymes: [1, 1, 1, 1, 1, 1, 1, 2, 2, 3],
          oil: [1, 1, 1, 1, 1, 1, 1, 2, 2, 3],
          fieldDice: [1, 1, 1, 1, 1, 2, 2, 3],
          smoothDice: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
          loadedDice: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
          glue: [1, 1, 1, 1, 1, 1, 1, 3, 3, 5, 10, 15],
          pineapple: [1, 1, 1, 1, 1, 1, 3, 3, 3, 5, 5, 10, 15, 25],
          sunflowerSeed: [1, 1, 1, 1, 1, 1, 3, 3, 3, 5, 5, 10, 15, 25],
          gumdrops: [1, 1, 1, 1, 1, 1, 5, 5, 5, 10, 10, 15],
          ticket: [1, 1, 1, 1, 1, 1, 3, 3, 5, 10],
          royalJelly: [1, 1, 1, 1, 1, 1, 3, 3, 5, 10, 15],
          antPass: [1],
          magicBean: [1, 1, 1, 1, 1, 2, 2, 3, 5],
          microConverter: [1, 1, 1, 1, 3, 5],
        };
        break;

      case "scorpion":
        amountOfTokens += 7;
        dropTable = [
          "strawberry",
          "strawberry",
          "strawberry",
          "strawberry",
          "strawberry",
          "strawberry",
          "strawberry",
          "redExtract",
          "treat",
          "treat",
          "treat",
          "gumdrops",
          "gumdrops",
          "gumdrops",
          "ticket",
          "royalJelly",
          "ticket",
          "royalJelly",
        ];
        dropAmountTable = {
          strawberry: [1, 1, 1, 1, 1, 1, 3, 3, 3, 5, 5, 15],
          redExtract: [1, 1, 1, 1, 1, 1, 3, 3, 5],
          treat: [1, 1, 1, 1, 1, 5, 5, 5, 15, 15, 30],
          gumdrops: [1, 1, 1, 1, 1, 1, 3, 3, 5, 15],
          ticket: [1, 1, 1, 1, 1, 1, 3, 3, 5],
          royalJelly: [1, 1, 1, 1, 1, 1, 3, 3, 5, 10],
        };
        break;

      case "mantis":
        amountOfTokens += 7;
        dropTable = [
          "blueberry",
          "blueberry",
          "blueberry",
          "blueberry",
          "blueberry",
          "blueberry",
          "blueberry",
          "blueExtract",
          "treat",
          "treat",
          "treat",
          "gumdrops",
          "gumdrops",
          "gumdrops",
          "ticket",
          "royalJelly",
          "ticket",
          "royalJelly",
        ];
        dropAmountTable = {
          blueberry: [1, 1, 1, 1, 1, 1, 3, 3, 3, 5, 5, 15],
          blueExtract: [1, 1, 1, 1, 1, 1, 3, 3, 5],
          treat: [1, 1, 1, 1, 1, 5, 5, 5, 15, 15, 30],
          gumdrops: [1, 1, 1, 1, 1, 1, 3, 3, 5, 15],
          ticket: [1, 1, 1, 1, 1, 1, 3, 3, 5],
          royalJelly: [1, 1, 1, 1, 1, 1, 3, 3, 5, 10],
        };
        break;

      case "kingBeetle":
        amountOfTokens += 12;
        dropTable = [
          "treat",
          "treat",
          "treat",
          "treat",
          "treat",
          "redExtract",
          "blueExtract",
          "redExtract",
          "blueExtract",
          "redExtract",
          "blueExtract",
          "gumdrops",
          "ticket",
          "royalJelly",
          "gumdrops",
          "ticket",
          "royalJelly",
          "gumdrops",
          "ticket",
          "royalJelly",
          "microConverter",
          "microConverter",
          "microConverter",
          "fieldDice",
          "fieldDice",
          "fieldDice",
          "smoothDice",
          "smoothDice",
          "loadedDice",
          "antPass",
          "antPass",
          "oil",
          "enzymes",
          "glitter",
          "glue",
          "purplePotion",
          "roboPass",
          "magicBean",
          "magicBean",
          "magicBean",
          "magicBean",
        ];
        dropAmountTable = {
          treat: [
            15, 15, 15, 20, 25, 25, 25, 50, 50, 50, 50, 100, 100, 100, 150, 150,
            175, 175, 250, 350, 500,
          ],
          redExtract: [1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 5, 5, 10],
          blueExtract: [1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 5, 5, 10],
          gumdrops: [3, 3, 3, 3, 5, 5, 5, 15, 15, 25],
          ticket: [1, 1, 1, 1, 3, 3, 3, 5, 5, 10],
          royalJelly: [1, 1, 3, 3, 3, 3, 3, 5, 5, 10],
          microConverter: [1, 1, 1, 1, 1, 3, 3, 5],
          fieldDice: [1, 1, 1, 1, 1, 3, 3, 5],
          smoothDice: [1, 1, 1, 1, 1, 1, 2, 2, 2, 3],
          loadedDice: [1],
          antPass: [1, 1, 1, 1, 1, 3, 3, 3, 5],
          oil: [1, 1, 1, 1, 1, 3, 3, 5],
          enzymes: [1, 1, 1, 1, 1, 3, 3, 5],
          glitter: [1, 1, 1, 1, 1, 3, 3, 5],
          glue: [1, 1, 1, 1, 1, 3, 3, 5],
          purplePotion: [1],
          roboPass: [1, 1, 1, 2],
          magicBean: [1, 1, 1, 1, 1, 2, 2, 3, 3, 4, 5],
        };

        if (Math.random() < 0.5) {
          const amulet = [
            "*" + MATH.random(1.1, 1.5).toFixed(2) + " capacityMultiplier",
            "*" + MATH.random(1.15, 1.5).toFixed(2) + " convertRate",
          ];

          if (Math.random() < 0.333) {
            amulet.push(
              "+1 redBeeAttack",
              "+1 blueBeeAttack",
              "+1 whiteBeeAttack",
            );
          } else {
            amulet.push(
              Math.random() < 0.5 ? "+1 redBeeAttack" : "+1 blueBeeAttack",
            );
          }

          amulet.push(
            ...MATH.selectFromArray(
              [
                "*" + MATH.random(1.02, 1.07).toFixed(2) + " POLLEN",
                "*" + MATH.random(1.05, 1.2).toFixed(2) + " bluePollen",
                "*" + MATH.random(1.05, 1.2).toFixed(2) + " redPollen",
                "*" + MATH.random(1.05, 1.15).toFixed(2) + " whitePollen",
              ],
              2,
            ),
          );

          player.showGeneratedAmulet?.("kingBeetleAmulet", amulet);
        }
        break;

      case "tunnelBear": {
        amountOfTokens += 14;

        let baseDrops = [
          "treat",
          "treat",
          "treat",
          "treat",
          "treat",
          "sunflowerSeed",
          "sunflowerSeed",
          "pineapple",
          "pineapple",
          "redExtract",
          "blueExtract",
          "redExtract",
          "blueExtract",
          "redExtract",
          "blueExtract",
          "gumdrops",
          "ticket",
          "royalJelly",
          "gumdrops",
          "ticket",
          "royalJelly",
          "gumdrops",
          "ticket",
          "royalJelly",
          "microConverter",
          "microConverter",
          "microConverter",
          "fieldDice",
          "fieldDice",
          "fieldDice",
          "smoothDice",
          "smoothDice",
          "loadedDice",
          "antPass",
          "antPass",
          "oil",
          "enzymes",
          "glitter",
          "glue",
          "loadedDice",
          "purplePotion",
          "superSmoothie",
          "roboPass",
          "magicBean",
          "magicBean",
          "magicBean",
          "magicBean",
          "magicBean",
        ];
        dropTable = [
          ...baseDrops,
          ...baseDrops,
          "giftedSilverEgg",
          "giftedGoldEgg",
          "giftedDiamondEgg",
        ];
        dropAmountTable = {
          treat: [
            25, 25, 25, 50, 50, 50, 100, 100, 250, 500, 1000, 5000, 10000,
          ],
          sunflowerSeed: [10, 10, 15, 15, 20, 20, 25, 50],
          pineapple: [10, 10, 15, 15, 20, 20, 25, 50],
          redExtract: [1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 5, 5, 10],
          blueExtract: [1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 5, 5, 10],
          gumdrops: [3, 3, 3, 3, 5, 5, 5, 15, 15, 25],
          ticket: [1, 1, 1, 1, 3, 3, 3, 5, 5, 10],
          royalJelly: [1, 1, 3, 3, 3, 3, 3, 5, 5, 10],
          microConverter: [1, 1, 1, 1, 1, 3, 3, 5],
          fieldDice: [1, 1, 1, 1, 1, 3, 3, 5],
          smoothDice: [1, 1, 1, 1, 1, 1, 2, 2, 2, 3],
          loadedDice: [1],
          antPass: [1, 1, 1, 1, 1, 3, 3, 3, 5],
          oil: [1, 1, 1, 1, 1, 3, 3, 5],
          enzymes: [1, 1, 1, 1, 1, 3, 3, 5],
          glitter: [1, 1, 1, 1, 1, 3, 3, 5],
          glue: [1, 1, 1, 1, 1, 3, 3, 5],
          purplePotion: [1],
          superSmoothie: [1],
          giftedSilverEgg: [1],
          giftedGoldEgg: [1],
          giftedDiamondEgg: [1],
          roboPass: [1, 1, 1, 1, 1, 2, 2, 3],
          magicBean: [1, 1, 1, 3, 3, 5],
        };
        break;
      }
    }

    return { dropTable, dropAmountTable, amountOfTokens };
  }

  /**
   * Overrides Mob.die. Rolls loot from getLootTable() and scatters Token
   * instances around the death position, matching BugMob's original
   * ring/line scatter patterns. Does NOT splice the mob out of
   * gameState.objects.mobs itself — per this codebase's convention
   * (see updateEngine.js), the engine loop is responsible for splicing
   * after isDead/die() returns.
   *
   * @param {number} index - Index of this mob in gameState.objects.mobs (unused for splicing here, kept for signature parity with Mob.die).
   * @param {Object} gameState - The live game state object.
   * @returns {void}
   */
  die(index, gameState) {
    const { dropTable, dropAmountTable, amountOfTokens } =
      this.getLootTable(gameState);

    if (!dropTable) return; // unknown type guard

    const radius = amountOfTokens * 0.2 + 1.5;
    let line = -amountOfTokens * 2;

    const lootLuck = gameState.player.lootLuck || 1;

    for (
      let i = 0, inc = MATH.TWO_PI / amountOfTokens;
      i < MATH.TWO_PI;
      i += inc
    ) {
      const r =
        1 -
        Math.pow(
          1 -
            (this.type === "tunnelBear"
              ? 0.3
              : this.type === "kingBeetle"
                ? 0.25
                : 0.2),
          lootLuck * 1.5,
        );

      if (this.type === "tunnelBear") {
        line += 2;

        if (Math.random() < r) {
          const ty = dropTable[(Math.random() * dropTable.length) | 0];
          const am =
            dropAmountTable[ty][
              (Math.random() * dropAmountTable[ty].length) | 0
            ];

          gameState.objects.tokens.push(
            new Token(
              ty,
              am,
              [this.pos[0] + line, this.pos[1] - 1, this.pos[2]],
              true,
            ),
          );
        } else {
          gameState.objects.tokens.push(
            new Token(
              "honey",
              12500,
              [this.pos[0] + line, this.pos[1] - 1, this.pos[2]],
              true,
            ),
          );
        }
      } else {
        if (Math.random() < r) {
          const ty = dropTable[(Math.random() * dropTable.length) | 0];
          const am =
            dropAmountTable[ty][
              (Math.random() * dropAmountTable[ty].length) | 0
            ];

          gameState.objects.tokens.push(
            new Token(
              ty,
              am,
              [
                this.pos[0] + Math.cos(i) * radius,
                this.pos[1],
                this.pos[2] + Math.sin(i) * radius,
              ],
              true,
            ),
          );
        } else {
          gameState.objects.tokens.push(
            new Token(
              "honey",
              STANDARD_HONEY_DROP[this.type],
              [
                this.pos[0] + Math.cos(i) * radius,
                this.pos[1],
                this.pos[2] + Math.sin(i) * radius,
              ],
              true,
            ),
          );
        }
      }
    }
  }
}
