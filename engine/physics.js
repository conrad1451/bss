// engine/physics.js

// CHQ: Gemini AI created

/**
 * Checks for Axis-Aligned Bounding Box (AABB) collision between two entities.
 * @param {Object} rect1 - Object with x, y, width, height properties
 * @param {Object} rect2 - Object with x, y, width, height properties
 * @returns {boolean} True if they overlap
 */
export function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * Updates an entity's position based on velocity and delta time, applying gravity.
 * @param {Object} entity - The moving entity (must have x, y, vx, vy, width, height)
 * @param {Object} worldSettings - Config containing gravity and bounds
 * @param {number} dt - Delta time in seconds
 */
export function updatePhysicsEntity(entity, worldSettings, dt) {
  const gravity = worldSettings.gravity || 0;

  // 1. Apply gravity to vertical velocity
  entity.vy += gravity * dt;

  // 2. Predict next positions
  entity.x += entity.vx * dt;
  entity.y += entity.vy * dt;
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
      // Basic resolution: Determine shallowest penetration axis and push out
      const overlapX =
        Math.min(entity.x + entity.width, obstacle.x + obstacle.width) -
        Math.max(entity.x, obstacle.x);
      const overlapY =
        Math.min(entity.y + entity.height, obstacle.y + obstacle.height) -
        Math.max(entity.y, obstacle.y);

      if (overlapX < overlapY) {
        // Push along X axis
        if (entity.x + entity.width / 2 < obstacle.x + obstacle.width / 2) {
          entity.x -= overlapX;
        } else {
          entity.x += overlapX;
        }
        entity.vx = 0; // Kill horizontal velocity on impact
      } else {
        // Push along Y axis
        if (entity.y + entity.height / 2 < obstacle.y + obstacle.height / 2) {
          entity.y -= overlapY;
        } else {
          entity.y += overlapY;
        }
        entity.vy = 0; // Kill vertical velocity (ground hit / ceiling bump)
      }
    }
  }
}
