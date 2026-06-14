// engine/particles.js

// CHQ: Claude AI (Sonnet) generated file

/**
 * Manages the lifecycle and GPU upload of all transient visual particles
 * (sparkles, bursts, ambient effects spawned by bees/mobs/etc).
 *
 * Usage:
 *   - Call `ParticleRenderer.init(gl, program)` once, after the particle
 *     shader program is compiled.
 *   - Anywhere in entity code: `ParticleRenderer.add({ x, y, z, vx, vy, vz,
 *     grav, size, col, life, rotVel, alpha })`.
 *   - Each frame: `ParticleRenderer.update(dt)` then
 *     `ParticleRenderer.render(viewMatrix, projectionMatrix)`.
 */
class ParticleRendererClass {
  constructor() {
    this.particles = [];

    this.gl = null;
    this.program = null;
    this.vao = null;
    this.vertexBuffer = null;

    this.viewLoc = null;
    this.projLoc = null;
  }

  /**
   * Wires this renderer up to a GL context and the compiled particle
   * shader program. Sets up a VAO with attribute pointers matching the
   * `particleRendererVSH` layout: vertPos(3), vertColor(4), vertSize(1),
   * vertRot(1) — stride 36 bytes / 9 floats per particle.
   */
  init(gl, program) {
    this.gl = gl;
    this.program = program;

    this.viewLoc = gl.getUniformLocation(program, "viewMatrix");
    this.projLoc = gl.getUniformLocation(program, "projMatrix");

    this.vao = gl.createVertexArray();
    this.vertexBuffer = gl.createBuffer();

    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    const stride = 9 * 4; // 9 floats per particle, 4 bytes each

    const posLoc = gl.getAttribLocation(program, "vertPos");
    const colLoc = gl.getAttribLocation(program, "vertColor");
    const sizeLoc = gl.getAttribLocation(program, "vertSize");
    const rotLoc = gl.getAttribLocation(program, "vertRot");

    if (posLoc !== -1) {
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, stride, 0);
    }
    if (colLoc !== -1) {
      gl.enableVertexAttribArray(colLoc);
      gl.vertexAttribPointer(colLoc, 4, gl.FLOAT, false, stride, 12);
    }
    if (sizeLoc !== -1) {
      gl.enableVertexAttribArray(sizeLoc);
      gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, stride, 28);
    }
    if (rotLoc !== -1) {
      gl.enableVertexAttribArray(rotLoc);
      gl.vertexAttribPointer(rotLoc, 1, gl.FLOAT, false, stride, 32);
    }

    gl.bindVertexArray(null);
  }

  /**
   * Queues a new particle.
   *
   * @param {Object} p
   * @param {number} p.x - World X position.
   * @param {number} p.y - World Y position.
   * @param {number} p.z - World Z position.
   * @param {number} [p.vx=0] - X velocity.
   * @param {number} [p.vy=0] - Y velocity.
   * @param {number} [p.vz=0] - Z velocity.
   * @param {number} [p.grav=0] - Gravity acceleration applied to vy each second.
   * @param {number} [p.size=50] - Particle size (in the units the shader expects).
   * @param {number[]} [p.col=[1,1,1]] - RGB color, each channel 0-1.
   * @param {number} [p.life=1] - Remaining lifetime in seconds.
   * @param {number} [p.rotVel=0] - Rotation speed in radians/sec.
   * @param {number} [p.alpha=1] - Fade-rate multiplier (see render()).
   */
  add(p) {
    this.particles.push({
      pos: [p.x, p.y, p.z],
      vel: [p.vx || 0, p.vy || 0, p.vz || 0],
      grav: p.grav || 0,
      size: p.size !== undefined ? p.size : 50,
      col: p.col || [1, 1, 1],
      life: p.life !== undefined ? p.life : 1,
      rotVel: p.rotVel || 0,
      rot: 0,
      alpha: p.alpha !== undefined ? p.alpha : 1,
    });
  }

  /**
   * Advances all particles by `dt` seconds: integrates position by velocity,
   * applies gravity to vertical velocity, advances rotation, and decrements
   * lifetime. Particles with `life <= 0` are removed.
   *
   * @param {number} dt - Delta time in seconds.
   */
  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const part = this.particles[i];

      part.pos[0] += part.vel[0] * dt;
      part.pos[1] += part.vel[1] * dt;
      part.pos[2] += part.vel[2] * dt;

      part.vel[1] += part.grav * dt;

      part.rot += part.rotVel * dt;

      part.life -= dt;

      if (part.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Packs all live particles into the GPU buffer and draws them as point
   * sprites using the particle shader program.
   *
   * @param {Float32Array|number[]} viewMatrix - Column-major 4x4 view matrix.
   * @param {Float32Array|number[]} projMatrix - Column-major 4x4 projection matrix.
   */
  render(viewMatrix, projMatrix) {
    const gl = this.gl;
    if (!gl || !this.program || !this.particles.length) return;

    const data = new Float32Array(this.particles.length * 9);

    for (let i = 0; i < this.particles.length; i++) {
      const part = this.particles[i];
      const o = i * 9;

      // NOTE: alpha is treated as a fade-rate multiplier — current alpha
      // fades toward 0 as `life` runs out. Adjust this formula if the
      // visual result doesn't match the original game's particle fades.
      const a = Math.min(Math.max(part.alpha * part.life, 0), 1);

      data[o + 0] = part.pos[0];
      data[o + 1] = part.pos[1];
      data[o + 2] = part.pos[2];
      data[o + 3] = part.col[0];
      data[o + 4] = part.col[1];
      data[o + 5] = part.col[2];
      data[o + 6] = a;
      data[o + 7] = part.size;
      data[o + 8] = part.rot;
    }

    gl.useProgram(this.program);

    if (this.viewLoc) gl.uniformMatrix4fv(this.viewLoc, false, viewMatrix);
    if (this.projLoc) gl.uniformMatrix4fv(this.projLoc, false, projMatrix);

    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

    gl.drawArrays(gl.POINTS, 0, this.particles.length);

    gl.bindVertexArray(null);
  }
}

export const ParticleRenderer = new ParticleRendererClass();
