// engine/drawEntities/drawPetalShuriken.js

// CHQ: Claude AI (Sonnet): extracted from PetalShuriken.update(). Fixes the
// gl.FLASE typo (should be gl.FALSE) from the original inline draw call.

/**
 * Draws every live petal shuriken projectile. Called once per frame from
 * renderer.js, after the mob/bee passes.
 *
 * @param {WebGL2RenderingContext} gl
 * @param {Object} glCache - Cached attribute/uniform locations.
 * @param {Object} meshes - Registry of uploaded GPU meshes, incl. `petalShuriken`.
 * @param {Object} state - The live game state object.
 * @returns {void}
 */
export function drawPetalShuriken(gl, glCache, meshes, state) {
  const shurikens = state.objects.projectiles;
  if (!shurikens || shurikens.length === 0) return;

  const mesh = meshes.petalShuriken;
  if (!mesh || !mesh.vertBuffer) return;

  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
  gl.vertexAttribPointer(glCache.mob_vertPos, 3, gl.FLOAT, gl.FALSE, 24, 0);
  gl.vertexAttribPointer(glCache.mob_vertColor, 3, gl.FLOAT, gl.FALSE, 24, 12);

  for (const shuriken of shurikens) {
    gl.uniform4fv(glCache.mob_instanceInfo1, shuriken.pos);
    gl.uniform2f(glCache.mob_instanceInfo2, 1, shuriken.life * 1.75);
    gl.drawElements(gl.TRIANGLES, mesh.indexAmount, gl.UNSIGNED_SHORT, 0);
  }
}
