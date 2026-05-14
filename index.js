// index.js
import { createInitialState, getSaveSnapshot } from "./state/gameState.js";

import { Renderer } from "./engine/renderer.js";
import { TextRenderer } from "./engine/textRenderer.js";
import { updateEngine } from "./engine/updateEngine.js";
import { loadTextures } from "./engine/assetLoader.js";
import { addFlower } from "./engine/flowerBuilder.js";
import { createField } from "./engine/world.js";
import { Player } from "./entities/Player.js";

import { initMainMenu } from "./ui/menu.js";
import { updateQuestUI } from "./ui/questRenderer.js";

import { initInputHandlers } from "./utils/input.js";
import { saveCheckpoint, loadCheckpoint } from "./utils/db.js";

import { mobDefinitions } from "./data/mobData.js"; // Optional: keep data separate

import { NPC } from "./entities/npcs.js";
import { Mob, MondoChick } from "./entities/mobs.js";

// // index.js
// import { effects } from "./data/effects.js";
// import { upgrades } from "./data/upgrades.js";
// // import { blenderRecipes, windShrineDonations } from "./recipes";
// import { fieldDefinitions } from "./data/fieldData.js";
// import { loadTextures, generateDefaultNoise } from "./engine/assetLoader.js";
// import { Bee, TempBee } from "./entities/bees.js";

// import {
//   createDatabase,
//   loadFromDB,
//   saveToDB,
//   deleteFromDB,
// } from "./utils/db.js";

function initGameWorld(gameState) {
  // 1. Initialize Fields (Your existing logic)
  fieldDefinitions.forEach((f) => {
    createField(
      f.name,
      f.x,
      f.y,
      f.z,
      f.w,
      f.l,
      f.colorLogic,
      f.levelLogic,
      f.composition,
      f.nectar,
      gameState,
      addFlower,
      // addFlower(renderer), // Pass the function that builds flower meshes
      // renderer.addFlower.bind(renderer), // Pass the function that builds flower meshes
    );
  });

  // 2. Initialize Mobs
  // Instead of raw objects, we now use the Mob class
  mobDefinitions.forEach((m) => {
    const mobInstance =
      m.type === "mondo"
        ? new MondoChick(m.id, m.pos, m.hp, m.lvl, gameState)
        : new Mob(m.id, m.type, m.pos, m.hp, m.lvl, gameState);

    gameState.objects.mobs.push(mobInstance);
  });

  // 3. Initialize NPCs (Bears/Shopkeepers)
  const blackBear = new NPC(
    "Black Bear",
    [50, 0, -20],
    "Black Bear",
    gameState,
  );
  const brownBear = new NPC("Brown Bear", [10, 0, 50], "Brown Bear", gameState);

  gameState.objects.npcs.push(blackBear, brownBear);
}

var _M = Math;

// --- 1. ENTRY POINT ---
function main() {
  initMainMenu(BeeSwarmSimulator);
}

// --- 2. THE ENGINE ---
async function BeeSwarmSimulator(saveData) {
  // --- A. DOM & CONTEXT SETUP ---

  // let width = window.thisProgramIsInFullScreen ? 500 : window.innerWidth + 1;
  // let height = window.thisProgramIsInFullScreen ? 500 : window.innerHeight + 1;

  // --- 1. SETUP GOES HERE ---
  const canvas = document.getElementById("gl-canvas");
  const uiCanvas = document.getElementById("ui-canvas");
  const saveButton = document.getElementById("save-btn");

  const gl = canvas.getContext("webgl2");
  const ctx = uiCanvas.getContext("2d");

  if (!gl) {
    alert("WebGL 2.0 not supported by your browser.");
    return;
  }

  // Define width/height based on window or fixed size
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;
  uiCanvas.width = width;
  uiCanvas.height = height;

  // --- B. STATE & SYSTEMS ---
  const rawState = createInitialState(saveData);

  //  "Upgrade" the player object with methods
  rawState.player = new Player(rawState.player);

  const gameState = rawState;

  const renderer = new Renderer(gl, canvas.width, canvas.height);
  const textRenderer = new TextRenderer(
    gl,
    renderer.glCache,
    renderer.programs,
  );

  // ASSET LOADING
  // Load textures and pass to renderer
  const textures = loadTextures(gl);
  renderer.textures = textures;

  //  SHADERS
  renderer.programs.static = renderer.createProgram("staticVSH", "staticFSH");
  renderer.programs.bee = renderer.createProgram("beeVSH", "beeFSH");
  renderer.programs.flower = renderer.createProgram("flowerVSH", "flowerFSH");
  renderer.programs.token = renderer.createProgram("tokenVSH", "tokenFSH");
  renderer.programs.particle = renderer.createProgram(
    "particleVSH",
    "particleFSH",
  );
  renderer.programs.text = renderer.createProgram("textVSH", "textFSH");
  renderer.initCache(renderer.programs);

  // --- C. GL STATE SETTINGS ---
  gl.viewport(0, 0, width, height);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  // --- D. WORLD & INPUT ---
  initInputHandlers(gameState, uiCanvas); // Attach Input listeners
  initGameWorld(gameState); // Populates NPCs, Mobs, Fields //ENGINE STARTUP --

  // --- E. CHECKPOINT LOGIC ---
  async function handleSave() {
    console.log("Checkpoint triggered...");
    const snapshot = getSaveSnapshot(gameState);
    try {
      await saveCheckpoint(snapshot);
      // Assuming you have a showSaveToast function elsewhere
      if (typeof showSaveToast === "function") showSaveToast("Game Saved!");
      console.log("Game Saved Successfully!");
    } catch (err) {
      console.error("Save failed:", err);
    }
  }
  if (saveButton) {
    saveButton.addEventListener("click", () => {
      const snapshot = getSaveSnapshot(gameState);
      saveCheckpoint(snapshot);
    });
  }

  // Inside index.js UI logic
  document.getElementById("questButton").addEventListener("click", () => {
    const page = document.getElementById("questPage");
    const isHidden = page.style.display === "none" || page.style.display === "";

    // Hide all other pages first (standard BSS UI behavior)
    document
      .querySelectorAll(".uiPage")
      .forEach((p) => (p.style.display = "none"));

    page.style.display = isHidden ? "block" : "none";

    if (isHidden) {
      page.style.display = "block";
      updateQuestUI(gameState); // Pulls current stats into progress bars
    } else {
      page.style.display = "none";
    }
  });

  // const ctx = uiCanvas.getContext("2d"); // Needed for Renderer.renderUI

  // window.onresize = () => {
  //   width = window.thisProgramIsInFullScreen ? 500 : window.innerWidth + 1;
  //   height = window.thisProgramIsInFullScreen ? 500 : window.innerHeight + 1;

  //   canvas.width = width;
  //   canvas.height = height;
  //   uiCanvas.width = width;
  //   uiCanvas.height = height;

  //   gl.viewport(0, 0, width, height);

  //   // Update the renderer's internal state
  //   renderer.width = width;
  //   renderer.height = height;

  //   // Refresh projection matrix in gameState
  //   gameState.player.setProjectionMatrix(
  //     gameState.player.fov,
  //     width / height,
  //     0.1,
  //     275,
  //   );
  // };

  // --- 7. GAME LOOP ---
  let then = 0;
  // 5. Start the Game Loop
  function gameLoop(now) {
    // A. Delta Time calculation
    // const dt = calculateDelta(now);
    const dt = Math.min((now - then) * 0.001, 0.07); //
    then = now; //

    updateEngine(gameState, dt); // updates positions, AI, and game logic
    renderer.render(gameState, dt); // draws updated positions to the GPU

    window.requestAnimationFrame(gameLoop); // Request the next frame
  }

  window.requestAnimationFrame(gameLoop);
}

// At the bottom of index.js
window.addEventListener("load", () => {
  main();
});
// main();
// console.log = 0;
