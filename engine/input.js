// engine/input.js

// CHQ: Gemini AI generated

/**
 * Initializes global keyboard listeners and binds their tracking state
 * directly into the passive engine state tree.
 * @param {Object} gameState - The global passive engine state tree.
 * @returns {Function} An unsubscribe function to cleanly tear down listeners on unmount.
 */
export function initializeInputListeners(gameState) {
  // Ensure the state node exists safely
  if (!gameState.user) {
    gameState.user = {};
  }

  // Track keys as a direct map of active booleans
  gameState.user.keys = {};

  const handleKeyDown = (event) => {
    // Normalize to lowercase strings to easily capture 'w' vs 'W'
    const key = event.key.toLowerCase();
    gameState.user.keys[key] = true;
  };

  const handleKeyUp = (event) => {
    const key = event.key.toLowerCase();
    gameState.user.keys[key] = false;
  };

  // Bind directly to global event targets
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  console.log("🎮 Hardware keyboard input tracking listeners actively bound.");

  // Return a clean teardown function for component unmounting / state resets
  return function teardownInputListeners() {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    gameState.user.keys = {};
    console.log(
      "🧹 Hardware keyboard input tracking listeners cleanly removed.",
    );
  };
}
