// engine/flowerBuilder.js
import { noise } from "./noise.js"; // If you extract the noise function
import { MATH } from "../utils/math.js";

const TEX_SIZE = 256 / 1024;
const TEX_OFFSET = -1 / 1024;

/**
 * Refactored from index.js (Line 4212)
 * Handles both the state data and the WebGL vertex data for flowers.
 */
export function addFlower(field, x, z, gameState, meshData) {
  const { fieldInfo, flowers } = gameState;
  const { verts, index } = meshData;

  if (!flowers[field][z]) flowers[field][z] = [];

  const fieldData = fieldInfo[field];
  const y = fieldData.y;
  const c = fieldData.getColor();
  const l = fieldData.getLevel();

  // 1. Initialize the State Object
  flowers[field][z][x] = {
    x: x,
    z: z,
    color: c,
    level: l,
    ogLevel: l,
    height: 1,
    id: gameState.globalId++, // Track global ID for vertex indexing
    y: y,
    goo: 0,
    gooColor:
      noise(x * 0.2 + fieldData.x * 10, z * 0.2 + fieldData.z * 10) < 0.49
        ? -1
        : 1,
    pollinationTimer: 1,
    puffshrooms: [],
  };

  const currentFlower = flowers[field][z][x];
  const vl = verts.length / 8; // Offset for the index buffer
  const h = currentFlower.height * 0.5;
  const g = currentFlower.goo * currentFlower.gooColor;
  let tx, ty;

  // 2. UV Mapping Logic based on Color and Level
  const lvl = currentFlower.level;
  if (currentFlower.color === "red") {
    if (lvl === 1) {
      tx = 0;
      ty = 0;
    } else if (lvl === 2) {
      tx = (256 * 3) / 1024;
      ty = 0;
    } else if (lvl === 3) {
      tx = (256 * 2) / 1024;
      ty = 256 / 1024;
    } else if (lvl === 4) {
      tx = 256 / 1024;
      ty = (256 * 2) / 1024;
    } else if (lvl >= 5) {
      tx = 0;
      ty = (256 * 3) / 1024;
    }
  } else if (currentFlower.color === "blue") {
    if (lvl === 1) {
      tx = 256 / 1024;
      ty = 0;
    } else if (lvl === 2) {
      tx = 0;
      ty = 256 / 1024;
    } else if (lvl === 3) {
      tx = (256 * 3) / 1024;
      ty = 256 / 1024;
    } else if (lvl === 4) {
      tx = (256 * 2) / 1024;
      ty = (256 * 2) / 1024;
    } else if (lvl >= 5) {
      tx = 256 / 1024;
      ty = (256 * 3) / 1024;
    }
  } else if (currentFlower.color === "white") {
    if (lvl === 1) {
      tx = (256 * 2) / 1024;
      ty = 0;
    } else if (lvl === 2) {
      tx = 256 / 1024;
      ty = 256 / 1024;
    } else if (lvl === 3) {
      tx = 0;
      ty = (256 * 2) / 1024;
    } else if (lvl === 4) {
      tx = (256 * 3) / 1024;
      ty = (256 * 2) / 1024;
    } else if (lvl >= 5) {
      tx = (256 * 2) / 1024;
      ty = (256 * 3) / 1024;
    }
  }

  // World-space coordinates
  const wx = x + fieldData.x;
  const wz = z + fieldData.z;

  // 3. Push Vertex Data
  verts.push(
    wx - 0.5,
    y + h,
    wz - 0.5,
    TEX_OFFSET + tx,
    TEX_OFFSET + ty,
    1,
    1,
    g,
    wx + 0.5,
    y + h,
    wz - 0.5,
    TEX_SIZE + tx,
    TEX_OFFSET + ty,
    1,
    1,
    g,
    wx + 0.5,
    y + h,
    wz + 0.5,
    TEX_SIZE + tx,
    TEX_SIZE + ty,
    1,
    1,
    g,
    wx - 0.5,
    y + h,
    wz + 0.5,
    TEX_OFFSET + tx,
    TEX_SIZE + ty,
    1,
    1,
    g,

    // Bottom face / Stem anchor
    wx - 0.5,
    y,
    wz - 0.5,
    0,
    0,
    1,
    -10000,
    0,
    wx + 0.5,
    y,
    wz - 0.5,
    0,
    0,
    1,
    -10000,
    0,
    wx + 0.5,
    y,
    wz + 0.5,
    0,
    0,
    1,
    -10000,
    0,
    wx - 0.5,
    y,
    wz + 0.5,
    0,
    0,
    1,
    -10000,
    0,
  );

  // 4. Push Index Data
  index.push(
    vl + 2,
    vl + 1,
    vl,
    vl + 3,
    vl + 2,
    vl,
    vl + 6,
    vl + 5,
    vl + 2,
    vl + 7,
    vl + 6,
    vl + 2,
    vl + 1,
    vl + 5,
    vl + 4,
    vl,
    vl + 1,
    vl + 4,
    vl + 3,
    vl + 7,
    vl + 2,
    vl + 4,
    vl + 3,
    vl,
    vl + 3,
    vl + 4,
    vl + 7,
    vl + 1,
    vl + 2,
    vl + 5,
  );
}
