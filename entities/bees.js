// entities/bees.js
import { MATH } from "../utils/math.js";
import { vec3, vec2 } from "gl-matrix";

import { beeInfo } from "../data/bees.js";

import { getPositionAheadOfCamera } from "./entityHelpers.js";

import { DupedToken } from "./miscEntities/DupedToken.js";

// CHQ: Claude AI (Sonnet) refactored file
export class Bee {
  constructor(pos, type, lvl, gifted, x, y, mutation, gameState) {
    this.meshScale = type === "baby" || type === "tadpole" ? 0.65 : 1;
    this.gifted = gifted;
    this.type = type;
    this.pos = [...pos];
    this.hiveX = x;
    this.hiveY = y;
    this.pollen = 0;
    this.state = "moveToPlayer";

    this.moveDir = [0, 0, 1];
    this.moveTo = [...pos];
    this.moveOffset = [0, 0, 0];
    this.flowerCollecting = [];

    this.computeLevel(lvl || 1, mutation, gameState);
  }

  computeLevel(newLevel, mutation, gameState) {
    // Logic for ability rates, attack, and energy
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

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Moves this bee toward `target` at the bee's standard speed, scaled by
   * player multipliers and the spicy-heat modifier when applicable.
   * Updates `this.moveDir` in place and advances `this.pos`.
   *
   * @param {number[]} target   - World-space [x, y, z] destination.
   * @param {number}   dt       - Delta time in seconds.
   * @param {Object}   player   - Live player object from gameState.
   * @param {number}   [speedMult=1] - Extra speed scalar (e.g. 1.5 for target-practice dash).
   */
  _stepTowards(target, dt, player, speedMult = 1) {
    vec3.sub(this.moveDir, target, this.pos);
    vec3.normalize(this.moveDir, this.moveDir);
    const spicyMult = this.type === "spicy" ? player.flameHeatStackApplied : 1;
    vec3.scaleAndAdd(
      this.pos,
      this.pos,
      this.moveDir,
      dt * this.speed * player.beeSpeed * spicyMult * speedMult,
    );
  }

  /**
   * Appends one entry to the instanced-bee draw buffer for this frame.
   * All 11 floats are written in the layout the bee shader expects:
   *   pos(3) + meshScale(1) + moveDir(3) + animState(1) + uvU(1) + giftedOffset(1) + meshPartId(1)
   *
   * @param {number[]} instanceData - The flat array to push into (gameState.meshes.bees.instanceData).
   * @param {number}   animState    - Animation-state float (BEE_FLY, BEE_COLLECT, TIME*5, etc.).
   * @param {number[]} [dir]        - Direction override; defaults to this.moveDir.
   */
  _pushInstanceData(instanceData, animState, dir = this.moveDir) {
    instanceData.push(
      this.pos[0],
      this.pos[1],
      this.pos[2],
      this.meshScale,
      dir[0],
      dir[1],
      dir[2],
      animState,
      beeInfo[this.type].u,
      this.GIFTED_BEE_TEXTURE_OFFSET,
      beeInfo[this.type].meshPartId,
    );
  }

  /**
   * Picks a random ability token from `tokenList` whose cooldown has elapsed
   * and fires it by pushing a new Token into `objects.tokens`.
   * Returns the chosen token type string, or null if none fired.
   *
   * @param {Object[]} tokenList     - this.gatheringTokens or this.attackTokens.
   * @param {number[]} spawnPos      - World-space [x, y, z] where the token appears.
   * @param {Object}   tokenContext  - { field, x, z, bee } passed to the Token constructor.
   * @param {Object}   gameState
   * @param {boolean}  [attackMode=false] - Uses rate*0.35 for attack tokens.
   */
  _tryFireToken(
    tokenList,
    spawnPos,
    tokenContext,
    gameState,
    attackMode = false,
  ) {
    const { player, objects } = gameState;
    const colorKey = beeInfo[this.type].color + "BeeAbilityRate";
    const openTokens = [];

    for (let i in tokenList) {
      const g = tokenList[i];
      const elapsed =
        (gameState.TIME - g.timer) * player[colorKey] * this.abilityRate;
      const rate = attackMode ? g.rate * 0.35 : g.rate;
      if (
        elapsed >= g.cooldown &&
        Math.random() <= rate &&
        (!g.requireGifted || this.gifted)
      ) {
        openTokens.push(i);
      }
    }

    if (!openTokens.length) return null;

    const chosen = openTokens[(Math.random() * openTokens.length) | 0];
    tokenList[chosen].timer = gameState.TIME;
    const tokenType = tokenList[chosen].type;

    objects.tokens.push(
      new Token(
        effects[tokenType].tokenLife,
        spawnPos,
        tokenType,
        tokenContext,
      ),
    );

    return tokenType;
  }

  // ---------------------------------------------------------------------------
  // Public update
  // ---------------------------------------------------------------------------

  /**
   * Advances circular orbit flight for one tick. Updates `this.pos` and
   * `this.moveDir` to the tangent direction. Returns `true` if circle flight
   * is active so `update` can early-out; `false` if the bee has no orbit set.
   *
   * @param {number} dt - Delta time in seconds.
   * @returns {boolean}
   */
  _updateCircleFlight(dt) {
    this.circleAngle = (this.circleAngle || 0) + this.circleSpeed * dt;
    const cos = Math.cos(this.circleAngle);
    const sin = Math.sin(this.circleAngle);

    if (this.circleAxisY !== false) {
      // Horizontal orbit on XZ plane
      this.pos[0] = this.circleCenter[0] + cos * this.circleRadius;
      this.pos[2] = this.circleCenter[2] + sin * this.circleRadius;
    } else {
      // Vertical orbit on XY plane
      this.pos[0] = this.circleCenter[0] + cos * this.circleRadius;
      this.pos[1] = this.circleCenter[1] + sin * this.circleRadius;
    }

    // Tangent direction (perpendicular to radius)
    this.moveDir[0] = -sin;
    this.moveDir[1] = 0;
    this.moveDir[2] = cos;

    return true;
  }

  /**
   * Circle-flight early-out then delegates to the main state machine.
   */
  update(dt, gameState) {
    if (this.circleRadius && this.circleSpeed) {
      return this._updateCircleFlight(dt);
    } else {
      return this._stateMachineUpdate(dt, gameState);
    }
  }

  /**
   * Main per-frame state machine. All globals replaced with gameState references.
   */
  _stateMachineUpdate(dt, gameState) {
    const ctx = this._buildContext(gameState);

    this._runPreSwitchChecks(dt, gameState, ctx);

    switch (this.state) {
      case "moveToAttack":
        this._stateMoveToAttack(dt, gameState, ctx);
        break;
      case "attack":
        this._stateAttack(dt, gameState, ctx);
        break;
      case "moveToPlayer":
        this._stateMoveToPlayer(dt, gameState, ctx);
        break;
      case "moveToPlanter":
        this._stateMoveToPlanter(dt, gameState, ctx);
        break;
      case "collectPlanter":
        this._stateCollectPlanter(dt, gameState, ctx);
        break;
      case "moveToFlower":
        this._stateMoveToFlower(dt, gameState, ctx);
        break;
      case "collectPollen":
        this._stateCollectPollen(dt, gameState, ctx);
        break;
      case "moveToHiveToConvert":
        this._stateMoveToHive(dt, gameState, ctx, false);
        break;
      case "convertHoney":
        this._stateConvert(dt, gameState, ctx, false);
        break;
      case "moveToHiveToConvertBalloon":
        this._stateMoveToHive(dt, gameState, ctx, true);
        break;
      case "convertBalloon":
        this._stateConvert(dt, gameState, ctx, true);
        break;
      case "moveToSleep":
        this._stateMoveToSleep(dt, gameState, ctx);
        break;
      case "sleep":
        this._stateSleep(dt, gameState, ctx);
        break;
      case "moveToTargetPractice":
        this._stateMoveToTargetPractice(dt, gameState, ctx);
        break;
      case "shootTargetPractice":
        this._stateShootTargetPractice(dt, gameState, ctx);
        break;
      case "moveToTriangulate":
        this._stateMoveToTriangulate(dt, gameState, ctx);
        break;
      case "moveToFetch":
        this._stateMoveToFetch(dt, gameState, ctx);
        break;
    }

    this._runPostSwitchEffects(dt, gameState, ctx);
  }

  // Pulls frequently-accessed references out of gameState once
  _buildContext(gameState) {
    return {
      player: gameState.player,
      objects: gameState.objects,
      fieldInfo: gameState.fieldInfo,
      flowers: gameState.flowers,
      instanceData: gameState.meshes.bees.instanceData,
      textRenderer: gameState.textRenderer,
      TIME: gameState.TIME,
    };
  }

  _runPreSwitchChecks(dt, gameState, { player }) {
    // Trail update
    for (let i in this.trails) {
      this.trails[i].addPos([
        this.pos[0],
        this.pos[1] + this.beeOffsets[i],
        this.pos[2],
      ]);
    }

    // Sleep / energy check
    const nonSleepStates = [
      "sleep",
      "moveToTriangulate",
      "moveToTargetPractice",
      "shootTargetPractice",
      "moveToFetch",
    ];
    if (
      (this.energy <= 0 && !nonSleepStates.includes(this.state)) ||
      (player.hive[this.hiveY][this.hiveX].roboDisabled &&
        this.state !== "sleep")
    ) {
      this.state = "moveToSleep";
    }

    // Aggro check
    const aggroImmune = [
      "sleep",
      "moveToSleep",
      "attack",
      "moveToAttack",
      "moveToTriangulate",
      "moveToTargetPractice",
      "shootTargetPractice",
      "moveToFetch",
    ];
    if (player.attacked.length > 0 && !aggroImmune.includes(this.state)) {
      this.attackMob =
        player.attacked[(Math.random() * player.attacked.length) | 0];
      this.state = "moveToAttack";
      const a = Math.random() * Math.PI * 2;
      this.attackOffset = [Math.cos(a) * 2, Math.sin(a) * 2];
    }

    if (this.fetchBall?.turn) this.state = "moveToFetch";
  }

  _runPostSwitchEffects(dt, gameState, { player, TIME }) {
    const { textRenderer } = gameState;
    if (this.beeInfo?.particles && TIME - this.emitParticle > 0.2) {
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
    // buoyant glow / lightrays...
  }

  _stateMoveToAttack(dt, gameState, { player, instanceData }) {
    if (!this._isValidAttackTarget(player)) {
      this.state = "moveToPlayer";
      return;
    }

    this.moveTo = [
      this.attackMob.pos[0] + this.attackOffset[0],
      this.attackMob.pos[1] + (this.type === "precise" ? 1.25 : 0.25),
      this.attackMob.pos[2] + this.attackOffset[1],
    ];
    this._stepTowards(this.moveTo, dt, player);

    if (vec3.sqrDist(this.moveTo, this.pos) < 0.8) {
      this.state = "attack";
      const a = Math.random() * Math.PI * 2;
      const r = this.type === "precise" ? 5 : 2;
      this.attackOffset = [Math.cos(a) * r, Math.sin(a) * r];
      this.attackTimer =
        (1.25 + Math.random() * 0.5) * (this.type === "precise" ? 1.6 : 1);
    }

    this._pushInstanceData(instanceData, BEE_FLY);
  }

  // A small guard extracted from both attack cases
  _isValidAttackTarget(player) {
    return (
      player.attacked.length > 0 &&
      this.attackMob &&
      (this.attackMob.state === "attack" ||
        this.attackMob instanceof CoconutCrab ||
        this.attackMob instanceof StumpSnail)
    );
  }

  _stateAttack(
    dt,
    gameState,
    { player, objects, fieldInfo, instanceData, TIME },
  ) {
    if (!this._isValidAttackTarget(player)) {
      this.state = "moveToPlayer";
      return;
    }

    this.attackTimer -= dt;

    if (this.attackTimer <= 0) {
      this.energy--;
      this.state = "moveToAttack";
      this.attackMob =
        player.attacked[(Math.random() * player.attacked.length) | 0];
      this._resolveAttackHit(player, objects);
      this._tryFireToken(
        this.attackTokens,
        [Math.round(this.pos[0]), player.pos[1] + 0.5, Math.round(this.pos[2])],
        {
          field: player.fieldIn,
          x: this.flowerCollecting[0],
          z: this.flowerCollecting[1],
          bee: this,
        },
        gameState,
        true,
      );
    }

    this._pushInstanceData(instanceData, TIME * 5);
  }

  _stateMoveToPlayer(
    dt,
    gameState,
    { player, objects, fieldInfo, instanceData },
  ) {
    if (player.fieldIn && player.pollenInBag < player.capacity) {
      if (fieldInfo[player.fieldIn].planter) {
        const p = fieldInfo[player.fieldIn].planter;

        let chance =
          MATH.lerp(0.35, 0.02, objects.bees.length / 50) *
          (this.type === "shy" ? (this.gifted ? 2.5 : 2) : 1);

        if (p.type === "redClay") {
          if (beeInfo[this.type].color === "red") chance *= 1.25;
          else if (beeInfo[this.type].color === "blue") chance = 0;
        }
        if (p.type === "blueClay") {
          if (beeInfo[this.type].color === "blue") chance *= 1.25;
          else if (beeInfo[this.type].color === "red") chance = 0;
        }
        if (p.type === "pesticide" && this.mutation) chance *= 1.3;
        if (p.type === "petal" && beeInfo[this.type].color === "white")
          chance *= 1.5;
        if (p.type === "plenty" && this.gifted) chance *= 1.5;

        if (Math.random() < chance) {
          this.state = "moveToPlanter";
          const t = Math.random() * MATH.TWO_PI;
          this.collectRot = [Math.sin(t), -4, Math.cos(t)];
          return;
        }
      }

      this.state = "moveToFlower";
      return;
    }

    this.moveTo = [
      player.pos[0] + this.moveOffset[0],
      player.pos[1],
      player.pos[2] + this.moveOffset[2],
    ];
    this._stepTowards(this.moveTo, dt, player);

    if (vec3.sqrDist(this.moveTo, this.pos) < 0.8) {
      this.moveOffset = [MATH.random(-5, 5), 0, MATH.random(-5, 5)];
    }

    this._pushInstanceData(instanceData, BEE_FLY);

    if (player.converting && player.pollenInBag) {
      this.state = "moveToHiveToConvert";
    } else if (player.convertingBalloon && player.hiveBalloon.pollen) {
      this.state = "moveToHiveToConvertBalloon";
    }
  }

  // Extracted from the middle of _stateAttack to reduce nesting
  _resolveAttackHit(player, objects) {
    if (Math.random() < (this.attackMob.blocking ? 0.85 : 0)) {
      this.energy--;
      // CHQ: show BLOCK text

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

      return;
    }
    const hitChance =
      this.type === "precise"
        ? Math.max(
            Math.pow(
              2,
              (this.gifted ? 2 : 1) + this.level - this.attackMob.level,
            ),
            0.05,
          )
        : Math.pow(2, this.level - this.attackMob.level);

    if (Math.random() < hitChance) {
      const h =
        (this.attack + player[beeInfo[this.type].color + "BeeAttack"]) *
        player.beeAttack *
        (this.type === "precise" ? (this.gifted ? 2 : 1.5) : 1) *
        (this.type === "buoyant" ? player.buoyantBeeAttack : 1);
      this.attackMob.damage(h);
      // CHQ: spawn explosion for precise
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
      // CHQ: show MISS text
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

  // The two convert-hive states share this, distinguished by the `balloon` flag
  _stateMoveToHive(dt, gameState, { player, instanceData }, balloon) {
    const pollen = balloon ? player.hiveBalloon.pollen : player.pollenInBag;
    const converting = balloon ? player.convertingBalloon : player.converting;
    if (!converting || !pollen) {
      this.state = "moveToPlayer";
      return;
    }

    this.moveTo = this.hivePos.slice();
    this._stepTowards(this.moveTo, dt, player);

    if (vec3.sqrDist(this.moveTo, this.pos) < 0.8) {
      this.pos = this.hivePos.slice();
      this.state = balloon ? "convertBalloon" : "convertHoney";
      this.convertTimer = this.convertSpeed;
      this._takePollen(player, balloon);
    }

    this._pushInstanceData(instanceData, BEE_FLY);
  }

  _stateConvert(dt, gameState, { player, instanceData, TIME }, balloon) {
    const converting = balloon ? player.convertingBalloon : player.converting;
    if (!converting) {
      if (balloon) player.hiveBalloon.pollen += this.pollen;
      else player.pollenInBag += this.pollen;
      this.pollen = 0;
      this.state = "moveToPlayer";
      return;
    }
    // ... rest of convert logic, then _emitConvertParticles()
  }
  // CHQ: implement _stateMoveToPlanter, refactored by ChatGPT
  _stateMoveToPlanter(
    dt,
    gameState,
    { player, objects, fieldInfo, instanceData },
  ) {
    if (
      !player.fieldIn ||
      player.pollenInBag >= player.capacity ||
      !fieldInfo[player.fieldIn].planter
    ) {
      this.state = "moveToPlayer";
      return;
    }

    const p = fieldInfo[player.fieldIn].planter;

    this.moveTo = [
      p.pos[0],
      p.pos[1] + p.height + p.displaySize + 0.2,
      p.pos[2],
    ];

    this._stepTowards(this.moveTo, dt, player);

    if (vec3.sqrDist(this.moveTo, this.pos) < 0.075) {
      this.state = "collectPlanter";
      this.collectTimer =
        this.gatherSpeed *
        (this.type === "spicy" ? 1 / player.flameHeatStackApplied : 1);
      this.planterSipTime = this.collectTimer;
      return;
    }

    this._pushInstanceData(instanceData, BEE_FLY);
  }

  // CHQ: implement _stateCollectPlanter, refactored by ChatGPT
  _stateCollectPlanter(
    dt,
    gameState,
    { player, objects, fieldInfo, instanceData },
  ) {
    const field = fieldInfo[player.fieldIn];

    if (
      !player.fieldIn ||
      player.pollenInBag >= player.capacity ||
      !field.planter
    ) {
      this.state = "moveToPlayer";
      return;
    }

    this.collectTimer -= dt;

    if (this.collectTimer <= 0) {
      this.energy--;
      field.planter.beeSipped(this);

      this._tryFireToken(
        this.gatheringTokens,
        [Math.round(this.pos[0]), field.y + 1, Math.round(this.pos[2])],
        {
          field: player.fieldIn,
          x: field.x | 0,
          z: field.z | 0,
          bee: this,
        },
        gameState,
      );

      this.state = "moveToFlower";
    }

    this._pushInstanceData(instanceData, BEE_COLLECT, this.collectRot);
  }

  // CHQ: implement _stateMoveToFlower, refactored by ChatGPT
  // CHQ: ChatGPT destructured flowers
  _stateMoveToFlower(
    dt,
    gameState,
    { player, fieldInfo, flowers, instanceData },
  ) {
    if (!player.fieldIn || player.pollenInBag >= player.capacity) {
      this.state = "moveToPlayer";
      return;
    }

    const field = fieldInfo[player.fieldIn];

    while (
      this.flowerCollecting[0] === undefined ||
      this.flowerCollecting[1] === undefined ||
      this.flowerCollecting[0] < 0 ||
      this.flowerCollecting[0] >= field.width ||
      this.flowerCollecting[1] < 0 ||
      this.flowerCollecting[1] >= field.length
    ) {
      this.flowerCollecting[0] =
        player.flowerIn.x + Math.round(MATH.random(-7, 7));
      this.flowerCollecting[1] =
        player.flowerIn.z + Math.round(MATH.random(-7, 7));
      const t = Math.random() * MATH.TWO_PI;
      this.collectRot = [Math.sin(t), -4, Math.cos(t)];
    }

    // CHQ: ChatGPT cached flower tile
    const flower =
      flowers[player.fieldIn][this.flowerCollecting[1]][
        this.flowerCollecting[0]
      ];

    this.moveTo = [
      field.x + this.flowerCollecting[0],
      field.y + flower.height * 0.5 + 0.25,
      field.z + this.flowerCollecting[1],
    ];
    this._stepTowards(this.moveTo, dt, player);

    if (vec3.sqrDist(this.moveTo, this.pos) < 0.075) {
      this.state = "collectPollen";
      this.collectTimer =
        this.gatherSpeed *
        (this.type === "spicy" ? 1 / player.flameHeatStackApplied : 1);
      return;
    }

    this._pushInstanceData(instanceData, BEE_FLY);
  }

  // CHQ: implemented by Claude AI (Haiku)
  _stateCollectPollen(
    dt,
    gameState,
    { player, fieldInfo, flowers, instanceData },
  ) {
    if (!player.fieldIn || player.pollenInBag >= player.capacity) {
      this.state = "moveToPlayer";
      return;
    }

    this.collectTimer -= dt;

    if (this.collectTimer <= 0) {
      this.energy--;
      const tabbyMult = this.type === "tabby" ? player.tabbyLoveStacks : 1;
      const colorMult =
        beeInfo[this.type].color === "red" ||
        beeInfo[this.type].color === "blue"
          ? 1.2
          : 1;

      const field = fieldInfo[player.fieldIn];
      if (!field) {
        this.state = "moveToPlayer";
        return;
      }

      collectPollen({
        x: this.flowerCollecting[0],
        z: this.flowerCollecting[1],
        pattern: [[0, 0]],
        amount: this.gatherAmount,
        yOffset: MATH.random(POLLEN_Y_MIN, POLLEN_Y_MAX),
        multiplier: {
          r:
            player.pollenFromBees *
            (beeInfo[this.type].color === "red" ? colorMult : 1) *
            tabbyMult,
          b:
            player.pollenFromBees *
            (beeInfo[this.type].color === "blue" ? colorMult : 1) *
            tabbyMult,
          w: player.pollenFromBees * tabbyMult,
        },
      });

      if (beeInfo[this.type].gatheringPassive) {
        beeInfo[this.type].gatheringPassive(this);
      }

      this._tryFireToken(
        this.gatheringTokens,
        [
          Math.round(this.pos[0]),
          field.y + POLLEN_SPAWN_HEIGHT_OFFSET,
          Math.round(this.pos[2]),
        ],
        {
          field: player.fieldIn,
          x: this.flowerCollecting[0],
          z: this.flowerCollecting[1],
          bee: this,
        },
        gameState,
      );

      this.flowerCollecting = [];
      this.state = "moveToPlayer";
    }

    this._pushInstanceData(instanceData, BEE_COLLECT, this.collectRot);
  }

  // CHQ: Claude AI (Sonnet) Provided the implementation
  _stateMoveToSleep(dt, gameState, { player, instanceData }) {
    this.moveTo = this.hivePos.slice();
    this._stepTowards(this.moveTo, dt, player);

    if (vec3.sqrDist(this.moveTo, this.pos) < 1) {
      this.pos = this.hivePos.slice();
      this.sleepTimer = 20;
      this.zzzTimer = 0;
      this.state = "sleep";
      this.sleepRotate = Math.random() * MATH.TWO_PI;
    }

    this._pushInstanceData(instanceData, BEE_FLY);
  }

  // CHQ: Claude AI (Sonnet) Provided the implementation
  _stateSleep(dt, gameState, { player, instanceData, textRenderer }) {
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

    this._pushInstanceData(instanceData, this.sleepRotate, [0, 1, 0]);
  }

  // CHQ: Claude AI (Sonnet) Provided the implementation
  _stateMoveToTargetPractice(
    dt,
    gameState,
    { player, objects, fieldInfo, instanceData },
  ) {
    if (!player.fieldIn) {
      this.state = "moveToPlayer";
      return;
    }

    this._stepTowards(this.moveTo, dt, player, 1.5);

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
        const _x =
          (fieldInfo[player.fieldIn].width * 0.5 +
            Math.random() *
              this.targetPractice_q[0] *
              fieldInfo[player.fieldIn].width *
              0.5) |
          0;
        const _z =
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

    this._pushInstanceData(instanceData, BEE_FLY);
  }

  // CHQ: Claude AI (Sonnet) Provided the implementation
  _stateShootTargetPractice(dt, gameState, { player, objects, instanceData }) {
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
      this._fireTargetPracticeParticles();
    }

    if (this.targetPracticeTimer <= 0) {
      this.shotParticleProjectile = false;
      this._resolveTargetPracticeRound(gameState, objects, player);
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

    this._pushInstanceData(instanceData, BEE_FLY, this.targetLookDir);
  }

  // CHQ: Claude AI (Sonnet): Extracted helper — the particle-firing block from the middle of shootTargetPractice
  _fireTargetPracticeParticles() {
    this.shotParticleProjectile = true;

    for (let i in this.targets) {
      const vx = this.targets[i].pos[0] - this.pos[0];
      const vy = this.targets[i].pos[1] - this.pos[1];
      const vz = this.targets[i].pos[2] - this.pos[2];
      const d = Math.sqrt(vx * vx + vy * vy + vz * vz);
      const m = d / 0.5 / d;

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

  // CHQ: Claude AI (Sonnet): Extracted helper — the big token/loot resolution block at the end of shootTargetPractice
  _resolveTargetPracticeRound(gameState, objects, player) {
    const t = [
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

      const t2 = this.targets[2];
      objects.tokens.push(
        new Token(
          effects.precision.tokenLife,
          [t2.pos[0], t2.pos[1] + 0.5, t2.pos[2]],
          "precision",
          {
            field: t2.field,
            x: t2.x,
            z: t2.z,
            bee: this,
          },
        ),
      );
      objects.tokens.push(
        new Token(
          effects.focus.tokenLife,
          [t2.pos[0] + 1, t2.pos[1] + 0.5, t2.pos[2]],
          "focus",
          {
            field: t2.field,
            x: t2.x + 1,
            z: t2.z,
            bee: this,
          },
        ),
      );
      objects.tokens.push(
        new Token(
          effects.redBoost.tokenLife,
          [t2.pos[0] - 1, t2.pos[1] + 0.5, t2.pos[2]],
          "redBoost",
          {
            field: t2.field,
            x: t2.x - 1,
            z: t2.z,
            bee: this,
          },
        ),
      );
    }

    if (t[2] && this.gifted && (!t[0] || !t[1])) {
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

    for (let i in this.targets) {
      const _t = this.targets[i];

      if (_t.activated) {
        if (i !== 2) {
          objects.tokens.push(
            new Token(
              effects.focus.tokenLife,
              [_t.pos[0], _t.pos[1] + 0.5, _t.pos[2]],
              "focus",
              {
                field: _t.field,
                x: _t.x,
                z: _t.z,
                bee: this,
              },
            ),
          );
        }

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
            (this.attack + player[beeInfo[this.type].color + "BeeAttack"]) *
            player.beeAttack *
            (this.level * 0.1 + 1) *
            0.5,
          yOffset: 2 + Math.random() * 0.4,
          stackHeight: 0.5 + Math.random() * 0.5,
          instantConversion: (player.flameHeatStack - 1) * 0.5,
          multiplier: player.flameHeatStack * 3,
          field: _t.field,
        });
      } else {
        objects.tokens.push(
          new Token(
            effects.redBoost.tokenLife,
            [_t.pos[0], _t.pos[1] + 0.5, _t.pos[2]],
            "redBoost",
            {
              field: _t.field,
              x: _t.x,
              z: _t.z,
              bee: this,
            },
          ),
        );
      }
    }

    this.targets[0].splice = true;
    this.targets[1].splice = true;
    this.targets[2].splice = true;
  }

  // CHQ: Claude AI (Sonnet) Provided the implementation
  _stateMoveToTriangulate(dt, gameState, { player, instanceData }) {
    this.triangulateTimer -= dt;

    const d = [
      player.pos[0] - this.triangulateTokenPos[0],
      player.pos[2] - this.triangulateTokenPos[2],
    ];
    const rd = [-d[1], d[0]];
    const tb = [this.pos[0] - player.pos[0], this.pos[2] - player.pos[2]];

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

    if (this.triangulateTimer <= 0) this.state = "moveToPlayer";

    this._pushInstanceData(instanceData, BEE_FLY);
  }

  // CHQ: Claude AI (Sonnet) Provided the implementation
  _stateMoveToFetch(dt, gameState, { player, instanceData }) {
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
      const dir = [player.pos[0] - this.pos[0], player.pos[2] - this.pos[2]];
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

    this._pushInstanceData(instanceData, BEE_FLY);
  }
}

export class TempBee extends Bee {
  constructor(pos, type, lvl, lifespan, gifted, gameState) {
    super(pos, type, lvl, gifted, 0, 0, null, gameState);
    this.life = lifespan;
  }

  update(dt, gameState) {
    const isDead = super.update(dt, gameState);
    this.life -= dt;
    return this.life <= 0 || !!isDead;
  }
}

export function spawnBeeAtCamera(gameState, type = "common") {
  const spawnPos = getPositionAheadOfCamera(gameState, 20);

  const origBee = new Bee(spawnPos, "basic", 1, false, 0, 0, null, gameState);
  origBee.circleCenter = [...spawnPos];
  origBee.circleRadius = 5;
  origBee.circleSpeed = 2;
  origBee.circleAngle = 0;
  origBee.circleAxisY = true;
  gameState.objects.bees.push(origBee);
}
