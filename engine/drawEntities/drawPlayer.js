import { mat4 } from "gl-matrix";
import { drawMesh } from "../engineParts/drawMesh";
import { setUniform } from "../engineParts/setUniform";

export function drawPlayer(
  theGl,
  glCache,
  thePrograms,
  meshes,
  state,
  viewMatrix,
  projectionMatrix,
) {
  const gl = theGl;
  const prog = thePrograms.player;

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  if (!meshes.player?.vertexBuffer) return;

  gl.useProgram(prog);

  setUniform(gl, glCache, thePrograms, prog, "projMatrix", projectionMatrix);
  setUniform(gl, glCache, thePrograms, prog, "viewMatrix", viewMatrix);
  setUniform(gl, glCache, thePrograms, prog, "isNight", state.isNight ?? 1.0);

  const modelMatrix = mat4.create();
  mat4.fromTranslation(modelMatrix, state.player.pos);
  mat4.rotateY(modelMatrix, modelMatrix, state.player.yaw || 0);
  setUniform(gl, glCache, thePrograms, prog, "uModelMatrix", modelMatrix);

  drawMesh(gl, meshes, "player");
}
