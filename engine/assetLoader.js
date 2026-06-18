// engine/assetLoader.js

import { MATH } from "../utils/math.js"; // Added .js extension and verified pathing

// CHQ: Gemini AI generated file
// CHQ: Claude AI (Haiku) generated JSDocs

// //  CHQ: Gemini AI generated function
// function drawRandomText(ctx, text) {
//   ctx.translate(MATH.random(12, 500), MATH.random(12, 500));
//   ctx.scale((Math.random() + 0.5) * 3, (Math.random() + 0.5) * 3);
//   ctx.rotate(Math.random() * 6.28);
//   ctx.fillText(text, 0, 0);
//   ctx.setTransform(1, 0, 0, 1, 0, 0);
// }

/**
 * Draws randomly transformed text on a canvas context.
 * Used for creating visual noise and hidden easter eggs in textures.
 *
 * @param {CanvasRenderingContext2D} ctx - The 2D canvas rendering context
 * @param {string} text - The text string to draw (supports unicode characters)
 * @returns {void}
 *
 * @example
 * // Draw Thai text with random position, scale, and rotation
 * drawRandomText(canvasContext, "คาร์ลสันไม่เคยตาย");
 */
function drawRandomText(ctx, text) {
  // Simple check in case a custom math helper isn't globally available yet
  const randX = Math.random() * 488 + 12;
  const randY = Math.random() * 488 + 12;

  ctx.translate(randX, randY);
  ctx.scale((Math.random() + 0.5) * 3, (Math.random() + 0.5) * 3);
  ctx.rotate(Math.random() * 6.28);
  ctx.fillText(text, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

/**
 * Generates procedural noise and hidden easter egg text on a canvas.
 * Creates "dirt" patches with semi-transparent black rectangles and overlays
 * hidden Thai text messages at random positions and scales.
 *
 * @param {CanvasRenderingContext2D} tex_ctx - The 2D canvas rendering context to draw noise onto
 * @returns {void}
 *
 * @remarks
 * This function includes easter eggs:
 * - "Carlson never dies" (คาร์ลสันไม่เคยตาย in Thai)
 * - "Dat is a very cool person" (ดาท เป็นเจ๋งคนมาก in Thai)
 */
export function generateDefaultNoise(tex_ctx) {
  for (let i = 0; i < 10; i++) {
    // Draw random "dirt" patches
    tex_ctx.fillStyle = "rgba(0,0,0," + Math.random() * 0.2 + ")";
    tex_ctx.fillRect(
      MATH.random(12, 500),
      MATH.random(12, 500),
      MATH.random(25, 45),
      MATH.random(25, 45),
    );

    // Draw the hidden Thai text easter eggs
    tex_ctx.fillStyle = "rgba(0,0,0,0.015)";

    // "Carlson never dies"
    drawRandomText(tex_ctx, "คาร์ลสันไม่เคยตาย");

    // "Dat is a very cool person"
    drawRandomText(tex_ctx, "ดาท เป็นเจ๋งคนมาก");
  }
}

/**
 * Yields control back to the browser event loop without blocking.
 * Allows the browser to process user input, animations, and other tasks
 * while long-running texture generation operations are in progress.
 *
 * @returns {Promise<void>} A promise that resolves after yielding to the event loop
 * @private
 */
const yieldToBrowser = () => new Promise((resolve) => setTimeout(resolve, 0));

// For the function, the JSDoc (including function signature line) takes
// Tokens: 379 (368 without function signature line)
// Characters: 1684 (1636 without function signature line)
// 4.42295082 characters per token

// For the actual code:
// Tokens: 185
// Characters: 811
// 4.38378378 characters per token

// Source: https://platform.openai.com/tokenizer

/**
 * Loads and generates all texture atlases for the 3D world and UI.
 * Generates procedural textures including default noise, effects, flora, fonts,
 * entities, and UI decals using external window-scoped texture generator functions.
 *
 * @async
 * @param {WebGLRenderingContext} gl - The WebGL rendering context
 * @param {CanvasRenderingContext2D} tex_ctx - The offscreen 2D canvas context for texture generation
 * @returns {Promise<Object>} An object containing named WebGLTexture references
 * @returns {WebGLTexture} returns.default - Base world/surface texture with noise
 * @returns {WebGLTexture} returns.effects - Special effects atlas texture
 * @returns {WebGLTexture} returns.flowers - Flora and flower sprites texture
 * @returns {WebGLTexture} returns.text - Font atlas with alphanumeric characters
 * @returns {WebGLTexture} returns.bees - Bee sprite atlas texture
 * @returns {WebGLTexture} returns.decals - UI decals and environmental detail textures
 * @returns {WebGLTexture} returns.bear - NPC/character textures
 *
 * @remarks
 * This function expects the following window-scoped texture generator functions to exist:
 * - window.textures_effects()
 * - window.textures_flowers()
 * - window.textures_bees()
 * - window.textures_decals()
 * - window.textures_bear()
 *
 * Each generator is called with the canvas context before texture creation.
 * Uses yieldToBrowser() to prevent blocking the event loop during large texture operations.
 *
 * @example
 * const gl = canvas.getContext('webgl');
 * const textures = await loadTexture(gl, canvasContext);
 * gl.bindTexture(gl.TEXTURE_2D, textures.default);
 */
export async function loadTexture(gl, tex_ctx) {
  const out = {};

  // 1. Clear the scratchpad canvas
  tex_ctx.clearRect(0, 0, 2048, 2048);

  // // 2. Generate Default/World Textures
  // // This part includes the "Carlson never dies" easter egg logic
  // out.default = gl.createTexture();
  // gl.bindTexture(gl.TEXTURE_2D, out.default);
  // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, tex_ctx.getImageData(0, 0, 512, 512));
  // gl.generateMipmap(gl.TEXTURE_2D);

  // 2. Generate Default/World Noise
  generateDefaultNoise(tex_ctx);

  // CHQ: Gemini AI added: Create default fallback surface so the 3D world map isn't pitch black
  out.default = createGLTexture(gl, tex_ctx, 512);
  await yieldToBrowser();

  // 3. Load Specialized Atlases
  // Effects, Flowers, and Bees depend on external window functions
  if (typeof window.textures_effects === "function")
    window.textures_effects(tex_ctx);
  out.effects = createGLTexture(gl, tex_ctx, 2048);
  // CHQ: Gemini AI added:
  await yieldToBrowser();

  console.log("textures_flowers defined:", typeof window.textures_flowers);
  if (typeof window.textures_flowers === "function")
    window.textures_flowers(tex_ctx);
  out.flowers = createGLTexture(gl, tex_ctx, 1024, 1024, gl.CLAMP_TO_EDGE);
  // CHQ: Gemini AI added:
  await yieldToBrowser();

  // window.textures_flowers(tex_ctx);
  // out.flowers = createGLTexture(gl, tex_ctx, 1024, gl.CLAMP_TO_EDGE);

  // 4. Generate Font Atlas (The character set)
  // This draws the alphabet and symbols to the canvas context
  tex_ctx.clearRect(0, 0, 512, 600);
  tex_ctx.font = "bold 60px arial";
  tex_ctx.fillStyle = "rgb(255,255,255)";
  tex_ctx.strokeStyle = "rgb(0,0,0)";
  tex_ctx.lineWidth = 9;
  tex_ctx.textAlign = "center";
  tex_ctx.textBaseline = "middle";

  // Quick test string initialization if needed
  tex_ctx.fillText("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 256, 300);
  out.text = createGLTexture(gl, tex_ctx, 512, 600);
  // CHQ: Gemini AI added:
  await yieldToBrowser();

  // 5. Generate Bee Textures
  if (typeof window.textures_bees === "function") window.textures_bees(tex_ctx);
  out.bees = createGLTexture(gl, tex_ctx, 2048);
  // window.textures_bees(tex_ctx);
  // out.bees = createGLTexture(gl, tex_ctx, 2048);

  // 6. Generate UI Decals and NPC Textures

  if (typeof window.textures_decals === "function")
    window.textures_decals(tex_ctx);
  out.decals = createGLTexture(gl, tex_ctx, 1024);
  // CHQ: Gemini AI added:
  await yieldToBrowser();

  if (typeof window.textures_bear === "function") window.textures_bear(tex_ctx);
  out.bear = createGLTexture(gl, tex_ctx, 1024);

  // window.textures_decals(tex_ctx);
  // out.decals = createGLTexture(gl, tex_ctx, 1024);

  // window.textures_bear(tex_ctx);
  // out.bear = createGLTexture(gl, tex_ctx, 1024);

  return out;
}

// For the function, the JSDoc (including function signature line) takes
// Tokens: 305 (297 without function signature line)
// Characters: 1349 (1308 without function signature line)
// 4.42295082 characters per token

// For the actual code:
// Tokens: 185
// Characters: 811
// 4.38378378 characters per token

// Source: https://platform.openai.com/tokenizer

/**
 * Entry point for texture asset loading. Creates an isolated offscreen canvas
 * and delegates texture generation to loadTexture().
 *
 * @async
 * @param {WebGLRenderingContext} gl - The WebGL rendering context
 * @returns {Promise<Object>} An object containing all named WebGLTexture references
 * @returns {WebGLTexture} returns.default - Base world/surface texture with noise
 * @returns {WebGLTexture} returns.effects - Special effects atlas texture
 * @returns {WebGLTexture} returns.flowers - Flora and flower sprites texture
 * @returns {WebGLTexture} returns.text - Font atlas with alphanumeric characters
 * @returns {WebGLTexture} returns.bees - Bee sprite atlas texture
 * @returns {WebGLTexture} returns.decals - UI decals and environmental detail textures
 * @returns {WebGLTexture} returns.bear - NPC/character textures
 *
 * @remarks
 * Creates a private offscreen canvas (2048x2048) to prevent texture generation
 * operations from interfering with the main DOM or active UI elements.
 * All drawing operations are performed on this isolated canvas before being
 * uploaded to WebGL textures.
 *
 * @example
 * const gl = canvas.getContext('webgl');
 * const textures = await loadTextures(gl);
 * gl.activeTexture(gl.TEXTURE0);
 * gl.bindTexture(gl.TEXTURE_2D, textures.default);
 */
export async function loadTextures(gl) {
  // export function loadTextures(gl) {
  // export function loadTextures(gl, tex_ctx) {
  // 1. Force texture compilation onto a dedicated offscreen canvas board.
  // This guarantees that canvas context clearing/drawing operations don't leak or override
  // active start menus or target UI elements on your index page.
  const privateOffscreenCanvas = document.createElement("canvas");
  privateOffscreenCanvas.width = 2048;
  privateOffscreenCanvas.height = 2048;
  const privateContext = privateOffscreenCanvas.getContext("2d");

  // 2. Clear the private workspace
  privateContext.clearRect(0, 0, 2048, 2048);

  // 3. Compile the procedural rendering pipelines using the private canvas context and return the map
  return await loadTexture(gl, privateContext);
}

// Internal helper for repetitive WebGL texture boiler-plate
function createGLTexture(gl, ctx, width, height = width, wrapMode = gl.REPEAT) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    ctx.getImageData(0, 0, width, height),
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapMode);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapMode);
  gl.generateMipmap(gl.TEXTURE_2D);
  return tex;
}
