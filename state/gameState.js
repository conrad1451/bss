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
  };
}

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

      // Loaded Progress
      honey: data.honey || 0,
      pollen: data.pollen || 0,
      capacity: data.capacity || 100,
      health: 100,

      pos: data.pos || [0, 5, 0],
      velocity: [0, 0, 0],

      inventory: {
        translators: data.translators || 0,
        spiritPetals: data.spiritPetals || 0,
        cogs: 0, // Cogs usually reset per session
      },
      stats: data.stats || {
        honeyTokens: 0,
        pollenCollected: 0,
        playTime: 0,
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
      fieldIn: null,
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
      whitePollenCollected: 0,
      treatsFed: 0,
      // These are used to check quest progress
    },
    user: {
      keys: {},
      clickedKeys: {},
    },
  };
}
