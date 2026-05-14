// entities/mobs.js
import { MATH } from "../utils/math.js";
import { Token } from "./tokens.js";

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

  // CHQ: Gemini AI passed isBossDrop flag to the Token constructor.
  die(index, gameState) {
    const loot = this.getLootTable();
    const isBoss = this.type === "mondo";

    loot.forEach((item) => {
      // Create tokens at the mob's death position
      gameState.objects.tokens.push(
        new Token(item.type, item.amount, this.pos, isBoss),
      );
    });

    // Remove the mob from the game world
    gameState.objects.mobs.splice(index, 1);
  }

  getLootTable() {
    // Basic Ladybug drops
    if (this.type === "ladybug") {
      return [
        { type: "honey", amount: 50 * this.lvl },
        { type: "strawberry", amount: 1 },
      ];
    }
    // ... add more logic for Rhino Beetles, etc.
    return [{ type: "honey", amount: 10 }];
  }
}

// CHQ: Gemini AI created MondoChick as extension of Mob
export class MondoChick extends Mob {
  // Specialized logic for the boss (timers, massive HP, specific drops)

  constructor(id, pos, hp, lvl, gameState) {
    super(id, "mondo", pos, hp, lvl, gameState);
    this.timer = 0; // Tracks catch time
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

// CHQ: Gemini AI created function
export function handleMobDeath(mob, gameState) {
  // 1. Identify the mob type (e.g., "werewolf", "ladybug", "scorpion")
  const mobType = mob.type.toLowerCase();

  // 2. Increment the specific stat for quest tracking
  if (gameState.player.stats[mobType] !== undefined) {
    gameState.player.stats[mobType] += 1;
  } else {
    // If the key doesn't exist yet, initialize it
    gameState.player.stats[mobType] = 1;
  }

  // 3. Logic from dialogue.js: Handle rewards or specific messages
  console.log(`Defeated ${mob.type}! Stat updated for quests.`);

  // Existing death logic (e.g., play animation, remove from world, drop loot)
  mob.isDead = true;
}
