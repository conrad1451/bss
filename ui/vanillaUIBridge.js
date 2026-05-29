// ui/vanillaUIBridge.js
import { EventManager } from "../engine/eventManager.js";
import { updateQuestUI } from "./questRenderer.js";

// Cache your DOM references ONCE at boot, rather than querying every single frame!
const pollenEl = document.getElementById("pollenAmount");
const pollenEl2 = document.getElementById("pollenAmount2");
const honeyEl = document.getElementById("honeyAmount");
const capacityBar = document.getElementById("capacityBar");
const questPage = document.getElementById("questPage");

// NEW: Cache a container element where your active buff icons live in the DOM
const buffsContainer = document.getElementById("activeBuffsContainer");

// Listen for pollen changes
EventManager.on("POLLEN_CHANGED", (data) => {
  const formattedPollen = Math.floor(data.pollenInBag).toLocaleString();
  if (pollenEl) pollenEl.textContent = formattedPollen;
  if (pollenEl2) pollenEl2.textContent = formattedPollen;

  if (capacityBar) {
    const capPercent = (data.pollenInBag / data.capacity) * 100;
    capacityBar.setAttribute("width", Math.min(capPercent * 1.96, 196));
  }
});

// Listen for honey updates
EventManager.on("HONEY_CHANGED", (data) => {
  if (honeyEl) honeyEl.textContent = Math.floor(data.honey).toLocaleString();
});

// Listen for tick updates to cycle menus smoothly
EventManager.on("QUEST_TICK", (gameState) => {
  if (questPage && questPage.style.display !== "none") {
    updateQuestUI(gameState);
  }
});

// Update standard cooldown meters asynchronously
EventManager.on("EFFECT_TICK", ({ effects }) => {
  effects.forEach((effect) => {
    const timeLeft = effect.endTime - Date.now();

    // 1. Update visual height of a clipPath/rect mask if you are using an SVG overlay meter
    const cooldownEl = document.getElementById(`${effect.id}_cooldown`);
    if (cooldownEl && timeLeft > 0) {
      const totalTime = effect.duration || 15 * 60 * 1000; // Dynamic or fallback 15 mins
      const height = (timeLeft / totalTime) * 30; // Scales to your visual meter box size
      cooldownEl.setAttribute("height", Math.max(0, height));
    }

    // 2. Optional: Update text-based countdown timers if you have them
    const textEl = document.getElementById(`${effect.id}_text`);
    if (textEl && timeLeft > 0) {
      const secondsLeft = Math.ceil(timeLeft / 1000);
      textEl.textContent = `${secondsLeft}s`;
    }
  });
});

// Handles creation, ordering, and total cleanup of buff UI cards when state changes
EventManager.on("EFFECTS_UPDATED", ({ effects }) => {
  if (!buffsContainer) return;

  // Clear or sync elements to match the current active list
  // A quick and safe vanilla pattern is to rebuild or patch based on active keys:
  const currentEffectIds = effects.map((e) => e.id);

  // Remove elements from DOM that are no longer active
  Array.from(buffsContainer.children).forEach((child) => {
    const id = child.id.replace("_buff_card", "");
    if (!currentEffectIds.includes(id)) {
      child.remove();
    }
  });

  // Add or verify elements for newly activated buffs
  effects.forEach((effect) => {
    let buffCard = document.getElementById(`${effect.id}_buff_card`);

    // If it doesn't exist yet, construct the brand new HTML structure dynamically
    if (!buffCard) {
      buffCard = document.createElement("div");
      buffCard.id = `${effect.id}_buff_card`;
      buffCard.className = "buff-card";

      // Create the image element pointing directly to your public folder category path
      const img = document.createElement("img");
      // Map effect.id directly to your filenames (e.g., effect.id 'gummyStarPassive' -> 'gummyStarPassive.svg')
      img.src = `/icons/abilityUI/${effect.id}.svg`;
      img.className = "buff-icon";
      img.alt = effect.name || effect.id;

      // Handle loading error fallbacks safely
      img.onerror = () => {
        console.warn(
          `SVG Icon /icons/abilityUI/${effect.id}.svg missing. Using fallback.`,
        );
        img.src = "/vite.svg"; // Fallback to engine or root default asset
      };

      // Create an overlay layer for the shading/cooldown effect
      const overlay = document.createElement("div");
      overlay.id = `${effect.id}_cooldown`;
      overlay.className = "buff-cooldown-overlay";

      // Append items to the wrapper card
      buffCard.appendChild(img);
      buffCard.appendChild(overlay);
      buffsContainer.appendChild(buffCard);
    }
  });
});
