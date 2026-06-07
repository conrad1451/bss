// state/gameState.js

// CHQ: Gemini AI refactored file

/**
 * Strips heavy runtime references (like WebGL buffers, arrays of live objects)
 * leaving only raw data fields to cleanly save to IndexedDB or LocalStorage.
 */
export function getSaveSnapshot(gameState) {
  return {
    id: gameState.player.id || "player_1",
    lastSaved: Date.now(),
    data: {
      name: gameState.player.name,
      honey: gameState.player.honey,
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

export function getPollenMultiplier(gameState, type) {
  const base = gameState.player[`${type}Pollen`] || 1;
  const boost = gameState.player.fieldBoosts[type] || 0;
  return base + boost;
}

/**
 * Factory function to instantiate a fresh engine state object.
 * Perfectly populates fields using a saved snapshot data layout if available.
 */
export function createInitialState(saveData = {}) {
  const data = (saveData && saveData.data) || {};

  return {
    globalId: 0,
    paused: false,
    TIME: 0,
    frameCount: 0,

    cameraAngle: 0,

    // 🛠️ Pure physics configuration data for engine/physics.js
    world: {
      gravity: -9.81,
      airResistance: 0.01,
      bounds: { width: 800, height: 600 }, // Used by our canvas renderer bounds check
    },

    // 🛠️ Simple trigger data fields (The logic shifts to the engine update loop)
    triggers: [
      { name: "SunflowerFieldZone", colliding: false, x: 0, z: 0, radius: 15 },
      { name: "BlackBearTalkZone", colliding: false, x: 50, z: -20, radius: 5 },
    ],

    flags: {
      UPDATE_FLOWER_MESH: false,
      isNight: false,
    },

    player: {
      id: saveData.id || "player_1",
      name: data.name || "New Explorer",
      honey: data.honey || 0,
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
      targets: [],
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
      bees: null,
      fields: null,
      world: null,
    },
  };
}
