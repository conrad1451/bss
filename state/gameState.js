// state/gameState.js
import { MATH } from "../utils/math.js";

export function createInitialState(saveData = {}) {
  // Use saveData values if they exist, otherwise fall back to defaults
  const data = saveData.data || {};

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
    meshes: {
      static: { vertexBuffer: null, vertCount: 0 },
      bees: { instanceBuffer: null, indexCount: 0 },
      // ... other mesh containers
    },
  };
}
