// engine/RoboChallengeManager.js

// CHQ: Claude AI (Sonnet) extracted and refactored file

import { EventManager } from "./eventManager.js";
import { MATH } from "../utils/math.js";

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

  start(player, items, upgrades) {
    this.isActive = true;
    this.isPlaying = true;
    this.timer = 1.5 * 60;

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
  _spawnRandomMob(fieldId, round) {
    /* the 4x-duplicated mob pool selection */
  }
  _spawnQuestMobs() {
    /* loops out.roboChallenge.quest, calls _spawnRandomMob */
  }
  _startMobSpawnInterval() {
    /* single owner of setInterval */
  }
  _stopMobSpawnInterval() {
    /* single owner of clearInterval */
  }
  _rollEndRewards() {
    /* the honey/drive/loot array building */
  }
  _grantRewards(player, items, rewards) {
    /* applies + addMessage per item */
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
  _generateAmulet(tier, MATH) {
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
