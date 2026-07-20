// engine/RoboChallengeManager.js

// CHQ: Claude AI (Sonnet) extracted and refactored file

import { EventManager } from "./eventManager.js";
import { MATH } from "../utils/math.js";
import { Mechsquito } from "../entities/mobs/Mechsquito.js";
import { Cogmower } from "../entities/mobs/CogMower.js";
import { CogTurret } from "../entities/mobs/CogTurret.js";

import { beeInfo } from "../data/bees.js";

const MOB_CLASSES = { Mechsquito, Cogmower, CogTurret };

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

// Field-type quest pool. Mirrors the `types` array built inline in the
// original updateRoboUI's 'quest' scene case. Round-gated extras
// (pollenFromMountainTopField/pollenFromPepperPatch) are appended by
// _buildQuestTypePool() rather than hardcoded here.
const QUEST_TYPE_POOL = [
  "pollen",
  "pollen",
  "pollen",
  "pollen",
  "pollen",
  "pollen",
  "pollen",
  "redPollen",
  "whitePollen",
  "bluePollen",
  "redPollen",
  "whitePollen",
  "bluePollen",
  "pollenFromSunflowerField",
  "pollenFromDandelionField",
  "pollenFromMushroomField",
  "pollenFromBlueFlowerField",
  "pollenFromCloverField",
  "pollenFromSpiderField",
  "pollenFromStrawberryField",
  "pollenFromBambooField",
  "pollenFromPineapplePatch",
  "pollenFromCactusField",
  "pollenFromPumpkinPatch",
  "pollenFromPineTreeForest",
  "pollenFromRoseField",
];

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
    this.questCompleted = false;
    this.scene = null; // "bee" | "quest" | "upgrade"
    this.round = 0;
    this.timer = 0;

    this.cogsPerRound = 12;
    this.beesPerRound = 2;
    this.beesPicked = 0;
    this.rerollCost = 0;

    this.score = 0;

    this.activeBees = [];
    this.activeUpgrades = [];
    this.quest = [];

    this._mobSpawnIntervalID = undefined;
  }

  // ---- lifecycle -------------------------------------------------

  // CHQ: Claude AI (Sonnet) generated private helper for resetting
  // robochallenge gamestate upon ending or starting a game
  _resetRunState() {
    this.round = 0;
    this.activeBees = [];
    this.activeUpgrades = [];
    this.quest = [];
    this.rerollCost = 0;
    this.beesPicked = 0;
    this.scene = null;
    this.questCompleted = false;
    this.cogsPerRound = 12;
    this.beesPerRound = 2;
  }

  // CHQ: I set this.questCompleted to false and zeroed out round, score,
  // activeBees, activeUpgrades, quest, rerollCost, beesPicked, and scene
  start(gameState, player, items, upgrades) {
    this._resetRunState();

    this.isActive = true;
    this.isPlaying = true;
    this.timer = 1.5 * 60;
    this.gameState = gameState;
    this.score = 0;

    // this.questCompleted = false;
    // this.round = 0;
    // this.activeBees = [];
    // this.activeUpgrades = [];
    // this.quest = [];
    // this.rerollCost = 0;
    // this.beesPicked = 0;
    // this.scene = null; // "bee" | "quest" | "upgrade"
    this._applyRoundBuff(player, upgrades);
    this._refreshHiveActiveBees(player);
    this._clearRoboMobs();
    this._spawnQuestMobs();
    this._startMobSpawnInterval();

    EventManager.emit("ROBO_CHALLENGE_STARTED", { round: this.round });
  }

  // CHQ: Claude AI (Sonnet) implemented helper function
  advanceRound(player, items, upgrades) {
    this.questCompleted = false;
    this.round++;
    this.beesPicked = 0;
    this.scene = "bee";
    this.quest = [];

    items.cog.amount += this.cogsPerRound;

    this._removeRoundBuff(player);
    this._applyRoundBuff(player, upgrades);

    this._generateBeeChoices(player);

    EventManager.emit("ROBO_ROUND_ADVANCED", { round: this.round });
  }

  end(player, items) {
    EventManager.emit("ROBO_CHALLENGE_MESSAGE", {
      text: `The Robo Challenge is over! Your score is ${this.score}!`,
      color: [0, 150, 0],
    });

    const rewards = this._rollEndRewards();
    this._grantRewards(player, items, rewards);

    const amuletTier = this._amuletTierForRound(this.round);
    if (amuletTier) {
      const amulet = this._generateAmulet(amuletTier);
      const amuletType = `${amuletTier}CogAmulet`; // CHQ: Claude AI (Sonnet) - matches showGeneratedAmulet's 'Cog' substring check

      EventManager.emit("ROBO_AMULET_GENERATED", {
        tier: amuletTier,
        amulet,
        type: amuletType,
      });
      player.showGeneratedAmulet(amuletType, amulet);
    }

    this._removeRoundBuff(player);
    this._stopMobSpawnInterval();
    this._clearRoboMobs();

    this.isActive = false;
    items.cog.amount = 0;
    this._resetRunState();

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
    if (!this.questCompleted) this.timer -= dt;

    if (this.timer <= 0) {
      this.end(gameState.player, gameState.items);
    }
  }

  // ---- scene transitions (replaces updateRoboUI's switch) --------

  // CHQ: Gemini AI implemented helper method
  advanceScene() {
    if (!this.isActive) return null;

    let nextScene = null;

    switch (this.scene) {
      case "bee":
        if (this.beesPicked < this.beesPerRound) {
          this.beesPicked = this.beesPerRound;
        }
        this._generateQuestChoices();
        nextScene = "quest";
        break;

      case "quest":
        // Fallback safety matching legacy automatic choice routing
        if (this.quest.length === 0 && this.questChoices?.[0]) {
          this.pickQuest(0, this.gameState);
          return this.scene;
        }
        nextScene = "upgrade";
        break;

      case "upgrade":
        this.scene = null;
        this.isPlaying = true;
        this.timer = 90;
        nextScene = "playing";
        this._startMobSpawnInterval(); // Ensure mob spawning resumes when playing starts
        break;

      default:
        this.beesPicked = 0;
        this._generateBeeChoices(this.gameState?.player || {});
        nextScene = "bee";
        break;
    }

    if (nextScene && nextScene !== "playing") {
      this.scene = nextScene;
    }

    EventManager.emit("ROBO_SCENE_CHANGED", {
      scene: this.scene || "playing",
      round: this.round,
      timer: this.timer,
      cogs: this.gameState?.items?.cog?.amount || 0,
    });

    return this.scene || "playing";
  }

  // CHQ: Gemini AI refactored helper method
  /**
   * Rerolls the current choice set for whichever scene is active
   * (bee/quest/upgrade), charging rerollCost cogs and incrementing it by
   * 1 afterward. Replaces window.rerollInRoboBearChallenge:
   *   items.cog.amount-=rerollCost; rerollCost+=1; updateRoboUI()
   *
   * @param {Object} items - Live items map (needs items.cog.amount).
   * @param {Object} player - The live player instance.
   * @param {Object} upgrades - Upgrade definitions map, passed through so
   *   choices can be regenerated after a reroll.
   */
  reroll(items, configUpgrades) {
    if (items.cog.amount < this.rerollCost) {
      EventManager.emit("ROBO_MESSAGE", {
        text: "Not enough Cogs!",
        color: [255, 0, 0],
      });
      return false;
    }

    items.cog.amount -= this.rerollCost;
    this.rerollCost += 1;

    // Regeneration routes matching original index.js mutations
    switch (this.scene) {
      case "bee":
        this._generateBeeChoices(this.gameState?.player || {});
        break;
      case "quest":
        this._generateQuestChoices();
        break;
      case "upgrade":
        this._generateUpgradeChoices(configUpgrades);
        break;
    }

    EventManager.emit("INVENTORY_CHANGED", {});
    EventManager.emit("ROBO_REROLLED", {
      scene: this.scene,
      rerollCost: this.rerollCost,
      cogs: items.cog.amount,
    });
    return true;
  }

  // CHQ: Claude AI (Sonnet) generated
  /**
   * Builds up to 3 bee choices from the player's hive, excluding bees
   * already picked into activeBees this run. Mirrors the beesToSelect
   * collection + 3-random-choice loop in updateRoboUI's 'bee' scene case.
   *
   * If the hive has no eligible bees left, emits an empty choice list so
   * the UI can show the "skip" affordance instead (matches the original's
   * `document.getElementById('roboSkipBeePage').style.display='block'`
   * fallback when beesToSelect.length<=0).
   *
   * @param {Object} player - The live player instance (needs player.hive).
   */
  _generateBeeChoices(player) {
    const hive = player.hive || [];
    const activeKey =
      "#" + this.activeBees.map((b) => b.join(",")).join("#") + "#";

    const eligible = [];
    for (let y = 0; y < hive.length; y++) {
      for (let x = 0; x < hive[y].length; x++) {
        const slot = hive[y][x];
        if (slot.type !== null && activeKey.indexOf(`#${x},${y}#`) < 0) {
          eligible.push([x, y]);
        }
      }
    }

    const choices = [];
    const pool = eligible.slice();
    // for (let i = 0; i < 3 && pool.length; i++) {
    //   const idx = (Math.random() * pool.length) | 0;
    //   choices.push(pool[idx]);
    //   pool.splice(idx, 1);
    // }

    // CHQ: Gemini AI refactored loop
    for (let i = 0; i < 3; i++) {
      if (pool.length <= 0) break;
      const idx = (Math.random() * pool.length) | 0;
      const coords = pool[idx];
      const rawSlot = hive[coords[1]][coords[0]];
      const b = rawSlot.bee;

      // Bundle all complex metadata calculations out of the rendering pipeline
      let desc = `Level: ${b.level}`;
      if (b.gifted) desc += "<br>⭐ Gifted ⭐";
      if (b.mutation)
        desc += `<br>☢️ ${b.mutation.oper.replace("*", "x")}${b.mutation.num} ${MATH.doGrammar(b.mutation.stat)} ☢️`;
      if (rawSlot.beequip)
        desc += `<br>Beequip: ${MATH.doGrammar(rawSlot.beequip.type)}`;

      choices.push({
        coords,
        type: b.type,
        gifted: b.gifted,
        color: beeInfo[b.type].color, // e.g. 'red', 'blue', 'white'
        name: `${MATH.doGrammar(b.type)} Bee`,
        description: desc,
      });
      pool.splice(idx, 1);
    }

    // CHQ: Gemini AI: Assemble payload containing live profiles for active visualization
    const currentlyActiveProfiles = this.activeBees.map((coords) => {
      const b = hive[coords[1]][coords[0]].bee;
      return { type: b.type, gifted: b.gifted };
    });
    this.beeChoices = choices;

    // CHQ: Gemini AI refactored
    EventManager.emit("ROBO_BEE_CHOICES", {
      choices: choices,
      activeProfiles: currentlyActiveProfiles,
      beesPicked: this.beesPicked,
      beesPerRound: this.beesPerRound,
      canSkip: choices.length === 0,
    });
    // EventManager.emit("ROBO_BEE_CHOICES", {
    //   choices,
    //   beesPicked: this.beesPicked,
    //   beesPerRound: this.beesPerRound,
    //   canSkip: choices.length === 0,
    // });
  }

  // CHQ: Claude AI (Sonnet) generated, Gemini AI refactored
  /**
   * Advances to the next stage of scene setup once bee-picking for this
   * round is done: either offers another bee choice, or (once
   * beesPicked >= beesPerRound) transitions to the 'quest' scene and
   * generates quest choices. Replaces the recursive
   * `out.updateRoboUI()` call at the top of the original's 'bee' case
   * (`if(beesPicked>=beesPerRound){ scene='quest'; updateRoboUI(); return }`).
   */
  // _advanceBeeScene(player) {
  //   if (this.beesPicked >= this.beesPerRound) {
  //     this.scene = "quest";
  //     this._generateQuestChoices();
  //     return;
  //   }

  //   this._generateBeeChoices(player);
  // }

  _advanceBeeScene(player) {
    if (this.beesPicked >= this.beesPerRound) {
      this.advanceScene(); // Let advanceScene handle the quest initialization & transition
    } else {
      this._generateBeeChoices(player);
    }
  }

  // CHQ: Claude AI (Sonnet) generated
  /**
   * Commits to picking one hive bee into activeBees for this round.
   * Replaces the per-choice onclick handler in updateRoboUI's 'bee' case:
   *   activeBees.push([x,y]); beesPicked++; updateRoboUI()
   *
   * @param {[number, number]} hivePos - [x, y] hive coordinates of the
   *   chosen bee, as produced by _generateBeeChoices.
   * @param {Object} player - The live player instance.
   */
  pickBee(hivePos, player) {
    this.activeBees.push([Number(hivePos[0]), Number(hivePos[1])]);
    this.beesPicked++;

    EventManager.emit("ROBO_BEE_PICKED", {
      hivePos,
      beesPicked: this.beesPicked,
      beesPerRound: this.beesPerRound,
    });

    this._advanceBeeScene(player);
  }

  // CHQ: Claude AI (Sonnet) generated
  /**
   * Skips remaining bee picks for this round (used when the hive has no
   * more eligible bees, or the player just doesn't want to pick more).
   * Replaces window.roboSkipBeePage:
   *   beesPicked = beesPerRound; updateRoboUI()
   */
  skipBeeSelection(player) {
    this.beesPicked = this.beesPerRound;
    this._advanceBeeScene(player);
  }

  // CHQ: Claude AI (Sonnet) created
  /**
   * Builds the quest-type pool for the current round, appending the
   * round-gated field types the original only unlocked past round 5/10.
   */
  _buildQuestTypePool() {
    const pool = QUEST_TYPE_POOL.slice();
    if (this.round > 5) pool.push("pollenFromMountainTopField");
    if (this.round > 10) pool.push("pollenFromPepperPatch");
    return pool;
  }

  // CHQ: Claude AI (Sonnet) created
  /**
   * Rolls the target amount for a single quest requirement. Ported as
   * literally as possible from the original inline formula in
   * updateRoboUI's 'quest' scene case — this is tuning-sensitive game
   * balance math, not something to "clean up" by guessing at intent.
   *
   * @param {string} type - Stat/pollen-type key this requirement targets.
   * @param {number} reCount - Total number of requirements in this quest
   *   (used to scale amount down as a quest asks for more things at once).
   */
  _rollQuestAmount(type, reCount) {
    let am = this.round * 0.0125;
    am = 30000000000 * am * am * am * am * am;

    am *= MATH.random(1 / 1.1, 1.1) - (reCount - 1) * 0.2;

    if (type.indexOf("From") > -1) am *= MATH.random(0.15, 0.4);
    if (type === "pollen") am *= 1.25;

    if (this.round > 5) am *= 1.25;
    if (this.round > 10) am *= 1.3;
    if (this.round > 15) am *= 1.5;
    if (this.round > 20) am *= 1.65;
    if (this.round > 25) am *= 1.75;

    am = (((am * 0.0001) | 0) + 1) * 500;

    return am;
  }

  // CHQ: Claude AI (Sonnet) created
  /**
   * Builds one quest candidate: 1-3 randomly chosen, non-repeating stat
   * types from the pool, each with a rolled target amount, sorted by
   * amount descending (matches the original's q.sort((b,a)=>a[1]-b[1])).
   *
   * @returns {[string, number][]} list of [type, amount] pairs.
   */
  _generateQuestChoice() {
    const pool = this._buildQuestTypePool();
    const picked = [];

    for (let i = 0, count = MATH.random(1, 4) | 0; i < count; i++) {
      const idx = (Math.random() * pool.length) | 0;
      picked.push(pool[idx]);
      pool.splice(idx, 1);
    }

    const quest = picked.map((type) => [
      type,
      this._rollQuestAmount(type, picked.length),
    ]);

    quest.sort((a, b) => b[1] - a[1]);

    return quest;
  }

  // CHQ: Claude AI (Sonnet) created
  /**
   * Generates the two quest candidates the player picks between and
   * stashes them on `this.questChoices` for pickQuest() to consume.
   * Replaces the two-quest generation block at the top of updateRoboUI's
   * 'quest' scene case. The UI layer should listen for ROBO_QUEST_CHOICES
   * to render the "Quest A" / "Quest B" panels.
   */
  _generateQuestChoices() {
    this.questChoices = [
      this._generateQuestChoice(),
      this._generateQuestChoice(),
    ];

    EventManager.emit("ROBO_QUEST_CHOICES", {
      choices: this.questChoices,
    });
  }

  // CHQ: Claude AI (Sonnet) created
  /**
   * Commits to one of the two generated quest choices, records each
   * requirement's baseline stat value (so progress can be measured as
   * "current - baseline" the way the original's q[j][2]=out.stats[...]
   * did), advances the scene to 'upgrade', and spawns this round's quest
   * mobs. Replaces the quest-choice onclick handler in updateRoboUI.
   *
   * @param {number} questIndex - 0 for Quest A, 1 for Quest B.
   */
  pickQuest(questIndex, upgrades) {
    if (!this.questChoices) {
      // Defensive: shouldn't normally happen if the scene flow calls
      // _generateQuestChoices() before offering a pick, but guards
      // against pickQuest() being called out of order.
      this._generateQuestChoices();
    }

    const selected = this.questChoices[questIndex];
    if (!selected) return;

    const stats = this.gameState?.player?.stats || {};

    // Record baseline stat value per requirement, mirroring the original's
    // q[j][2] = out.stats[q[j][0]] assignment.
    this.quest = selected.map(([type, amount]) => [
      type,
      amount,
      stats[type] || 0,
    ]);

    this.questChoices = null;
    this.scene = "upgrade";

    this._spawnQuestMobs();
    this._generateUpgradeChoices(upgrades);

    EventManager.emit("ROBO_QUEST_PICKED", {
      questIndex,
      quest: this.quest,
    });
  }

  /**
   * Rolls the cog cost for a single upgrade offer. Ported directly from
   * the inline cost formula in updateRoboUI's 'upgrade' scene case:
   *   costs.push(((MATH.random(3,7)+{common:0,rare:2,epic:5,legendary:9}[rarity])
   *     /((maxStacks-1)*0.1+1.25))|0)
   *
   * @param {{rarity: string, maxStacks: number}} upgradeDef
   */
  _rollUpgradeCost(upgradeDef) {
    const rarityBonus = { common: 0, rare: 2, epic: 5, legendary: 9 }[
      upgradeDef.rarity
    ];
    return (
      ((MATH.random(3, 7) + rarityBonus) /
        ((upgradeDef.maxStacks - 1) * 0.1 + 1.25)) |
      0
    );
  }

  /**
   * Builds up to 3 upgrade choices, excluding any upgrade already at its
   * maxStacks cap. Mirrors the `u`/`c`/`costs` selection loop in
   * updateRoboUI's 'upgrade' scene case.
   *
   * @param {Object} upgrades - Upgrade definitions map (name -> {stats, rarity, maxStacks}).
   */
  _generateUpgradeChoices(upgrades) {
    const stacks = this._upgradeStackCounts();

    const eligible = Object.keys(upgrades).filter(
      (name) => (stacks[name] || 0) < upgrades[name].maxStacks,
    );

    const choices = [];
    const costs = [];
    const pool = eligible.slice();

    for (let i = 0, count = Math.min(3, pool.length); i < count; i++) {
      const idx = (Math.random() * pool.length) | 0;
      const name = pool[idx];

      choices.push(name);

      // CHQ: Gemini AI: Ported directly from old index.js inline equation
      const baseObj = upgrades[name];
      const cost = this._rollUpgradeCost(baseObj);

      costs.push(cost);

      pool.splice(idx, 1);
    }

    this.upgradeChoices = choices;
    this.upgradeChoiceCosts = costs;

    EventManager.emit("ROBO_UPGRADE_CHOICES", {
      choices,
      costs,
      activeUpgrades: this.activeUpgrades.slice(),
    });
  }

  /**
   * Tallies how many stacks of each upgrade are currently active.
   * Extracted from the duplicated upgradeStacks-building loop that
   * appeared in both startRoboChallenge and updateRoboUI.
   */
  _upgradeStackCounts() {
    const stacks = {};
    for (const name of this.activeUpgrades) {
      stacks[name] = (stacks[name] || 0) + 1;
    }
    return stacks;
  }

  /**
   * Purchases one of the currently offered upgrade choices, spending cogs
   * and stacking the upgrade into activeUpgrades. Replaces the
   * roboUpgradeChoice[i].onclick handler in updateRoboUI's 'upgrade' case:
   *   activeUpgrades.push(c[i-1]); items.cog.amount-=costs[i-1]
   *
   * @param {string} upgradeId - Upgrade name, must be one of this.upgradeChoices.
   * @param {number} cost - Expected cog cost (validated against the roll
   *   stored in upgradeChoiceCosts to guard against stale/mismatched calls).
   * @param {Object} items - Live items map (needs items.cog.amount).
   * @param {Object} upgrades - Upgrade definitions map, passed through so
   *   choices can be regenerated after a purchase.
   */
  // buyUpgrade(upgradeId, cost, items, upgrades) {
  buyUpgrade(upgradeId, items, upgrades) {
    const choiceIdx = this.upgradeChoices?.indexOf(upgradeId) ?? -1;
    if (choiceIdx === -1) return false;

    const actualCost = this.upgradeChoiceCosts[choiceIdx];
    if (items.cog.amount < actualCost) {
      EventManager.emit("ROBO_MESSAGE", {
        text: "Not enough Cogs!",
        color: [255, 0, 0],
      });
      return false;
    }

    items.cog.amount -= actualCost;
    this.activeUpgrades.push(upgradeId);

    EventManager.emit("ROBO_UPGRADE_PURCHASED", {
      upgradeId,
      cost: actualCost,
      activeUpgrades: this.activeUpgrades.slice(),
    });

    this._generateUpgradeChoices(upgrades);

    return true;
  }

  /**
   * Rerolls the current choice set for whichever scene is active
   * (bee/quest/upgrade), charging rerollCost cogs and incrementing it by
   * 1 afterward. Replaces window.rerollInRoboBearChallenge:
   *   items.cog.amount-=rerollCost; rerollCost+=1; updateRoboUI()
   *
   * @param {Object} items - Live items map (needs items.cog.amount).
   * @param {Object} player - The live player instance.
   * @param {Object} upgrades - Upgrade definitions map, passed through so
   *   choices can be regenerated after a reroll.
   */
  oldreroll(items, player, upgrades) {
    if (items.cog.amount < this.rerollCost) {
      EventManager.emit("ROBO_MESSAGE", {
        text: "Not enough Cogs!",
        color: [255, 0, 0],
      });
      return false;
    }

    items.cog.amount -= this.rerollCost;
    this.rerollCost += 1;

    switch (this.scene) {
      case "bee":
        this._generateBeeChoices(player);
        break;
      case "quest":
        this._generateQuestChoices();
        break;
      case "upgrade":
        this._generateUpgradeChoices(upgrades);
        break;
    }

    EventManager.emit("ROBO_REROLLED", {
      scene: this.scene,
      rerollCost: this.rerollCost,
    });

    return true;
  }

  // ---- private helpers ---------------------------------------------
  // de-duplicates the parsing logic copy-pasted between
  // startRoboChallenge and updateRoboUI

  /**
   * Parses a single upgrade stat token (e.g. "*1.25 pollenFromBees",
   * "+3 cogsPerRound", "-20% criticalPower") into a structured mod.
   * Replaces the inline substring/indexOf parsing duplicated across
   * startRoboChallenge.js and updateRoboUI.js in the original.
   *
   * @param {string} statStr - A single comma-split stat token.
   * @returns {{op: string, stat: string, value: number, isConversion: boolean, isPerRound: boolean}}
   */
  _parseUpgradeStat(statStr) {
    const spaceIdx = statStr.indexOf(" ");
    const percentIdx = statStr.indexOf("%");
    const numEnd = percentIdx > -1 ? percentIdx : spaceIdx;

    const op = statStr[0]; // '*' | '+' | '-'
    const rawNum = Number(statStr.substring(1, numEnd));
    const stat = statStr.substring(spaceIdx + 1);
    const isPercent = percentIdx > -1;

    return {
      op,
      stat,
      value: isPercent ? rawNum * 0.01 : rawNum,
      isConversion: stat.indexOf("Conversion") > -1,
      isPerRound: stat.indexOf("PerRound") > -1,
    };
  }

  /**
   * Applies a list of parsed stat mods directly onto player, mirroring the
   * semantics of the original's generated `ef` string:
   *   - "Conversion" stats always go through MATH.applyPercentage
   *   - everything else applies op (* + -) directly
   */
  _applyStatMods(player, mods) {
    for (const { op, stat, value, isConversion } of mods) {
      if (isConversion) {
        player[stat] = MATH.applyPercentage(player[stat], value);
        continue;
      }

      if (op === "*") player[stat] *= value;
      else if (op === "+") player[stat] += value;
      else if (op === "-") player[stat] -= value;
    }
  }

  /**
   * Builds the round-buff tooltip message. Replaces the original's
   * JSON.stringify(...).replaceAll(...) string-mangling with a plain
   * line-builder producing the same "Robo Challenge / xN capacity / ...
   * ------Upgrades------ / Name (xStacks)" shape.
   */
  _buildRoundBuffMessage(amp, upgradeStacks) {
    const lines = [
      "Robo Challenge",
      `x${amp} capacity`,
      `x${amp} pollen from tools`,
      `x${amp} pollen from coconuts`,
      `x${amp} movement collection`,
      "x1.65 walkspeed",
    ];

    const upgradeNames = Object.keys(upgradeStacks);
    if (upgradeNames.length) {
      lines.push("", "------Upgrades------", "");
      for (const name of upgradeNames) {
        lines.push(`${name} (x${upgradeStacks[name]})`);
      }
    }

    return lines.join("\n");
  }

  /**
   * Builds and applies effects.roboChallengeBuff for the current round:
   * a base capacity/tools/coconuts/movementCollection debuff scaled by
   * `amp` (harder each round) plus x1.65 walkSpeed, then layers on every
   * stat from the player's active upgrades. Replaces the original's
   * dynamically-generated function string in startRoboChallenge.js.
   *
   * @param {Object} player - The live player instance.
   * @param {Object} upgrades - Upgrade definitions map (name -> {stats, rarity, maxStacks}).
   */
  _applyRoundBuff(player, upgrades) {
    const amp = Math.max(0.1, 0.6 - this.round * 0.1);

    const baseMods = [
      {
        op: "*",
        stat: "capacity",
        value: amp,
        isConversion: false,
        isPerRound: false,
      },
      {
        op: "*",
        stat: "pollenFromTools",
        value: amp,
        isConversion: false,
        isPerRound: false,
      },
      {
        op: "*",
        stat: "pollenFromCoconuts",
        value: amp,
        isConversion: false,
        isPerRound: false,
      },
      {
        op: "*",
        stat: "movementCollection",
        value: amp,
        isConversion: false,
        isPerRound: false,
      },
      {
        op: "*",
        stat: "walkSpeed",
        value: 1.65,
        isConversion: false,
        isPerRound: false,
      },
    ];

    const upgradeStacks = {};
    const upgradeMods = [];

    for (const upgradeName of this.activeUpgrades) {
      upgradeStacks[upgradeName] = (upgradeStacks[upgradeName] || 0) + 1;

      const statTokens = upgrades[upgradeName].stats.split(",");

      for (const token of statTokens) {
        const parsed = this._parseUpgradeStat(token);
        upgradeMods.push(parsed);

        if (parsed.isPerRound) {
          // e.g. "+3 cogsPerRound" bumps this round's cogs/bees payout.
          // NOTE: the original also wrote the same value onto
          // player.<stat> (a stray property nothing else in the
          // codebase reads) — skipped here as incidental noise, not
          // a real effect.
          this[parsed.stat] = (this[parsed.stat] || 0) + parsed.value;
        }
      }
    }

    this._applyStatMods(player, baseMods);
    this._applyStatMods(
      player,
      upgradeMods.filter((m) => !m.isPerRound),
    );

    const message = this._buildRoundBuffMessage(amp, upgradeStacks);

    // TODO: the original stored this as a persistent effects.roboChallengeBuff
    // entry with an `update` closure that reapplied these mods every tick and
    // a `getMessage` closure for the hover tooltip. The current player model
    // (state/gameState.js) only has a flat `effects: []` array with no
    // addEffect/getMessage wiring yet, so mods are applied once, up front,
    // rather than persistently reapplied each frame. Revisit once
    // player.addEffect exists in the new architecture.
    if (typeof player.addEffect === "function") {
      player.addEffect("roboChallengeBuff");
    } else {
      player.effects = player.effects || [];
      player.effects.push({ type: "roboChallengeBuff", message });
    }

    EventManager.emit("ROBO_BUFF_APPLIED", { amp, upgradeStacks, message });
  }

  /**
   * Removes the roboChallengeBuff effect on challenge end. Replaces the
   * splice-out-effects loop at the bottom of the original endRoboChallenge.js.
   */
  _removeRoundBuff(player) {
    if (!player.effects) return;

    const idx = player.effects.findIndex(
      (e) => e === "roboChallengeBuff" || e?.type === "roboChallengeBuff",
    );
    if (idx > -1) player.effects.splice(idx, 1);
  }

  // CHQ: Claude AI (Sonnet) implemented helper function
  /**
   * Marks hive cells not in activeBees as roboDisabled, and repositions
   * any non-disabled bees to the player's current position.
   *
   * NOTE: deliberately does NOT call the legacy updateHive() (see
   * stubbedOldIndex.js) — that function wipes and recreates every Bee
   * instance and physics body from scratch, which would destroy the very
   * bee objects we're trying to reposition here, and has nothing to do
   * with roboDisabled anyway. Once player.hive/objects.bees are backed by
   * a proper update path in this codebase, wire that in instead of this
   * comment.
   *
   * @param {Object} player - The live player instance.
   */
  _refreshHiveActiveBees(player) {
    const activeBeeSet = new Set(this.activeBees.map(([x, y]) => `${x},${y}`));

    for (const y in player.hive) {
      for (const x in player.hive[y]) {
        const cell = player.hive[y][x];
        cell.roboDisabled = !activeBeeSet.has(`${x},${y}`);
      }
    }

    const bees = this.gameState?.objects?.bees || [];
    const playerPos = player.body?.position;

    if (playerPos) {
      for (const bee of bees) {
        const cell = player.hive[bee.hiveY]?.[bee.hiveX];
        if (cell && !cell.roboDisabled) {
          bee.pos[0] = playerPos.x;
          bee.pos[1] = playerPos.y;
          bee.pos[2] = playerPos.z;
        }
      }
    }

    EventManager.emit("ROBO_HIVE_REFRESHED", {
      activeBees: this.activeBees.slice(),
    });
  }

  // CHQ: Claude AI (Sonnet) implemented method
  /**
   * Removes all currently-spawned Robo Challenge mobs (Mechsquito, Cogmower,
   * CogTurret) from the world. Mirrors the original endRoboChallenge.js loop:
   *
   *   for(let i=objects.mobs.length;i--;)
   *     if(objects.mobs[i] instanceof Mechsquito||Cogmower||CogTurret)
   *       objects.mobs[i].die(i)
   *
   * NOTE: per this codebase's convention (see updateEngine.js's mob loop and
   * the comment in BugMob.js), Mob.die() does NOT splice itself out of
   * objects.mobs — the caller is responsible for splicing after die() runs.
   * The original inline loop never spliced either (a pre-existing bug/quirk
   * in the old code — dead mobs stayed in the array), but doing it correctly
   * here is cheap and avoids leaking dead Mechsquito/Cogmower/CogTurret
   * instances into future frames, so the splice is added rather than
   * reproduced faithfully.
   */
  _clearRoboMobs() {
    const mobs = this.gameState?.objects?.mobs;
    if (!mobs) return;

    for (let i = mobs.length; i--; ) {
      const mob = mobs[i];

      if (
        mob instanceof Mechsquito ||
        mob instanceof Cogmower ||
        mob instanceof CogTurret
      ) {
        mob.die(i, this.gameState);
        mobs.splice(i, 1);
      }
    }
  }

  /**
   * Spawns one mob of a randomly chosen class into objects.mobs.
   *
   * @param {string} fieldId - Target field for the mob.
   *
   * @param {Object} [options]
   * @param {boolean} [options.gateFlagByRound] - If true, the CogTurret/flag
   *   param is gated behind `round > 5` (matches the quest-mob spawn path
   *   in the original, which is stricter than the interval/field-mob paths).
   */
  _spawnRandomMob(fieldId, MATH, mobClasses, options = {}) {
    const className = this._pickMobClass();
    const MobClass = mobClasses[className];
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

        this._spawnRandomMob(fieldId, MATH, MOB_CLASSES, {
          gateFlagByRound: isFromQuest,
        });
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

      this._spawnRandomMob(fieldId, MATH, MOB_CLASSES);
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
