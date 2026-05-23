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
export function createGameLoop(update, render, gameState) {
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
