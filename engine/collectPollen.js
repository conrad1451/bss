// engine/collectPollen.js

// CHQ: Claude AI (Sonnet) refactored: ported from an old free function that
// read a large set of bare globals (player, fieldInfo, updateFlower,
// textRenderer, COLORS) and assumed a per-cell, per-flower-color field model:
// fieldInfo[id].width/length, flowers addressable by (x, z) via a global
// updateFlower(field, x, z, callback, ...), each flower carrying its own
// height/level/color/goo/balloon/puffshroom state.
//
// The current FieldManager (engine/FieldManager.js) uses a different, simpler
// model: one shared depleting pollen pool per field (fieldInfo[id].currentPollen
// / .pollenCapacity), and flowers[fieldId] is a flat array with only
// height/maxHeight/growthSpeed - no per-flower color, goo, balloon, or
// puffshroom state, and no (x, z) addressing. updateFlower doesn't exist
// anywhere in the current codebase either.
//
// This port keeps the parts of the old function that are genuinely
// field-model-agnostic (crit rolls, per-color multipliers via the project's
// own getPollenMultiplier, instant-conversion math, honey conversion, player
// stat tracking, floating combat text) and adapts pollen sourcing to pull
// from FieldManager.depletePollen() against the pooled model instead of
// walking a per-cell grid. See TODOs below for what got simplified or dropped
// as a result - nothing is silently faked.

import { getPollenMultiplier } from "../state/gameState.js";

// TODO: game-design tunable. The old system scaled harvest amounts off
// per-flower `height` (0-1 range) at each targeted grid cell. The new pooled
// field model has no per-cell unit to key off of, so `pattern.length` (the
// number of cells a caller targeted - e.g. Bubble's 33-cell splash vs
// FetchBall's single [[0,0]]) is used here as a stand-in "coverage" scalar.
// Tune this constant once real playtesting numbers are available; it's a
// placeholder, not a balanced value.
const POLLEN_PER_CELL = 5;

/**
 * Harvests pollen from a field's pooled currentPollen (via
 * gameState.fieldManager.depletePollen), converts a portion instantly to
 * honey, updates player stats, and shows floating combat text for the
 * result.
 *
 * Dropped relative to the old function (all require per-flower state that
 * doesn't exist in the current FieldManager model - restore here once that
 * state exists):
 *   - params.replenish / params.depleteAll (per-flower height manipulation)
 *   - per-flower goo accumulation / player.stats.goo contribution
 *   - per-flower balloon pollen routing
 *   - per-flower puffshroom pollen routing
 *
 * @param {Object} params
 * @param {string} [params.field] - Field id to harvest from. Defaults to
 *   gameState.player.fieldIn.
 * @param {number} params.x - Local x offset (kept for floating-text
 *   placement; no longer used for per-cell grid lookups).
 * @param {number} params.z - Local z offset (see params.x).
 * @param {Array<[number, number]>} params.pattern - Cell offsets the caller
 *   is targeting. Only `pattern.length` is used now, as a coverage scalar
 *   (see POLLEN_PER_CELL above).
 * @param {number|{r:number,b:number,w:number}} params.amount - Requested
 *   per-color harvest weight. A single number is treated as an equal weight
 *   for all three colors, matching the old function's behavior.
 * @param {number|{r:number,b:number,w:number}} [params.multiplier] - Extra
 *   flat multiplier applied on top of the player's pollen-rate stats.
 * @param {number} [params.instantConversion] - Blends the player's instant
 *   conversion rate toward 1 by this factor per color (matches old semantics).
 * @param {boolean} [params.alwaysCrit] - Force every color to crit-roll true.
 * @param {number[]} [params.otherPos] - Explicit world position override for
 *   the floating pollen-gained text (used by callers not tied to a specific
 *   flower/cell, e.g. FetchBall).
 * @param {number} [params.yOffset=2] - Vertical offset for floating text.
 * @param {Object} gameState - The live game state object.
 * @returns {number} Total pollen actually collected across all three colors.
 */
export function collectPollen(params, gameState) {
  const { player, fieldInfo, fieldManager, textRenderer } = gameState;
  const fieldId = params.field || player.fieldIn;
  const f = fieldInfo[fieldId];

  if (!f || player.pollenInBag >= player.capacity || !params.pattern?.length) {
    return 0;
  }

  const stackHeight = params.stackHeight || 0.425;
  const yOffset = params.yOffset || 2;

  const amount =
    typeof params.amount === "number"
      ? { r: params.amount, b: params.amount, w: params.amount }
      : params.amount;

  const rollCrit = () =>
    params.alwaysCrit || Math.random() < player.criticalChance
      ? Math.random() < player.superCritChance
        ? 2
        : 1
      : 0;

  const crit = { r: rollCrit(), b: rollCrit(), w: rollCrit() };

  const multiplier = params.multiplier
    ? typeof params.multiplier === "number"
      ? { r: params.multiplier, b: params.multiplier, w: params.multiplier }
      : { ...params.multiplier }
    : { r: 1, b: 1, w: 1 };

  // Per-color rate goes through the project's own getPollenMultiplier (base
  // rate + fieldBoosts), rather than reading player.redPollen etc. directly
  // like the old code did. That helper already exists in state/gameState.js
  // and is the current source of truth for pollen rates - using it here
  // instead of bypassing fieldBoosts.
  multiplier.r *=
    getPollenMultiplier(gameState, "red") *
    (crit.r === 0
      ? 1
      : crit.r === 1
        ? player.criticalPower
        : player.criticalPower * player.superCritPower);
  multiplier.b *=
    getPollenMultiplier(gameState, "blue") *
    (crit.b === 0
      ? 1
      : crit.b === 1
        ? player.criticalPower
        : player.criticalPower * player.superCritPower);
  multiplier.w *=
    getPollenMultiplier(gameState, "white") *
    (crit.w === 0
      ? 1
      : crit.w === 1
        ? player.criticalPower
        : player.criticalPower * player.superCritPower);

  // TODO: instantRedConversion/instantBlueConversion/instantWhiteConversion
  // aren't in the current player defaults (state/gameState.js) yet - falling
  // back to 0 so the math below stays a real number instead of NaN.
  const baseInstant = {
    r: player.instantRedConversion ?? 0,
    b: player.instantBlueConversion ?? 0,
    w: player.instantWhiteConversion ?? 0,
  };

  const instantConversion = {
    r: params.instantConversion
      ? (baseInstant.r - 1) * params.instantConversion + 1
      : baseInstant.r,
    b: params.instantConversion
      ? (baseInstant.b - 1) * params.instantConversion + 1
      : baseInstant.b,
    w: params.instantConversion
      ? (baseInstant.w - 1) * params.instantConversion + 1
      : baseInstant.w,
  };

  instantConversion.r = crit.r === 2 ? 1 : instantConversion.r;
  instantConversion.b = crit.b === 2 ? 1 : instantConversion.b;
  instantConversion.w = crit.w === 2 ? 1 : instantConversion.w;

  // --- pollen sourcing: pooled model instead of a per-cell flower walk ---
  const requestedWeight = amount.r + amount.b + amount.w;
  const requestedTotal = params.pattern.length * POLLEN_PER_CELL;

  const actualHarvested = fieldManager
    ? fieldManager.depletePollen(fieldId, requestedTotal)
    : Math.min(requestedTotal, f.currentPollen ?? requestedTotal);
  // defensive fallback only - doesn't mutate the pool; FieldManager should always be present in real play

  const total = { r: 0, b: 0, w: 0 };

  if (requestedWeight > 0) {
    total.r = Math.round(
      ((actualHarvested * amount.r) / requestedWeight) * multiplier.r,
    );
    total.b = Math.round(
      ((actualHarvested * amount.b) / requestedWeight) * multiplier.b,
    );
    total.w = Math.round(
      ((actualHarvested * amount.w) / requestedWeight) * multiplier.w,
    );
  }

  // --- floating text (logic unchanged from the old function) ---
  if (player.extraInfo.enablePollenText && textRenderer) {
    const stack = [];
    if (total.w) stack.push({ c: "white", v: total.w });
    if (total.r) stack.push({ c: "red", v: total.r });
    if (total.b) stack.push({ c: "blue", v: total.b });

    stack.sort((a, b) => a.v - b.v); // CHQ: replaces the old function's manual 3-element swap-sort with an equivalent ascending sort

    stack.forEach((entry, i) => {
      const pos = params.otherPos
        ? [
            params.otherPos[0],
            params.otherPos[1] + yOffset + stackHeight * i,
            params.otherPos[2],
          ]
        : [
            (f.x || 0) + params.x,
            (f.y || 0) +
              yOffset +
              stackHeight * i +
              String(entry.v).length * 0.3,
            (f.z || 0) + params.z,
          ];

      textRenderer.add(
        entry.v,
        pos,
        gameState.COLORS?.[entry.c + "Arr"], // TODO: gameState.COLORS still unset - same open gap flagged in Flame.js/Bubble.js
        crit[entry.c[0]],
      );
    });
  }

  // --- honey conversion + player totals (logic unchanged from the old function) ---
  const totalHoney = Math.ceil(
    (total.r * instantConversion.r +
      total.b * instantConversion.b +
      total.w * instantConversion.w) *
      (player.honeyPerPollen ?? 1), // TODO: honeyPerPollen isn't in the current player defaults yet
  );

  const pollenGained =
    total.r * (1 - instantConversion.r) +
    total.b * (1 - instantConversion.b) +
    total.w * (1 - instantConversion.w);

  player.pollenInBag = Math.min(
    player.pollenInBag + Math.ceil(pollenGained),
    player.capacity,
  );
  player.honey += totalHoney;

  if (
    totalHoney &&
    player.extraInfo.enablePollenText &&
    textRenderer &&
    player.body
  ) {
    textRenderer.add(
      totalHoney,
      [
        player.body.position.x,
        player.body.position.y + yOffset * 0.8 + 0.4 + Math.random() * 0.75,
        player.body.position.z,
      ],
      gameState.COLORS?.honey, // TODO: see COLORS TODO above
      0,
      "+",
      0.85,
    );
  }

  // NOTE: player.stats.goo is intentionally untouched here - the old
  // function's totalGoo came entirely from per-flower `.goo` state, which
  // doesn't exist in the current flower model (see file-level TODO above).
  player.stats.redPollen += total.r;
  player.stats.bluePollen += total.b;
  player.stats.whitePollen += total.w;

  const totalCollected = total.r + total.b + total.w;

  const fieldStatKey = `pollenFrom${fieldId}`;
  player.stats[fieldStatKey] =
    (player.stats[fieldStatKey] || 0) + totalCollected; // CHQ: default to 0 rather than skip - several fields (e.g. MushroomField, CloverField) aren't in state/gameState.js's default stats block yet
  player.stats.totalPollen = (player.stats.totalPollen || 0) + totalCollected;

  return totalCollected;
}
