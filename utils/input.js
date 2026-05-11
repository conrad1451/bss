// utils/input.js

// CHQ: Gemini AI generated

export function initInputHandlers(gameState, uiCanvas) {
  const { player, user } = gameState;

  document.onkeydown = (e) => {
    const key = e.key.toLowerCase();
    user.keys[key] = true;
    user.clickedKeys[key] = true;

    const cameraRotationSpeed = 0.12;

    // 1. Camera Movement (Arrow Keys)
    if (e.keyCode === 38) player.pitch -= cameraRotationSpeed / 2; // -= 0.06; // Up
    if (e.keyCode === 40) player.pitch += cameraRotationSpeed / 2; //+= 0.06; // Down
    if (e.keyCode === 37) player.yaw -= cameraRotationSpeed; // -= 0.12; // Left
    if (e.keyCode === 39) player.yaw += cameraRotationSpeed; //+= 0.12; // Right

    // 2. UI Toggles
    // We assume buttons are attached to gameState or you find them in the DOM
    if (key === "i") document.getElementById("inventoryButton")?.onclick?.();
    if (key === "q") document.getElementById("questButton")?.onclick?.();
    if (key === "b") document.getElementById("beesButton")?.onclick?.();
    if (key === "n") document.getElementById("beequipButton")?.onclick?.();
    if (key === "p") document.getElementById("settingsButton")?.onclick?.();

    // 3. Game Logic Toggles
    if (key === "o") gameState.showTheQuests = !gameState.showTheQuests;

    // 4. Interaction (E key)
    if (key === "e" && player.currentMachineTrigger) {
      player.currentMachineTrigger.func(player);
    }
  };

  document.onkeyup = (e) => {
    user.keys[e.key.toLowerCase()] = false;
    // Hotbar shortcuts (1-6) [cite: 1405]
  };

  uiCanvas.oncontextmenu = (e) => {
    e.preventDefault(); // [cite: 1406]
  };

  uiCanvas.onwheel = (e) => {
    e.preventDefault();
    // Adjust zoom [cite: 1406]
    player.zoom = Math.min(Math.max(player.zoom + e.deltaY * 0.01, 0), 30);
  };
}
