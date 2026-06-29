// engine/drawEntities/drawPlayer.js

import { drawMesh } from "../engineParts/drawMesh";
import { setUniform } from "../engineParts/setUniform";

// draw without using textures
export function drawPlayer(
  theGl,
  thePrograms,
  meshes,
  state,
  viewMatrix,
  projectionMatrix,
) {
  // Reuse mob program + mesh — player is just a mob with player's pos
  //   const gl = this.gl;
  //   const prog = this.programs.mob;
  const gl = theGl;
  const prog = thePrograms.mob;
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  // if (!this.meshSchema.mobs?.vertexBuffer) return;
  if (!meshes.mobs?.vertexBuffer) return;

  gl.useProgram(prog);
  //   this.setUniform(prog, "projMatrix", projectionMatrix);
  //   this.setUniform(prog, "viewMatrix", viewMatrix);
  setUniform(prog, "projMatrix", projectionMatrix);
  setUniform(prog, "viewMatrix", viewMatrix);

  // draw without using textures
  //   if (this.textures?.bear) {
  //     gl.activeTexture(gl.TEXTURE0);
  //     gl.bindTexture(gl.TEXTURE_2D, this.textures.bear);
  //     // this.setUniform(prog, "tex", 0, "int");
  //     setUniform(prog, "tex", 0, "int");
  //   }

  const modelMatrix = mat4.create();
  mat4.fromTranslation(modelMatrix, state.player.pos);
  mat4.rotateY(modelMatrix, modelMatrix, state.player.yaw || 0);
  //   this.setUniform(prog, "uModelMatrix", modelMatrix);
  setUniform(prog, "uModelMatrix", modelMatrix);

  //   this.drawMesh("mobs");
  drawMesh("mobs");
}
