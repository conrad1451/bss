// ui/vanillaUIBridge.js
import { EventManager } from "../engine/eventManager.js";
import { updateQuestUI } from "./questRenderer.js";

// Cache your DOM references ONCE at boot, rather than querying every single frame!
const pollenEl = document.getElementById("pollenAmount");
const pollenEl2 = document.getElementById("pollenAmount2");
const honeyEl = document.getElementById("honeyAmount");
const capacityBar = document.getElementById("capacityBar");
const questPage = document.getElementById("questPage");

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
    const cooldownEl = document.getElementById(`${effect.id}_cooldown`);
    if (cooldownEl && timeLeft > 0) {
      const totalTime = 15 * 60 * 1000; // 15 mins
      const height = (timeLeft / totalTime) * 30;
      cooldownEl.setAttribute("height", height);
    }
  });
});

EventManager.on("EFFECTS_UPDATED", ({ effects }) => {
  // If an effect expires completely, manage visibility changes here
  // e.g., document.getElementById(expiredId).style.display = 'none';
});
