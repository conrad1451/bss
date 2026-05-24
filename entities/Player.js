// entities/Player.js

// CHQ: Gemini AI created function

// import { updateQuestUI } from "../ui/questRenderer";
import { EventManager } from "../engine/eventManager.js";

export class Player {
  constructor(data) {
    // Attach all the data properties
    Object.assign(this, data);
  }

  updatePhysics(dt) {
    /* physics logic */
  }

  updateCamera(dt) {
    /* camera logic */
  }

  updateFields(dt) {
    /* field logic */
  }

  /**
   * Data-driven changes that depend on time progression.
   * Notice: All direct DOM manipulation has been extracted!
   */
  updateUI(dt, gameState) {
    const now = Date.now();
    let effectsChanged = false;

    // Process temporary active buffs/effects over time
    this.effects = this.effects.filter((effect) => {
      const timeLeft = effect.endTime - now;

      if (timeLeft <= 0) {
        // 1. Revert the stat multiplier cleanly
        if (this.fieldBoosts[effect.target] !== undefined) {
          this.fieldBoosts[effect.target] -= effect.multiplier;
        }
        effectsChanged = true;
        return false; // Automatically filters/splices this effect out of the array
      }
      return true; // Keep the active effect
    });

    // If an effect expired, broadcast the state change to update menus/bars asynchronously
    if (effectsChanged) {
      EventManager.emit("EFFECTS_UPDATED", {
        effects: [...this.effects],
        fieldBoosts: { ...this.fieldBoosts },
      });
    } else if (this.effects.length > 0) {
      // If effects are active, broadcast their current durations for smooth clock countdown overlays
      EventManager.emit("EFFECT_TICK", { effects: this.effects });
    }

    // Optional: Only trigger heavy UI state updates occasionally, not every frame
    if (gameState.frameCount % 10 === 0) {
      EventManager.emit("QUEST_TICK", gameState);
    }
  }

  /**
   * Call this mutator method whenever the player collects pollen in fields.
   */
  addPollen(amount, colorType) {
    const oldPollen = this.pollenInBag;
    this.pollenInBag = Math.min(this.capacity, this.pollenInBag + amount);

    if (this.pollenInBag !== oldPollen) {
      EventManager.emit("POLLEN_CHANGED", {
        pollenInBag: this.pollenInBag,
        capacity: this.capacity,
        delta: this.pollenInBag - oldPollen,
      });
    }
  }

  /**
   * Call this mutator method when converting pollen to honey at the hive.
   */
  addHoney(amount) {
    this.honey += amount;
    EventManager.emit("HONEY_CHANGED", {
      honey: this.honey,
      delta: amount,
    });
  }
}
