// engine/drawEntities/drawTurrets.js

import { drawMesh } from "../engineParts/drawMesh";
import { setUniform } from "../engineParts/setUniform";

/**
 * Draws all active CogTurret instances and their fired cog projectiles.
 * Expects this.meshes.cogTurret and this.meshes.cog to be uploaded separately
 * (same pattern as uploadMobMesh).
 */
export function drawTurrets(
  theGl,
  glCache,
  thePrograms,
  textures,
  meshes,
  state,
  viewMatrix,
  projectionMatrix,
) {
  const gl = theGl;
  const mobProgram = thePrograms.mob; // Target your flower vertex/fragment shaders

  //   const gl = this.gl;
  //   const mobProgram = this.programs.mob;
  if (!gl.getProgramParameter(mobProgram, gl.LINK_STATUS)) return;

  const turrets = (state.objects.mobs || []).filter(
    (m) => m.type === "cogTurret",
  );
  if (turrets.length === 0) return;

  gl.useProgram(mobProgram);
  //   this.setUniform(mobProgram, "projMatrix", projectionMatrix);
  //   this.setUniform(mobProgram, "viewMatrix", viewMatrix);
  setUniform(
    gl,
    glCache,
    thePrograms,
    mobProgram,
    "projMatrix",
    projectionMatrix,
  );
  setUniform(gl, glCache, thePrograms, mobProgram, "viewMatrix", viewMatrix);

  turrets.forEach((turret) => {
    // Turret body
    const modelMatrix = mat4.create();
    mat4.fromTranslation(modelMatrix, turret.pos);
    mat4.rotateY(modelMatrix, modelMatrix, turret.facing || 0);
    //  this.setUniform(mobProgram, "uModelMatrix", modelMatrix);
    setUniform(
      gl,
      glCache,
      thePrograms,
      mobProgram,
      "uModelMatrix",
      modelMatrix,
    );
    // this.drawMesh("cogTurret");
    drawMesh(gl, meshes, "cogTurret");

    // Fired cogs
    turret.cogs.forEach((s) => {
      const cogMatrix = mat4.create();
      mat4.fromTranslation(cogMatrix, [s.pos[0], s.pos[1], s.pos[2]]);
      mat4.rotateY(cogMatrix, cogMatrix, s.pos[3] || 0);
      //   this.setUniform(mobProgram, "uModelMatrix", cogMatrix);
      //   this.drawMesh("cog");
      setUniform(
        gl,
        glCache,
        thePrograms,
        mobProgram,
        "uModelMatrix",
        cogMatrix,
      );
      drawMesh(gl, meshes, "cog");
    });
  });
}
