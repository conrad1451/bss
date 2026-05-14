// entities/Player.js

// CHQ: Gemini AI created function

import { updateQuestUI } from "./ui/questRenderer.js";

export class Player {
  constructor(data) {
    // Attach all the data properties
    Object.assign(this, data);
  }
  // updateFields
  updatePhysics(dt) {
    /* physics logic */
  }
  updateCamera(dt) {
    /* camera logic */
  }

  updateUI(dt, gameState) {
    // 1. Update the numerical text
    const pollenEl = document.getElementById("pollenAmount");
    const pollenEl2 = document.getElementById("pollenAmount2");
    const honeyEl = document.getElementById("honeyAmount");

    if (pollenEl)
      pollenEl.textContent = Math.floor(this.pollenInBag).toLocaleString();
    if (pollenEl2)
      pollenEl2.textContent = Math.floor(this.pollenInBag).toLocaleString();
    if (honeyEl) honeyEl.textContent = Math.floor(this.honey).toLocaleString();

    // 2. Update the Capacity Bar width
    const capacityBar = document.getElementById("capacityBar");
    if (capacityBar) {
      const capPercent = (this.pollenInBag / this.capacity) * 100;
      // 1.96 scales 0-100% to the 196px width defined in your SVG
      capacityBar.setAttribute("width", Math.min(capPercent * 1.96, 196));
    }

    // 3. Update Quests if the menu is visible
    const questPage = document.getElementById("questPage");
    if (questPage && questPage.style.display !== "none") {
      updateQuestUI(gameState);
    }
  }
}
