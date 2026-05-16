// index.js
import { createInitialState, getSaveSnapshot } from "./state/gameState.js";

import { Renderer } from "./engine/renderer.js";
import { TextRenderer } from "./engine/textRenderer.js";
import { updateEngine } from "./engine/updateEngine.js";
import { loadTextures } from "./engine/assetLoader.js";
// import { addFlower } from "./engine/flowerBuilder.js";
import { createField } from "./engine/world.js";
import { useItem } from "./engine/inventory.js";
import { SHADERS } from "./engine/shaders.js";

import { initMainMenu } from "./ui/menu.js";
import { updateQuestUI } from "./ui/questRenderer.js";

import { initInputHandlers } from "./utils/input.js";
import { saveCheckpoint, loadCheckpoint } from "./utils/db.js";

import { mobDefinitions } from "./data/mobData.js"; // Optional: keep data separate
// import { fieldDefinitions } from "./data/fieldData.js";
import { FIELD_CONFIGS } from "./data/fieldData.js";

import { Player } from "./entities/Player.js";
import { NPC } from "./entities/npcs.js";
import { Mob, MondoChick } from "./entities/mobs.js";

// // index.js
// import { effects } from "./data/effects.js";
// import { upgrades } from "./data/upgrades.js";
// // import { blenderRecipes, windShrineDonations } from "./recipes";
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
  // FIELD_CONFIGS
  //   fieldDefinitions.forEach((f) => {

  // FIELD_CONFIGS.forEach((f) => {
  //   createField(
  //     f.name,
  //     f.x,
  //     f.y,
  //     f.z,
  //     f.w,
  //     f.l,
  //     // f.colorLogic,
  //     // f.levelLogic,
  //     f.composition,
  //     f.nectar,
  //     gameState,
  //     // addFlower,
  //     // addFlower(renderer), // Pass the function that builds flower meshes
  //     // renderer.addFlower.bind(renderer), // Pass the function that builds flower meshes
  //   );
  // });

  // FIELD_CONFIGS.forEach((f) => {
  //   createField(
  //     f.name, // Parameter 1: Field identifier string
  //     f, // Parameter 2: Pass the entire config object wrapper directly!
  //     gameState, // Parameter 3: Pass your main active global game state container
  //     gameState.meshes.flowers, // Parameter 4: Pass your instanced flower mesh reference channel
  //   );
  // });
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
  // CRITICAL CLEANUP: You named your array gameState.objects.npcs below,
  // but your gameState template defines it under gameState.npcs object keys.
  // Let's protect the collections safely here:
  if (!gameState.objects.npcs) gameState.objects.npcs = [];
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
  const consumableIds = [
    "fieldDice",
    "redExtract",
    "microConverter",
    "blueExtract",
    "glitter",
  ];

  //  "Upgrade" the player object with methods
  rawState.player = new Player(rawState.player);

  const gameState = rawState;

  const renderer = new Renderer(gl, canvas.width, canvas.height);
  const textRenderer = new TextRenderer(
    gl,
    renderer.glCache,
    renderer.programs,
  );

  // Defensive function to ensure we catch the exact missing string name in the console
  function safeCreateProgram(programName, vshString, fshString) {
    if (!vshString) {
      console.error(
        `❌ SHADER INIT ERROR: Vertex shader for '${programName}' evaluated to undefined!`,
      );
    }
    if (!fshString) {
      console.error(
        `❌ SHADER INIT ERROR: Fragment shader for '${programName}' evaluated to undefined!`,
      );
    }
    return renderer.createProgram(vshString, fshString);
  }

  // ASSET LOADING
  // Load textures and pass to renderer
  const textures = loadTextures(gl, ctx); // Pass the 2D context as the second parameter!
  renderer.textures = textures;

  //  SHADERS
  // Map everything explicitly to your actual SHADERS dictionary keys
  renderer.programs.static = safeCreateProgram(
    "static",
    SHADERS.staticVSH,
    SHADERS.staticFSH,
  );
  renderer.programs.dynamic = safeCreateProgram(
    "dynamic",
    SHADERS.dynamicVSH,
    SHADERS.dynamicFSH,
  );
  renderer.programs.bee = safeCreateProgram(
    "bee",
    SHADERS.beeVSH,
    SHADERS.beeFSH,
  );
  renderer.programs.flower = safeCreateProgram(
    "flower",
    SHADERS.flowerVSH,
    SHADERS.flowerFSH,
  );
  renderer.programs.token = safeCreateProgram(
    "token",
    SHADERS.tokenVSH,
    SHADERS.tokenFSH,
  );
  renderer.programs.particle = safeCreateProgram(
    "particle",
    SHADERS.particleRendererVSH,
    SHADERS.particleRendererFSH,
  );
  renderer.programs.text = safeCreateProgram(
    "text",
    SHADERS.textRendererVSH,
    SHADERS.textRendererFSH,
  );
  renderer.programs.mob = safeCreateProgram(
    "mob",
    SHADERS.mobRendererVSH,
    SHADERS.mobRendererFSH,
  );

  renderer.programs.explosion = safeCreateProgram(
    "explosion",
    SHADERS.explosionRendererVSH,
    SHADERS.explosionRendererFSH,
  );

  renderer.programs.trail = safeCreateProgram(
    "trail",
    SHADERS.trailRendererVSH,
    SHADERS.trailRendererFSH,
  );

  renderer.programs.mob = safeCreateProgram(
    "mob",
    SHADERS.mobRendererVSH,
    SHADERS.mobRendererFSH,
  );

  // Double check if your engine/renderer.js initializes a mob program lane:
  if (SHADERS.mobRendererVSH) {
    renderer.programs.mob = safeCreateProgram(
      "mob",
      SHADERS.mobRendererVSH,
      SHADERS.mobRendererFSH,
    );
  }
  // --- Add this temporary diagnostic block right BEFORE renderer.initCache ---
  console.log("--- WebGL Program Linking Status Audit ---");
  Object.keys(renderer.programs).forEach((key) => {
    const prog = renderer.programs[key];
    if (!prog) {
      console.warn(`⚠️ program '${key}' is completely null or undefined!`);
    } else {
      // Check if WebGL validates it as a real, linked program object
      const isProgram = gl.isProgram(prog);
      const linkStatus = gl.getProgramParameter(prog, gl.LINK_STATUS);
      console.log(
        `Program [${key}] -> Valid WebGL Object: ${isProgram}, Link Successful: ${linkStatus}`,
      );

      if (!linkStatus) {
        console.error(`❌ LINK FAILURE DETECTED ON PROGRAM: '${key}'!`);
        console.error("Program Info Log:", gl.getProgramInfoLog(prog));
      }
    }
  });
  console.log("------------------------------------------");

  // --- Keep this block right before renderer.initCache to stop any more hidden key crashes ---
  const masterEngineKeys = [
    "static",
    "dynamic",
    "bee",
    "flower",
    "token",
    "particle",
    "text",
    "mob",
    "explosion",
    "trail",
  ];

  masterEngineKeys.forEach((key) => {
    if (!renderer.programs[key]) {
      console.warn(
        `Genius Patch: Lane '${key}' was missing. Injecting fallback binary.`,
      );
      // If you didn't keep the dummyProgram from earlier, just map it to renderer.programs.static
      renderer.programs[key] = renderer.programs.static;
    }
  });

  // This is your line 202 where it crashes
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

  // 🛠️ THE GOLDEN SAFEGUARD:
  // Force-verify that the required engine state objects exist on gameState
  // right before passing it down to the world builder loop!
  if (!gameState.fieldInfo) gameState.fieldInfo = {};
  if (!gameState.flowers) gameState.flowers = {};

  // 🛠️ Step A: Create the CPU staging arrays that addFlower demands
  const flowerMeshDataStaging = {
    verts: [],
    index: [],
  };

  // 🛠️ Step B: FIELD_CONFIGS runs here
  FIELD_CONFIGS.forEach((f) => {
    createField(
      f.name, // Parameter 1: Field identifier string
      f, // Parameter 2: Pass the entire config object wrapper directly!
      gameState, // Parameter 3: Pass your main active global game state container
      flowerMeshDataStaging,
      // gameState.meshes.flowers, // Parameter 4: Pass your instanced flower mesh reference channel
    );
  });

  // 🛠️ Step C: Link the metadata lengths back to your mesh engine
  if (flowerMeshDataStaging.verts.length > 0) {
    console.log(
      `Successfully generated ${flowerMeshDataStaging.index.length / 3} procedural triangles.`,
    );

    // Pass the flat item count metadata directly to your active tracker
    gameState.meshes.flowers.vertCount = flowerMeshDataStaging.index.length;

    // NOTE: If you have an explicit vertex buffer upload step, call it here:
    // uploadToGPU(gl, gameState.meshes.flowers, flowerMeshDataStaging);
  }

  // 🛠️ Step D: Fire off the remaining asset placements
  initGameWorld(gameState); // Populates NPCs and Mobs  //ENGINE STARTUP --

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

  // CHQ: Gemini AI added
  // Attach Listeners ONCE (outside the loop)
  consumableIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => {
        useItem(id, gameState);
      });
    }
  });

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
