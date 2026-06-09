// engine/updateEngine.js

// The bridge that connects the core engine mutations directly to the UI layer

// CHQ: Gemini AI generated file
import { updatePhysicsEntity, resolveObstacleCollisions } from "./physics.js";

export function updateEngine(gameState, dt) {
  // 1. Initialize or increment the frame count safely
  gameState.frameCount = (gameState.frameCount || 0) + 1;

  const { player, objects, world, triggers } = gameState;

  // // 1. Physics Simulation [cite: 1667]
  // world.step(dt);

  // 2. Run your real custom physics functions instead of world.step()
  // This applies gravity from world configurations and shifts velocity vectors
  updatePhysicsEntity(player, world, dt);

  // If you have static obstacles mapped in your 3D/2D space, resolve them here:
  if (gameState.obstacles) {
    resolveObstacleCollisions(player, gameState.obstacles);
  }

  // 2. Player State & Camera Updates
  // player.updatePhysics(dt); // 🏃‍♂️ Player moves to their new predicted position first
  player.updatePhysics(dt, gameState.user);

  // // 3. Evaluate Trigger Zones Collision Status
  // triggers.forEach((zone) => {
  //   // Simple 2D distance check between player and zone center coordinates
  //   const dx = player.pos[0] - zone.x;
  //   const dz = player.pos[2] - zone.z;
  //   const distance = Math.sqrt(dx * dx + dz * dz);

  //   if (distance < zone.radius) {
  //     if (!zone.colliding) {
  //       zone.colliding = true;
  //       if (typeof zone.onEnter === "function") zone.onEnter(gameState);
  //     }
  //   } else {
  //     zone.colliding = false; // Player stepped away
  //   }
  // });

  // 3. Camera & Systems Alignment

  // 3. Consolidated Trigger & Machine Zone Evaluation
  // Reset the active prompt target on every tick
  player.currentMachineTrigger = null;

  triggers.forEach((zone) => {
    let isInside = false;

    // Support BOTH bounding boxes and circular radii gracefully!
    if (typeof zone.radius === "number") {
      const dx = player.pos[0] - zone.x;
      const dz = player.pos[2] - zone.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      isInside = distance < zone.radius;
    } else if (zone.minX !== undefined) {
      // const pX = player.body.position.x;
      // const pZ = player.body.position.z;

      const pX = player.pos[0]; // Clean layout match with player.pos array
      const pZ = player.pos[2];
      isInside =
        pX > zone.minX && pX < zone.maxX && pZ > zone.minZ && pZ < zone.maxZ;
    }

    // Evaluate State Transitions
    if (isInside) {
      if (!zone.colliding) {
        zone.colliding = true;
        if (typeof zone.onEnter === "function") zone.onEnter(gameState);
      }
      // If it's an interactive machine/shop, expose it to the player UI matrix
      if (zone.isMachine) {
        player.currentMachineTrigger = zone;
      }
    } else {
      zone.colliding = false; // Player walked away cleanly
    }
  });

  // 4. Token Proximity Sweep (Fixed: Hooked up collection loop!)
  checkTokenCollection(gameState);

  player.updateCamera(dt); //  Snap the camera to follow the newly verified position
  player.updateFields(dt); //  Process pollen collection based on where they stand
  // player.updateUI(dt); // Updates honey/pollen counters
  player.updateUI(dt, gameState);

  // 3. Entity AI: Bees
  for (let bee of objects.bees) {
    bee.update(dt, gameState);
  }

  // // 4. Entity AI: Mobs
  // for (let i = objects.mobs.length - 1; i >= 0; i--) {
  //   if (objects.mobs[i].update(dt, gameState)) {
  //     objects.mobs[i].die(i);
  //   }
  // }

  // 4. Entity AI: Mobs
  // Inside your main loop processing in updateEngine.js
  // Loop BACKWARDS to safely splice elements when they change to a dead state
  for (let i = gameState.objects.mobs.length - 1; i >= 0; i--) {
    const mob = gameState.objects.mobs[i];

    // Update instance and check if state marks them as dead
    const isDead = mob.update(dt, gameState);

    if (isDead || mob.isDead) {
      mob.die(i, gameState);
      gameState.objects.mobs.splice(i, 1); // Clean, safe removal at terminal lifecycle step
    }
  }

  // 8. World Items: Non-collected Token Lifespans
  for (let i = objects.tokens.length - 1; i >= 0; i--) {
    if (objects.tokens[i].update(dt)) {
      objects.tokens[i].die(i);
    }
  }

  // 9. NPC Interactions
  // We don't usually "die" or splice NPCs, so a simple for...of is fine
  for (let npc of objects.npcs) {
    npc.update(dt, gameState);
  }

  // CHQ: below is a duplicate of the triggers.forEach loop
  // // 7. Proximity & Trigger Logic
  // checkTriggers(gameState);
}

// CHQ: below is a duplicate of the triggers.forEach loop
// function checkTriggers(gameState) {
//   const { player, triggers } = gameState;

//   // CHQ: Gemini AI:  Reset the trigger so it doesn't stay active when you walk away
//   player.currentMachineTrigger = null;
//   // triggers[ {colliding: boolean}   ]
//   // CHQ: Gemini AI: Logic to check if player is standing in a machine zone
//   for (let i in triggers) {
//     const t = triggers[i];
//     t.colliding =
//       player.body.position.x > t.minX &&
//       player.body.position.x < t.maxX &&
//       player.body.position.z > t.minZ &&
//       player.body.position.z < t.maxZ;

//     // CHQ: Gemini AI added
//     if (t.colliding) {
//       player.currentMachineTrigger = t;
//     }
//   }
// }

function checkTokenCollection(gameState) {
  const { player, objects } = gameState;
  if (!player || !player.pos) return;
  // const pX = player.body.position.x;
  // const pZ = player.body.position.z;

  const pX = player.pos[0]; // Clean layout match with player.pos array
  const pZ = player.pos[2];

  for (let i = objects.tokens.length - 1; i >= 0; i--) {
    const t = objects.tokens[i];
    if (!t || !t.pos) continue;

    const dx = pX - t.pos[0];
    const dz = pZ - t.pos[2];
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 5) {
      // Collection bounding threshold
      applyLoot(t, gameState);
      objects.tokens.splice(i, 1);
    }
  }
}

function applyLoot(token, gameState) {
  // if (token.type === "honey") gameState.honey += token.amount;
  // if (token.type === "ticket") gameState.tickets += token.amount;

  // Directly fires your clean event mutators when walking over free items
  if (token.type === "honey") gameState.player.addHoney(token.amount);
  if (token.type === "ticket")
    gameState.tickets = (gameState.tickets || 0) + token.amount;
  // ... etc
}
