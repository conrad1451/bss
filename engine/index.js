// engine/index.js

// CHQ: Gemini AI created

import { loadTextures } from "./assetLoader.js";
import { createGameLoop } from "./gameLoop.js";
import { updatePhysicsEntity, resolveObstacleCollisions } from "./physics.js";
import { updateInventory, addMessage } from "./eventManager.js";
// import { updateInventory, addMessage, EventManager } from "./eventManager.js";

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
  loadTextures(texCtx);

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

// ##############################################

/**
 * Creates and configures the core game engine heartbeat loop.
 * @param {Object} gameState - The global passive engine state tree.
 * @param {Object} eventManager - The decoupled EventManager instance.
 * @param {Array} obstacles - Reference array of static world obstacles.
 * @returns {Object} Engine controls (start, stop).
 */
export function createEngine(gameState, eventManager, obstacles = []) {
  let animationFrameId = null;
  let lastTime = 0;
  let isRunning = false;

  // 1. Defensively check and initialize assets ONLY if runtime graphic contexts exist.
  // This keeps your integration tests fully green in headless Node.js environments!
  if (gameState.renderContexts?.gl) {
    const gl = gameState.renderContexts.gl;
    const texCtx = gameState.renderContexts.texCtx || null;

    // Pass both required arguments to match the assetLoader signature perfectly
    gameState.textures = loadTextures(gl, texCtx);
    console.log("🎨 Engine assets compiled and texture sheets loaded safely.");
  }

  /**
   * The core loop cycle running on every display refresh tick.
   * @param {number} currentTime - DOMHighResTimeStamp passed by requestAnimationFrame.
   */
  function tick(currentTime) {
    if (!isRunning) return;

    // 1. Calculate frame delta time in seconds
    if (!lastTime) lastTime = currentTime;
    let dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // 2. Guard rail: Clamp dt to handle massive lag spikes (e.g., tab switching)
    // Prevents entities from tunneling through solid bounding boxes
    if (dt > 0.1) dt = 0.1;

    // 3. Update active input matrices if applicable
    // (Our input listener mutates gameState.user.keys directly in real time!)

    // 4. Process movement and gravity vector integration
    updatePhysicsEntity(gameState.player, gameState.world, dt);

    // 5. Resolve spatial AABB overlaps against static geometry maps
    resolveObstacleCollisions(gameState.player, obstacles);

    // 6. Broadcast to UI/subscribers that a full engine tick has completed
    eventManager.emit("ENGINE_TICK", { dt, state: gameState });

    // 7. Request the next frame cycle
    animationFrameId = requestAnimationFrame(tick);
  }

  return {
    /** Starts the engine loop execution. */
    start() {
      if (isRunning) return;
      isRunning = true;
      lastTime = 0; // Reset timer to prevent massive initial dt spike
      animationFrameId = requestAnimationFrame(tick);
      eventManager.emit("NEW_MESSAGE", {
        type: "SYSTEM",
        text: "Engine heartbeat started.",
      });
    },

    /** Stops the engine loop execution and cleans up animation handles. */
    stop() {
      if (!isRunning) return;
      isRunning = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      eventManager.emit("NEW_MESSAGE", {
        type: "SYSTEM",
        text: "Engine heartbeat stopped cleanly.",
      });
    },
  };
}
