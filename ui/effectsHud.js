// ui/effectsHud.js
import { MATH } from "../utils/math.js";
import { getEffectDOM } from "./effectsDOM.js";

// CHQ: Claude AI (Sonnet) generated this file

/**
 * Wires up hover-tooltip behavior for every DOM-backed effect icon in the
 * HUD. Call once after the effect icon markup exists in the DOM (effects.js
 * itself no longer needs the DOM to exist at import time. effectsHud does
 * need DOM to exist since it's the point where we actually attach listeners).
 *
 * @param {Object} effectsConfig - The `effects` export from data/effects.js.
 * @param {Object} gameState - Live game state; reads gameState.player.effects.
 * @param {HTMLElement} hoverText - Tooltip element to show/position/hide.
 * @returns {() => void} Cleanup function (removes all listeners - call on teardown).
 */
export function attachEffectHoverListeners(
  effectsConfig,
  gameState,
  hoverText,
) {
  const cleanupFns = [];

  for (const type in effectsConfig) {
    const def = effectsConfig[type];

    // Skip bee-ability entries (they use `func`, not a HUD icon/getMessage pair)
    if (!def.getMessage) continue;

    const { svg } = getEffectDOM(type);
    if (!svg) continue; // icon not in the DOM (yet) - nothing to attach to

    const onMouseMove = (e) => {
      const active = gameState.player.effects.find((fx) => fx.type === type);
      if (!active) return; // icon exists but effect isn't live so bail safely

      hoverText.style.display = "block";
      hoverText.style.left = e.x + 10 + "px";
      hoverText.style.top = e.y + 10 + "px";
      hoverText.style.bottom = "";
      hoverText.style.right = "";

      let message = def.getMessage(active.amount, "\n");
      const nl = message.indexOf("\n");

      if (!def.amountFromCooldown && active.amount !== 1) {
        message =
          message.slice(0, nl) + ` (x${active.amount})` + message.slice(nl);
      }

      const showsCooldown =
        !def.isPassive && def.maxCooldown !== 0 && def.maxCooldown !== Infinity;

      hoverText.innerText =
        message +
        "\n" +
        (showsCooldown ? MATH.doTime((active.cooldown | 0).toString()) : "");
    };

    const onMouseLeave = () => (hoverText.style.display = "none");

    svg.addEventListener("mousemove", onMouseMove);
    svg.addEventListener("mouseleave", onMouseLeave);

    cleanupFns.push(() => {
      svg.removeEventListener("mousemove", onMouseMove);
      svg.removeEventListener("mouseleave", onMouseLeave);
    });
  }

  return () => cleanupFns.forEach((fn) => fn());
}
