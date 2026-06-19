import { Mob } from "./MobTemplate";

// CHQ: Gemini AI created MondoChick as extension of Mob
export class MondoChick extends Mob {
  // Specialized logic for the boss (timers, massive HP, specific drops)

  constructor(id, pos, hp, lvl, gameState) {
    super(id, "mondo", pos, hp, lvl, gameState);
    this.timer = 0; // Tracks catch time
    this.speed = 1.5; // Big bosses move slower
  }

  update(dt, gameState) {
    this.timer += dt;
    // Mondo takes 333 DPS automatically
    this.hp -= 333 * dt;
    return super.update(dt, gameState);
  }

  getLootTable() {
    const table = [];

    // Guaranteed Massive Honey
    for (let i = 0; i < 15; i++) {
      table.push({ type: "honey", amount: 5000 });
    }

    // Rare Chance Items (Simulating the "Catch Time" bonus)
    if (this.timer < 300) {
      // Under 5 minutes
      table.push({ type: "neonberry", amount: 1 });
      table.push({ type: "micro_converter", amount: 2 });
    }

    // Standard Treats
    for (let i = 0; i < 10; i++) {
      table.push({ type: "treat", amount: 5 });
    }

    return table;
  }
}
