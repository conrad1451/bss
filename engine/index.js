// engine/index.js

// CHQ: Gemini AI created

import { initTextures } from "./assetLoader.js";
import { createGameLoop } from "./gameLoop.js";
import { updatePhysicsEntity, resolveObstacleCollisions } from "./physics.js";
import { updateInventory, addMessage } from "./eventManager.js";

// 1. Setup the Central Engine State (Single Source of Truth)
const gameState = {
  world: {
    gravity: 980, // pixels per second squared
    bounds: { width: 800, height: 600 },
  },
  player: {
    x: 100,
    y: 100,
    width: 32,
    height: 48,
    vx: 150, // moving right at 150px/sec
    vy: 0,
  },
  obstacles: [
    { x: 0, y: 550, width: 800, height: 50 }, // Floor
    { x: 400, y: 400, width: 200, height: 20 }, // Floating Platform
  ],
};

function completeQuestStep(gameState) {
  // Reward the player with a translator item
  updateInventory(gameState, "translators", 1);
  addMessage("Quest complete! Received 1x Translator.", "quest");
}

// 2. Define the Engine Logic Aggregator
function updateEngine(state, dt) {
  // Apply gravity and update positions
  updatePhysicsEntity(state.player, state.world, dt);

  // Handle and resolve solid collisions
  resolveObstacleCollisions(state.player, state.obstacles);
}

// 3. Define the Renderer Adapter
const renderer = {
  render(state, dt) {
    const canvas = document.getElementById("gameCanvas");
    if (!canvas) return; // Guard clause if UI unmounts
    const ctx = canvas.getContext("2d");

    // Clear the viewport
    ctx.clearRect(0, 0, state.world.bounds.width, state.world.bounds.height);

    // Draw Obstacles
    ctx.fillStyle = "#4a5568";
    state.obstacles.forEach((obs) => {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });

    // Draw Player using our generated textures (assuming spritesheet is ready)
    ctx.fillStyle = "#3182ce";
    ctx.fillRect(
      state.player.x,
      state.player.y,
      state.player.width,
      state.player.height,
    );
  },
};

// 4. Initialize and Start the Engine
export function initializeEngine(canvasElement) {
  if (!canvasElement) return null;

  // Set explicit canvas dimensions matching simulation logic
  canvasElement.width = gameState.world.bounds.width;
  canvasElement.height = gameState.world.bounds.height;

  // Generate the procedurally drawn texture spritesheet canvas
  const textureCanvas = document.createElement("canvas");
  const texCtx = textureCanvas.getContext("2d");
  initTextures(texCtx);

  // Instantiate the isolated game loop
  const engineLoop = createGameLoop(updateEngine, renderer.render, gameState);

  // Start the frame cycles
  engineLoop.start();

  // Return control hooks back to the caller (e.g., your React component wrapper)
  return {
    stop: engineLoop.stop,
    state: gameState,
  };
}
