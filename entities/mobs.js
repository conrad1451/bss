// entities/mobs.js
import { MATH } from "../utils/math.js";

// CHQ: Gemini AI generated

export class Mob {
  constructor(id, type, pos, hp, lvl, gameState) {
    this.id = id;
    this.type = type;
    this.pos = [...pos];
    this.hp = hp;
    this.maxHp = hp;
    this.lvl = lvl;
    this.state = "idle";
    this.homePos = [...pos];
    this.target = null;
  }

  update(dt, gameState) {
    // Basic AI: Check distance to player, move, or return home
    const distToPlayer = MATH.dist(this.pos, gameState.player.pos);

    if (distToPlayer < 20) {
      this.state = "aggro";
      this.target = gameState.player.pos;
    }

    if (this.state === "aggro") {
      this.moveTowards(this.target, dt);
    }

    return this.hp <= 0; // Return true if dead
  }

  moveTowards(target, dt) {
    // Vector math to move mob
  }

  die(index, gameState) {
    // Spawn loot/tokens and remove from objects.mobs
  }
}

export class MondoChick extends Mob {
  // Specialized logic for the boss (timers, massive HP, specific drops)
}
