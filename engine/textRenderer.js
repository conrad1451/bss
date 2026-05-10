// engine/textRenderer.js
import { MATH } from "../utils/math.js";

// CHQ: Gemini AI generated file

export class TextRenderer {
  constructor(gl, glCache, programs) {
    this.gl = gl;
    this.glCache = glCache;
    this.programs = programs;

    this.data = []; // Managed floating text (lifespan-based)
    this.instanceData = []; // Per-frame labels (cleared every frame)
    this.ctxData = []; // For 2D context drawing if needed [cite: 1417]

    this.charUV = {
      0: [0, 0],
      1: [0.1, 0],
      2: [0.2, 0],
      3: [0.3, 0],
      4: [0.4, 0],
      5: [0.5, 0],
      6: [0.59, 0],
      7: [0.7, 0],
      8: [0.79, 0],
      9: [0.89, 0],
      "+": [0.002, 0.13],
      "-": [0.002, 0.13],
      "⇆": [0.1, 0.14],
      ",": [0.2075, 0.14],
      "/": [0.3, 0.13],
      ".": [0.2075, 0.14],
      "-": [0.4, 0.13],
      ":": [0.5, 0.13],
      "(": [0.6, 0.13],
      ")": [0.68, 0.13],
      "%": [0.79, 0.12],
      ".": [0.885, 0.13],
      a: [0, 0.25],
      b: [0.1, 0.25],
      c: [0.2, 0.25],
      d: [0.3, 0.25],
      e: [0.4, 0.25],
      f: [0.5, 0.25],
      g: [0.6, 0.26],
      h: [0.69, 0.25],
      i: [0.81, 0.25],
      j: [0.9, 0.25],
      k: [0.025, 0.375],
      l: [0.11, 0.375],
      m: [0.2, 0.375],
      n: [0.31, 0.375],
      o: [0.4, 0.375],
      p: [0.5, 0.375],
      q: [0.6, 0.375],
      r: [0.7, 0.375],
      s: [0.8, 0.375],
      t: [0.9, 0.375],
      u: [0.02, 0.5],
      v: [0.108, 0.5],
      w: [0.2, 0.5],
      x: [0.305, 0.5],
      y: [0.4, 0.5],
      z: [0.5, 0.5],
      A: [0, 0.625],
      B: [0.1, 0.625],
      C: [0.2, 0.625],
      D: [0.3, 0.625],
      E: [0.4, 0.625],
      F: [0.5, 0.625],
      G: [0.6, 0.625],
      H: [0.7, 0.625],
      I: [0.8, 0.625],
      J: [0.9, 0.625],
      K: [0.01, 0.75],
      L: [0.1, 0.75],
      M: [0.2, 0.75],
      N: [0.3, 0.75],
      O: [0.4, 0.75],
      P: [0.5, 0.75],
      Q: [0.6, 0.75],
      R: [0.7, 0.75],
      S: [0.8, 0.75],
      T: [0.9, 0.75],
      U: [0.02, 0.875],
      V: [0.1, 0.875],
      W: [0.2, 0.875],
      X: [0.3, 0.875],
      Y: [0.4, 0.875],
      Z: [0.5, 0.875],
      " ": [0.7, 0.875],
    };

    // Initialize WebGL Buffers
    this.instanceBuffer = gl.createBuffer();
    this.vertBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();
    this.decal_vertBuffer = gl.createBuffer();
    this.decal_indexBuffer = gl.createBuffer();

    this.messages = []; // Stores active floating text

    // Character map for UV coordinates in the font atlas
    this.charMap =
      " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

    this._initStaticBuffers();
  }

  _initStaticBuffers() {
    const gl = this.gl;

    // Define the geometry for a single character quad [cite: 1408, 1409]
    let w = 0.09,
      h = 0.105,
      fx = 0.002,
      fy = -0.8955;
    let v = [
      -w,
      -h,
      fx,
      fy,
      w,
      -h,
      w + fx,
      fy,
      w,
      h,
      w + fx,
      -h / (600 / 512) + fy,
      -w,
      h,
      fx,
      -h / (600 / 512) + fy,
    ];
    let i = [0, 1, 2, 2, 3, 0];
    let eps = 2 / 1024;

    // Standard Text Buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(i), gl.STATIC_DRAW);

    this.indexAmount = i.length;

    // Decal Buffers (Rectangles/Icons) [cite: 1410]
    let dv = [
      -0.5,
      -0.5,
      128 / 1024 - eps,
      0 + eps,
      0.5,
      -0.5,
      0 + eps,
      0 + eps,
      0.5,
      0.5,
      0 + eps,
      128 / 1024 - eps,
      -0.5,
      0.5,
      128 / 1024 - eps,
      128 / 1024 - eps,
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, this.decal_vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dv), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.decal_indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(i), gl.STATIC_DRAW);

    this.decal_indexAmount = i.length;
  }

  // Logic from index.js for adding new floating text
  // addMessage(text, pos, color = [1, 1, 1], size = 1) {
  //   this.messages.push({
  //     text,
  //     pos: [...pos],
  //     color,
  //     size,
  //     life: 1.0, // Decay timer
  //     offsetY: 0,
  //   });
  // }

  update(dt) {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const m = this.messages[i];
      m.life -= dt * 0.5;
      m.offsetY += dt * 2; // Float upwards
      if (m.life <= 0) this.messages.splice(i, 1);
    }
  }
  /**
   * Adds temporary floating text (e.g., Pollen collection numbers)
   * Refactored from Original source: 1414-1415
   */
  add(
    message,
    pos,
    color,
    critType,
    prefix = "+",
    scale = 1,
    addCommas = true,
  ) {
    let m, s;
    const msgStr = message.toString();

    // Logic for abbreviations or commas based on player settings
    if (addCommas) {
      // This part usually references player settings for abbreviations
      m = prefix + msgStr;
      s = (m.length * 0.2 + 1.5) * scale;
    } else {
      m = msgStr;
      s = scale;
    }

    // Pack data for each character into the temporary data array
    for (let i = 0; i < m.length; i++) {
      const char = m[i];
      if (!this.charUV[char]) continue;

      this.data.push({
        critType: critType,
        life: 1.0, // Floating text decay timer
        uv: this.charUV[char],
        pos: [...pos],
        col: [color[0] * (1 / 255), color[1] * (1 / 255), color[2] * (1 / 255)],
        // Offset characters so they don't overlap [cite: 1415]
        offset: [(i - (m.length - 1) * 0.5) * 0.135, 0],
        size: s,
      });
    }
  }

  /**
   * Adds persistent or single-frame text (e.g., Mob HP or Labels)
   * Refactored from Original source: 1416-1417
   */
  addSingle(
    message,
    pos,
    color,
    scale = 1,
    splitCommas = true,
    addCommas = true,
    offx = 0,
    offy = 0,
  ) {
    let m = message.toString();
    let s = scale > 0 ? (m.length * 0.2 + 1.5) * scale : -scale;

    for (let i = 0; i < m.length; i++) {
      const char = m[i];
      if (!this.charUV[char]) continue;

      // Push directly to instanceData array for the current frame
      this.instanceData.push(
        pos[0],
        pos[1],
        pos[2], // Origin
        (i - (m.length - 1) * 0.5) * (offx || 0.135), // X Offset
        offy, // Y Offset
        this.charUV[char][0], // U
        this.charUV[char][1], // V
        color[0] * (1 / 255),
        color[1] * (1 / 255),
        color[2] * (1 / 255), // RGB
        s,
        s, // Scale XY
        0, // Rotation [cite: 1417]
      );
    }
  }

  /**
   * Adds 2D context text if using a secondary UI overlay
   * Refactored from Original source: 1417
   */
  addCTX(message, pos, color, scale) {
    this.ctxData.push({
      message: message,
      pos: [...pos],
      color: `rgb(${color[0]},${color[1]},${color[2]})`,
      scale: scale,
    });
  }

  renderAlt(dt, wobble) {
    const { gl, glCache, programs } = this;
    if (this.messages.length === 0) return;

    gl.useProgram(programs.text);

    // Prepare instance data for all characters in all messages
    let instanceData = [];
    this.messages.forEach((m) => {
      // Logic from your index.js to calculate UVs and offsets per char
      // ...
    });

    // Update the text instance buffer
    // gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instanceData), gl.DYNAMIC_DRAW);

    // Draw the text
    // gl.drawElementsInstanced(...);
  }

  render(dt, SIN_TIME, viewMatrix) {
    const gl = this.gl;
    const cache = this.glCache;

    gl.useProgram(this.programs.text);
    gl.uniformMatrix4fv(cache.text_viewMatrix, false, viewMatrix);

    // 1. Process managed floating text data [cite: 1440-1443]
    let t = SIN_TIME * 0.5 + 0.5;
    for (let i = this.data.length - 1; i >= 0; i--) {
      let d = this.data[i];
      let s = d.size * Math.min(d.life * 7, 1);
      d.life -= dt;

      // Color/Wobble logic based on critType [cite: 1441-1443]
      let r = d.col[0],
        g = d.col[1],
        b = d.col[2],
        rot = 0;
      if (d.critType === 1) {
        g = MATH.lerp(1, d.col[1], t);
        rot = SIN_TIME * 0.4;
      } else if (d.critType === 2) {
        r = MATH.lerp(0.7, d.col[0], t);
        rot = SIN_TIME * 0.4;
      }

      this.instanceData.push(
        d.pos[0],
        d.pos[1],
        d.pos[2],
        d.offset[0],
        d.offset[1],
        d.uv[0],
        d.uv[1],
        r,
        g,
        b,
        s,
        s,
        rot,
      );

      if (d.life <= 0) this.data.splice(i, 1);
    }

    // 2. Upload to GPU and Draw [cite: 1444-1446]
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.vertexAttribPointer(cache.text_vertPos, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(cache.text_vertUV, 2, gl.FLOAT, false, 16, 8);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.instanceData),
      gl.DYNAMIC_DRAW,
    );

    // Stride is 13 floats (52 bytes) [cite: 1444-1445]
    gl.vertexAttribPointer(
      cache.text_instanceOrigin,
      3,
      gl.FLOAT,
      false,
      52,
      0,
    );
    gl.vertexAttribDivisor(cache.text_instanceOrigin, 1);
    gl.vertexAttribPointer(
      cache.text_instanceOffset,
      2,
      gl.FLOAT,
      false,
      52,
      12,
    );
    gl.vertexAttribDivisor(cache.text_instanceOffset, 1);
    gl.vertexAttribPointer(cache.text_instanceUV, 2, gl.FLOAT, false, 52, 20);
    gl.vertexAttribDivisor(cache.text_instanceUV, 1);
    gl.vertexAttribPointer(
      cache.text_instanceColor,
      3,
      gl.FLOAT,
      false,
      52,
      28,
    );
    gl.vertexAttribDivisor(cache.text_instanceColor, 1);
    gl.vertexAttribPointer(cache.text_instanceInfo, 3, gl.FLOAT, false, 52, 40);
    gl.vertexAttribDivisor(cache.text_instanceInfo, 1);

    gl.drawElementsInstanced(
      gl.TRIANGLES,
      this.indexAmount,
      gl.UNSIGNED_SHORT,
      0,
      this.instanceData.length / 13,
    );

    // Reset divisors and clear frame data
    gl.vertexAttribDivisor(cache.text_instanceOrigin, 0);
    gl.vertexAttribDivisor(cache.text_instanceOffset, 0);
    gl.vertexAttribDivisor(cache.text_instanceUV, 0);
    gl.vertexAttribDivisor(cache.text_instanceColor, 0);
    gl.vertexAttribDivisor(cache.text_instanceInfo, 0);
    this.instanceData = [];
  }
}
