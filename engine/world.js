// engine/world.js
import { MATH } from "../utils/math.js";
// import { textRenderer } from "./textRenderer.js"; // For floating numbers
// import { flowers, fieldInfo, objects } from "../state/gameState.js";

import { addFlower } from "./flowerBuilder.js";

/**
 * Collects pollen from a pattern of flowers in a given field and applies
 * all relevant multipliers, critical hits, instant conversion, and stat tracking.
 *
 * @param {Object} params - Collection parameters.
 * @param {string} [params.field] - The name of the field to collect from.
 *   Falls back to `gameState.player.fieldIn` if omitted.
 * @param {number} params.x - The X coordinate of the center flower in the pattern.
 * @param {number} params.z - The Z coordinate of the center flower in the pattern.
 * @param {Array<[number, number]>} params.pattern - Array of [dx, dz] offsets
 *   defining which flowers relative to (x, z) to collect from.
 * @param {number|{r: number, b: number, w: number}} params.amount - Base pollen
 *   amount per flower. Can be a flat number or a per-color object.
 * @param {number} [params.multiplier] - Optional flat or per-color multiplier
 *   applied on top of player stats.
 * @param {boolean} [params.alwaysCrit] - If true, every collection is treated
 *   as a critical hit.
 * @param {boolean} [params.depleteAll] - If true, drains the flower to zero height.
 * @param {number} [params.replenish] - Amount to add back to flower height after
 *   depletion (e.g. for planters).
 * @param {boolean} [params.gooTrail] - If true, marks collected flowers as goo'd.
 * @param {number} [params.instantConversion] - Scales how much of the collected
 *   pollen converts to honey immediately rather than going into the bag.
 * @param {number} [params.stackHeight] - Unused in this scope; passed through for
 *   callers that use it (e.g. target practice).
 * @param {string} [params.field] - Explicit field override; defaults to player's
 *   current field.
 * @param {Object} gameState - The master game state object.
 * @param {Object} gameState.player - The player instance.
 * @param {Object} gameState.fieldInfo - Map of field name → field config/metadata.
 * @param {Object} gameState.flowers - Nested map of field → row → column flower data.
 * @param {Object} gameState.objects - Live entity arrays (tokens, explosions, etc.).
 * @returns {number} The total rounded pollen collected across all flowers and colors,
 *   or `0` if collection was invalid (e.g. bag full, bad field, empty pattern).
 */
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
    player.pollenInBag >= player.capacity ||
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

  player.pollenInBag = Math.min(player.pollenInBag + bagGain, player.capacity);
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

  // CHQ: Gemini AI added code for field-specific boosts
  // Apply Field-Specific Boost
  const fieldBoost = player.fieldBoosts[f.name] || 1;
  const boostedPollen = totalCollected * fieldBoost;

  player.pollenInBag = Math.min(
    player.capacity,
    (player.pollenInBag || 0) + boostedPollen,
  );
  player.stats.totalPollen += boostedPollen; // CHQ: Gemini AI added

  player.stats.goo += totalGoo;
  player.stats["pollenFrom" + f.name] =
    (player.stats["pollenFrom" + f.name] || 0) + boostedPollen;

  return Math.round(totalCollected);
}

/**
 * Initializes a named flower field: registers its metadata in `fieldInfo`,
 * allocates the `flowers` grid, and populates every cell via `addFlower`.
 *
 * @param {string} name - Unique identifier for this field (e.g. `"SunflowerField"`).
 * @param {Object} config - Field layout and behavior configuration.
 * @param {number} config.x - World-space X origin of the field.
 * @param {number} config.y - World-space Y (height) origin of the field.
 * @param {number} config.z - World-space Z origin of the field.
 * @param {number} config.w - Width of the field in flower units.
 * @param {number} config.l - Length of the field in flower units.
 * @param {Function} config.colorLogic - Function that returns a color key
 *   (`"red"`, `"blue"`, or `"white"`) for a given (x, z) position.
 * @param {Function} config.levelLogic - Function that returns a level (1–5)
 *   for a given (x, z) position.
 * @param {string} config.composition - General color composition descriptor.
 * @param {string} config.nectar - Nectar type prefix (will be suffixed with `"Nectar"`).
 * @param {Object} gameState - The master game state object.
 * @param {Object} gameState.player - The player instance (used to initialize stat tracking).
 * @param {Object} gameState.fieldInfo - Map that will receive the new field's metadata entry.
 * @param {Object} gameState.flowers - Map that will receive the new field's flower grid.
 * @param {Object} meshData - Staging mesh data passed through to `addFlower` so each
 *   flower can push its vertices into the shared GPU mesh buffer.
 * @returns {void}
 */
export function createField(name, config, gameState, meshData) {
  const { player, fieldInfo, flowers } = gameState;

  // ✅ Fixed: Only initialize the pollen tracking stat if the player object actually exists!
  if (player && player.stats) {
    player.stats["pollenFrom" + name] = 0;
  }

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

/**
 * Mutates a single flower's data via a callback, then syncs the affected vertex
 * attributes (height, goo, pollination/UV) in the shared flower mesh vertex array.
 * Sets `gameState.flags.UPDATE_FLOWER_MESH` to trigger a GPU re-upload next frame.
 *
 * @param {string} field - The name of the field that owns the target flower.
 * @param {number} x - Column index of the flower within its field grid.
 * @param {number} z - Row index of the flower within its field grid.
 * @param {Function} func - Callback invoked with the flower object, allowing
 *   arbitrary in-place mutations before vertex data is recalculated.
 * @param {boolean} updateHeight - If true, recalculates and writes the four
 *   Y-position vertices for this flower's quad based on `flower.height`.
 * @param {boolean} updateGoo - If true, recalculates and writes the per-vertex
 *   goo scalar based on `flower.goo` and `flower.gooColor`.
 * @param {boolean} updatePollination - If true, looks up the correct texture atlas
 *   UV offset for the flower's current color and level, then writes all eight UV
 *   floats into the vertex array.
 * @param {Object} gameState - The master game state object.
 * @param {Object} gameState.flowers - Nested flower data and the shared `.mesh.verts`
 *   Float32 vertex array to be patched.
 * @param {Object} gameState.flags - Engine flags; `UPDATE_FLOWER_MESH` is set here.
 * @returns {void}
 */
export function updateFlower(
  field,
  x,
  z,
  func,
  updateHeight,
  updateGoo,
  updatePollination,
  gameState,
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

// export function initFields(gameState, meshData) {
//   FIELD_CONFIGS.forEach((config) => {
//     // createField(config.name, config, gameState);

//     createField(config.name, config, gameState, meshData);
//   });
// }
