// entities/CoconutCrab.js
import { MATH } from "../utils/math.js";
import { Mob } from "./mobs.js";
import { LootToken } from "./tokens.js"; // CHQ: adjust path if LootToken lives elsewhere
import { Coconut } from "./coconut.js"; // CHQ: adjust path — not present in provided files
import { Explosion } from "../engine/particles.js"; // CHQ: adjust path — not present in provided files

// CHQ: Claude AI (Sonnet): Converted from standalone CoconutCrab to an extension of Mob.
// Preserves the alignClaws -> clawAttack -> alignMiddle -> cocoAttack boss
// state machine, the "down" respawn-countdown phase, and the loot-burst
// die() logic, but routes everything through gameState instead of
// module-level globals and drops the raw gl.* draw calls (rendering is
// owned by renderer.js in this codebase, not entity update()).

export class CoconutCrab extends Mob {
  /**
   * @param {Object} gameState - The live game state object.
   */
  constructor(gameState) {
    const field = "CoconutField";
    const fieldInfo = gameState.fieldInfo;
    const pos = [
      fieldInfo[field].x,
      fieldInfo[field].y + 0.3,
      fieldInfo[field].z + 2.5,
      0,
    ];

    // Mob's constructor signature is (id, type, pos, hp, lvl, gameState)
    super("coconutCrab", "coconutCrab", pos, 100000, 10, gameState);

    this.field = field;
    this.state = "alignClaws";
    this.starSawHitTimer = 0;
    this.health = this.hp;
    this.maxHealth = this.health;
    this.flameTimer = 0;
    this.waitTimer = 0;
    this.damageTimer = 0;
    this.bodySize = 3;
    this.runningAmount = 0;
    this.mindHacked = 0;
    this.stateAlternate = 2;
    this.timeToDefeat = 0;
    this.isDead = gameState.player.extraInfo?.mob_coco || 0;

    // Claw sub-positions, kept as plain data for the renderer to consume
    this.clawA = [this.pos[0] - 1.5, this.pos[1] + 1, this.pos[2] + 2, 0];
    this.clawB = [this.pos[0] + 1.5, this.pos[1] + 1, this.pos[2] + 2, 0];

    // CHQ: stashed so the setTimeout-driven phase transitions below
    // (which fire well after any single update() call returns) have a
    // gameState to close over. Refreshed every update() call.
    this.gameState = gameState;
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
      [this.pos[0], this.pos[1] + Math.random() * 2.75 + 5, this.pos[2]],
      [255, 0, 0],
      crit ? (superCrit ? 2 : 1) : 0,
      "",
      sizeScale[Math.min(d.toString().length, 5)],
    );
  }

  /**
   * Per-frame update: handles the post-death countdown, the death/loot
   * trigger, zone tracking, and the alignClaws/clawAttack/alignMiddle/
   * cocoAttack phase machine. Overrides Mob.update entirely — the base
   * Mob's aggro/return logic doesn't apply to a boss with this much
   * bespoke phase choreography.
   *
   * @param {number} dt - Delta time in seconds.
   * @param {Object} gameState - The live game state object.
   * @returns {boolean} true once the respawn countdown finishes (mirrors
   *   the death-signal contract used by updateEngine.js), false otherwise.
   */
  update(dt, gameState) {
    this.gameState = gameState; // refresh closure target for deferred timeouts

    const player = gameState.player;
    const fieldInfo = gameState.fieldInfo;
    const objects = gameState.objects;
    const textRenderer = gameState.textRenderer;

    // --- "Defeated, waiting to respawn" phase ---
    if (this.isDead > 0) {
      this.isDead -= dt;
      if (!player.extraInfo) player.extraInfo = {};
      player.extraInfo.mob_coco = this.isDead;

      textRenderer.addSingle(
        "Coconut Crab",
        [26, 17, -40],
        gameState.COLORS?.whiteArr || [255, 255, 255],
        -1.5,
        false,
        false,
        0,
        0.2,
      );
      textRenderer.addSingle(
        MATH.doTime(this.isDead),
        [26, 17, -40],
        gameState.COLORS?.whiteArr || [255, 255, 255],
        -1.5,
        false,
        false,
        0,
        -0.2,
      );

      return this.isDead <= 0;
    }

    // --- Death trigger / loot burst ---
    if (this.health <= 0) {
      player.computeRestrictionInfo?.();

      window.setTimeout(() => gameState.UPDATE_MAP_MESH?.(), 500);

      this.isDead = (180 * 60) / (player.monsterRespawnTime || 1);

      let loots = "",
        decay = MATH.constrain(Math.pow(2, -0.001 * this.timeToDefeat), 0.1, 1);

      loots += "coconut,".repeat((MATH.random(60, 110) * 0.5 * decay) | 0);
      loots += "tropicalDrink,".repeat((MATH.random(4, 10) * decay) | 0);
      loots += "microConverter,".repeat((MATH.random(4, 12) * decay) | 0);
      loots += "starJelly,".repeat((MATH.random(2, 5) * decay) | 0);
      loots += "glitter,".repeat((MATH.random(3, 7) * decay) | 0);
      loots += "magicBean,".repeat((MATH.random(3, 7) * decay) | 0);
      loots += "oil,".repeat((MATH.random(3, 7) * decay) | 0);
      loots += "glue,".repeat((MATH.random(3, 7) * decay) | 0);

      loots = loots.substring(0, loots.length - 1).split(",");

      for (let i = loots.length; i--; ) {
        const DIS = this;

        window.setTimeout(function () {
          const gs = DIS.gameState;
          const it = (Math.random() * loots.length) | 0;

          gs.objects.tokens.push(
            new LootToken(
              15,
              [
                fieldInfo[DIS.field].x +
                  ((fieldInfo[DIS.field].width * Math.random()) | 0),
                fieldInfo[DIS.field].y + 1,
                fieldInfo[DIS.field].z +
                  ((fieldInfo[DIS.field].length * Math.random()) | 0),
                0,
              ],
              loots[it],
              loots[it] === "coconut" ? MATH.random(1, 4) | 0 : 1,
              true,
              "Coconut Crab",
            ),
          );
          loots.splice(i, 1);
        }, i * 300);
      }
    }

    const isInZone =
      player.body.position.x > fieldInfo[this.field].x &&
      player.body.position.x <
        fieldInfo[this.field].x + fieldInfo[this.field].width &&
      player.body.position.z > fieldInfo[this.field].z &&
      player.body.position.z <
        fieldInfo[this.field].z + fieldInfo[this.field].length;

    if (isInZone) {
      player.attacked.push(this);
    } else {
      if (this.pos[0] > fieldInfo[this.field].x - 8) {
        this.pos[0] -= dt * 6.5;

        this.clawA = [this.pos[0] - 1.5, this.pos[1] + 1, this.pos[2] + 2, 0];
        this.clawB = [this.pos[0] + 1.5, this.pos[1] + 1, this.pos[2] + 2, 0];
      } else {
        return false;
      }
    }

    this.timeToDefeat += dt;
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

    if (this.mindHacked <= 0) {
      this.damageTimer -= dt;

      if (
        Math.abs(player.body.position.x - this.pos[0]) +
          Math.abs(player.body.position.y - this.pos[1] + 1) +
          Math.abs(player.body.position.z - this.pos[2]) <
          this.bodySize &&
        this.damageTimer <= 0
      ) {
        player.damage(150);
        this.damageTimer = 1.5;
      }

      if (isInZone) {
        switch (this.state) {
          case "alignClaws": {
            this.pos[0] =
              this.pos[0] +
              dt * Math.sign(player.body.position.x - this.pos[0]) * 6.5;

            this.clawA = [
              this.pos[0] - 1.5,
              this.pos[1] + 1,
              this.pos[2] + 2,
              0,
            ];
            this.clawB = [
              this.pos[0] + 1.5,
              this.pos[1] + 1,
              this.pos[2] + 2,
              0,
            ];

            if (Math.abs(player.body.position.x - this.pos[0]) < 0.5) {
              this.state = "";

              const DIS = this;

              window.setTimeout(function () {
                DIS.state = "clawAttack";
                DIS.cm = 0;
                DIS._cm = 6.5;

                window.setTimeout(function () {
                  DIS.state = "";
                  DIS.clawA = [
                    DIS.pos[0] - 1.5,
                    DIS.pos[1] + 1,
                    DIS.pos[2] + 2,
                    0,
                  ];
                  DIS.clawB = [
                    DIS.pos[0] + 1.5,
                    DIS.pos[1] + 1,
                    DIS.pos[2] + 2,
                    0,
                  ];
                }, 1750);

                window.setTimeout(function () {
                  DIS.stateAlternate--;

                  if (DIS.stateAlternate < 0) {
                    DIS.state = "alignMiddle";
                    DIS.stateAlternate = 3;
                    return;
                  }

                  DIS.state = "alignClaws";
                }, 1750 + 500);
              }, 250);
            }

            break;
          }

          case "clawAttack": {
            if (this.cm < 0 || this.cm > 1) {
              this.cm = MATH.constrain(this.cm, 0, 1);
              this._cm *= -1;

              if (
                player.body.position.x > this.pos[0] - 2.25 &&
                player.body.position.x < this.pos[0] + 2.25 &&
                player.body.position.y > this.pos[1] - 1 &&
                player.body.position.y < this.pos[1] + 3
              ) {
                player.damage(12);
              }
            }

            this.cm += this._cm * dt;

            this.clawA = [
              this.pos[0] - 1.5,
              this.pos[1] + 1,
              this.pos[2] + 2 + this.cm * 7,
              0,
            ];
            this.clawB = [
              this.pos[0] + 1.5,
              this.pos[1] + 1,
              this.pos[2] + 2 + (1 - this.cm) * 7,
              0,
            ];

            break;
          }

          case "alignMiddle": {
            this.pos[0] = MATH.constrain(
              this.pos[0] +
                dt *
                  Math.sign(
                    fieldInfo[this.field].x +
                      fieldInfo[this.field].width * 0.5 -
                      this.pos[0],
                  ) *
                  6.5,
              fieldInfo[this.field].x,
              fieldInfo[this.field].x + fieldInfo[this.field].width,
            );

            this.clawA = [
              this.pos[0] - 1.5,
              this.pos[1] + 1,
              this.pos[2] + 2,
              0,
            ];
            this.clawB = [
              this.pos[0] + 1.5,
              this.pos[1] + 1,
              this.pos[2] + 2,
              0,
            ];

            if (
              Math.abs(
                fieldInfo[this.field].x +
                  fieldInfo[this.field].width * 0.5 -
                  this.pos[0],
              ) < 0.5 &&
              player.fieldIn === this.field
            ) {
              this.state = "cocoAttack";
              this.cm = 0;
              this._cm = 0;

              const DIS = this;

              window.setTimeout(
                function () {
                  DIS.state = "alignClaws";
                },
                1000 * 7 + 2000,
              );

              for (let i = 0; i < 7; i++) {
                window.setTimeout(
                  function () {
                    DIS._cm = 14;

                    const gs = DIS.gameState;

                    gs.objects.mobs.push(
                      new Coconut(
                        i
                          ? (MATH.random(0.1, 0.9) *
                              fieldInfo[DIS.field].width) |
                              0
                          : player.flowerIn.x,
                        i
                          ? (MATH.random(0.5, 0.9) *
                              fieldInfo[DIS.field].length) |
                              0
                          : player.flowerIn.z,
                        0,
                        true,
                      ),
                    );

                    window.setTimeout(function () {
                      gs.objects.explosions.push(
                        new Explosion({
                          col: [0.8, 0.8, 0.8],
                          pos: DIS.pos.slice(),
                          life: 0.5,
                          size: 11,
                          speed: 0.2,
                          aftershock: 0.03,
                          maxAlpha: 0.15,
                          primitive: "cylinder_explosions",
                          height: 0.1,
                        }),
                      );
                    }, 500);
                  },
                  1000 * i + 1000,
                );
              }
            }

            break;
          }

          case "cocoAttack": {
            this._cm -= 45 * dt;
            this.cm += this._cm * dt;

            if (this.cm < 0) {
              this._cm *= -0.3;
              this.cm = 0;
            }

            this.pos[1] = fieldInfo[this.field].y + 0.3 + this.cm;

            this.clawA = [
              this.pos[0] - 1.5,
              this.pos[1] + 1,
              this.pos[2] + 2,
              0,
            ];
            this.clawB = [
              this.pos[0] + 1.5,
              this.pos[1] + 1,
              this.pos[2] + 2,
              0,
            ];

            break;
          }
        }
      }
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

    // NOTE: raw gl.* draw calls for the body and both claw meshes from the
    // original CoconutCrab.update were intentionally dropped here —
    // instance/mesh drawing belongs to renderer.js in this codebase (see
    // drawMobs), not entity update(). this.pos/this.clawA/this.clawB remain
    // plain data fields for a future drawCoconutCrab() to consume.

    this.pos[1] += 4.3;

    textRenderer.addCTX(
      "Coconut Crab (Level " + this.level + ")",
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

    this.pos[1] -= 4.3;

    return false;
  }

  /**
   * Overrides Mob.die. Spawns the boss's replacement instance, matching
   * CoconutCrab's original self-replacing respawn behavior. Does NOT
   * splice this instance out of gameState.objects.mobs itself — per this
   * codebase's convention (see updateEngine.js), the engine loop is
   * responsible for splicing after isDead/die() returns.
   *
   * @param {number} index - Index of this mob in gameState.objects.mobs (unused for splicing here, kept for signature parity with Mob.die).
   * @param {Object} gameState - The live game state object.
   * @returns {void}
   */
  die(index, gameState) {
    gameState.objects.mobs.push(new CoconutCrab(gameState));
  }
}
