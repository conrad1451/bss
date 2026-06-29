// engine/engineParts/setUniform.js

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
export function setUniform(
  theGl,
  glCache,
  thePrograms,
  program,
  name,
  value,
  type = null,
) {
  //   const gl = this.gl;
  const gl = theGl;

  // CHQ: Gemini AI added
  // Check cache first, fall back to GPU lookup only if missing
  //   const programKey = Object.keys(this.programs).find(
  //     (k) => this.programs[k] === program,
  //   );
  const programKey = Object.keys(thePrograms).find(
    (k) => thePrograms[k] === program,
  );
  //   const cached = programKey && this.glCache[programKey]?.[name];

  const cached = programKey && glCache[programKey]?.[name];
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
