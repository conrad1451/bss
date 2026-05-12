// state/gameState.js
import { MATH } from "../utils/math.js";

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

      currentGear: d.currentGear || {
        collector: "Pouch",
        boots: "none",
        hat: "none",
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
