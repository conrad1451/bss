// ui/effectsDOM.js

// CHQ: Claude AI (Sonnet) extracted from effects.js
//
// effects.js used to call document.getElementById(...) directly inside each
// entry's object literal, which meant the whole ~5000-line file only worked
// if the HUD DOM already existed at *import* time. That's fragile - module
// import order and DOM injection order both have to line up perfectly.
//
// Every id turned out to be 100% derivable from the effect's own key:
//   svg      -> document.getElementById(type)
//   cooldown -> document.getElementById(`${type}_cooldown`)
//   amount   -> document.getElementById(`${type}_amount`)
// (verified across all 124 DOM-backed entries, zero exceptions)
//
// So instead of storing DOM refs as data, we look them up on demand here,
// the first time something actually asks for a given effect's HUD elements,
// and cache the result. effects.js itself stays pure data and can be
// imported any time, regardless of whether the HUD has been injected yet.

const domCache = {};

/**
 * Lazily resolves and caches the HUD DOM elements for a given effect type.
 * Safe to call before the HUD markup exists - in that case the relevant
 * fields will be `null` (whatever getElementById returns), and the object
 * won't be re-queried once it's flagged as "resolved" so a fresh call after
 * the HUD is injected will pick up the real elements. Call
 * `resetEffectDOMCache()` (below) if the HUD is ever torn down and rebuilt
 * (e.g. re-rendering the menu) so stale detached elements aren't reused.
 *
 * @param {string} type - The effect key, e.g. "scienceEnhancement".
 * @returns {{ svg: Element|null, cooldown: Element|null, amount: Element|null }}
 */
export function getEffectDOM(type) {
  const cached = domCache[type];
  if (cached && cached.svg) return cached; // only trust the cache once the icon actually resolved

  const resolved = {
    svg: document.getElementById(type),
    cooldown: document.getElementById(`${type}_cooldown`),
    amount: document.getElementById(`${type}_amount`),
  };

  domCache[type] = resolved;
  return resolved;
}

/**
 * Clears the cached DOM lookups. Call this if the effects HUD is ever
 * destroyed and re-injected (e.g. returning to the main menu and starting
 * a new run), so getEffectDOM() doesn't hand back references to detached
 * elements.
 *
 * @returns {void}
 */
export function resetEffectDOMCache() {
  for (const key in domCache) delete domCache[key];
}
