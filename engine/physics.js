// engine/physics.js

// CHQ: Gemini AI created

/**
 * Checks for Axis-Aligned Bounding Box (AABB) collision between two entities.
 * Adjusted to handle our array-based state structures.
 * @param {Object} entity - The moving entity tracking an array [x, y, z]
 * @param {Object} obstacle - Static object with x, y, width, height properties
 * @returns {boolean} True if they overlap
 */
export function checkCollision(entity, obstacle) {
  // Map player array positions to local comparison bounds
  const entityX = entity.pos[0];
  const entityY = entity.pos[1]; // Using Y as our 2D height/vertical axis

  return (
    entityX < obstacle.x + obstacle.width &&
    entityX + entity.width > obstacle.x &&
    entityY < obstacle.y + obstacle.height &&
    entityY + entity.height > obstacle.y
  );
}
/**
 * Updates an entity's position array based on velocity and delta time, applying gravity.
 * @param {Object} entity - The moving entity (must have pos: [x,y,z], velocity: [vx,vy,vz], width, height)
 * @param {Object} worldSettings - Config containing gravity and bounds
 * @param {number} dt - Delta time in seconds
 */
export function updatePhysicsEntity(entity, worldSettings, dt) {
  const gravity = worldSettings.gravity || 0;

  // 1. Apply gravity to vertical velocity (index 1 is our Y axis)
  entity.velocity[1] += gravity * dt;

  // 2. Predict next positions by integrating forces
  entity.pos[0] += entity.velocity[0] * dt; // X axis
  entity.pos[1] += entity.velocity[1] * dt; // Y axis
}

/**
 * Handles collisions between a moving entity and an array of static obstacles.
 * Resolves overlapping by snapping the entity to the obstacle's boundaries.
 * @param {Object} entity - The moving entity
 * @param {Array} obstacles - Array of static rects
 */
export function resolveObstacleCollisions(entity, obstacles) {
  for (const obstacle of obstacles) {
    if (checkCollision(entity, obstacle)) {
      const entityX = entity.pos[0];
      const entityY = entity.pos[1];

      // Determine shallowest penetration axis and push out
      const overlapX =
        Math.min(entityX + entity.width, obstacle.x + obstacle.width) -
        Math.max(entityX, obstacle.x);
      const overlapY =
        Math.min(entityY + entity.height, obstacle.y + obstacle.height) -
        Math.max(entityY, obstacle.y);

      if (overlapX < overlapY) {
        // Push along X axis
        if (entityX + entity.width / 2 < obstacle.x + obstacle.width / 2) {
          entity.pos[0] -= overlapX;
        } else {
          entity.pos[0] += overlapX;
        }
        entity.velocity[0] = 0; // Kill horizontal velocity on impact
      } else {
        // Push along Y axis
        if (entityY + entity.height / 2 < obstacle.y + obstacle.height / 2) {
          entity.pos[1] -= overlapY;
        } else {
          entity.pos[1] += overlapY;
        }
        entity.velocity[1] = 0; // Kill vertical velocity (ground hit / ceiling bump)
      }
    }
  }
}
