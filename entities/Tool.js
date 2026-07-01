// entities/Tool.js

// CHQ: Claude AI (Sonnet): Wraps a TOOL_DATA definition into a stateful
// class instance that the player holds. Owns the cooldown timer, the
// per-frame particle timer (was the `toolParticle` global), and a mutable
// copy of collectPattern so dynamic tools (pulsar, sparkStaff) can rewrite
// it each swing without touching the shared TOOL_DATA definition.
//
// Three companion maps live at the bottom of this file:
//   TOOL_MESH_BUILDERS  — procedural geometry functions, called by buildMesh()
//   TOOL_PARTICLES      — per-frame emitters, signature (tool, dt, gameState)
//   TOOL_ABILITIES      — per-swing effects,  signature (tool, gameState)
//
// Entities spawned by abilities (Flame, Bubble, Wave, etc.) are referenced
// by name; import them at the top of this file as they are converted to the
// gameState-routed pattern.

import { MATH } from "../utils/math.js";
import { TOOL_DATA } from "../data/toolData.js";

// TODO: import converted entity classes as they become available:
// import { Flame }             from "./mobs/Flame.js";
// import { Bubble }            from "./mobs/Bubble.js";
// import { Scratch }           from "./mobs/Scratch.js";
// import { PetalShuriken }     from "./mobs/PetalShuriken.js";
// import { Wave }              from "./mobs/Wave.js";
// import { DarkScoopingTrail } from "./mobs/DarkScoopingTrail.js";
// import { ReverseExplosion }  from "./mobs/ReverseExplosion.js";

// ---------------------------------------------------------------------------
// Tool class
// ---------------------------------------------------------------------------

export class Tool {
  /**
   * @param {string} key - Key into TOOL_DATA, e.g. "shovel", "scythe".
   */
  constructor(key) {
    if (!TOOL_DATA[key]) {
      throw new Error(`Tool: unknown tool key "${key}"`);
    }

    const data = TOOL_DATA[key];
    this.key = key;
    this.data = data;

    // Own mutable copy so dynamic tools (pulsar, sparkStaff) can replace
    // it per-swing without mutating the shared TOOL_DATA definition.
    this.collectPattern = data.collectPattern.slice();
    this.collectAmount = data.collectAmount;
    this.cooldown = data.cooldown;

    // Per-instance timers (replaced module-level globals toolParticle / dt)
    this.cooldownTimer = 0;
    this.particleTimer = 0;
  }

  /**
   * Called once per animation frame by the player update or engine loop.
   * Ticks the swing cooldown and drives the per-frame particle emitter.
   *
   * @param {number} dt - Delta time in seconds.
   * @param {Object} gameState - The live game state object.
   * @returns {void}
   */
  update(dt, gameState) {
    this.cooldownTimer -= dt;

    if (this.cooldownTimer <= 0) {
      this.cooldownTimer = this.cooldown;
      this.swing(gameState);
    }

    const particleFn = TOOL_PARTICLES[this.key];
    if (particleFn) {
      particleFn(this, dt, gameState);
    }
  }

  /**
   * Executes one tool swing: runs the ability (which may rewrite
   * collectPattern for dynamic tools), then harvests pollen over the
   * current pattern, then increments the player's toolUses counter.
   *
   * @param {Object} gameState - The live game state object.
   * @returns {void}
   */
  swing(gameState) {
    const player = gameState.player;
    player.toolUses = (player.toolUses || 0) + 1;

    // Ability fires before collection so dynamic tools (pulsar, sparkStaff)
    // can rewrite collectPattern before the pollen pass reads it.
    const abilityFn = TOOL_ABILITIES[this.key];
    if (abilityFn) {
      const interval = this.data.abilityInterval ?? 1;
      if (player.toolUses % interval === 0) {
        abilityFn(this, gameState);
      }
    }

    // TODO: call gameState.collectPollen (or import the collectPollen helper)
    // once that function has been converted to the gameState pattern.
    // Expected signature:
    //   collectPollen({
    //     x: player.flowerIn.x,
    //     z: player.flowerIn.z,
    //     pattern: this.collectPattern,
    //     amount: this.collectAmount,
    //   }, gameState);
  }

  /**
   * Delegates to the per-tool mesh builder, forwarding the geometry
   * primitive functions supplied by the caller's mesh-building pipeline.
   *
   * @param {Function} box        - Adds a box primitive to the staging mesh.
   * @param {Function} cylinder   - Adds a cylinder primitive.
   * @param {Function} sphere     - Adds a sphere primitive.
   * @param {Function} star       - Adds a star primitive.
   * @param {Function} [finalRotation] - Optional post-build rotation hook
   *   (only used by tidePopper in the original source).
   * @returns {void}
   */
  buildMesh(box, cylinder, sphere, star, finalRotation = () => {}) {
    const builder = TOOL_MESH_BUILDERS[this.key];
    if (builder) {
      builder(box, cylinder, sphere, star, finalRotation);
    } else {
      console.warn(
        `Tool.buildMesh: no mesh builder registered for "${this.key}"`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Mesh builders
// Kept verbatim from the original gear.tool[key].mesh functions.
// Receive the geometry primitive API from the caller's mesh pipeline.
// ---------------------------------------------------------------------------

const TOOL_MESH_BUILDERS = {
  shovel(box, cylinder, sphere, star) {
    box(-0.3, 0, 0.6, 0.1, 0.1, 0.8, false, [0.5, 0.2, 0]);
    box(-0.3, 0, 1.2, 0.3, 0.1, 0.4, false, [0.2, 0.2, 0.2]);
  },

  rake(box, cylinder, sphere, star) {
    box(-0.3, 0, 0.6, 0.1, 0.105, 0.8, false, [0.9, 0.9, 0.9]);
    box(-0.3 + 0.1, 0, 0.6 + 0.6, 0.1, 0.1, 0.5, [0, 20, 0], [0.4, 0.4, 0.4]);
    box(-0.3 + 0.2, 0, 0.6 + 0.5, 0.1, 0.1, 0.5, [0, 40, 0], [0.4, 0.4, 0.4]);
    box(-0.3 - 0.1, 0, 0.6 + 0.6, 0.1, 0.1, 0.5, [0, -20, 0], [0.4, 0.4, 0.4]);
    box(-0.3 - 0.2, 0, 0.6 + 0.5, 0.1, 0.1, 0.5, [0, -40, 0], [0.4, 0.4, 0.4]);
    box(-0.3, 0, 0.6 + 0.65, 0.1, 0.1, 0.4, false, [0.4, 0.4, 0.4]);
  },

  clippers(box, cylinder, sphere, star) {
    box(-0.2 - 0.15, -0.15, 0.4, 0.25, 0.25, 0.1, [0, 0, -30], [1.3, 1.3, 0]);
    box(-0.2 + 0.15, -0.15, 0.4, 0.25, 0.25, 0.1, [0, 0, 30], [1.3, 1.3, 0]);
    box(
      -0.2 + 0.15 - Math.sin(30 * MATH.TO_RAD) * 0.41,
      -0.15 + Math.cos(30 * MATH.TO_RAD) * 0.41,
      0.4,
      0.1,
      0.6,
      0.1,
      [0, 0, 30],
      [1.3, 1.3, 1.3],
    );
    box(
      -0.2 - 0.15 + Math.sin(30 * MATH.TO_RAD) * 0.41,
      -0.15 + Math.cos(30 * MATH.TO_RAD) * 0.41,
      0.4,
      0.1,
      0.6,
      0.1,
      [0, 0, -30],
      [1.3, 1.3, 1.3],
    );
  },

  magnet(box, cylinder, sphere, star) {
    box(-0.3, -0.25, 0.5, 0.2, 0.6, 0.2, false, [0.8, 0.8, 0.8]);
    box(-0.3, 0.15, 0.5, 0.6, 0.2, 0.2, false, [1, 0, 0]);
    box(-0.3 - 0.3, 0.3, 0.5, 0.2, 0.5, 0.2, false, [1, 0, 0]);
    box(-0.3 + 0.3, 0.3, 0.5, 0.2, 0.5, 0.2, false, [1, 0, 0]);
    box(-0.3 - 0.3, 0.5, 0.5, 0.19, 0.5, 0.19, false, [1, 1, 1]);
    box(-0.3 + 0.3, 0.5, 0.5, 0.19, 0.5, 0.19, false, [1, 1, 1]);
  },

  vacuum(box, cylinder, sphere, star) {
    box(-0.3, 0, 0.65, 0.1, 0.8, 0.1, [-20, 0, 0], [0.8, 0.8, 0.8]);
    box(-0.3, -0.1, 0.5, 0.3, 0.6, 0.25, [-20, 0, 0], [1, 0.7, 0.4]);
    box(-0.3, -0.3, 0.7, 0.4, 0.3, 0.3, false, [0.2, 0.2, 0.2]);
    box(-0.3 - 0.1, -0.3, 0.7, 0.075, 0.075, 0.31, false, [1.4, 1.4, 0]);
    box(-0.3 + 0.1, -0.3, 0.7, 0.075, 0.075, 0.31, false, [1.4, 1.4, 0]);
  },

  superScooper(box, cylinder, sphere, star) {
    box(-0.3, 0, 0.4, 0.175, 0.175, 0.2, false, [1.5, 1.5, 0]);
    box(-0.3, 0, 0.6, 0.175, 0.175, 0.2, false, [0, 0, 1.5]);
    box(-0.3, 0, 0.8, 0.175, 0.175, 0.2, false, [1.5, 1.5, 0]);
    box(-0.3, 0, 1, 0.175, 0.175, 0.2, false, [0, 0, 1.5]);
    box(-0.3, 0, 1.2, 0.15, 0.15, 0.2, false, [0.6, 0.4, 0.1]);
    box(-0.3 + 0.3 * 0.5, 0, 1.55, 0.3, 0.175, 0.65, false, [1.5, 1.5, 0]);
    box(-0.3 - 0.3 * 0.5, 0, 1.55, 0.3, 0.175, 0.65, false, [0, 0, 1.5]);
  },

  pulsar(box, cylinder, sphere, star) {
    box(-0.3, 0.2, 0.4, 0.125, 1.1, 0.125, false, [1.5, 1.5, 0]);
    box(-0.3, -0.2, 0.4, 0.175, 0.3, 0.175, false, [0, 1.5, 0]);
    cylinder(
      -0.3,
      0.2 + 1.1 * 0.5 + 0.25,
      0.4,
      0.25,
      0.0005,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0.25,
    );
    cylinder(
      -0.3,
      0.2 + 1.1 * 0.5 + 0.25,
      0.4,
      0.25,
      0.0005,
      10,
      0,
      0,
      0,
      0.001,
      90,
      0,
      0.25,
    );
    cylinder(
      -0.3,
      0.2 + 1.1 * 0.5 + 0.25,
      0.4,
      0.25,
      0.0005,
      10,
      0,
      0,
      0,
      90,
      0,
      0,
      0.25,
    );
  },

  electroMagnet(box, cylinder, sphere, star) {
    box(-0.3, -0.15, 0.5, 0.2, 0.8, 0.2, false, [0.8, 0.8, 0.8]);
    box(-0.3, 0.15 + 0.2, 0.5, 0.6, 0.2, 0.2, false, [1.4, 1.4, 0]);
    box(-0.3 - 0.3, 0.3 + 0.2, 0.5, 0.2, 0.5, 0.2, false, [1.4, 1.4, 0]);
    box(-0.3 + 0.3, 0.3 + 0.2, 0.5, 0.2, 0.5, 0.2, false, [1.4, 1.4, 0]);
    box(-0.3 - 0.3, 0.5 + 0.2, 0.5, 0.19, 0.5, 0.19, false, [1, 1, 1]);
    box(-0.3 + 0.3, 0.5 + 0.2, 0.5, 0.19, 0.5, 0.19, false, [1, 1, 1]);
    box(-0.3, 0.15 + 0.2, 0.5, 0.2, 0.2, 0.6, false, [1.4, 1.4, 0]);
    box(-0.3, 0.3 + 0.2, 0.5 - 0.3, 0.2, 0.5, 0.2, false, [1.4, 1.4, 0]);
    box(-0.3, 0.3 + 0.2, 0.5 + 0.3, 0.2, 0.5, 0.2, false, [1.4, 1.4, 0]);
    box(-0.3, 0.5 + 0.2, 0.5 - 0.3, 0.19, 0.5, 0.19, false, [1, 1, 1]);
    box(-0.3, 0.5 + 0.2, 0.5 + 0.3, 0.19, 0.5, 0.19, false, [1, 1, 1]);
  },

  scissors(box, cylinder, sphere, star) {
    box(-0.2 - 0.15, -0.15, 0.4, 0.25, 0.25, 0.1, [0, 0, -30], [0.9, 0, 0]);
    box(-0.2 + 0.15, -0.15, 0.4, 0.25, 0.25, 0.1, [0, 0, 30], [0, 0, 0.9]);
    box(
      -0.2 + 0.15 - Math.sin(30 * MATH.TO_RAD) * 0.41,
      -0.15 + Math.cos(30 * MATH.TO_RAD) * 0.41,
      0.4,
      0.1,
      0.6,
      0.1,
      [0, 0, 30],
      [1.3, 1.3, 1.3],
    );
    box(
      -0.2 - 0.15 + Math.sin(30 * MATH.TO_RAD) * 0.41,
      -0.15 + Math.cos(30 * MATH.TO_RAD) * 0.41,
      0.4,
      0.1,
      0.6,
      0.1,
      [0, 0, -30],
      [1.3, 1.3, 1.3],
    );
  },

  honeyDipper(box, cylinder, sphere, star) {
    box(-0.3, 0.3, 0.4, 0.125, 1.3, 0.125, false, [1, 0.7, 0.4]);
    box(-0.3, -0.1, 0.4, 0.175, 0.5, 0.175, false, [0.7, 0.5, 0.2]);
    cylinder(
      -0.3,
      0.25 + 1.2 * 0.5 + 0.5,
      0.4,
      0.2,
      0.075,
      10,
      1 * 1.4,
      0.7 * 1.4,
      0.4 * 1.4,
      90,
      0,
      0,
    );
    cylinder(
      -0.3,
      0.25 + 1.2 * 0.5 + 0.5 + 0.2,
      0.4,
      0.125,
      0.075,
      10,
      1 * 1.4,
      0.7 * 1.4,
      0.4 * 1.4,
      90,
      0,
      0,
    );
    cylinder(
      -0.3,
      0.25 + 1.2 * 0.5 + 0.5 - 0.2,
      0.4,
      0.125,
      0.075,
      10,
      1 * 1.4,
      0.7 * 1.4,
      0.4 * 1.4,
      90,
      0,
      0,
    );
    cylinder(
      -0.3,
      0.25 + 1.2 * 0.5 + 0.501,
      0.4,
      0.3,
      -0.8,
      10,
      0.9,
      0.5,
      0.2,
      90,
      0,
      0,
    );
  },

  bubbleWand(box, cylinder, sphere, star) {
    box(-0.3, 0.4, 0.4, 0.125, 1.5, 0.125, false, [0, 0.4, 1.4]);
    box(-0.3, -0.1, 0.4, 0.175, 0.5, 0.175, false, [1.2, 1.2, 0]);
    cylinder(
      -0.3,
      0.45 + 1.2 * 0.5 + 0.5,
      0.4,
      0.5,
      0.075,
      15,
      0,
      0.4,
      1.5,
      0,
      0,
      0,
    );
    cylinder(
      -0.3,
      0.45 + 1.2 * 0.5 + 0.5,
      0.4,
      0.4,
      0.0755,
      15,
      0,
      0.9,
      1.2,
      0,
      0,
      0,
    );
  },

  scythe(box, cylinder, sphere, star) {
    box(-0.3, 0.4, 0.4, 0.125, 1.5, 0.125, false, [1.4, 1.4, 0]);
    box(-0.3, -0.1, 0.4, 0.175, 0.5, 0.175, false, [1.4, 0, 0]);
    box(-0.3, 1, 0.8, 0.15, 0.35, 0.7, false, [1.3, 1.3, 1.3]);
    box(-0.3, 0.95, 1.3, 0.15, 0.3, 0.5, [20, 0, 0], [1.3, 1.3, 1.3]);
    box(-0.3, 0.8, 1.55, 0.15, 0.2, 0.3, [45, 0, 0], [1.3, 1.3, 1.3]);
    box(-0.3, 1 + 0.2, 0.8, 0.2, 0.35, 0.7, false, [1.3, 0, 0]);
    box(-0.3, 0.95 + 0.2, 1.3, 0.2, 0.3, 0.5, [20, 0, 0], [1.3, 0, 0]);
    box(-0.3, 0.775 + 0.15, 1.65, 0.2, 0.3, 0.5, [45, 0, 0], [1.3, 0, 0]);
  },

  goldenRake(box, cylinder, sphere, star) {
    box(-0.3, 0, 0.6, 0.1, 0.1, 0.8, false, [1.3, 1.3, 0.4]);
    box(-0.3 + 0.1, 0, 0.6 + 0.6, 0.1, 0.1, 0.5, [0, 20, 0], [1.3, 1.3, 0.4]);
    box(-0.3 + 0.2, 0, 0.6 + 0.5, 0.1, 0.1, 0.5, [0, 40, 0], [1.3, 1.3, 0.4]);
    box(-0.3 - 0.1, 0, 0.6 + 0.6, 0.1, 0.1, 0.5, [0, -20, 0], [1.3, 1.3, 0.4]);
    box(-0.3 - 0.2, 0, 0.6 + 0.5, 0.1, 0.1, 0.5, [0, -40, 0], [1.3, 1.3, 0.4]);
    box(-0.3, 0, 0.6 + 0.65, 0.1, 0.1, 0.4, false, [1.3, 1.3, 0.4]);
  },

  sparkStaff(box, cylinder, sphere, star) {
    box(-0.3, 0.3, 0.4, 0.1, 1.25, 0.1, false, [1, 0, 1]);
    box(
      -0.3 - 0.3 * 0.4,
      0.25 + 1.25 * 0.5,
      0.4 - 0.2 * 0.4,
      0.1,
      0.1,
      0.1,
      false,
      [1.2, 1.2, 0],
    );
    box(
      -0.3 + 0.3 * 0.4,
      0.25 + 1.25 * 0.5,
      0.4 - 0.2 * 0.4,
      0.1,
      0.1,
      0.1,
      false,
      [1.2, 1.2, 0],
    );
    box(
      -0.3,
      0.25 + 1.25 * 0.5,
      0.4 + 0.3 * 0.4,
      0.1,
      0.1,
      0.1,
      false,
      [1.2, 1.2, 0],
    );
    box(-0.3, 0.4 + 1.25 * 0.5, 0.4, 0.1, 0.1, 0.1, false, [1.2, 1.2, 0]);
  },

  porcelainDipper(box, cylinder, sphere, star) {
    box(-0.3, 0.4, 0.4, 0.125, 1.5, 0.125, false, [1.4, 1.4, 1.4]);
    box(-0.3, -0.1, 0.4, 0.175, 0.5, 0.175, false, [1.2, 1.2, 0]);
    cylinder(
      -0.3,
      0.45 + 1.2 * 0.5 + 0.5,
      0.4,
      0.2,
      0.075,
      10,
      1.5,
      1.5,
      1.5,
      90,
      0,
      0,
    );
    cylinder(
      -0.3,
      0.45 + 1.2 * 0.5 + 0.5 + 0.2,
      0.4,
      0.125,
      0.075,
      10,
      1.5,
      1.5,
      1.5,
      90,
      0,
      0,
    );
    cylinder(
      -0.3,
      0.45 + 1.2 * 0.5 + 0.5 - 0.2,
      0.4,
      0.125,
      0.075,
      10,
      1.5,
      1.5,
      1.5,
      90,
      0,
      0,
    );
    cylinder(
      -0.3,
      0.45 + 1.2 * 0.5 + 0.501,
      0.4,
      0.3,
      -0.8,
      10,
      1.4,
      1.4,
      1.4,
      90,
      0,
      0,
    );
    box(-0.5, 1, 0.4, 0.175, 0.5, 0.12, [0, 0, 70], [0, 0, 1.4]);
    box(-0.5, 0.825, 0.4, 0.175, 0.4, 0.12, [0, 0, -70], [0, 0, 1.4]);
    box(-0.5 + 0.4, 1, 0.4, 0.175, 0.5, 0.12, [0, 0, -70], [1.4, 0, 0]);
    box(-0.5 + 0.4, 0.825, 0.4, 0.175, 0.4, 0.12, [0, 0, 70], [1.4, 0, 0]);
  },

  petalWand(box, cylinder, sphere, star) {
    box(-0.3 - 0.1, 0.6, 0.3 + 0.1, 0.15, 1.5, 0.15, false, [0, 0.7, 0]);
    box(-0.3 - 0.1, 1.45, 0.3 + 0.1, 0.3, 0.3, 0.3, [45, 0, 45], [1.5, 1.2, 0]);
    for (let i = 0; i < MATH.TWO_PI; i += MATH.TWO_PI / 3) {
      box(
        -0.3 + Math.sin(i) * 0.5 - 0.1,
        1.35,
        0.3 + 0.1 + Math.cos(i) * 0.5,
        0.7,
        0.1,
        0.7,
        [Math.sin(i) * -30, 0, Math.cos(i) * -30],
        [1.2, 1.2, 1.2],
      );
    }
    for (
      let i = MATH.QUATER_PI;
      i < MATH.TWO_PI + MATH.QUATER_PI;
      i += MATH.TWO_PI / 3
    ) {
      box(
        -0.3 + Math.sin(i) * 0.5 - 0.1,
        1.35,
        0.3 + 0.1 + Math.cos(i) * 0.5,
        0.7,
        0.1,
        0.7,
        [Math.sin(i) * 30, 0, Math.cos(i) * 30],
        [1.2, 1.2, 1.2],
      );
    }
    for (let i = 0; i < MATH.TWO_PI; i += MATH.TWO_PI / 3) {
      box(
        -0.3 - 0.1 + Math.sin(i) * 0.5,
        1.2,
        0.3 + 0.1 + Math.cos(i) * 0.5,
        0.7,
        0.1,
        0.7,
        [60, i * MATH.TO_DEG, 0],
        [1.2, 1.2, 1.2],
      );
      box(
        -0.3 - 0.1 + Math.sin(i) * 0.25,
        1.2,
        0.3 + 0.1 + Math.cos(i) * 0.25,
        0.7,
        0.1,
        0.7,
        [-60, i * MATH.TO_DEG, 0],
        [1.2, 1.2, 1.2],
      );
    }
  },

  darkScythe(box, cylinder, sphere, star) {
    box(-0.55, 0.75, 0.55, 0.15, 2.2, 0.15, [0, 0, 0], [0.1, 0, 0], [0, 0, 30]);
    box(-0.55, 1.6, 1.1, 0.15, 0.6, 1.2, [0, 0, 0], [0.1, 0, 0], [0, 0, 30]);
    box(-0.55, 1.5, 2, 0.15, 0.5, 1, [20, 0, 0], [0.1, 0, 0], [0, 0, 30]);
    box(-0.55, 1.2, 2.6, 0.15, 0.35, 1, [40, 0, 0], [0.1, 0, 0], [0, 0, 30]);
    box(
      -0.55,
      1.3,
      1.1,
      0.175,
      0.6 * 0.3,
      1.2,
      [0, 0, 0],
      [1.2, 0, 0.4],
      [0, 0, 30],
    );
    box(
      -0.55,
      1.2,
      2,
      0.175,
      0.5 * 0.3,
      1,
      [20, 0, 0],
      [1.2, 0, 0.4],
      [0, 0, 30],
    );
    box(
      -0.55,
      0.9,
      2.6,
      0.175,
      0.3 * 0.5,
      0.5,
      [40, 0, 0],
      [1.2, 0, 0.4],
      [0, 0, 30],
    );
    box(-0.55, 1.95, 0.1, 0.15, 0.15, 1.3, [20, 0, 0], [0.1, 0, 0], [0, 0, 30]);
    box(
      -0.55,
      1.25,
      0.1,
      0.15,
      0.15,
      0.9,
      [-20, 0, 0],
      [0.1, 0, 0],
      [0, 0, 30],
    );
  },

  tidePopper(box, cylinder, sphere, star, finalRotation) {
    cylinder(-0.4, 2.2, 0.4, 0.25, 0.05, 15, 1, 3, 7, 90, 0, 0, 0.25);
    cylinder(-0.4, 1.6, 0.4, 0.3, 0.05, 15, 1, 3, 7, 90, 0, 0, 0.3);
    cylinder(-0.4, 1.1, 0.4, 0.4, 0.05, 15, 1, 3, 7, 90, 0, 0, 0.4);
    cylinder(-0.4, 1.7, 0.4, 0.3, 2.25, 10, 0.3, 1, 2, 90, 0, 0, 0);
    box(-0.4, 0.5, 0.4, 0.15, 1.4, 0.15, false, [0.1, 0.8, 1.8]);
    sphere(-0.4 - 0.8, 0.85, 0.4, 0.25, 1, 100, 100, 100);
    sphere(-0.4 + 0.8, 0.85, 0.4, 0.25, 1, 100, 100, 100);
    sphere(-0.4, 0.85, 0.4 - 0.8, 0.25, 1, 100, 100, 100);
    sphere(-0.4, 0.85, 0.4 + 0.8, 0.25, 1, 100, 100, 100);
    finalRotation(20, -20, 0);
  },

  gummyBaller(box, cylinder, sphere, star) {
    cylinder(-0.4, -0.1, 0.4, 0.15, 0.35, 15, 0.26, 2.7, 1.1, 90, 0, 0, 0.15);
    cylinder(-0.4, 0.8, 0.4, 0.1, 1.75, 15, 1.5, 0.15, 1.5, 90, 0, 0, 0.1);
    sphere(-0.4, 1.6, 0.4, 0.5, 1, 0.26, 2.7, 1.1);
    cylinder(-0.4, 1.75, 0.4, 0.45, 0.25, 15, 1.5, 0.15, 1.5, 90, 0, 0, 0.6);
    sphere(-0.4 - 0.3, 1.85, 0.4, 0.25, 1, 0.26, 2.7, 1.1);
    sphere(-0.4 + 0.3, 1.85, 0.4, 0.25, 1, 0.26, 2.7, 1.1);
    sphere(-0.4, 1.85, 0.4 - 0.3, 0.25, 1, 1.5 * 1.75, 0.65 * 1.75, 1.5 * 1.75);
    sphere(-0.4, 1.85, 0.4 + 0.3, 0.25, 1, 1.5 * 1.75, 0.65 * 1.75, 1.5 * 1.75);
  },
};

// ---------------------------------------------------------------------------
// Particle emitters
// Signature: (tool, dt, gameState) — tool.particleTimer replaces the old
// toolParticle global. Each function returns early if the timer hasn't fired.
// ---------------------------------------------------------------------------

const TOOL_PARTICLES = {
  pulsar(tool, dt, gameState) {
    tool.particleTimer -= dt;
    if (tool.particleTimer > 0) return;
    tool.particleTimer = 0.3;

    const player = gameState.player;
    let x = -player.bodyDir[2] + player.bodyDir[0];
    let z = player.bodyDir[0] + player.bodyDir[2];
    x *= 0.3;
    z *= 0.4;

    ParticleRenderer.add({
      x: player.body.position.x + x,
      y: player.body.position.y + 0.2 + 1.1 * 0.5 + 0.25,
      z: player.body.position.z + z,
      vx: MATH.random(-0.3, 0.3),
      vy: (Math.random() - 0.5) * 0.5,
      vz: MATH.random(-0.3, 0.3),
      grav: 1.5,
      size: MATH.random(30, 70),
      col: [0, 1, 0],
      life: 1,
      rotVel: MATH.random(-3, 3),
      alpha: 2,
    });
  },

  bubbleWand(tool, dt, gameState) {
    tool.particleTimer -= dt;
    if (tool.particleTimer > 0) return;
    tool.particleTimer = 0.4;

    const player = gameState.player;
    let x = -player.bodyDir[2] + player.bodyDir[0];
    let z = player.bodyDir[0] + player.bodyDir[2];
    x *= 0.3;
    z *= 0.4;

    ParticleRenderer.add({
      x: player.body.position.x + x + MATH.random(-0.4, 0.4),
      y:
        player.body.position.y +
        0.45 +
        1.2 * 0.5 +
        0.5 +
        MATH.random(-0.4, 0.4),
      z: player.body.position.z + z + MATH.random(-0.4, 0.4),
      vx: MATH.random(-0.6, 0.6),
      vy: (Math.random() - 0.5) * 0.5,
      vz: MATH.random(-0.6, 0.6),
      grav: 1.5,
      size: MATH.random(100, 150),
      col: [0, 0.6, 0.9],
      life: 1,
      rotVel: MATH.random(-3, 3),
      alpha: 0.8,
    });
  },

  scythe(tool, dt, gameState) {
    tool.particleTimer -= dt;
    if (tool.particleTimer > 0) return;
    tool.particleTimer = 0.4;

    const player = gameState.player;
    let x = player.bodyDir[0] + -player.bodyDir[2] * 1.2;
    let z = player.bodyDir[2] * 0 + player.bodyDir[0] * 1.2;
    let y = 1.5;
    const r = Math.random() * 1.5;
    x += player.bodyDir[0] * r;
    y -= r * 0.25;
    z += player.bodyDir[2] * r;

    ParticleRenderer.add({
      x: player.body.position.x + x,
      y: player.body.position.y + y,
      z: player.body.position.z + z,
      vx: MATH.random(-0.8, 0.8),
      vy: 0.75,
      vz: MATH.random(-0.8, 0.8),
      grav: 1.5,
      size: MATH.random(70, 120),
      col: [1, MATH.random(0.3, 0.6), 0],
      life: 1,
      rotVel: MATH.random(-3, 3),
      alpha: 4.5,
    });
  },

  porcelainDipper(tool, dt, gameState) {
    tool.particleTimer -= dt;
    if (tool.particleTimer > 0) return;
    tool.particleTimer = 0.5;

    const player = gameState.player;
    const r = 0.325;
    let x = (-player.bodyDir[2] + player.bodyDir[0]) * r;
    let z = (player.bodyDir[0] + player.bodyDir[2]) * r;

    ParticleRenderer.add({
      x: player.body.position.x + x + MATH.random(-0.4, 0.4),
      y: player.body.position.y + 1.75 + MATH.random(-0.4, 0.4),
      z: player.body.position.z + z + MATH.random(-0.4, 0.4),
      vx: MATH.random(-0.8, 0.8),
      vy: Math.random() * 0.5 + 0.4,
      vz: MATH.random(-0.8, 0.8),
      grav: -1.25 * Math.random() - 0.25,
      size: MATH.random(20, 60),
      col: [0.95, 0.95, 0.95],
      life: 1,
      rotVel: MATH.random(-3, 3),
      alpha: 0.5,
    });
  },

  petalWand(tool, dt, gameState) {
    tool.particleTimer -= dt;
    if (tool.particleTimer > 0) return;
    tool.particleTimer = 0.3;

    const player = gameState.player;
    const r = 0.325;
    let x = (-player.bodyDir[2] + player.bodyDir[0]) * r;
    let z = (player.bodyDir[0] + player.bodyDir[2]) * r;

    ParticleRenderer.add({
      x: player.body.position.x + x,
      y: player.body.position.y + 1.65,
      z: player.body.position.z + z,
      vx: MATH.random(-0.9, 0.9),
      vy: Math.random() * 0.5 + 0.2,
      vz: MATH.random(-0.9, 0.9),
      grav: -1.5,
      size: MATH.random(20, 50),
      col: [0.9, 0.7, 0.3],
      life: 0.7,
      rotVel: MATH.random(-3, 3),
      alpha: 0.35,
    });
  },

  darkScythe(tool, dt, gameState) {
    tool.particleTimer -= dt;
    if (tool.particleTimer > 0) return;
    tool.particleTimer = 0.05;

    const player = gameState.player;
    let x = player.bodyDir[0] + -player.bodyDir[2] * 1.2;
    let z = player.bodyDir[2] * 0 + player.bodyDir[0] * 1.2;
    let y = 1.5;
    const r = Math.random() * 2.5;
    x += player.bodyDir[0] * r;
    y -= r * 0.25;
    z += player.bodyDir[2] * r;

    ParticleRenderer.add({
      x: player.body.position.x + x,
      y: player.body.position.y + y,
      z: player.body.position.z + z,
      vx: -player.bodyDir[2] * 2,
      vy: 1.75,
      vz: player.bodyDir[0] * 2,
      grav: 0,
      size: MATH.random(70, 120),
      col: [1, 0, Math.random()],
      life: 1,
      rotVel: MATH.random(-3, 3),
      alpha: 4.5,
    });
  },

  tidePopper(tool, dt, gameState) {
    tool.particleTimer -= dt;
    if (tool.particleTimer > 0) return;
    tool.particleTimer = 0.1;

    const player = gameState.player;
    const r = MATH.random(0.2, 0.9);
    let x = (-player.bodyDir[2] + player.bodyDir[0]) * r;
    let z = (player.bodyDir[0] + player.bodyDir[2]) * r;

    ParticleRenderer.add({
      x: player.body.position.x + x,
      y: player.body.position.y + MATH.random(0.1, 2.5),
      z: player.body.position.z + z,
      vx: x,
      vy: 1.6,
      vz: z,
      grav: 0,
      size: MATH.random(20, 50),
      col: [0.1, 0.7, 1],
      life: 0.7,
      rotVel: MATH.random(-3, 3),
      alpha: 0.5,
    });
  },

  gummyBaller(tool, dt, gameState) {
    const player = gameState.player;
    const meshes = gameState.meshes; // TODO: confirm gameState.meshes is the right path

    const x = (-player.bodyDir[2] + player.bodyDir[0]) * 0.4;
    const z = (player.bodyDir[0] + player.bodyDir[2]) * 0.4;

    player.lagPos[0] += (player.body.position.x - player.lagPos[0]) * dt * 12.5;
    player.lagPos[1] += (player.body.position.y - player.lagPos[1]) * dt * 12.5;
    player.lagPos[2] += (player.body.position.z - player.lagPos[2]) * dt * 12.5;

    meshes.explosions.instanceData.push(
      player.lagPos[0] + x,
      player.lagPos[1] + 2 + player.gummyBallSize * 0.3,
      player.lagPos[2] + z,
      0.9 * player.isNight,
      0.18 * player.isNight,
      0.9 * player.isNight,
      1,
      player.gummyBallSize * 0.5,
      1,
    );

    tool.particleTimer -= dt;
    if (tool.particleTimer > 0) return;
    tool.particleTimer = 0.4 / player.gummyBallSize;

    ParticleRenderer.add({
      x: player.lagPos[0] + x,
      y: player.lagPos[1] + 2 + player.gummyBallSize * 0.3,
      z: player.lagPos[2] + z,
      vx: MATH.random(-player.gummyBallSize, player.gummyBallSize),
      vy: MATH.random(-player.gummyBallSize, player.gummyBallSize),
      vz: MATH.random(-player.gummyBallSize, player.gummyBallSize),
      grav: 0,
      size: MATH.random(20, 50) * player.gummyBallSize,
      col: [0.1, 0.8, 1],
      life: 0.75,
      rotVel: MATH.random(-3, 3),
      alpha: player.gummyBallSize - 0.5,
    });
  },
};

// ---------------------------------------------------------------------------
// Ability implementations
// Signature: (tool, gameState) — called by Tool.swing() when
// player.toolUses % abilityInterval === 0.
// ---------------------------------------------------------------------------

const TOOL_ABILITIES = {
  bubbleWand(tool, gameState) {
    const player = gameState.player;
    const fieldInfo = gameState.fieldManager.fieldInfo;
    if (!player.fieldIn) return;

    // TODO: import Bubble from its converted entity path
    gameState.objects.bubbles.push(
      new Bubble(
        player.fieldIn,
        (Math.random() * fieldInfo[player.fieldIn].width) | 0,
        (Math.random() * fieldInfo[player.fieldIn].length) | 0,
      ),
    );
  },

  scythe(tool, gameState) {
    const player = gameState.player;
    // TODO: import Flame from its converted entity path
    if (player.fieldIn) {
      gameState.objects.flames.push(
        new Flame(player.fieldIn, player.flowerIn.x, player.flowerIn.z),
      );
    } else {
      gameState.objects.flames.push(
        new Flame(
          player.body.position.x,
          player.body.position.y,
          player.body.position.z,
          true,
        ),
      );
    }
  },

  goldenRake(tool, gameState) {
    const player = gameState.player;
    if (!player.fieldIn) return;
    // TODO: import Scratch from its converted entity path
    gameState.objects.mobs.push(
      new Scratch(null, player.flowerIn.x, player.flowerIn.z, true),
    );
  },

  // CHQ: in the original source this was labelled as pulsar's ability but
  // mutated gear.tool.sparkStaff.collectPattern — almost certainly a
  // copy-paste bug. Treated here as operating on the pulsar's own pattern.
  pulsar(tool, gameState) {
    const player = gameState.player;
    const fieldInfo = gameState.fieldManager.fieldInfo;

    if (!player.fieldIn) {
      tool.collectPattern = [
        [2, 1],
        [-2, 1],
        [0, -2],
      ];
      return;
    }

    const pool = [
      [-5, 0],
      [-4, -3],
      [-4, -2],
      [-4, -1],
      [-4, 0],
      [-4, 1],
      [-4, 2],
      [-4, 3],
      [-3, -4],
      [-3, -3],
      [-3, -2],
      [-3, -1],
      [-3, 0],
      [-3, 1],
      [-3, 2],
      [-3, 3],
      [-3, 4],
      [-2, -4],
      [-2, -3],
      [-2, -2],
      [-2, -1],
      [-2, 0],
      [-2, 1],
      [-2, 2],
      [-2, 3],
      [-2, 4],
      [-1, -4],
      [-1, -3],
      [-1, -2],
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [-1, 2],
      [-1, 3],
      [-1, 4],
      [0, -5],
      [0, -4],
      [0, -3],
      [0, -2],
      [0, -1],
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [1, -4],
      [1, -3],
      [1, -2],
      [1, -1],
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
      [2, -4],
      [2, -3],
      [2, -2],
      [2, -1],
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
      [2, 4],
      [3, -4],
      [3, -3],
      [3, -2],
      [3, -1],
      [3, 0],
      [3, 1],
      [3, 2],
      [3, 3],
      [3, 4],
      [4, -3],
      [4, -2],
      [4, -1],
      [4, 0],
      [4, 1],
      [4, 2],
      [4, 3],
      [5, 0],
    ];

    tool.collectPattern = [];
    for (let i = 0; i < 3; i++) {
      const r = (Math.random() * pool.length) | 0;
      tool.collectPattern.push(pool[r]);
      pool.splice(r, 1);
    }
  },

  sparkStaff(tool, gameState) {
    const player = gameState.player;

    if (!player.fieldIn) {
      tool.collectPattern = [
        [2, 1],
        [-2, 1],
        [0, -2],
      ];
      return;
    }

    // CHQ: original had an unused `f=fieldInfo[player.fieldIn]` declaration
    // before the loop, then immediately shadowed it with `f=a[r]` inside
    // the loop — the fieldInfo reference was never actually used. Removed.
    const pool = [
      [-5, 0],
      [-4, -3],
      [-4, -2],
      [-4, -1],
      [-4, 0],
      [-4, 1],
      [-4, 2],
      [-4, 3],
      [-3, -4],
      [-3, -3],
      [-3, -2],
      [-3, -1],
      [-3, 0],
      [-3, 1],
      [-3, 2],
      [-3, 3],
      [-3, 4],
      [-2, -4],
      [-2, -3],
      [-2, -2],
      [-2, -1],
      [-2, 0],
      [-2, 1],
      [-2, 2],
      [-2, 3],
      [-2, 4],
      [-1, -4],
      [-1, -3],
      [-1, -2],
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [-1, 2],
      [-1, 3],
      [-1, 4],
      [0, -5],
      [0, -4],
      [0, -3],
      [0, -2],
      [0, -1],
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [1, -4],
      [1, -3],
      [1, -2],
      [1, -1],
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
      [2, -4],
      [2, -3],
      [2, -2],
      [2, -1],
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
      [2, 4],
      [3, -4],
      [3, -3],
      [3, -2],
      [3, -1],
      [3, 0],
      [3, 1],
      [3, 2],
      [3, 3],
      [3, 4],
      [4, -3],
      [4, -2],
      [4, -1],
      [4, 0],
      [4, 1],
      [4, 2],
      [4, 3],
      [5, 0],
    ];

    tool.collectPattern = [];
    for (let i = 0; i < 3; i++) {
      const r = (Math.random() * pool.length) | 0;
      tool.collectPattern.push(pool[r]);
      pool.splice(r, 1);
    }
  },

  porcelainDipper(tool, gameState) {
    const player = gameState.player;
    // TODO: import ReverseExplosion from its converted entity path
    gameState.objects.explosions.push(
      new ReverseExplosion({
        col: [1, 1, 1],
        pos: [
          player.body.position.x,
          player.body.position.y,
          player.body.position.z,
        ],
        life: 0.4,
        size: 5,
        alpha: 2,
        height: 500,
      }),
    );

    if (player.fieldIn) {
      // TODO: import / route collectPollen through gameState
      collectPollen(
        {
          x: player.flowerIn.x,
          z: player.flowerIn.z,
          pattern: TOOL_DATA.porcelainDipper.collectPattern,
          amount: 50,
          stackHeight: 0.6 + Math.random() * 0.5,
        },
        gameState,
      );
    }
  },

  petalWand(tool, gameState) {
    const player = gameState.player;
    // TODO: import PetalShuriken from its converted entity path
    gameState.objects.mobs.push(
      new PetalShuriken(
        [
          player.body.position.x,
          player.body.position.y + 0.25,
          player.body.position.z,
        ],
        player.bodyDir.slice(),
      ),
    );
  },

  darkScythe(tool, gameState) {
    const player = gameState.player;
    const objects = gameState.objects;
    const fieldInfo = gameState.fieldManager.fieldInfo;

    // TODO: import DarkScoopingTrail from its converted entity path
    objects.mobs.push(new DarkScoopingTrail(gameState));

    if (player.fieldIn && !player.attacked.length) {
      const x = Math.round(
        player.body.position.x - fieldInfo[player.fieldIn].x,
      );
      const z = Math.round(
        player.body.position.z - fieldInfo[player.fieldIn].z,
      );
      const validCells = [];

      for (const offset of tool.collectPattern) {
        const cx = offset[0] + x;
        const cz = offset[1] + z;
        if (
          cx >= 0 &&
          cx < fieldInfo[player.fieldIn].width &&
          cz >= 0 &&
          cz < fieldInfo[player.fieldIn].length
        ) {
          validCells.push([cx, cz]);
        }
      }

      for (const f of objects.flames) {
        if (MATH.indexOfArrays(validCells, [f.x, f.z]) > -1) {
          f.turnDark();
        }
      }
    } else {
      for (const f of objects.flames) {
        if (
          f.isStatic &&
          vec3.sqrDist(f.pos, [
            player.body.position.x + player.bodyDir[0] * 2,
            player.body.position.y,
            player.body.position.z + player.bodyDir[2] * 2,
          ]) < 7
        ) {
          f.turnDark();
        }
      }
    }
  },

  tidePopper(tool, gameState) {
    const player = gameState.player;
    // TODO: import Wave from its converted entity path
    gameState.objects.mobs.push(
      new Wave(
        [
          player.body.position.x,
          player.body.position.y + 0.25,
          player.body.position.z,
        ],
        player.bodyDir.slice(),
      ),
    );
  },
};
