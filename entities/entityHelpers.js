// CHQ: Claude AI (Haiku) generated function
/**
 * Calculates a world position in front of the camera along its viewing direction.
 *
 * @param {Object} gameState - The live game state object.
 * @param {number} distance - How far ahead of the camera to place the bee (default: 20 units).
 * @returns {Array} [x, y, z] world position where the bee should spawn.
 */
export function getPositionAheadOfCamera(gameState, distance = 20) {
  const camera = gameState.camera;
  const player = gameState.player;

  if (!camera || !camera.pos || !player || !player.pos) {
    return player.pos; // Fallback to player position
  }

  const camPos = camera.pos; // [camX, camY, camZ]
  const lookTarget = player.pos; // [playerX, playerY, playerZ]

  // Calculate forward direction (from camera toward look target)
  const forwardX = lookTarget[0] - camPos[0];
  const forwardY = lookTarget[1] - camPos[1];
  const forwardZ = lookTarget[2] - camPos[2];

  // Normalize the direction
  const length = Math.sqrt(
    forwardX * forwardX + forwardY * forwardY + forwardZ * forwardZ,
  );
  if (length === 0) return player.pos; // Safety check

  const dirX = forwardX / length;
  const dirY = forwardY / length;
  const dirZ = forwardZ / length;

  // Position ahead of the camera along the forward direction
  const spawnX = camPos[0] + dirX * distance;
  const spawnY = camPos[1] + dirY * distance;
  const spawnZ = camPos[2] + dirZ * distance;

  return [spawnX, spawnY, spawnZ];
}
