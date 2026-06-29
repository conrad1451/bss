// engine/drawEntities/drawBees.js

import { drawMesh } from "../engineParts/drawMesh";
import { setUniform } from "../engineParts/setUniform";
import { beeInfo } from "../../data/bees";

/**
 * Iterates over all bee instances in the game state and issues one draw call
 * per bee, uploading an individual model matrix (translation only) for each.
 *
 * @param {Object} state - The live game state object.
 * @param {Object[]} state.objects.bees - Array of bee instances, each with a `pos` [x, y, z] array.
 * @param {Float32Array|number[]} viewMatrix - Column-major 4×4 view matrix.
 * @param {Float32Array|number[]} projectionMatrix - Column-major 4×4 projection matrix.
 * @returns {void}
 */
export function drawBees(
  theGl,
  glCache,
  thePrograms,
  textures,
  meshes,
  state,
  viewMatrix,
  projectionMatrix,
) {
  //   const gl = this.gl;
  //   const beeProgram = this.programs.bee;
  const gl = theGl;
  const beeProgram = thePrograms.bee;

  if (!gl.getProgramParameter(beeProgram, gl.LINK_STATUS)) return;

  // console.log(
  //   "bee link status:",
  //   gl.getProgramParameter(beeProgram, gl.LINK_STATUS),
  // );
  // const mesh = this.meshSchema.bess;
  //   const mesh = this.meshes.bees;
  const mesh = meshes.bees;
  if (!mesh || !mesh.vertexBuffer || !mesh.instanceBuffer) return;

  // 1. Clear last frame's instance data
  mesh.instanceData = [];
  state.objects.tempBees = [];

  // 2. Each bee contributes 11 floats: instance_pos(4) + instance_rotation(4) + instance_uv(3)
  state.objects.bees.forEach((bee) => {
    mesh.instanceData.push(
      bee.pos[0],
      bee.pos[1],
      bee.pos[2],
      bee.meshScale ?? 1,
      bee.moveDir?.[0] ?? 1,
      bee.moveDir?.[1] ?? 0,
      bee.moveDir?.[2] ?? 0,
      0,
      beeInfo[bee.type]?.u ?? 0,
      beeInfo[bee.type]?.v ?? 0,
      0, // meshPartId/layer — 0 to match vertUV.w = 0 on our simple quad, avoids culling
    );
  });

  // CHQ: Claude AI (Sonnet): After the state.objects.bees.forEach loop, before the draw call:
  state.objects.tempBees.forEach((bee) => {
    const [u, v] = bee._uvOverride ?? [
      beeInfo[bee.type]?.u ?? 0,
      beeInfo[bee.type]?.v ?? 0,
    ];
    mesh.instanceData.push(
      bee.pos[0],
      bee.pos[1],
      bee.pos[2],
      bee.meshScale ?? 1,
      bee.moveDir?.[0] ?? 1,
      bee.moveDir?.[1] ?? 0,
      bee.moveDir?.[2] ?? 0,
      0,
      u,
      v,
      0,
    );
  });

  const instanceCount = mesh.instanceData.length / 11;
  if (instanceCount === 0) return;

  // 3. Upload this frame's instance data
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.instanceBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(mesh.instanceData),
    gl.DYNAMIC_DRAW,
  );

  // 4. Program + uniforms
  gl.useProgram(beeProgram);
  //   this.setUniform(beeProgram, "projMatrix", projectionMatrix);
  //   this.setUniform(beeProgram, "viewMatrix", viewMatrix);
  //   this.setUniform(beeProgram, "isNight", 1.0, "float"); // see note below
  //   this.setUniform(beeProgram, "tex", 0, "int");
  setUniform(
    gl,
    glCache,
    thePrograms,
    beeProgram,
    "projMatrix",
    projectionMatrix,
  );
  setUniform(gl, glCache, thePrograms, beeProgram, "viewMatrix", viewMatrix);
  setUniform(gl, glCache, thePrograms, beeProgram, "isNight", 1.0, "float"); // see note below
  setUniform(gl, glCache, thePrograms, beeProgram, "tex", 0, "int");

  //   if (this.textures?.bees) {
  //     gl.activeTexture(gl.TEXTURE0);
  //     gl.bindTexture(gl.TEXTURE_2D, this.textures.bees);
  //   }

  if (textures?.bees) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures.bees);
  }

  // 5. One instanced draw call for all bees
  gl.bindVertexArray(mesh.vao);
  gl.drawElementsInstanced(
    gl.TRIANGLES,
    mesh.vertCount,
    gl.UNSIGNED_INT,
    0,
    instanceCount,
  );
  const err = gl.getError();
  if (err) console.error("drawElementsInstanced error [bees]:", err);
  gl.bindVertexArray(null);
}
