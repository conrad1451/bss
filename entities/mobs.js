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
    this.speed = 4.0; // CHQ: Gemini AI: Added base movement speed scalar
    this.isDead = false; // CHQ: Gemini AI: Flag to defer safe collection cleanup
  }

  update(dt, gameState) {
    if (this.hp <= 0 || this.isDead) return true;

    // Force explicit statement termination with semicolons to stop JS parser chaining
    const mX = this.pos[0];
    const mZ = this.pos[2];
    const pX = gameState.player.pos[0];
    const pZ = gameState.player.pos[2];

    // Hand-calculate the delta and distance locally to guarantee no utility errors
    const dx = pX - mX;
    const dz = pZ - mZ;
    const distToPlayer = Math.sqrt(dx * dx + dz * dz);

    // // Basic AI: Check distance to player, move, or return home
    // const currentPos = this.pos;
    // const playerPos = gameState.player.pos;
    // const distToPlayer = MATH.dist(currentPos, playerPos);

    // Basic Aggro Trigger
    if (distToPlayer < 20) {
      this.state = "aggro";
      // this.target = playerPos;
      this.target = gameState.player.pos;
    } else if (distToPlayer > 35 && this.state === "aggro") {
      // Return home if the player runs too far away
      this.state = "returning";
      this.target = this.homePos;
      // this.moveTowards(this.target, dt);
    }

    // State Machine Processing
    if (this.state === "aggro") {
      this.moveTowards(this.target, dt);
    } else if (this.state === "returning") {
      this.moveTowards(this.homePos, dt);

      // Calculate home distance explicitly as well
      const hx = this.homePos[0] - this.pos[0];
      const hz = this.homePos[2] - this.pos[2];
      const distToHome = Math.sqrt(hx * hx + hz * hz);

      if (distToHome < 1) {
        this.state = "idle";
        this.target = null;
      }
    }

    return this.hp <= 0; // Return true if dead
  }

  // CHQ: Gemini AI filled out method
  moveTowards(target, dt) {
    if (!target) return;

    // Calculate displacement vectors
    const dx = target[0] - this.pos[0];
    const dz = target[2] - this.pos[2];
    const distance = Math.sqrt(dx * dx + dz * dz);

    // Avoid division by zero if already directly on top of target coordinate
    if (distance > 0.1) {
      // Normalize layout and apply linear delta velocity matrix
      this.pos[0] += (dx / distance) * this.speed * dt;
      this.pos[2] += (dz / distance) * this.speed * dt;
    }
  }

  // CHQ: Gemini AI passed isBossDrop flag to the Token constructor.
  die(index, gameState) {
    const loot = this.getLootTable();
    const isBoss = this.type === "mondo";

    loot.forEach((item) => {
      // Spawn loot drops scattered slightly around death location array
      const scatterPos = [
        this.pos[0] + (Math.random() - 0.5) * 2,
        this.pos[1],
        this.pos[2] + (Math.random() - 0.5) * 2,
      ];

      gameState.objects.tokens.push(
        new Token(item.type, item.amount, scatterPos, isBoss),
      );
    });

    // Update quest logs using your handleMobDeath function
    handleMobDeath(this, gameState);
    // // Remove the mob from the game world
    // gameState.objects.mobs.splice(index, 1);
  }

  getLootTable() {
    // Basic Ladybug drops
    if (this.type === "ladybug") {
      return [
        { type: "honey", amount: 50 * this.lvl },
        { type: "strawberry", amount: 1 },
      ];
    }
    if (this.type === "rhino") {
      return [
        { type: "honey", amount: 100 * this.lvl },
        { type: "blueberry", amount: 1 },
      ];
    }
    // ... add more logic for other mob types, etc.
    return [{ type: "honey", amount: 10 }];
  }
}

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

// CHQ: Gemini AI created function
export function handleMobDeath(mob, gameState) {
  // 1. Identify the mob type (e.g., "werewolf", "ladybug", "scorpion")
  const mobType = mob.type.toLowerCase();

  if (!gameState.player.stats) {
    gameState.player.stats = {};
  }

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
