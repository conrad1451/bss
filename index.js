// index.js

import { createInitialState } from "./state/gameState.js";

import { Renderer } from "./engine/renderer.js";
import { TextRenderer } from "./engine/textRenderer.js";
import { updateEngine } from "./engine/updateEngine.js";
import { loadTextures } from "./engine/assetLoader.js";

import { createField } from "./engine/world.js";
import { useItem } from "./engine/inventory.js";
import { SHADERS } from "./engine/shaders.js";
// import { createEngine } from "./engine/index.js";

import { initMainMenu, setupUserInterfaceListeners } from "./ui/menu.js";
import { updateQuestUI } from "./ui/questRenderer.js";

import { initInputHandlers } from "./utils/input.js";

import { mobDefinitions } from "./data/mobData.js"; // Optional: keep data separate
import { FIELD_CONFIGS } from "./data/fieldData.js";

import { Player } from "./entities/Player.js";
import { NPC } from "./entities/npcs.js";
import { Mob, MondoChick } from "./entities/mobs.js";
import { createGameLoop } from "./engine/gameLoop.js";

import { injectMenuHTML } from "./ui/components/menuLayout.js";
import { injectShopHTML } from "./ui/components/shopLayout.js";
import { injectAmuletUIWarnHTML } from "./ui/components/amuletUIWarnLayout.js";

import "./ui/style.css"; // CHQ: Claude AI: Vite automatically extracts and injects this

function initGameWorld(gameState) {
  // 1. Initialize Mobs
  // Instead of raw objects, we now use the Mob class
  mobDefinitions.forEach((m) => {
    const mobInstance =
      m.type === "mondo"
        ? new MondoChick(m.id, m.pos, m.hp, m.lvl, gameState)
        : new Mob(m.id, m.type, m.pos, m.hp, m.lvl, gameState);

    gameState.objects.mobs.push(mobInstance);
  });

  // 2. Initialize NPCs (Bears/Shopkeepers)
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

  if (!canvas || !uiCanvas) {
    console.error(
      "Critical Error: Required HTML5 canvases were not found in the DOM.",
    );
    return;
  }

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

  // --- 2. DYNAMICALLY INJECT MODULAR UI OVERLAYS NOW ---
  // The canvases are safely bound to WebGL contexts, so we can build the UI panels!
  // Grab the body or a UI wrapper element
  const uiWrapper = document.body;

  // Cleanly inject your massive interface modules
  injectMenuHTML(uiWrapper); // CHQ: Gemini AI made and imported function to generate hundreds of lines
  injectShopHTML(uiWrapper); // CHQ: Gemini AI made and imported function to generate hundreds of lines
  injectAmuletUIWarnHTML(uiWrapper); // CHQ: I made and imported function

  // --- B. STATE & SYSTEMS ---
  // 1. Initialize the baseline state tree
  const gameState = createInitialState(saveData);

  // 2. Upgrade the raw player object with class methods 💎
  gameState.player = new Player(gameState.player);

  // // Define width/height based on window or fixed size
  // const width = window.innerWidth;
  // const height = window.innerHeight;

  // canvas.width = width;
  // canvas.height = height;
  // uiCanvas.width = width;
  // uiCanvas.height = height;

  // --- B. RENDERER INITIALIZATION ---
  const renderer = new Renderer(gl, canvas.width, canvas.height, SHADERS);
  const textRenderer = new TextRenderer(
    gl,
    renderer.glCache,
    renderer.programs,
  );

  // ASSET LOADING
  // Load textures and pass to renderer
  const textures = loadTextures(gl, ctx); // Pass the 2D context as the second parameter!
  renderer.textures = textures;

  // --- C. WEBGL PROGRAM AUDIT & PATCHES ---
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

  // --- D. GL STATE SETTINGS ---
  gl.viewport(0, 0, width, height);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  // --- E. WORLD & INPUT ---
  // initInputHandlers(gameState, uiCanvas); // Attach Input listeners

  // 🛠️ THE GOLDEN SAFEGUARD:
  // Force-verify that the required engine state objects exist on gameState
  // right before passing it down to the world builder loop!
  if (!gameState.fieldInfo) gameState.fieldInfo = {};
  if (!gameState.flowers) gameState.flowers = {};

  const flowerMeshDataStaging = {
    verts: [],
    index: [],
  };

  // Build the fileds and pass data into staging
  FIELD_CONFIGS.forEach((f) => {
    createField(
      f.name, // Parameter 1: Field identifier string
      f, // Parameter 2: Pass the entire config object wrapper directly!
      gameState, // Parameter 3: Pass your main active global game state container
      flowerMeshDataStaging,
      // gameState.meshes.flowers, // Parameter 4: Pass your instanced flower mesh reference channel
    );
  });

  // CHQ: Gemini AI: Handoff compiled mesh geometry to the GPU
  renderer.uploadFlowerMesh(flowerMeshDataStaging);

  // 🛠️ ---------------- Step F: ENGINE STARTUP & EVENT LISTENERS -----------------
  initGameWorld(gameState); // Populates NPCs and Mobs  //ENGINE STARTUP --
  initInputHandlers(gameState, uiCanvas); // Attach Input listeners
  setupUserInterfaceListeners(gameState);

  // --- 7. GAME LOOP ---
  // const engine = createEngine(gameState, renderer, updateEngine);
  // engine.start();

  // const engineLoop = createGameLoop(updateEngine, renderer.render, gameState);
  const engineLoop = createGameLoop(
    updateEngine,
    (state, dt) => renderer.render(state, dt),
    gameState,
  );

  // Start it immediately for vanilla execution
  engineLoop.start();
}

// --- 3. LIFECYCLE ---
window.addEventListener("load", () => {
  // CHQ: Gemini AI: Add this block right here to intercept mobile pinch-to-zoom ghosting
  document.addEventListener(
    "touchmove",
    (e) => {
      if (e.scale && e.scale !== 1) {
        e.preventDefault();
      }
    },
    { passive: false },
  );

  main();
});
