// index.js
import { initMainMenu } from "./ui/menu.js";
import { Renderer } from "./engine/renderer.js";
import { updateEngine } from "./engine/updateEngine.js";
import { createInitialState } from "./state/gameState.js";
import { initInputHandlers } from "./utils/input.js";
import { TextRenderer } from "./engine/textRenderer.js";
import { loadTextures } from "./engine/assetLoader.js";

import { NPC } from "./entities/npcs.js";
// // index.js
// import { effects } from "./data/effects.js";
// import { upgrades } from "./data/upgrades.js";
// // import { blenderRecipes, windShrineDonations } from "./recipes";
// import { createInitialState } from "./state/gameState.js";
// import { Renderer } from "./engine/renderer.js";
// import { updateEngine } from "./engine/updateEngine.js";

// import { createField } from "./engine/world.js";
// import { fieldDefinitions } from "./data/fieldData.js";

// import { initInputHandlers } from "./utils/input.js";
// import { TextRenderer } from "./engine/textRenderer.js";
// import { loadTextures, generateDefaultNoise } from "./engine/assetLoader.js";
// import { Bee, TempBee } from "./entities/bees.js";

// import { Mob, MondoChick } from "./entities/mobs.js";
// import { mobDefinitions } from "./data/mobData.js"; // Optional: keep data separate

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
      internalAddFlowerFunction, // Pass the function that builds flower meshes
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
    "quest-giver",
    gameState,
  );
  gameState.objects.npcs.push(blackBear);
}

var _M = Math;

// --- 1. ENTRY POINT ---
function main() {
  initMainMenu(BeeSwarmSimulator);
}

// --- 2. THE ENGINE ---
async function BeeSwarmSimulator(saveData) {
  // let width = window.thisProgramIsInFullScreen ? 500 : window.innerWidth + 1;
  // let height = window.thisProgramIsInFullScreen ? 500 : window.innerHeight + 1;

  // --- 1. SETUP GOES HERE ---
  const canvas = document.getElementById("gl-canvas");
  const uiCanvas = document.getElementById("ui-canvas");
  const gl = canvas.getContext("webgl2");

  // State & Systems Initialization
  const gameState = createInitialState(saveData);
  const renderer = new Renderer(gl, canvas.width, canvas.height);
  const textRenderer = new TextRenderer(
    gl,
    renderer.glCache,
    renderer.programs,
  );

  if (!gl) {
    alert("WebGL 2.0 not supported by your browser.");
    return;
  }
  gl.viewport(0, 0, width, height);

  // WebGL State Settings (SET ONCE)
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  const ctx = uiCanvas.getContext("2d"); // Needed for Renderer.renderUI

  canvas.width = width;
  canvas.height = height;
  uiCanvas.width = width;
  uiCanvas.height = height;

  // --- 2. RENDERER INITIALIZATION ---
  // Now that you have 'gl', you can pass it into the Renderer
  const renderer = new Renderer(gl, canvas.width, canvas.height);
  // document.onpaste = undefined;

  // Run the modular asset loader
  const textures = loadTextures(gl, tex_ctx); // [cite: 878]

  // Pass these textures to your renderer or store in gameState
  renderer.textures = textures;

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

  // --- 3. STATE INITIALIZATION ---
  const gameState = createInitialState(saveData);

  // // A. Initialize the renderer
  // const renderer = new Renderer(gl, canvas.width, canvas.height);

  // A. Initialize the Text system
  const textRenderer = new TextRenderer(
    gl,
    renderer.glCache,
    renderer.programs,
  );

  // B. Attach Input listeners
  initInputHandlers(gameState, uiCanvas);
  // --- 4. ENGINE STARTUP ---
  initGameWorld(gameState);

  // 3. Compile Shaders and Initialize Cache
  // We use the keys defined in your engine/shaders.js
  renderer.programs.static = renderer.createProgram("staticVSH", "staticFSH");
  renderer.programs.bee = renderer.createProgram("beeVSH", "beeFSH");
  renderer.programs.flower = renderer.createProgram("flowerVSH", "flowerFSH");
  renderer.programs.token = renderer.createProgram("tokenVSH", "tokenFSH");
  renderer.programs.particle = renderer.createProgram(
    "particleVSH",
    "particleFSH",
  );
  renderer.programs.text = renderer.createProgram("textVSH", "textFSH");

  // Map all the attribute/uniform locations
  renderer.initCache(renderer.programs);

  let then = 0;
  // 5. Start the Game Loop
  function gameLoop(now) {
    // A. Delta Time calculation
    // const dt = calculateDelta(now);
    const dt = Math.min((now - then) * 0.001, 0.07); //
    then = now; //

    // B. RUN SIMULATION (Logic Phase)
    // This updates positions, AI, and game logic
    updateEngine(gameState, dt);

    // C. RUN VISUALS
    // This draws the updated positions to the GPU
    renderer.render(gameState, dt);

    // 4. Request the next frame
    // requestAnimationFrame(gameLoop);
    window.requestAnimationFrame(gameLoop); //
  }

  window.requestAnimationFrame(gameLoop);
}

// console.log = 0;
