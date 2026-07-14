// engine/effectsRegistry.js

// CHQ: Claude AI (Sonnet) generated this file

/**
 * Scans effect definitions and returns a de-duplicated list of every
 * player stat key any effect can modify (via statsToAddTo).
 *
 * Pure function — no DOM, no globals. Replaces the old top-level
 * `LIST_OF_STATS_FOR_PLAYER.push(...)` loop that mutated a shared
 * array as a side effect of iterating effects.
 *
 * @param {Object} effectsConfig - Map of effect type -> effect definition.
 * @returns {string[]} De-duplicated list of stat keys.
 */
export function collectStatsForPlayer(effectsConfig) {
  const stats = new Set();

  for (const type in effectsConfig) {
    const statsToAddTo = effectsConfig[type].statsToAddTo;
    if (!statsToAddTo) continue;
    for (const stat of statsToAddTo) stats.add(stat);
  }

  return [...stats];
}
