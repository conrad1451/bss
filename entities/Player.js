// entities/Player.js

// CHQ: Gemini AI created function

// import { updateQuestUI } from "../ui/questRenderer";
import { EventManager } from "../engine/eventManager.js";

export class Player {
  constructor(data) {
    // Attach all the data properties
    Object.assign(this, data);

    // Fallback initializations to prevent undefined array iterations
    this.effects = this.effects || [];
    this.fieldBoosts = this.fieldBoosts || {};
    this.pollenInBag = this.pollenInBag || 0;
    this.capacity = this.capacity || 100;
    this.honey = this.honey || 0;
  }

  // CHQ: Claude AI added implementation for updatePhysics and
  //      updated signature to include reference to gamestate.user
  updatePhysics(dt, user) {
    // updatePhysics(dt) {

    const keys = this.user?.keys || {};
    const speed = 10;

    // Get yaw from player (set by mouse/arrow keys in input.js)
    const yaw = this.yaw || 0;

    // Direction vectors based on yaw
    const forwardX = Math.sin(yaw);
    const forwardZ = -Math.cos(yaw);
    const rightX = Math.cos(yaw);
    const rightZ = Math.sin(yaw);

    let moveX = 0;
    let moveZ = 0;

    if (keys["w"] || keys["arrowup"]) {
      moveX += forwardX;
      moveZ += forwardZ;
    }
    if (keys["s"] || keys["arrowdown"]) {
      moveX -= forwardX;
      moveZ -= forwardZ;
    }
    if (keys["a"] || keys["arrowleft"]) {
      moveX -= rightX;
      moveZ -= rightZ;
    }
    if (keys["d"] || keys["arrowright"]) {
      moveX += rightX;
      moveZ += rightZ;
    }

    // Normalize diagonal movement
    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0) {
      this.pos[0] += (moveX / len) * speed * dt;
      this.pos[2] += (moveZ / len) * speed * dt;
    }

    // Basic gravity + ground clamp
    this.velocity[1] += -9.81 * dt;
    this.pos[1] += this.velocity[1] * dt;
    if (this.pos[1] <= 5) {
      this.pos[1] = 5;
      this.velocity[1] = 0;
    }
  }

  updateCamera(dt) {
    /* camera logic */
  }

  /**
   * Data-driven changes that depend on time progression.
   * Notice: All direct DOM manipulation has been extracted!
   */
  updateUI(dt, gameState) {
    // Guard clause: If engine ticks before gameState finishes loading fully
    if (!gameState) return;

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
    // Safely check frame counts using an inline fallback if frameCount isn't set yet
    const currentFrame = gameState.frameCount || 0;
    if (currentFrame % 10 === 0) {
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
