// engine/AntChallengeManager.js

// CHQ: Claude AI (Sonnet) extracted and refactored file
// Drafted from updateAntChallenge.js + endAntChallenge.js, mirroring the
// structure/conventions established in RoboChallengeManager.js.
//
// NOTE: No startAntChallenge.js source was available, so start() below is a
// best-guess stub built from the fields actually read in updateAntChallenge.js
// and endAntChallenge.js (timer, spawnDelay, lawnMowerTimer, round, pollenReq,
// pollenBeforeReq, score). Replace with real init logic if/when that source
// turns up.
//
// Also NOTE: neither original file shows where `score` is incremented — that
// presumably happens wherever ant kills are resolved (mob death handler?).
// Left as a TODO here; AntChallengeManager just reads/uses the value.

import { EventManager } from "./eventManager.js";

// Tier configs extracted from the cascading if-statements in the original
// endAntChallenge.js (score >= 25/50/100/150 -> silver/gold/diamond/supreme).
// `g` (tier index 0-4) drives the formulas, so we keep that pattern rather
// than flattening it into literal min/max pairs like RoboChallengeManager's
// AMULET_TIER_CONFIG does -- the Ant version's rolls are genuinely formulaic
// in g, not per-tier hardcoded ranges.
const AMULET_TIER_THRESHOLDS = [
  ["supreme", 150],
  ["diamond", 100],
  ["gold", 50],
  ["silver", 25],
  ["bronze", 0],
];

const AMULET_TIER_INDEX = ["bronze", "silver", "gold", "diamond", "supreme"];

// Ant spawn-pattern grid: each entry is a set of [x, z] normalized positions
// (0..1) used as formation layouts when a new round's wave spawns.
// Lifted verbatim from the `_p` array in updateAntChallenge.js.
const SPAWN_PATTERNS = [
  [
    [0.2, 0.25],
    [0.8, 0.25],
    [0.2, 0.75],
    [0.8, 0.75],
  ],
  [
    [0.25, 0.5],
    [0.5, 0.5],
    [0.75, 0.5],
  ],
  [
    [0.2, 0.2],
    [0.2, 0.8],
    [0.8, 0.2],
    [0.8, 0.8],
    [0.5, 0.5],
  ],
  [
    [0.5, 0.25],
    [0.25, 0.5],
    [0.5, 0.75],
    [0.75, 0.5],
  ],
  [
    [0.5, 0.333],
    [0.333, 0.666],
    [0.666, 0.666],
  ],
  [
    [0.5, 0.666],
    [0.333, 0.333],
    [0.666, 0.333],
  ],
  [
    [0.1, 0.1],
    [0.9, 0.9],
  ],
  [
    [0.9, 0.1],
    [0.1, 0.9],
  ],
];

// Weighted ant-type pool used when populating a spawn pattern.
// Mirrors the `t` array in updateAntChallenge.js.
const ANT_TYPE_POOL = [
  "ant",
  "ant",
  "ant",
  "ant",
  "ant",
  "armyAnt",
  "armyAnt",
  "armyAnt",
  "fireAnt",
  "fireAnt",
  "flyingAnt",
  "flyingAnt",
  "flyingAnt",
  "giantAnt",
];

// Bonus loot table rolled once at challenge end. Each entry is
// [itemKey, () => amount]. Mirrors the inline array passed to
// MATH.selectFromArray in the original endAntChallenge.js.
function buildBonusLootTable(MATH, score) {
  return [
    ["roboPass", () => 1],
    ["treat", () => score + 15],
    ["atomicTreat", () => 1],
    ["strawberry", () => score * 0.15 + 1],
    ["blueberry", () => score * 0.15 + 1],
    ["sunflowerSeed", () => score * 0.15 + 3],
    ["pineapple", () => score * 0.15 + 5],
    ["jellyBeans", () => (Math.sqrt(score * 1.25) * 0.2 + 1) | 0],
  ];
}

export class AntChallengeManager {
  constructor() {
    this.isActive = false;

    this.round = 0;
    this.timer = 0;
    this.spawnDelay = 0;
    this.lawnMowerTimer = 0;

    this.pollenReq = 0;
    this.pollenBeforeReq = 0;

    // TODO: confirm where this actually increments (ant-kill handler?).
    this.score = 0;
  }

  // ---- lifecycle -------------------------------------------------

  /**
   * Starts a new Ant Challenge run.
   *
   * STUB: original startAntChallenge.js source was not available. Values
   * below are reasonable defaults inferred from the fields updateAntChallenge.js
   * and endAntChallenge.js actually read. Replace with real init logic.
   */
  start(player, items, gameState) {
    this.isActive = true;

    this.round = 0;
    this.timer = 3 * 60; // guess: 3 minute run, mirrors Robo's 1.5*60 scale
    this.spawnDelay = 0;
    this.lawnMowerTimer = 15;

    this.pollenReq = 300; // guess: first-round requirement
    this.pollenBeforeReq = gameState?.stats?.pollenFromAntField || 0;

    this.score = 0;

    EventManager.emit("ANT_CHALLENGE_STARTED", { round: this.round });
  }

  end(player, items, gameState, MATH) {
    EventManager.emit("ANT_CHALLENGE_MESSAGE", {
      text: `The Ant Challenge is over! Your score is ${this.score}!`,
      color: [35, 75, 255],
    });

    const rewards = this._rollEndRewards(MATH);
    this._grantRewards(player, items, rewards, MATH);

    const amuletTier = this._amuletTierForScore(this.score);
    const amulet = this._generateAmulet(amuletTier, MATH);
    player.showGeneratedAmulet(`${amuletTier}AntAmulet`, amulet);

    this.isActive = false;

    if (gameState?.effects) {
      const idx = gameState.effects.indexOf("antChallenge");
      if (idx > -1) gameState.effects.splice(idx, 1);
    }

    EventManager.emit("ANT_CHALLENGE_ENDED", { score: this.score });
  }

  // ---- per-frame tick (mirrors RoboChallengeManager.update) -------

  update(dt, gameState, ctx) {
    if (!this.isActive) return;

    const { player, objects, textRenderer, MATH, COLORS } = ctx;

    this.timer -= dt;
    this.spawnDelay -= dt;
    this.lawnMowerTimer -= dt;

    if (this.timer <= 0) {
      player.body.position.x = -21;
      player.body.position.y = 6;
      player.body.position.z = -44.5;
      player.yaw = 0;
      this.end(player, ctx.items, gameState, MATH);
      return;
    }

    if (this.lawnMowerTimer <= 0) {
      objects.mobs.push(new ctx.mobClasses.LawnMower(this.round));
      this.lawnMowerTimer = Math.max(-0.33333 * this.round + 15, 2);
    }

    const pollenGained =
      gameState.stats.pollenFromAntField - this.pollenBeforeReq;

    if (pollenGained >= this.pollenReq && this.spawnDelay <= 0) {
      this._advanceRound(objects, ctx.mobClasses.Ant);
    }

    this._renderHud(textRenderer, MATH, COLORS);
  }

  // ---- private helpers ---------------------------------------------

  /**
   * Bumps the round, raises the pollen requirement, and spawns a wave
   * (plus a 25%-chance delayed second wave) of ants in a random formation.
   * Replaces the inline round-advance block in updateAntChallenge.js.
   */
  _advanceRound(objects, AntClass) {
    this.round++;
    this.spawnDelay = 2;
    this.pollenReq += 200 * this.round + 100;

    this._spawnAntWave(objects, AntClass);

    if (Math.random() < 0.25) {
      window.setTimeout(() => {
        this._spawnAntWave(objects, AntClass);
      }, 750);
    }
  }

  /**
   * Spawns one formation's worth of ants at a random layout pattern,
   * each a random type from ANT_TYPE_POOL. Used for both the immediate
   * wave and the delayed second wave on round advance.
   */
  _spawnAntWave(objects, AntClass) {
    const pattern = SPAWN_PATTERNS[(Math.random() * SPAWN_PATTERNS.length) | 0];

    for (const [x, z] of pattern) {
      const type = ANT_TYPE_POOL[(Math.random() * ANT_TYPE_POOL.length) | 0];
      objects.mobs.push(new AntClass(this.round, x, z, type));
    }
  }

  /**
   * Draws the floating HUD text (pollen countdown / spawn-delay countdown,
   * time remaining, round, score). Replaces the inline textRenderer.addSingle
   * calls at the bottom of updateAntChallenge.js.
   */
  _renderHud(textRenderer, MATH, COLORS) {
    if (this.spawnDelay <= 0) {
      const remaining =
        this.pollenReq - (this.gameStatsPollen - this.pollenBeforeReq) ||
        this.pollenReq;
      textRenderer.addSingle(
        MATH.addCommas(String(remaining)),
        [-21, 8, -61],
        COLORS.whiteArr,
        -3,
        false,
        false,
      );
    } else {
      textRenderer.addSingle(
        this.spawnDelay.toFixed(1) + "s",
        [-21, 8, -61],
        COLORS.whiteArr,
        -3,
        false,
        false,
      );
    }

    textRenderer.addSingle(
      "Time: " + MATH.doTime(this.timer),
      [-15, 9, -61],
      COLORS.whiteArr,
      -3,
      false,
      false,
      0,
      0.5,
    );
    textRenderer.addSingle(
      "Round: " + this.round,
      [-15, 9, -61],
      COLORS.whiteArr,
      -3,
      false,
      false,
      0,
      0,
    );
    textRenderer.addSingle(
      "Score: " + this.score,
      [-15, 9, -61],
      COLORS.whiteArr,
      -3,
      false,
      false,
      0,
      -0.5,
    );
  }

  /**
   * Builds the full reward list for the end of an ant challenge run:
   * honey scaled to score^3, a random royal jelly amount, and one
   * randomly selected bonus item. Replaces the inline `arr` construction
   * at the top of endAntChallenge.js.
   *
   * @returns {[string, number][]} list of [itemKey, amount] pairs
   *   ("honey" is a pseudo-item key, handled specially by _grantRewards).
   */
  _rollEndRewards(MATH) {
    const score = this.score;
    const rewards = [];

    rewards.push(["honey", score * score * score * 10 + 10000]);
    rewards.push(["royalJelly", MATH.random(1, score * 0.2 + 2) | 0]);

    const lootTable = buildBonusLootTable(MATH, score);
    const [selected] = MATH.selectFromArray(lootTable, 1);
    rewards.push([selected[0], selected[1]()]);

    return rewards;
  }

  /**
   * Applies rolled rewards to player/items and emits a message per item,
   * matching the original loop's honey-vs-item branching and addMessage calls.
   */
  _grantRewards(player, items, rewards, MATH) {
    for (const [itemKey, amount] of rewards) {
      if (itemKey === "honey") {
        player.honey += amount;
      } else {
        items[itemKey].amount += amount;
      }

      EventManager.emit("ANT_REWARD_GRANTED", {
        itemKey,
        amount,
        message: `+${MATH.addCommas(String(amount))} ${MATH.doGrammar(itemKey)} (from Ant Challenge)`,
      });
    }
  }

  /**
   * Determines the amulet tier earned for a given score. Mirrors the
   * cascading if-statements in endAntChallenge.js, but stops at the
   * first (highest) threshold met instead of falling through all of them.
   */
  _amuletTierForScore(score) {
    for (const [tier, minScore] of AMULET_TIER_THRESHOLDS) {
      if (score >= minScore) return tier;
    }
    return "bronze";
  }

  /**
   * Builds the amulet stat-line array for a given tier, e.g.
   * ["*1.3 capacityMultiplier", "*1.22 convertRate", "*1.07 redPollen", ...]
   * Replaces the inline construction in endAntChallenge.js. The `g` tier
   * index drives the formulaic min/max ranges exactly as in the original
   * (unlike Robo's amulets, Ant's ranges are computed from `g`, not
   * hardcoded per tier, so we keep that pattern here rather than a
   * config table).
   */
  _generateAmulet(tier, MATH) {
    const g = AMULET_TIER_INDEX.indexOf(tier);
    const amulet = [];

    amulet.push(`*1.${g + 1} capacityMultiplier`);
    amulet.push(
      `*${MATH.random(1.05 + g * 0.15, 1.15 + g * 0.15).toFixed(2)} convertRate`,
    );

    const pool = [
      `*${MATH.random(1.03 + g * 0.05, 1.1 + g * 0.05).toFixed(2)} redPollen`,
      `*${MATH.random(1.03 + g * 0.05, 1.1 + g * 0.05).toFixed(2)} whitePollen`,
      `*${MATH.random(1.03 + g * 0.05, 1.1 + g * 0.05).toFixed(2)} bluePollen`,
      `*${MATH.random(1.01 + g * 0.01, 1.03 + g * 0.01).toFixed(2)} POLLEN`,
      `*${MATH.random(1.01, 1.06).toFixed(2)} walkSpeed`,
      `+${MATH.random(0.01 + g * 0.0075, 0.03 + g * 0.0075).toFixed(2)} criticalChance`,
      `*${MATH.random(1.03 + g * 0.05, 1.1 + g * 0.05).toFixed(2)} pollenFromTools`,
      `*${MATH.random(1.03 + g * 0.05, 1.1 + g * 0.05).toFixed(2)} pollenFromBees`,
    ];

    amulet.push(...MATH.selectFromArray(pool, g + 1));

    return amulet;
  }
}
