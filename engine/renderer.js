// engine/renderer.js

import { MATH } from "../utils/math";

// 1. Ensure glMatrix is available (it's globally attached to window)
// const { mat4 } = window.glMatrix;
// const mat4 = window.glMatrix.mat4;

import { mat4, vec3 } from "gl-matrix";

console.log("Is mat4 available?", !!mat4); // Should be true

// console.log("Is glMatrix available?", !!window.glMatrix);
// console.log("Is mat4 available?", !!window.glMatrix?.mat4);
export class Renderer {
  constructor(gl, width, height, shadersDictionary) {
    this.gl = gl;
    this.width = width;
    this.height = height;

    this.projectionMatrix = new Float32Array(16); // CHQ: stored this.projectionMatrix as a property of Renderer class.
    this.viewMatrix = new Float32Array(16);

    // Explicitly initialize the cache directly on the class instance
    this.glCache = {};

    // Core GPU buffer registries managed by the graphics subsystem
    this.meshes = {
      flowers: {
        vertexBuffer: null,
        indexBuffer: null,
        vertCount: 0,
      },
      // --- 🛠️ NEW: Static Quad buffer node for screen-space UI elements ---
      uiQuad: {
        vertexBuffer: null,
        vertCount: 4,
      },
    };

    // CHQ: Gemini AI added
    this.meshSchema = {
      flowers: { attributes: ["vertPos", "vertUV", "vertGoo"], stride: 8 },
      bees: {
        attributes: [
          "vertPos",
          "vertUV",
          "instance_pos",
          "instance_rotation",
          "instance_uv",
        ],
        stride: 5,
      }, // CHQ: I fixed
      mobs: { attributes: ["vertPos", "vertColor"], stride: 5 },
    };

    // Internal WebGL program storage lane
    this.programs = {
      static: null,
      dynamic: null,
      bee: null,
      flower: null,
      token: null,
      particle: null,
      text: null,
      mob: null,
      explosion: null,
      trail: null,
    };

    // Compile everything right on instantiation
    this.compileAllShaders(shadersDictionary);

    // Run your cache initialization
    this.initCache(this.programs);

    // --- 🛠️ NEW: Prime screen-space static mesh layout geometry ---
    this.initUIQuadBuffer();
  }

  // --- 🛠️ NEW: Initialize dynamic quad vertices for UI texture rendering ---
  initUIQuadBuffer() {
    const gl = this.gl;

    // Normalized device coordinates mapping standard texture bounds
    const vertices = new Float32Array([
      // X,    Y,    U,   V
      -1.0, 1.0, 0.0, 0.0, -1.0, -1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, -1.0,
      1.0, 1.0,
    ]);

    this.meshes.uiQuad.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.meshes.uiQuad.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  }

  // CHQ: Gemini AI added
  /**
   * Automatically binds attributes based on the defined mesh schema
   */
  bindMeshAttributes(meshKey, program) {
    const gl = this.gl;
    const schema = this.meshSchema[meshKey];
    if (!schema) return;

    const stride = schema.stride * 4; // Convert float count to bytes
    let offset = 0;

    schema.attributes.forEach((attrName) => {
      const location = gl.getAttribLocation(program, attrName);

      if (location !== -1) {
        gl.enableVertexAttribArray(location);

        // Logic to determine size based on attribute name
        // vertPos is usually 3, vertUV is 2, vertColor is 3
        const size =
          attrName.includes("Pos") || attrName.includes("Color")
            ? 3
            : attrName.includes("UV")
              ? 4
              : 1; // CHQ: Claude AI added case for vertGoo

        gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset);
        console.log(
          `attr: ${attrName}, location: ${location}, size: ${size}, offset: ${offset}, stride: ${stride}`,
        );
        // Advance the offset for the next attribute
        offset += size * 4;
      }
    });
  }

  /**
   * Uploads raw CPU flower vertex/index arrays directly to GPU memory channels.
   * @param {Object} stagingData - { verts: number[], index: number[] }
   */
  uploadFlowerMesh(stagingData) {
    const gl = this.gl;

    if (!stagingData || !stagingData.verts || stagingData.verts.length === 0) {
      console.warn("⚠️ Attempted to upload empty flower staging data.");
      return;
    }

    this.meshes.flowers.vertCount = stagingData.index.length;

    // CHQ: Claude AI: Create and bind a VAO
    this.meshes.flowers.vao = gl.createVertexArray();
    gl.bindVertexArray(this.meshes.flowers.vao);

    console.log("flower VAO created:", this.meshes.flowers.vao);

    // Vertex buffer
    this.meshes.flowers.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.meshes.flowers.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(stagingData.verts),
      gl.STATIC_DRAW,
    );

    // Set up attributes WHILE VAO is bound so they get recorded into it
    // vertPos: 3 floats, offset 0
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);
    // vertUV: 4 floats, offset 12
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 12);
    // vertGoo: 1 float, offset 28
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 32, 28);

    // Index buffer — also recorded into VAO
    this.meshes.flowers.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.meshes.flowers.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint32Array(stagingData.index),
      gl.STATIC_DRAW,
    );

    // Unbind when done
    gl.bindVertexArray(null);

    console.log(
      `⚡ GPU Upload Complete: ${stagingData.index.length / 3} flower triangles.`,
    );

    // if (!stagingData || !stagingData.verts || stagingData.verts.length === 0) {
    //   console.warn(
    //     "⚠️ Graphics Warning: Attempted to upload empty or invalid flower staging data.",
    //   );
    //   return;
    // }

    // // 1. Store total indices to draw during drawElements execution calls
    // this.meshes.flowers.vertCount = stagingData.index.length;

    // // 2. Allocate and Bind Vertex Array Buffer (Coordinates, UVs, Normals)
    // this.meshes.flowers.vertexBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, this.meshes.flowers.vertexBuffer);
    // gl.bufferData(
    //   gl.ARRAY_BUFFER,
    //   new Float32Array(stagingData.verts),
    //   gl.STATIC_DRAW,
    // );

    // // 3. Allocate and Bind Element Array Buffer (Triangle index drawing sequences)
    // this.meshes.flowers.indexBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.meshes.flowers.indexBuffer);
    // gl.bufferData(
    //   gl.ELEMENT_ARRAY_BUFFER,
    //   new Uint32Array(stagingData.index), // CHQ: Claude AI: changed Uint16Array to Uint32Array
    //   gl.STATIC_DRAW,
    // );

    // console.log(
    //   `⚡ GPU Upload Complete: ${stagingData.index.length / 3} procedural flower triangles bound to pipelines.`,
    // );

    // // Unbind when done
    // gl.bindVertexArray(null);
  }

  // Defensive compilation utility encapsulated in the class
  safeCreateProgram(programName, vshString, fshString) {
    if (!vshString || !fshString) {
      console.error(
        `❌ SHADER INIT ERROR: Shaders for '${programName}' evaluated to undefined!`,
      );
      // Fallback to static if everything is blowing up, avoiding a fatal breakdown
      return this.programs.static || null;
    }
    return this.createProgram(vshString, fshString);
  }

  compileAllShaders(SHADERS) {
    const gl = this.gl;

    // 1. Compile every individual lane carefully (No duplicate mob keys!)
    this.programs.static = this.safeCreateProgram(
      "static",
      SHADERS.staticVSH,
      SHADERS.staticFSH,
    );
    this.programs.dynamic = this.safeCreateProgram(
      "dynamic",
      SHADERS.dynamicVSH,
      SHADERS.dynamicFSH,
    );
    this.programs.bee = this.safeCreateProgram(
      "bee",
      SHADERS.beeVSH,
      SHADERS.beeFSH,
    );
    this.programs.flower = this.safeCreateProgram(
      "flower",
      SHADERS.flowerVSH,
      SHADERS.flowerFSH,
    );
    this.programs.token = this.safeCreateProgram(
      "token",
      SHADERS.tokenVSH,
      SHADERS.tokenFSH,
    );
    this.programs.particle = this.safeCreateProgram(
      "particle",
      SHADERS.particleRendererVSH,
      SHADERS.particleRendererFSH,
    );
    this.programs.text = this.safeCreateProgram(
      "text",
      SHADERS.textRendererVSH,
      SHADERS.textRendererFSH,
    );
    this.programs.mob = this.safeCreateProgram(
      "mob",
      SHADERS.mobRendererVSH,
      SHADERS.mobRendererFSH,
    );
    this.programs.explosion = this.safeCreateProgram(
      "explosion",
      SHADERS.explosionRendererVSH,
      SHADERS.explosionRendererFSH,
    );
    this.programs.trail = this.safeCreateProgram(
      "trail",
      SHADERS.trailRendererVSH,
      SHADERS.trailRendererFSH,
    );

    // 2. Automated Status Audit Loop
    console.log("--- WebGL Program Linking Status Audit ---");
    Object.keys(this.programs).forEach((key) => {
      const prog = this.programs[key];
      if (!prog) {
        console.warn(
          `⚠️ program '${key}' is missing! Patching with static fallback.`,
        );
        this.programs[key] = this.programs.static;
      } else {
        const isProgram = gl.isProgram(prog);
        const linkStatus = gl.getProgramParameter(prog, gl.LINK_STATUS);
        console.log(
          `Program [${key}] -> Valid WebGL Object: ${isProgram}, Link Successful: ${linkStatus}`,
        );

        if (!linkStatus) {
          console.error(
            `❌ LINK FAILURE DETECTED ON PROGRAM: '${key}'!`,
            gl.getProgramInfoLog(prog),
          );
        }
      }
    });
    console.log("------------------------------------------");
  }

  prepareShaderSource(source) {
    const width = this.width;
    const height = this.height;

    // Original math from line 2410
    const invHalfWidth = 1 / (width * 0.5);
    const invHalfHeight = 1 / (height * 0.5);
    const aspect = width / height;
    const invAspect = 1 / aspect;
    const screenChange = (width + height) * 0.5;
    const invAvgHalfWidthHeight = 2 / screenChange;

    return source
      .replaceAll("INV_HALF_WIDTH", invHalfWidth)
      .replaceAll("INV_HALF_HEIGHT", invHalfHeight)
      .replaceAll("HALF_WIDTH", width * 0.5)
      .replaceAll("HALF_HEIGHT", height * 0.5)
      .replaceAll("INV_ASPECT", invAspect)
      .replaceAll("ASPECT", aspect)
      .replaceAll("SCREEN_CHANGE", screenChange)
      .replaceAll("INV_AVG_HALF_WIDTH_HEIGHT", invAvgHalfWidthHeight)
      .replaceAll("LIGHT_DIR", "vec3(0.5, 0.8, 0.2)"); // Hardcoded in your original engine
  }

  // Your existing internal methods...
  createProgram(vshSource, fshSource) {
    const gl = this.gl;

    // Prepare the sources first!
    const finalVsh = this.prepareShaderSource(vshSource);
    const finalFsh = this.prepareShaderSource(fshSource);

    const vsh = gl.createShader(gl.VERTEX_SHADER);
    const fsh = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vsh, finalVsh);
    gl.shaderSource(fsh, finalFsh);
    gl.compileShader(vsh);
    if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
      console.error("VSH Error: ", gl.getShaderInfoLog(vsh));
    }

    gl.compileShader(fsh);
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
      console.error("FSH Error: ", gl.getShaderInfoLog(fsh));
    }

    const program = gl.createProgram();
    gl.attachShader(program, vsh);
    gl.attachShader(program, fsh);
    gl.linkProgram(program);

    return program;
  }

  getCurrentProgramKey() {
    // CHQ: GEmini AI: In a high-performance engine, avoid
    //      calling gl.getParameter inside the render loop.
    //      It is a "synchronous" call that forces the CPU
    //      to wait for the GPU to finish its current task,
    //      which will destroy your frame rate.

    const currentProg = this.gl.getParameter(this.gl.CURRENT_PROGRAM);
    for (const key in this.programs) {
      if (this.programs[key] === currentProg) {
        return key;
      }
    }
    return null;
  }

  // drawFlowersNew(state, viewMatrix, projectionMatrix) {
  //   const gl = this.gl;
  //   const program = this.programs.flower;
  //   const cache = this.glCache.flower;

  //   // 1. Activate the Program
  //   gl.useProgram(program);

  //   // 2. Pass Matrices (Use the cache!)
  //   if (cache.projMatrix)
  //     gl.uniformMatrix4fv(cache.projMatrix, false, projectionMatrix);
  //   if (cache.viewMatrix)
  //     gl.uniformMatrix4fv(cache.viewMatrix, false, viewMatrix);

  //   // 3. Bind Texture (Assuming you have a texture atlas for flowers)
  //   if (this.textures && this.textures.flowers) {
  //     gl.activeTexture(gl.TEXTURE0);
  //     gl.bindTexture(gl.TEXTURE_2D, this.textures.flowers);
  //     const uSampler = gl.getUniformLocation(program, "uSampler");
  //     if (uSampler) gl.uniform1i(uSampler, 0);
  //   }

  //   // 4. Bind Geometry
  //   if (this.meshes.flowers && this.meshes.flowers.vertexBuffer) {
  //     gl.bindBuffer(gl.ARRAY_BUFFER, this.meshes.flowers.vertexBuffer);

  //     // Ensure stride matches your vertex buffer structure (e.g., 8 floats * 4 bytes = 32)
  //     const stride = 8 * 4;

  //     // Enable attributes (assuming you have location indices stored in cache)
  //     if (cache.vertPos !== undefined) {
  //       gl.enableVertexAttribArray(cache.vertPos);
  //       gl.vertexAttribPointer(cache.vertPos, 3, gl.FLOAT, false, stride, 0);
  //     }
  //     if (cache.vertUV !== undefined) {
  //       gl.enableVertexAttribArray(cache.vertUV);
  //       gl.vertexAttribPointer(cache.vertUV, 4, gl.FLOAT, false, stride, 3 * 4);
  //     }

  //     // 5. Draw
  //     if (this.meshes.flowers.indexBuffer) {
  //       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.meshes.flowers.indexBuffer);
  //       gl.drawElements(
  //         gl.TRIANGLES,
  //         this.meshes.flowers.vertCount,
  //         gl.UNSIGNED_SHORT,
  //         0,
  //       );
  //     } else {
  //       gl.drawArrays(gl.TRIANGLES, 0, this.meshes.flowers.vertCount);
  //     }
  //   }
  // }

  drawFlowers(state, viewMatrix, projectionMatrix) {
    const gl = this.gl;
    const program = this.programs.flower; // Target your flower vertex/fragment shaders
    gl.useProgram(program);

    // Temporary: verify program is set
    console.log("useProgram called, program:", program);

    this.setUniform(program, "projMatrix", projectionMatrix);
    this.setUniform(program, "viewMatrix", viewMatrix);
    // this.setUniform(program, "uSampler", 0);
    // this.setUniform(program, "isNight", 1.0); // CHQ: Claude AI added this, without which resulted in black/invisible output
    this.setUniform(program, "isNight", 1.0, "float");
    this.setUniform(program, "uSampler", 0, "int");

    if (this.textures?.flowers) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.textures.flowers);
    }

    // CHQ: Claude AI: remove the bindBuffer and bindMeshAttributes calls — the VAO handles all of that:
    // CHQ: while Bees and mobs are individual entities in state.objects
    //      (and therefore need to loop per instance so their own model
    //      matrix is uploaded before drawing), flowers are a single
    //      pre-baked static mesh, so only need to be drawn once
    // gl.bindBuffer(gl.ARRAY_BUFFER, this.meshes.flowers.vertexBuffer);
    // this.bindMeshAttributes("flowers", program);

    // const vertPosLoc = gl.getAttribLocation(program, "vertPos");
    // const vertUVLoc = gl.getAttribLocation(program, "vertUV");
    // const vertGooLoc = gl.getAttribLocation(program, "vertGoo");
    // console.log(
    //   "attrib locations — vertPos:",
    //   vertPosLoc,
    //   "vertUV:",
    //   vertUVLoc,
    //   "vertGoo:",
    //   vertGooLoc,
    // );

    gl.disable(gl.CULL_FACE);
    this.drawMesh("flowers");
    gl.enable(gl.CULL_FACE); // re-enable after if needed

    // console.log("after drawMesh:", gl.getError());

    // const gl = this.gl;
    // const mesh = this.meshes.flowers;

    // // Test 1: does bindBuffer work?
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    // console.log("after bindBuffer index:", gl.getError());

    // // Test 2: does drawElements work?
    // gl.drawElements(gl.TRIANGLES, mesh.vertCount, gl.UNSIGNED_SHORT, 0);
    // console.log("after drawElements:", gl.getError());
  }

  // CHQ: Claude AI rewrote to use setUniform and drawMesh
  drawBees(state, viewMatrix, projectionMatrix) {
    const gl = this.gl;
    const program = this.programs.bee;
    gl.useProgram(program);

    this.setUniform(program, "projMatrix", projectionMatrix);
    this.setUniform(program, "viewMatrix", viewMatrix);
    this.setUniform(program, "uSampler", 0);

    if (this.textures?.bees) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.textures.bees);
    }

    state.objects.bees.forEach((bee) => {
      const modelMatrix = mat4.create();
      mat4.fromTranslation(modelMatrix, bee.pos);
      this.setUniform(program, "uModelMatrix", modelMatrix);
      this.drawMesh("bees");
    });
  }

  drawMobs(state, viewMatrix, projectionMatrix) {
    const gl = this.gl;
    const program = this.programs.mob;
    gl.useProgram(program);

    this.setUniform(program, "projMatrix", projectionMatrix);
    this.setUniform(program, "viewMatrix", viewMatrix);
    this.setUniform(program, "uSampler", 0);

    // if (this.textures?.bear) {
    if (this.textures?.mob) {
      gl.activeTexture(gl.TEXTURE0);
      // gl.bindTexture(gl.TEXTURE_2D, this.textures.bear);
      gl.bindTexture(gl.TEXTURE_2D, this.textures.mob);
    }

    state.objects.mobs.forEach((mob) => {
      const modelMatrix = mat4.create();
      mat4.fromTranslation(modelMatrix, mob.pos);
      mat4.scale(modelMatrix, modelMatrix, [
        mob.width || 1,
        mob.height || 1,
        mob.depth || 1,
      ]);
      if (mob.facingAngle) {
        mat4.rotateY(modelMatrix, modelMatrix, mob.facingAngle);
      }

      this.setUniform(program, "uModelMatrix", modelMatrix);
      this.setUniform(program, "uTextureOffset", mob.frameIndex || 0);
      this.drawMesh("mobs");
    });
  }

  initCache(programs) {
    console.log("Programs received by initCache:", Object.keys(programs));

    for (const key in programs) {
      const prog = programs[key];
      this.glCache[key] = {
        projMatrix: this.gl.getUniformLocation(prog, "projMatrix"),
        viewMatrix: this.gl.getUniformLocation(prog, "viewMatrix"),
        uSampler: this.gl.getUniformLocation(prog, "uSampler"),
      };

      // ADD THIS TO VERIFY THE CACHE IS ACTUALLY FILLING
      console.log(`Cache entry for [${key}]:`, this.glCache[key]);
    }
  }

  // CHQ: Gemini AI added function
  /**
   * Safe utility to bind values to shader uniforms based on type parsing.
   * @param {WebGLProgram} program - The target shader program object
   * @param {string} name - The uniform variable name in the shader (e.g., 'uViewMatrix')
   * @param {*} value - The data payload (Matrix, Vector, Array, or primitive float/int)
   */
  setUniform(program, name, value, type = null) {
    const gl = this.gl;

    // CHQ: Gemini AI added
    // Check cache first, fall back to GPU lookup only if missing
    const programKey = Object.keys(this.programs).find(
      (k) => this.programs[k] === program,
    );
    const cached = programKey && this.glCache[programKey]?.[name];
    const location = cached ?? gl.getUniformLocation(program, name); // CHQ: Nullish coalescing operator to return right side if left is null

    // Silent guard if shader optimizes away an unused uniform
    if (location === null || location === undefined) return;

    // 1. Handle Matrix4x4 arrays (Float32Array or regular array of 16 elements)
    if (
      value instanceof Float32Array ||
      (Array.isArray(value) && value.length === 16)
    ) {
      gl.uniformMatrix4fv(location, false, value);
    }
    // 2. Handle Vector3 arrays [x, y, z]
    else if (Array.isArray(value) && value.length === 3) {
      gl.uniform3fv(location, value);
    }
    // 3. Handle Vector4 arrays [r, g, b, a]
    else if (Array.isArray(value) && value.length === 4) {
      gl.uniform4fv(location, value);
    }
    // 4. Handle standard scalar numbers (floats/ints/samplers)
    // else if (typeof value === "number") {
    //   if (
    //     Number.isInteger(value) &&
    //     !Number.isFinite(value - Math.floor(value) + 0.1)
    //   ) {
    //     gl.uniform1i(location, value);
    //   } else {
    //     gl.uniform1f(location, value);
    //   }
    // }
    else if (typeof value === "number") {
      if (type === "int" || (type === null && Number.isInteger(value))) {
        gl.uniform1i(location, value);
      } else {
        gl.uniform1f(location, value);
      }
    }
  }

  // CHQ: Claude AI created helper method
  drawMesh(meshKey) {
    const gl = this.gl;
    const mesh = this.meshes[meshKey];
    if (!mesh || !mesh.vertexBuffer) return;

    if (mesh.vao) {
      // VAO path — all buffer/attribute state already recorded
      gl.bindVertexArray(mesh.vao);
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

  // engine/renderer.js
  // Add this method at the very bottom of the Renderer class:

  /**
   * Main rendering entry point called on every frame tick.
   * Clears buffers and delegates entity states down to specialized GPU drawing passes.
   * @param {Object} state - The master gameState object
   * @param {number} dt - Delta time in seconds
   */
  render(state, dt) {
    console.log("Renderer loop running...");
    const gl = this.gl;

    // 1. Guard to prevent deep crashes if state hasn't fully loaded yet
    if (!state || !state.player) return; // CHQ: Claude moved to the top of render, under gl definition

    // 2. Clear color and depth buffers to prevent frame bleeding
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0.5, 0.8, 1.0, 1.0); // CHQ: Gemini AI: test: Bright Blue Sky color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 3. GL state (Do this once per frame)
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // 4. Setup Matrices (Do this once per frame)
    // const projectionMatrix = this.getProjectionMatrix(); // Helper to get the cached one
    // const viewMatrix = this.getViewMatrix(state);

    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, [0, 15, 20], [0, 0, 0], [0, 1, 0]);

    const projectionMatrix = mat4.create();
    mat4.perspective(
      projectionMatrix,
      (45 * Math.PI) / 180,
      this.width / this.height,
      0.1,
      1000.0,
    );
    this.projectionMatrix = projectionMatrix;

    // 5. Draw calls AFTER matrices exist
    if (this.meshes.flowers?.vertexBuffer) {
      this.drawFlowers(state, viewMatrix, projectionMatrix);
      const err = gl.getError();
      if (err !== gl.NO_ERROR)
        console.error("WebGL error after drawFlowers:", err);
    } else {
      console.log(">>> drawFlowers SKIPPED — no mesh");
    }

    if (state.objects?.bees?.length > 0) {
      this.drawBees(state, viewMatrix, projectionMatrix);
    }

    if (state.objects?.mobs?.length > 0) {
      this.drawMobs(state, viewMatrix, projectionMatrix);
    }

    // // 4. Calculate Camera Matrices safely using scoped variables
    // const playerPos = state.player.pos || [0, 5, 0];

    // // Camera looks slightly downward in front of the player
    // const targetLookAt = [playerPos[0], playerPos[1] - 4, playerPos[2] - 10];
    // const upVector = [0, 1, 0];

    // // TODO: tests:
    // // Generate View and Projection Matrices
    // // Temporal hardcoded test camera looking directly down at the spawn origin space
    // const testCameraPos = [0, 15, 20];
    // const testTarget = [0, 0, 0];

    // // const viewMatrix = mat4.create();
    // // mat4.lookAt(viewMatrix, playerPos, targetLookAt, upVector);
    // // mat4.lookAt(viewMatrix, testCameraPos, testTarget, [0, 1, 0]);
    // mat4.lookAt(viewMatrix, [0, 15, 20], [0, 0, 0], [0, 1, 0]);

    // const projectionMatrix = mat4.create();

    // CHQ: Only update on resize (call mat4.perspective inside
    //      a window.addEventListener('resize', ...) callback)
    //      to prevent garbage collector from overwork and save
    //      CPU cycles
    // mat4.perspective(
    //   projectionMatrix,
    //   (45 * Math.PI) / 180,
    //   this.width / this.height,
    //   0.1,
    //   1000.0,
    // );
    // this.projectionMatrix = projectionMatrix;
    // console.log("Proj Matrix[0] after calc:", this.projectionMatrix[0]); // Should NOT be 0

    // const location = this.glCache.projectionMatrix; // Use your stored Location handle

    // this.gl.uniformMatrix4fv(location, false, this.projectionMatrix);

    // // 1. Is flower mesh actually uploaded?
    // console.log("flower vertCount:", this.meshes.flowers?.vertCount);
    // console.log("flower vertexBuffer:", this.meshes.flowers?.vertexBuffer);
    // console.log("flower indexBuffer:", this.meshes.flowers?.indexBuffer);

    // // 2. Is state populated?
    // console.log("player pos:", state?.player?.pos);
    // console.log("mobs count:", state?.objects?.mobs?.length);
    // console.log("bees count:", state?.objects?.bees?.length);

    // CHQ: Text always last — renders on top of world geometry
    if (this.textRenderer) {
      // Pass delta time, your game's tracking uniform phase timer, and the view matrix!
      this.textRenderer.render(dt, this.sinTime || 0, viewMatrix);
    }
  }

  potentialNewrender(state, dt) {
    // 1. Get the current active program
    const program = this.gl.getParameter(this.gl.CURRENT_PROGRAM);

    // 2. Safely look up the cache, or default to a safe empty object
    const key = this.getCurrentProgramKey(); // A function you might need to track which program is active
    const cache = this.glCache[key] || {};

    // 3. Bind matrices using the cache, but fallback to direct lookup if needed
    const uProj =
      cache.projMatrix || this.gl.getUniformLocation(program, "projMatrix");

    if (uProj) {
      this.gl.uniformMatrix4fv(uProj, false, this.projectionMatrix);
    } else {
      // Only warn once if possible to keep console clean
      if (!this.warnedProj) {
        console.warn("Uniform 'projMatrix' not found in program!");
        this.warnedProj = true;
      }
    }
  }
} // <--- End of Renderer Class
