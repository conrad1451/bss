// engine/drawEntities/drawFlowers.js

import { drawMesh } from "../engineParts/drawMesh";
import { setUniform } from "../engineParts/setUniform";

/**
 * Issues a single draw call for the entire pre-baked static flower mesh.
 * Binds the flower shader program, uploads view/projection uniforms, binds the
 * flower texture atlas, and draws via the mesh's VAO.
 *
 * @param {Object} state - The live game state object (used for future per-frame uniforms).
 * @param {Float32Array|number[]} viewMatrix - Column-major 4×4 view matrix.
 * @param {Float32Array|number[]} projectionMatrix - Column-major 4×4 projection matrix.
 * @returns {void}
 */
export function drawFlowers(
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
  //   const flowerProgram = this.programs.flower; // Target your flower vertex/fragment shaders
  const gl = theGl;
  const flowerProgram = thePrograms.flower; // Target your flower vertex/fragment shaders

  if (!gl.getProgramParameter(flowerProgram, gl.LINK_STATUS)) return;

  gl.useProgram(flowerProgram);

  // Temporary: verify flowerProgram is set
  // console.log("useProgram called, flowerProgram:", flowerProgram);

  //   this.setUniform(flowerProgram, "projMatrix", projectionMatrix);
  //   this.setUniform(flowerProgram, "viewMatrix", viewMatrix);
  //   this.setUniform(flowerProgram, "isNight", 1.0, "float"); // CHQ: Claude AI added this, without which resulted in black/invisible output
  setUniform(
    gl,
    glCache,
    thePrograms,
    flowerProgram,
    "projMatrix",
    projectionMatrix,
  );
  setUniform(gl, glCache, thePrograms, flowerProgram, "viewMatrix", viewMatrix);
  setUniform(gl, glCache, thePrograms, flowerProgram, "isNight", 1.0, "float"); // CHQ: Claude AI added this, without which resulted in black/invisible output

  const texLoc = gl.getUniformLocation(flowerProgram, "tex");

  // CHQ: Claude AI: remove logs
  // console.log("flower tex location:", texLoc);
  // console.log("flowers texture object:", this.textures?.flowers);
  // console.log("flower tex location:", gl.getUniformLocation(flowerProgram, "tex"));

  // 2. CRITICAL: Bind the flower texture
  // Ensure you have loaded the texture into this.textures.flowers
  //   if (this.textures?.flowers) {
  if (textures?.flowers) {
    gl.activeTexture(gl.TEXTURE0);
    // gl.bindTexture(gl.TEXTURE_2D, this.textures.flowers);
    gl.bindTexture(gl.TEXTURE_2D, textures.flowers);

    // this.setUniform(flowerProgram, "tex", 0, "int"); // CHQ: Claude AI: replace "uSampler" with "tex"
    setUniform(gl, glCache, thePrograms, flowerProgram, "tex", 0, "int"); // CHQ: Claude AI: replace "uSampler" with "tex"

    if (texLoc !== null) gl.uniform1i(texLoc, 0);
  }

  if (gl.frameCount < 150000) {
    // console.log("Texture bound:", !!this.textures.flowers);
    console.log("Texture bound:", !!textures.flowers);
  }

  // CHQ: Claude AI: remove the bindBuffer and bindMeshAttributes calls — the VAO handles all of that:
  // CHQ: while Bees and mobs are individual entities in state.objects
  //      (and therefore need to loop per instance so their own model
  //      matrix is uploaded before drawing), flowers are a single
  //      pre-baked static mesh, so only need to be drawn once
  // gl.bindBuffer(gl.ARRAY_BUFFER, this.meshes.flowers.vertexBuffer);
  // this.bindMeshAttributes("flowers", flowerProgram);

  // const vertPosLoc = gl.getAttribLocation(flowerProgram, "vertPos");
  // const vertUVLoc = gl.getAttribLocation(flowerProgram, "vertUV");
  // const vertGooLoc = gl.getAttribLocation(flowerProgram, "vertGoo");
  // console.log(
  //   "attrib locations — vertPos:",
  //   vertPosLoc,
  //   "vertUV:",
  //   vertUVLoc,
  //   "vertGoo:",
  //   vertGooLoc,
  // );

  // gl.disable(gl.DEPTH_TEST); // CHQ: Claude AI: individual draw methods shouldn't be toggling global GL state.
  // gl.disable(gl.CULL_FACE);
  // console.log("cull face disabled");

  // const testPos = [24.5, 13, -40, 1.0]; // first flower vertex from your logs
  // const mvp = mat4.create();
  // mat4.multiply(mvp, projectionMatrix, viewMatrix);

  // const clipX =
  //   mvp[0] * testPos[0] +
  //   mvp[4] * testPos[1] +
  //   mvp[8] * testPos[2] +
  //   mvp[12] * testPos[3];
  // const clipY =
  //   mvp[1] * testPos[0] +
  //   mvp[5] * testPos[1] +
  //   mvp[9] * testPos[2] +
  //   mvp[13] * testPos[3];
  // const clipZ =
  //   mvp[2] * testPos[0] +
  //   mvp[6] * testPos[1] +
  //   mvp[10] * testPos[2] +
  //   mvp[14] * testPos[3];
  // const clipW =
  //   mvp[3] * testPos[0] +
  //   mvp[7] * testPos[1] +
  //   mvp[11] * testPos[2] +
  //   mvp[15] * testPos[3];

  // console.log("clip coords:", clipX, clipY, clipZ, clipW);
  // console.log("NDC:", clipX / clipW, clipY / clipW, clipZ / clipW);

  //   this.drawMesh("flowers");
  drawMesh(gl, meshes, "flowers");

  // gl.enable(gl.CULL_FACE); // re-enable after if needed

  // console.log("flower texture:", this.textures?.flowers);
  // console.log("flower vertCount:", this.meshes.flowers.vertCount);
}
