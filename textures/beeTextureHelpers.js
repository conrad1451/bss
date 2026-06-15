// textures/beeTextureHelpers.js

// CHQ: Gemini AI created functions

import { SIZE, HALF_SIZE, STRIP_H, TWO_PI } from "./beeTextureConstants";

// Reusable Helper Functions
export function reset(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export function fillEllipse(ctx, x, y, w, h, r = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, r, 0, 7);
  ctx.fill();
}

export function fillBezier(ctx, a, b, c, d, e, f, g, h, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(a, b);
  ctx.bezierCurveTo(c, d, e, f, g, h);
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

export function drawSpriteBackground(ctx, bgColor, stripeColor1, stripeColor2) {
  const SIZE = 128;
  const HALF_SIZE = SIZE / 2;
  const STRIP_H = (SIZE / 3) | 0;

  // Base texture (top block) is already filled outside this export function or via translation
  // Sub-texture bottom block (y: 128)
  ctx.fillStyle = stripeColor1;
  ctx.fillRect(0, SIZE, SIZE, SIZE);
  // Overlay horizontal stripes
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, SIZE - 1, SIZE, STRIP_H);
  ctx.fillStyle = stripeColor2 || bgColor;
  ctx.fillRect(0, 213, SIZE, STRIP_H + 1);
}

// export function drawEyes(ctx, xOffset, yPos, radiusX, radiusY) {
//   ctx.beginPath();
//   ctx.ellipse(HALF_SIZE - xOffset, yPos, radiusX, radiusY, 0, 0, 7);
//   ctx.ellipse(HALF_SIZE + xOffset, yPos, radiusX, radiusY, 0, 0, 7);
//   ctx.fill();
// }

export function drawEyes(ctx, cx, xOffset, yPos, radiusX, radiusY) {
  ctx.beginPath();
  ctx.ellipse(cx - xOffset, yPos, radiusX, radiusY, 0, 0, TWO_PI);
  ctx.ellipse(cx + xOffset, yPos, radiusX, radiusY, 0, 0, TWO_PI);
  ctx.fill();
}

export function drawMouthArc(ctx, yPos, startX, width) {
  ctx.beginPath();
  ctx.moveTo(HALF_SIZE - startX, yPos);
  ctx.bezierCurveTo(
    HALF_SIZE,
    yPos + width,
    HALF_SIZE,
    yPos + width,
    HALF_SIZE + startX,
    yPos,
  );
  ctx.stroke();
}
