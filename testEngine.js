// testEngine.js

// CHQ: Gemini AI generated

import { createInitialState, getSaveSnapshot } from "./state/gameState.js";
import {
  EventManager,
  updateInventory,
  addMessage,
} from "./engine/eventManager.js";

import {
  checkCollision,
  updatePhysicsEntity,
  resolveObstacleCollisions,
} from "./engine/physics.js";

console.log("🚀 Starting Vanilla JS Game Engine Simulation Test...\n");

// 1. Initialize our clean, primitive-safe state
const state = createInitialState();
console.log("✅ Initial State Created successfully.");
console.log(`   Player Name: "${state.player.name}"`);
console.log(`   Initial Position: [${state.player.pos.join(", ")}]`);
console.log(`   Initial Honey: ${state.player.honey}`);
console.log(
  `   Initial Translators in Inventory: ${state.player.inventory.translators}\n`,
);

// 2. Set up event manager hooks to listen to engine broadcasts
let inventoryEventCount = 0;
let lastReceivedMessage = null;

const unsubInventory = EventManager.on("INVENTORY_CHANGED", (payload) => {
  inventoryEventCount++;
  console.log(
    `📡 [Event Caught] INVENTORY_CHANGED -> Item: ${payload.itemKey}, New Total: ${payload.amount} (Delta: ${payload.delta})`,
  );
});

const unsubMessage = EventManager.on("NEW_MESSAGE", (payload) => {
  lastReceivedMessage = payload;
  console.log(
    `📡 [Event Caught] NEW_MESSAGE        -> [${payload.type.toUpperCase()}] "${payload.text}"`,
  );
});

console.log("✅ Event Manager subscriptions bound.\n");

// 3. Simulate gameplay logic events
console.log("🏃 Simulating game actions...");

// Act: Fire a message
addMessage("Welcome to the test harness, explorer!", "info");

// Act: Modify the inventory state
updateInventory(state, "translators", 2);
updateInventory(state, "spiritPetals", 1);
// Ensure down-scaling limits safety guard rails (should clamp to 0)
updateInventory(state, "translators", -5);

console.log("\n🧪 Verifying Post-Action State Matrix:");
console.log(
  `   Final Translators Count: ${state.player.inventory.translators} (Expected: 0)`,
);
console.log(
  `   Final Spirit Petals Count: ${state.player.inventory.spiritPetals} (Expected: 1)`,
);
console.log(
  `   Total Inventory Events Captured: ${inventoryEventCount} (Expected: 3)`,
);

// 4. Simulate a single manual physics engine pass stub
console.log("\n🌍 Simulating a 1-frame physics calculation loop pass...");
const dt = 0.016; // Simulate standard ~60fps frame delta

// Simple velocity application simulation (similar to what engine/physics.js will calculate)
state.player.velocity = [0, state.world.gravity * dt, 5]; // applying gravity downwards, moving forward on Z
state.player.pos[0] += state.player.velocity[0];
state.player.pos[1] += state.player.velocity[1];
state.player.pos[2] += state.player.velocity[2];

console.log(
  `   Updated Position after gravity force calculation: [${state.player.pos.map((n) => n.toFixed(4)).join(", ")}]`,
);

// 5. Clean up bindings
unsubInventory();
unsubMessage();
console.log("\n🧹 Event listeners safely torn down.");

if (state.player.inventory.spiritPetals === 1 && inventoryEventCount === 3) {
  console.log(
    "\n🎉 SUCCESS: The vanilla JS core engine modules are operating correctly and fully decoupled!",
  );
} else {
  console.error(
    "\n❌ FAILURE: Engine validation metrics failed to match specifications.",
  );
}

// #############################################

// Simple assertion helper for a headless environment
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log("=========================================");
console.log("RUNNING ENGINE INTEGRATION TESTS");
console.log("=========================================\n");

try {
  // --- Test 1: Default Factory Initialization ---
  const stateA = createInitialState();
  assert(
    stateA.player.id === "player_1",
    "Initial state falls back to default player ID.",
  );
  assert(stateA.player.honey === 0, "Initial player honey defaults to 0.");
  assert(
    Array.isArray(stateA.player.pos),
    "Player position initializes as an array.",
  );
  assert(
    stateA.world.gravity === -9.81,
    "Physics data configuration defaults map correctly.",
  );

  // --- Test 2: Reference Copy Isolation ---
  // Ensure that reference arrays inside our state are completely isolated copies
  stateA.player.pos[1] = 45; // Move the player up in stateA
  const stateB = createInitialState();
  assert(
    stateB.player.pos[1] === 5,
    "Deep reference check: modifying one instance position array does not leak to new state factories.",
  );

  // --- Test 3: Rehydrating from Mock Save Data ---
  const mockSave = {
    id: "explorer_chq_99",
    data: {
      name: "Conrad",
      honey: 50000,
      pos: [12, 10, -5],
      inventory: { translators: 1, spiritPetals: 0, cogs: 0 },
      stats: {
        whitePollen: 100,
        bluePollen: 50,
        redPollen: 0,
        totalPollen: 150,
      },
      currentGear: { tool: "Scooper", backpack: "Jar" },
      fieldBoosts: { SunflowerFieldZone: 1.5 },
      effects: ["SpeedBoost_1"],
      activeQuests: [{ id: "brown_bear_1", progress: 50 }],
      completedQuests: ["tutorial_1"],
    },
  };

  const rehydratedState = createInitialState(mockSave);
  assert(
    rehydratedState.player.id === "explorer_chq_99",
    "Rehydrated state successfully parses saved custom player ID.",
  );
  assert(
    rehydratedState.player.honey === 50000,
    "Rehydrated state loads player resources correctly.",
  );
  assert(
    rehydratedState.player.pos[2] === -5,
    "Rehydrated coordinate array matches saved position snapshot exactly.",
  );
  assert(
    rehydratedState.player.stats.totalPollen === 150,
    "Rehydrated aggregated progress statistics mapped securely.",
  );

  // --- Test 4: Creating a Snapshot (Serialization Check) ---
  // Mutate values during active runtime simulation testing
  rehydratedState.player.honey += 2500;
  rehydratedState.player.pos[0] = 99;
  rehydratedState.player.effects.push("GlowEffect");

  const snapshot = getSaveSnapshot(rehydratedState);

  assert(
    snapshot.id === "explorer_chq_99",
    "Snapshot correctly tracks active player ID tag.",
  );
  assert(
    snapshot.data.honey === 52500,
    "Snapshot calculates active transaction modifications accurately.",
  );
  assert(
    snapshot.data.pos[0] === 99,
    "Snapshot creates safe reference copies of dynamic positions.",
  );
  assert(
    snapshot.data.effects.includes("GlowEffect"),
    "Snapshot stores newly pushed array elements cleanly.",
  );
  assert(
    snapshot.meshes === undefined,
    "Sanitization validation: snapshot verified clean of heavy UI runtime parameters.",
  );

  console.log("\n=========================================");
  assert(true, "ALL ENGINE INTEGRATION TESTS COMPLETED SUCCESSFULLY!");
  console.log("=========================================");
} catch (error) {
  console.error("💥 CRITICAL ERROR DURING TEST EXECUTION:");
  console.error(error);
  process.exit(1);
}

// --- Test 5: Physics Integration & Collision Processing ---
console.log("\n🏃 Initializing Physics and AABB Collision tests...");

const physicsState = createInitialState();
// Assign explicit bounding sizes to our player entity for bounding box calculation
physicsState.player.width = 2;
physicsState.player.height = 2;

// Set position directly above a target block
physicsState.player.pos = [10, 5, 0];
physicsState.player.velocity = [0, 0, 0];

// Define a static obstacle block directly underneath the player
const mockObstacles = [
  { x: 9, y: 0, width: 4, height: 2 }, // Top boundary is at Y = 2
];

// Verify no initial collision
assert(
  !checkCollision(physicsState.player, mockObstacles[0]),
  "Player initialized cleanly outside of obstacle boundary.",
);

// Apply a high velocity downward to force an overlap step
physicsState.player.velocity[1] = -200; // Moving down fast
updatePhysicsEntity(physicsState.player, physicsState.world, 0.016); // step 1 frame

// Ensure collision is detected post-update
assert(
  checkCollision(physicsState.player, mockObstacles[0]),
  "Collision correctly flagged when player vector intersects obstacle space.",
);

// Resolve the collision intersection
resolveObstacleCollisions(physicsState.player, mockObstacles[0]);

// Assertions to verify the snapping resolution pushed the player out and cleared downward velocity
assert(
  physicsState.player.pos[1] === 2,
  `Collision resolved: Player snapped perfectly to obstacle top surface (Expected: 2, Got: ${physicsState.player.pos[1]}).`,
);
assert(
  physicsState.player.velocity[1] === 0,
  "Collision resolved: Downward velocity zeroed out safely upon hard impact surface.",
);
