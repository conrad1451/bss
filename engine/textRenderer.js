// engine/textRenderer.js
import { MATH } from "../utils/math.js";

// CHQ: Gemini AI generated file

export class TextRenderer {
  constructor(gl, glCache, programs) {
    this.gl = gl;
    this.glCache = glCache;
    this.programs = programs;
    this.messages = []; // Stores active floating text

    // Character map for UV coordinates in the font atlas
    this.charMap =
      " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
  }

  // Logic from index.js for adding new floating text
  addMessage(text, pos, color = [1, 1, 1], size = 1) {
    this.messages.push({
      text,
      pos: [...pos],
      color,
      size,
      life: 1.0, // Decay timer
      offsetY: 0,
    });
  }

  update(dt) {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const m = this.messages[i];
      m.life -= dt * 0.5;
      m.offsetY += dt * 2; // Float upwards
      if (m.life <= 0) this.messages.splice(i, 1);
    }
  }

  render(dt, wobble) {
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
}
