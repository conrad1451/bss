// entities/bees.js
import { MATH } from "../utils/math.js";
// import { vec3, vec2 } from "../utils/gl-matrix.js";
import { vec3, vec2 } from "gl-matrix";

// import { beeInfo } from "./data/bees.js";
import { beeInfo } from "../data/bees.js"; // ✅
export class Bee {
  constructor(pos, type, lvl, gifted, x, y, mutation, gameState) {
    this.meshScale = type === "baby" || type === "tadpole" ? 0.65 : 1; // [cite: 141, 1441]
    this.gifted = gifted; // [cite: 141]
    this.type = type; // [cite: 141]
    this.pos = [...pos]; // [cite: 141]
    this.hiveX = x; // [cite: 141]
    this.hiveY = y; // [cite: 141]
    this.pollen = 0; // [cite: 141]
    this.state = "moveToPlayer"; // [cite: 141]

    this.computeLevel(lvl || 1, mutation, gameState); // [cite: 141, 1442]
  }

  computeLevel(newLevel, mutation, gameState) {
    // Logic for ability rates, attack, and energy [cite: 1443, 1444, 1447]
    // ...
  }

  testComputeLevel(newLevel) {
    this.gatheringTokens = [
      {
        type: "inspire",
        cooldown: effects.inspire.trialCooldown,
        rate: effects.inspire.trialRate,
        timer: -10000,
        requireGifted: true,
      },
    ];

    for (let i in beeInfo[this.type].tokens) {
      let t = beeInfo[this.type].tokens[i].replace("*", ""),
        g = beeInfo[this.type].tokens[i].indexOf("*") > -1;

      this.gatheringTokens.push({
        type: t,
        cooldown: effects[t].trialCooldown,
        rate: effects[t].trialRate,
        timer: -10000,
        requireGifted: g,
      });
    }

    this.attackTokens = [];

    for (let i in beeInfo[this.type].attackTokens) {
      let t = beeInfo[this.type].attackTokens[i].replace("*", ""),
        g = beeInfo[this.type].attackTokens[i].indexOf("*") > -1;

      this.attackTokens.push({
        type: t,
        cooldown: effects[t].trialCooldown,
        rate: effects[t].trialRate,
        timer: -10000,
        requireGifted: g,
      });
    }

    this.level = newLevel;

    newLevel--;

    this.speed = beeInfo[this.type].speed;
    this.gatherSpeed = beeInfo[this.type].gatherSpeed;
    this.gatherAmount = beeInfo[this.type].gatherAmount;
    this.convertAmount = beeInfo[this.type].convertAmount;
    this.convertSpeed = beeInfo[this.type].convertSpeed;
    this.maxEnergy = beeInfo[this.type].energy;
    this.attack = beeInfo[this.type].attack;
    this.abilityRate = 1;

    if (this.type === "digital") {
      this.attack += player.extraInfo.drives.red * 0.3;
      this.convertAmount += player.extraInfo.drives.blue * 20;
      this.gatherAmount += player.extraInfo.drives.white * 2.5;
      this.abilityRate += player.extraInfo.drives.glitched * 0.0075;

      if (
        player.extraInfo.drives.red >= 50 &&
        player.extraInfo.drives.blue >= 50 &&
        player.extraInfo.drives.white >= 50 &&
        player.extraInfo.drives.glitched >= 50
      ) {
        this.speed += 10;
        player.extraInfo.drives.maxed = true;
      }
    }

    if (this.mutation) {
      if (this.mutation.oper === "*") {
        this[this.mutation.stat] *= this.mutation.num;
      } else {
        this[this.mutation.stat] += this.mutation.num;
      }
    }

    if (player.hive[this.hiveY][this.hiveX].beequip) {
      let stats = player.hive[this.hiveY][this.hiveX].beequip.stats.bee;

      stats = stats.split(",");

      for (let i in stats) {
        let str = stats[i];

        if (str[0] === "*") {
          this[str.substring(str.indexOf(" ") + 1, str.indexOf("("))] *=
            Number(str.substr(1, str.indexOf(" ") - 1)) +
            Number(
              str.substr(str.indexOf("(") + 2, str.length).replace(")", ""),
            );
        } else {
          this[str.substring(str.indexOf(" ") + 1, str.indexOf("("))] +=
            Number(str.substr(1, str.indexOf(" ") - 1)) +
            Number(
              str.substr(str.indexOf("(") + 2, str.length).replace(")", ""),
            );
        }
      }

      if (
        beequips[player.hive[this.hiveY][this.hiveX].beequip.type].extraAbility
      ) {
        let ab =
          beequips[
            player.hive[this.hiveY][this.hiveX].beequip.type
          ].extraAbility.split("_");

        this[ab[0] + "Tokens"].push({
          type: ab[1],
          cooldown: effects[ab[1]].trialCooldown,
          rate: effects[ab[1]].trialRate,
          timer: -10000,
        });
      }
    }

    this.speed *= newLevel * 0.03 + 1;
    this.gatherAmount *= newLevel * 0.1 + 1;
    this.convertAmount *= newLevel * 0.1 + 1;
    this.maxEnergy *= newLevel * 0.05 + 1;

    if (this.gifted) {
      this.gatherAmount *= 1.5;
      this.convertAmount *= 1.5;
      this.attack *= 1.5;
    }

    this.speed /= 3.5;

    this.energy = MATH.random(0.35, 1) * this.maxEnergy;
  }

  update(dt, gameState, textRenderer) {
    // Movement and State Machine logic (attack, collect, sleep) [cite: 148, 149, 151, 163, 179, 189, 204]
    // ...
  }

  testUpdate() {
    if (this.fetchBall && this.fetchBall.turn) this.state = "moveToFetch";

    for (let i in this.trails) {
      this.trails[i].addPos([
        this.pos[0],
        this.pos[1] + this.beeOffsets[i],
        this.pos[2],
      ]);
    }

    if (
      (this.energy <= 0 &&
        this.state !== "sleep" &&
        this.state !== "moveToTriangulate" &&
        this.state !== "moveToTargetPractice" &&
        this.state !== "shootTargetPractice" &&
        this.state !== "moveToFetch") ||
      (player.hive[this.hiveY][this.hiveX].roboDisabled &&
        this.state !== "sleep")
    ) {
      this.state = "moveToSleep";
    }

    if (
      player.attacked.length > 0 &&
      this.state !== "sleep" &&
      this.state !== "moveToSleep" &&
      this.state !== "attack" &&
      this.state !== "moveToAttack" &&
      this.state !== "moveToTriangulate" &&
      this.state !== "moveToTargetPractice" &&
      this.state !== "shootTargetPractice" &&
      this.state !== "moveToFetch"
    ) {
      this.attackMob =
        player.attacked[(Math.random() * player.attacked.length) | 0];
      this.state = "moveToAttack";
      let _a = Math.random() * MATH.TWO_PI;
      this.attackOffset = [Math.cos(_a) * 2, Math.sin(_a) * 2];
    }

    switch (this.state) {
      case "moveToAttack":
        if (
          !player.attacked.length ||
          !this.attackMob ||
          (this.attackMob.state !== "attack" &&
            !(this.attackMob instanceof CoconutCrab) &&
            !(this.attackMob instanceof StumpSnail))
        ) {
          this.state = "moveToPlayer";
          return;
        }

        this.moveTo = [
          this.attackMob.pos[0] + this.attackOffset[0],
          this.attackMob.pos[1] + (this.type === "precise" ? 1.25 : 0.25),
          this.attackMob.pos[2] + this.attackOffset[1],
        ];
        vec3.sub(this.moveDir, this.moveTo, this.pos);
        vec3.normalize(this.moveDir, this.moveDir);
        vec3.scaleAndAdd(
          this.pos,
          this.pos,
          this.moveDir,
          dt *
            this.speed *
            player.beeSpeed *
            (this.type === "spicy" ? player.flameHeatStackApplied : 1),
        );
        if (vec3.sqrDist(this.moveTo, this.pos) < 0.8) {
          this.state = "attack";

          let _a = Math.random() * MATH.TWO_PI,
            r = this.type === "precise" ? 5 : 2;
          this.attackOffset = [Math.cos(_a) * r, Math.sin(_a) * r];
          this.attackTimer =
            (1.25 + Math.random() * 0.5) * (this.type === "precise" ? 1.6 : 1);
        }

        meshes.bees.instanceData.push(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          this.meshScale,
          this.moveDir[0],
          this.moveDir[1],
          this.moveDir[2],
          BEE_FLY,
          beeInfo[this.type].u,
          this.GIFTED_BEE_TEXTURE_OFFSET,
          beeInfo[this.type].meshPartId,
        );

        break;

      case "attack":
        if (
          !player.attacked.length ||
          !this.attackMob ||
          (this.attackMob.state !== "attack" &&
            !(this.attackMob instanceof CoconutCrab) &&
            !(this.attackMob instanceof StumpSnail))
        ) {
          this.state = "moveToPlayer";
          return;
        }

        this.attackTimer -= dt;

        if (this.attackTimer <= 0) {
          this.energy--;

          this.state = "moveToAttack";

          this.attackMob =
            player.attacked[(Math.random() * player.attacked.length) | 0];

          if (Math.random() < (this.attackMob.blocking ? 0.85 : 0)) {
            this.energy--;

            textRenderer.add(
              "BLOCK",
              [
                this.attackMob.pos[0],
                this.attackMob.pos[1] + Math.random() * 2.75 + 1.5,
                this.attackMob.pos[2],
              ],
              [255, 255, 255],
              0,
              "",
              1.75,
              false,
            );
          } else {
            if (
              Math.random() <
              (this.type === "precise"
                ? Math.max(
                    Math.pow(
                      2,
                      (this.gifted ? 2 : 1) + this.level - this.attackMob.level,
                    ),
                    0.05,
                  )
                : Math.pow(2, this.level - this.attackMob.level))
            ) {
              let h =
                (this.attack + player[beeInfo[this.type].color + "BeeAttack"]) *
                player.beeAttack *
                (this.type === "precise" ? (this.gifted ? 2 : 1.5) : 1) *
                (this.type === "buoyant" ? player.buoyantBeeAttack : 1);

              this.attackMob.damage(h);

              if (this.type === "precise") {
                objects.explosions.push(
                  new Explosion({
                    col: [1, 0, 0],
                    pos: this.pos,
                    life: 0.75,
                    size: 1.75,
                    speed: 0.3,
                    aftershock: 0,
                  }),
                );
              }
            } else {
              this.energy--;

              textRenderer.add(
                "MISS",
                [
                  this.attackMob.pos[0],
                  this.attackMob.pos[1] + Math.random() * 2.75 + 1.5,
                  this.attackMob.pos[2],
                ],
                [255, 255, 255],
                0,
                "",
                1.75,
                false,
              );
            }
          }

          let token,
            openTokens = [];

          for (let i in this.attackTokens) {
            let g = this.attackTokens[i];

            if (
              (TIME - g.timer) *
                player[beeInfo[this.type].color + "BeeAbilityRate"] *
                this.abilityRate >=
                g.cooldown &&
              Math.random() < g.rate * 0.35 &&
              ((g.requireGifted && this.gifted) || !g.requireGifted)
            ) {
              openTokens.push(i);
            }
          }

          if (openTokens.length) {
            token = openTokens[(Math.random() * openTokens.length) | 0];
            this.attackTokens[token].timer = TIME;

            token = this.attackTokens[token].type;

            objects.tokens.push(
              new Token(
                effects[token].tokenLife,
                [
                  Math.round(this.pos[0]),
                  player.body.position.y + 0.5,
                  Math.round(this.pos[2]),
                ],
                token,
                {
                  field: player.fieldIn,
                  x: this.flowerCollecting[0],
                  z: this.flowerCollecting[1],
                  bee: this,
                },
                true,
              ),
            );
          }
        }

        meshes.bees.instanceData.push(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          this.meshScale,
          this.moveDir[0],
          this.moveDir[1],
          this.moveDir[2],
          TIME * 5,
          beeInfo[this.type].u,
          this.GIFTED_BEE_TEXTURE_OFFSET,
          beeInfo[this.type].meshPartId,
        );

        break;

      case "moveToPlayer":
        if (player.fieldIn && player.pollen < player.capacity) {
          if (fieldInfo[player.fieldIn].planter) {
            let chance =
                MATH.lerp(0.35, 0.02, objects.bees.length / 50) *
                (this.type === "shy" ? (this.gifted ? 2.5 : 2) : 1),
              p = fieldInfo[player.fieldIn].planter;

            if (p.type === "redClay") {
              if (beeInfo[this.type] === "red") {
                chance *= 1.25;
              } else if (beeInfo[this.type] === "blue") {
                chance = 0;
              }
            }

            if (p.type === "blueClay") {
              if (beeInfo[this.type] === "blue") {
                chance *= 1.25;
              } else if (beeInfo[this.type] === "red") {
                chance = 0;
              }
            }

            if (p.type === "pesticide" && this.mutation) {
              chance *= 1.3;
            }

            if (p.type === "petal" && beeInfo[this.type] === "white") {
              chance *= 1.5;
            }

            if (p.type === "plenty" && this.gifted) {
              chance *= 1.5;
            }

            if (Math.random() < chance) {
              this.state = "moveToPlanter";
              let t = Math.random() * MATH.TWO_PI;
              this.collectRot = [Math.sin(t), -4, Math.cos(t)];

              return;
            }
          }

          this.state = "moveToFlower";
          return;
        }

        this.moveTo = [
          player.body.position.x + this.moveOffset[0],
          player.body.position.y,
          player.body.position.z + this.moveOffset[2],
        ];
        vec3.sub(this.moveDir, this.moveTo, this.pos);
        vec3.normalize(this.moveDir, this.moveDir);
        vec3.scaleAndAdd(
          this.pos,
          this.pos,
          this.moveDir,
          dt *
            this.speed *
            player.beeSpeed *
            (this.type === "spicy" ? player.flameHeatStackApplied : 1),
        );

        if (vec3.sqrDist(this.moveTo, this.pos) < 0.8)
          this.moveOffset = [MATH.random(-5, 5), 0, MATH.random(-5, 5)];

        meshes.bees.instanceData.push(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          this.meshScale,
          this.moveDir[0],
          this.moveDir[1],
          this.moveDir[2],
          BEE_FLY,
          beeInfo[this.type].u,
          this.GIFTED_BEE_TEXTURE_OFFSET,
          beeInfo[this.type].meshPartId,
        );

        if (player.converting && player.pollen) {
          this.state = "moveToHiveToConvert";
          return;
        }

        if (player.convertingBalloon && player.hiveBalloon.pollen) {
          this.state = "moveToHiveToConvertBalloon";
        }

        break;

      case "moveToPlanter":
        if (
          !player.fieldIn ||
          player.pollenInBag >= player.capacity ||
          !fieldInfo[player.fieldIn].planter
        ) {
          this.state = "moveToPlayer";
          break;
        }

        let p = fieldInfo[player.fieldIn].planter;

        this.moveTo = [
          p.pos[0],
          p.pos[1] + p.height + p.displaySize + 0.2,
          p.pos[2],
        ];
        vec3.sub(this.moveDir, this.moveTo, this.pos);
        vec3.normalize(this.moveDir, this.moveDir);
        vec3.scaleAndAdd(
          this.pos,
          this.pos,
          this.moveDir,
          dt *
            this.speed *
            player.beeSpeed *
            (this.type === "spicy" ? player.flameHeatStackApplied : 1),
        );

        if (vec3.sqrDist(this.moveTo, this.pos) < 0.075) {
          this.state = "collectPlanter";
          this.collectTimer =
            this.gatherSpeed *
            (this.type === "spicy" ? 1 / player.flameHeatStackApplied : 1);
          this.planterSipTime = this.collectTimer;
          return;
        }

        meshes.bees.instanceData.push(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          this.meshScale,
          this.moveDir[0],
          this.moveDir[1],
          this.moveDir[2],
          BEE_FLY,
          beeInfo[this.type].u,
          this.GIFTED_BEE_TEXTURE_OFFSET,
          beeInfo[this.type].meshPartId,
        );

        break;

      case "collectPlanter":
        if (
          !player.fieldIn ||
          player.pollenInBag >= player.capacity ||
          !fieldInfo[player.fieldIn].planter
        ) {
          this.state = "moveToPlayer";
          return;
        }

        this.collectTimer -= dt;

        if (this.collectTimer <= 0) {
          this.energy--;

          fieldInfo[player.fieldIn].planter.beeSipped(this);

          let token,
            openTokens = [];

          for (let i in this.gatheringTokens) {
            let g = this.gatheringTokens[i];

            if (
              (TIME - g.timer) *
                player[beeInfo[this.type].color + "BeeAbilityRate"] *
                this.abilityRate >=
                g.cooldown &&
              Math.random() <= g.rate &&
              ((g.requireGifted && this.gifted) || !g.requireGifted)
            ) {
              openTokens.push(i);
            }
          }

          if (openTokens.length) {
            token = openTokens[(Math.random() * openTokens.length) | 0];
            this.gatheringTokens[token].timer = TIME;

            token = this.gatheringTokens[token].type;

            objects.tokens.push(
              new Token(
                effects[token].tokenLife,
                [
                  Math.round(this.pos[0]),
                  fieldInfo[player.fieldIn].y + 1,
                  Math.round(this.pos[2]),
                ],
                token,
                {
                  field: player.fieldIn,
                  x: fieldInfo[player.fieldIn].x | 0,
                  z: fieldInfo[player.fieldIn].z | 0,
                  bee: this,
                },
              ),
            );
          }

          this.state = "moveToFlower";
        }

        meshes.bees.instanceData.push(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          this.meshScale,
          this.collectRot[0],
          this.collectRot[1],
          this.collectRot[2],
          BEE_COLLECT,
          beeInfo[this.type].u,
          this.GIFTED_BEE_TEXTURE_OFFSET,
          beeInfo[this.type].meshPartId,
        );

        break;

      case "moveToFlower":
        if (!player.fieldIn || player.pollenInBag >= player.capacity) {
          this.state = "moveToPlayer";
          break;
        }

        let f = fieldInfo[player.fieldIn];

        while (
          this.flowerCollecting[0] === undefined ||
          this.flowerCollecting[1] === undefined ||
          this.flowerCollecting[0] < 0 ||
          this.flowerCollecting[0] >= f.width ||
          this.flowerCollecting[1] < 0 ||
          this.flowerCollecting[1] >= f.length
        ) {
          this.flowerCollecting[0] =
            player.flowerIn.x + Math.round(MATH.random(-7, 7));
          this.flowerCollecting[1] =
            player.flowerIn.z + Math.round(MATH.random(-7, 7));

          let t = Math.random() * MATH.TWO_PI;
          this.collectRot = [Math.sin(t), -4, Math.cos(t)];
        }

        this.moveTo = [
          f.x + this.flowerCollecting[0],
          f.y +
            flowers[player.fieldIn][this.flowerCollecting[1]][
              this.flowerCollecting[0]
            ].height *
              0.5 +
            0.25,
          f.z + this.flowerCollecting[1],
        ];
        vec3.sub(this.moveDir, this.moveTo, this.pos);
        vec3.normalize(this.moveDir, this.moveDir);
        vec3.scaleAndAdd(
          this.pos,
          this.pos,
          this.moveDir,
          dt *
            this.speed *
            player.beeSpeed *
            (this.type === "spicy" ? player.flameHeatStackApplied : 1),
        );

        if (vec3.sqrDist(this.moveTo, this.pos) < 0.075) {
          this.state = "collectPollen";
          this.collectTimer =
            this.gatherSpeed *
            (this.type === "spicy" ? 1 / player.flameHeatStackApplied : 1);
          return;
        }

        meshes.bees.instanceData.push(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          this.meshScale,
          this.moveDir[0],
          this.moveDir[1],
          this.moveDir[2],
          BEE_FLY,
          beeInfo[this.type].u,
          this.GIFTED_BEE_TEXTURE_OFFSET,
          beeInfo[this.type].meshPartId,
        );

        break;

      case "collectPollen":
        if (!player.fieldIn || player.pollenInBag >= player.capacity) {
          this.state = "moveToPlayer";
          return;
        }

        this.collectTimer -= dt;

        if (this.collectTimer <= 0) {
          this.energy--;
          collectPollen({
            x: this.flowerCollecting[0],
            z: this.flowerCollecting[1],
            pattern: [[0, 0]],
            amount: this.gatherAmount,
            yOffset: MATH.random(0.7, 1.3),
            multiplier: {
              r:
                beeInfo[this.type].color === "red"
                  ? player.pollenFromBees *
                    1.2 *
                    (this.type === "tabby" ? player.tabbyLoveStacks : 1)
                  : player.pollenFromBees *
                    (this.type === "tabby" ? player.tabbyLoveStacks : 1),
              b:
                beeInfo[this.type].color === "blue"
                  ? player.pollenFromBees *
                    1.2 *
                    (this.type === "tabby" ? player.tabbyLoveStacks : 1)
                  : player.pollenFromBees *
                    (this.type === "tabby" ? player.tabbyLoveStacks : 1),
              w:
                player.pollenFromBees *
                (this.type === "tabby" ? player.tabbyLoveStacks : 1),
            },
          });

          if (beeInfo[this.type].gatheringPassive) {
            beeInfo[this.type].gatheringPassive(this);
          }

          let token,
            openTokens = [];

          for (let i in this.gatheringTokens) {
            let g = this.gatheringTokens[i];

            if (
              (TIME - g.timer) *
                player[beeInfo[this.type].color + "BeeAbilityRate"] *
                this.abilityRate >=
                g.cooldown &&
              Math.random() <= g.rate &&
              ((g.requireGifted && this.gifted) || !g.requireGifted)
            ) {
              openTokens.push(i);
            }
          }

          if (openTokens.length) {
            token = openTokens[(Math.random() * openTokens.length) | 0];
            this.gatheringTokens[token].timer = TIME;

            token = this.gatheringTokens[token].type;

            objects.tokens.push(
              new Token(
                effects[token].tokenLife,
                [
                  Math.round(this.pos[0]),
                  fieldInfo[player.fieldIn].y + 1,
                  Math.round(this.pos[2]),
                ],
                token,
                {
                  field: player.fieldIn,
                  x: this.flowerCollecting[0],
                  z: this.flowerCollecting[1],
                  bee: this,
                },
              ),
            );
          }

          this.flowerCollecting = [];
          this.state = "moveToPlayer";
        }

        meshes.bees.instanceData.push(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          this.meshScale,
          this.collectRot[0],
          this.collectRot[1],
          this.collectRot[2],
          BEE_COLLECT,
          beeInfo[this.type].u,
          this.GIFTED_BEE_TEXTURE_OFFSET,
          beeInfo[this.type].meshPartId,
        );

        break;

      case "moveToHiveToConvert":
        if (!player.converting || !player.pollen) {
          this.state = "moveToPlayer";
          return;
        }

        this.moveTo = this.hivePos.slice();
        vec3.sub(this.moveDir, this.moveTo, this.pos);
        vec3.normalize(this.moveDir, this.moveDir);
        vec3.scaleAndAdd(
          this.pos,
          this.pos,
          this.moveDir,
          dt *
            this.speed *
            player.beeSpeed *
            (this.type === "spicy" ? player.flameHeatStackApplied : 1),
        );
        if (vec3.sqrDist(this.moveTo, this.pos) < 0.8) {
          this.pos = this.hivePos.slice();
          this.state = "convertHoney";
          this.convertTimer = this.convertSpeed;

          let amountToTake = Math.min(
            Math.round(
              this.convertAmount *
                player.convertRate *
                player[beeInfo[this.type].color + "ConvertRate"] *
                player.convertRateAtHive *
                (this.type === "tabby" ? player.tabbyLoveStacks : 1),
            ),
            player.pollen,
          );

          if (amountToTake === player.pollen) {
            this.lastBeeToConvert = true;
          }

          player.pollen -= amountToTake;
          this.pollen = amountToTake;
        }

        meshes.bees.instanceData.push(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          this.meshScale,
          this.moveDir[0],
          this.moveDir[1],
          this.moveDir[2],
          BEE_FLY,
          beeInfo[this.type].u,
          this.GIFTED_BEE_TEXTURE_OFFSET,
          beeInfo[this.type].meshPartId,
        );

        break;

      case "convertHoney":
        if (!player.converting) {
          player.pollen += this.pollen;
          this.pollen = 0;
          this.state = "moveToPlayer";
          return;
        }

        this.convertTimer -= dt;

        meshes.bees.instanceData.push(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          this.meshScale,
          0,
          1,
          0,
          TIME * 5,
          beeInfo[this.type].u,
          this.GIFTED_BEE_TEXTURE_OFFSET,
          beeInfo[this.type].meshPartId,
        );
        if (this.convertTimer <= 0) {
          this.state = "moveToHiveToConvert";
          player.honey += Math.ceil(
            this.pollen *
              player.honeyAtHive *
              player.honeyPerPollen *
              (this.type === "diamond"
                ? (1.4 + this.level * 0.03) * (this.gifted ? 2 : 1)
                : 1),
          );

          textRenderer.add(
            Math.ceil(
              this.pollen *
                player.honeyAtHive *
                player.honeyPerPollen *
                (this.type === "diamond"
                  ? (1.4 + this.level * 0.03) * (this.gifted ? 2 : 1)
                  : 1),
            ),
            [
              player.body.position.x,
              player.body.position.y + Math.random() * 2 + 0.5,
              player.body.position.z,
            ],
            COLORS.honey,
            0,
            "+",
          );

          this.pollen = 0;

          if (!player.pollen && this.lastBeeToConvert) {
            this.lastBeeToConvert = false;
            player.converting = false;
            player.stopConverting = true;
          }

          for (let i = 0; i < 10; i++) {
            ParticleRenderer.add({
              x: this.pos[0],
              y: this.pos[1],
              z: this.pos[2],
              vx: MATH.random(-1, 1),
              vy: MATH.random(-1, 1),
              vz: MATH.random(0, 3),
              grav: 0,
              size: MATH.random(60, 100),
              col:
                this.type === "diamond"
                  ? [0.1, 0.7, 0.9]
                  : COLORS.honey_normalized,
              life: 0.75,
              rotVel: MATH.random(-3, 3),
              alpha: 5,
            });
          }
        }

        break;

      case "moveToHiveToConvertBalloon":
        if (!player.convertingBalloon || !player.hiveBalloon.pollen) {
          this.state = "moveToPlayer";
          return;
        }

        this.moveTo = this.hivePos.slice();
        vec3.sub(this.moveDir, this.moveTo, this.pos);
        vec3.normalize(this.moveDir, this.moveDir);
        vec3.scaleAndAdd(
          this.pos,
          this.pos,
          this.moveDir,
          dt *
            this.speed *
            player.beeSpeed *
            (this.type === "spicy" ? player.flameHeatStackApplied : 1),
        );
        if (vec3.sqrDist(this.moveTo, this.pos) < 0.8) {
          this.pos = this.hivePos.slice();
          this.state = "convertBalloon";
          this.convertTimer = this.convertSpeed;

          let amountToTake = Math.min(
            Math.round(
              this.convertAmount *
                player.convertRate *
                (this.type === "buoyant" ? (this.gifted ? 4 : 3) : 1) *
                player[beeInfo[this.type].color + "ConvertRate"] *
                player.convertRateAtHive *
                (this.type === "tabby" ? player.tabbyLoveStacks : 1),
            ),
            player.hiveBalloon.pollen,
          );

          if (amountToTake === player.hiveBalloon.pollen) {
            this.lastBeeToConvert = true;
          }

          player.hiveBalloon.pollen -= amountToTake;
          this.pollen = amountToTake;
        }

        meshes.bees.instanceData.push(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          this.meshScale,
          this.moveDir[0],
          this.moveDir[1],
          this.moveDir[2],
          BEE_FLY,
          beeInfo[this.type].u,
          this.GIFTED_BEE_TEXTURE_OFFSET,
          beeInfo[this.type].meshPartId,
        );

        break;

      case "convertBalloon":
        if (!player.convertingBalloon) {
          player.hiveBalloon.pollen += this.pollen;
          this.pollen = 0;
          this.state = "moveToPlayer";
          return;
        }

        this.convertTimer -= dt;

        meshes.bees.instanceData.push(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          this.meshScale,
          0,
          1,
          0,
          TIME * 5,
          beeInfo[this.type].u,
          this.GIFTED_BEE_TEXTURE_OFFSET,
          beeInfo[this.type].meshPartId,
        );
        if (this.convertTimer <= 0) {
          this.state = "moveToHiveToConvertBalloon";
          player.honey += Math.ceil(
            this.pollen *
              player.honeyAtHive *
              player.honeyPerPollen *
              (this.type === "diamond"
                ? (1.4 + this.level * 0.03) * (this.gifted ? 2 : 1)
                : 1),
          );

          textRenderer.add(
            Math.ceil(
              this.pollen *
                player.honeyAtHive *
                player.honeyPerPollen *
                (this.type === "diamond"
                  ? (1.4 + this.level * 0.03) * (this.gifted ? 2 : 1)
                  : 1),
            ),
            [
              player.body.position.x,
              player.body.position.y + Math.random() * 2 + 0.5,
              player.body.position.z,
            ],
            COLORS.honey,
            0,
            "+",
          );

          this.pollen = 0;

          if (!player.pollen && this.lastBeeToConvert) {
            this.lastBeeToConvert = false;
            player.convertingBalloon = false;
            player.stopConverting = true;
          }

          for (let i = 0; i < 10; i++) {
            ParticleRenderer.add({
              x: this.pos[0],
              y: this.pos[1],
              z: this.pos[2],
              vx: MATH.random(-1, 1),
              vy: MATH.random(-1, 1),
              vz: MATH.random(0, 3),
              grav: 0,
              size: MATH.random(60, 100),
              col:
                this.type === "diamond"
                  ? [0.1, 0.7, 0.9]
                  : COLORS.honey_normalized,
              life: 0.75,
              rotVel: MATH.random(-3, 3),
              alpha: 5,
            });
          }
        }

        break;

      case "moveToSleep":
        this.moveTo = this.hivePos.slice();
        vec3.sub(this.moveDir, this.moveTo, this.pos);
        vec3.normalize(this.moveDir, this.moveDir);
        vec3.scaleAndAdd(
          this.pos,
          this.pos,
          this.moveDir,
          dt *
            this.speed *
            player.beeSpeed *
            (this.type === "spicy" ? player.flameHeatStackApplied : 1),
        );
        if (vec3.sqrDist(this.moveTo, this.pos) < 1) {
          this.pos = this.hivePos.slice();
          this.sleepTimer = 20;
          this.zzzTimer = 0;
          this.state = "sleep";
          this.sleepRotate = Math.random() * MATH.TWO_PI;
        }

        meshes.bees.instanceData.push(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          this.meshScale,
          this.moveDir[0],
          this.moveDir[1],
          this.moveDir[2],
          BEE_FLY,
          beeInfo[this.type].u,
          this.GIFTED_BEE_TEXTURE_OFFSET,
          beeInfo[this.type].meshPartId,
        );

        break;

      case "sleep":
        this.sleepTimer -= dt;
        this.zzzTimer -= dt;

        if (this.sleepTimer <= 0) {
          this.energy = this.maxEnergy * player.beeEnergy;
          this.state = "moveToPlayer";
        }

        if (this.zzzTimer <= 0) {
          this.zzzTimer = 5;
          textRenderer.add(
            "zzz",
            [
              this.pos[0] + MATH.random(-1, 1),
              this.pos[1] + MATH.random(-1, 1),
              this.pos[2] + Math.random() + 0.25,
            ],
            [255, 255, 255],
            0,
            "",
            1.25,
          );
        }

        meshes.bees.instanceData.push(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          this.meshScale,
          0,
          1,
          0,
          this.sleepRotate,
          beeInfo[this.type].u,
          this.GIFTED_BEE_TEXTURE_OFFSET,
          beeInfo[this.type].meshPartId,
        );

        break;

      case "moveToTargetPractice":
        if (!player.fieldIn) {
          this.state = "moveToPlayer";
          return;
        }

        vec3.sub(this.moveDir, this.moveTo, this.pos);
        vec3.normalize(this.moveDir, this.moveDir);
        vec3.scaleAndAdd(
          this.pos,
          this.pos,
          this.moveDir,
          dt * this.speed * player.beeSpeed * 1.5,
        );
        if (vec3.sqrDist(this.moveTo, this.pos) < 0.7) {
          this.pos = this.moveTo.slice();
          this.targetPracticeTimer = 4;
          this.targetExplosionTimer = 0;
          this.state = "shootTargetPractice";
          this.targetLookDir = [
            ((fieldInfo[player.fieldIn].width * 0.5) | 0) +
              fieldInfo[player.fieldIn].x -
              this.pos[0],
            fieldInfo[player.fieldIn].y,
            ((fieldInfo[player.fieldIn].length * 0.5) | 0) +
              fieldInfo[player.fieldIn].z -
              this.pos[2],
          ];
          this.targets = [];

          for (let i = 0; i < 3; i++) {
            let _x =
                (fieldInfo[player.fieldIn].width * 0.5 +
                  Math.random() *
                    this.targetPractice_q[0] *
                    fieldInfo[player.fieldIn].width *
                    0.5) |
                0,
              _z =
                (fieldInfo[player.fieldIn].length * 0.5 +
                  Math.random() *
                    this.targetPractice_q[1] *
                    fieldInfo[player.fieldIn].length *
                    0.5) |
                0;

            this.targets.push(new Target(player.fieldIn, _x, _z, i + 1, this));
            objects.targets.push(this.targets[this.targets.length - 1]);
          }
        }

        meshes.bees.instanceData.push(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          this.meshScale,
          this.moveDir[0],
          this.moveDir[1],
          this.moveDir[2],
          BEE_FLY,
          beeInfo[this.type].u,
          this.GIFTED_BEE_TEXTURE_OFFSET,
          beeInfo[this.type].meshPartId,
        );

        break;

      case "shootTargetPractice":
        this.targetPracticeTimer -= dt;
        this.targetExplosionTimer -= dt;

        if (
          this.targets[0].activated &&
          this.targets[1].activated &&
          this.targets[2].activated &&
          this.targetPracticeTimer > 0.75
        ) {
          this.targetPracticeTimer = 0.75;
        }

        if (this.targetPracticeTimer <= 0.5 && !this.shotParticleProjectile) {
          this.shotParticleProjectile = true;

          for (let i in this.targets) {
            let vx = this.targets[i].pos[0] - this.pos[0],
              vy = this.targets[i].pos[1] - this.pos[1],
              vz = this.targets[i].pos[2] - this.pos[2],
              d = Math.sqrt(vx * vx + vy * vy + vz * vz),
              s = d / 0.5,
              m = s / d;

            ParticleRenderer.add({
              x: this.pos[0],
              y: this.pos[1],
              z: this.pos[2],
              vx: vx * m,
              vy: vy * m,
              vz: vz * m,
              grav: 0,
              size: 400,
              col: [1, 0, 0],
              life: 0.4,
              rotVel: MATH.random(-9, 9),
              alpha: 1000,
            });
          }
        }

        if (this.targetPracticeTimer <= 0) {
          this.shotParticleProjectile = false;

          let t = [
            this.targets[0].activated,
            this.targets[1].activated,
            this.targets[2].activated,
          ];

          if (t[0] && t[1] && t[2]) {
            for (let i in objects.tokens) {
              if (
                objects.tokens[i].canBeLinked &&
                !(objects.tokens[i] instanceof DupedToken)
              ) {
                objects.tokens[i].collect();
              }
            }

            objects.tokens.push(
              new Token(
                effects.precision.tokenLife,
                [
                  this.targets[2].pos[0],
                  this.targets[2].pos[1] + 0.5,
                  this.targets[2].pos[2],
                ],
                "precision",
                {
                  field: this.targets[2].field,
                  x: this.targets[2].x,
                  z: this.targets[2].z,
                  bee: this,
                },
              ),
            );
            objects.tokens.push(
              new Token(
                effects.focus.tokenLife,
                [
                  this.targets[2].pos[0] + 1,
                  this.targets[2].pos[1] + 0.5,
                  this.targets[2].pos[2],
                ],
                "focus",
                {
                  field: this.targets[2].field,
                  x: this.targets[2].x + 1,
                  z: this.targets[2].z,
                  bee: this,
                },
              ),
            );
            objects.tokens.push(
              new Token(
                effects.redBoost.tokenLife,
                [
                  this.targets[2].pos[0] - 1,
                  this.targets[2].pos[1] + 0.5,
                  this.targets[2].pos[2],
                ],
                "redBoost",
                {
                  field: this.targets[2].field,
                  x: this.targets[2].x - 1,
                  z: this.targets[2].z,
                  bee: this,
                },
              ),
            );
          }

          if (t[2] && this.gifted) {
            if (!t[0] || !t[1]) {
              objects.marks.push(
                new Mark(
                  this.targets[2].field,
                  this.targets[2].x,
                  this.targets[2].z,
                  "preciseMark",
                  this.level,
                ),
              );
            }
          }

          for (let i in this.targets) {
            let _t = this.targets[i];

            if (_t.activated) {
              if (i !== 2)
                objects.tokens.push(
                  new Token(
                    effects.focus.tokenLife,
                    [_t.pos[0], _t.pos[1] + 0.5, _t.pos[2]],
                    "focus",
                    { field: _t.field, x: _t.x, z: _t.z, bee: this },
                  ),
                );

              collectPollen({
                x: _t.x,
                z: _t.z,
                pattern: [
                  [-4, 0],
                  [-3, -2],
                  [-3, -1],
                  [-3, 0],
                  [-3, 1],
                  [-3, 2],
                  [-2, -3],
                  [-2, -2],
                  [-2, -1],
                  [-2, 0],
                  [-2, 1],
                  [-2, 2],
                  [-2, 3],
                  [-1, -3],
                  [-1, -2],
                  [-1, -1],
                  [-1, 0],
                  [-1, 1],
                  [-1, 2],
                  [-1, 3],
                  [0, -4],
                  [0, -3],
                  [0, -2],
                  [0, -1],
                  [0, 0],
                  [0, 1],
                  [0, 2],
                  [0, 3],
                  [0, 4],
                  [1, -3],
                  [1, -2],
                  [1, -1],
                  [1, 0],
                  [1, 1],
                  [1, 2],
                  [1, 3],
                  [2, -3],
                  [2, -2],
                  [2, -1],
                  [2, 0],
                  [2, 1],
                  [2, 2],
                  [2, 3],
                  [3, -2],
                  [3, -1],
                  [3, 0],
                  [3, 1],
                  [3, 2],
                  [4, 0],
                ],
                amount:
                  (this.attack +
                    player[beeInfo[this.type].color + "BeeAttack"]) *
                  player.beeAttack *
                  (this.level * 0.1 + 1) *
                  0.5,
                yOffset: 2 + Math.random() * 0.4,
                stackHeight: 0.5 + Math.random() * 0.5,
                instantConversion: (player.flameHeatStack - 1) * 0.5, // CHQ: let's bee generate honey directly into the player's inventory while still contributing the full raw amount to the quest stats
                multiplier: player.flameHeatStack * 3,
                field: _t.field,
              });
            } else {
              objects.tokens.push(
                new Token(
                  effects.redBoost.tokenLife,
                  [_t.pos[0], _t.pos[1] + 0.5, _t.pos[2]],
                  "redBoost",
                  { field: _t.field, x: _t.x, z: _t.z, bee: this },
                ),
              );
            }
          }

          this.targets[0].splice = true;
          this.targets[1].splice = true;
          this.targets[2].splice = true;

          this.state = "moveToPlayer";
          return;
        }

        if (this.targetExplosionTimer <= 0) {
          this.targetExplosionTimer = 0.8;
          objects.explosions.push(
            new Explosion({
              col: [1, 0, 0],
              pos: this.pos,
              life: 0.75,
              size: 1.75,
              speed: 0.3,
              aftershock: 0,
            }),
          );
        }

        meshes.bees.instanceData.push(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          this.meshScale,
          this.targetLookDir[0],
          this.targetLookDir[1],
          this.targetLookDir[2],
          BEE_FLY,
          beeInfo[this.type].u,
          this.GIFTED_BEE_TEXTURE_OFFSET,
          beeInfo[this.type].meshPartId,
        );

        break;

      case "moveToTriangulate":
        this.triangulateTimer -= dt;

        let d = [
            player.body.position.x - this.triangulateTokenPos[0],
            player.body.position.z - this.triangulateTokenPos[2],
          ],
          rd = [-d[1], d[0]],
          tb = [
            this.pos[0] - player.body.position.x,
            this.pos[2] - player.body.position.z,
          ];

        if (rd[0] * tb[0] + rd[1] * tb[1] > 0) {
          this.moveDir = [rd[0], 0, rd[1]];
        } else {
          this.moveDir = [d[1], 0, -d[0]];
        }

        vec3.normalize(this.moveDir, this.moveDir);
        vec3.scaleAndAdd(
          this.pos,
          this.pos,
          this.moveDir,
          dt * this.speed * player.beeSpeed,
        );

        if (this.triangulateTimer <= 0) {
          this.state = "moveToPlayer";
        }

        meshes.bees.instanceData.push(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          this.meshScale,
          this.moveDir[0],
          this.moveDir[1],
          this.moveDir[2],
          BEE_FLY,
          beeInfo[this.type].u,
          this.GIFTED_BEE_TEXTURE_OFFSET,
          beeInfo[this.type].meshPartId,
        );

        break;

      case "moveToFetch":
        if (!this.fetchBall || !this.fetchBall.turn) {
          this.state = "moveToPlayer";
          return;
        }

        this.moveDir = [
          this.fetchBall.body.position.x - this.pos[0],
          this.fetchBall.body.position.y - this.pos[1],
          this.fetchBall.body.position.z - this.pos[2],
        ];

        if (
          Math.abs(this.moveDir[0]) +
            Math.abs(this.moveDir[1]) +
            Math.abs(this.moveDir[2]) <
          1.2
        ) {
          let dir = [
            player.body.position.x - this.pos[0],
            player.body.position.z - this.pos[2],
          ];

          vec2.normalize(dir, dir);

          this.fetchBall.kick(
            dir[0] + MATH.random(-0.2, 0.2),
            dir[1] + MATH.random(-0.2, 0.2),
          );
        }

        vec3.normalize(this.moveDir, this.moveDir);
        vec3.scaleAndAdd(
          this.pos,
          this.pos,
          this.moveDir,
          dt * this.speed * player.beeSpeed,
        );

        meshes.bees.instanceData.push(
          this.pos[0],
          this.pos[1],
          this.pos[2],
          this.meshScale,
          this.moveDir[0],
          this.moveDir[1],
          this.moveDir[2],
          BEE_FLY,
          beeInfo[this.type].u,
          this.GIFTED_BEE_TEXTURE_OFFSET,
          beeInfo[this.type].meshPartId,
        );

        break;
    }

    if (beeInfo[this.type].particles && TIME - this.emitParticle > 0.2) {
      beeInfo[this.type].particles(this);
      this.emitParticle = TIME;
    }

    if (player.hive[this.hiveY][this.hiveX].radioactive > 0) {
      textRenderer.addDecalRaw(
        ...this.pos,
        0,
        0,
        ...textRenderer.decalUV.glow,
        0,
        1,
        0,
        2.5,
        2.5,
        0,
      );
    }

    if (this.type === "buoyant") {
      if (this.gifted)
        textRenderer.addDecalRaw(
          ...this.pos,
          0,
          0,
          ...textRenderer.decalUV.glow,
          1,
          1,
          0.2,
          1.35,
          1.35,
          0,
        );
      textRenderer.addDecalRaw(
        ...this.pos,
        0,
        0,
        ...textRenderer.decalUV.lightrays,
        1,
        1,
        0.2,
        2.25,
        2.25,
        (TIME * 1.25 + this.hiveX + this.hiveY * 5) * (this.hiveY % 2 ? 1 : -1),
      );
    }
  }
}

export class TempBee extends Bee {
  constructor(pos, type, lvl, lifespan, gifted, gameState) {
    super(pos, type, lvl, gifted, 0, 0, null, gameState);
    this.life = lifespan; // [cite: 242, 243]
  }

  update(dt, gameState, textRenderer) {
    const isDead = super.update(dt, gameState, textRenderer);
    this.life -= dt; // [cite: 244]
    return this.life <= 0 || isDead; // [cite: 296]
  }
}
