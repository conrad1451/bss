// engine/renderer.js
// import * as MATH from "../utils/math.js";

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

    this.projectionMatrix = new Float32Array(16);
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

  /**
   * Uploads raw CPU flower vertex/index arrays directly to GPU memory channels.
   * @param {Object} stagingData - { verts: number[], index: number[] }
   */
  uploadFlowerMesh(stagingData) {
    const gl = this.gl;

    if (!stagingData || !stagingData.verts || stagingData.verts.length === 0) {
      console.warn(
        "⚠️ Graphics Warning: Attempted to upload empty or invalid flower staging data.",
      );
      return;
    }

    // 1. Store total indices to draw during drawElements execution calls
    this.meshes.flowers.vertCount = stagingData.index.length;

    // 2. Allocate and Bind Vertex Array Buffer (Coordinates, UVs, Normals)
    this.meshes.flowers.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.meshes.flowers.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(stagingData.verts),
      gl.STATIC_DRAW,
    );

    // 3. Allocate and Bind Element Array Buffer (Triangle index drawing sequences)
    this.meshes.flowers.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.meshes.flowers.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(stagingData.index),
      gl.STATIC_DRAW,
    );

    console.log(
      `⚡ GPU Upload Complete: ${stagingData.index.length / 3} procedural flower triangles bound to pipelines.`,
    );
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

  drawFlowersNew(state, viewMatrix, projectionMatrix) {
    const gl = this.gl;
    const program = this.programs.flower;
    const cache = this.glCache.flower;

    // 1. Activate the Program
    gl.useProgram(program);

    // 2. Pass Matrices (Use the cache!)
    if (cache.projMatrix)
      gl.uniformMatrix4fv(cache.projMatrix, false, projectionMatrix);
    if (cache.viewMatrix)
      gl.uniformMatrix4fv(cache.viewMatrix, false, viewMatrix);

    // 3. Bind Texture (Assuming you have a texture atlas for flowers)
    if (this.textures && this.textures.flowers) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.textures.flowers);
      const uSampler = gl.getUniformLocation(program, "uSampler");
      if (uSampler) gl.uniform1i(uSampler, 0);
    }

    // 4. Bind Geometry
    if (this.meshes.flowers && this.meshes.flowers.vertexBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.meshes.flowers.vertexBuffer);

      // Ensure stride matches your vertex buffer structure (e.g., 8 floats * 4 bytes = 32)
      const stride = 8 * 4;

      // Enable attributes (assuming you have location indices stored in cache)
      if (cache.vertPos !== undefined) {
        gl.enableVertexAttribArray(cache.vertPos);
        gl.vertexAttribPointer(cache.vertPos, 3, gl.FLOAT, false, stride, 0);
      }
      if (cache.vertUV !== undefined) {
        gl.enableVertexAttribArray(cache.vertUV);
        gl.vertexAttribPointer(cache.vertUV, 4, gl.FLOAT, false, stride, 3 * 4);
      }

      // 5. Draw
      if (this.meshes.flowers.indexBuffer) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.meshes.flowers.indexBuffer);
        gl.drawElements(
          gl.TRIANGLES,
          this.meshes.flowers.vertCount,
          gl.UNSIGNED_SHORT,
          0,
        );
      } else {
        gl.drawArrays(gl.TRIANGLES, 0, this.meshes.flowers.vertCount);
      }
    }
  }

  drawFlowers(state, viewMatrix, projectionMatrix) {
    const program = this.programs.flower; // Target your flower vertex/fragment shaders
    gl.useProgram(program);

    // // Map safely using flat lookups from glCache
    const cache = this.glCache.flower || {};
    // const uView = cache.flower_viewMatrix || cache.uViewMatrix;
    // const uProj = cache.uProjectionMatrix;

    // if (uView) gl.uniformMatrix4fv(uView, false, viewMatrix);
    // if (uProj) gl.uniformMatrix4fv(uProj, false, projectionMatrix);

    // CHQ: GEmini AI: forces the CPU to talk to the GPU driver,
    //      find the string "projMatrix" in the shader program,
    //      and return its index. At 60fps, a bottleneck
    const uProjMatrix = gl.getUniformLocation(program, "projMatrix");
    const uViewMatrix = gl.getUniformLocation(program, "viewMatrix");

    const cacheProjMatrix = this.glCache.flower.projMatrix;

    console.log("Location from GPU:", uProjMatrix);
    console.log("Location from Cache:", cacheProjMatrix);

    // 2. Pass the data to the GPU
    // Assuming you have your matrices defined as `this.projectionMatrix` and `this.viewMatrix`
    if (uProjMatrix)
      gl.uniformMatrix4fv(uProjMatrix, false, this.projectionMatrix);
    if (uViewMatrix) gl.uniformMatrix4fv(uViewMatrix, false, this.viewMatrix);

    // Bind texture sheet
    if (this.textures && this.textures.flowers) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.textures.flowers);
      const uSampler = gl.getUniformLocation(program, "uSampler");
      if (uSampler) gl.uniform1i(uSampler, 0);
    }

    // Bind Geometry Vertex Buffer Data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.meshes.flowers.vertexBuffer);
    // const stride = 5 * 4;
    const stride = 8 * 4; // Change from 5 * 4 to match 32-byte fields

    const locPos = cache.flower_vertPos ?? cache.vertPos;
    const locUV = cache.flower_vertUV ?? cache.vertUV;

    if (locPos !== undefined && locPos !== -1) {
      gl.enableVertexAttribArray(locPos);
      gl.vertexAttribPointer(locPos, 3, gl.FLOAT, false, stride, 0);
    }
    if (locUV !== undefined && locUV !== -1) {
      gl.enableVertexAttribArray(locUV);
      gl.vertexAttribPointer(locUV, 4, gl.FLOAT, false, stride, 3 * 4);
    }

    const programKey = this.getCurrentProgramKey(); // A function you might need to track which program is active

    // Bind Index array map and execute the GPU draw sequence!
    if (this.meshes.flowers.indexBuffer) {
      // 1. Update your uniforms
      const loc = this.glCache[programKey].projMatrix;
      this.gl.uniformMatrix4fv(loc, false, this.projectionMatrix);

      // 2. DEBUG: Verify the data just before the GPU uses it
      console.log(
        "DEBUG: Proj Matrix[0] (should be ~2.4):",
        this.projectionMatrix[0],
      );
      console.log(
        "DEBUG: Proj Matrix[5] (should be ~1.8):",
        this.projectionMatrix[5],
      );
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.meshes.flowers.indexBuffer);
      gl.drawElements(
        gl.TRIANGLES,
        this.meshes.flowers.vertCount,
        gl.UNSIGNED_SHORT,
        0,
      );
    } else {
      gl.drawArrays(gl.TRIANGLES, 0, this.meshes.flowers.vertCount);
    }
  }

  drawBees(state, viewMatrix, projectionMatrix) {
    const program = this.programs.bee; // Fixed: Reference the WebGLProgram directly
    gl.useProgram(program);

    const cache = this.glCache.bee || {};
    const uView = cache.bee_viewMatrix || cache.uViewMatrix;
    const uProj = cache.uProjectionMatrix;

    if (uView) gl.uniformMatrix4fv(uView, false, viewMatrix);
    if (uProj) gl.uniformMatrix4fv(uProj, false, projectionMatrix);

    // Bind the Bee Texture Atlas
    if (this.textures && this.textures.bees) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.textures.bees);
      const uSampler = gl.getUniformLocation(program, "uSampler");
      if (uSampler) gl.uniform1i(uSampler, 0);
    }

    // Bind the base Bee Mesh asset geometry
    if (this.meshes.bees && this.meshes.bees.vertexBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.meshes.bees.vertexBuffer);

      const stride = 5 * 4;
      const locPos = cache.vertPos;
      const locUV = cache.vertUV;

      if (locPos !== undefined && locPos !== -1) {
        gl.enableVertexAttribArray(locPos);
        gl.vertexAttribPointer(locPos, 3, gl.FLOAT, false, stride, 0);
      }
      if (locUV !== undefined && locUV !== -1) {
        gl.enableVertexAttribArray(locUV);
        gl.vertexAttribPointer(locUV, 2, gl.FLOAT, false, stride, 3 * 4);
      }

      // Loop through and update the model transform uniform per bee
      state.objects.bees.forEach((bee) => {
        // const modelMatrix = MATH.matrixTranslate(
        //   bee.pos[0],
        //   bee.pos[1],
        //   bee.pos[2],
        // );

        // CHQ: Gemini AI replaced call for modelMatrix
        const modelMatrix = mat4.create();
        mat4.fromTranslation(modelMatrix, [bee.pos[0], bee.pos[1], bee.pos[2]]);
        const uModel = cache.uModelMatrix;
        if (uModel) gl.uniformMatrix4fv(uModel, false, modelMatrix);

        const programKey = this.getCurrentProgramKey(); // A function you might need to track which program is active

        if (this.meshes.bees.indexBuffer) {
          // 1. Update your uniforms
          const loc = this.glCache[programKey].projMatrix;
          this.gl.uniformMatrix4fv(loc, false, this.projectionMatrix);

          // 2. DEBUG: Verify the data just before the GPU uses it
          console.log(
            "DEBUG: Proj Matrix[0] (should be ~2.4):",
            this.projectionMatrix[0],
          );
          console.log(
            "DEBUG: Proj Matrix[5] (should be ~1.8):",
            this.projectionMatrix[5],
          );
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.meshes.bees.indexBuffer);
          gl.drawElements(
            gl.TRIANGLES,
            this.meshes.bees.vertCount,
            gl.UNSIGNED_SHORT,
            0,
          );
        } else {
          gl.drawArrays(gl.TRIANGLES, 0, this.meshes.bees.vertCount);
        }
      });
    }
  }

  drawMobs(state, viewMatrix, projectionMatrix) {
    const program = this.programs.mob; // Target your mob vertex/fragment shaders
    gl.useProgram(program);

    const cache = this.glCache.mob || {};
    const uView = cache.uViewMatrix;
    const uProj = cache.uProjectionMatrix;

    if (uView) gl.uniformMatrix4fv(uView, false, viewMatrix);
    if (uProj) gl.uniformMatrix4fv(uProj, false, projectionMatrix);

    // Bind the Mob/Bear Texture Atlas
    if (this.textures && this.textures.bear) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.textures.bear);
      const uSampler = gl.getUniformLocation(program, "uSampler");
      if (uSampler) gl.uniform1i(uSampler, 0);
    }

    // Bind the base Mob Mesh geometry asset
    if (this.meshes.mobs && this.meshes.mobs.vertexBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.meshes.mobs.vertexBuffer);

      const stride = 5 * 4;
      // const locPos = cache.vertPos;
      const locPos = cache.mob_vertPos ?? cache.vertPos;
      const locUV = cache.vertUV;

      if (locPos !== undefined && locPos !== -1) {
        gl.enableVertexAttribArray(locPos);
        gl.vertexAttribPointer(locPos, 3, gl.FLOAT, false, stride, 0);
      }
      if (locUV !== undefined && locUV !== -1) {
        gl.enableVertexAttribArray(locUV);
        gl.vertexAttribPointer(locUV, 2, gl.FLOAT, false, stride, 3 * 4);
      }

      // Loop and draw each active monster in the world state
      state.objects.mobs.forEach((mob) => {
        const scaleX = mob.width || 1;
        const scaleY = mob.height || 1;
        const scaleZ = mob.depth || 1;

        let modelMatrix = MATH.matrixTranslate(
          mob.pos[0],
          mob.pos[1],
          mob.pos[2],
        );

        // CHQ: Gemini AI: replacement for scaling
        mat4.scale(modelMatrix, modelMatrix, [scaleX, scaleY, scaleZ]);
        // modelMatrix = MATH.matrixScale(modelMatrix, scaleX, scaleY, scaleZ);

        if (mob.facingAngle) {
          // CHQ: Gemini AI: replacement for rotation in Y direction
          mat4.rotateY(modelMatrix, modelMatrix, mob.facingAngle);
          // modelMatrix = MATH.matrixRotateY(modelMatrix, mob.facingAngle);
        }

        const uModel = cache.uModelMatrix;
        if (uModel) gl.uniformMatrix4fv(uModel, false, modelMatrix);

        const uTextureOffset = gl.getUniformLocation(program, "uTextureOffset");
        if (uTextureOffset) {
          gl.uniform1f(uTextureOffset, mob.frameIndex || 0);
        }
        const programKey = this.getCurrentProgramKey(); // A function you might need to track which program is active

        if (this.meshes.mobs.indexBuffer) {
          // 1. Update your uniforms
          const loc = this.glCache[programKey].projMatrix;
          this.gl.uniformMatrix4fv(loc, false, this.projectionMatrix);

          // 2. DEBUG: Verify the data just before the GPU uses it
          console.log(
            "DEBUG: Proj Matrix[0] (should be ~2.4):",
            this.projectionMatrix[0],
          );
          console.log(
            "DEBUG: Proj Matrix[5] (should be ~1.8):",
            this.projectionMatrix[5],
          );
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.meshes.mobs.indexBuffer);
          gl.drawElements(
            gl.TRIANGLES,
            this.meshes.mobs.vertCount,
            gl.UNSIGNED_SHORT,
            0,
          );
        } else {
          gl.drawArrays(gl.TRIANGLES, 0, this.meshes.mobs.vertCount);
        }
      });
    }
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
  setUniform(program, name, value) {
    const gl = this.gl;

    // Look up the uniform location directly on the active program
    const location = gl.getUniformLocation(program, name);
    if (!location) return; // Silent guard if shader optimizes away an unused uniform

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
    else if (typeof value === "number") {
      if (Number.isInteger(value)) {
        gl.uniform1i(location, value); // Integers and Texture Unit Samplers
      } else {
        gl.uniform1f(location, value); // Standard floating points
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

    // 1. Clear color and depth buffers to prevent frame bleeding
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0.5, 0.8, 1.0, 1.0); // CHQ: Gemini AI: test: Bright Blue Sky color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 2. Prevent deep crashes if state hasn't fully loaded yet
    if (!state || !state.player) return;

    // 3. Enable depth and transparency blends for sprites and particles
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // 4. Calculate Camera Matrices safely using scoped variables
    const playerPos = state.player.pos || [0, 5, 0];

    // Camera looks slightly downward in front of the player
    const targetLookAt = [playerPos[0], playerPos[1] - 4, playerPos[2] - 10];
    const upVector = [0, 1, 0];

    // TODO: tests:
    // Generate View and Projection Matrices
    // const viewMatrix = MATH.matrixLookAt(playerPos, targetLookAt, upVector);
    // Temporal hardcoded test camera looking directly down at the spawn origin space
    const testCameraPos = [0, 15, 20];
    const testTarget = [0, 0, 0];

    // 2. Replace the failing call:
    // OLD: const viewMatrix = MATH.matrixLookAt(testCameraPos, testTarget, [0, 1, 0]);

    // NEW:
    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, testCameraPos, testTarget, [0, 1, 0]);

    // const projectionMatrix = MATH.matrixPerspective(
    //   45,
    //   this.width / this.height,
    //   0.1,
    //   1000.0,
    // );

    // CHQ: Gemini AI: replaced MATH.matrixPerspective call
    const projectionMatrix = mat4.create();
    mat4.perspective(
      projectionMatrix,
      (45 * Math.PI) / 180,
      this.width / this.height,
      0.1,
      1000.0,
    );

    // CHQ: Gemini AI added: drawing flowers
    // --- DRAW PHASE: FLOWERS ---
    if (this.meshes.flowers && this.meshes.flowers.vertexBuffer) {
      this.drawFlowers(state, viewMatrix, projectionMatrix);
    }
    // CHQ: Gemini AI added: drawing bees
    // --- DRAW PHASE: BEES ---
    if (state.objects && state.objects.bees && state.objects.bees.length > 0) {
      this.drawBees(state, viewMatrix, projectionMatrix);
    }

    // CHQ: Gemini AI added: drawing mobs
    // --- DRAW PHASE: MOBS ---
    if (state.objects && state.objects.mobs && state.objects.mobs.length > 0) {
      this.drawMobs(state, viewMatrix, projectionMatrix);
    }

    // CHQ: Gemini AI wired textRenderer inside render method
    // At the bottom of your master render(state, dt) method inside renderer.js:
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
