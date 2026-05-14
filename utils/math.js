// export formatStat: (num, useAbv) => {
//   return useAbv ? MATH.abvNumber(num) : MATH.addCommas(num);
// };

export const MATH = {
  TWO_PI: Math.PI * 2,
  HALF_PI: Math.PI / 2,
  TO_RAD: Math.PI / 180,

  constrain: (val, min, max) => Math.max(min, Math.min(max, val)),

  lerp: (start, end, t) => start * (1 - t) + end * t,

  random: (min, max) => Math.random() * (max - min) + min,

  abvNumber: (num) => {
    if (num >= 1e12) {
      return (num / 1e12).toFixed(2).replace(/\.00$/, "") + "T"; // Trillion
    }
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2).replace(/\.00$/, "") + "B"; // Billion
    }
    if (num >= 1e6) {
      return (num / 1e6).toFixed(2).replace(/\.00$/, "") + "M"; // Million
    }
    if (num >= 1e3) {
      return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K"; // Thousand
    }
    return num.toString();
  },

  // Modern, cleaner implementation
  addCommas: (num) => {
    if (num === null || num === undefined) return "0";
    return Number(num).toLocaleString();
  },

  //   // Alternative regex version if you prefer manual string manipulation
  //   addCommasRegex: (num) => {
  //     return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  //   }

  pointInTriangle: (px, pz, x1, z1, x2, z2, x3, z3) => {
    // Calculate the area of the main triangle ABC
    const areaOrig = Math.abs(
      (x1 * (z2 - z3) + x2 * (z3 - z1) + x3 * (z1 - z2)) / 2.0,
    );

    // Calculate the area of triangle PBC
    const area1 = Math.abs(
      (px * (z2 - z3) + x2 * (z3 - pz) + x3 * (pz - z2)) / 2.0,
    );
    // Calculate the area of triangle PAC
    const area2 = Math.abs(
      (x1 * (pz - z3) + px * (z3 - z1) + x3 * (z1 - pz)) / 2.0,
    );
    // Calculate the area of triangle PAB
    const area3 = Math.abs(
      (x1 * (z2 - pz) + x2 * (pz - z1) + px * (z1 - z2)) / 2.0,
    );

    // If the sum of the three small areas equals the original area, the point is inside
    // We use a small epsilon (0.1) to account for floating point rounding errors
    return Math.abs(areaOrig - (area1 + area2 + area3)) < 0.1;
  },
};

export const mulberry32 = function (a) {
  let ret = function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  ret();
  ret();
  ret();
  ret();
  ret();
  ret();
  ret();
  ret();
  ret();
  ret();
  ret();
  ret();
  ret();
  ret();
  ret();
  ret();
  ret();
  ret();
  ret();
  ret();
  ret();
  ret();
  ret();
  ret();

  return ret;
};
