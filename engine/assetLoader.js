// engine/assetLoader.js

import { MATH } from "../utils/math.js"; // Added .js extension and verified pathing

// CHQ: Gemini AI generated file

// //  CHQ: Gemini AI generated function
// function drawRandomText(ctx, text) {
//   ctx.translate(MATH.random(12, 500), MATH.random(12, 500));
//   ctx.scale((Math.random() + 0.5) * 3, (Math.random() + 0.5) * 3);
//   ctx.rotate(Math.random() * 6.28);
//   ctx.fillText(text, 0, 0);
//   ctx.setTransform(1, 0, 0, 1, 0, 0);
// }

//  CHQ: Gemini AI generated function
// Helper to draw random text noise
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

//  CHQ: Gemini AI generated function
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

// CHQ: Gemini AI added: A tiny helper to yield execution back to the browser event loop
const yieldToBrowser = () => new Promise((resolve) => setTimeout(resolve, 0));

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

// CHQ: Gemini AI: Updated to fully encapsulate texture generation on an isolated offscreen canvas buffer

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
