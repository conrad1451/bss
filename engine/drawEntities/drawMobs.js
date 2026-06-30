// engine/drawEntities/drawMobs.js

import { drawMesh } from "../engineParts/drawMesh";
import { setUniform } from "../engineParts/setUniform";

/**
 * Iterates over all mob instances in the game state and issues one draw call
 * per mob, uploading a model matrix that encodes translation, uniform scale,
 * and Y-axis rotation derived from each mob's properties.
 *
 * CHQ: Claude AI (Sonnet): switched this from a one-off facingAngle, width,
 * height, depth contract to the pos[3]-as-rotation + meshScale convention
 * already used everywhere else in the codebase (Mob, BugMob, Ant). Also
 * fixed drawMesh's hardcoded "cog" key, which doesn't exist in
 * renderer.meshes (only "flowers", "bees", "mobs" and "uiQuad" are initialized) -
 * every mob now correctly draws from the "mobs" mesh.
 *
 * @param {Object} state - The live game state object.
 * @param {Object[]} state.objects.mobs - Array of mob instances with the following optional fields:
 * @param {number[]} state.objects.mobs[].pos - World-space position [x, y, z, rotationY].
 *   pos[3], if present, is the Y-axis facing angle in radians (set by Mob/BugMob/Ant's
 *   movement logic via Math.atan2(...) + MATH.HALF_PI).
 * @param {number} [state.objects.mobs[].meshScale=1] - Uniform scale applied on all axes.
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
  const gl = theGl;
  const mobProgram = thePrograms.mob;

  if (!gl.getProgramParameter(mobProgram, gl.LINK_STATUS)) return;
  if (!meshes.mobs?.vertexBuffer) return;

  gl.useProgram(mobProgram);

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

  state.objects.mobs.forEach((mob) => {
    // CHQ: Claude AI (Sonnet): restore the spawning-rise animation.
    // Ant interpolates spawnPos toward pos while state === "spawning"
    // (see Ant.update); draw from spawnPos during that window so the
    // mob visually rises into place instead of popping in at full pos.
    const drawPos =
      mob.state === "spawning" && mob.spawnPos ? mob.spawnPos : mob.pos;

    const posX = drawPos[0];
    const posY = drawPos[1];
    const posZ = drawPos[2];
    // CHQ: Claude AI (Sonnet): read rotation from pos[3], matching Mob,
    // BugMob, Ant's convention, instead of the unused mob.facingAngle
    // field this used to read. Rotation always comes from pos[3]
    // (not drawPos[3] - spawnPos has no rotation component), defaulting
    // to whatever heading was last set.
    const headingAngle = mob.pos[3] ?? 0.0;

    setUniform(gl, glCache, thePrograms, mobProgram, "instance_info1", [
      posX,
      posY,
      posZ,
      headingAngle,
    ]);

    // CHQ: Claude AI (Sonnet): meshScale is a single uniform scalar (see Mob,
    // BugMob and Ant), unlike the old width, height and depth fields that
    // nothing in the codebase actually sets.
    const scale = mob.meshScale ?? 1.0;
    setUniform(
      gl,
      glCache,
      thePrograms,
      mobProgram,
      "instance_info2",
      [scale, scale, scale],
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
    } else if (mob.type === "fireAnt") {
      mobColor = [0.9, 0.35, 0.05]; // Orange
      useCustom = 1.0;
    } else if (mob.type === "fireTrail") {
      mobColor = [0.95, 0.25, 0.0]; // Bright orange-red
      useCustom = 1.0;
    }

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

    // CHQ: Claude AI (Sonnet) fixed (was mistakenly hardcoded to "cog")
    drawMesh(gl, meshes, "mobs");
  });
}
