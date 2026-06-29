// engine/engineParts/drawMesh.js

// CHQ: Claude AI created helper method

/**
 * Issues the appropriate WebGL draw call for the mesh registered under the
 * given key. If the mesh has a VAO, it is bound for the draw and then
 * unbound; otherwise the vertex and optional index buffers are bound manually.
 *
 * - Meshes with an index buffer use `drawElements(TRIANGLES, …, UNSIGNED_INT, 0)`.
 * - Meshes without an index buffer use `drawArrays(TRIANGLES, 0, vertCount)`.
 *
 * @param {string} meshKey - Key into `this.meshSchema`, e.g. `"flowers"`, `"bees"`, `"mobs"`.
 * @returns {void}
 */
// export function drawMesh(meshKey) {
//   const gl = this.gl;
//   const mesh = this.meshes[meshKey];

export function drawMesh(theGl, theMeshes, meshKey) {
  const gl = theGl;
  const mesh = theMeshes[meshKey];

  if (!mesh || !mesh.vertexBuffer) return;

  if (mesh.vao) {
    // console.log("VAO valid:", gl.isVertexArray(mesh.vao));
    // VAO path — all buffer/attribute state already recorded
    gl.bindVertexArray(mesh.vao);
    // console.log(
    //   "vertCount:",
    //   mesh.vertCount,
    //   "indexBuffer:",
    //   !!mesh.indexBuffer,
    // );
    // console.log("about to drawElements, vertCount:", mesh.vertCount);
    // console.log("bee draw — vertCount:", mesh.vertCount, "modelMatrix:");
    gl.drawElements(gl.TRIANGLES, mesh.vertCount, gl.UNSIGNED_INT, 0);
    const err = gl.getError();
    if (err) console.error(`drawElements error [${meshKey}]:`, err);
    gl.bindVertexArray(null);
  } else {
    // Non-VAO path — manual buffer binding
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
    if (mesh.indexBuffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
      gl.drawElements(gl.TRIANGLES, mesh.vertCount, gl.UNSIGNED_INT, 0);
    } else {
      gl.drawArrays(gl.TRIANGLES, 0, mesh.vertCount);
    }
  }
}
