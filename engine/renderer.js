// engine/renderer.js

// CHQ: Claude AI generated this file

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
  }

  // Refactored from index.js (Line 2450)
  createProgram(vshSource, fshSource) {
    const gl = this.gl;
    const vsh = gl.createShader(gl.VERTEX_SHADER);
    const fsh = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vsh, vshSource);
    gl.shaderSource(fsh, fshSource);
    gl.compileShader(vsh);
    gl.compileShader(fsh);

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
    this.glCache.token_instancePos = this.gl.getAttribLocation(
      programs.token,
      "instance_pos",
    );
    this.gl.enableVertexAttribArray(this.glCache.token_instancePos);
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

  render(gameState) {
    const gl = this.gl;
    // 1. Clear the screen
    gl.clearColor(...gameState.player.skyColor, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 2. Bind textures (effects, bees, etc.)

    // 3. Draw Static Geometry (Map)

    // 4. Draw Dynamic Geometry (Bees, Mobs, Tokens)
    // Use gameState.objects.bees.forEach(...)
  }
}
