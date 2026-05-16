// engine/noise.js

// CHQ: Gemini AI generated

// Simple 2D Pseudo-random noise function
export function noise(x, y) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
  return n - Math.floor(n);
}
