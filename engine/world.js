// engine/world.js
import { MATH } from "../utils/math.js";
import { textRenderer } from "./textRenderer.js"; // For floating numbers
import { flowers, fieldInfo, objects } from "./state.js"; // If using a central state file

import { addFlower } from "./flowerBuilder.js";
import { gameState } from "../state/gameState.js";

import { FIELD_CONFIGS } from "../data/fieldData.js";
// export function collectPollen(params) {
//   // Use gameState.player and gameState.fieldInfo directly
//   if (gameState.player.pollen >= gameState.player.capacity) return 0;
//   // ... rest of logic
// }

export function collectPollen(params, gameState) {
  const { player, fieldInfo, flowers, objects } = gameState;

  // Now you have everything required to run the logic:
  //   const currentField = fieldInfo[params.field || player.fieldIn];
  //   const flower = flowers[currentField.name][params.z][params.x];

  // 1. Guard Clauses: Ensure we are in a field and have a pattern
  const fieldName = params.field || player.fieldIn;
  if (
    !fieldName ||
    !fieldInfo[fieldName] ||
    player.pollen >= player.capacity ||
    params.pattern.length < 1
  ) {
    return 0;
  }

  //   const f = fieldInfo[params.field || player.fieldIn];
  //   const { x, z, pattern, amount: baseAmount } = params;

  const f = fieldInfo[fieldName];
  const { x, z, pattern, amount: baseAmount } = params;

  // 2. Determine Critical Hits
  const crit = {
    r:
      params.alwaysCrit || Math.random() < player.criticalChance
        ? Math.random() < player.superCritChance
          ? 2
          : 1
        : 0,
    b:
      params.alwaysCrit || Math.random() < player.criticalChance
        ? Math.random() < player.superCritChance
          ? 2
          : 1
        : 0,
    w:
      params.alwaysCrit || Math.random() < player.criticalChance
        ? Math.random() < player.superCritChance
          ? 2
          : 1
        : 0,
  };

  // 3. Apply Global Multipliers
  const multiplier = {
    r:
      (params.multiplier?.r || params.multiplier || 1) *
      player.redPollen *
      (crit.r === 0
        ? 1
        : crit.r === 1
          ? player.criticalPower
          : player.criticalPower * player.superCritPower),
    b:
      (params.multiplier?.b || params.multiplier || 1) *
      player.bluePollen *
      (crit.b === 0
        ? 1
        : crit.b === 1
          ? player.criticalPower
          : player.criticalPower * player.superCritPower),
    w:
      (params.multiplier?.w || params.multiplier || 1) *
      player.whitePollen *
      (crit.w === 0
        ? 1
        : crit.w === 1
          ? player.criticalPower
          : player.criticalPower * player.superCritPower),
  };

  // 4. Calculate Instant Conversion Rates
  const instantConversion = {
    r:
      crit.r === 2
        ? 1
        : params.instantConversion
          ? (player.instantRedConversion - 1) * params.instantConversion + 1
          : player.instantRedConversion,
    b:
      crit.b === 2
        ? 1
        : params.instantConversion
          ? (player.instantBlueConversion - 1) * params.instantConversion + 1
          : player.instantBlueConversion,
    w:
      crit.w === 2
        ? 1
        : params.instantConversion
          ? (player.instantWhiteConversion - 1) * params.instantConversion + 1
          : player.instantWhiteConversion,
  };

  let accum = { r: 0, b: 0, w: 0 };
  let otherAccum = { r: 0, b: 0, w: 0 };
  let totalGoo = 0;

  // 5. Flower Collection Loop
  pattern.forEach((p) => {
    const fx = x + p[0];
    const fz = z + p[1];

    // Boundary Check
    if (fx >= 0 && fx < f.width && fz >= 0 && fz < f.length) {
      const flower = flowers[f.name][fz][fx];
      const colorKey = flower.color[0]; // 'r', 'b', or 'w'

      let amountToCollect = Math.min(
        baseAmount[colorKey] || baseAmount,
        flower.height * 100,
      );

      // Update flower height/goo
      flower.height -= params.depleteAll
        ? flower.height
        : (amountToCollect * 0.01) / ((flower.level - 1) * 0.2 + 1);

      if (params.replenish) flower.height += params.replenish;
      if (params.gooTrail) flower.goo = 1;

      amountToCollect *= multiplier[colorKey] * flower.level;

      if (flower.goo) {
        amountToCollect *= player.goo;
        totalGoo += amountToCollect;
      }

      // Route pollen to Balloons, Puffshrooms, or Player
      if (flower.balloon) {
        flower.balloon.pollen +=
          amountToCollect * (flower.color === "blue" ? 1.2 : 1.1);
        otherAccum[colorKey] +=
          amountToCollect * (1 - instantConversion[colorKey]);
      } else if (flower.puffshrooms.length) {
        flower.puffshrooms.forEach((ps) => (ps.pollen += amountToCollect));
        otherAccum[colorKey] +=
          amountToCollect * (1 - instantConversion[colorKey]);
      } else {
        accum[colorKey] += amountToCollect;
      }
    }
  });

  // 6. Final State Updates
  const totalHoneyGenerated =
    (accum.r * instantConversion.r +
      accum.b * instantConversion.b +
      accum.w * instantConversion.w +
      totalGoo * 0.1) *
    player.honeyPerPollen;

  player.honey += Math.ceil(totalHoneyGenerated);

  // Calculate what goes into the bag after instant conversion
  const bagGain = Math.ceil(
    accum.r * (1 - instantConversion.r) +
      accum.b * (1 - instantConversion.b) +
      accum.w * (1 - instantConversion.w),
  );

  player.pollen = Math.min(player.pollen + bagGain, player.capacity);
  // 7. Trigger UI Text (if enabled)
  if (player.extraInfo.enablePollenText) {
    // Call your refactored TextRenderer module here...
  }

  // 8. Update Global Stats
  const totalCollected =
    accum.r + accum.b + accum.w + otherAccum.r + otherAccum.b + otherAccum.w;
  player.stats.redPollen += accum.r + otherAccum.r;
  player.stats.bluePollen += accum.b + otherAccum.b;
  player.stats.whitePollen += accum.w + otherAccum.w;

  player.stats.totalPollen += totalCollected; // CHQ: Gemini AI added

  player.stats.goo += totalGoo;
  player.stats["pollenFrom" + f.name] += totalCollected;
  player.stats.pollen += totalCollected; // CHQ: may be redundant, may remove later

  return Math.round(totalCollected);
}
export function createField(name, config, gameState, meshData) {
  const { player, fieldInfo, flowers } = gameState;

  // Set initial field stats
  player.stats["pollenFrom" + name] = 0;

  // Config initialization
  fieldInfo[name] = {
    x: config.x,
    y: config.y,
    z: config.z,
    width: config.w,
    length: config.l,
    getColor: config.colorLogic,
    getLevel: config.levelLogic,
    haze: {},
    generalColorComp: config.composition,
    nectarType: config.nectar + "Nectar",
    degration: 0,
    corruption: 0,
  };

  flowers[name] = [];

  // Loop through coordinates and build flowers
  for (let fx = 0; fx < config.w; fx++) {
    for (let fz = 0; fz < config.l; fz++) {
      addFlower(name, fx, fz, gameState, meshData);
    }
  }
}

export function updateFlower(
  field,
  x,
  z,
  func,
  updateHeight,
  updateGoo,
  updatePollination,
) {
  const { flowers } = gameState;
  const flower = flowers.data[field][z][x]; // Access the specific flower data

  func(flower);

  flower.height = MATH.constrain(flower.height, 0, 1);

  let i = flower.id * 64;
  // This flag needs to be part of your gameState or imported
  gameState.flags.UPDATE_FLOWER_MESH = true;

  if (updateHeight) {
    let newHeight = flower.y + Math.max(flower.height * 0.5, 0.05);
    flowers.mesh.verts[i + 1] = newHeight;
    flowers.mesh.verts[i + 9] = newHeight;
    flowers.mesh.verts[i + 17] = newHeight;
    flowers.mesh.verts[i + 25] = newHeight;

    newHeight = Math.max(flowers[field][z][x].height, 0);

    flowers.mesh.verts[i + 5] = newHeight;
    flowers.mesh.verts[i + 13] = newHeight;
    flowers.mesh.verts[i + 21] = newHeight;
    flowers.mesh.verts[i + 29] = newHeight;
  }

  if (updateGoo) {
    let g = flower.goo * flower.gooColor * 0.7;
    flowers.mesh.verts[i + 7] = g;
    flowers.mesh.verts[i + 15] = g;
    flowers.mesh.verts[i + 23] = g;
    flowers.mesh.verts[i + 31] = g;
  }

  if (updatePollination) {
    let tx,
      ty,
      lvl = flowers[field][z][x].level;

    switch (flowers[field][z][x].color) {
      case "red":
        if (lvl === 1) {
          tx = 0;
          ty = 0;
        } else if (lvl === 2) {
          tx = (256 * 3) / 1024;
          ty = 0;
        } else if (lvl === 3) {
          tx = (256 * 2) / 1024;
          ty = 256 / 1024;
        } else if (lvl === 4) {
          tx = 256 / 1024;
          ty = (256 * 2) / 1024;
        } else if (lvl >= 5) {
          tx = 0;
          ty = (256 * 3) / 1024;
        }
        break;

      case "blue":
        if (lvl === 1) {
          tx = 256 / 1024;
          ty = 0;
        } else if (lvl === 2) {
          tx = 0;
          ty = 256 / 1024;
        } else if (lvl === 3) {
          tx = (256 * 3) / 1024;
          ty = 256 / 1024;
        } else if (lvl === 4) {
          tx = (256 * 2) / 1024;
          ty = (256 * 2) / 1024;
        } else if (lvl >= 5) {
          tx = 256 / 1024;
          ty = (256 * 3) / 1024;
        }
        break;

      case "white":
        if (lvl === 1) {
          tx = (256 * 2) / 1024;
          ty = 0;
        } else if (lvl === 2) {
          tx = 256 / 1024;
          ty = 256 / 1024;
        } else if (lvl === 3) {
          tx = 0;
          ty = (256 * 2) / 1024;
        } else if (lvl === 4) {
          tx = (256 * 3) / 1024;
          ty = (256 * 2) / 1024;
        } else if (lvl >= 5) {
          tx = (256 * 2) / 1024;
          ty = (256 * 3) / 1024;
        }
        break;
    }

    flowers.mesh.verts[i + 3] = texOffset + tx;
    flowers.mesh.verts[i + 4] = texOffset + ty;
    flowers.mesh.verts[i + 11] = texSize + tx;
    flowers.mesh.verts[i + 12] = texOffset + ty;
    flowers.mesh.verts[i + 19] = texSize + tx;
    flowers.mesh.verts[i + 20] = texSize + ty;
    flowers.mesh.verts[i + 27] = texOffset + tx;
    flowers.mesh.verts[i + 28] = texSize + ty;
  }
}

export function initFields(gameState, meshData) {
  FIELD_CONFIGS.forEach((config) => {
    createField(config.name, config, gameState, meshData);
  });
}
