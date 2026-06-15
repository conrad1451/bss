// beeTextures.js

import {
  reset,
  fillEllipse,
  fillBezier,
  drawSpriteBackground,
  drawEyes,
  drawMouthArc,
} from "./beeTextureHelpers";

import { SIZE, HALF_SIZE, STRIP_H, TWO_PI } from "./beeTextureConstants";

// CHQ: Gemini AI created function
export function drawNormalBee(tex_ctx) {
  tex_ctx.save();
  tex_ctx.fillStyle = "rgb(33, 20, 1)";
  tex_ctx.fillRect(0, 0, 128, 128);
  tex_ctx.strokeStyle = "rgb(220,220,220)";
  tex_ctx.lineWidth = 9;
  tex_ctx.lineCap = "round";
  tex_ctx.lineJoin = "round";
  tex_ctx.beginPath();
  tex_ctx.moveTo(128 / 2 - 128 / 5, 30);
  tex_ctx.lineTo(128 / 2 - 128 / 5, 50);
  tex_ctx.moveTo(128 / 2 + 128 / 5, 30);
  tex_ctx.lineTo(128 / 2 + 128 / 5, 50);
  tex_ctx.closePath();
  tex_ctx.moveTo(128 / 2, 100);
  tex_ctx.lineTo(128 / 2 - 128 / 5, 80);
  tex_ctx.moveTo(128 / 2, 100);
  tex_ctx.lineTo(128 / 2 + 128 / 5, 80);
  tex_ctx.stroke();
  tex_ctx.restore();

  //   tex_ctx.fillStyle = "rgb(237, 233, 9)";
  //   tex_ctx.fillRect(0, 128, 128, 128);
  //   tex_ctx.fillStyle = "rgb(33, 20, 1)";
  //   tex_ctx.fillRect(0, 128 - 1, 128, (128 / 3) | 0);
  //   tex_ctx.fillRect(0, 213, 128, (128 / 3) | (0 + 1));
}

// CHQ: Gemini AI created function
export function drawGreenBee(tex_ctx) {
  tex_ctx.save();

  tex_ctx.fillStyle = "rgb(0,200,60)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE); // Standardize coordinates to start at (0,0)
  tex_ctx.strokeStyle = "rgb(255,255,255)";
  tex_ctx.lineWidth = 18;
  tex_ctx.beginPath();
  tex_ctx.moveTo(HALF_SIZE - 25.6, 30);
  tex_ctx.lineTo(HALF_SIZE - 25.6, 50);
  tex_ctx.moveTo(HALF_SIZE + 25.6, 30);
  tex_ctx.lineTo(HALF_SIZE + 25.6, 50);
  tex_ctx.closePath();
  tex_ctx.stroke();
  tex_ctx.strokeStyle = "rgb(0,0,0)";
  tex_ctx.lineWidth = 9;
  tex_ctx.beginPath();
  tex_ctx.moveTo(HALF_SIZE - 25.6 - 4, 45);
  tex_ctx.lineTo(HALF_SIZE - 25.6 - 4, 53);
  tex_ctx.moveTo(HALF_SIZE - 25.6 + 45, 45);
  tex_ctx.lineTo(HALF_SIZE - 25.6 + 45, 53);
  tex_ctx.closePath();
  tex_ctx.stroke();

  tex_ctx.restore();
}

// CHQ: Gemini AI created function
// darkBee, aka blackWasp
export function drawDarkBee(tex_ctx) {
  tex_ctx.save();

  tex_ctx.fillStyle = "rgb(10,10,10)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.strokeStyle = "rgb(255,255,255)";
  tex_ctx.lineWidth = 4;
  tex_ctx.translate(0, -13);
  tex_ctx.beginPath();
  tex_ctx.moveTo(HALF_SIZE - 25.6 + 246, 86);
  tex_ctx.lineTo(HALF_SIZE - 25.6 + 250, 53);
  tex_ctx.lineTo(HALF_SIZE - 25.6 + 256, 62);
  tex_ctx.moveTo(HALF_SIZE - 25.6 + 319, 59);
  tex_ctx.lineTo(HALF_SIZE - 25.6 + 322, 27);
  tex_ctx.lineTo(HALF_SIZE - 25.6 + 328, 39);
  tex_ctx.moveTo(HALF_SIZE - 25.6 + 256, 94);
  tex_ctx.bezierCurveTo(
    HALF_SIZE - 25.6 + 270,
    114,
    HALF_SIZE - 25.6 + 314,
    109,
    HALF_SIZE - 25.6 + 310,
    74,
  );
  tex_ctx.stroke();
  tex_ctx.beginPath();
  fillEllipse(tex_ctx, 279, 89, 8, 6, -0.2, 0, 7);
  fillEllipse(tex_ctx, 352, 59, 8, 6, -0.2, 0, 7);
  tex_ctx.moveTo(0, 0);
  fillEllipse(tex_ctx, 365, 62, 2, 2, -0.2, 0, 7);
  tex_ctx.closePath();
  tex_ctx.translate(0, 13);
  tex_ctx.fillStyle = "rgb(255,255,255)";
  tex_ctx.fill();

  tex_ctx.restore();
}

export function drawRedAnt(tex_ctx) {
  tex_ctx.fillStyle = "rgb(190,0,0)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.strokeStyle = tex_ctx.fillStyle = "rgb(235, 66, 9)";
  tex_ctx.lineWidth = 3;
  tex_ctx.beginPath();
  tex_ctx.translate(63, -5);
  for (let s = 0; s < 2; s++) {
    tex_ctx.moveTo(HALF_SIZE - 30, 50);
    tex_ctx.lineTo(HALF_SIZE - 35, 35);
    tex_ctx.moveTo(HALF_SIZE - 40, 50);
    tex_ctx.lineTo(HALF_SIZE - 35, 35);
    tex_ctx.moveTo(HALF_SIZE - 40, 50);
    tex_ctx.bezierCurveTo(
      HALF_SIZE - 40,
      66,
      HALF_SIZE - 20,
      66,
      HALF_SIZE - 20,
      50,
    );
    tex_ctx.arc(20, 29, 0, 0, 6);
    if (s === 0) tex_ctx.scale(-1, 1);
  }
  tex_ctx.closePath();
  tex_ctx.stroke();
  tex_ctx.fill();
  tex_ctx.scale(-1, 1);
  tex_ctx.translate(-65, 5);
  tex_ctx.beginPath();
  for (let k = 0; k < 7; k++) {
    tex_ctx.moveTo(SIZE * 0.5 - 35, 90);
    tex_ctx.lineTo(SIZE * 0.5 - 30, 105);
    tex_ctx.lineTo(SIZE * 0.5 - 25, 90);
    tex_ctx.translate(10, 0);
  }
  tex_ctx.stroke();
  //   tex_ctx.translate(-58, 0);

  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawBlueButterfly(tex_ctx) {
  tex_ctx.fillStyle = "rgb(70, 183, 240)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.strokeStyle = "rgb(15, 136, 212)";
  tex_ctx.lineWidth = 10;
  tex_ctx.beginPath();
  tex_ctx.moveTo(SIZE * 0.5 - 35, 59);
  tex_ctx.bezierCurveTo(56, 62, 44, 39, SIZE * 0.5 - 35, 28);
  tex_ctx.translate(55, 0);
  tex_ctx.moveTo(SIZE * 0.5 - 35, 59);
  tex_ctx.bezierCurveTo(56, 62, 44, 39, SIZE * 0.5 - 35, 28);
  tex_ctx.translate(-55, 0);
  tex_ctx.moveTo(SIZE * 0.5 - 10, 104);
  tex_ctx.bezierCurveTo(89, 110, 69, 86, SIZE * 0.5 - 5, 86);
  tex_ctx.bezierCurveTo(40, 85, 45, 102, SIZE * 0.5 - 11, 104);
  tex_ctx.fill();
  tex_ctx.stroke();

  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawLightMoth(tex_ctx) {
  tex_ctx.fillStyle = "rgb(220,220,220)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.strokeStyle = "rgb(0,0,0)";
  tex_ctx.lineWidth = 3.5;
  tex_ctx.beginPath();
  tex_ctx.translate(4, 0);
  for (let m = 0; m < 2; m++) {
    tex_ctx.moveTo(36, 30);
    tex_ctx.bezierCurveTo(25, 17, 15, 47, 30, 56);
    tex_ctx.bezierCurveTo(50, 55, 36, 32, 33, 45);
    if (m === 0) tex_ctx.translate(50, 0);
  }
  tex_ctx.translate(-54, 0);
  tex_ctx.fill();
  tex_ctx.stroke();

  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawGogglesInsect(tex_ctx) {
  tex_ctx.fillStyle = "rgb(220,220,220)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.strokeStyle = tex_ctx.fillStyle = "rgb(0,0,0)";
  tex_ctx.lineWidth = 3;
  tex_ctx.beginPath();
  fillEllipse(tex_ctx, SIZE * 0.5 - 30, 40, 15, 13, 0, 0, 7);
  tex_ctx.rect(0, 35, SIZE, 8);
  fillEllipse(tex_ctx, SIZE * 0.5 + 30, 40, 15, 13, 0, 0, 7);
  tex_ctx.fill();
  tex_ctx.stroke();
  tex_ctx.strokeStyle = "rgb(220,220,220)";
  tex_ctx.lineWidth = 5;
  tex_ctx.beginPath();
  tex_ctx.moveTo(SIZE * 0.5 - 30, 32);
  tex_ctx.bezierCurveTo(
    SIZE * 0.5 - 36,
    35,
    SIZE * 0.5 - 35,
    32,
    SIZE * 0.5 - 40,
    40,
  );
  tex_ctx.translate(61, 0);
  tex_ctx.moveTo(SIZE * 0.5 - 30, 32);
  tex_ctx.bezierCurveTo(
    SIZE * 0.5 - 36,
    35,
    SIZE * 0.5 - 35,
    32,
    SIZE * 0.5 - 40,
    40,
  );
  tex_ctx.translate(-61, 0);
  tex_ctx.stroke();

  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawBeetle(tex_ctx) {
  tex_ctx.fillStyle = "rgb(176, 128, 74)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.strokeStyle = "rgb(125, 78, 24)";
  tex_ctx.lineWidth = 3;
  tex_ctx.beginPath();
  tex_ctx.translate(32, 20);
  for (let loop = 0; loop < 2; loop++) {
    for (
      let i = -0.71, j = 0, inc = (Math.PI * 2) / 34;
      i < Math.PI * 2 * 0.18;
      i += inc, j++
    ) {
      let ri = (j - 1) % 2 === 0 ? 25 : 28;
      let r = j % 2 === 0 ? 22 : 31;
      tex_ctx.moveTo(Math.sin(i - inc) * ri, Math.cos(i - inc) * ri);
      tex_ctx.lineTo(Math.sin(i) * r, Math.cos(i) * r);
    }
    if (loop === 0) tex_ctx.translate(60, 0);
  }
  tex_ctx.stroke();
  tex_ctx.translate(-32, 60);
  tex_ctx.beginPath();
  for (
    let i = -0.74, j = 0, inc = (Math.PI * 2) / 39;
    i < Math.PI * 2 * 0.17;
    i += inc, j++
  ) {
    let ri = (j - 1) % 2 === 0 ? 25 : 28;
    let r = j % 2 === 0 ? 22 : 31;
    tex_ctx.moveTo(Math.sin(i - inc) * ri * 1.5, Math.cos(i - inc) * ri);
    tex_ctx.lineTo(Math.sin(i) * r * 1.5, Math.cos(i) * r);
  }
  tex_ctx.lineWidth = 5;
  tex_ctx.stroke();
  //   tex_ctx.translate(-32 - 28, -80);

  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawGhostlyMask(tex_ctx) {
  tex_ctx.fillStyle = "rgb(0,0,0)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.strokeStyle = "rgb(205,205,205)";
  tex_ctx.lineWidth = 4;
  tex_ctx.beginPath();
  tex_ctx.moveTo(2, 20);
  tex_ctx.bezierCurveTo(
    HALF_SIZE,
    HALF_SIZE - 40,
    HALF_SIZE,
    HALF_SIZE - 40,
    126,
    20,
  );
  tex_ctx.moveTo(HALF_SIZE - 25, 45);
  tex_ctx.lineTo(HALF_SIZE - 25, 60);
  tex_ctx.moveTo(HALF_SIZE + 25, 45);
  tex_ctx.lineTo(HALF_SIZE + 25, 60);
  tex_ctx.moveTo(HALF_SIZE - 30, 100);
  tex_ctx.bezierCurveTo(
    HALF_SIZE,
    HALF_SIZE + 30,
    HALF_SIZE,
    HALF_SIZE + 30,
    HALF_SIZE + 30,
    100,
  );
  tex_ctx.moveTo(HALF_SIZE - 33, 95);
  tex_ctx.lineTo(HALF_SIZE - 29, 106);
  tex_ctx.moveTo(HALF_SIZE + 33, 95);
  tex_ctx.lineTo(HALF_SIZE + 29, 106);
  tex_ctx.stroke();

  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawRedDemon(tex_ctx) {
  tex_ctx.fillStyle = "rgb(200,0,0)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.strokeStyle = tex_ctx.fillStyle = "rgb(80,0,0)";
  tex_ctx.lineWidth = 4;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE - 5);
  tex_ctx.beginPath();
  for (let d = 0; d < 2; d++) {
    tex_ctx.moveTo(-40, -41);
    tex_ctx.lineTo(-35, 4);
    tex_ctx.lineTo(-26, 20);
    tex_ctx.lineTo(-23, -32);
    tex_ctx.lineTo(-32, -23);
    if (d === 0) tex_ctx.scale(-1, 1);
  }
  tex_ctx.fill();
  tex_ctx.translate(0, 4);
  tex_ctx.beginPath();
  tex_ctx.moveTo(54, 16);
  tex_ctx.lineTo(44, 30);
  tex_ctx.moveTo(-54, 16);
  tex_ctx.lineTo(-44, 30);
  tex_ctx.moveTo(-19, 37);
  tex_ctx.lineTo(-10, 40);
  tex_ctx.lineTo(0, 50);
  tex_ctx.lineTo(10, 40);
  tex_ctx.lineTo(18, 37);
  tex_ctx.stroke();
  tex_ctx.translate(0, 2);
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before

  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawGreyWeevil(tex_ctx) {
  tex_ctx.fillStyle = "rgb(220,220,220)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.fillStyle = "rgb(120,120,120)";
  tex_ctx.lineWidth = 4;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.beginPath();
  tex_ctx.moveTo(-HALF_SIZE, -HALF_SIZE);
  tex_ctx.bezierCurveTo(-28, -58, 0, 0, 0, 10);
  tex_ctx.bezierCurveTo(0, 0, -28 + HALF_SIZE, -58, HALF_SIZE, -HALF_SIZE);
  tex_ctx.fill();
  tex_ctx.beginPath();
  tex_ctx.moveTo(-20, -18);
  tex_ctx.lineTo(-13, -6);
  tex_ctx.moveTo(20, -18);
  tex_ctx.lineTo(13, -6);
  tex_ctx.strokeStyle = "rgb(0,0,0)";
  tex_ctx.stroke();
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before

  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawAquaShieldBug(tex_ctx) {
  ctx.translate(SIZE * 11, 0);

  tex_ctx.fillStyle = "rgb(27, 219, 145)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(58, 125, 166)";
  tex_ctx.lineWidth = 7;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.beginPath();
  for (let b = 0; b < 2; b++) {
    let sign = b === 0 ? -1 : 1;
    tex_ctx.moveTo(sign * 30, -35);
    tex_ctx.bezierCurveTo(sign * 40, -20, sign * 40, -15, sign * 30, -20);
    tex_ctx.bezierCurveTo(sign * 20, -2, sign * 20, -35, sign * 30, -35);
    tex_ctx.moveTo(sign * 30, -35);
    tex_ctx.lineTo(sign * 34, -11);
    tex_ctx.lineTo(sign * 25, -30);
    tex_ctx.lineTo(sign * 37, -23);
  }
  for (
    let i = -0.74, j = 0, inc = (Math.PI * 2) / 39;
    i < Math.PI * 2 * 0.17;
    i += inc, j++
  ) {
    let r = 29 + Math.sin(i * 183) * 3;
    tex_ctx.moveTo(Math.sin(i - inc) * r, Math.cos(i - inc) * r);
    tex_ctx.lineTo(Math.sin(i) * r, Math.cos(i) * r);
  }
  tex_ctx.stroke();
  tex_ctx.strokeStyle = "rgb(27, 219, 145)";
  tex_ctx.lineWidth = 4;
  tex_ctx.beginPath();
  tex_ctx.moveTo(-30, -30);
  tex_ctx.bezierCurveTo(-30, -33, -34, -20, -31, -20);
  tex_ctx.moveTo(30, -30);
  tex_ctx.bezierCurveTo(30, -33, 34, -20, 31, -20);
  tex_ctx.stroke();
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawAbstractBlueOrganism(tex_ctx) {
  ctx.translate(SIZE * 12, 0);

  tex_ctx.fillStyle = "rgb(23, 118, 235)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(23, 197, 255)";
  tex_ctx.lineWidth = 13;
  tex_ctx.scale(0.3, 0.3);
  tex_ctx.translate(-92, -62);
  tex_ctx.fillStyle = "rgb(12, 168, 240)";
  ellipse(tex_ctx, 186, 172, 18, 18);
  ellipse(tex_ctx, 413, 135, 18, 18);
  tex_ctx.fillStyle = "rgb(23, 197, 255)";
  ellipse(tex_ctx, 315, 261, 33, 33);
  bezier(159, 238, 181, 223, 187, 216, 233, 227, false, true);
  bezier(178, 212, 225, 223, 187, 216, 233, 227, false, true);
  tex_ctx.translate(0, 25);
  bezier(406, 211, 496, 190, 382, 104, 431, 198, true, true);
  tex_ctx.lineWidth = 20;
  bezier(273, 325, 276, 416, 422, 355, 369, 299, true, true);
  bezier(250, 311, 289, 343, 378, 301, 373, 295, false, true);
  tex_ctx.beginPath();
  tex_ctx.fill();
  tex_ctx.fillStyle = "rgb(23, 118, 235)";
  ellipse(tex_ctx, 416, 182, 9.5, 15.5);
  tex_ctx.translate(92, 38);
  tex_ctx.scale(1 / 0.3, 1 / 0.3);

  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawNeonPinkGreenMystery(tex_ctx) {
  ctx.translate(SIZE * 13, 0);

  tex_ctx.fillStyle = "rgb(255,50,255)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.strokeStyle = "rgb(30,255,100)";
  tex_ctx.lineWidth = 11;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.beginPath();
  tex_ctx.moveTo(-30, -30);
  tex_ctx.bezierCurveTo(-28, -44, -12, -10, -32, -11);
  tex_ctx.moveTo(16, -34);
  tex_ctx.bezierCurveTo(39, -26, 5, -17, 25, -14);
  tex_ctx.moveTo(-29, 23);
  tex_ctx.bezierCurveTo(-14, 22, -19, 37, 0, 32);
  tex_ctx.bezierCurveTo(25, 22, -8, 25, 28, 22);
  tex_ctx.stroke();
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawDualToneRedBug(tex_ctx) {
  ctx.translate(SIZE * 14, 0);

  tex_ctx.fillStyle = "rgb(219, 72, 92)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.strokeStyle = tex_ctx.fillStyle = "rgb(100,0,0)";
  tex_ctx.lineWidth = 6;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.fillRect(-SIZE * 0.5, -SIZE * 0.5, SIZE * 0.5, SIZE);
  tex_ctx.beginPath();
  tex_ctx.moveTo(30, -10);
  tex_ctx.lineTo(30, -25);
  tex_ctx.stroke();
  tex_ctx.beginPath();
  fillEllipse(tex_ctx, 30, -24, 10, 5, 0, -3.0, -12.7);
  tex_ctx.stroke();
  tex_ctx.strokeStyle = tex_ctx.fillStyle = "rgb(219,72,92)";
  tex_ctx.fillRect(-SIZE * 0.5, SIZE * 0.5, SIZE, 129);
  tex_ctx.beginPath();
  tex_ctx.moveTo(-30, -10);
  tex_ctx.lineTo(-30, -25);
  tex_ctx.stroke();
  tex_ctx.beginPath();
  fillEllipse(tex_ctx, -30, -24, 10, 5, 0, -3.0, -12.7);
  tex_ctx.stroke();
  tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);
  tex_ctx.fillStyle = "rgb(100,0,0)";
  tex_ctx.translate(0, SIZE);
  tex_ctx.beginPath();
  tex_ctx.moveTo(SIZE * 0.5, 0);
  tex_ctx.lineTo(0, SIZE * 0.5);
  tex_ctx.lineTo(SIZE * 0.5, SIZE);
  tex_ctx.lineTo(SIZE, SIZE * 0.5);
  tex_ctx.fill();
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawPinkRedAlienHead(tex_ctx) {
  tex_ctx.save();
  ctx.translate(SIZE * 15, 0);

  tex_ctx.fillStyle = "rgb(255, 149, 125)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.strokeStyle = tex_ctx.fillStyle = "rgb(255, 20, 0)";
  tex_ctx.lineWidth = 6;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.beginPath();
  tex_ctx.moveTo(-45, -30);
  tex_ctx.bezierCurveTo(-45, -40, -20, -40, -13, -23);
  tex_ctx.moveTo(-19, 40);
  tex_ctx.bezierCurveTo(-34, 7, 32, 8, 32, 40);
  tex_ctx.scale(-1, 1);
  tex_ctx.moveTo(-45, -30);
  tex_ctx.bezierCurveTo(-45, -40, -20, -40, -13, -23);
  tex_ctx.stroke();
  tex_ctx.scale(-1, 1);
  tex_ctx.beginPath();
  fillEllipse(tex_ctx, -24, -11, 7, 10, 0, 0, 7);
  fillEllipse(tex_ctx, 24, -11, 7, 10, 0, 0, 7);
  tex_ctx.fill();
  tex_ctx.fillStyle = "rgb(255, 149, 125)";
  tex_ctx.beginPath();
  fillEllipse(tex_ctx, -28, -5, 2, 4, 0, 0, 7);
  fillEllipse(tex_ctx, 21, -5, 2, 4, 0, 0, 7);
  tex_ctx.fill();
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE); // CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before

  tex_ctx.restore();
}

export function drawRedCrestCrest(tex_ctx) {
  tex_ctx.save();
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);

  tex_ctx.fillStyle = "rgb(255,0,0)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.fillStyle = "rgb(255, 255, 255)";
  tex_ctx.lineWidth = 6;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.beginPath();
  tex_ctx.moveTo(-64, 64);
  tex_ctx.lineTo(-64, -32);
  tex_ctx.lineTo(-32, -64);
  tex_ctx.bezierCurveTo(5, 0, -5, 0, 32, -64);
  tex_ctx.lineTo(64, -32);
  tex_ctx.lineTo(64, 64);
  tex_ctx.bezierCurveTo(-25, 0, 25, 0, -64, 64);
  tex_ctx.moveTo(-20, 37);
  tex_ctx.bezierCurveTo(-10, 52, 10, 52, 20, 37);
  tex_ctx.bezierCurveTo(10, 47, -10, 47, -20, 37);
  tex_ctx.fill();
  tex_ctx.beginPath();
  fillEllipse(tex_ctx, -25, 0, 4, 3, 0, 0, 7);
  tex_ctx.rect(-33, 0, 10, 1);
  tex_ctx.moveTo(25, 0);
  fillEllipse(tex_ctx, 25, 0, 4, 3, 0, 0, 7);
  tex_ctx.rect(23, 0, 10, 1);
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(255, 0, 0)";
  tex_ctx.fill();
  tex_ctx.stroke();
  // tex_ctx.translate(-HALF_SIZE, -HALF_SIZE); // CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before

  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawBlueGeometric(tex_ctx) {
  tex_ctx.save();

  ctx.translate(SIZE, 256);

  tex_ctx.fillStyle = "rgb(0,0,255)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.fillStyle = "rgb(255, 255, 255)";
  tex_ctx.lineWidth = 5;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.beginPath();
  tex_ctx.moveTo(-64, -64);
  tex_ctx.lineTo(0, -25);
  tex_ctx.lineTo(64, -64);
  tex_ctx.lineTo(64, -44);
  tex_ctx.lineTo(50, -34);
  tex_ctx.lineTo(64, -24);
  tex_ctx.lineTo(64, -4);
  tex_ctx.lineTo(50, 6);
  tex_ctx.lineTo(64, 26);
  tex_ctx.lineTo(15, 26);
  tex_ctx.bezierCurveTo(15, 10, -15, 10, -15, 26);
  tex_ctx.lineTo(-64, 26);
  tex_ctx.lineTo(-50, 6);
  tex_ctx.lineTo(-64, -4);
  tex_ctx.lineTo(-64, -24);
  tex_ctx.lineTo(-50, -34);
  tex_ctx.fill();
  tex_ctx.beginPath();
  tex_ctx.moveTo(-30, 45);
  tex_ctx.lineTo(-20, 55);
  tex_ctx.lineTo(20, 55);
  tex_ctx.lineTo(30, 45);
  tex_ctx.moveTo(-27, 42);
  tex_ctx.lineTo(-33, 48);
  tex_ctx.moveTo(27, 42);
  tex_ctx.lineTo(33, 48);
  tex_ctx.strokeStyle = "rgb(255, 255, 255)";
  tex_ctx.stroke();
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawYellowBlackGrate(tex_ctx) {
  ctx.translate(SIZE * 2, 256);

  tex_ctx.fillStyle = "rgb(0,0,0)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.lineWidth = 6;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.beginPath();
  for (let xOffset of [-45, -30, -15, 0, 45, 30, 15]) {
    tex_ctx.moveTo(xOffset, -40);
    tex_ctx.lineTo(xOffset, 40);
  }
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(255,255,0)";
  tex_ctx.fill();
  tex_ctx.stroke();
  tex_ctx.beginPath();
  tex_ctx.moveTo(-64, -64);
  tex_ctx.lineTo(-64, -40);
  tex_ctx.bezierCurveTo(-39, -15, 39, -15, 64, -40);
  tex_ctx.lineTo(64, -64);
  tex_ctx.moveTo(-64, 64);
  tex_ctx.lineTo(-64, 10);
  tex_ctx.bezierCurveTo(-39, 25, 39, 25, 64, 10);
  tex_ctx.lineTo(64, 64);
  tex_ctx.fill();
  tex_ctx.beginPath();
  tex_ctx.moveTo(-15, 40);
  tex_ctx.lineTo(0, 55);
  tex_ctx.lineTo(15, 40);
  tex_ctx.strokeStyle = "rgb(0,0,0)";
  tex_ctx.stroke();
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawDarkBlueSadFace(tex_ctx) {
  ctx.translate(SIZE * 3, 256);

  tex_ctx.fillStyle = "rgb(17, 32, 43)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.lineWidth = 6;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(59, 142, 209)";
  tex_ctx.beginPath();
  fillEllipse(tex_ctx, -26, -29, 6, 8, 9.2, 7, 15);
  fillEllipse(tex_ctx, 26, -29, 7, 9, -9.2, 7, 15);
  tex_ctx.fill();
  ellipse(tex_ctx, 0, -2, 5, 5, -9.2);
  tex_ctx.beginPath();
  tex_ctx.moveTo(-26, 23);
  tex_ctx.bezierCurveTo(-10, 38, 24, 31, 29, 21);
  tex_ctx.moveTo(-25, 13);
  tex_ctx.bezierCurveTo(-23, 21, -29, 30, -36, 28);
  tex_ctx.moveTo(31, 12);
  tex_ctx.bezierCurveTo(28, 21, 34, 30, 40, 28);
  tex_ctx.stroke();
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawAngryOrangeMouth(tex_ctx) {
  ctx.translate(SIZE * 4, 256);

  tex_ctx.fillStyle = "rgb(17, 32, 43)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.lineWidth = 6;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(243, 73, 45)";
  tex_ctx.beginPath();
  tex_ctx.moveTo(-36, -20);
  tex_ctx.bezierCurveTo(-28, -28, -15, -19, -18, -16);
  tex_ctx.moveTo(36, -20);
  tex_ctx.bezierCurveTo(28, -28, 15, -19, 18, -16);
  tex_ctx.stroke();
  tex_ctx.lineWidth = 4;
  tex_ctx.beginPath();
  tex_ctx.moveTo(-26, 23);
  tex_ctx.bezierCurveTo(-11, 40, 16, 32, 26, 21);
  tex_ctx.bezierCurveTo(13, 58, -20, 32, -26, 23);
  tex_ctx.fill();
  tex_ctx.stroke();
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawTripleCryEyes(tex_ctx) {
  ctx.translate(SIZE * 5, 256);

  tex_ctx.fillStyle = "rgb(59, 94, 157)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.lineWidth = 4;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(182, 220, 248)";
  for (let step = 0; step < 2; step++) {
    tex_ctx.beginPath();
    tex_ctx.moveTo(-13, -25);
    tex_ctx.bezierCurveTo(-16, -9, -41, -6, -39, -26);
    tex_ctx.stroke();
    tex_ctx.fill();
    tex_ctx.beginPath();
    tex_ctx.moveTo(-39, -26);
    tex_ctx.bezierCurveTo(-24, -23, -13, -20, -8, -29);
    tex_ctx.stroke();
    if (step === 0) tex_ctx.translate(51, 0);
  }
  tex_ctx.scale(1.45, 1.45);
  tex_ctx.translate(-12, 35);
  tex_ctx.beginPath();
  tex_ctx.moveTo(-13, -25);
  tex_ctx.bezierCurveTo(-16, -9, -41, -6, -39, -26);
  tex_ctx.stroke();
  tex_ctx.fill();
  tex_ctx.beginPath();
  tex_ctx.moveTo(-39, -26);
  tex_ctx.bezierCurveTo(-24, -23, -13, -20, -8, -29);
  tex_ctx.stroke();
  tex_ctx.translate(12, -35);
  tex_ctx.scale(1 / 1.45, 1 / 1.45);
  tex_ctx.translate(-51, 0);
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawWhiteOrangeFace(tex_ctx) {
  ctx.translate(SIZE * 6, 256);

  tex_ctx.fillStyle = "rgb(241,241,241)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.lineWidth = 6;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(243, 73, 45)";
  tex_ctx.beginPath();
  tex_ctx.moveTo(-16, 29);
  tex_ctx.bezierCurveTo(-5, 42, 0, 37, 10, 35);
  tex_ctx.stroke();
  tex_ctx.lineWidth = 4;
  tex_ctx.beginPath();
  tex_ctx.moveTo(-49, -25);
  tex_ctx.bezierCurveTo(-11, -13, 23, -25, 45, -36);
  tex_ctx.bezierCurveTo(45, 19, 22, 13, 2, -11);
  tex_ctx.bezierCurveTo(-10, 22, -36, 13, -49, -25);
  tex_ctx.fill();
  tex_ctx.stroke();
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawGreyOwlLook(tex_ctx) {
  ctx.translate(SIZE * 7, 256);

  tex_ctx.fillStyle = "rgb(160,160,160)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.lineWidth = 6;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(0,0,0)";
  tex_ctx.beginPath();
  tex_ctx.moveTo(-41, -35);
  tex_ctx.bezierCurveTo(-41, -32, -22, -25, -18, -28);
  tex_ctx.moveTo(41, -35);
  tex_ctx.bezierCurveTo(41, -32, 22, -25, 18, -28);
  tex_ctx.stroke();
  tex_ctx.beginPath();
  tex_ctx.moveTo(-15, 32);
  tex_ctx.bezierCurveTo(5, 16, -5, 16, 15, 32);
  tex_ctx.stroke();
  drawEyes(tex_ctx, 28, -14, 7, 9);
  tex_ctx.fillRect(-53.5, 11.4, 23, 9);
  tex_ctx.fillRect(30.5, 11.4, 23, 9);
  tex_ctx.fillStyle = "rgb(160,160,160)";
  tex_ctx.beginPath();
  fillEllipse(tex_ctx, -32, -12, 3, 5, 0, 0, 7);
  fillEllipse(tex_ctx, 24, -12, 3, 5, 0, 0, 7);
  tex_ctx.fill();
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawSoftBlueWhite(tex_ctx) {
  ctx.translate(SIZE * 8, 256);

  tex_ctx.fillStyle = "rgb(242, 255, 255)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.lineWidth = 6;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.strokeStyle = "rgb(100,100,150)";
  tex_ctx.beginPath();
  tex_ctx.translate(-65, -52);
  for (let r = 0; r < 2; r++) {
    tex_ctx.moveTo(35, 15);
    tex_ctx.bezierCurveTo(25, 22, 15, 41, 30, 49);
    tex_ctx.bezierCurveTo(52, 54, 43, 18, 33, 37);
    if (r === 0) {
      tex_ctx.translate(130, -9);
      tex_ctx.scale(-1, 1);
    }
  }
  tex_ctx.scale(-1, 1);
  tex_ctx.translate(-65, 62);
  tex_ctx.stroke();
  tex_ctx.beginPath();
  tex_ctx.moveTo(11, 11);
  tex_ctx.bezierCurveTo(4, 40, -6, 35, -8, 31);
  tex_ctx.bezierCurveTo(-9, 12, 3, 22, 11, 11);
  tex_ctx.stroke();
  tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);
  tex_ctx.fillStyle = "rgb(242, 255, 255)";
  tex_ctx.fillRect(0, SIZE - 1, SIZE, 128.5);
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawCopyOf8WithBlueUnderbelly(tex_ctx) {
  ctx.translate(SIZE * 9, 256);

  tex_ctx.fillStyle = "rgb(242, 255, 255)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.lineWidth = 6;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.strokeStyle = "rgb(100,100,150)";
  tex_ctx.beginPath();
  tex_ctx.translate(-65, -52);
  for (let r = 0; r < 2; r++) {
    tex_ctx.moveTo(35, 15);
    tex_ctx.bezierCurveTo(25, 22, 15, 41, 30, 49);
    tex_ctx.bezierCurveTo(52, 54, 43, 18, 33, 37);
    if (r === 0) {
      tex_ctx.translate(130, -9);
      tex_ctx.scale(-1, 1);
    }
  }
  tex_ctx.scale(-1, 1);
  tex_ctx.translate(-65, 62);
  tex_ctx.stroke();
  tex_ctx.beginPath();
  tex_ctx.moveTo(11, 11);
  tex_ctx.bezierCurveTo(4, 40, -6, 35, -8, 31);
  tex_ctx.bezierCurveTo(-9, 12, 3, 22, 11, 11);
  tex_ctx.stroke();
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawShadowBlueBeetleMouth(tex_ctx) {
  ctx.translate(SIZE * 9, 256);

  tex_ctx.fillStyle = "rgb(17, 32, 43)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.lineWidth = 6;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE + 10);
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(59, 142, 209)";
  tex_ctx.beginPath();
  for (let s of [-1, 1]) {
    tex_ctx.moveTo(s * 64, 5);
    tex_ctx.lineTo(s * 48, 12.5);
    tex_ctx.lineTo(s * 60, 20);
    tex_ctx.lineTo(s * 48, 27.5);
    tex_ctx.lineTo(s * 64, 35);
  }
  tex_ctx.fill();
  tex_ctx.beginPath();
  tex_ctx.moveTo(43, -45);
  tex_ctx.lineTo(14, -40);
  tex_ctx.moveTo(-39, -44);
  tex_ctx.lineTo(-11, -40);
  tex_ctx.stroke();
  drawEyes(tex_ctx, 23, -30, 10, 13);
  tex_ctx.fillStyle = "rgb(17, 32, 43)";
  tex_ctx.beginPath();
  fillEllipse(tex_ctx, 19, -28, 6, 8, 0, 0, 7);
  fillEllipse(tex_ctx, -26, -27, 6, 8, 0, 0, 7);
  tex_ctx.fill();
  tex_ctx.translate(0, -10);
  tex_ctx.fillStyle = "rgb(59, 142, 209)";
  tex_ctx.translate(-31, 51);
  tex_ctx.scale(-1.4, 1.4);
  tex_ctx.beginPath();
  tex_ctx.moveTo(-13, -25);
  tex_ctx.bezierCurveTo(-16, -9, -41, -6, -39, -26);
  tex_ctx.stroke();
  tex_ctx.fill();
  tex_ctx.beginPath();
  tex_ctx.moveTo(-39, -26);
  tex_ctx.bezierCurveTo(-24, -23, -13, -20, -8, -29);
  tex_ctx.stroke();
  tex_ctx.scale(1 / -1.4, 1 / 1.4);
  tex_ctx.translate(31, -51);
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawJaggedOrangeJaws(tex_ctx) {
  ctx.translate(SIZE * 10, 256);

  tex_ctx.fillStyle = "rgb(17, 32, 43)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.lineWidth = 5;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE + 10);
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(243,73,45)";
  tex_ctx.beginPath();
  for (let s of [-1, 1]) {
    tex_ctx.moveTo(s * 64, 5);
    tex_ctx.lineTo(s * 48, 12.5);
    tex_ctx.lineTo(s * 60, 20);
    tex_ctx.lineTo(s * 48, 27.5);
    tex_ctx.lineTo(s * 64, 35);
  }
  tex_ctx.fill();
  tex_ctx.beginPath();
  tex_ctx.moveTo(43, -45);
  tex_ctx.lineTo(14, -40);
  tex_ctx.moveTo(-39, -44);
  tex_ctx.lineTo(-11, -40);
  tex_ctx.stroke();
  drawEyes(tex_ctx, 23, -30, 10, 13);
  tex_ctx.strokeStyle = "rgb(17, 32, 43)";
  tex_ctx.beginPath();
  tex_ctx.moveTo(39, -29);
  tex_ctx.lineTo(0, -22);
  tex_ctx.lineTo(-39, -29);
  tex_ctx.stroke();
  tex_ctx.translate(0, -10);
  tex_ctx.strokeStyle = "rgb(243,73,45)";
  tex_ctx.translate(-31, 51);
  tex_ctx.scale(-1.4, 1.4);
  tex_ctx.beginPath();
  tex_ctx.moveTo(-12, -21);
  tex_ctx.bezierCurveTo(-12, -14, -31, -12, -36, -17);
  tex_ctx.stroke();
  tex_ctx.scale(1 / -1.4, 1 / 1.4);
  tex_ctx.translate(31, -51);
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawGreenMaskInsect(tex_ctx) {
  ctx.translate(SIZE * 11, 256);

  tex_ctx.fillStyle = "rgb(50, 190, 71)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.lineWidth = 6;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE + 10);
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(17, 32, 43)";
  drawEyes(tex_ctx, 22, -30, 7, 9);
  tex_ctx.fillRect(-41, -44, 30, 10);
  tex_ctx.fillRect(11, -44, 30, 10);
  tex_ctx.fillStyle = "rgb(50, 190, 71)";
  tex_ctx.lineWidth = 3;
  tex_ctx.beginPath();
  tex_ctx.moveTo(-40, 10);
  tex_ctx.lineTo(-36, 14);
  tex_ctx.lineTo(-40, 18);
  tex_ctx.moveTo(40, 10);
  tex_ctx.lineTo(36, 14);
  tex_ctx.lineTo(40, 18);
  tex_ctx.stroke();
  tex_ctx.beginPath();
  fillEllipse(tex_ctx, 18, -28, 4, 5, 0, 0, 7);
  fillEllipse(tex_ctx, -26, -28, 4, 5, 0, 0, 7);
  tex_ctx.fill();
  tex_ctx.translate(0, -10);
  tex_ctx.lineWidth = 6;
  tex_ctx.beginPath();
  tex_ctx.moveTo(-15, 20);
  tex_ctx.lineTo(0, 30);
  tex_ctx.lineTo(15, 20);
  tex_ctx.stroke();
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawGoldenAlienHead(tex_ctx) {
  ctx.translate(SIZE * 12, 256);

  tex_ctx.fillStyle = "rgb(240, 211, 24)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.lineWidth = 6;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE + 7);
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(17, 32, 43)";
  tex_ctx.beginPath();
  fillEllipse(tex_ctx, -32, -29, 9, 9, 0, 0, 7);
  fillEllipse(tex_ctx, 21, -29, 9, 9, 0, 0, 7);
  tex_ctx.fill();
  tex_ctx.beginPath();
  tex_ctx.moveTo(-39, -34);
  tex_ctx.bezierCurveTo(-28, -46, -19, -38, -14, -32);
  tex_ctx.moveTo(13, -34);
  tex_ctx.bezierCurveTo(27, -46, 36, -38, 41, -32);
  tex_ctx.translate(0, -16);
  tex_ctx.moveTo(-37, 23);
  tex_ctx.bezierCurveTo(-10, 38, 24, 31, 42, 21);
  tex_ctx.moveTo(-36, 15);
  tex_ctx.bezierCurveTo(-36, 21, -35, 28, -44, 29);
  tex_ctx.moveTo(44, 12);
  tex_ctx.bezierCurveTo(40, 21, 46, 30, 48, 28);
  tex_ctx.stroke();
  tex_ctx.translate(0, -6);
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawYellowCatBeetle(tex_ctx) {
  ctx.translate(SIZE * 13, 256);

  tex_ctx.fillStyle = "rgb(252, 186, 3)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.lineWidth = 4;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.fillStyle = "rgb(99, 73, 39)";
  tex_ctx.beginPath();
  for (let x of [-25, 0, 25]) {
    tex_ctx.translate(x, 0);
    tex_ctx.moveTo(-8, -64);
    tex_ctx.bezierCurveTo(0, -30, 0, -30, 8, -64);
    tex_ctx.translate(-x, 0);
  }
  tex_ctx.fill();
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(17, 32, 43)";
  for (let s of [-1, 1]) {
    tex_ctx.beginPath();
    tex_ctx.translate(s * 25, -10);
    tex_ctx.scale(1.2, 1.5);
    tex_ctx.rotate(s * 0.15);
    tex_ctx.moveTo(-10, 0);
    tex_ctx.bezierCurveTo(-8, 7, 8, 7, 10, 0);
    tex_ctx.bezierCurveTo(8, -7, -8, -7, -10, 0);
    reset(tex_ctx);
    tex_ctx.translate(SIZE * 13 + HALF_SIZE, 256 + HALF_SIZE);
  }
  tex_ctx.fill();
  tex_ctx.beginPath();
  tex_ctx.moveTo(-7, 10);
  tex_ctx.bezierCurveTo(-5, 13, 5, 13, 7, 10);
  tex_ctx.moveTo(0, 13);
  tex_ctx.lineTo(0, 22);
  tex_ctx.moveTo(-20, 20);
  tex_ctx.bezierCurveTo(-10, 28, -5, 28, 0, 20);
  tex_ctx.moveTo(20, 20);
  tex_ctx.bezierCurveTo(10, 28, 5, 28, 0, 20);
  tex_ctx.moveTo(-31, 14);
  tex_ctx.lineTo(-62, 0);
  tex_ctx.moveTo(-31, 22);
  tex_ctx.lineTo(-62, 27);
  tex_ctx.moveTo(31, 14);
  tex_ctx.lineTo(62, 0);
  tex_ctx.moveTo(31, 22);
  tex_ctx.lineTo(62, 27);
  tex_ctx.stroke();
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawStarbustSpark(tex_ctx) {
  ctx.translate(SIZE * 14, 256);

  tex_ctx.fillStyle = "rgb(117, 184, 235)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.lineWidth = 8;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(255,255,255)";
  tex_ctx.beginPath();
  tex_ctx.translate(0, 17);
  tex_ctx.moveTo(-20, 0);
  tex_ctx.lineTo(0, 15);
  tex_ctx.lineTo(20, 0);
  tex_ctx.translate(0, -14);
  tex_ctx.stroke();
  tex_ctx.beginPath();
  tex_ctx.scale(0.36, 0.54);
  tex_ctx.translate(-75, -37);
  for (let star = 0; star < 2; star++) {
    tex_ctx.moveTo(0, 40);
    tex_ctx.bezierCurveTo(10, 10, 10, 10, 40, 0);
    tex_ctx.bezierCurveTo(10, -10, 10, -10, 0, -40);
    tex_ctx.bezierCurveTo(-10, -10, -10, -10, -40, 0);
    tex_ctx.bezierCurveTo(-10, 10, -10, 10, 0, 40);
    if (star === 0) tex_ctx.translate(150, 0);
  }
  tex_ctx.fill();
  reset(tex_ctx);
  tex_ctx.translate(SIZE * 14, 256);

  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawDeepRedBeholderHead(tex_ctx) {
  ctx.translate(SIZE * 15, 256);

  tex_ctx.fillStyle = "rgb(27, 42, 53)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.lineWidth = 6;
  tex_ctx.translate(HALF_SIZE, HALF_SIZE + 10);
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(243, 73, 45)";
  tex_ctx.beginPath();
  tex_ctx.moveTo(-37, -47);
  tex_ctx.bezierCurveTo(-26, -36, -12, -45, -20, -36);
  tex_ctx.moveTo(37, -47);
  tex_ctx.bezierCurveTo(26, -36, 12, -45, 20, -36);
  tex_ctx.moveTo(-25, -37);
  fillEllipse(tex_ctx, -21, -31, 6, 10, 0, 0, 7);
  tex_ctx.moveTo(25, -37);
  fillEllipse(tex_ctx, 21, -31, 6, 10, Math.PI, 0, 7);
  tex_ctx.translate(0, -3);
  for (
    let i = -1.2, j = 0, inc = (Math.PI * 2) / 15;
    i < Math.PI - 1.0;
    i += inc, j++
  ) {
    let ri = (j - 1) % 2 === 0 ? 15 : 30;
    let r = j % 2 === 0 ? 15 : 30;
    tex_ctx.moveTo(Math.sin(i - inc) * ri * 1.25, Math.cos(i - inc) * ri + 10);
    tex_ctx.lineTo(Math.sin(i) * r * 1.25, Math.cos(i) * r + 10);
  }
  tex_ctx.stroke();
  reset(tex_ctx);
  tex_ctx.translate(SIZE * 15, 256);

  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawFurryCatAntennae(tex_ctx) {
  ctx.translate(0, SIZE * 4);

  tex_ctx.fillStyle = "rgb(150, 106, 85)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.lineWidth = 6;
  tex_ctx.fillStyle = "rgb(255,255,255)";
  tex_ctx.strokeStyle = "rgb(0,0,0)";
  for (let side = 0; side < 2; side++) {
    tex_ctx.beginPath();
    tex_ctx.moveTo(-37, -10);
    tex_ctx.bezierCurveTo(-35, -55, -4, -29, -15, -10);
    tex_ctx.bezierCurveTo(-16, -5, -36, -5, -37, -10);
    tex_ctx.fill();
    tex_ctx.fillStyle = "rgb(0,0,0)";
    tex_ctx.beginPath();
    tex_ctx.moveTo(-30, -7);
    tex_ctx.bezierCurveTo(-32, -22, -15, -22, -15, -10);
    tex_ctx.bezierCurveTo(-16, -5, -36, -5, -30, -7);
    tex_ctx.fill();
    if (side === 0) {
      tex_ctx.scale(-1, 1);
      tex_ctx.fillStyle = "rgb(255,255,255)";
    }
  }
  tex_ctx.fillRect(30.6, 1.6, 25, 12);
  ellipse(tex_ctx, 1, 2, 4, 4);
  drawMouthArc(tex_ctx, 21, 19, 13);
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before

  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawGoldCrownCrown(tex_ctx) {
  ctx.translate(SIZE, SIZE * 4);

  tex_ctx.fillStyle = "rgb(229, 178, 56)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.lineWidth = 5;
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(0,0,0)";
  drawEyes(tex_ctx, 26, -21, 8, 12);
  tex_ctx.beginPath();
  tex_ctx.moveTo(-40, -38);
  tex_ctx.lineTo(-21, -33);
  tex_ctx.moveTo(40, -38);
  tex_ctx.lineTo(21, -33);
  tex_ctx.moveTo(0, 3);
  tex_ctx.lineTo(0, 32);
  tex_ctx.bezierCurveTo(0, 40, -26, 40, -26, 32);
  tex_ctx.moveTo(0, 32);
  tex_ctx.bezierCurveTo(0, 40, 26, 40, 26, 32);
  tex_ctx.stroke();
  ellipse(tex_ctx, 0, 3, 8, 5);
  ellipse(tex_ctx, 24, 10, 3, 3);
  ellipse(tex_ctx, 32, 21, 3, 3);
  ellipse(tex_ctx, 16, 21, 3, 3);
  ellipse(tex_ctx, 0, 3, 8, 5);
  ellipse(tex_ctx, -24, 10, 3, 3);
  ellipse(tex_ctx, -32, 21, 3, 3);
  ellipse(tex_ctx, -16, 21, 3, 3);
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before

  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawWideAquaVisor(tex_ctx) {
  ctx.translate(SIZE * 2, SIZE * 4);

  tex_ctx.fillStyle = "rgb(27, 42, 53)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.lineWidth = 5;
  tex_ctx.fillStyle = "rgb(68, 152, 213)";
  tex_ctx.beginPath();
  tex_ctx.moveTo(-64, -50);
  tex_ctx.bezierCurveTo(-34, -24, 34, -24, 64, -50);
  tex_ctx.lineTo(64, -8);
  tex_ctx.bezierCurveTo(44, 20, -44, 20, -64, -8);
  tex_ctx.fill();
  tex_ctx.fillStyle = "rgb(27, 42, 53)";
  ellipse(tex_ctx, -27, -13, 12, 7, 0.3);
  ellipse(tex_ctx, 27, -13, 12, 7, -0.3);
  tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);
  tex_ctx.fillStyle = "rgb(27, 42, 53)";
  tex_ctx.fillRect(0, SIZE, SIZE, SIZE);

  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawRedStripeGreyShard(tex_ctx) {
  ctx.translate(SIZE * 3, SIZE * 4);

  tex_ctx.fillStyle = "rgb(159, 159, 159)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.lineWidth = 3;
  tex_ctx.fillStyle = "rgb(255,255,255)";
  tex_ctx.strokeStyle = "rgb(255,0,0)";
  ellipse(tex_ctx, -24, -23, 5, 5);
  ellipse(tex_ctx, 24, -23, 5, 5);
  tex_ctx.beginPath();
  tex_ctx.translate(-41, 0);
  for (let row = 0; row < 2; row++) {
    tex_ctx.moveTo(0, 0);
    tex_ctx.lineTo(-5, 5);
    tex_ctx.moveTo(7, 0);
    tex_ctx.lineTo(2, 5);
    tex_ctx.moveTo(14, 0);
    tex_ctx.lineTo(9, 5);
    if (row === 0) tex_ctx.translate(70, 0);
  }
  tex_ctx.translate(-29, 0);
  tex_ctx.stroke();
  tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);
  tex_ctx.fillStyle = "rgb(159, 159, 159)";
  tex_ctx.fillRect(0, SIZE, SIZE, SIZE);

  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawGoldSpectacleFrame(tex_ctx) {
  ctx.translate(SIZE * 4, SIZE * 4);

  tex_ctx.fillStyle = "rgb(27, 42, 53)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.translate(HALF_SIZE, HALF_SIZE);
  tex_ctx.fillStyle = "rgb(229, 207, 56)";
  tex_ctx.fillRect(-10, -20, 20, 10);
  tex_ctx.fillRect(-64, -40, 35, 50);
  ellipse(tex_ctx, -29, -15, 25, 25);
  tex_ctx.fillRect(29, -40, 35, 50);
  ellipse(tex_ctx, 29, -15, 25, 25);
  tex_ctx.fillStyle = "rgb(27, 42, 53)";
  ellipse(tex_ctx, -27, -15, 8, 12);
  ellipse(tex_ctx, 27, -15, 8, 12);
  tex_ctx.fillStyle = "rgb(229, 207, 56)";
  ellipse(tex_ctx, 21, -16, 4, 6);
  ellipse(tex_ctx, -32, -16, 4, 6);
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before

  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawGreyFurredMoth(tex_ctx) {
  tex_ctx.fillStyle = "rgb(27, 42, 53)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.translate(HALF_SIZE, HALF_SIZE - 8);
  tex_ctx.lineWidth = 6;
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(241, 241, 241)";
  tex_ctx.beginPath();
  tex_ctx.moveTo(-11, -33);
  tex_ctx.bezierCurveTo(-19, -26, -18, -20, -38, -16);
  tex_ctx.moveTo(6, -33);
  tex_ctx.bezierCurveTo(9, -26, 11, -20, 30, -16);
  tex_ctx.stroke();
  tex_ctx.lineWidth = 4;
  drawMouthArc(tex_ctx, 40, 13, -1);
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(159, 159, 159)";
  tex_ctx.beginPath();
  tex_ctx.moveTo(-12, -4);
  tex_ctx.bezierCurveTo(-15, 23, -41, 14, -37, -3);
  tex_ctx.lineTo(-12, -4);
  tex_ctx.moveTo(12, -4);
  tex_ctx.bezierCurveTo(8, 27, 40, 12, 34, -3);
  tex_ctx.lineTo(12, -4);
  tex_ctx.fill();
  tex_ctx.stroke();
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(241, 241, 241)";
  tex_ctx.beginPath();
  tex_ctx.moveTo(-12, -4);
  tex_ctx.bezierCurveTo(-22, 13, -32, 3, -37, -3);
  tex_ctx.lineTo(-12, -4);
  tex_ctx.moveTo(12, -4);
  tex_ctx.bezierCurveTo(19, 13, 32, 3, 34, -3);
  tex_ctx.lineTo(12, -4);
  tex_ctx.fill();
  tex_ctx.stroke();
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE + 8);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before

  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawGeometricWhiteRibbons(tex_ctx) {
  tex_ctx.fillStyle = "rgb(27, 42, 53)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.translate(HALF_SIZE, HALF_SIZE - 15);
  tex_ctx.lineWidth = 6;
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(241, 241, 241)";
  ellipse(tex_ctx, -20, -13, 5, 10);
  ellipse(tex_ctx, 20, -13, 5, 10);
  tex_ctx.beginPath();
  tex_ctx.moveTo(-20, -5);
  tex_ctx.bezierCurveTo(-25, -7, -29, -7, -34, -3);
  tex_ctx.moveTo(-20, -5);
  tex_ctx.bezierCurveTo(-25, 1, -29, -7, -24, -3);
  tex_ctx.moveTo(20, -5);
  tex_ctx.bezierCurveTo(25, -7, 29, -7, 34, -3);
  tex_ctx.moveTo(20, -5);
  tex_ctx.bezierCurveTo(25, 1, 29, -7, 24, -3);
  tex_ctx.moveTo(-10, 50);
  tex_ctx.bezierCurveTo(-10, 16, 10, 15, 10, 50);
  tex_ctx.bezierCurveTo(2, 49, 3, 46, -10, 50);
  tex_ctx.stroke();
  tex_ctx.lineWidth = 3;
  tex_ctx.beginPath();
  tex_ctx.moveTo(-2, 24);
  tex_ctx.bezierCurveTo(-5, 55, 1, 15, 2, 25);
  tex_ctx.moveTo(5, 29);
  tex_ctx.bezierCurveTo(1, 58, 2, 15, 7, 30);
  tex_ctx.stroke();
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE + 15);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawBlueSpectacleOrbs(tex_ctx) {
  tex_ctx.fillStyle = "rgb(241, 241, 241)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.translate(HALF_SIZE, HALF_SIZE - 5);
  tex_ctx.lineWidth = 3.5;
  tex_ctx.fillStyle = "rgb(59, 142, 209)";
  tex_ctx.strokeStyle = "rgb(241, 241, 241)";
  ellipse(tex_ctx, -22, -20, 9, 12);
  ellipse(tex_ctx, 22, -20, 9, 12);
  tex_ctx.beginPath();
  tex_ctx.moveTo(-32, -20);
  tex_ctx.lineTo(0, -18);
  tex_ctx.lineTo(32, -20);
  tex_ctx.stroke();
  tex_ctx.beginPath();
  tex_ctx.moveTo(0, -2);
  tex_ctx.lineTo(0, 13);
  tex_ctx.lineTo(32, 5);
  tex_ctx.fill();
  for (let i = 0.18; i < Math.PI; i += Math.PI / 8) {
    ellipse(tex_ctx, Math.cos(i) * 40, Math.sin(i) * 30 + 15, 6, 6);
  }
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE + 4);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawPinkCheeksAlien(tex_ctx) {
  tex_ctx.fillStyle = "rgb(27, 42, 53)";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.translate(HALF_SIZE, HALF_SIZE - 5);
  tex_ctx.lineWidth = 4;
  tex_ctx.fillStyle = "rgb(245, 139, 222)";
  ellipse(tex_ctx, -30, 6, 8, 6);
  ellipse(tex_ctx, 30, 6, 8, 6);
  tex_ctx.fillStyle = tex_ctx.strokeStyle = "rgb(230,230,230)";
  ellipse(tex_ctx, -20, -11, 5, 5);
  ellipse(tex_ctx, 20, -11, 5, 5);
  ellipse(tex_ctx, 0, 4, 3, 3);
  drawMouthArc(tex_ctx, 19, 9, 5);
  //   tex_ctx.translate(-HALF_SIZE, -HALF_SIZE + 4);// CHQ: Claude AI (Sonnet): restore handles setting state back to how it was before
  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}

export function drawAquaShield(tex_ctx) {
  ctx.translate(SIZE * 9, SIZE * 4);
  tex_ctx.fillStyle = "#0E141E";
  tex_ctx.fillRect(0, 0, SIZE, SIZE);
  tex_ctx.translate(HALF_SIZE, HALF_SIZE + 7);
  tex_ctx.lineWidth = 6;
  tex_ctx.fillStyle = "#bde5ea";
  tex_ctx.beginPath();
  tex_ctx.moveTo(-53, -50);
  tex_ctx.bezierCurveTo(-47, -24, -28, 1, -16, -5);
  tex_ctx.bezierCurveTo(-30, -12, -38, -29, -53, -50);
  tex_ctx.moveTo(56, -55);
  tex_ctx.bezierCurveTo(45, -7, 29, -4, 16, -1);
  tex_ctx.bezierCurveTo(30, -12, 23, -29, 56, -55); // Safely closed cut-off curve
  tex_ctx.fill();
  tex_ctx.stroke();

  tex_ctx.restore(); // CHQ: Claude AI (Sonnet): guaranteed to fully undo, regardless of what happened above
}
