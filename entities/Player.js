// entities/Player.js

// CHQ: Gemini AI created function

import { updateQuestUI } from "../ui/questRenderer";

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

    // CHQ: Gemini AI added for effects
    this.effects.forEach((effect) => {
      const timeLeft = effect.endTime - Date.now();
      const cooldownEl = document.getElementById(`${effect.id}_cooldown`);

      if (cooldownEl && timeLeft > 0) {
        const totalTime = 15 * 60 * 1000;
        const height = (timeLeft / totalTime) * 30; // 30 is the SVG height in your index.html
        cooldownEl.setAttribute("height", height);
        document.getElementById(effect.id).style.display = "block";
      } else if (timeLeft <= 0) {
        // Remove multiplier and hide icon
        this.fieldBoosts[effect.target] -= effect.multiplier;
        document.getElementById(effect.id).style.display = "none";
        // Logic to splice this effect from player.effects should go here
      }
    });
  }
}
