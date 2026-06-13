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

// import { injectMenuHTML } from "./ui/components/menuLayout.js";
import { injectMainMenuLayout } from "./ui/components/pages/mainMenuLayout.js";
import { injectInfoLayout } from "./ui/components/pages/infoLayout.js";
import { injectSelectLayout } from "./ui/components/pages/selectLayout.js";

import { injectShopHTML } from "./ui/components/shopLayout.js";
import { injectAbilityUI } from "./ui/components/abilityLayout.js"; // CHQ: Gemini AI added this
import { injectAmuletUIWarnHTML } from "./ui/components/amuletUIWarnLayout.js";

import "./ui/style.css"; // CHQ: Claude AI: Vite automatically extracts and injects this

// CHQ: Gemini AI: moved canvas from the top of BeeSwarmSimulator to the top of index.js
//      so it is created exactly once when the page loads
const canvas = document.getElementById("gl-canvas");

// Define width/height based on window or fixed size
const width = window.innerWidth;
const height = window.innerHeight;

canvas.width = width;
canvas.height = height;

const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
console.log(
  "WebGL version:",
  gl instanceof WebGL2RenderingContext ? "WebGL2" : "WebGL1",
);
if (!(gl instanceof WebGL2RenderingContext)) {
  // Enable UNSIGNED_INT indices for WebGL1
  gl.getExtension("OES_element_index_uint");
}
if (!gl) {
  console.error("WebGL failed to initialize!");
}

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
  // 1. Grab the wrapper
  const uiWrapper = document.body;

  const gameState = createInitialState();
  // const gameState = createInitialState(saveData);

  // 2. Inject the HTML first so elements exist!
  // injectMenuHTML(uiWrapper);

  injectMainMenuLayout(uiWrapper);
  injectInfoLayout(uiWrapper);
  injectSelectLayout(uiWrapper);

  injectShopHTML(uiWrapper); // CHQ: Gemini AI made and imported function to generate hundreds of lines
  injectAmuletUIWarnHTML(uiWrapper); // CHQ: I made and imported function
  injectAbilityUI(uiWrapper); // CHQ: Gemini AI added this

  // initMainMenu(BeeSwarmSimulator);

  // 2. Use a microtask or a timeout to defer the initialization
  // This pushes initMainMenu to the back of the browser's "to-do" list
  // which allows the DOM to fully process the injections above.
  setTimeout(() => {
    initMainMenu(BeeSwarmSimulator);
    setupUserInterfaceListeners(gameState); // Assuming gameState is defined
  }, 0);
}

// --- 2. THE ENGINE ---
async function BeeSwarmSimulator(saveData) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const uiCanvas = document.getElementById("ui-canvas");

  if (!canvas || !uiCanvas) {
    console.error(
      "Critical Error: Required HTML5 canvases were not found in the DOM.",
    );
    return;
  }

  console.log("Starting simulator. Context valid:", !!gl);

  uiCanvas.width = width;
  uiCanvas.height = height;

  const gameState = createInitialState(saveData);

  gameState.player = new Player(gameState.player);

  const renderer = new Renderer(gl, canvas.width, canvas.height, SHADERS);
  const textRenderer = new TextRenderer(
    gl,
    renderer.glCache,
    renderer.programs,
  );

  // ASSET LOADING
  // Load textures and pass to renderer
  const ctx = uiCanvas.getContext("2d");

  // CHQ: Claude AI: added missing await key for async function to catch promise
  const textures = await loadTextures(gl);
  // const textures = await loadTextures(gl, ctx);
  console.log("loaded texture keys:", Object.keys(textures));
  renderer.textures = textures; //CHQ: handles renderer.textures.bees = textures.bees; and same for flowers and mobs

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

  try {
    // CHQ: Claude AI: Remove the duplicate initCache call from index.js — it should only be called once in the constructor.
    // renderer.initCache(renderer.programs);

    // --- D. GL STATE SETTINGS ---
    gl.viewport(0, 0, width, height);
    // gl.enable(gl.BLEND);  // CHQ: Claude AI: redundant since render handles it every frame anyway.
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // CHQ: Claude AI: redundant since render handles it every frame anyway.
    // gl.enable(gl.DEPTH_TEST); // CHQ: Claude AI: redundant since render handles it every frame anyway.
    gl.depthFunc(gl.LEQUAL);
    // gl.enable(gl.CULL_FACE);  // CHQ: Claude AI: redundant since render handles it every frame anyway.
    // gl.cullFace(gl.BACK);   // CHQ: Claude AI: redundant since render handles it every frame anyway.

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

    console.log("verts sample:", flowerMeshDataStaging.verts.slice(0, 8));
    // Also check the field config
    console.log("field configs:", FIELD_CONFIGS);

    // CHQ: Gemini AI: Handoff compiled mesh geometry to the GPU
    console.log("gl is WebGL2:", gl instanceof WebGL2RenderingContext);
    console.log("renderer.gl === gl:", renderer.gl === gl);
    renderer.uploadFlowerMesh(flowerMeshDataStaging);

    // CHQ: Claude AI added for testing
    console.log(
      "Flower staging verts (first 24 floats):",
      flowerMeshDataStaging.verts.slice(0, 24),
    );
    console.log(
      "Flower staging index (first 6):",
      flowerMeshDataStaging.index.slice(0, 6),
    );
    console.log("Total verts:", flowerMeshDataStaging.verts.length);
    console.log("Total indices:", flowerMeshDataStaging.index.length);

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
  } catch (err) {
    console.error("❌ FATAL ENGINE CRASH:", err);
  }
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

  // TODO: why am I calling createInitialState in both BeeSwarmSimulator and main?
  //       Shouldn't createInitialState be called once and then passed into both
  //       as arguments to their parameters?
  main();
});
