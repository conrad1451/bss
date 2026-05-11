// engine/updateEngine.js

// CHQ: Gemini AI generated file

export function updateEngine(gameState, dt) {
  const { player, objects, world, triggers } = gameState;

  // 1. Physics Simulation [cite: 1667]
  world.step(dt);

  // 2. Player State & Camera Updates
  player.updatePhysics(dt);
  player.updateCamera(dt);
  player.updateFields(dt); // Handles flower collection/growth
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

  // 6. Proximity & Trigger Logic
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
