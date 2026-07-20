// utils/oldNoiseImplementation.js

let hash = (function () {
  let seed = (Math.random() * 2100000000) | 0;
  let PRIME32_2 = 1883677709;
  let PRIME32_3 = 2034071983;
  let PRIME32_4 = 668265263;
  let PRIME32_5 = 374761393;

  seedHash = function (s) {
    seed = s | 0;
  };

  return function (x, y) {
    let h32 = 0;

    h32 = (seed + PRIME32_5) | 0;
    h32 += 8;

    h32 += Math.imul(x, PRIME32_3);
    h32 = Math.imul((h32 << 17) | (h32 >> (32 - 17)), PRIME32_4);
    h32 += Math.imul(y, PRIME32_3);
    h32 = Math.imul((h32 << 17) | (h32 >> (32 - 17)), PRIME32_4);

    h32 ^= h32 >> 15;
    h32 *= PRIME32_2;
    h32 ^= h32 >> 13;
    h32 *= PRIME32_3;
    h32 ^= h32 >> 16;

    return h32 / 2147483647;
  };
})();

let currentRandom = null;
function Marsaglia(i1, i2) {
  // from http://www.math.uni-bielefeld.de/~sillke/ALGORITHMS/random/marsaglia-c
  let z = i1 | 0 || 362436069,
    w = i2 || (hash(521288629, z) * 2147483647) | 0;

  let nextInt = function () {
    z = (36969 * (z & 65535) + (z >>> 16)) & 0xffffffff;
    w = (18000 * (w & 65535) + (w >>> 16)) & 0xffffffff;
    return (((z & 0xffff) << 16) | (w & 0xffff)) & 0xffffffff;
  };

  this.nextDouble = function () {
    let i = nextInt() / 4294967296;
    return i < 0 ? 1 + i : i;
  };
  this.nextInt = nextInt;
}
let randomSeed = function (seed) {
  currentRandom = new Marsaglia(seed).nextDouble;
};
let random = function (min, max) {
  if (!max) {
    if (min) {
      max = min;
      min = 0;
    } else {
      min = 0;
      max = 1;
    }
  }
  return currentRandom() * (max - min) + min;
};
let noiseProfile = {
  generator: undefined,
  octaves: 4,
  fallout: 0.5,
  seed: undefined,
};
function PerlinNoise(seed) {
  let rnd =
    seed !== undefined ? new Marsaglia(seed) : Marsaglia.createRandomized();
  let i, j;
  // http://www.noisemachine.com/talk1/17b.html
  // http://mrl.nyu.edu/~perlin/noise/
  // generate permutation
  let perm = new Uint8Array(512);
  for (i = 0; i < 256; ++i) {
    perm[i] = i;
  }
  for (i = 0; i < 256; ++i) {
    let t = perm[(j = rnd.nextInt() & 0xff)];
    perm[j] = perm[i];
    perm[i] = t;
  }
  // copy to avoid taking mod in perm[0]
  for (i = 0; i < 256; ++i) {
    perm[i + 256] = perm[i];
  }

  function grad3d(i, x, y, z) {
    let h = i & 15; // convert into 12 gradient directions
    let u = h < 8 ? x : y,
      v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  function grad2d(i, x, y) {
    let v = (i & 1) === 0 ? x : y;
    return (i & 2) === 0 ? -v : v;
  }

  function grad1d(i, x) {
    return (i & 1) === 0 ? -x : x;
  }

  function lerp(t, a, b) {
    return a + t * (b - a);
  }

  this.noise3d = function (x, y, z) {
    let X = Math.floor(x) & 255,
      Y = Math.floor(y) & 255,
      Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    let fx = (3 - 2 * x) * x * x,
      fy = (3 - 2 * y) * y * y,
      fz = (3 - 2 * z) * z * z;
    let p0 = perm[X] + Y,
      p00 = perm[p0] + Z,
      p01 = perm[p0 + 1] + Z,
      p1 = perm[X + 1] + Y,
      p10 = perm[p1] + Z,
      p11 = perm[p1 + 1] + Z;
    return lerp(
      fz,
      lerp(
        fy,
        lerp(fx, grad3d(perm[p00], x, y, z), grad3d(perm[p10], x - 1, y, z)),
        lerp(
          fx,
          grad3d(perm[p01], x, y - 1, z),
          grad3d(perm[p11], x - 1, y - 1, z),
        ),
      ),
      lerp(
        fy,
        lerp(
          fx,
          grad3d(perm[p00 + 1], x, y, z - 1),
          grad3d(perm[p10 + 1], x - 1, y, z - 1),
        ),
        lerp(
          fx,
          grad3d(perm[p01 + 1], x, y - 1, z - 1),
          grad3d(perm[p11 + 1], x - 1, y - 1, z - 1),
        ),
      ),
    );
  };

  this.noise2d = function (x, y) {
    let X = Math.floor(x) & 255,
      Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    let fx = (3 - 2 * x) * x * x,
      fy = (3 - 2 * y) * y * y;
    let p0 = perm[X] + Y,
      p1 = perm[X + 1] + Y;
    return lerp(
      fy,
      lerp(fx, grad2d(perm[p0], x, y), grad2d(perm[p1], x - 1, y)),
      lerp(
        fx,
        grad2d(perm[p0 + 1], x, y - 1),
        grad2d(perm[p1 + 1], x - 1, y - 1),
      ),
    );
  };

  this.noise1d = function (x) {
    let X = Math.floor(x) & 255;
    x -= Math.floor(x);
    let fx = (3 - 2 * x) * x * x;
    return lerp(fx, grad1d(perm[X], x), grad1d(perm[X + 1], x - 1));
  };
}
let noiseSeed = function (seed) {
  noiseProfile.seed = seed;
  noiseProfile.generator = new PerlinNoise(noiseProfile.seed);
};

noiseSeed(0);

let noise = function (x, y, z) {
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
