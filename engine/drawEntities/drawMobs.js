// engine/drawEntities/drawMobs.js

import { drawMesh } from "../engineParts/drawMesh";
import { setUniform } from "../engineParts/setUniform";

/**
 * Iterates over all mob instances in the game state and issues one draw call
 * per mob, uploading a model matrix that encodes translation, non-uniform scale,
 * and Y-axis rotation derived from each mob's properties.
 *
 * @param {Object} state - The live game state object.
 * @param {Object[]} state.objects.mobs - Array of mob instances with the following optional fields:
 * @param {number[]} state.objects.mobs[].pos - World-space position [x, y, z].
 * @param {number} [state.objects.mobs[].width=1] - X scale.
 * @param {number} [state.objects.mobs[].height=1] - Y scale.
 * @param {number} [state.objects.mobs[].depth=1] - Z scale.
 * @param {number} [state.objects.mobs[].facingAngle] - Y-axis rotation in radians.
 * @param {number} [state.objects.mobs[].frameIndex=0] - Texture frame/row offset.
 * @param {Float32Array|number[]} viewMatrix - Column-major 4×4 view matrix.
 * @param {Float32Array|number[]} projectionMatrix - Column-major 4×4 projection matrix.
 * @returns {void}
 */
export function drawMobs(
  theGl,
  glCache,
  thePrograms,
  meshes,
  state,
  viewMatrix,
  projectionMatrix,
) {
  // CHQ: Claude AI (Sonnet) removed unneeded textures
  //   const gl = this.gl;
  //   const mobProgram = this.programs.mob;
  const gl = theGl;
  const mobProgram = thePrograms.mob;

  if (!gl.getProgramParameter(mobProgram, gl.LINK_STATUS)) return;
  //   if (!this.meshes.mobs?.vertexBuffer) return;
  if (!meshes.mobs?.vertexBuffer) return;

  gl.useProgram(mobProgram);

  //   this.setUniform(mobProgram, "projMatrix", projectionMatrix);
  //   this.setUniform(mobProgram, "viewMatrix", viewMatrix);
  //   this.setUniform(mobProgram, "isNight", 1.0, "float");
  setUniform(
    gl,
    glCache,
    thePrograms,
    mobProgram,
    "projMatrix",
    projectionMatrix,
  );
  setUniform(gl, glCache, thePrograms, mobProgram, "viewMatrix", viewMatrix);
  setUniform(gl, glCache, thePrograms, mobProgram, "isNight", 1.0, "float");

  // console.log(
  //   "drawMobs called, mob count:",
  //   state.objects.mobs.length,
  //  "mesh vertCount:",
  //  this.meshes.mobs.vertCount,
  // );

  // CHQ: Gemini AI modified position
  state.objects.mobs.forEach((mob) => {
    const posX = mob.pos[0];
    const posY = mob.pos[1];
    const posZ = mob.pos[2];
    const headingAngle = mob.facingAngle ?? 0.0;

    // 1. Matrix/Translation Uniform
    // this.setUniform(mobProgram, "instance_info1", [
    //   posX,
    //   posY,
    //   posZ,
    //   headingAngle,
    // ]);
    setUniform(gl, glCache, thePrograms, mobProgram, "instance_info1", [
      posX,
      posY,
      posZ,
      headingAngle,
    ]);

    // CRITICAL FIX FOR VERTICAL BLOCK: Pass X, Y, and Z scales individually
    // instance_info2: [ScaleX, ScaleY, ScaleZ, FrameIndex]
    const scaleX = mob.width ?? 1.0;
    const scaleY = mob.height ?? 1.0;
    const scaleZ = mob.depth ?? 1.0;
    // this.setUniform(
    //   mobProgram,
    //   "instance_info2",
    //   [scaleX, scaleY, scaleZ],
    //   "vec3",
    // );
    setUniform(
      gl,
      glCache,
      thePrograms,
      mobProgram,
      "instance_info2",
      [scaleX, scaleY, scaleZ],
      "vec3",
    );

    // 3. Fallback Uniform Dynamic Tinting
    let mobColor = [1.0, 1.0, 1.0];
    let useCustom = 0.0; // Default to original vertex behavior if preferred

    if (mob.type === "ladybug") {
      mobColor = [0.85, 0.1, 0.15]; // Red
      useCustom = 1.0;
    } else if (mob.type === "beetle" || mob.type === "blue_beetle") {
      mobColor = [0.1, 0.3, 0.75]; // Blue
      useCustom = 1.0;
    }

    // this.setUniform(mobProgram, "debugColor", mobColor, "vec3");
    // this.setUniform(mobProgram, "useCustomColor", useCustom, "float");
    setUniform(
      gl,
      glCache,
      thePrograms,
      mobProgram,
      "debugColor",
      mobColor,
      "vec3",
    );
    setUniform(
      gl,
      glCache,
      thePrograms,
      mobProgram,
      "useCustomColor",
      useCustom,
      "float",
    );

    //   this.drawMesh("mobs");
    drawMesh(gl, meshes, "cog");
  });
}
