// entities/mobs/StumpSnail.js
import { BossMob } from "./mobs.js";

// CHQ: Claude AI (Haiku): Converted from standalone StumpSnail to an extension of BossMob.

export class StumpSnail extends BossMob {
  constructor(gameState) {
    const field = "StumpField";
    const fieldData = gameState.fieldInfo[field];
    const startPos = [
      fieldData.x + fieldData.width * 0.5 - 19,
      fieldData.y + 0.3,
      fieldData.z + fieldData.length * 0.5,
    ];

    super(
      gameState.globalId++,
      "stumpSnail",
      startPos,
      gameState.player.extraInfo.mob_snail_health || 5000000,
      6,
      gameState,
    );

    this.gameState = gameState;
    this.field = field;
    this.fieldData = fieldData;
    this.central = [
      fieldData.x + fieldData.width * 0.5,
      fieldData.z + fieldData.length * 0.5,
    ];

    this.moveToAngle = 0;
    this.starSawHitTimer = 0;
    this.flameTimer = 0;
    this.waitTimer = 0;
    this.damageTimer = 0;
    this.bodySize = 3;
    this.runningAmount = 0;
    this.mindHacked = 0;

    this.maxHp = 5000000;
    this.respawnDuration = (300 * 60) / gameState.player.monsterRespawnTime;
    this.isBossDefeated = gameState.player.extraInfo.mob_snail > 0;

    if (this.isBossDefeated) {
      this.respawnTimer = gameState.player.extraInfo.mob_snail;
    }

    // Add rotation to position array if needed
    this.pos[3] = 0;
  }

  update(dt, gameState) {
    // Handle respawn countdown
    if (this.respawnTimer > 0) {
      this.respawnTimer -= dt;
      gameState.player.extraInfo.mob_snail = this.respawnTimer;

      this.render(gameState);
      return this.respawnTimer <= 0;
    }

    if (this.hp <= 0) {
      this.die(null, gameState);
      return false; // Still visible during respawn
    }

    // Boss-specific logic
    this._updateMovement(dt, gameState);
    this._updateCombat(dt, gameState);
    this._updateDisplay(gameState);

    return false;
  }

  _updateMovement(dt, gameState) {
    const player = gameState.player;
    const isInZone =
      player.body.position.x > this.fieldData.x - 4 &&
      player.body.position.x < this.fieldData.x + this.fieldData.width + 4 &&
      player.body.position.z > this.fieldData.z - 4 &&
      player.body.position.z < this.fieldData.z + this.fieldData.length + 4;

    const wiggleScalar = this._calculateWiggle();

    if (isInZone) {
      player.attacked.push(this);
      this._moveInCircle(dt, wiggleScalar);
    } else {
      this._moveTowardsCentral(dt, wiggleScalar);
    }
  }

  _calculateWiggle() {
    let wiggleScalar = Math.cos(TIME * 1.5);
    wiggleScalar *= wiggleScalar;
    wiggleScalar *= wiggleScalar;
    return (wiggleScalar * 0.9 + 0.1) * 1.5;
  }

  _moveInCircle(dt, wiggleScalar) {
    const x = -Math.cos(this.moveToAngle) * 9 + this.central[0];
    const z = -Math.sin(this.moveToAngle) * 9 + this.central[1];

    if (Math.abs(this.pos[0] - x) + Math.abs(this.pos[2] - z) < 0.1) {
      this.moveToAngle += dt * 0.1 * wiggleScalar;
      this.pos[0] = x;
      this.pos[2] = z;
      this.pos[3] = this.moveToAngle + Math.PI;
    } else {
      const dir = [x - this.pos[0], z - this.pos[2]];
      vec2.normalize(dir, dir);
      this.pos[0] += dir[0] * dt * wiggleScalar;
      this.pos[2] += dir[1] * dt * wiggleScalar;
      this.pos[3] = Math.atan2(dir[1], dir[0]) - MATH.HALF_PI;
    }
  }

  _moveTowardsCentral(dt, wiggleScalar) {
    if (this.pos[0] > this.central[0] - 19) {
      const dir = [
        this.central[0] - 19 - this.pos[0],
        this.central[1] - this.pos[2],
      ];
      vec2.normalize(dir, dir);
      this.pos[0] += dir[0] * dt * wiggleScalar;
      this.pos[2] += dir[1] * dt * wiggleScalar;
      this.pos[3] = Math.atan2(dir[1], dir[0]) - MATH.HALF_PI;
    }
  }

  _updateCombat(dt, gameState) {
    const player = gameState.player;

    this.mindHacked -= dt;
    this.starSawHitTimer -= dt;
    this.flameTimer -= dt;

    // Flame damage
    if (this.flameTimer <= 0) {
      this.flameTimer = 1;
      for (let f in gameState.objects.flames) {
        if (
          Math.abs(this.pos[0] - gameState.objects.flames[f].pos[0]) +
            Math.abs(this.pos[2] - gameState.objects.flames[f].pos[2]) <
          this.bodySize
        ) {
          this.takeDamage(
            gameState.objects.flames[f].dark ? 25 : 15,
            gameState,
          );
        }
      }
    }

    // Player collision damage
    if (this.mindHacked <= 0) {
      this.damageTimer -= dt;
      if (
        Math.abs(player.body.position.x - this.pos[0]) +
          Math.abs(player.body.position.y - this.pos[1] + 1) +
          Math.abs(player.body.position.z - this.pos[2]) <
          this.bodySize &&
        this.damageTimer <= 0
      ) {
        player.damage(25);
        this.damageTimer = 1.5;
      }
    }

    gameState.player.extraInfo.mob_snail_health = this.hp;
  }

  _updateDisplay(gameState) {
    this.pos[1] += 2.5;

    gameState.textRenderer.addCTX(
      "Stump Snail (Level " + this.lvl + ")",
      [this.pos[0], this.pos[1] + 0.4, this.pos[2]],
      COLORS.whiteArr,
      100,
    );

    // Health bar
    gameState.textRenderer.addDecalRaw(
      this.pos[0],
      this.pos[1],
      this.pos[2],
      0,
      0,
      ...gameState.textRenderer.decalUV["rect"],
      0.6,
      0,
      0,
      2.5,
      0.4,
      0,
    );
    gameState.textRenderer.addDecalRaw(
      this.pos[0],
      this.pos[1],
      this.pos[2],
      (-0.5 + (this.hp / this.maxHp) * 0.5) / (this.hp / this.maxHp),
      0,
      ...gameState.textRenderer.decalUV["rect"],
      0.2,
      0.85,
      0.2,
      (this.hp * 2.5) / this.maxHp,
      0.4,
      0,
    );

    gameState.textRenderer.addSingle(
      "HP: " + MATH.addCommas(this.hp | (0 + "")),
      this.pos,
      COLORS.whiteArr,
      -1,
      false,
      false,
    );

    if (this.mindHacked > 0) {
      gameState.textRenderer.addDecalRaw(
        this.pos[0],
        this.pos[1],
        this.pos[2],
        0,
        0,
        ...gameState.textRenderer.decalUV.smiley,
        0.75,
        0,
        0,
        -2,
        -2,
        0,
      );
    }

    this.pos[1] -= 2.5;
  }

  takeDamage(amount, gameState, critType = 0) {
    let damage = amount;

    if (critType === 2) {
      // Super crit
      damage *=
        gameState.player.superCritPower * gameState.player.criticalPower;
    } else if (critType === 1) {
      // Crit
      damage *= gameState.player.criticalPower;
    }

    if (this.mindHacked > 0) {
      damage *= 1.25;
    }

    this.hp -= damage | 0;

    gameState.textRenderer.add(
      (damage | 0) + "",
      [this.pos[0], this.pos[1] + Math.random() * 2.75 + 3, this.pos[2]],
      [255, 0, 0],
      critType,
      "",
      [0, 1.25, 1.275, 1.3, 1.65, 1.75][Math.min(damage.toString().length, 5)],
    );
  }

  onBossDeath(gameState) {
    const player = gameState.player;

    // Initialize stats if needed
    if (!player.stats) player.stats = {};
    if (player.stats.stumpSnail === undefined) {
      player.stats.stumpSnail = 0;
    }

    const g = Math.min(++player.stats.stumpSnail, 4);

    // Generate amulet with scaling based on kill count
    const amulet = [
      "*" + MATH.random(1.01 + g * 0.01, 1.02 + g * 0.025).toFixed(2) + " goo",
    ];

    const amuletOptions = [
      "*" +
        MATH.random(1.05 + g * 0.08, 1.1 + g * 0.2).toFixed(2) +
        " lootLuck",
      "+" +
        MATH.random(0.02 + g * 0.01, 0.04 + g * 0.015).toFixed(2) +
        " INSTANT_CONVERSION",
      "*" +
        MATH.random(1.01 + g * 0.01, 1.03 + g * 0.015).toFixed(2) +
        " POLLEN",
      "*" +
        MATH.random(1.05 + g * 0.016, 1.09 + g * 0.03).toFixed(2) +
        " pollenFromTools",
      "+" +
        MATH.random(g * 0.01 + 0.02, g * 0.01 + 0.015).toFixed(2) +
        " defense",
      "*" +
        MATH.random(1.01 + g * 0.01, 1.05 + g * 0.015).toFixed(2) +
        " honeyFromTokens",
    ];

    amulet.push(...MATH.selectFromArray(amuletOptions, (g * 0.5 + 2) | 0));

    const amuletTier = ["bronze", "silver", "gold", "diamond", "supreme"][g];
    player.showGeneratedAmulet(amuletTier + "SnailAmulet", amulet);

    // Generate loot drops
    this._generateLootDrops(gameState, g);
  }

  _generateLootDrops(gameState, killCount) {
    const decay = Math.min(killCount * 0.2, 1);
    let loots = "";

    // Build loot string with random quantities based on kill count
    loots += "ticket,".repeat((MATH.random(50, 175) * 0.5 * decay) | 0);
    loots += "glue,".repeat((MATH.random(10, 25) * 0.5 * decay) | 0);
    loots += "gumdrops,".repeat((MATH.random(25, 150) * 0.5 * decay) | 0);
    loots += "starJelly,".repeat((MATH.random(-1, 5) * 0.5 * decay) | 0);
    loots += "glitter,".repeat((MATH.random(-2, 7) * 0.5 * decay) | 0);
    loots += "oil,".repeat((MATH.random(-2, 7) * 0.5 * decay) | 0);
    loots += "enzymes,".repeat((MATH.random(-2, 7) * 0.5 * decay) | 0);
    loots += "magicBeans,".repeat((MATH.random(2, 12) * 0.5 * decay) | 0);

    // Egg rewards scale with kill count
    const eggTable = [
      "silverEgg",
      "goldEgg",
      "",
      "giftedSilverEgg",
      "",
      "diamondEgg",
      "",
      "giftedGoldEgg",
      "",
      "mythicEgg",
      "",
      "giftedDiamondEgg",
      "",
      "",
      "giftedMythicEgg",
      "",
      "",
      "",
      "starEgg",
      "",
    ];

    const eggIndex = Math.min(killCount, eggTable.length - 1);
    if (eggTable[eggIndex]) {
      loots += eggTable[eggIndex];
    }

    // Split into array and remove trailing comma
    const lootArray = loots.substring(0, loots.length - 1).split(",");

    // Spawn loot drops with staggered timing
    for (let i = lootArray.length; i--; ) {
      this._spawnLootToken(gameState, lootArray, i);
    }
  }

  _spawnLootToken(gameState, lootArray, index) {
    const snailRef = this;

    window.setTimeout(function () {
      if (lootArray.length === 0) return;

      // Pick random item from remaining loot
      const randomIndex = (Math.random() * lootArray.length) | 0;
      const lootItem = lootArray[randomIndex];

      // Spawn at random position in field
      const spawnX =
        snailRef.fieldData.x + ((snailRef.fieldData.width * Math.random()) | 0);
      const spawnY = snailRef.fieldData.y + 1;
      const spawnZ =
        snailRef.fieldData.z +
        ((snailRef.fieldData.length * Math.random()) | 0);

      gameState.objects.tokens.push(
        new gameState.LootToken(
          15,
          [spawnX, spawnY, spawnZ, 0],
          lootItem,
          MATH.random(1, 4) | 0,
          true,
          "Stump Snail",
        ),
      );

      // Remove used item from array
      lootArray.splice(randomIndex, 1);
    }, index * 300); // Stagger spawns by 300ms each
  }
}
