// engine/renderer.js

import { MATH } from "../utils/math";

// 1. Ensure glMatrix is available (it's globally attached to window)
// const { mat4 } = window.glMatrix;
// const mat4 = window.glMatrix.mat4;

import { mat4, vec3 } from "gl-matrix";
import { beeInfo } from "../data/bees";

// console.log("Is mat4 available?", !!mat4); // Should be true

// console.log("Is glMatrix available?", !!window.glMatrix);
// console.log("Is mat4 available?", !!window.glMatrix?.mat4);
export class Renderer {
  /**
   * Constructs the Renderer, allocates all GPU-side registries, compiles every
   * shader program, primes the uniform cache, and initialises the screen-space
   * UI quad buffer.
   *
   * @param {WebGL2RenderingContext} gl - The active WebGL2 rendering context.
   * @param {number} width - Viewport width in pixels.
   * @param {number} height - Viewport height in pixels.
   * @param {Object} shadersDictionary - Map of shader-name keys to GLSL source strings,
   *   as exported from `shaders.js` (e.g. `{ staticVSH, staticFSH, beeVSH, … }`).
   */
  constructor(gl, width, height, shadersDictionary) {
    this.gl = gl;
    this.width = width;
    this.height = height;
    this.textures = {}; // CHQ: Claude AI: add this

    // this.projectionMatrix = new Float32Array(16); // CHQ: stored this.projectionMatrix as a property of Renderer class.
    // this.viewMatrix = new Float32Array(16);

    // 1. Pre-allocate matrices to stop GC churn
    this.viewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();

    // Explicitly initialize the cache directly on the class instance
    this.glCache = {};

    // Core GPU buffer registries managed by the graphics subsystem
    // live registry of actual GPU resources — the VAO, vertex buffer,
    // index buffer, instance buffer, and vertex/instance counts that
    // uploadFlowerMesh, uploadBeeMesh, etc. create and populate.
    // This is what drawMesh/drawBees/drawFlowers need to actually
    // issue draw calls.
    this.meshes = {
      flowers: {
        vertexBuffer: null,
        indexBuffer: null,
        vertCount: 0,
      },
      bees: {
        vertexBuffer: null,
        indexBuffer: null,
        vertCount: 0,
      },
      mobs: {
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

    // CHQ: static config/blueprint:
    //      for each mesh type. Describes the attribute names and stride
    //      that a buffer should have. Metadata defined once in the
    //      constructor, never holds any GPU objects. Consumed by
    //      bindMeshAttributes()
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
      },
      // CHQ: Claude AI (Sonnet) fixed missing vertUV attribute and stride
      mobs: { attributes: ["vertPos", "vertColor", "vertUV"], stride: 8 },
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

    // this.testDraw();
  }

  // --- 🛠️ NEW: Initialize dynamic quad vertices for UI texture rendering ---
  /**
   * Allocates a static GPU vertex buffer for a full-screen quad in normalised
   * device coordinates, used for screen-space UI texture rendering.
   * The buffer stores four vertices, each with an XY position and UV coordinate
   * packed as `[x, y, u, v]`.
   *
   * @returns {void}
   */

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
   * Reads the mesh schema for the given key and automatically enables and
   * configures all vertex attribute pointers for the bound array buffer.
   * Attribute sizes are inferred from the attribute name convention:
   * - Names containing `"Pos"` or `"Color"` → 3 floats
   * - Names containing `"UV"` → 4 floats
   * - All others → 1 float
   *
   * @param {string} meshKey - Key into `this.meshSchema`, e.g. `"flowers"`, `"bees"`, `"mobs"`.
   * @param {WebGLProgram} program - The currently active shader program whose attribute
   *   locations will be resolved.
   * @returns {void}
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
        // console.log(
        //   `attr: ${attrName}, location: ${location}, size: ${size}, offset: ${offset}, stride: ${stride}`,
        // );
        // Advance the offset for the next attribute
        offset += size * 4;
      }
    });
  }

  /**
   * Uploads raw CPU-side flower vertex and index arrays to the GPU, creating a
   * VAO that records all buffer bindings and attribute pointer state for fast
   * subsequent draw calls.
   *
   * Vertex layout (stride = 32 bytes / 8 floats per vertex):
   * - `vertPos`  — 3 floats at offset  0 (attribute location 0)
   * - `vertUV`   — 4 floats at offset 12 (attribute location 1)
   * - `vertGoo`  — 1 float  at offset 28 (attribute location 2)
   *
   * @param {{ verts: number[], index: number[] }} stagingData - CPU mesh data.
   *   `verts` is the flat interleaved float array; `index` is the triangle index list.
   * @returns {void}
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

    // console.log("flower VAO created:", this.meshes.flowers.vao);

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

    // console.log(
    //   `⚡ GPU Upload Complete: ${stagingData.index.length / 3} flower triangles.`,
    // );

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

  // CHQ: Claude AI (Sonnet) corrected
  uploadBeeMesh(stagingData) {
    const gl = this.gl;

    if (!stagingData || !stagingData.verts || stagingData.verts.length === 0) {
      console.warn("⚠️ Attempted to upload empty bee staging data.");
      return;
    }

    const beeProgram = this.programs.bee;

    // this.meshSchema.bees = this.meshSchema.bees || {};
    // const mesh = this.meshSchema.bees;
    this.meshes.bees = this.meshes.bees || {};
    const mesh = this.meshes.bees;

    mesh.vertCount = stagingData.index.length;

    mesh.vao = gl.createVertexArray();
    gl.bindVertexArray(mesh.vao);

    // --- Per-vertex buffer: vertPos(3) + vertUV(4) = 7 floats, stride 28 ---
    mesh.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(stagingData.verts),
      gl.STATIC_DRAW,
    );

    const vertPosLoc = gl.getAttribLocation(beeProgram, "vertPos");
    const vertUVLoc = gl.getAttribLocation(beeProgram, "vertUV");

    if (vertPosLoc !== -1) {
      gl.enableVertexAttribArray(vertPosLoc);
      gl.vertexAttribPointer(vertPosLoc, 3, gl.FLOAT, false, 28, 0);
    }
    if (vertUVLoc !== -1) {
      gl.enableVertexAttribArray(vertUVLoc);
      gl.vertexAttribPointer(vertUVLoc, 4, gl.FLOAT, false, 28, 12);
    }

    // --- Index buffer ---
    mesh.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint32Array(stagingData.index),
      gl.STATIC_DRAW,
    );

    // --- Per-instance buffer: instance_pos(4) + instance_rotation(4) + instance_uv(3) = 11 floats, stride 44 ---
    mesh.instanceBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.instanceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 0, gl.DYNAMIC_DRAW); // sized per-frame later

    const instPosLoc = gl.getAttribLocation(beeProgram, "instance_pos");
    const instRotLoc = gl.getAttribLocation(beeProgram, "instance_rotation");
    const instUVLoc = gl.getAttribLocation(beeProgram, "instance_uv");
    const instStride = 11 * 4; // 44 bytes

    if (instPosLoc !== -1) {
      gl.enableVertexAttribArray(instPosLoc);
      gl.vertexAttribPointer(instPosLoc, 4, gl.FLOAT, false, instStride, 0);
      gl.vertexAttribDivisor(instPosLoc, 1);
    }
    if (instRotLoc !== -1) {
      gl.enableVertexAttribArray(instRotLoc);
      gl.vertexAttribPointer(instRotLoc, 4, gl.FLOAT, false, instStride, 16);
      gl.vertexAttribDivisor(instRotLoc, 1);
    }
    if (instUVLoc !== -1) {
      gl.enableVertexAttribArray(instUVLoc);
      gl.vertexAttribPointer(instUVLoc, 3, gl.FLOAT, false, instStride, 32);
      gl.vertexAttribDivisor(instUVLoc, 1);
    }

    gl.bindVertexArray(null);

    mesh.instanceData = []; // refilled every frame in drawBees
  }

  uploadMobMesh(stagingData) {
    const gl = this.gl;
    if (!stagingData?.verts?.length) return;

    this.meshes.mobs.vertCount = stagingData.index.length;

    // CHQ: Me - create and bind a VAO
    this.meshes.mobs.vao = gl.createVertexArray();
    gl.bindVertexArray(this.meshes.mobs.vao);

    // CHQ: Vertex buffer
    this.meshes.mobs.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.meshes.mobs.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(stagingData.verts),
      gl.STATIC_DRAW,
    );

    // vertPos: 3 floats @ offset 0,  stride 32
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);
    // vertColor: 3 floats @ offset 12
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 32, 12);
    // vertUV: 2 floats @ offset 24
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 32, 24);

    this.meshes.mobs.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.meshes.mobs.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint32Array(stagingData.index),
      gl.STATIC_DRAW,
    );

    gl.bindVertexArray(null);
  }

  // Defensive compilation utility encapsulated in the class

  /**
   * Safely compiles and links a named shader program, returning a fallback program
   * if either source string is missing or empty.
   *
   * @param {string} programName - Human-readable label used in error messages.
   * @param {string} vshString - GLSL source for the vertex shader.
   * @param {string} fshString - GLSL source for the fragment shader.
   * @returns {WebGLProgram|null} The linked program, or the static fallback program
   *   if compilation cannot proceed.
   */
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

  /**
   * Iterates over every entry in the shader dictionary and compiles a linked
   * WebGL program for each render pass. Any program that fails to link is
   * replaced with the static fallback program and a warning is logged.
   *
   * Programs compiled: `static`, `dynamic`, `bee`, `flower`, `token`,
   * `particle`, `text`, `mob`, `explosion`, `trail`.
   *
   * @param {Object} SHADERS - Map of shader-name keys to GLSL source strings,
   *   as exported from `shaders.js`.
   * @returns {void}
   */
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
    // console.log("--- WebGL Program Linking Status Audit ---");
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
        // console.log(
        //   `Program [${key}] -> Valid WebGL Object: ${isProgram}, Link Successful: ${linkStatus}`,
        // );

        if (!linkStatus) {
          console.error(
            `❌ LINK FAILURE DETECTED ON PROGRAM: '${key}'!`,
            gl.getProgramInfoLog(prog),
          );
        }
      }
    });
    // console.log("------------------------------------------");
  }

  /**
   * Substitutes compile-time screen-dimension constants into a GLSL source string
   * before it is handed to the WebGL shader compiler. Supported tokens:
   *
   * | Token                        | Replaced with                              |
   * |------------------------------|--------------------------------------------|
   * | `INV_HALF_WIDTH`             | `1 / (width * 0.5)`                        |
   * | `INV_HALF_HEIGHT`            | `1 / (height * 0.5)`                       |
   * | `HALF_WIDTH`                 | `width * 0.5`                              |
   * | `HALF_HEIGHT`                | `height * 0.5`                             |
   * | `INV_ASPECT`                 | `height / width`                           |
   * | `ASPECT`                     | `width / height`                           |
   * | `SCREEN_CHANGE`              | `(width + height) * 0.5`                   |
   * | `INV_AVG_HALF_WIDTH_HEIGHT`  | `2 / ((width + height) * 0.5)`             |
   * | `LIGHT_DIR`                  | `vec3(0.5, 0.8, 0.2)` (hardcoded)         |
   *
   * @param {string} source - Raw GLSL source string containing placeholder tokens.
   * @returns {string} The GLSL source with all tokens replaced by their numeric values.
   */
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
  /**
   * Compiles a vertex shader and a fragment shader from GLSL source strings,
   * links them into a WebGL program, and returns the result.
   * Compilation and link errors are logged to the console.
   *
   * @param {string} vshSource - GLSL source for the vertex shader (pre-token-substitution).
   * @param {string} fshSource - GLSL source for the fragment shader (pre-token-substitution).
   * @returns {WebGLProgram} The compiled and linked WebGL program object.
   */
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

  /**
   * Identifies the key in `this.programs` that corresponds to the WebGL program
   * currently bound on the GPU.
   *
   * > **Performance note:** This method calls `gl.getParameter(CURRENT_PROGRAM)`,
   * > which is a synchronous GPU stall. Avoid calling it inside the render loop.
   *
   * @returns {string|null} The program key (e.g. `"flower"`, `"bee"`) or `null` if
   *   the active program is not registered in `this.programs`.
   */
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
  drawFlowers(state, viewMatrix, projectionMatrix) {
    const gl = this.gl;
    const flowerProgram = this.programs.flower; // Target your flower vertex/fragment shaders

    if (!gl.getProgramParameter(flowerProgram, gl.LINK_STATUS)) return;

    gl.useProgram(flowerProgram);

    // Temporary: verify flowerProgram is set
    // console.log("useProgram called, flowerProgram:", flowerProgram);

    this.setUniform(flowerProgram, "projMatrix", projectionMatrix);
    this.setUniform(flowerProgram, "viewMatrix", viewMatrix);

    this.setUniform(flowerProgram, "isNight", 1.0, "float"); // CHQ: Claude AI added this, without which resulted in black/invisible output

    const texLoc = gl.getUniformLocation(flowerProgram, "tex");

    // CHQ: Claude AI: remove logs
    // console.log("flower tex location:", texLoc);
    // console.log("flowers texture object:", this.textures?.flowers);
    // console.log("flower tex location:", gl.getUniformLocation(flowerProgram, "tex"));

    // 2. CRITICAL: Bind the flower texture
    // Ensure you have loaded the texture into this.textures.flowers
    if (this.textures?.flowers) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.textures.flowers);
      this.setUniform(flowerProgram, "tex", 0, "int"); // CHQ: Claude AI: replace "uSampler" with "tex"

      if (texLoc !== null) gl.uniform1i(texLoc, 0);
    }

    if (this.gl.frameCount < 150000) {
      console.log("Texture bound:", !!this.textures.flowers);
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

    this.drawMesh("flowers");
    // gl.enable(gl.CULL_FACE); // re-enable after if needed

    // console.log("flower texture:", this.textures?.flowers);
    // console.log("flower vertCount:", this.meshes.flowers.vertCount);
  }

  // CHQ: Claude AI rewrote to use setUniform and drawMesh

  /**
   * Iterates over all bee instances in the game state and issues one draw call
   * per bee, uploading an individual model matrix (translation only) for each.
   *
   * @param {Object} state - The live game state object.
   * @param {Object[]} state.objects.bees - Array of bee instances, each with a `pos` [x, y, z] array.
   * @param {Float32Array|number[]} viewMatrix - Column-major 4×4 view matrix.
   * @param {Float32Array|number[]} projectionMatrix - Column-major 4×4 projection matrix.
   * @returns {void}
   */
  drawBees(state, viewMatrix, projectionMatrix) {
    const gl = this.gl;
    const beeProgram = this.programs.bee;

    if (!gl.getProgramParameter(beeProgram, gl.LINK_STATUS)) return;

    // console.log(
    //   "bee link status:",
    //   gl.getProgramParameter(beeProgram, gl.LINK_STATUS),
    // );
    // const mesh = this.meshSchema.bess;
    const mesh = this.meshes.bees;
    if (!mesh || !mesh.vertexBuffer || !mesh.instanceBuffer) return;

    // 1. Clear last frame's instance data
    mesh.instanceData = [];

    // 2. Each bee contributes 11 floats: instance_pos(4) + instance_rotation(4) + instance_uv(3)
    state.objects.bees.forEach((bee) => {
      mesh.instanceData.push(
        bee.pos[0],
        bee.pos[1],
        bee.pos[2],
        bee.meshScale ?? 1,
        bee.moveDir?.[0] ?? 1,
        bee.moveDir?.[1] ?? 0,
        bee.moveDir?.[2] ?? 0,
        0,
        beeInfo[bee.type]?.u ?? 0,
        beeInfo[bee.type]?.v ?? 0,
        0, // meshPartId/layer — 0 to match vertUV.w = 0 on our simple quad, avoids culling
      );
    });

    const instanceCount = mesh.instanceData.length / 11;
    if (instanceCount === 0) return;

    // 3. Upload this frame's instance data
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.instanceBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(mesh.instanceData),
      gl.DYNAMIC_DRAW,
    );

    // 4. Program + uniforms
    gl.useProgram(beeProgram);
    this.setUniform(beeProgram, "projMatrix", projectionMatrix);
    this.setUniform(beeProgram, "viewMatrix", viewMatrix);
    this.setUniform(beeProgram, "isNight", 1.0, "float"); // see note below
    this.setUniform(beeProgram, "tex", 0, "int");

    if (this.textures?.bees) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.textures.bees);
    }

    // 5. One instanced draw call for all bees
    gl.bindVertexArray(mesh.vao);
    gl.drawElementsInstanced(
      gl.TRIANGLES,
      mesh.vertCount,
      gl.UNSIGNED_INT,
      0,
      instanceCount,
    );
    const err = gl.getError();
    if (err) console.error("drawElementsInstanced error [bees]:", err);
    gl.bindVertexArray(null);
  }

  /**
   * Iterates over all mob instances in the game state and issues one draw call
   * per mob, uploading a model matrix that encodes translation, non-uniform scale,
   * and Y-axis rotation derived from each mob's properties.
   *
   * @param {Object} state - The live game state object.
   * @param {Object[]} state.objects.mobs - Array of mob instances with the following optional fields:
   * @param {number[]} state.objects.mobs[].pos - World-space position [x, y, z].
   * @param {number} [state.objects.mobs[].width=1] - X scale.
   * @param {number} [state.objects.mobs[].height=1] - Y scale.
   * @param {number} [state.objects.mobs[].depth=1] - Z scale.
   * @param {number} [state.objects.mobs[].facingAngle] - Y-axis rotation in radians.
   * @param {number} [state.objects.mobs[].frameIndex=0] - Texture frame/row offset.
   * @param {Float32Array|number[]} viewMatrix - Column-major 4×4 view matrix.
   * @param {Float32Array|number[]} projectionMatrix - Column-major 4×4 projection matrix.
   * @returns {void}
   */
  drawMobs(state, viewMatrix, projectionMatrix) {
    // CHQ: Claude AI (Sonnet) removed unneeded textures
    const gl = this.gl;
    const mobProgram = this.programs.mob;

    if (!gl.getProgramParameter(mobProgram, gl.LINK_STATUS)) return;
    if (!this.meshes.mobs?.vertexBuffer) return;

    gl.useProgram(mobProgram);
    this.setUniform(mobProgram, "projMatrix", projectionMatrix);
    this.setUniform(mobProgram, "viewMatrix", viewMatrix);
    this.setUniform(mobProgram, "isNight", 1.0, "float");

    // console.log(
    //   "drawMobs called, mob count:",
    //   state.objects.mobs.length,
    //   "mesh vertCount:",
    //   this.meshes.mobs.vertCount,
    // );

    // CHQ: Gemini AI modified position
    state.objects.mobs.forEach((mob) => {
      // Use live simulation coordinates
      const posX = mob.pos[0];
      const posY = mob.pos[1];
      const posZ = mob.pos[2];
      const headingAngle = mob.facingAngle ?? 0.0;

      // instance_info1: [X, Y, Z, Y-Axis Rotation]
      this.setUniform(mobProgram, "instance_info1", [
        posX,
        posY,
        posZ,
        headingAngle,
      ]);

      // CRITICAL FIX FOR VERTICAL BLOCK: Pass X, Y, and Z scales individually
      // instance_info2: [ScaleX, ScaleY, ScaleZ, FrameIndex]
      const scaleX = mob.width ?? 1.0;
      const scaleY = mob.height ?? 1.0;
      const scaleZ = mob.depth ?? 1.0;
      const frameIndex = mob.frameIndex ?? 0.0;

      this.setUniform(mobProgram, "instance_info2", [
        scaleX,
        scaleY,
        scaleZ,
        frameIndex,
      ]);

      this.drawMesh("mobs");
    });
  }

  // FIXME: switch bears to player
  drawPlayer(state, viewMatrix, projectionMatrix) {
    // Reuse mob program + mesh — player is just a mob with player's pos
    const gl = this.gl;
    const prog = this.programs.mob;
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    // if (!this.meshSchema.mobs?.vertexBuffer) return;
    if (!this.meshes.mobs?.vertexBuffer) return;

    gl.useProgram(prog);
    this.setUniform(prog, "projMatrix", projectionMatrix);
    this.setUniform(prog, "viewMatrix", viewMatrix);

    if (this.textures?.bear) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.textures.bear);
      this.setUniform(prog, "tex", 0, "int");
    }

    const modelMatrix = mat4.create();
    mat4.fromTranslation(modelMatrix, state.player.pos);
    mat4.rotateY(modelMatrix, modelMatrix, state.player.yaw || 0);
    this.setUniform(prog, "uModelMatrix", modelMatrix);
    this.drawMesh("mobs");
  }

  /**
   * Pre-fetches and caches the WebGL uniform locations for `projMatrix`,
   * `viewMatrix`, and `tex` for every registered shader program. The cache
   * is consulted by {@link setUniform} to avoid repeated `getUniformLocation`
   * calls during the render loop.
   *
   * @param {Object.<string, WebGLProgram>} programs - Map of program key → WebGL program,
   *   typically `this.programs`.
   * @returns {void}
   */
  initCache(programs) {
    // console.log("Programs received by initCache:", Object.keys(programs));

    for (const key in programs) {
      const prog = programs[key];
      this.glCache[key] = {
        projMatrix: this.gl.getUniformLocation(prog, "projMatrix"),
        viewMatrix: this.gl.getUniformLocation(prog, "viewMatrix"),
        tex: this.gl.getUniformLocation(prog, "tex"), // CHQ: Claude AI: replace "uSampler" with "tex"
      };

      // ADD THIS TO VERIFY THE CACHE IS ACTUALLY FILLING
      // console.log(`Cache entry for [${key}]:`, this.glCache[key]);
    }
  }

  // CHQ: Claude AI: temp function for testing
  /**
   * Quick sanity-check draw that renders a red triangle on a blue background
   * using a minimal inline shader pair. Useful for verifying that the WebGL
   * context and canvas are wired up correctly before the main render pipeline
   * is ready.
   *
   * @returns {void}
   */
  testDraw() {
    const gl = this.gl;

    // Simple triangle covering most of the screen
    const verts = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);

    const vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(
      vsh,
      `#version 300 es
    in vec2 pos;
    void main() { gl_Position = vec4(pos, 0.0, 1.0); }
  `,
    );
    gl.compileShader(vsh);

    const fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(
      fsh,
      `#version 300 es
    precision highp float;
    out vec4 col;
    void main() { col = vec4(1.0, 0.0, 0.0, 1.0); }
  `,
    );
    gl.compileShader(fsh);

    const prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const loc = gl.getAttribLocation(prog, "pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // console.log("testDraw error:", gl.getError());
  }

  // CHQ: Gemini AI added function
  /**
   * Type-dispatching helper that uploads a value to a named GLSL uniform,
   * resolving the uniform location from the cache when available.
   *
   * Dispatch rules (in priority order):
   * 1. `Float32Array` or 16-element array → `uniformMatrix4fv`
   * 2. 3-element array → `uniform3fv`
   * 3. 4-element array → `uniform4fv`
   * 4. `number` with `type === "int"` or integer value → `uniform1i`
   * 5. `number` (float) → `uniform1f`
   *
   * Silently returns if the uniform location is `null` (i.e. optimised away
   * by the GLSL compiler).
   *
   * @param {WebGLProgram} program - The target shader program that owns the uniform.
   * @param {string} name - The uniform variable name as it appears in the GLSL source.
   * @param {Float32Array|number[]|number} value - The value to upload.
   * @param {"int"|"float"|null} [type=null] - Optional explicit type hint. Pass `"int"`
   *   to force `uniform1i` for a numeric value that would otherwise be treated as a float.
   * @returns {void}
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
  drawMesh(meshKey) {
    const gl = this.gl;
    const mesh = this.meshes[meshKey];
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

  // engine/renderer.js
  // Add this method at the very bottom of the Renderer class:

  /**
   * Main rendering entry point called once per animation frame. Clears the colour
   * and depth buffers, constructs per-frame view and projection matrices from the
   * current player position and yaw, then dispatches to each specialised draw pass.
   *
   * Draw order:
   * 1. Flower mesh (static world geometry)
   * 2. Bees (per-instance)
   * 3. Mobs (per-instance)
   * 4. Text / decals (always last, renders on top)
   *
   * @param {Object} state - The authoritative game state object produced by
   *   {@link createInitialState}. Must contain a `player` with `pos` and `yaw` fields.
   * @param {number} dt - Delta time in seconds since the previous frame.
   * @returns {void}
   */
  render(state, dt) {
    // console.log("Renderer loop running...");
    const gl = this.gl;

    // 1. Guard to prevent deep crashes if state hasn't fully loaded yet
    if (!state || !state.player) return; // CHQ: Claude moved to the top of render, under gl definition

    // 2. Clear color and depth buffers to prevent frame bleeding
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0.5, 0.8, 1.0, 1.0); // CHQ: Gemini AI: test: Bright Blue Sky color
    // gl.clearColor(1.0, 0.0, 0.0, 1.0); // bright red
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 3. GL state (Do this once per frame)
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // 4. Setup Matrices (Do this once per frame)
    // const projectionMatrix = this.getProjectionMatrix(); // Helper to get the cached one
    // const viewMatrix = this.getViewMatrix(state);

    const viewMatrix = mat4.create();
    // mat4.lookAt(viewMatrix, [0, 15, 20], [0, 0, 0], [0, 1, 0]);
    // mat4.lookAt(viewMatrix, [25, 25, -20], [25, 13, -40], [0, 1, 0]);
    // mat4.lookAt(viewMatrix, [15, 20, 35], [15, 0, 16], [0, 1, 0]);
    // mat4.lookAt(viewMatrix, [15, 50, 50], [15, 10, 16], [0, 1, 0]);

    // mat4.lookAt(viewMatrix, [15, 20, 60], [15, 0, 16], [0, 1, 0]); // CHQ: Claude AI: adjust camera to see flowers
    // mat4.lookAt(viewMatrix, [15, 10, 30], [15, 0, 16], [0, 1, 0]);
    // mat4.lookAt(viewMatrix, [15, 8, 40], [15, 0, 16], [0, 1, 0]);

    // CHQ: Claude AI added wiring for the camera
    const pos = state.player.pos;
    const yaw = state.player.yaw || 0;

    // Camera sits behind and above the player
    const camX = pos[0] - Math.sin(yaw) * 15;
    const camY = pos[1] + 8;
    const camZ = pos[2] + Math.cos(yaw) * 15;

    // CHQ: Claude AI exposed camera pos so other systems (spawning, debug) can use it
    state.camera = state.camera || {};
    state.camera.pos = [camX, camY, camZ];

    mat4.lookAt(
      viewMatrix,
      [camX, camY, camZ],
      [pos[0], pos[1], pos[2]],
      [0, 1, 0],
    );

    const projectionMatrix = mat4.create();
    mat4.perspective(
      projectionMatrix,
      // (45 * Math.PI) / 180,
      (90 * Math.PI) / 180, // 90 degrees instead of 45
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

    if (this.gl.frameCount < 50000) {
      console.log(
        "mobs:",
        state.objects.mobs.length,
        "mesh:",
        // !!this.meshSchema.mobs?.vertexBuffer,
        !!this.meshes.mobs?.vertexBuffer,
      );
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
    // Quick sanity check — add temporarily to renderer.js render()
    // console.log(
    //   "mobs to draw:",
    //   state.objects.mobs.map(
    //     (m) => `${m.type}@[${m.pos.map((v) => v.toFixed(1))}]`,
    //   ),
    // );
    // CHQ: Text always last — renders on top of world geometry
    if (this.textRenderer) {
      // Pass delta time, your game's tracking uniform phase timer, and the view matrix!
      this.textRenderer.render(dt, this.sinTime || 0, viewMatrix);
    }
  }
} // <--- End of Renderer Class
