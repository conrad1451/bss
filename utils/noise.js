// utils/noise.js

import { PerlinNoise } from "./PerlinNoise";

let noiseProfile = {
  generator: undefined,
  octaves: 4,
  fallout: 0.5,
  seed: undefined,
};

export let noiseSeed = function (seed) {
  noiseProfile.seed = seed;
  noiseProfile.generator = new PerlinNoise(noiseProfile.seed);
};
noiseSeed(0);

// CHQ: Claude AI (Sonnet) made to be used in place of noiseSeed,
// in case we anticipate multiple independent noise fields (terrain vs. flowers vs. particles)
// export function createNoise(seed, octaves = 4, fallout = 0.5) {
//   const generator = new PerlinNoise(seed);
//   return function noise(x, y, z) { /* same octave-summing logic, closed over this generator/octaves/fallout */ };
// }

export let noise = function (x, y, z) {
  let generator = noiseProfile.generator;
  let effect = 1,
    k = 1,
    sum = 0;
  for (let i = 0; i < noiseProfile.octaves; ++i) {
    effect *= noiseProfile.fallout;
    switch (arguments.length) {
      case 1:
        sum += (effect * (1 + generator.noise1d(k * x))) / 2;
        break;
      case 2:
        sum += (effect * (1 + generator.noise2d(k * x, k * y))) / 2;
        break;
      case 3:
        sum += (effect * (1 + generator.noise3d(k * x, k * y, k * z))) / 2;
        break;
    }
    k *= 2;
  }
  return sum;
};
