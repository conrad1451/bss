// engine/updateEngine.js

// The bridge that connects the core engine mutations directly to the UI layer

// CHQ: Gemini AI generated file
import { updatePhysicsEntity, resolveObstacleCollisions } from "./physics.js";
import { spawnBeeAtCamera } from "../entities/bees.js";

/**
 * Main per-frame engine update. Advances physics, player state, AI entities,
 * trigger zones, token collection, and NPC logic for a single tick.
 *
 * Call this once per animation frame, passing the authoritative game state and
 * the elapsed time since the previous frame.
 *
 * @param {Object} gameState - The live game state object produced by {@link createInitialState}.
 * @param {Object} gameState.player - The player instance with physics and UI update methods.
 * @param {Object} gameState.objects - Container for all live entity arrays
 *   (bees, mobs, tokens, npcs, etc.).
 * @param {Object} gameState.world - Physics world configuration (gravity, airResistance, bounds).
 * @param {Object[]} gameState.triggers - Array of trigger/machine zone descriptors.
 * @param {Object[]} [gameState.obstacles] - Optional array of static obstacle volumes for collision resolution.
 * @param {number} dt - Delta time in seconds since the last frame.
 * @returns {void}
 */
export function updateEngine(gameState, dt) {
  // 1. Initialize or increment the frame count safely
  gameState.frameCount = (gameState.frameCount || 0) + 1;

  const { player, objects, world, triggers } = gameState;

  // 2. Run your real custom physics functions instead of world.step()
  // This applies gravity from world configurations and shifts velocity vectors
  updatePhysicsEntity(player, world, dt);

  // If you have static obstacles mapped in your 3D/2D space, resolve them here:
  if (gameState.obstacles) {
    resolveObstacleCollisions(player, gameState.obstacles);
  }

  // 2. Player State & Camera Updates
  player.updatePhysics(dt, gameState.user);

  // 3. Entity AI: Bees
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
      const pX = player.pos[0];
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
      if (zone.isMachine) {
        player.currentMachineTrigger = zone;
      }
    } else {
      zone.colliding = false;
    }
  });

  // 4. Token Proximity Sweep
  checkTokenCollection(gameState);

  player.updateCamera(dt);
  player.updateFields(dt);
  player.updateUI(dt, gameState);

  // 3. Entity AI: Bees
  for (let bee of objects.bees) {
    bee.update(dt, gameState);
  }

  // 4. Entity AI: Mobs
  for (let i = gameState.objects.mobs.length - 1; i >= 0; i--) {
    const mob = gameState.objects.mobs[i];

    const isDead = mob.update(dt, gameState);

    if (isDead || mob.isDead) {
      mob.die(i, gameState);
      gameState.objects.mobs.splice(i, 1);
    }
  }

  // 8. World Items: Non-collected Token Lifespans
  for (let i = objects.tokens.length - 1; i >= 0; i--) {
    if (objects.tokens[i].update(dt)) {
      objects.tokens[i].die(i);
    }
  }

  // 9. NPC Interactions
  for (let npc of objects.npcs) {
    npc.update(dt, gameState);
  }

  // Inside updateEngine(gameState, dt)
  if (gameState.frameCount === 1) {
    // Spawns immediately on frame 1

    spawnBeeAtCamera(gameState);

    console.log(
      "gameState.objects.bees.length is: ",
      gameState.objects.bees.length,
    );
  }
  // if (gameState.user.clickedKeys["n"]) {
  //   let printThis = true;

  //   if (printThis) {
  //     console.log("Pressed key n");
  //   }
  //   printThis = false; // CHQ: has not made a difference anyways

  //   spawnBeeAtCamera(gameState);
  //   console.log(
  //     "gameState.objects.bees.length is: ",
  //     gameState.objects.bees.length,
  //   );
  // }
}

/**
 * Scans all live tokens and collects any that are within pickup range of the player.
 * Collected tokens are removed from the tokens array and their loot is applied
 * immediately via {@link applyLoot}.
 *
 * @param {Object} gameState - The live game state object.
 * @param {Object} gameState.player - The player instance; must have a valid `pos` array.
 * @param {number} gameState.player.pos[0] - Player X world position.
 * @param {number} gameState.player.pos[2] - Player Z world position.
 * @param {Object} gameState.objects - Entity container.
 * @param {Object[]} gameState.objects.tokens - Array of live token instances, each with a `pos` array.
 * @returns {void}
 */
function checkTokenCollection(gameState) {
  const { player, objects } = gameState;
  if (!player || !player.pos) return;

  const pX = player.pos[0];
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

/**
 * Applies the reward from a collected token directly to the appropriate
 * game state counters. Honey tokens call the player's `addHoney` method;
 * ticket tokens increment the global ticket counter.
 *
 * @param {Object} token - The token that was collected.
 * @param {string} token.type - Token reward type; currently `"honey"` or `"ticket"`.
 * @param {number} token.amount - Quantity of the resource to award.
 * @param {Object} gameState - The live game state object.
 * @param {Object} gameState.player - The player instance; must expose `addHoney(amount)`.
 * @param {number} [gameState.tickets] - Running ticket total (created if absent).
 * @returns {void}
 */
function applyLoot(token, gameState) {
  if (token.type === "honey") gameState.player.addHoney(token.amount);
  if (token.type === "ticket")
    gameState.tickets = (gameState.tickets || 0) + token.amount;
}
