// engine/RoboChallengeManager.js

// CHQ: Claude AI (Sonnet) extracted and refactored file

import { EventManager } from "./eventManager.js";
import { MATH } from "../utils/math.js";
import { Mechsquito } from "../entities/mobs/Mechsquito.js";
import { Cogmower } from "../entities/mobs/CogMower.js";
import { CogTurret } from "../entities/mobs/CogTurret.js";

const MOB_CLASSES = { Mechsquito, Cogmower, CogTurret };

// engine/RoboChallengeManager.js

// Tier configs extracted from the bronze/silver/gold/diamond/supreme
// switch cases in the original endRoboChallenge.js. Each entry holds
// the min/max ranges for that tier so the generator logic only has
// to be written once instead of five times.
const AMULET_TIER_CONFIG = {
  bronze: {
    capacityMultiplier: [1.1, 1.2],
    beeAttack: [1.03, 1.05],
    pollenAll: [1.01, 1.05],
    pollenColor: [1.05, 1.1],
    pollenAllChance: 0.25,
    instantConversion: [0.01, 0.03],
    extra: null, // bronze has no flame/bubble/mark roll
  },
  silver: {
    capacityMultiplier: [1.2, 1.3],
    beeAttack: [1.05, 1.08],
    pollenAll: [1.02, 1.06],
    pollenColor: [1.07, 1.15],
    pollenAllChance: 0.25,
    instantConversion: [0.02, 0.03],
    extra: {
      flamePollen: [1.02, 1.06],
      bubblePollen: [1.02, 1.06],
      markDuration: [1.02, 1.06],
    },
  },
  gold: {
    capacityMultiplier: [1.3, 1.4],
    beeAttack: [1.06, 1.1],
    pollenAll: [1.03, 1.07],
    pollenColor: [1.15, 1.2],
    pollenAllChance: 0.25,
    instantConversion: [0.02, 0.05],
    extra: {
      flamePollen: [1.04, 1.08],
      bubblePollen: [1.04, 1.08],
      markDuration: [1.04, 1.08],
    },
  },
  diamond: {
    capacityMultiplier: [1.4, 1.5],
    beeAttack: [1.07, 1.12],
    pollenAll: [1.04, 1.08],
    pollenColor: [1.2, 1.25],
    pollenAllChance: 0.25,
    instantConversion: [0.04, 0.09],
    extra: {
      flamePollen: [1.05, 1.12],
      bubblePollen: [1.05, 1.12],
      markDuration: [1.04, 1.08],
    },
    bonus: {
      nectarMultiplier: 1.05,
      honeyFromTokens: [1.15, 1.35],
      superCritPower: [1.05, 1.11],
      tokenLifespan: [1.1, 1.2],
    },
  },
  supreme: {
    capacityMultiplier: [1.5, 1.6],
    beeAttack: [1.1, 1.15],
    pollenAll: [1.05, 1.1],
    pollenColor: [1.2, 1.3],
    pollenAllChance: 0.25,
    instantConversion: [0.07, 0.13],
    extra: {
      flamePollen: [1.07, 1.15],
      bubblePollen: [1.07, 1.15],
      markDuration: [1.04, 1.08],
    },
    bonus: {
      nectarMultiplier: 1.05,
      honeyFromTokens: [1.35, 1.6],
      superCritPower: [1.08, 1.15],
      tokenLifespan: [1.2, 1.3],
    },
  },
};

const AMULET_TIER_THRESHOLDS = [
  ["supreme", 25],
  ["diamond", 20],
  ["gold", 15],
  ["silver", 10],
  ["bronze", 5],
];

// Same weighted pool used in all four spawn sites in the original
// startRoboChallenge.js: 5x Mechsquito, 4x Cogmower, 3x CogTurret.
const MOB_POOL = [
  "Mechsquito",
  "Mechsquito",
  "Mechsquito",
  "Mechsquito",
  "Mechsquito",
  "Cogmower",
  "Cogmower",
  "Cogmower",
  "Cogmower",
  "CogTurret",
  "CogTurret",
  "CogTurret",
];

// Fields excluded from random field selection in the original code
// (StumpField/AntField/CoconutField aren't valid robo challenge targets).
const EXCLUDED_FIELDS = ["StumpField", "AntField", "CoconutField"];

// Loot table for the random bonus rewards rolled on challenge end.
// Each entry is [itemKey, () => amount]. Mirrors the array passed to
// MATH.selectFromArray in the original endRoboChallenge.js.
function buildBonusLootTable(MATH) {
  return [
    ["starJelly", () => 1],
    ["softWax", () => MATH.random(1, 4) | 0],
    ["hardWax", () => 1],
    ["fieldDice", () => MATH.random(1, 4) | 0],
    ["smoothDice", () => MATH.random(1, 2) | 0],
    ["loadedDice", () => 1],
    ["oil", () => MATH.random(1, 4) | 0],
    ["glue", () => MATH.random(1, 4) | 0],
    ["neonberry", () => MATH.random(1, 4) | 0],
    ["whirligig", () => MATH.random(1, 7) | 0],
    ["honeysuckle", () => MATH.random(1, 15) | 0],
    ["microConverter", () => MATH.random(1, 4) | 0],
    ["jellyBeans", () => MATH.random(1, 6) | 0],
  ];
}

export class RoboChallengeManager {
  constructor() {
    this.isActive = false;
    this.isPlaying = false;
    this.scene = null; // "bee" | "quest" | "upgrade"
    this.round = 0;
    this.timer = 0;

    this.cogsPerRound = 12;
    this.beesPerRound = 2;
    this.beesPicked = 0;
    this.rerollCost = 0;

    this.activeBees = [];
    this.activeUpgrades = [];
    this.quest = [];

    this._mobSpawnIntervalID = undefined;
  }

  // ---- lifecycle -------------------------------------------------

  start(gameState, player, items, upgrades) {
    this.isActive = true;
    this.isPlaying = true;
    this.timer = 1.5 * 60;
    this.gameState = gameState;

    this._applyRoundBuff(player, upgrades);
    this._refreshHiveActiveBees(player);
    this._clearRoboMobs();
    this._spawnQuestMobs();
    this._startMobSpawnInterval();

    EventManager.emit("ROBO_CHALLENGE_STARTED", { round: this.round });
  }

  end(player, items) {
    const rewards = this._rollEndRewards();
    this._grantRewards(player, items, rewards);

    const amuletTier = this._amuletTierForRound(this.round);
    if (amuletTier) {
      const amulet = this._generateAmulet(amuletTier);
      EventManager.emit("ROBO_AMULET_GENERATED", { tier: amuletTier, amulet });
    }

    this._stopMobSpawnInterval();
    this._clearRoboMobs();

    this.isActive = false;
    items.cog.amount = 0;
    EventManager.emit("INVENTORY_CHANGED", {});
  }

  destroy() {
    // safety net for unmount / page nav — same role as clearInterval
    // calls currently duplicated in updateRoboUI and endRoboChallenge
    this._stopMobSpawnInterval();
  }

  // ---- per-frame tick (mirrors FieldManager/EnvManager.update) ---

  update(dt, gameState) {
    if (!this.isActive || !this.isPlaying) return;

    this.gameState = gameState;
    this.timer -= dt;
    if (this.timer <= 0) {
      this.end(gameState.player, gameState.items);
    }
  }

  // ---- scene transitions (replaces updateRoboUI's switch) --------

  advanceScene() {
    // bee -> quest -> upgrade, returns new scene name
    // UI layer listens for ROBO_SCENE_CHANGED and re-renders DOM;
    // manager no longer touches document.getElementById directly
  }

  pickBee(hivePos) {
    /* ... */
  }
  pickQuest(questIndex) {
    /* ... */
  }
  buyUpgrade(upgradeId, cost, items) {
    /* ... */
  }
  reroll(items) {
    /* ... */
  }

  // ---- private helpers ---------------------------------------------
  // de-duplicates the parsing logic copy-pasted between
  // startRoboChallenge and updateRoboUI

  _parseUpgradeStat(statStr) {
    /* the "*1.1 capacityMultiplier" parser */
  }
  _applyRoundBuff(player, upgrades) {
    /* builds & applies effects.roboChallengeBuff */
  }
  _refreshHiveActiveBees(player) {
    /* sets roboDisabled flags + updateHive */
  }
  _clearRoboMobs() {
    /* removes Mechsquito/Cogmower/CogTurret instances */
  }
  // _spawnRandomMob(fieldId, round) {
  //   /* the 4x-duplicated mob pool selection */
  // }

  /**
   * Spawns one mob of a randomly chosen class into objects.mobs.
   *
   * @param {string} fieldId - Target field for the mob.
   * @param {Object} ctx - { MATH, objects, mobClasses: { Mechsquito, Cogmower, CogTurret } }
   * @param {Object} [options]
   * @param {boolean} [options.gateFlagByRound] - If true, the CogTurret/flag
   *   param is gated behind `round > 5` (matches the quest-mob spawn path
   *   in the original, which is stricter than the interval/field-mob paths).
   */
  _spawnRandomMob(fieldId, options = {}) {
    const className = this._pickMobClass();
    const MobClass = MOB_CLASSES[className];
    const level = (this.round * MATH.random(0.5, 0.6) + 1) | 0;

    let flagOrTier;
    if (className === "CogTurret") {
      flagOrTier = MATH.random(0, 4) | 0;
    } else if (options.gateFlagByRound) {
      flagOrTier = this.round > 5 ? Math.random() < 0.8 : 0;
    } else {
      flagOrTier = Math.random() < 0.8;
    }

    this.gameState.objects.mobs.push(
      new MobClass(this.gameState, fieldId, level, flagOrTier),
    );
  }
  _spawnQuestMobs() {
    const fieldInfo = this.gameState.fieldInfo;
    for (const q of this.quest) {
      const isFromQuest = q[0].indexOf("From") > -1;
      const count = isFromQuest ? MATH.random(0, 3) | 0 : MATH.random(1, 4) | 0;

      for (let i = 0; i < count; i++) {
        const fieldId = isFromQuest
          ? q[0].replace("pollenFrom", "")
          : this._pickRandomField(fieldInfo);

        this._spawnRandomMob(fieldId, { gateFlagByRound: isFromQuest });
      }
    }
  }

  /* single owner of setInterval */
  _startMobSpawnInterval() {
    const fieldInfo = this.gameState.fieldInfo;
    this._mobSpawnIntervalID = window.setInterval(() => {
      if (Math.random() < 0.5) return;

      let fieldId = this.gameState.player.fieldIn;
      if (!fieldId) {
        if (Math.random() < 0.8) return;
        fieldId = this._pickRandomField(fieldInfo);
      }

      this._spawnRandomMob(fieldId, ctx);
    }, 20000);
  }

  /* single owner of clearInterval */
  _stopMobSpawnInterval() {
    if (this._mobSpawnIntervalID !== undefined) {
      window.clearInterval(this._mobSpawnIntervalID);
      this._mobSpawnIntervalID = undefined;
    }
  }

  /**
   * Builds the full reward list for the end of a robo challenge run:
   * honey scaled to round^5, a guaranteed random drive, a handful of
   * bonus items, and round-gated rare drops. Replaces the inline `arr`
   * construction at the top of the original endRoboChallenge.js.
   *
   * @returns {[string, number][]} list of [itemKey, amount] pairs
   *   ("honey" is included as a pseudo-item key, handled specially by
   *   _grantRewards).
   */
  _rollEndRewards() {
    const round = this.round;
    const rewards = [];

    // Honey scales steeply with round (round^5 * 25 + base 10000)
    rewards.push(["honey", round ** 5 * 25 + 10000]);

    // Guaranteed drive drop; glitchedDrive only unlocks at round 10+
    const drivePool = ["redDrive", "blueDrive", "whiteDrive"];
    if (round >= 10) drivePool.push("glitchedDrive");
    const drive = drivePool[(Math.random() * drivePool.length) | 0];
    rewards.push([drive, 1]);

    // Bonus loot, count scales with round (capped at 3)
    const lootTable = buildBonusLootTable(MATH);
    const bonusCount = Math.min(round / 6, 3) | 0;
    const selected = MATH.selectFromArray(lootTable, bonusCount);
    for (const [itemKey, rollAmount] of selected) {
      rewards.push([itemKey, rollAmount()]);
    }

    // Round-gated rare drops
    if (round > 11 && Math.random() < 0.25) rewards.push(["purplePotion", 1]);
    if (round > 14) rewards.push(["atomicTreat", 1]);
    if (round > 17 && Math.random() < 0.2) rewards.push(["superSmoothie", 1]);

    return rewards;
  }

  /**
   * Applies rolled rewards to player/items and emits a message per item,
   * matching the original loop's honey-vs-item branching and addMessage calls.
   */
  _grantRewards(player, items, rewards) {
    for (const [itemKey, amount] of rewards) {
      if (itemKey === "honey") {
        player.honey += amount;
      } else {
        items[itemKey].amount += amount;
      }

      EventManager.emit("ROBO_REWARD_GRANTED", {
        itemKey,
        amount,
        message: `+${MATH.addCommas(String(amount))} ${MATH.doGrammar(itemKey)} (from Robo Challenge)`,
      });
    }
  }

  /**
   * Picks a random mob class name from the weighted pool.
   * Replaces the four duplicated `m[(Math.random()*m.length)|0]` blocks.
   */
  _pickMobClass() {
    return MOB_POOL[(Math.random() * MOB_POOL.length) | 0];
  }

  /**
   * Picks a random valid field id, excluding fields the robo challenge
   * never spawns into. Used by the quest-mob and interval-mob spawn paths
   * when no specific field is targeted.
   */
  _pickRandomField(fieldInfo) {
    const candidates = Object.keys(fieldInfo).filter(
      (id) => !EXCLUDED_FIELDS.includes(id),
    );
    return candidates[(Math.random() * candidates.length) | 0];
  }

  /**
   * Determines the amulet tier earned for a given round, or null if
   * the round didn't reach the minimum threshold (round 5 / bronze).
   * Mirrors the cascading if-statements at the top of the original
   * tier-selection block in endRoboChallenge.js, but stops at the
   * first (highest) threshold met instead of falling through all of them.
   */
  _amuletTierForRound(round) {
    for (const [tier, minRound] of AMULET_TIER_THRESHOLDS) {
      if (round >= minRound) return tier;
    }
    return null;
  }

  /**
   * Builds the amulet stat-line array for a given tier, e.g.
   * ["*1.23 capacityMultiplier", "*1.04 beeAttack", "+0.02 instantRedConversion", ...]
   * Replaces the five duplicated switch-case bodies in endRoboChallenge.js
   * with one data-driven pass over AMULET_TIER_CONFIG.
   */
  _generateAmulet(tier) {
    const cfg = AMULET_TIER_CONFIG[tier];
    if (!cfg) return [];

    const amulet = [];
    const roll = ([min, max]) => MATH.random(min, max).toFixed(2);

    // capacity + attack are always present, same in every tier
    amulet.push(`*${roll(cfg.capacityMultiplier)} capacityMultiplier`);
    amulet.push(`*${roll(cfg.beeAttack)} beeAttack`);

    // either a flat POLLEN multiplier, or a random colored pollen multiplier
    if (Math.random() < cfg.pollenAllChance) {
      amulet.push(`*${roll(cfg.pollenAll)} POLLEN`);
    } else {
      const color = ["red", "blue", "white"][(Math.random() * 3) | 0];
      amulet.push(`*${roll(cfg.pollenColor)} ${color}Pollen`);
    }

    // one of the three instant-conversion stats, picked at random
    const conversionType =
      Math.random() < 0.333
        ? "instantRedConversion"
        : Math.random() < 0.5
          ? "instantWhiteConversion"
          : "instantBlueConversion";
    amulet.push(`+${roll(cfg.instantConversion)} ${conversionType}`);

    // silver and up: an extra flame/bubble/mark roll
    if (cfg.extra) {
      const extraStat =
        Math.random() < 0.333
          ? "flamePollen"
          : Math.random() < 0.5
            ? "bubblePollen"
            : "markDuration";
      amulet.push(`*${roll(cfg.extra[extraStat])} ${extraStat}`);
    }

    // diamond and supreme: a bonus nectar/honey or crit/lifespan roll
    if (cfg.bonus) {
      if (Math.random() < 0.5) {
        if (Math.random() < 0.5) {
          amulet.push(`*${cfg.bonus.nectarMultiplier} nectarMultiplier`);
        } else {
          amulet.push(`*${roll(cfg.bonus.honeyFromTokens)} honeyFromTokens`);
        }
      } else {
        if (Math.random() < 0.5) {
          amulet.push(`*${roll(cfg.bonus.superCritPower)} superCritPower`);
        } else {
          amulet.push(`*${roll(cfg.bonus.tokenLifespan)} tokenLifespan`);
        }
      }
    }

    return amulet;
  }
}
