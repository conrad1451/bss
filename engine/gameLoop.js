// engine/gameLoop.js

// CHQ: Gemini AI created

let then = 0;
let animationFrameId = null;

/**
 * The core frame loop runner.
 * @param {Function} update - updateEngine(gameState, dt)
 * @param {Function} render - renderer.render(gameState, dt)
 * @param {Object} gameState - The single source of truth state object
 */
export function createGameLoopOld(update, render, gameState) {
  function loop(now) {
    // 1. Calculate Delta Time in seconds (capped at ~14 FPS minimum to prevent giant physics steps)
    const dt = Math.min((now - then) * 0.001, 0.07);
    then = now;

    // 2. Run the decoupled game systems
    update(gameState, dt);
    render(gameState, dt);

    // 3. Request next frame
    animationFrameId = window.requestAnimationFrame(loop);
  }

  return {
    start() {
      if (!animationFrameId) {
        then = window.performance.now();
        animationFrameId = window.requestAnimationFrame(loop);
      }
    },
    stop() {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    },
  };
}

/**
 * Creates an isolated, React-ready frame loop.
 * @param {Function} update - Core game logic updater (state, dt)
 * @param {Function} render - View layer renderer (state, dt)
 * @param {Object} state - The single source of truth state object
 */
export function createGameLoop(update, render, state) {
  let animationFrameId = null;
  let lastTime = 0;
  let isRunning = false;

  function tick(currentTime) {
    // console.log("tick fired"); // CHQ: Claude AI (Sonnet): add console print statement for debugging
    if (!isRunning) return;

    if (!lastTime) lastTime = currentTime;
    let dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Guard rail: Clamp dt to handle lag spikes or tab switching
    if (dt > 0.07) dt = 0.07;

    // Process simulation and draw to screen

    try {
      // CHQ: Claude AI (Sonnet): add to debug gameLoop not starting
      update(state, dt);
      render(state, dt);
    } catch (err) {
      // CHQ: Claude AI (Sonnet): add to debug gameLoop not starting
      console.error("❌ TICK CRASH:", err);
      isRunning = false; // stop the loop so it doesn't spam
      return;
    }

    animationFrameId = requestAnimationFrame(tick);
  }

  return {
    start() {
      if (isRunning) return;
      isRunning = true;
      lastTime = 0; // Prevent initial delta jump
      animationFrameId = requestAnimationFrame(tick);
    },
    stop() {
      if (!isRunning) return;
      isRunning = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    },
  };
}
