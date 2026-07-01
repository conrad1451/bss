// engine/drawEntities/drawProjectiles.js

// CHQ: Claude AI (Sonnet): single draw pass over gameState.objects.projectiles,
// replacing the earlier separate drawPetalShuriken.js / drawWave.js (each of
// which did its own O(n) type-filter over the same shared array). Buckets
// projectiles by meshKey once per frame. resuliting in O(n) total across all
// projectile types, then binds each mesh's buffers/attributes once and draws
// every instance in that bucket. Projectiles with no meshKey (e.g.
// DarkScoopingTrail, which renders via its own TrailRenderer.Trail pass) are
// skipped here entirely.
//
// To add a new instanced-mesh projectile type: give it a meshKey in its
// constructor (via super(pos, lifespan, source, meshKey)) and add one entry
// below describing which mesh to bind and how to build instanceInfo2 for it.

const PROJECTILE_RENDERERS = {
  petalShuriken: {
    mesh: "petalShuriken",
    // [x, y] passed to gl.uniform2f(mob_instanceInfo2, x, y)
    instanceInfo2: (shuriken) => [1, shuriken.life * 1.75],
  },
  wave: {
    mesh: "wave",
    instanceInfo2: (wave) => [wave.size, 0.6],
  },
};

/**
 * Draws every live projectile that has a registered meshKey, grouped by
 * mesh so each mesh's buffers/attributes are bound once per frame rather
 * than once per instance. Called once per frame from renderer.js.
 *
 * @param {WebGL2RenderingContext} gl
 * @param {Object} glCache - Cached attribute/uniform locations.
 * @param {Object} meshes - Registry of uploaded GPU meshes.
 * @param {Object} state - The live game state object.
 * @returns {void}
 */
export function drawProjectiles(gl, glCache, meshes, state) {
  const projectiles = state.objects.projectiles;
  if (!projectiles || projectiles.length === 0) return;

  const buckets = {};
  for (const projectile of projectiles) {
    const key = projectile.meshKey;
    if (!key || !PROJECTILE_RENDERERS[key]) continue;
    (buckets[key] ||= []).push(projectile);
  }

  for (const key in buckets) {
    const renderConfig = PROJECTILE_RENDERERS[key];
    const mesh = meshes[renderConfig.mesh];
    if (!mesh || !mesh.vertBuffer) continue;

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    gl.vertexAttribPointer(glCache.mob_vertPos, 3, gl.FLOAT, gl.FALSE, 24, 0);
    gl.vertexAttribPointer(
      glCache.mob_vertColor,
      3,
      gl.FLOAT,
      gl.FALSE,
      24,
      12,
    );

    for (const projectile of buckets[key]) {
      const [x, y] = renderConfig.instanceInfo2(projectile);
      gl.uniform4fv(glCache.mob_instanceInfo1, projectile.pos);
      gl.uniform2f(glCache.mob_instanceInfo2, x, y);
      gl.drawElements(gl.TRIANGLES, mesh.indexAmount, gl.UNSIGNED_SHORT, 0);
    }
  }
}
