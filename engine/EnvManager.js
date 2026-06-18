// engine/EnvManager.js

// CHQ: Gemini AI generated

import { EventManager } from "./eventManager.js";

export class EnvManager {
  constructor() {
    this.sprinklers = [];
    this.flames = [];
    this.particles = [];

    // Spawning timers tracking world loops
    this.timers = {
      leaves: 0,
      tokenDespawnCheck: 0,
    };
  }

  /**
   * Main simulation tick for ambient dynamic systems.
   * Invoked explicitly inside updateEngine.js.
   */
  update(dt, gameState) {
    if (!gameState) return;

    // 1. Process active Sprinkler behaviors (e.g., watering adjacent flowers)
    this.updateSprinklers(dt, gameState);

    // 2. Process active Flame structures (e.g., ticking damage or visual styling)
    this.updateFlames(dt, gameState);

    // 3. Process Particle effects & tracking timers (e.g., field cloud haze, leaf blowing)
    this.updateParticles(dt, gameState);

    // 4. Centralized token lifecycle automation management (Spawning/Despawning ticks)
    this.updateLootTokens(dt, gameState);
  }

  updateSprinklers(dt, gameState) {
    this.sprinklers = this.sprinklers.filter((sprinkler) => {
      sprinkler.life = sprinkler.life - dt;

      // Regenerate surrounding flowers based on sprinkler coordinate positioning
      if (gameState.fieldManager && sprinkler.currentField) {
        gameState.fieldManager.fieldInfo[
          sprinkler.currentField
        ].currentPollen += sprinkler.regenPower * dt;
      }

      return sprinkler.life > 0;
    });
  }

  updateFlames(dt, gameState) {
    this.flames = this.flames.filter((flame) => {
      flame.duration -= dt;

      // Dynamic calculations (e.g., burning away honey or modifying flower types)
      return flame.duration > 0;
    });
  }

  updateParticles(dt, gameState) {
    // Advance internal leaf blowing timer metrics
    this.timers.leaves += dt;
    if (this.timers.leaves >= 5.0) {
      // Every 5 seconds, drop visual ambiance
      this.timers.leaves = 0;
      EventManager.emit("AMBIENT_PARTICLE_TRIGGER", {
        type: "LEAF_FALL",
        count: 10,
      });
    }

    // Process positional physics arrays for CPU particle storage
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += dt;
      p.pos[0] += p.velocity[0] * dt;
      p.pos[1] += p.velocity[1] * dt;
      p.pos[2] += p.velocity[2] * dt;

      if (p.age >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  updateLootTokens(dt, gameState) {
    if (!gameState?.objects?.tokens) return; // CHQ: Claude AI (Haiku): add null safety

    this.timers.tokenDespawnCheck += dt;

    // Safely process loot token decay arrays outside the main Player boundaries
    if (
      gameState.objects &&
      gameState.objects.tokens &&
      this.timers.tokenDespawnCheck >= 0.5
    ) {
      this.timers.tokenDespawnCheck = 0;

      gameState.objects.tokens = gameState.objects.tokens.filter((token) => {
        // Automatically scales down or slices away old tokens
        token.life -= dt;
        return token.life > 0;
      });
    }
  }

  spawnSprinkler(type, position, fieldId) {
    this.sprinklers.push({
      type,
      pos: [...position],
      currentField: fieldId,
      life: 60.0, // Lasts 1 minute
      regenPower: type === "Supreme" ? 25 : 5,
    });
    EventManager.emit("SPRINKLER_PLACED", { position, type });
  }

  spawnFlame(position, radius, duration) {
    this.flames.push({ pos: [...position], radius, duration });
  }
}
