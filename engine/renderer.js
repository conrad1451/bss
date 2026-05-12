// engine/renderer.js
import { TextRenderer } from "./textRenderer.js";
import { questDefinitions } from "../data/quests.js";
import { MATH } from "../utils/math.js";
// CHQ: Claude AI generated this file

export class DupedToken {
  constructor(life, pos, type, funcParams) {
    if (
      Math.random() < 0.1 + player.extraInfo.drives.glitched * 0.001 ||
      type === "glitch" ||
      type === "mapCorruption"
    ) {
      type = "smiley";
    }

    this.funcParams = funcParams;
    this.life = life * player.tokenLifespan * 1.5;
    this.pos = pos;
    this.type = type;
    this.rotation = Math.random() * MATH.TWO_PI;
    this.func = effects[type].svg ? false : effects[type].func;
    this.canBeLinked =
      effects[type].canBeLinked === undefined || effects[type].canBeLinked;

    this.activationTimer = 0;
    this.pos[1] += 3.5;
  }

  die(index) {
    objects.tokens.splice(index, 1);
  }

  collect() {
    if (!this.collected) {
      this.collected = true;
      this.life = 0.75;
      player.stats.abilityTokens++;

      if (effects[this.type].statsToAddTo) {
        for (let i in effects[this.type].statsToAddTo) {
          player.stats[effects[this.type].statsToAddTo[i]]++;
        }
      }

      if (this.func) {
        this.func(this.funcParams);
      } else {
        player.addEffect(this.type);
      }
    }
  }

  update(dt) {
    this.life -= dt;

    if (this.collected) {
      textRenderer.addDecalRaw(
        this.pos[0],
        this.pos[1],
        this.pos[2],
        0,
        0,
        ...textRenderer.decalUV.smiley,
        1,
        0,
        0.85,
        -3,
        -3,
        0,
      );
    } else {
      textRenderer.addDecalRaw(
        this.pos[0],
        this.pos[1],
        this.pos[2],
        0,
        0,
        ...textRenderer.decalUV.circle,
        0.1,
        0.1,
        0.1,
        3,
        3,
        0,
      );

      textRenderer.addDecalRaw(
        this.pos[0],
        this.pos[1],
        this.pos[2],
        0,
        0,
        ...textRenderer.decalUV.arc,
        1,
        1,
        1,
        -3,
        -3,
        MATH.dupedTokenLoadingArcRotation(this.activationTimer),
      );

      this.rotation += dt * 2.6;

      meshes.tokens.instanceData.push(
        this.pos[0],
        this.pos[1],
        this.pos[2],
        this.rotation,
        effects[this.type].u,
        effects[this.type].v,
        this.life * 0.15,
        1.5,
      );

      if (
        Math.abs(this.pos[0] - player.body.position.x) +
          Math.abs(this.pos[1] - 3.5 - player.body.position.y) +
          Math.abs(this.pos[2] - player.body.position.z) <
        3.5
      ) {
        this.activationTimer += dt;
      } else {
        this.activationTimer = Math.max(this.activationTimer - dt, 0);
      }

      if (this.activationTimer >= 1) {
        this.collect();
      }
    }

    return this.life <= 0;
  }
}

let initGlCache = function (glCache) {
  return glCache;
};

export class Renderer {
  constructor(gl, canvasWidth, canvasHeight) {
    this.gl = gl;
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.programs = {};
    this.glCache = {};
    this.textRenderer = new TextRenderer(this.gl, this.glCache, this.programs);
  }

  // NEW METHOD: This replaces the .replaceAll logic from index.js
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

  // Refactored from index.js (Line 2450)
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

  initCache(programs) {
    this.glCache.static_viewMatrix = this.gl.getUniformLocation(
      programs.static,
      "viewMatrix",
    );

    // Static geometry
    this.glCache.static_isNight = this.gl.getUniformLocation(
      programs.static,
      "isNight",
    );
    this.glCache.static_vertPos = this.gl.getAttribLocation(
      programs.static,
      "vertPos",
    );
    this.gl.enableVertexAttribArray(this.glCache.static_vertPos);
    this.glCache.static_vertColor = this.gl.getAttribLocation(
      programs.static,
      "vertColor",
    );
    this.gl.enableVertexAttribArray(this.glCache.static_vertColor);
    this.glCache.static_vertUV = this.gl.getAttribLocation(
      programs.static,
      "vertUV",
    );
    this.gl.enableVertexAttribArray(this.glCache.static_vertUV);

    // Dynamic geometry
    this.glCache.dynamic_viewMatrix = this.gl.getUniformLocation(
      programs.dynamic,
      "viewMatrix",
    );
    this.glCache.dynamic_modelMatrix = this.gl.getUniformLocation(
      programs.dynamic,
      "modelMatrix",
    );
    this.glCache.dynamic_isNight = this.gl.getUniformLocation(
      programs.dynamic,
      "isNight",
    );
    this.glCache.dynamic_vertPos = this.gl.getAttribLocation(
      programs.dynamic,
      "vertPos",
    );
    this.gl.enableVertexAttribArray(this.glCache.dynamic_vertPos);
    this.glCache.dynamic_vertColor = this.gl.getAttribLocation(
      programs.dynamic,
      "vertColor",
    );
    this.gl.enableVertexAttribArray(this.glCache.dynamic_vertColor);
    this.glCache.dynamic_vertNormal = this.gl.getAttribLocation(
      programs.dynamic,
      "vertNormal",
    );
    this.gl.enableVertexAttribArray(this.glCache.dynamic_vertNormal);

    // Token geometry
    this.glCache.token_viewMatrix = this.gl.getUniformLocation(
      programs.token,
      "viewMatrix",
    );
    this.glCache.token_isNight = this.gl.getUniformLocation(
      programs.token,
      "isNight",
    );
    this.glCache.token_vertPos = this.gl.getAttribLocation(
      programs.token,
      "vertPos",
    );
    this.gl.enableVertexAttribArray(this.glCache.token_vertPos);
    this.glCache.token_vertUV = this.gl.getAttribLocation(
      programs.token,
      "vertUV",
    );
    this.gl.enableVertexAttribArray(this.glCache.token_vertUV);

    // CHQ: token instance position
    this.glCache.token_instancePos = this.gl.getAttribLocation(
      programs.token,
      "instance_pos",
    );
    this.gl.enableVertexAttribArray(this.glCache.token_instancePos);

    // CHQ: token instance UV
    this.glCache.token_instanceUV = this.gl.getAttribLocation(
      programs.token,
      "instance_uv",
    );
    this.gl.enableVertexAttribArray(this.glCache.token_instanceUV);

    // Flower geometry
    this.glCache.flower_viewMatrix = this.gl.getUniformLocation(
      programs.flower,
      "viewMatrix",
    );
    this.glCache.flower_isNight = this.gl.getUniformLocation(
      programs.flower,
      "isNight",
    );
    this.glCache.flower_vertPos = this.gl.getAttribLocation(
      programs.flower,
      "vertPos",
    );
    this.gl.enableVertexAttribArray(this.glCache.flower_vertPos);
    this.glCache.flower_vertUV = this.gl.getAttribLocation(
      programs.flower,
      "vertUV",
    );
    this.gl.enableVertexAttribArray(this.glCache.flower_vertUV);
    this.glCache.flower_vertGoo = this.gl.getAttribLocation(
      programs.flower,
      "vertGoo",
    );
    this.gl.enableVertexAttribArray(this.glCache.flower_vertGoo);

    // Bee geometry
    this.glCache.bee_viewMatrix = this.gl.getUniformLocation(
      programs.bee,
      "viewMatrix",
    );
    this.glCache.bee_isNight = this.gl.getUniformLocation(
      programs.bee,
      "isNight",
    );
    this.glCache.bee_vertPos = this.gl.getAttribLocation(
      programs.bee,
      "vertPos",
    );
    this.gl.enableVertexAttribArray(this.glCache.bee_vertPos);
    this.glCache.bee_vertUV = this.gl.getAttribLocation(programs.bee, "vertUV");
    this.gl.enableVertexAttribArray(this.glCache.bee_vertUV);
    this.glCache.bee_instancePos = this.gl.getAttribLocation(
      programs.bee,
      "instance_pos",
    );
    this.gl.enableVertexAttribArray(this.glCache.bee_instancePos);
    this.glCache.bee_instanceRotation = this.gl.getAttribLocation(
      programs.bee,
      "instance_rotation",
    );
    this.gl.enableVertexAttribArray(this.glCache.bee_instanceRotation);
    this.glCache.bee_instanceUV = this.gl.getAttribLocation(
      programs.bee,
      "instance_uv",
    );
    this.gl.enableVertexAttribArray(this.glCache.bee_instanceUV);

    // Particle renderer
    this.glCache.particle_vertPos = this.gl.getAttribLocation(
      programs.particle,
      "vertPos",
    );
    this.gl.enableVertexAttribArray(this.glCache.particle_vertPos);
    this.glCache.particle_vertColor = this.gl.getAttribLocation(
      programs.particle,
      "vertColor",
    );
    this.gl.enableVertexAttribArray(this.glCache.particle_vertColor);
    this.glCache.particle_vertSize = this.gl.getAttribLocation(
      programs.particle,
      "vertSize",
    );
    this.gl.enableVertexAttribArray(this.glCache.particle_vertSize);
    this.glCache.particle_vertRot = this.gl.getAttribLocation(
      programs.particle,
      "vertRot",
    );
    this.gl.enableVertexAttribArray(this.glCache.particle_vertRot);
    this.glCache.particle_viewMatrix = this.gl.getUniformLocation(
      programs.particle,
      "viewMatrix",
    );

    // Explosion renderer
    this.glCache.explosion_vertPos = this.gl.getAttribLocation(
      programs.explosion,
      "vertPos",
    );
    this.gl.enableVertexAttribArray(this.glCache.explosion_vertPos);
    this.glCache.explosion_instancePos = this.gl.getAttribLocation(
      programs.explosion,
      "instance_pos",
    );
    this.gl.enableVertexAttribArray(this.glCache.explosion_instancePos);
    this.glCache.explosion_instanceColor = this.gl.getAttribLocation(
      programs.explosion,
      "instance_color",
    );
    this.gl.enableVertexAttribArray(this.glCache.explosion_instanceColor);
    this.glCache.explosion_instanceScale = this.gl.getAttribLocation(
      programs.explosion,
      "instance_scale",
    );
    this.gl.enableVertexAttribArray(this.glCache.explosion_instanceScale);
    this.glCache.explosion_viewMatrix = this.gl.getUniformLocation(
      programs.explosion,
      "viewMatrix",
    );

    // Text renderer
    this.glCache.text_vertPos = this.gl.getAttribLocation(
      programs.text,
      "vertPos",
    );
    this.gl.enableVertexAttribArray(this.glCache.text_vertPos);
    this.glCache.text_vertUV = this.gl.getAttribLocation(
      programs.text,
      "vertUV",
    );
    this.gl.enableVertexAttribArray(this.glCache.text_vertUV);
    this.glCache.text_instanceOrigin = this.gl.getAttribLocation(
      programs.text,
      "instance_origin",
    );
    this.gl.enableVertexAttribArray(this.glCache.text_instanceOrigin);
    this.glCache.text_instanceOffset = this.gl.getAttribLocation(
      programs.text,
      "instance_offset",
    );
    this.gl.enableVertexAttribArray(this.glCache.text_instanceOffset);
    this.glCache.text_instanceUV = this.gl.getAttribLocation(
      programs.text,
      "instance_uv",
    );
    this.gl.enableVertexAttribArray(this.glCache.text_instanceUV);
    this.glCache.text_instanceColor = this.gl.getAttribLocation(
      programs.text,
      "instance_color",
    );
    this.gl.enableVertexAttribArray(this.glCache.text_instanceColor);
    this.glCache.text_instanceInfo = this.gl.getAttribLocation(
      programs.text,
      "instance_info",
    );
    this.gl.enableVertexAttribArray(this.glCache.text_instanceInfo);
    this.glCache.text_viewMatrix = this.gl.getUniformLocation(
      programs.text,
      "viewMatrix",
    );

    // Mob renderer
    this.glCache.mob_viewMatrix = this.gl.getUniformLocation(
      programs.mob,
      "viewMatrix",
    );
    this.glCache.mob_isNight = this.gl.getUniformLocation(
      programs.mob,
      "isNight",
    );
    this.glCache.mob_vertPos = this.gl.getAttribLocation(
      programs.mob,
      "vertPos",
    );
    this.gl.enableVertexAttribArray(this.glCache.mob_vertPos);
    this.glCache.mob_vertColor = this.gl.getAttribLocation(
      programs.mob,
      "vertColor",
    );
    this.gl.enableVertexAttribArray(this.glCache.mob_vertColor);
    this.glCache.mob_instanceInfo1 = this.gl.getUniformLocation(
      programs.mob,
      "instance_info1",
    );
    this.glCache.mob_instanceInfo2 = this.gl.getUniformLocation(
      programs.mob,
      "instance_info2",
    );

    // Trail renderer
    this.glCache.trail_viewMatrix = this.gl.getUniformLocation(
      programs.trail,
      "viewMatrix",
    );
    this.glCache.trail_vertPos = this.gl.getAttribLocation(
      programs.trail,
      "vertPos",
    );
    this.gl.enableVertexAttribArray(this.glCache.trail_vertPos);
    this.glCache.trail_vertColor = this.gl.getAttribLocation(
      programs.trail,
      "vertCol",
    );
    this.gl.enableVertexAttribArray(this.glCache.trail_vertColor);
    this.glCache.trail_isNight = this.gl.getUniformLocation(
      programs.trail,
      "isNight",
    );
  }

  // Inside engine/renderer.js or tokens.js

  // CHQ: Gemini AI renamed drawQuad to drawTokens
  drawTokens(gameState) {
    const { gl, glCache, programs } = this;
    const { objects, meshes, viewMatrix } = gameState;

    const nightFactor = gameState.isNight ? 0.4 : 1.0;

    // 1. Uniforms
    gl.uniformMatrix4fv(glCache.token_viewMatrix, false, viewMatrix);
    gl.uniform1f(glCache.token_isNight, nightFactor);

    // 2. Pack instance data [x, y, z, rotation, u, v, scale, ?]
    // CHQ: Gemini AI changed instanceData to a TypedArray for faster GPU processing
    const instanceData = new Float32Array(tokens.length * 8);
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const baseIndex = i * 8;

      const lifeScale = token instanceof DupedToken ? 0.15 : 0.3;

      instanceData[baseIndex + 0] = token.pos[0];
      instanceData[baseIndex + 1] = token.pos[1];
      instanceData[baseIndex + 2] = token.pos[2];
      instanceData[baseIndex + 3] = token.rotation;
      instanceData[baseIndex + 4] = token.u;
      instanceData[baseIndex + 5] = token.v;
      instanceData[baseIndex + 6] = token.life * lifeScale;
      instanceData[baseIndex + 7] = 1.0; // Uniform scale multiplier
    }

    // 2. Upload to the token instance buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.token.instanceBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(instanceData),
      gl.DYNAMIC_DRAW,
    );

    // 3. Set attribute pointers (8 floats per instance = 32 bytes)
    const stride = 32;

    // instance_pos
    gl.vertexAttribPointer(
      glCache.token_instancePos,
      4,
      gl.FLOAT,
      false,
      stride,
      0,
    );
    gl.vertexAttribDivisor(glCache.token_instancePos, 1);

    // instance_uv
    gl.vertexAttribPointer(
      glCache.token_instanceUV,
      4,
      gl.FLOAT,
      false,
      stride,
      16,
    );
    gl.vertexAttribDivisor(glCache.token_instanceUV, 1);

    // 4. Draw the token mesh for all active instances
    gl.bindBuffer(gl.ARRAY_BUFFER, gameState.meshes.token.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gameState.meshes.token.indexBuffer);
    gl.drawElementsInstanced(
      gl.TRIANGLES,
      gameState.meshes.token.indexAmount,
      gl.UNSIGNED_SHORT,
      0,
      objects.tokens.length,
    );

    // 5. Cleanup
    gl.vertexAttribDivisor(glCache.token_instancePos, 0);
    gl.vertexAttribDivisor(glCache.token_instanceUV, 0);
  }

  // CHQ: encapsulated logic for drawing world into its own method
  renderWorld(gameState, gl, dt) {
    // 2. Global State
    const nightFactor = gameState.isNight ? 0.4 : 1.0;

    // 3. Draw Opaque World Objects (Solid geometry first)
    this.renderStaticFields(gameState, nightFactor); // CHQ: Static Geometry
    this.renderFlowers(gameState, nightFactor); // CHQ: Static Geometry
    this.renderBees(gameState, nightFactor); // CHQ: Instanced
    this.renderTokens(gameState, nightFactor);

    // 4. Draw Transparent/Additive Effects
    // We disable depth writing so particles don't block the things behind them
    gl.depthMask(false);
    this.renderParticles(gameState); // CHQ: Instanced
    this.renderExplosions(gameState); // Don't forget the explosions!
    gl.depthMask(true); // Re-enable for the UI

    // 5. Draw 3D Floating UI Text (Last thing in WebGL)
    // Using the wiggle effect from your original logic [cite: 1440-1443]
    if (this.textRenderer) {
      this.textRenderer.update(dt);
      this.textRenderer.render(
        dt,
        Math.sin(gameState.TIME * 20),
        gameState.viewMatrix,
      );
    }

    // // 7. Draw UI text (Floating numbers)
    // this.textRenderer.update(dt);
    // this.textRenderer.render(dt, Math.sin(gameState.TIME * 20));

    // // 8. Final Canvas Copy
    // if (this.ctx) {
    //   this.ctx.drawImage(this.gl.canvas, 0, 0);
    // }

    // 7. Draw 2D Overlay Text (If any)
    if (this.textRenderer) {
      this.textRenderer.draw(); // Draws context-based labels
    }
  }

  // CHQ: Gemini AI refactored
  render(gameState, dt) {
    const gl = this.gl;
    const { player, objects, TIME } = gameState;

    // 1. Clear Screen
    gl.clearColor(...player.skyColor, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 2. DRAW 3D WORLD (Fields, Bees, Mobs, NPCs)
    this.renderWorld(gameState, gl, dt);

    // CHQ: Gemini AI created condtiional for drawing Quest log UI overlay
    // 3. DRAW UI OVERLAY (The Quest Log)
    if (gameState.showTheQuests) {
      // We use the textRenderer we initialized in index.js
      gameState.activeQuests.forEach((quest, index) => {
        const data = questDefinitions[quest.id];

        // Offset the Y position so quests don't overlap
        const yOffset = index * 60;

        textRenderer.draw(data.title, 20, 40 + yOffset, {
          size: 20,
          color: [1, 1, 1],
        });
        textRenderer.draw(data.description, 20, 65 + yOffset, {
          size: 14,
          color: [0.8, 0.8, 0.8],
        });
      });
    }
  }

  renderStaticFields(gameState, nightFactor) {
    const gl = this.gl;
    gl.useProgram(this.programs.static);

    // Set uniforms
    gl.uniformMatrix4fv(
      this.glCache.static_viewMatrix,
      false,
      gameState.viewMatrix,
    );
    gl.uniform1f(this.glCache.static_isNight, nightFactor);

    // Bind field buffers and draw
    gl.bindBuffer(gl.ARRAY_BUFFER, gameState.meshes.static.vertexBuffer);
    // ... attribute pointers logic from index.js
    gl.drawArrays(gl.TRIANGLES, 0, gameState.meshes.static.vertCount);
  }

  renderBees(gameState, nightFactor) {
    const { gl, glCache, programs } = this;
    const { objects, meshes } = gameState;

    if (objects.bees.length === 0) return;

    gl.useProgram(programs.bee);
    gl.uniformMatrix4fv(glCache.bee_viewMatrix, false, gameState.viewMatrix);
    gl.uniform1f(glCache.bee_isNight, nightFactor);

    // Pack instance data [x, y, z, scale, dx, dy, dz, roll, u, v, blend]
    let instanceData = [];
    for (let bee of objects.bees) {
      instanceData.push(
        bee.pos[0],
        bee.pos[1],
        bee.pos[2],
        bee.size,
        bee.dir[0],
        bee.dir[1],
        bee.dir[2],
        bee.roll,
        bee.u,
        bee.v,
        bee.skinBlend,
      );
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.bees.instanceBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(instanceData),
      gl.DYNAMIC_DRAW,
    );

    // Draw using the divisors you initialized in initCache
    gl.drawElementsInstanced(
      gl.TRIANGLES,
      meshes.bees.indexCount,
      gl.UNSIGNED_SHORT,
      0,
      objects.bees.length,
    );
  }

  renderFlowers(gameState, nightFactor) {
    const { gl, glCache, programs } = this;
    const { flowers, viewMatrix } = gameState;

    gl.useProgram(programs.flower);
    gl.uniformMatrix4fv(glCache.flower_viewMatrix, false, viewMatrix);
    gl.uniform1f(glCache.flower_isNight, nightFactor);

    // If a flower was collected or grew, update the GPU buffer
    if (gameState.flags.UPDATE_FLOWER_MESH) {
      gl.bindBuffer(gl.ARRAY_BUFFER, flowers.mesh.vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flowers.mesh.verts, gl.DYNAMIC_DRAW);
      gameState.flags.UPDATE_FLOWER_MESH = false;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, flowers.mesh.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, flowers.mesh.indexBuffer);

    // Attribute pointers for flowers
    const stride = 32; // 8 floats * 4 bytes
    gl.vertexAttribPointer(
      glCache.flower_vertPos,
      3,
      gl.FLOAT,
      false,
      stride,
      0,
    );
    gl.vertexAttribPointer(
      glCache.flower_vertUV,
      4,
      gl.FLOAT,
      false,
      stride,
      12,
    );
    gl.vertexAttribPointer(
      glCache.flower_vertGoo,
      1,
      gl.FLOAT,
      false,
      stride,
      28,
    );

    gl.drawElements(
      gl.TRIANGLES,
      flowers.mesh.indexCount,
      gl.UNSIGNED_SHORT,
      0,
    );
  }

  renderParticles(gameState) {
    const { gl, glCache, programs } = this;
    const { meshes, viewMatrix } = gameState;

    if (meshes.particles.vertCount === 0) return;

    gl.useProgram(programs.particle);
    gl.uniformMatrix4fv(glCache.particle_viewMatrix, false, viewMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.particles.vertexBuffer);

    const stride = 36; // 9 floats * 4 bytes
    gl.vertexAttribPointer(
      glCache.particle_vertPos,
      3,
      gl.FLOAT,
      false,
      stride,
      0,
    );
    gl.vertexAttribPointer(
      glCache.particle_vertColor,
      4,
      gl.FLOAT,
      false,
      stride,
      12,
    );
    gl.vertexAttribPointer(
      glCache.particle_vertSize,
      1,
      gl.FLOAT,
      false,
      stride,
      28,
    );
    gl.vertexAttribPointer(
      glCache.particle_vertRot,
      1,
      gl.FLOAT,
      false,
      stride,
      32,
    );

    gl.drawArrays(gl.POINTS, 0, meshes.particles.vertCount);
  }

  renderTokens(gameState, nightFactor) {
    const { gl, glCache, programs } = this;
    const { objects, meshes, viewMatrix } = gameState;

    if (objects.tokens.length === 0) return;

    const program = programs.token;
    gl.useProgram(program);

    tokens.forEach((token) => {
      // 1. Select the texture based on type
      // These keys should match what you loaded in assetLoader.js
      const texture = this.textures[token.type] || this.textures["honey"];

      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

      // 2. Set uniforms for position and scale
      // CHQ: Gemini AI adds slight bobbing and rotation motion to tokens
      const bob = Math.sin(Date.now() * 0.005) * 0.2;
      const renderPos = [token.pos[0], token.pos[1] + bob, token.pos[2]];
      this.gl.uniform3fv(this.glCache.token.uPosition, renderPos);

      // Optional: Make boss loot slightly larger
      const scale = token.type === "ticket" ? 1.5 : 1.0;
      this.gl.uniform1f(this.glCache.token.uScale, scale);

      // 3. Draw the quad
      this.drawTokens(gameState);
    });
  }

  renderExplosions(gameState) {
    const { gl, glCache, programs } = this;
    const { objects, meshes } = gameState;

    if (objects.explosions.length === 0) return;

    gl.useProgram(programs.explosion);
    gl.uniformMatrix4fv(
      glCache.explosion_viewMatrix,
      false,
      gameState.viewMatrix,
    );

    let instanceData = new Float32Array(objects.explosions.length * 7);
    objects.explosions.forEach((exp, i) => {
      const offset = i * 7;
      instanceData.set(
        [
          exp.pos[0],
          exp.pos[1],
          exp.pos[2], // pos
          exp.color[0],
          exp.color[1],
          exp.color[2], // color
          exp.scale, // scale
        ],
        offset,
      );
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.explosion.instanceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, instanceData, gl.DYNAMIC_DRAW);

    gl.drawElementsInstanced(
      gl.TRIANGLES,
      meshes.explosion.indexCount,
      gl.UNSIGNED_SHORT,
      0,
      objects.explosions.length,
    );
  }

  // renderUI(gameState, dt) {
  //   const { player, TIME } = gameState;

  //   // Most of your UI is likely HTML-based, but floating numbers
  //   // in the 3D world use the textRenderer.
  //   if (this.textRenderer) {
  //     // Math.sin(TIME * 20) provides the 'wiggle' effect for floating text
  //     this.textRenderer.render(dt, Math.sin(TIME * 20));
  //   }

  //   // If you have a 2D canvas overlay for the joystick or HUD:
  //   // this.ctx.drawImage(this.gl.canvas, 0, 0);
  // }
}
