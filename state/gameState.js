// state/gameState.js

import { TRIGGER_ZONES } from "../data/triggers.js";
import { DEV_TRIGGER_ZONES } from "../data/devTriggers.js";

import { items as itemDefs } from "../data/items.js"; // CHQ: Claude AI (Sonnet) added

// CHQ: Gemini AI refactored file
// CHQ: Claude AI (Sonnet) provided JSDocs

/**
 * Strips heavy runtime references (like WebGL buffers, arrays of live objects)
 * leaving only raw data fields to cleanly save to IndexedDB or LocalStorage.
 *
 * @param {Object} gameState - The full live game state object.
 * @param {Object} gameState.player - The player instance containing stats, inventory, and position.
 * @param {string} [gameState.player.id] - Unique player identifier.
 * @param {string} gameState.player.name - Display name of the player.
 * @param {number} gameState.player.honey - Current honey count.
 * @param {number} gameState.player.hive - Current hive count.
 * @param {number} gameState.player.pollenInBag - Pollen currently held in the bag.
 * @param {number} gameState.player.capacity - Max pollen bag capacity.
 * @param {number} gameState.player.criticalChance - Probability of landing a critical hit.
 * @param {number} gameState.player.criticalPower - Critical hit damage multiplier.
 * @param {number[]} gameState.player.pos - World-space position as [x, y, z].
 * @param {Object} gameState.player.inventory - Consumable item counts.
 * @param {Object} gameState.player.stats - Lifetime stat counters.
 * @param {Object} gameState.player.currentGear - Equipped gear slots.
 * @param {Object} gameState.player.fieldBoosts - Per-field pollen multiplier boosts.
 * @param {Array}  gameState.player.effects - Active status effects array.
 * @param {Object[]} gameState.activeQuests - Currently active quests with id and progress.
 * @param {string[]} gameState.completedQuests - IDs of completed quests.
 * @param {Object} gameState.npcs - NPC state map keyed by NPC name.
 * @returns {{
 *   id: string,
 *   lastSaved: number,
 *   data: Object
 * }} A serialisable snapshot safe to write to IndexedDB or LocalStorage.
 */
export function getSaveSnapshot(gameState) {
  return {
    id: gameState.player.id || "player_1",
    lastSaved: Date.now(),
    data: {
      name: gameState.player.name,
      honey: gameState.player.honey,
      hive: gameState.player.hive.map((row) =>
        row.map((cell) => ({ ...cell })),
      ),
      pollenInBag: gameState.player.pollenInBag,
      capacity: gameState.player.capacity,
      criticalChance: gameState.player.criticalChance,
      criticalPower: gameState.player.criticalPower,
      pos: [...gameState.player.pos],
      inventory: { ...gameState.player.inventory },
      stats: { ...gameState.player.stats },
      currentGear: { ...gameState.player.currentGear },
      fieldBoosts: { ...gameState.player.fieldBoosts },
      effects: [...gameState.player.effects],
      activeQuests: gameState.activeQuests.map((q) => ({
        id: q.id,
        progress: q.progress,
      })),
      completedQuests: [...gameState.completedQuests],
      npcProgress: Object.fromEntries(
        Object.entries(gameState.npcs).map(([name, obj]) => [
          name,
          obj.portionsDone,
        ]),
      ),
    },
  };
}

/**
 * Computes the effective pollen multiplier for a given pollen type,
 * combining the player's base per-type rate with any active field boost.
 *
 * @param {Object} gameState - The live game state object.
 * @param {Object} gameState.player - The player instance.
 * @param {Object} gameState.player.fieldBoosts - Map of pollen-type keys to additive boost values.
 * @param {string} type - The pollen colour key, e.g. `"red"`, `"blue"`, or `"white"`.
 * @returns {number} The combined multiplier (base + field boost), defaulting to 1 if unset.
 */
export function getPollenMultiplier(gameState, type) {
  const base = gameState.player[`${type}Pollen`] || 1;
  const boost = gameState.player.fieldBoosts[type] || 0;
  return base + boost;
}

// CHQ: Claude AI (Sonnet) created function
/**
 * Builds a fresh, per-instance items map from the shared item definitions,
 * so mutating `amount` on one game instance's items never leaks into
 * another instance sharing the same imported module.
 *
 * @param {Object} defs - Item definitions from data/items.js (shared, read-only).
 * @param {Object} [savedAmounts] - Optional saved amount map, keyed by item id.
 * @returns {Object} Per-instance items map.
 */
function buildItemsState(defs, savedAmounts = {}) {
  const out = {};
  for (const key in defs) {
    out[key] = { ...defs[key], amount: savedAmounts[key] || 0 };
  }
  return out;
}

/**
 * Factory function that builds and returns a fresh, fully-populated engine state object.
 * When a saved snapshot is supplied, its `data` block is used to rehydrate persistent
 * fields; all transient runtime arrays and buffers are always reset to empty defaults.
 *
 * @param {Object} [saveData={}] - Optional save snapshot previously produced by {@link getSaveSnapshot}.
 * @param {string} [saveData.id] - Saved player identifier.
 * @param {Object} [saveData.data] - Raw serialised player data fields.
 * @param {string} [saveData.data.name] - Player display name.
 * @param {number} [saveData.data.honey] - Saved honey total.
 * @param {number} [saveData.data.hive] - Saved hive total.
 * @param {number} [saveData.data.pollenInBag] - Saved pollen-in-bag count.
 * @param {number} [saveData.data.capacity] - Saved bag capacity.
 * @param {number} [saveData.data.criticalChance] - Saved critical hit chance.
 * @param {number} [saveData.data.criticalPower] - Saved critical hit multiplier.
 * @param {number} [saveData.data.superCritChance] - Saved super-critical hit chance.
 * @param {number} [saveData.data.superCritPower] - Saved super-critical hit multiplier.
 * @param {number} [saveData.data.redPollen] - Saved red pollen rate.
 * @param {number} [saveData.data.bluePollen] - Saved blue pollen rate.
 * @param {number} [saveData.data.whitePollen] - Saved white pollen rate.
 * @param {number} [saveData.data.pollenFromBees] - Saved bee pollen multiplier.
 * @param {number} [saveData.data.tabbyLoveStacks] - Saved tabby love stack count.
 * @param {number[]} [saveData.data.pos] - Saved world-space spawn position [x, y, z].
 * @param {Object} [saveData.data.stats] - Saved lifetime stat counters.
 * @param {Object} [saveData.data.inventory] - Saved consumable item counts.
 * @param {Object} [saveData.data.currentGear] - Saved equipped gear slots.
 * @param {Object} [saveData.data.fieldBoosts] - Saved per-field pollen boost map.
 * @param {Array}  [saveData.data.effects] - Saved active effects array.
 * @param {Object[]} [saveData.data.activeQuests] - Saved in-progress quest list.
 * @returns {Object} A fully-initialised game state object ready for use by the engine.
 */
export function createInitialState(saveData = {}) {
  const data = (saveData && saveData.data) || {};

  const triggers = testRealm
    ? [...TRIGGER_ZONES, ...DEV_TRIGGER_ZONES]
    : TRIGGER_ZONES;

  return {
    globalId: 0,
    paused: false,
    TIME: 0,
    frameCount: 0,

    // cameraAngle: 0,

    camera: {
      angle: 0,
      pos: null,
    },

    // 🛠️ Pure physics configuration data for engine/physics.js
    world: {
      gravity: -9.81,
      airResistance: 0.01,
      bounds: { width: 800, height: 600 }, // Used by our canvas renderer bounds check
    },

    // 🛠️ Simple trigger data fields (The logic shifts to the engine update loop)
    // triggers: [
    //   { name: "SunflowerFieldZone", colliding: false, x: 0, z: 0, radius: 15 },
    //   { name: "BlackBearTalkZone", colliding: false, x: 50, z: -20, radius: 5 },
    // ],

    // CHQ: Claude AI (Sonnet): shallow clone so colliding state is per-instance
    triggers: triggers.map((t) => ({ ...t })),

    flags: {
      UPDATE_FLOWER_MESH: false,
      isNight: false,
    },

    player: {
      id: saveData.id || "player_1",
      name: data.name || "New Explorer",
      honey: data.honey || 0,
      hive: data.hive || [[]],
      pollenInBag: data.pollenInBag || 0,
      capacity: data.capacity || 100,

      criticalChance: data.criticalChance || 0.1,
      criticalPower: data.criticalPower || 2,
      superCritChance: data.superCritChance || 0,
      superCritPower: data.superCritPower || 3,
      health: 100,

      redPollen: data.redPollen || 1,
      bluePollen: data.bluePollen || 1,
      whitePollen: data.whitePollen || 1,
      pollenFromBees: data.pollenFromBees || 1,
      tabbyLoveStacks: data.tabbyLoveStacks || 1,

      pos: data.pos || [0, 5, 0],
      velocity: [0, 0, 0],
      fieldIn: null,

      // CHQ: Claude AI added yaw and pitch properties
      yaw: 0,
      pitch: 0,

      stats: data.stats || {
        whitePollen: 0,
        bluePollen: 0,
        redPollen: 0,
        totalPollen: 0,
        treatsFed: 0,
        goo: 0,
        honeyTokens: 0,
        playTime: 0,
        polarPowerStacks: 0,
        werewolf: 0,
        pollenFromSunflowerField: 0,
        pollenFromDandelionField: 0,
        pollenFromBambooField: 0,
        pollenFromAntField: 0,
      },

      inventory: {
        translators: data.translators || 0,
        spiritPetals: data.spiritPetals || 0,
        cogs: 0,
      },

      currentGear: data.currentGear || {
        collector: "Pouch",
        boots: "none",
        hat: "none",
      },
      extraInfo: {
        beequipIds: 0,
        enablePollenText: true,
        drives: { red: 0, blue: 0, white: 0, glitched: 0 },
        freeRoboPass: 0,
      },

      fieldBoosts: data.fieldBoosts || {},
      effects: data.effects || [],
      flowerIn: { x: 0, z: 0 },
    },

    flowers: {},
    fieldInfo: {},

    textRenderer: null,

    // Transient environment arrays (Cleared/populated during frame execution)
    objects: {
      tokens: [],
      bees: [],
      tempBees: [],
      explosions: [],
      flames: [],
      bubbles: [],
      marks: [],
      balloons: [],
      mobs: [],
      bears: [], // CHQ: I added so i can see bears on the screen
      targets: [],
      fuzzBombs: [],
      projectiles: [],
      trails: [],
    },
    showTheQuests: false,

    npcs: {
      "Brown Bear": { portionsDone: 0 },
      "Polar Bear": { portionsDone: 0 },
      "Honey Bee": { portionsDone: 0 },
    },

    activeQuests: data.activeQuests || [],
    completedQuests: data.completedQuests || [],

    user: {
      keys: {},
      clickedKeys: {},
    },

    // CHQ: Gemini: Core Mesh Allocation Trackers (Pre-empts frontend structural binding panics)
    meshes: {
      flowers: { vertCount: 0, vertexBuffer: null, indexBuffer: null },
      // bees: null,
      bees: { vertCount: 0, vertexBuffer: null, indexBuffer: null },
      fields: null,
      world: null,
      explosions: 0,
      cylinder_explosions: 0,
    },

    COLORS: {
      blue: "rgb(20,84,186)",
      red: "rgb(255,0,0)",
      white: "rgb(255,255,255)",
      blueArr: [20, 84, 186],
      redArr: [255, 0, 0],
      whiteArr: [255, 255, 255],
      honey: [255, 226, 8],
      honey_normalized: [1, 226 / 255, 8 / 255],
      bondArr: [240, 72, 218],
    },

    statsTick: false, // CHQ: me

    items: buildItemsState(itemDefs, data.items), // CHQ: Claude AI (Sonnet) added
    pages: [],
  };
}
