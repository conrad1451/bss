import {
  reset,
  fillEllipse,
  fillBezier,
  drawSpriteBackground,
  drawEyes,
  drawMouthArc,
} from "./beeTextureHelpers";

import {
  drawNormalBee,
  drawGreenBee,
  drawDarkBee,
  drawRedAnt,
  drawBlueButterfly,
  drawLightMoth,
  drawGogglesInsect,
  drawBeetle,
  drawGhostlyMask,
  drawRedDemon,
  drawGreyWeevil,
  drawAquaShieldBug,
  drawAbstractBlueOrganism,
  drawNeonPinkGreenMystery,
  drawDualToneRedBug,
  drawPinkRedAlienHead,
  drawRedCrestCrest,
  drawBlueGeometric,
  drawYellowBlackGrate,
  drawDarkBlueSadFace,
  drawAngryOrangeMouth,
  drawTripleCryEyes,
  drawWhiteOrangeFace,
  drawGreyOwlLook,
  drawSoftBlueWhite,
  drawCopyOf8WithBlueUnderbelly,
  drawShadowBlueBeetleMouth,
  drawJaggedOrangeJaws,
  drawGreenMaskInsect,
  drawGoldenAlienHead,
  drawYellowCatBeetle,
  drawStarbustSpark,
  drawDeepRedBeholderHead,
  drawFurryCatAntennae,
  drawGoldCrownCrown,
  drawWideAquaVisor,
  drawRedStripeGreyShard,
  drawGoldSpectacleFrame,
  drawGreyFurredMoth,
  drawGeometricWhiteRibbons,
  drawBlueSpectacleOrbs,
  drawPinkCheeksAlien,
  drawAquaShield,
} from "./beeTextures";

import { SIZE, HALF_SIZE, STRIP_H, TWO_PI } from "./beeTextureConstants";

window.textures_bees = function (tex_ctx) {
  const ctx = tex_ctx;
  const SIZE = 128;
  const HALF_SIZE = SIZE / 2;
  const STRIP_H = (SIZE / 3) | 0;

  // --- Initialize Canvas Atlas ---
  ctx.fillStyle = "rgba(100,100,100,0)";
  ctx.fillRect(0, 0, 2048, 2048);

  // --- Sprite 0: Classic Bee ---
  // ctx.fillStyle = "rgb(33, 20, 1)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.strokeStyle = "rgb(220,220,220)";
  // ctx.lineWidth = 9;
  // ctx.lineCap = ctx.lineJoin = "round";
  // ctx.beginPath();
  // ctx.moveTo(HALF_SIZE - 25.6, 30);
  // ctx.lineTo(HALF_SIZE - 25.6, 50);
  // ctx.moveTo(HALF_SIZE + 25.6, 30);
  // ctx.lineTo(HALF_SIZE + 25.6, 50);
  // ctx.closePath();
  // ctx.moveTo(HALF_SIZE, 100);
  // ctx.lineTo(HALF_SIZE - 25.6, 80);
  // ctx.moveTo(HALF_SIZE, 100);
  // ctx.lineTo(HALF_SIZE + 25.6, 80);
  // ctx.stroke();
  // ctx.fillStyle = "rgb(237, 233, 9)";
  // ctx.fillRect(0, SIZE, SIZE, SIZE);
  drawNormalBee(ctx);
  drawSpriteBackground(ctx, "rgb(33, 20, 1)", "rgb(237, 233, 9)");

  // // --- Sprite 1: Green Fly ---
  // ctx.translate(SIZE, 0);
  // ctx.fillStyle = "rgb(0,200,60)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.strokeStyle = "rgb(255,255,255)";
  // ctx.lineWidth = 18;
  // ctx.beginPath();
  // ctx.moveTo(HALF_SIZE - 25.6, 30);
  // ctx.lineTo(HALF_SIZE - 25.6, 50);
  // ctx.moveTo(HALF_SIZE + 25.6, 30);
  // ctx.lineTo(HALF_SIZE + 25.6, 50);
  // ctx.closePath();
  // ctx.stroke();
  // ctx.strokeStyle = "rgb(0,0,0)";
  // ctx.lineWidth = 9;
  // ctx.beginPath();
  // ctx.moveTo(HALF_SIZE - 25.6 - 4, 45);
  // ctx.lineTo(HALF_SIZE - 25.6 - 4, 53);
  // ctx.moveTo(HALF_SIZE - 25.6 + 45, 45);
  // ctx.lineTo(HALF_SIZE - 25.6 + 45, 53);
  // ctx.closePath();
  // ctx.stroke();
  drawGreenBee(ctx);
  drawSpriteBackground(ctx, "rgb(0,200,60)", "rgb(0,0,0)");
  // reset(ctx);

  // --- Sprite 2: Black Wasp ---
  // ctx.translate(SIZE * 2, 0);
  // ctx.fillStyle = "rgb(10,10,10)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.strokeStyle = "rgb(255,255,255)";
  // ctx.lineWidth = 4;
  // ctx.translate(0, -13);
  // ctx.beginPath();
  // ctx.moveTo(HALF_SIZE - 25.6 + 246, 86);
  // ctx.lineTo(HALF_SIZE - 25.6 + 250, 53);
  // ctx.lineTo(HALF_SIZE - 25.6 + 256, 62);
  // ctx.moveTo(HALF_SIZE - 25.6 + 319, 59);
  // ctx.lineTo(HALF_SIZE - 25.6 + 322, 27);
  // ctx.lineTo(HALF_SIZE - 25.6 + 328, 39);
  // ctx.moveTo(HALF_SIZE - 25.6 + 256, 94);
  // ctx.bezierCurveTo(
  //   HALF_SIZE - 25.6 + 270,
  //   114,
  //   HALF_SIZE - 25.6 + 314,
  //   109,
  //   HALF_SIZE - 25.6 + 310,
  //   74,
  // );
  // ctx.stroke();
  // ctx.beginPath();
  // ctx.ellipse(ctx, 279, 89, 8, 6, -0.2, 0, 7);
  // ctx.ellipse(ctx, 352, 59, 8, 6, -0.2, 0, 7);
  // ctx.moveTo(0, 0);
  // ctx.ellipse(ctx, 365, 62, 2, 2, -0.2, 0, 7);
  // ctx.closePath();
  // ctx.translate(0, 13);
  // ctx.fillStyle = "rgb(255,255,255)";
  // ctx.fill();
  drawDarkBee(ctx);
  drawSpriteBackground(ctx, "rgb(10,10,10)", "rgb(220,220,220)");
  // reset(ctx);

  // --- Sprite 3: Red Ant ---
  // ctx.translate(SIZE * 3, 0);
  // ctx.fillStyle = "rgb(190,0,0)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.strokeStyle = ctx.fillStyle = "rgb(235, 66, 9)";
  // ctx.lineWidth = 3;
  // ctx.beginPath();
  // ctx.translate(63, -5);
  // for (let s = 0; s < 2; s++) {
  //   ctx.moveTo(HALF_SIZE - 30, 50);
  //   ctx.lineTo(HALF_SIZE - 35, 35);
  //   ctx.moveTo(HALF_SIZE - 40, 50);
  //   ctx.lineTo(HALF_SIZE - 35, 35);
  //   ctx.moveTo(HALF_SIZE - 40, 50);
  //   ctx.bezierCurveTo(
  //     HALF_SIZE - 40,
  //     66,
  //     HALF_SIZE - 20,
  //     66,
  //     HALF_SIZE - 20,
  //     50,
  //   );
  //   ctx.arc(20, 29, 0, 0, 6);
  //   if (s === 0) ctx.scale(-1, 1);
  // }
  // ctx.closePath();
  // ctx.stroke();
  // ctx.fill();
  // ctx.scale(-1, 1);
  // ctx.translate(-65, 5);
  // ctx.beginPath();
  // for (let k = 0; k < 7; k++) {
  //   ctx.moveTo(SIZE * 0.5 - 35, 90);
  //   ctx.lineTo(SIZE * 0.5 - 30, 105);
  //   ctx.lineTo(SIZE * 0.5 - 25, 90);
  //   ctx.translate(10, 0);
  // }
  // ctx.stroke();
  // ctx.translate(-58, 0);
  drawRedAnt(ctx);
  drawSpriteBackground(ctx, "rgb(190,0,0)", "rgb(235, 66, 9)");
  // reset(ctx);

  // --- Sprite 4: Blue Butterfly ---
  // ctx.translate(SIZE * 4, 0);
  // ctx.fillStyle = "rgb(70, 183, 240)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.strokeStyle = "rgb(15, 136, 212)";
  // ctx.lineWidth = 10;
  // ctx.beginPath();
  // ctx.moveTo(SIZE * 0.5 - 35, 59);
  // ctx.bezierCurveTo(56, 62, 44, 39, SIZE * 0.5 - 35, 28);
  // ctx.translate(55, 0);
  // ctx.moveTo(SIZE * 0.5 - 35, 59);
  // ctx.bezierCurveTo(56, 62, 44, 39, SIZE * 0.5 - 35, 28);
  // ctx.translate(-55, 0);
  // ctx.moveTo(SIZE * 0.5 - 10, 104);
  // ctx.bezierCurveTo(89, 110, 69, 86, SIZE * 0.5 - 5, 86);
  // ctx.bezierCurveTo(40, 85, 45, 102, SIZE * 0.5 - 11, 104);
  // ctx.fill();
  // ctx.stroke();
  drawBlueButterfly(ctx);
  drawSpriteBackground(ctx, "rgb(70, 183, 240)", "rgb(15, 136, 212)");
  // reset(ctx);

  // --- Sprite 5: Light Moth ---
  // ctx.translate(SIZE * 5, 0);
  // ctx.fillStyle = "rgb(220,220,220)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.strokeStyle = "rgb(0,0,0)";
  // ctx.lineWidth = 3.5;
  // ctx.beginPath();
  // ctx.translate(4, 0);
  // for (let m = 0; m < 2; m++) {
  //   ctx.moveTo(36, 30);
  //   ctx.bezierCurveTo(25, 17, 15, 47, 30, 56);
  //   ctx.bezierCurveTo(50, 55, 36, 32, 33, 45);
  //   if (m === 0) ctx.translate(50, 0);
  // }
  // ctx.translate(-54, 0);
  // ctx.fill();
  // ctx.stroke();
  drawLightMoth(ctx);
  drawSpriteBackground(ctx, "rgb(220,220,220)", "rgb(215,215,0)");
  // reset(ctx);

  // --- Sprite 6: Goggles Insect ---
  // ctx.translate(SIZE * 6, 0);
  // ctx.fillStyle = "rgb(220,220,220)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.strokeStyle = ctx.fillStyle = "rgb(0,0,0)";
  // ctx.lineWidth = 3;
  // ctx.beginPath();
  // ctx.ellipse(ctx, SIZE * 0.5 - 30, 40, 15, 13, 0, 0, 7);
  // ctx.rect(0, 35, SIZE, 8);
  // ctx.ellipse(ctx, SIZE * 0.5 + 30, 40, 15, 13, 0, 0, 7);
  // ctx.fill();
  // ctx.stroke();
  // ctx.strokeStyle = "rgb(220,220,220)";
  // ctx.lineWidth = 5;
  // ctx.beginPath();
  // ctx.moveTo(SIZE * 0.5 - 30, 32);
  // ctx.bezierCurveTo(
  //   SIZE * 0.5 - 36,
  //   35,
  //   SIZE * 0.5 - 35,
  //   32,
  //   SIZE * 0.5 - 40,
  //   40,
  // );
  // ctx.translate(61, 0);
  // ctx.moveTo(SIZE * 0.5 - 30, 32);
  // ctx.bezierCurveTo(
  //   SIZE * 0.5 - 36,
  //   35,
  //   SIZE * 0.5 - 35,
  //   32,
  //   SIZE * 0.5 - 40,
  //   40,
  // );
  // ctx.translate(-61, 0);
  // ctx.stroke();
  drawGogglesInsect(ctx);
  drawSpriteBackground(ctx, "rgb(220,220,220)", "rgb(20,20,20)");
  // reset(ctx);

  // --- Sprite 7: Beetle ---
  // ctx.translate(SIZE * 7, 0);
  // ctx.fillStyle = "rgb(176, 128, 74)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.strokeStyle = "rgb(125, 78, 24)";
  // ctx.lineWidth = 3;
  // ctx.beginPath();
  // ctx.translate(32, 20);
  // for (let loop = 0; loop < 2; loop++) {
  //   for (
  //     let i = -0.71, j = 0, inc = (Math.PI * 2) / 34;
  //     i < Math.PI * 2 * 0.18;
  //     i += inc, j++
  //   ) {
  //     let ri = (j - 1) % 2 === 0 ? 25 : 28;
  //     let r = j % 2 === 0 ? 22 : 31;
  //     ctx.moveTo(Math.sin(i - inc) * ri, Math.cos(i - inc) * ri);
  //     ctx.lineTo(Math.sin(i) * r, Math.cos(i) * r);
  //   }
  //   if (loop === 0) ctx.translate(60, 0);
  // }
  // ctx.stroke();
  // ctx.translate(-32, 60);
  // ctx.beginPath();
  // for (
  //   let i = -0.74, j = 0, inc = (Math.PI * 2) / 39;
  //   i < Math.PI * 2 * 0.17;
  //   i += inc, j++
  // ) {
  //   let ri = (j - 1) % 2 === 0 ? 25 : 28;
  //   let r = j % 2 === 0 ? 22 : 31;
  //   ctx.moveTo(Math.sin(i - inc) * ri * 1.5, Math.cos(i - inc) * ri);
  //   ctx.lineTo(Math.sin(i) * r * 1.5, Math.cos(i) * r);
  // }
  // ctx.lineWidth = 5;
  // ctx.stroke();
  // ctx.translate(-32 - 28, -80);
  drawBeetle(ctx);
  drawSpriteBackground(ctx, "rgb(176, 128, 74)", "rgb(176, 128, 74)");
  // reset(ctx);

  // --- Sprite 8: Ghostly Mask ---
  // ctx.translate(SIZE * 8, 0);
  // ctx.fillStyle = "rgb(0,0,0)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.strokeStyle = "rgb(205,205,205)";
  // ctx.lineWidth = 4;
  // ctx.beginPath();
  // ctx.moveTo(2, 20);
  // ctx.bezierCurveTo(
  //   HALF_SIZE,
  //   HALF_SIZE - 40,
  //   HALF_SIZE,
  //   HALF_SIZE - 40,
  //   126,
  //   20,
  // );
  // ctx.moveTo(HALF_SIZE - 25, 45);
  // ctx.lineTo(HALF_SIZE - 25, 60);
  // ctx.moveTo(HALF_SIZE + 25, 45);
  // ctx.lineTo(HALF_SIZE + 25, 60);
  // ctx.moveTo(HALF_SIZE - 30, 100);
  // ctx.bezierCurveTo(
  //   HALF_SIZE,
  //   HALF_SIZE + 30,
  //   HALF_SIZE,
  //   HALF_SIZE + 30,
  //   HALF_SIZE + 30,
  //   100,
  // );
  // ctx.moveTo(HALF_SIZE - 33, 95);
  // ctx.lineTo(HALF_SIZE - 29, 106);
  // ctx.moveTo(HALF_SIZE + 33, 95);
  // ctx.lineTo(HALF_SIZE + 29, 106);
  // ctx.stroke();
  drawGhostlyMask(ctx);
  drawSpriteBackground(ctx, "rgb(0,0,0)", "rgb(175,175,175)");
  // reset(ctx);

  // --- Sprite 9: Red Demon ---
  // ctx.translate(SIZE * 9, 0);
  // ctx.fillStyle = "rgb(200,0,0)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.strokeStyle = ctx.fillStyle = "rgb(80,0,0)";
  // ctx.lineWidth = 4;
  // ctx.translate(HALF_SIZE, HALF_SIZE - 5);
  // ctx.beginPath();
  // for (let d = 0; d < 2; d++) {
  //   ctx.moveTo(-40, -41);
  //   ctx.lineTo(-35, 4);
  //   ctx.lineTo(-26, 20);
  //   ctx.lineTo(-23, -32);
  //   ctx.lineTo(-32, -23);
  //   if (d === 0) ctx.scale(-1, 1);
  // }
  // ctx.fill();
  // ctx.translate(0, 4);
  // ctx.beginPath();
  // ctx.moveTo(54, 16);
  // ctx.lineTo(44, 30);
  // ctx.moveTo(-54, 16);
  // ctx.lineTo(-44, 30);
  // ctx.moveTo(-19, 37);
  // ctx.lineTo(-10, 40);
  // ctx.lineTo(0, 50);
  // ctx.lineTo(10, 40);
  // ctx.lineTo(18, 37);
  // ctx.stroke();
  // ctx.translate(0, 2);
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawRedDemon(ctx);
  drawSpriteBackground(ctx, "rgb(200,0,0)", "rgb(80,0,0)", "rgb(200,0,0)");
  // reset(ctx);

  // --- Sprite 10: Grey Weevil ---
  // ctx.translate(1280, 0);
  // ctx.fillStyle = "rgb(220,220,220)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.fillStyle = "rgb(120,120,120)";
  // ctx.lineWidth = 4;
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.beginPath();
  // ctx.moveTo(-HALF_SIZE, -HALF_SIZE);
  // ctx.bezierCurveTo(-28, -58, 0, 0, 0, 10);
  // ctx.bezierCurveTo(0, 0, -28 + HALF_SIZE, -58, HALF_SIZE, -HALF_SIZE);
  // ctx.fill();
  // ctx.beginPath();
  // ctx.moveTo(-20, -18);
  // ctx.lineTo(-13, -6);
  // ctx.moveTo(20, -18);
  // ctx.lineTo(13, -6);
  // ctx.strokeStyle = "rgb(0,0,0)";
  // ctx.stroke();
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawGreyWeevil(ctx);
  drawSpriteBackground(
    ctx,
    "rgb(220,220,220)",
    "rgb(220,220,220)",
    "rgb(120,120,120)",
  );
  // reset(ctx);

  // --- Sprite 11: Aqua Shield Bug ---
  // ctx.translate(SIZE * 11, 0);
  // ctx.fillStyle = "rgb(27, 219, 145)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.fillStyle = ctx.strokeStyle = "rgb(58, 125, 166)";
  // ctx.lineWidth = 7;
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.beginPath();
  // for (let b = 0; b < 2; b++) {
  //   let sign = b === 0 ? -1 : 1;
  //   ctx.moveTo(sign * 30, -35);
  //   ctx.bezierCurveTo(sign * 40, -20, sign * 40, -15, sign * 30, -20);
  //   ctx.bezierCurveTo(sign * 20, -2, sign * 20, -35, sign * 30, -35);
  //   ctx.moveTo(sign * 30, -35);
  //   ctx.lineTo(sign * 34, -11);
  //   ctx.lineTo(sign * 25, -30);
  //   ctx.lineTo(sign * 37, -23);
  // }
  // for (
  //   let i = -0.74, j = 0, inc = (Math.PI * 2) / 39;
  //   i < Math.PI * 2 * 0.17;
  //   i += inc, j++
  // ) {
  //   let r = 29 + Math.sin(i * 183) * 3;
  //   ctx.moveTo(Math.sin(i - inc) * r, Math.cos(i - inc) * r);
  //   ctx.lineTo(Math.sin(i) * r, Math.cos(i) * r);
  // }
  // ctx.stroke();
  // ctx.strokeStyle = "rgb(27, 219, 145)";
  // ctx.lineWidth = 4;
  // ctx.beginPath();
  // ctx.moveTo(-30, -30);
  // ctx.bezierCurveTo(-30, -33, -34, -20, -31, -20);
  // ctx.moveTo(30, -30);
  // ctx.bezierCurveTo(30, -33, 34, -20, 31, -20);
  // ctx.stroke();
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawAquaShieldBug(ctx);
  drawSpriteBackground(ctx, "rgb(27, 219, 145)", "rgb(29, 133, 72)");
  // reset(ctx);

  // --- Sprite 12: Abstract Blue Organism ---
  // ctx.translate(SIZE * 12, 0);
  // ctx.fillStyle = "rgb(23, 118, 235)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.fillStyle = ctx.strokeStyle = "rgb(23, 197, 255)";
  // ctx.lineWidth = 13;
  // ctx.scale(0.3, 0.3);
  // ctx.translate(-92, -62);
  // ctx.fillStyle = "rgb(12, 168, 240)";
  // ellipse(ctx, 186, 172, 18, 18);
  // ellipse(ctx, 413, 135, 18, 18);
  // ctx.fillStyle = "rgb(23, 197, 255)";
  // ellipse(ctx, 315, 261, 33, 33);
  // bezier(159, 238, 181, 223, 187, 216, 233, 227, false, true);
  // bezier(178, 212, 225, 223, 187, 216, 233, 227, false, true);
  // ctx.translate(0, 25);
  // bezier(406, 211, 496, 190, 382, 104, 431, 198, true, true);
  // ctx.lineWidth = 20;
  // bezier(273, 325, 276, 416, 422, 355, 369, 299, true, true);
  // bezier(250, 311, 289, 343, 378, 301, 373, 295, false, true);
  // ctx.beginPath();
  // ctx.fill();
  // ctx.fillStyle = "rgb(23, 118, 235)";
  // ellipse(ctx, 416, 182, 9.5, 15.5);
  // ctx.translate(92, 38);
  // ctx.scale(1 / 0.3, 1 / 0.3);
  drawAbstractBlueOrganism(ctx);
  drawSpriteBackground(ctx, "rgb(23, 118, 235)", "rgb(242, 255, 0)");
  // reset(ctx);

  // --- Sprite 13: Neon Pink/Green Mystery ---
  // ctx.translate(SIZE * 13, 0);
  // ctx.fillStyle = "rgb(255,50,255)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.strokeStyle = "rgb(30,255,100)";
  // ctx.lineWidth = 11;
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.beginPath();
  // ctx.moveTo(-30, -30);
  // ctx.bezierCurveTo(-28, -44, -12, -10, -32, -11);
  // ctx.moveTo(16, -34);
  // ctx.bezierCurveTo(39, -26, 5, -17, 25, -14);
  // ctx.moveTo(-29, 23);
  // ctx.bezierCurveTo(-14, 22, -19, 37, 0, 32);
  // ctx.bezierCurveTo(25, 22, -8, 25, 28, 22);
  // ctx.stroke();
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawNeonPinkGreenMystery(ctx);
  drawSpriteBackground(ctx, "rgb(255,50,255)", "rgb(30,255,100)");
  // reset(ctx);

  // --- Sprite 14: Dual Tone Red Bug ---
  // ctx.translate(SIZE * 14, 0);
  // ctx.fillStyle = "rgb(219, 72, 92)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.strokeStyle = ctx.fillStyle = "rgb(100,0,0)";
  // ctx.lineWidth = 6;
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.fillRect(-SIZE * 0.5, -SIZE * 0.5, SIZE * 0.5, SIZE);
  // ctx.beginPath();
  // ctx.moveTo(30, -10);
  // ctx.lineTo(30, -25);
  // ctx.stroke();
  // ctx.beginPath();
  // ctx.ellipse(ctx, 30, -24, 10, 5, 0, -3.0, -12.7);
  // ctx.stroke();
  // ctx.strokeStyle = ctx.fillStyle = "rgb(219,72,92)";
  // ctx.fillRect(-SIZE * 0.5, SIZE * 0.5, SIZE, 129);
  // ctx.beginPath();
  // ctx.moveTo(-30, -10);
  // ctx.lineTo(-30, -25);
  // ctx.stroke();
  // ctx.beginPath();
  // ctx.ellipse(ctx, -30, -24, 10, 5, 0, -3.0, -12.7);
  // ctx.stroke();
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  // ctx.fillStyle = "rgb(100,0,0)";
  // ctx.translate(0, SIZE);
  // ctx.beginPath();
  // ctx.moveTo(SIZE * 0.5, 0);
  // ctx.lineTo(0, SIZE * 0.5);
  // ctx.lineTo(SIZE * 0.5, SIZE);
  // ctx.lineTo(SIZE, SIZE * 0.5);
  // ctx.fill();
  drawDualToneRedBug(ctx);
  // reset(ctx);

  // --- Sprite 15: Pink/Red Alien Head ---
  // ctx.translate(SIZE * 15, 0);
  // ctx.fillStyle = "rgb(255, 149, 125)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.strokeStyle = ctx.fillStyle = "rgb(255, 20, 0)";
  // ctx.lineWidth = 6;
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.beginPath();
  // ctx.moveTo(-45, -30);
  // ctx.bezierCurveTo(-45, -40, -20, -40, -13, -23);
  // ctx.moveTo(-19, 40);
  // ctx.bezierCurveTo(-34, 7, 32, 8, 32, 40);
  // ctx.scale(-1, 1);
  // ctx.moveTo(-45, -30);
  // ctx.bezierCurveTo(-45, -40, -20, -40, -13, -23);
  // ctx.stroke();
  // ctx.scale(-1, 1);
  // ctx.beginPath();
  // ctx.ellipse(ctx, -24, -11, 7, 10, 0, 0, 7);
  // ctx.ellipse(ctx, 24, -11, 7, 10, 0, 0, 7);
  // ctx.fill();
  // ctx.fillStyle = "rgb(255, 149, 125)";
  // ctx.beginPath();
  // ctx.ellipse(ctx, -28, -5, 2, 4, 0, 0, 7);
  // ctx.ellipse(ctx, 21, -5, 2, 4, 0, 0, 7);
  // ctx.fill();
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawPinkRedAlienHead(ctx);
  drawSpriteBackground(
    ctx,
    "rgb(255, 149, 125)",
    "rgb(245, 123, 95)",
    "rgb(214, 60, 26)",
  );
  // reset(ctx);

  // ==========================================
  // ROW 2: TEXTURES (Y-Offset: 256)
  // ==========================================

  // --- Row 2, Sprite 0: Red Crest Crest ---
  // ctx.translate(0, 256);
  // ctx.fillStyle = "rgb(255,0,0)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.fillStyle = "rgb(255, 255, 255)";
  // ctx.lineWidth = 6;
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.beginPath();
  // ctx.moveTo(-64, 64);
  // ctx.lineTo(-64, -32);
  // ctx.lineTo(-32, -64);
  // ctx.bezierCurveTo(5, 0, -5, 0, 32, -64);
  // ctx.lineTo(64, -32);
  // ctx.lineTo(64, 64);
  // ctx.bezierCurveTo(-25, 0, 25, 0, -64, 64);
  // ctx.moveTo(-20, 37);
  // ctx.bezierCurveTo(-10, 52, 10, 52, 20, 37);
  // ctx.bezierCurveTo(10, 47, -10, 47, -20, 37);
  // ctx.fill();
  // ctx.beginPath();
  // ctx.ellipse(ctx, -25, 0, 4, 3, 0, 0, 7);
  // ctx.rect(-33, 0, 10, 1);
  // ctx.moveTo(25, 0);
  // ctx.ellipse(ctx, 25, 0, 4, 3, 0, 0, 7);
  // ctx.rect(23, 0, 10, 1);
  // ctx.fillStyle = ctx.strokeStyle = "rgb(255, 0, 0)";
  // ctx.fill();
  // ctx.stroke();
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawRedCrestCrest(ctx);
  drawSpriteBackground(ctx, "rgb(255,0,0)", "rgb(255,255,255)");
  // reset(ctx);

  // --- Row 2, Sprite 1: Blue Geometric ---
  // ctx.translate(SIZE, 256);
  // ctx.fillStyle = "rgb(0,0,255)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.fillStyle = "rgb(255, 255, 255)";
  // ctx.lineWidth = 5;
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.beginPath();
  // ctx.moveTo(-64, -64);
  // ctx.lineTo(0, -25);
  // ctx.lineTo(64, -64);
  // ctx.lineTo(64, -44);
  // ctx.lineTo(50, -34);
  // ctx.lineTo(64, -24);
  // ctx.lineTo(64, -4);
  // ctx.lineTo(50, 6);
  // ctx.lineTo(64, 26);
  // ctx.lineTo(15, 26);
  // ctx.bezierCurveTo(15, 10, -15, 10, -15, 26);
  // ctx.lineTo(-64, 26);
  // ctx.lineTo(-50, 6);
  // ctx.lineTo(-64, -4);
  // ctx.lineTo(-64, -24);
  // ctx.lineTo(-50, -34);
  // ctx.fill();
  // ctx.beginPath();
  // ctx.moveTo(-30, 45);
  // ctx.lineTo(-20, 55);
  // ctx.lineTo(20, 55);
  // ctx.lineTo(30, 45);
  // ctx.moveTo(-27, 42);
  // ctx.lineTo(-33, 48);
  // ctx.moveTo(27, 42);
  // ctx.lineTo(33, 48);
  // ctx.strokeStyle = "rgb(255, 255, 255)";
  // ctx.stroke();
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawBlueGeometric(ctx);
  drawSpriteBackground(ctx, "rgb(0,0,255)", "rgb(255,255,255)");
  // reset(ctx);

  // --- Row 2, Sprite 2: Yellow/Black Grate ---
  // ctx.translate(SIZE * 2, 256);
  // ctx.fillStyle = "rgb(0,0,0)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.lineWidth = 6;
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.beginPath();
  // for (let xOffset of [-45, -30, -15, 0, 45, 30, 15]) {
  //   ctx.moveTo(xOffset, -40);
  //   ctx.lineTo(xOffset, 40);
  // }
  // ctx.fillStyle = ctx.strokeStyle = "rgb(255,255,0)";
  // ctx.fill();
  // ctx.stroke();
  // ctx.beginPath();
  // ctx.moveTo(-64, -64);
  // ctx.lineTo(-64, -40);
  // ctx.bezierCurveTo(-39, -15, 39, -15, 64, -40);
  // ctx.lineTo(64, -64);
  // ctx.moveTo(-64, 64);
  // ctx.lineTo(-64, 10);
  // ctx.bezierCurveTo(-39, 25, 39, 25, 64, 10);
  // ctx.lineTo(64, 64);
  // ctx.fill();
  // ctx.beginPath();
  // ctx.moveTo(-15, 40);
  // ctx.lineTo(0, 55);
  // ctx.lineTo(15, 40);
  // ctx.strokeStyle = "rgb(0,0,0)";
  // ctx.stroke();
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawYellowBlackGrate(ctx);
  drawSpriteBackground(ctx, "rgb(255,255,0)", "rgb(255,255,255)");
  // reset(ctx);

  // --- Row 2, Sprite 3: Dark Blue Sad Face ---
  // ctx.translate(SIZE * 3, 256);
  // ctx.fillStyle = "rgb(17, 32, 43)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.lineWidth = 6;
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.fillStyle = ctx.strokeStyle = "rgb(59, 142, 209)";
  // ctx.beginPath();
  // ctx.ellipse(ctx, -26, -29, 6, 8, 9.2, 7, 15);
  // ctx.ellipse(ctx, 26, -29, 7, 9, -9.2, 7, 15);
  // ctx.fill();
  // ellipse(ctx, 0, -2, 5, 5, -9.2);
  // ctx.beginPath();
  // ctx.moveTo(-26, 23);
  // ctx.bezierCurveTo(-10, 38, 24, 31, 29, 21);
  // ctx.moveTo(-25, 13);
  // ctx.bezierCurveTo(-23, 21, -29, 30, -36, 28);
  // ctx.moveTo(31, 12);
  // ctx.bezierCurveTo(28, 21, 34, 30, 40, 28);
  // ctx.stroke();
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawDarkBlueSadFace(ctx);
  drawSpriteBackground(ctx, "rgb(17, 32, 43)", "rgb(59, 142, 209)");
  // reset(ctx);

  // --- Row 2, Sprite 4: Angry Orange Mouth ---
  // ctx.translate(SIZE * 4, 256);
  // ctx.fillStyle = "rgb(17, 32, 43)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.lineWidth = 6;
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.fillStyle = ctx.strokeStyle = "rgb(243, 73, 45)";
  // ctx.beginPath();
  // ctx.moveTo(-36, -20);
  // ctx.bezierCurveTo(-28, -28, -15, -19, -18, -16);
  // ctx.moveTo(36, -20);
  // ctx.bezierCurveTo(28, -28, 15, -19, 18, -16);
  // ctx.stroke();
  // ctx.lineWidth = 4;
  // ctx.beginPath();
  // ctx.moveTo(-26, 23);
  // ctx.bezierCurveTo(-11, 40, 16, 32, 26, 21);
  // ctx.bezierCurveTo(13, 58, -20, 32, -26, 23);
  // ctx.fill();
  // ctx.stroke();
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawAngryOrangeMouth(ctx);
  drawSpriteBackground(ctx, "rgb(17, 32, 43)", "rgb(243, 73, 45)");
  // reset(ctx);

  // --- Row 2, Sprite 5: Triple Cry Eyes ---
  // ctx.translate(SIZE * 5, 256);
  // ctx.fillStyle = "rgb(59, 94, 157)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.lineWidth = 4;
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.fillStyle = ctx.strokeStyle = "rgb(182, 220, 248)";
  // for (let step = 0; step < 2; step++) {
  //   ctx.beginPath();
  //   ctx.moveTo(-13, -25);
  //   ctx.bezierCurveTo(-16, -9, -41, -6, -39, -26);
  //   ctx.stroke();
  //   ctx.fill();
  //   ctx.beginPath();
  //   ctx.moveTo(-39, -26);
  //   ctx.bezierCurveTo(-24, -23, -13, -20, -8, -29);
  //   ctx.stroke();
  //   if (step === 0) ctx.translate(51, 0);
  // }
  // ctx.scale(1.45, 1.45);
  // ctx.translate(-12, 35);
  // ctx.beginPath();
  // ctx.moveTo(-13, -25);
  // ctx.bezierCurveTo(-16, -9, -41, -6, -39, -26);
  // ctx.stroke();
  // ctx.fill();
  // ctx.beginPath();
  // ctx.moveTo(-39, -26);
  // ctx.bezierCurveTo(-24, -23, -13, -20, -8, -29);
  // ctx.stroke();
  // ctx.translate(12, -35);
  // ctx.scale(1 / 1.45, 1 / 1.45);
  // ctx.translate(-51, 0);
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawTripleCryEyes(ctx);
  drawSpriteBackground(ctx, "rgb(59, 94, 157)", "rgb(59, 142, 209)");
  // reset(ctx);

  // --- Row 2, Sprite 6: White/Orange Face ---
  // ctx.translate(SIZE * 6, 256);
  // ctx.fillStyle = "rgb(241,241,241)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.lineWidth = 6;
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.fillStyle = ctx.strokeStyle = "rgb(243, 73, 45)";
  // ctx.beginPath();
  // ctx.moveTo(-16, 29);
  // ctx.bezierCurveTo(-5, 42, 0, 37, 10, 35);
  // ctx.stroke();
  // ctx.lineWidth = 4;
  // ctx.beginPath();
  // ctx.moveTo(-49, -25);
  // ctx.bezierCurveTo(-11, -13, 23, -25, 45, -36);
  // ctx.bezierCurveTo(45, 19, 22, 13, 2, -11);
  // ctx.bezierCurveTo(-10, 22, -36, 13, -49, -25);
  // ctx.fill();
  // ctx.stroke();
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawWhiteOrangeFace(ctx);
  drawSpriteBackground(ctx, "rgb(241,241,241)", "rgb(243, 73, 45)");
  // reset(ctx);

  // --- Row 2, Sprite 7: Grey Owl Look ---
  // ctx.translate(SIZE * 7, 256);
  // ctx.fillStyle = "rgb(160,160,160)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.lineWidth = 6;
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.fillStyle = ctx.strokeStyle = "rgb(0,0,0)";
  // ctx.beginPath();
  // ctx.moveTo(-41, -35);
  // ctx.bezierCurveTo(-41, -32, -22, -25, -18, -28);
  // ctx.moveTo(41, -35);
  // ctx.bezierCurveTo(41, -32, 22, -25, 18, -28);
  // ctx.stroke();
  // ctx.beginPath();
  // ctx.moveTo(-15, 32);
  // ctx.bezierCurveTo(5, 16, -5, 16, 15, 32);
  // ctx.stroke();
  // drawEyes(ctx, 28, -14, 7, 9);
  // ctx.fillRect(-53.5, 11.4, 23, 9);
  // ctx.fillRect(30.5, 11.4, 23, 9);
  // ctx.fillStyle = "rgb(160,160,160)";
  // ctx.beginPath();
  // ctx.ellipse(ctx, -32, -12, 3, 5, 0, 0, 7);
  // ctx.ellipse(ctx, 24, -12, 3, 5, 0, 0, 7);
  // ctx.fill();
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawGreyOwlLook(ctx);
  drawSpriteBackground(ctx, "rgb(160,160,160)", "rgb(240,240,240)");
  // reset(ctx);

  // --- Row 2, Sprite 8: Soft Blue/White ---
  // ctx.translate(SIZE * 8, 256);
  // ctx.fillStyle = "rgb(242, 255, 255)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.lineWidth = 6;
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.strokeStyle = "rgb(100,100,150)";
  // ctx.beginPath();
  // ctx.translate(-65, -52);
  // for (let r = 0; r < 2; r++) {
  //   ctx.moveTo(35, 15);
  //   ctx.bezierCurveTo(25, 22, 15, 41, 30, 49);
  //   ctx.bezierCurveTo(52, 54, 43, 18, 33, 37);
  //   if (r === 0) {
  //     ctx.translate(130, -9);
  //     ctx.scale(-1, 1);
  //   }
  // }
  // ctx.scale(-1, 1);
  // ctx.translate(-65, 62);
  // ctx.stroke();
  // ctx.beginPath();
  // ctx.moveTo(11, 11);
  // ctx.bezierCurveTo(4, 40, -6, 35, -8, 31);
  // ctx.bezierCurveTo(-9, 12, 3, 22, 11, 11);
  // ctx.stroke();
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  // ctx.fillStyle = "rgb(242, 255, 255)";
  // ctx.fillRect(0, SIZE - 1, SIZE, 128.5);
  drawSoftBlueWhite(ctx);
  // reset(ctx);

  // --- Row 2, Sprite 9a: Copy of 8 with Blue Underbelly ---
  // ctx.translate(SIZE * 9, 256);
  // ctx.fillStyle = "rgb(242, 255, 255)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.lineWidth = 6;
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.strokeStyle = "rgb(100,100,150)";
  // ctx.beginPath();
  // ctx.translate(-65, -52);
  // for (let r = 0; r < 2; r++) {
  //   ctx.moveTo(35, 15);
  //   ctx.bezierCurveTo(25, 22, 15, 41, 30, 49);
  //   ctx.bezierCurveTo(52, 54, 43, 18, 33, 37);
  //   if (r === 0) {
  //     ctx.translate(130, -9);
  //     ctx.scale(-1, 1);
  //   }
  // }
  // ctx.scale(-1, 1);
  // ctx.translate(-65, 62);
  // ctx.stroke();
  // ctx.beginPath();
  // ctx.moveTo(11, 11);
  // ctx.bezierCurveTo(4, 40, -6, 35, -8, 31);
  // ctx.bezierCurveTo(-9, 12, 3, 22, 11, 11);
  // ctx.stroke();
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawCopyOf8WithBlueUnderbelly(ctx);
  drawSpriteBackground(
    ctx,
    "rgb(17, 32, 43)",
    "rgb(59, 142, 209)",
    "rgb(17, 32, 43)",
  );
  ctx.fillRect(0, SIZE - 1, SIZE, 128.5);
  // reset(ctx);

  // --- Row 2, Sprite 9b: Shadow Blue Beetle Mouth ---
  // ctx.translate(SIZE * 9, 256);
  // ctx.fillStyle = "rgb(17, 32, 43)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.lineWidth = 6;
  // ctx.translate(HALF_SIZE, HALF_SIZE + 10);
  // ctx.fillStyle = ctx.strokeStyle = "rgb(59, 142, 209)";
  // ctx.beginPath();
  // for (let s of [-1, 1]) {
  //   ctx.moveTo(s * 64, 5);
  //   ctx.lineTo(s * 48, 12.5);
  //   ctx.lineTo(s * 60, 20);
  //   ctx.lineTo(s * 48, 27.5);
  //   ctx.lineTo(s * 64, 35);
  // }
  // ctx.fill();
  // ctx.beginPath();
  // ctx.moveTo(43, -45);
  // ctx.lineTo(14, -40);
  // ctx.moveTo(-39, -44);
  // ctx.lineTo(-11, -40);
  // ctx.stroke();
  // drawEyes(ctx, 23, -30, 10, 13);
  // ctx.fillStyle = "rgb(17, 32, 43)";
  // ctx.beginPath();
  // ctx.ellipse(ctx, 19, -28, 6, 8, 0, 0, 7);
  // ctx.ellipse(ctx, -26, -27, 6, 8, 0, 0, 7);
  // ctx.fill();
  // ctx.translate(0, -10);
  // ctx.fillStyle = "rgb(59, 142, 209)";
  // ctx.translate(-31, 51);
  // ctx.scale(-1.4, 1.4);
  // ctx.beginPath();
  // ctx.moveTo(-13, -25);
  // ctx.bezierCurveTo(-16, -9, -41, -6, -39, -26);
  // ctx.stroke();
  // ctx.fill();
  // ctx.beginPath();
  // ctx.moveTo(-39, -26);
  // ctx.bezierCurveTo(-24, -23, -13, -20, -8, -29);
  // ctx.stroke();
  // ctx.scale(1 / -1.4, 1 / 1.4);
  // ctx.translate(31, -51);
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawShadowBlueBeetleMouth(ctx);
  drawSpriteBackground(ctx, "rgb(17, 32, 43)", "rgb(59, 142, 209)");
  // reset(ctx);

  // --- Row 2, Sprite 10: Jagged Orange Jaws ---
  // ctx.translate(SIZE * 10, 256);
  // ctx.fillStyle = "rgb(17, 32, 43)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.lineWidth = 5;
  // ctx.translate(HALF_SIZE, HALF_SIZE + 10);
  // ctx.fillStyle = ctx.strokeStyle = "rgb(243,73,45)";
  // ctx.beginPath();
  // for (let s of [-1, 1]) {
  //   ctx.moveTo(s * 64, 5);
  //   ctx.lineTo(s * 48, 12.5);
  //   ctx.lineTo(s * 60, 20);
  //   ctx.lineTo(s * 48, 27.5);
  //   ctx.lineTo(s * 64, 35);
  // }
  // ctx.fill();
  // ctx.beginPath();
  // ctx.moveTo(43, -45);
  // ctx.lineTo(14, -40);
  // ctx.moveTo(-39, -44);
  // ctx.lineTo(-11, -40);
  // ctx.stroke();
  // drawEyes(ctx, 23, -30, 10, 13);
  // ctx.strokeStyle = "rgb(17, 32, 43)";
  // ctx.beginPath();
  // ctx.moveTo(39, -29);
  // ctx.lineTo(0, -22);
  // ctx.lineTo(-39, -29);
  // ctx.stroke();
  // ctx.translate(0, -10);
  // ctx.strokeStyle = "rgb(243,73,45)";
  // ctx.translate(-31, 51);
  // ctx.scale(-1.4, 1.4);
  // ctx.beginPath();
  // ctx.moveTo(-12, -21);
  // ctx.bezierCurveTo(-12, -14, -31, -12, -36, -17);
  // ctx.stroke();
  // ctx.scale(1 / -1.4, 1 / 1.4);
  // ctx.translate(31, -51);
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawJaggedOrangeJaws(ctx);
  drawSpriteBackground(ctx, "rgb(17, 32, 43)", "rgb(243,73,45)");
  // reset(ctx);

  // --- Row 2, Sprite 11: Green Mask Insect ---
  // ctx.translate(SIZE * 11, 256);
  // ctx.fillStyle = "rgb(50, 190, 71)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.lineWidth = 6;
  // ctx.translate(HALF_SIZE, HALF_SIZE + 10);
  // ctx.fillStyle = ctx.strokeStyle = "rgb(17, 32, 43)";
  // drawEyes(ctx, 22, -30, 7, 9);
  // ctx.fillRect(-41, -44, 30, 10);
  // ctx.fillRect(11, -44, 30, 10);
  // ctx.fillStyle = "rgb(50, 190, 71)";
  // ctx.lineWidth = 3;
  // ctx.beginPath();
  // ctx.moveTo(-40, 10);
  // ctx.lineTo(-36, 14);
  // ctx.lineTo(-40, 18);
  // ctx.moveTo(40, 10);
  // ctx.lineTo(36, 14);
  // ctx.lineTo(40, 18);
  // ctx.stroke();
  // ctx.beginPath();
  // ctx.ellipse(ctx, 18, -28, 4, 5, 0, 0, 7);
  // ctx.ellipse(ctx, -26, -28, 4, 5, 0, 0, 7);
  // ctx.fill();
  // ctx.translate(0, -10);
  // ctx.lineWidth = 6;
  // ctx.beginPath();
  // ctx.moveTo(-15, 20);
  // ctx.lineTo(0, 30);
  // ctx.lineTo(15, 20);
  // ctx.stroke();
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawGreenMaskInsect(ctx);
  drawSpriteBackground(ctx, "rgb(50, 190, 71)", "rgb(17, 32, 43)");
  // reset(ctx);

  // --- Row 2, Sprite 12: Golden Alien Head ---
  // ctx.translate(SIZE * 12, 256);
  // ctx.fillStyle = "rgb(240, 211, 24)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.lineWidth = 6;
  // ctx.translate(HALF_SIZE, HALF_SIZE + 7);
  // ctx.fillStyle = ctx.strokeStyle = "rgb(17, 32, 43)";
  // ctx.beginPath();
  // ctx.ellipse(ctx, -32, -29, 9, 9, 0, 0, 7);
  // ctx.ellipse(ctx, 21, -29, 9, 9, 0, 0, 7);
  // ctx.fill();
  // ctx.beginPath();
  // ctx.moveTo(-39, -34);
  // ctx.bezierCurveTo(-28, -46, -19, -38, -14, -32);
  // ctx.moveTo(13, -34);
  // ctx.bezierCurveTo(27, -46, 36, -38, 41, -32);
  // ctx.translate(0, -16);
  // ctx.moveTo(-37, 23);
  // ctx.bezierCurveTo(-10, 38, 24, 31, 42, 21);
  // ctx.moveTo(-36, 15);
  // ctx.bezierCurveTo(-36, 21, -35, 28, -44, 29);
  // ctx.moveTo(44, 12);
  // ctx.bezierCurveTo(40, 21, 46, 30, 48, 28);
  // ctx.stroke();
  // ctx.translate(0, -6);
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawGoldenAlienHead(ctx);
  drawSpriteBackground(ctx, "rgb(240, 211, 24)", "rgb(17, 32, 43)");
  // reset(ctx);

  // --- Row 2, Sprite 13: Yellow Cat Beetle ---
  // ctx.translate(SIZE * 13, 256);
  // ctx.fillStyle = "rgb(252, 186, 3)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.lineWidth = 4;
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.fillStyle = "rgb(99, 73, 39)";
  // ctx.beginPath();
  // for (let x of [-25, 0, 25]) {
  //   ctx.translate(x, 0);
  //   ctx.moveTo(-8, -64);
  //   ctx.bezierCurveTo(0, -30, 0, -30, 8, -64);
  //   ctx.translate(-x, 0);
  // }
  // ctx.fill();
  // ctx.fillStyle = ctx.strokeStyle = "rgb(17, 32, 43)";
  // for (let s of [-1, 1]) {
  //   ctx.beginPath();
  //   ctx.translate(s * 25, -10);
  //   ctx.scale(1.2, 1.5);
  //   ctx.rotate(s * 0.15);
  //   ctx.moveTo(-10, 0);
  //   ctx.bezierCurveTo(-8, 7, 8, 7, 10, 0);
  //   ctx.bezierCurveTo(8, -7, -8, -7, -10, 0);
  //   reset(ctx);
  //   ctx.translate(SIZE * 13 + HALF_SIZE, 256 + HALF_SIZE);
  // }
  // ctx.fill();
  // ctx.beginPath();
  // ctx.moveTo(-7, 10);
  // ctx.bezierCurveTo(-5, 13, 5, 13, 7, 10);
  // ctx.moveTo(0, 13);
  // ctx.lineTo(0, 22);
  // ctx.moveTo(-20, 20);
  // ctx.bezierCurveTo(-10, 28, -5, 28, 0, 20);
  // ctx.moveTo(20, 20);
  // ctx.bezierCurveTo(10, 28, 5, 28, 0, 20);
  // ctx.moveTo(-31, 14);
  // ctx.lineTo(-62, 0);
  // ctx.moveTo(-31, 22);
  // ctx.lineTo(-62, 27);
  // ctx.moveTo(31, 14);
  // ctx.lineTo(62, 0);
  // ctx.moveTo(31, 22);
  // ctx.lineTo(62, 27);
  // ctx.stroke();
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawYellowCatBeetle(ctx);
  drawSpriteBackground(ctx, "rgb(252, 186, 3)", "rgb(99, 73, 39)");
  // reset(ctx);

  // --- Row 2, Sprite 14: Star Burst Spark ---
  // ctx.translate(SIZE * 14, 256);
  // ctx.fillStyle = "rgb(117, 184, 235)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.lineWidth = 8;
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.fillStyle = ctx.strokeStyle = "rgb(255,255,255)";
  // ctx.beginPath();
  // ctx.translate(0, 17);
  // ctx.moveTo(-20, 0);
  // ctx.lineTo(0, 15);
  // ctx.lineTo(20, 0);
  // ctx.translate(0, -14);
  // ctx.stroke();
  // ctx.beginPath();
  // ctx.scale(0.36, 0.54);
  // ctx.translate(-75, -37);
  // for (let star = 0; star < 2; star++) {
  //   ctx.moveTo(0, 40);
  //   ctx.bezierCurveTo(10, 10, 10, 10, 40, 0);
  //   ctx.bezierCurveTo(10, -10, 10, -10, 0, -40);
  //   ctx.bezierCurveTo(-10, -10, -10, -10, -40, 0);
  //   ctx.bezierCurveTo(-10, 10, -10, 10, 0, 40);
  //   if (star === 0) ctx.translate(150, 0);
  // }
  // ctx.fill();
  // reset(ctx);
  // ctx.translate(SIZE * 14, 256);
  drawStarbustSpark(ctx);
  drawSpriteBackground(ctx, "rgb(117, 184, 235)", "rgb(255,255,255)");
  // reset(ctx);

  // --- Row 2, Sprite 15: Deep Red Beholder Head ---
  // ctx.translate(SIZE * 15, 256);
  // ctx.fillStyle = "rgb(27, 42, 53)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.lineWidth = 6;
  // ctx.translate(HALF_SIZE, HALF_SIZE + 10);
  // ctx.fillStyle = ctx.strokeStyle = "rgb(243, 73, 45)";
  // ctx.beginPath();
  // ctx.moveTo(-37, -47);
  // ctx.bezierCurveTo(-26, -36, -12, -45, -20, -36);
  // ctx.moveTo(37, -47);
  // ctx.bezierCurveTo(26, -36, 12, -45, 20, -36);
  // ctx.moveTo(-25, -37);
  // ctx.ellipse(ctx, -21, -31, 6, 10, 0, 0, 7);
  // ctx.moveTo(25, -37);
  // ctx.ellipse(ctx, 21, -31, 6, 10, Math.PI, 0, 7);
  // ctx.translate(0, -3);
  // for (
  //   let i = -1.2, j = 0, inc = (Math.PI * 2) / 15;
  //   i < Math.PI - 1.0;
  //   i += inc, j++
  // ) {
  //   let ri = (j - 1) % 2 === 0 ? 15 : 30;
  //   let r = j % 2 === 0 ? 15 : 30;
  //   ctx.moveTo(Math.sin(i - inc) * ri * 1.25, Math.cos(i - inc) * ri + 10);
  //   ctx.lineTo(Math.sin(i) * r * 1.25, Math.cos(i) * r + 10);
  // }
  // ctx.stroke();
  // reset(ctx);
  // ctx.translate(SIZE * 15, 256);
  drawDeepRedBeholderHead(ctx);
  drawSpriteBackground(ctx, "rgb(27, 42, 53)", "rgb(243, 73, 45)");
  // reset(ctx);

  // ==========================================
  // ROW 3: TEXTURES (Y-Offset: 512)
  // ==========================================

  // --- Row 3, Sprite 0: Furry Cat Antennae ---
  // ctx.translate(0, SIZE * 4);
  // ctx.fillStyle = "rgb(150, 106, 85)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.lineWidth = 6;
  // ctx.fillStyle = "rgb(255,255,255)";
  // ctx.strokeStyle = "rgb(0,0,0)";
  // for (let side = 0; side < 2; side++) {
  //   ctx.beginPath();
  //   ctx.moveTo(-37, -10);
  //   ctx.bezierCurveTo(-35, -55, -4, -29, -15, -10);
  //   ctx.bezierCurveTo(-16, -5, -36, -5, -37, -10);
  //   ctx.fill();
  //   ctx.fillStyle = "rgb(0,0,0)";
  //   ctx.beginPath();
  //   ctx.moveTo(-30, -7);
  //   ctx.bezierCurveTo(-32, -22, -15, -22, -15, -10);
  //   ctx.bezierCurveTo(-16, -5, -36, -5, -30, -7);
  //   ctx.fill();
  //   if (side === 0) {
  //     ctx.scale(-1, 1);
  //     ctx.fillStyle = "rgb(255,255,255)";
  //   }
  // }
  // ctx.fillRect(30.6, 1.6, 25, 12);
  // ellipse(ctx, 1, 2, 4, 4);
  // drawMouthArc(ctx, 21, 19, 13);
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawFurryCatAntennae(ctx);
  drawSpriteBackground(ctx, "rgb(150, 106, 85)", "rgb(255, 200, 18)");
  // reset(ctx);

  // --- Row 3, Sprite 1: Gold Crown Crown ---
  // ctx.translate(SIZE, SIZE * 4);
  // ctx.fillStyle = "rgb(229, 178, 56)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.lineWidth = 5;
  // ctx.fillStyle = ctx.strokeStyle = "rgb(0,0,0)";
  // drawEyes(ctx, 26, -21, 8, 12);
  // ctx.beginPath();
  // ctx.moveTo(-40, -38);
  // ctx.lineTo(-21, -33);
  // ctx.moveTo(40, -38);
  // ctx.lineTo(21, -33);
  // ctx.moveTo(0, 3);
  // ctx.lineTo(0, 32);
  // ctx.bezierCurveTo(0, 40, -26, 40, -26, 32);
  // ctx.moveTo(0, 32);
  // ctx.bezierCurveTo(0, 40, 26, 40, 26, 32);
  // ctx.stroke();
  // ellipse(ctx, 0, 3, 8, 5);
  // ellipse(ctx, 24, 10, 3, 3);
  // ellipse(ctx, 32, 21, 3, 3);
  // ellipse(ctx, 16, 21, 3, 3);
  // ellipse(ctx, 0, 3, 8, 5);
  // ellipse(ctx, -24, 10, 3, 3);
  // ellipse(ctx, -32, 21, 3, 3);
  // ellipse(ctx, -16, 21, 3, 3);
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawGoldCrownCrown(ctx);
  drawSpriteBackground(ctx, "rgb(229, 178, 56)", "rgb(229, 207, 56)");
  // reset(ctx);

  // --- Row 3, Sprite 2: Wide Aqua Visor ---
  // ctx.translate(SIZE * 2, SIZE * 4);
  // ctx.fillStyle = "rgb(27, 42, 53)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.lineWidth = 5;
  // ctx.fillStyle = "rgb(68, 152, 213)";
  // ctx.beginPath();
  // ctx.moveTo(-64, -50);
  // ctx.bezierCurveTo(-34, -24, 34, -24, 64, -50);
  // ctx.lineTo(64, -8);
  // ctx.bezierCurveTo(44, 20, -44, 20, -64, -8);
  // ctx.fill();
  // ctx.fillStyle = "rgb(27, 42, 53)";
  // ellipse(ctx, -27, -13, 12, 7, 0.3);
  // ellipse(ctx, 27, -13, 12, 7, -0.3);
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  // ctx.fillStyle = "rgb(27, 42, 53)";
  // ctx.fillRect(0, SIZE, SIZE, SIZE);
  drawWideAquaVisor(ctx);
  // reset(ctx);

  // --- Row 3, Sprite 3: Red Stripe Grey Shard ---
  // ctx.translate(SIZE * 3, SIZE * 4);
  // ctx.fillStyle = "rgb(159, 159, 159)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.lineWidth = 3;
  // ctx.fillStyle = "rgb(255,255,255)";
  // ctx.strokeStyle = "rgb(255,0,0)";
  // ellipse(ctx, -24, -23, 5, 5);
  // ellipse(ctx, 24, -23, 5, 5);
  // ctx.beginPath();
  // ctx.translate(-41, 0);
  // for (let row = 0; row < 2; row++) {
  //   ctx.moveTo(0, 0);
  //   ctx.lineTo(-5, 5);
  //   ctx.moveTo(7, 0);
  //   ctx.lineTo(2, 5);
  //   ctx.moveTo(14, 0);
  //   ctx.lineTo(9, 5);
  //   if (row === 0) ctx.translate(70, 0);
  // }
  // ctx.translate(-29, 0);
  // ctx.stroke();
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  // ctx.fillStyle = "rgb(159, 159, 159)";
  // ctx.fillRect(0, SIZE, SIZE, SIZE);
  drawRedStripeGreyShard(ctx);
  // reset(ctx);

  // --- Row 3, Sprite 4: Gold Spectacle Frame ---
  // ctx.translate(SIZE * 4, SIZE * 4);
  // ctx.fillStyle = "rgb(27, 42, 53)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.translate(HALF_SIZE, HALF_SIZE);
  // ctx.fillStyle = "rgb(229, 207, 56)";
  // ctx.fillRect(-10, -20, 20, 10);
  // ctx.fillRect(-64, -40, 35, 50);
  // ellipse(ctx, -29, -15, 25, 25);
  // ctx.fillRect(29, -40, 35, 50);
  // ellipse(ctx, 29, -15, 25, 25);
  // ctx.fillStyle = "rgb(27, 42, 53)";
  // ellipse(ctx, -27, -15, 8, 12);
  // ellipse(ctx, 27, -15, 8, 12);
  // ctx.fillStyle = "rgb(229, 207, 56)";
  // ellipse(ctx, 21, -16, 4, 6);
  // ellipse(ctx, -32, -16, 4, 6);
  // ctx.translate(-HALF_SIZE, -HALF_SIZE);
  drawGoldSpectacleFrame(ctx);
  drawSpriteBackground(ctx, "rgb(27, 42, 53)", "rgb(229, 207, 56)");
  // reset(ctx);

  // --- Row 3, Sprite 5: Grey Furred Moth ---
  // ctx.translate(SIZE * 5, SIZE * 4);
  // ctx.fillStyle = "rgb(27, 42, 53)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.translate(HALF_SIZE, HALF_SIZE - 8);
  // ctx.lineWidth = 6;
  // ctx.fillStyle = ctx.strokeStyle = "rgb(241, 241, 241)";
  // ctx.beginPath();
  // ctx.moveTo(-11, -33);
  // ctx.bezierCurveTo(-19, -26, -18, -20, -38, -16);
  // ctx.moveTo(6, -33);
  // ctx.bezierCurveTo(9, -26, 11, -20, 30, -16);
  // ctx.stroke();
  // ctx.lineWidth = 4;
  // drawMouthArc(ctx, 40, 13, -1);
  // ctx.fillStyle = ctx.strokeStyle = "rgb(159, 159, 159)";
  // ctx.beginPath();
  // ctx.moveTo(-12, -4);
  // ctx.bezierCurveTo(-15, 23, -41, 14, -37, -3);
  // ctx.lineTo(-12, -4);
  // ctx.moveTo(12, -4);
  // ctx.bezierCurveTo(8, 27, 40, 12, 34, -3);
  // ctx.lineTo(12, -4);
  // ctx.fill();
  // ctx.stroke();
  // ctx.fillStyle = ctx.strokeStyle = "rgb(241, 241, 241)";
  // ctx.beginPath();
  // ctx.moveTo(-12, -4);
  // ctx.bezierCurveTo(-22, 13, -32, 3, -37, -3);
  // ctx.lineTo(-12, -4);
  // ctx.moveTo(12, -4);
  // ctx.bezierCurveTo(19, 13, 32, 3, 34, -3);
  // ctx.lineTo(12, -4);
  // ctx.fill();
  // ctx.stroke();
  // ctx.translate(-HALF_SIZE, -HALF_SIZE + 8);
  drawGreyFurredMoth(ctx);
  drawSpriteBackground(ctx, "rgb(27, 42, 53)", "rgb(159, 159, 159)");
  // reset(ctx);

  // --- Row 3, Sprite 6: Geometric White Ribbons ---
  // ctx.translate(SIZE * 6, SIZE * 4);
  // ctx.fillStyle = "rgb(27, 42, 53)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.translate(HALF_SIZE, HALF_SIZE - 15);
  // ctx.lineWidth = 6;
  // ctx.fillStyle = ctx.strokeStyle = "rgb(241, 241, 241)";
  // ellipse(ctx, -20, -13, 5, 10);
  // ellipse(ctx, 20, -13, 5, 10);
  // ctx.beginPath();
  // ctx.moveTo(-20, -5);
  // ctx.bezierCurveTo(-25, -7, -29, -7, -34, -3);
  // ctx.moveTo(-20, -5);
  // ctx.bezierCurveTo(-25, 1, -29, -7, -24, -3);
  // ctx.moveTo(20, -5);
  // ctx.bezierCurveTo(25, -7, 29, -7, 34, -3);
  // ctx.moveTo(20, -5);
  // ctx.bezierCurveTo(25, 1, 29, -7, 24, -3);
  // ctx.moveTo(-10, 50);
  // ctx.bezierCurveTo(-10, 16, 10, 15, 10, 50);
  // ctx.bezierCurveTo(2, 49, 3, 46, -10, 50);
  // ctx.stroke();
  // ctx.lineWidth = 3;
  // ctx.beginPath();
  // ctx.moveTo(-2, 24);
  // ctx.bezierCurveTo(-5, 55, 1, 15, 2, 25);
  // ctx.moveTo(5, 29);
  // ctx.bezierCurveTo(1, 58, 2, 15, 7, 30);
  // ctx.stroke();
  // ctx.translate(-HALF_SIZE, -HALF_SIZE + 15);
  drawGeometricWhiteRibbons(ctx);
  drawSpriteBackground(ctx, "rgb(27, 42, 53)", "rgb(241, 241, 241)");
  // reset(ctx);

  // --- Row 3, Sprite 7: Blue Spectacle Orbs ---
  // ctx.translate(SIZE * 7, SIZE * 4);
  // ctx.fillStyle = "rgb(241, 241, 241)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.translate(HALF_SIZE, HALF_SIZE - 5);
  // ctx.lineWidth = 3.5;
  // ctx.fillStyle = "rgb(59, 142, 209)";
  // ctx.strokeStyle = "rgb(241, 241, 241)";
  // ellipse(ctx, -22, -20, 9, 12);
  // ellipse(ctx, 22, -20, 9, 12);
  // ctx.beginPath();
  // ctx.moveTo(-32, -20);
  // ctx.lineTo(0, -18);
  // ctx.lineTo(32, -20);
  // ctx.stroke();
  // ctx.beginPath();
  // ctx.moveTo(0, -2);
  // ctx.lineTo(0, 13);
  // ctx.lineTo(32, 5);
  // ctx.fill();
  // for (let i = 0.18; i < Math.PI; i += Math.PI / 8) {
  //   ellipse(ctx, Math.cos(i) * 40, Math.sin(i) * 30 + 15, 6, 6);
  // }
  // ctx.translate(-HALF_SIZE, -HALF_SIZE + 4);
  drawBlueSpectacleOrbs(ctx);
  drawSpriteBackground(ctx, "rgb(241, 241, 241)", "rgb(59, 142, 209)");
  // reset(ctx);

  // --- Row 3, Sprite 8: Pink Cheeks Alien ---
  // ctx.translate(SIZE * 8, SIZE * 4);
  // ctx.fillStyle = "rgb(27, 42, 53)";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.translate(HALF_SIZE, HALF_SIZE - 5);
  // ctx.lineWidth = 4;
  // ctx.fillStyle = "rgb(245, 139, 222)";
  // ellipse(ctx, -30, 6, 8, 6);
  // ellipse(ctx, 30, 6, 8, 6);
  // ctx.fillStyle = ctx.strokeStyle = "rgb(230,230,230)";
  // ellipse(ctx, -20, -11, 5, 5);
  // ellipse(ctx, 20, -11, 5, 5);
  // ellipse(ctx, 0, 4, 3, 3);
  // drawMouthArc(ctx, 19, 9, 5);
  // ctx.translate(-HALF_SIZE, -HALF_SIZE + 4);
  drawPinkCheeksAlien(ctx);
  drawSpriteBackground(
    ctx,
    "rgb(27, 42, 53)",
    "rgb(136, 220, 232)",
    "rgb(241, 241, 241)",
  );
  // reset(ctx);

  // --- Row 3, Sprite 9: Aqua Shield / Finishing Safe Boundaries ---
  // ctx.translate(SIZE * 9, SIZE * 4);
  // ctx.fillStyle = "#0E141E";
  // ctx.fillRect(0, 0, SIZE, SIZE);
  // ctx.translate(HALF_SIZE, HALF_SIZE + 7);
  // ctx.lineWidth = 6;
  // ctx.fillStyle = "#bde5ea";
  // ctx.beginPath();
  // ctx.moveTo(-53, -50);
  // ctx.bezierCurveTo(-47, -24, -28, 1, -16, -5);
  // ctx.bezierCurveTo(-30, -12, -38, -29, -53, -50);
  // ctx.moveTo(56, -55);
  // ctx.bezierCurveTo(45, -7, 29, -4, 16, -1);
  // ctx.bezierCurveTo(30, -12, 23, -29, 56, -55); // Safely closed cut-off curve
  // ctx.fill();
  // ctx.stroke();
  drawAquaShield(ctx);
  // reset(ctx);
};
