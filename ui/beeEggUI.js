// ui/beeEggUI.js
//
// CHQ: Claude AI (Sonnet): Refactor of the inline event-bee-egg SVG generation.
// Splits the "art" (bee icon, drawn once as a reusable <symbol>) from the
// "data" (per-bee text card), and moves both out of a raw innerHTML += loop
// into named, testable functions.

import { MATH } from "../utils/math.js";

// ---------------------------------------------------------------------------
// 1. The bee icon, defined once as an SVG <symbol>.
//    Extracted verbatim from the original inline <path> shapes (wings, body
//    stripe, shading), just re-based to a 0..70 viewBox so it can be reused
//    at any size via <use>.
// ---------------------------------------------------------------------------

const BEE_EGG_ICON_SPRITE = `
  <svg style="display:none" aria-hidden="true">
    <symbol id="icon-bee-egg" viewBox="0 0 70 70">
      <path fill="rgb(255,255,0)" stroke="rgb(0,0,0)" stroke-width="1.5"
        d="M35 15C 20 17 10 55 35 55M35 15C 50 17 60 55 35 55"></path>
      <path fill="rgb(0,0,0)"
        d="M20 30 C 20 40 50 40 50 30L50 40C50 50 20 50 20 40"></path>
      <path fill="rgb(0,0,0,0.3)"
        d="M47 25C 57 56 35 60 23 50C 32 48 41 50 50 35"></path>
    </symbol>
  </svg>
`;

/**
 * Injects the shared icon sprite into the document exactly once.
 * Safe to call multiple times - subsequent calls are no-ops.
 */
export function ensureBeeEggIconSprite() {
  if (document.getElementById("icon-bee-egg")) return; // already injected
  const wrapper = document.createElement("div");
  wrapper.innerHTML = BEE_EGG_ICON_SPRITE;
  document.body.appendChild(wrapper.firstElementChild);
}

// ---------------------------------------------------------------------------
// 2. Per-bee card template - pure function, easy to read/test in isolation.
// ---------------------------------------------------------------------------

/**
 * Builds the markup for a single event-bee-egg inventory card.
 *
 * @param {string} beeTypes - Raw bee type key (e.g. "panda").
 * @returns {{ id: string, html: string }} The DOM id used for click binding
 *   (and for the "<id>_amount" label elsewhere), plus the card's HTML.
 */
export function renderBeeEggCard(beeTypes) {
  const id = `${beeTypes}BeeEgg`;
  const name = MATH.doGrammar(beeTypes);

  const html = `
    <svg id="${id}" style="width:200px;height:70px;cursor:pointer;border-radius:5px">
      <rect width="200" height="70" fill="rgb(255,255,255)"></rect>
      <rect width="70" height="70" fill="rgb(225,225,225)"></rect>

      <text x="132" y="18" style="font-family:trebuchet ms;font-size:16.5px;"
        fill="rgb(0,0,0)" text-anchor="middle">${name} Bee Egg</text>
      <text x="132" y="39" style="font-family:trebuchet ms;font-size:12px;"
        fill="rgb(0,0,0)" text-anchor="middle">A permanent egg that</text>
      <text x="130" y="53" style="font-family:trebuchet ms;font-size:12px;"
        fill="rgb(0,0,0)" text-anchor="middle">always hatches into</text>
      <text x="132" y="66" style="font-family:trebuchet ms;font-size:12px;"
        fill="rgb(0,0,0)" text-anchor="middle">a ${name} Bee!</text>

      <text id="${id}_amount" x="67" y="67" style="font-family:calibri;font-size:14px;"
        fill="rgb(0,0,0)" text-anchor="end"></text>

      <use href="#icon-bee-egg" width="70" height="70"></use>
    </svg>
  `;

  return { id, html };
}

// ---------------------------------------------------------------------------
// 3. Item registration - same "use" hatch logic as the original, just
//    factored out of the loop body so it's readable on its own.
// ---------------------------------------------------------------------------

/**
 * Builds the `items[beeTypes + "BeeEgg"]` entry: inventory metadata plus the
 * hatch-on-use behavior (block if the player already owns that bee, else
 * assign it into the currently selected hive slot and show the hatch popup).
 *
 * @param {string} beeTypes
 * @param {Object} gameState
 * @returns {Object} item definition
 */
export function createBeeEggItem(beeTypes, gameState) {
  const { objects, player, COLORS, TIME } = gameState;
  return {
    canUseOnSlot: () => true,
    amount: 0,
    u: (128 * 4) / 2048,
    v: (128 * 5) / 2048,
    value: Infinity,
    use() {
      const alreadyOwned = Object.values(objects.bees).some(
        (bee) => bee.type === beeTypes,
      );

      if (alreadyOwned) {
        player.addMessage(
          `You can only have 1 ${MATH.doGrammar(beeTypes)} Bee!`,
          COLORS.redArr,
        );
        return;
      }

      const slot = player.hive[player.hiveIndex[1]][player.hiveIndex[0]];
      slot.type = beeTypes;
      slot.gifted = false;

      player.beePopup = {
        type: beeTypes,
        message: "You hatched a...",
        time: TIME,
        gifted: false,
      };

      player.updateHive();
    },
  };
}

// ---------------------------------------------------------------------------
// 4. Orchestration - replaces the original `for (let i in beeInfo) { ... }`
//    loop. Injects the icon sprite once, then builds + registers a card
//    for every event-rarity bee.
// ---------------------------------------------------------------------------

/**
 * Populates `pages[0]` with one card per event-rarity bee and registers
 * the corresponding item in `items`.
 *
 * @param {Object} beeInfo - Bee data table keyed by bee type.
 * @param {HTMLElement[]} pages - Inventory page elements (pages[0] = eggs page).
 * @param {Object} items - Global items registry to populate.
 * @param {Object} ctx - { objects, player, COLORS } passed through to createBeeEggItem.
 */
export function initEventBeeEggs(beeInfo, pages, items, ctx) {
  ensureBeeEggIconSprite();

  const cardsHTML = [];

  for (const beeTypes in beeInfo) {
    if (beeInfo[beeTypes].rarity !== "event") continue;

    const { id, html } = renderBeeEggCard(beeTypes);
    cardsHTML.push(html);

    items[id] = createBeeEggItem(beeTypes, ctx);
  }

  pages[0].innerHTML += cardsHTML.join("");
}
