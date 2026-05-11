// engine/updateEngine.js

// CHQ: Gemini AI generated file

export function updateEngine(gameState, dt) {
  const { player, objects, world, triggers } = gameState;

  // 1. Physics Simulation [cite: 1667]
  world.step(dt);

  // 2. Player State & Camera Updates [cite: 1668, 1268]
  player.updatePhysics(dt);
  player.updateCamera(dt);
  player.updateFields(dt); // Handles flower collection/growth [cite: 1282]
  player.updateUI(dt); // Updates honey/pollen counters [cite: 1185]

  // 3. Entity AI: Bees [cite: 1694]
  for (let bee of objects.bees) {
    bee.update(dt, gameState);
  }

  // 4. Entity AI: Mobs [cite: 1705]
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

  // 6. Proximity & Trigger Logic [cite: 1665, 1666]
  checkTriggers(gameState);
}

function checkTriggers(gameState) {
  const { player, triggers } = gameState;
  // Logic from source 1666 to check if player is standing in a machine zone
  for (let i in triggers) {
    const t = triggers[i];
    t.colliding =
      player.body.position.x > t.minX &&
      player.body.position.x < t.maxX &&
      player.body.position.z > t.minZ &&
      player.body.position.z < t.maxZ;
  }
}
