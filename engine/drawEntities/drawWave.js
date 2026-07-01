// engine/drawEntities/drawWave.js
import { Wave } from "../../entities/projectiles/Wave.js";

// CHQ: Claude AI (Sonnet): extracted from Wave.update(). Fixes the
// gl.FLASE typo (should be gl.FALSE) from the original inline draw call.

/**
 * Draws every live wave projectile. Called once per frame from renderer.js,
 * alongside drawPetalShuriken.
 *
 * @param {WebGL2RenderingContext} gl
 * @param {Object} glCache - Cached attribute/uniform locations.
 * @param {Object} meshes - Registry of uploaded GPU meshes, incl. `wave`.
 * @param {Object} state - The live game state object.
 * @returns {void}
 */
export function drawWave(gl, glCache, meshes, state) {
  const waves = state.objects.projectiles?.filter((p) => p instanceof Wave);
  if (!waves || waves.length === 0) return;

  const mesh = meshes.wave;
  if (!mesh || !mesh.vertBuffer) return;

  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
  gl.vertexAttribPointer(glCache.mob_vertPos, 3, gl.FLOAT, gl.FALSE, 24, 0);
  gl.vertexAttribPointer(glCache.mob_vertColor, 3, gl.FLOAT, gl.FALSE, 24, 12);

  for (const wave of waves) {
    gl.uniform4fv(glCache.mob_instanceInfo1, wave.pos);
    gl.uniform2f(glCache.mob_instanceInfo2, wave.size, 0.6);
    gl.drawElements(gl.TRIANGLES, mesh.indexAmount, gl.UNSIGNED_SHORT, 0);
  }
}
