// engine/updateEngine.js

// CHQ: Gemini AI generated file

export function updateEngine(gameState, dt) {
  const { player, objects, world, triggers } = gameState;

  // 1. Physics Simulation [cite: 1667]
  world.step(dt);

  // 2. Player State & Camera Updates
  player.updatePhysics(dt); // 🏃‍♂️ Player moves to their new predicted position first

  // 3. Evaluate Trigger Zones Collision Status
  triggers.forEach((zone) => {
    // Simple 2D distance check between player and zone center coordinates
    const dx = player.pos[0] - zone.x;
    const dz = player.pos[2] - zone.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < zone.radius) {
      if (!zone.colliding) {
        zone.colliding = true;
        if (typeof zone.onEnter === "function") zone.onEnter(gameState);
      }
    } else {
      zone.colliding = false; // Player stepped away
    }
  });

  // 3. Camera & Systems Alignment
  player.updateCamera(dt); //  Snap the camera to follow the newly verified position
  player.updateFields(dt); //  Process pollen collection based on where they stand
  player.updateUI(dt); // Updates honey/pollen counters

  // 3. Entity AI: Bees
  for (let bee of objects.bees) {
    bee.update(dt, gameState);
  }

  // 4. Entity AI: Mobs
  for (let i = objects.mobs.length - 1; i >= 0; i--) {
    if (objects.mobs[i].update(dt, gameState)) {
      objects.mobs[i].die(i);
    }
  }

  // 5. World Items: Tokens
  for (let i = objects.tokens.length - 1; i >= 0; i--) {
    if (objects.tokens[i].update(dt)) {
      objects.tokens[i].die(i);
    }
  }

  // 6. NPC Logic
  // We don't usually "die" or splice NPCs, so a simple for...of is fine
  for (let npc of objects.npcs) {
    npc.update(dt, gameState);
  }

  // 7. Proximity & Trigger Logic
  checkTriggers(gameState);
}

function checkTriggers(gameState) {
  const { player, triggers } = gameState;

  // CHQ: Gemini AI:  Reset the trigger so it doesn't stay active when you walk away
  player.currentMachineTrigger = null;
  // triggers[ {colliding: boolean}   ]
  // CHQ: Gemini AI: Logic to check if player is standing in a machine zone
  for (let i in triggers) {
    const t = triggers[i];
    t.colliding =
      player.body.position.x > t.minX &&
      player.body.position.x < t.maxX &&
      player.body.position.z > t.minZ &&
      player.body.position.z < t.maxZ;

    // CHQ: Gemini AI added
    if (t.colliding) {
      player.currentMachineTrigger = t;
    }
  }
}

function checkTokenCollection(gameState) {
  const { player, objects } = gameState;

  for (let i = objects.tokens.length - 1; i >= 0; i--) {
    const t = objects.tokens[i];
    const dist = Math.sqrt(
      Math.pow(player.body.position.x - t.pos[0], 2) +
        Math.pow(player.body.position.z - t.pos[2], 2),
    );

    if (dist < 5) {
      // Collection radius
      applyLoot(t, gameState);
      objects.tokens.splice(i, 1);
    }
  }
}

function applyLoot(token, gameState) {
  if (token.type === "honey") gameState.honey += token.amount;
  if (token.type === "ticket") gameState.tickets += token.amount;
  // ... etc
}
