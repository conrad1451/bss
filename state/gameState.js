// state/gameState.js

export const gameState = {
  // Global Counters
  globalId: 0,
  TIME: 0,
  frameCount: 0,

  // Live Entity Arrays
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

  // World Data
  fieldInfo: {},
  flowers: {
    mesh: null, // This will hold your flower mesh object
    data: {}, // This replaces the global 'flowers' object
  },

  // Player State
  player: {
    honey: 0,
    pollen: 0,
    capacity: 0,
    health: 100,
    fieldIn: null,
    flowerIn: { x: 0, z: 0 },
    stats: {}, // Initialize with the default stats object you defined
    currentGear: {},
    effects: [],
    // ... all other player properties from index.js
  },
};
