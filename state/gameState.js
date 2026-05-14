// state/gameState.js
import { MATH } from "../utils/math.js";

// CHQ: Gemini AI created function
// Function to strip the "heavy" stuff (buffers, classes) for storage
export function getSaveSnapshot(gameState) {
  return {
    id: gameState.player.id || "player_1",
    // timestamp: Date.now(),
    lastSaved: Date.now(),
    data: {
      name: gameState.player.name,
      honey: gameState.player.honey,
      pollen: gameState.player.pollen,
      capacity: gameState.player.capacity,
      criticalChance: gameState.player.criticalChance,
      criticalPower: gameState.player.criticalPower,
      pos: gameState.player.pos, // Save position so they reload where they stood
      inventory: { ...gameState.player.inventory },
      stats: { ...gameState.player.stats },
      currentGear: { ...gameState.player.currentGear },
      completedQuests: [...gameState.completedQuests],
      // We save activeQuest IDs and their current progress values
      activeQuests: gameState.activeQuests.map((q) => ({
        id: q.id,
        progress: q.progress,
      })),
    },
    player: { ...gameState.player },
    npcProgress: {
      "Brown Bear": gameState.npcs["Brown Bear"].portionsDone,
      "Polar Bear": gameState.npcs["Polar Bear"].portionsDone,
      "Honey Bee": gameState.npcs["Honey Bee"].portionsDone,
    },
    activeQuests: [...gameState.activeQuests],
    completedQuests: [...gameState.completedQuests],
  };
}

export function updateInventory() {}

export function addMessage() {}

export function createInitialState(saveData = {}) {
  // Use saveData values if they exist, otherwise fall back to defaults
  // const data = saveData.data || {};
  const data = (saveData && saveData.data) || {};

  return {
    globalId: 0,
    TIME: 0,
    frameCount: 0,

    // Engine Flags
    flags: {
      UPDATE_FLOWER_MESH: false,
      isNight: false,
    },
    // TIME: 0,
    // isNight: false,
    // flags: {
    //   UPDATE_FLOWER_MESH: false,
    // },

    player: {
      // Identity from IndexedDB
      id: saveData.id,
      name: data.name || "New Explorer",

      // Resources
      honey: data.honey || 0,
      pollen: data.pollen || 0,
      capacity: data.capacity || 100,

      // Combat/Collection Scaling
      criticalChance: data.criticalChance || 0.1,
      criticalPower: data.criticalPower || 2,
      superCritChance: data.superCritChance || 0, // Used in world.js Section 2
      superCritPower: data.superCritPower || 3, // Used in world.js Section 3
      health: 100,

      // Transform/Multipliers (Needed for world.js and bees.js)
      redPollen: data.redPollen || 1,
      bluePollen: data.bluePollen || 1,
      whitePollen: data.whitePollen || 1,
      pollenFromBees: data.pollenFromBees || 1,
      tabbyLoveStacks: data.tabbyLoveStacks || 1,

      // Movement
      pos: data.pos || [0, 5, 0],
      velocity: [0, 0, 0],
      fieldIn: null,

      // IMPORTANT: Stats Alignment
      stats: data.stats || {
        whitePollen: 0, // Matched to questDefinitions
        bluePollen: 0, // Matched to questDefinitions
        redPollen: 0, // Matched to questDefinitions
        totalPollen: 0, // Added for overall progress tracking
        treatsFed: 0, // For Mother Bear style quests
        goo: 0, // Used in world.js Section 8
        honeyTokens: 0,
        // pollenCollected: 0,
        playTime: 0,
        polarPowerStacks: 0,
        werewolf: 0,
      },

      inventory: {
        translators: data.translators || 0,
        spiritPetals: data.spiritPetals || 0,
        cogs: 0, // Cogs usually reset per session
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

      effects: [],
      flowerIn: { x: 0, z: 0 },
    },
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
      targets: [],
      triangulates: [],
      fuzzBombs: [],
      planters: [],
    },
    showTheQuests: false, // Default to hidden

    npcs: {
      "Brown Bear": { portionsDone: 0 },
      "Polar Bear": { portionsDone: 0 },
      "Honey Bee": { portionsDone: 0 },
    },
    savedNPCs: 0,
    meshes: {
      static: { vertexBuffer: null, vertCount: 0 }, // Terrain, buildings
      bees: { instanceBuffer: null, indexCount: 0 },

      // Dynamic Instanced Meshes
      flowers: { instanceBuffer: null, vertCount: 0 }, // Essential for fields
      tokens: { instanceBuffer: null, indexCount: 0 }, // Abilities/Honey dropped
      mobs: { instanceBuffer: null, indexCount: 0 }, // Ladybugs, Rhinos, etc.

      // VFX / Transparent Pass
      particles: { vertexBuffer: null, vertCount: 0 }, // Flames, bubbles, explosions
      marks: { instanceBuffer: null, indexCount: 0 }, // Boost circles on the floor

      // UI / Overlay (if rendering via WebGL)
      text: { vertexBuffer: null, vertCount: 0 }, // Floating numbers/Quest text
    },
    activeQuests: [], // Quests currently in progress
    completedQuests: [], // IDs of finished quests to prevent repeats
    stats: {
      whitePollen: 0,
      bluePollen: 0,
      redPollen: 0,
      totalPollen: 0, // New aggregate stat
      treatsFed: 0,
      pollenFromBees: 0,
      tabbyLoveStacks: 0,
      instantRedConversion: 0,
      // These are used to check quest progress
    },
    user: {
      keys: {},
      clickedKeys: {},
    },
  };
}
