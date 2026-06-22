// entities/mark.js

import { vec3 } from "gl-matrix";

// CHQ: Claude AI (Sonnet) refactored file

// Normalised RGB colours used by the renderer for each mark type.
// Kept here so Mark carries no dependency on a global COLORS object.
const MARK_COLORS = {
  pollenMark: [0.0, 1.0, 0.0],
  honeyMark: [1.0, 0.75, 0.0], // COLORS.honey_normalized equivalent
  preciseMark: [1.0, 0.0, 1.0],
};

export class Mark {
  /**
   * A ground-projection aura that periodically surges to collect pollen or
   * convert honey for the player while they stand inside it.
   *
   * @param {string}  field     - Key of the field this mark belongs to (e.g. "sunflower").
   * @param {number}  x         - Flower-grid X coordinate within that field.
   * @param {number}  z         - Flower-grid Z coordinate within that field.
   * @param {string}  type      - Mark variant: "pollenMark" | "honeyMark" | "preciseMark".
   * @param {number}  beeLevel  - Level of the bee that placed this mark; scales duration/power.
   * @param {Object}  gameState - The live game state object produced by createInitialState.
   */
  constructor(field, x, z, type, beeLevel, gameState) {
    const { player, fieldInfo } = gameState;

    this.field = field;
    this.x = x;
    this.z = z;
    this.type = type;
    this.beeLevel = beeLevel;

    // --- Lifespan ---
    const baseDuration = type === "preciseMark" ? 15 : 7;
    this.life =
      (baseDuration + (beeLevel - 1) * 0.2) * (player.markDuration || 1);

    // --- World position ---
    const fi = fieldInfo[field];
    this.pos = [fi.x + x, fi.y + 0.5, fi.z + z];

    // --- Geometry / collision ---
    this.diameter = type === "preciseMark" ? 14 : 10;
    this.sqSize = this.diameter * 0.5 * (this.diameter * 0.5); // squared radius

    // --- Visual state (read by the renderer each frame) ---
    this.rot = Math.random() * 6.12;
    this.typeCol = MARK_COLORS[type] ?? [1, 1, 1];

    // --- Surge state ---
    this.surgeLimit = 5;
    this.surgeAfter = Infinity; // armed by surge(), not active at spawn

    // --- Honey-conversion sub-timer ---
    this.honeyMarkConvert = 0;

    // --- Misc ---
    this.gummyBallHitTimer = 0;

    // Pre-compute the list of flowers inside the circular radius for pollen collection.
    this.flowers = [];
    const rad = (this.diameter * 0.5) | 0;
    for (let fx = -rad; fx <= rad; fx++) {
      for (let fz = -rad; fz <= rad; fz++) {
        if (fx * fx + fz * fz <= rad * rad) {
          this.flowers.push([fx, fz]);
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Arms a surge to fire after `time` seconds.
   * Called externally (e.g. by a gummy-ball hit or player interaction).
   *
   * @param {number} [time=0] - Delay before the surge fires.
   */
  surge(time = 0) {
    if (this.surgeLimit > 0) this.surgeAfter = time;
  }

  /**
   * Removes this mark from the world.
   * Mirrors the Mob.die(index, gameState) signature.
   *
   * @param {number} index     - Current index of this mark in gameState.objects.marks.
   * @param {Object} gameState - The live game state object.
   */
  die(index, gameState) {
    gameState.objects.marks.splice(index, 1);
  }

  /**
   * Per-frame simulation tick.  Call once per animation frame from updateEngine.
   * All rendering data is written to `this.*` properties; the renderer reads them
   * via gameState.objects.marks without any push calls here.
   *
   * @param {number} dt        - Delta time in seconds since the last frame.
   * @param {Object} gameState - The live game state object.
   * @returns {boolean} `true` when the mark has expired and should be removed.
   */
  update(dt, gameState) {
    const { player, objects, textRenderer, frameCount } = gameState;

    this.life -= dt;
    this.rot += dt * 2;

    // --- Player-proximity check ---
    // vec3.sqrDist avoids a sqrt; compare against precomputed squared radius.
    const playerPos = player.pos;
    const insideAura = vec3.sqrDist(this.pos, playerPos) <= this.sqSize;

    if (insideAura) {
      // STATS_TICK equivalent: apply effects at ~10 Hz (every 6 frames at 60 fps).
      if (frameCount % 6 === 0) {
        player.addEffect?.(this.type);
      }

      // Honey mark: periodically convert pollen → honey while the player stands inside.
      if (this.type === "honeyMark") {
        this.honeyMarkConvert -= dt;

        if (this.honeyMarkConvert <= 0) {
          this.honeyMarkConvert = 1; // reset 1-second sub-timer

          const beeCount = objects.bees.length || 1;
          const convertTotal = player.convertTotal || 0;
          const honeyPerPollen = player.honeyPerPollen || 1;

          const amount = Math.min(
            Math.round((convertTotal * 3) / beeCount),
            player.pollen || 0,
          );

          player.pollen = (player.pollen || 0) - amount;
          player.honey =
            (player.honey || 0) + Math.ceil(amount * honeyPerPollen);

          if (player.extraInfo?.enablePollenText && textRenderer) {
            textRenderer.add(
              amount,
              [playerPos[0], playerPos[1] + 2, playerPos[2]],
              [255, 191, 0], // honey yellow (0-255 range, matching textRenderer.add convention)
              0,
              "+",
            );
          }
        }
      }
    }

    // --- Surge tick ---
    this.surgeAfter -= dt;

    if (this.surgeAfter <= 0) {
      this.surgeAfter = Infinity;
      this.surgeLimit--;
      this.life += 1 + this.beeLevel * 0.1; // extend lifespan on surge

      this._fireSurge(gameState);
    }

    return this.life <= 0;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  // CHQ: Claude AI (Sonnet) added private helper function
  /**
   * Executes the pollen-collection burst that fires on each surge.
   * Routes through `gameState.collectPollen` so the caller can wire any
   * implementation (real or stub) without coupling Mark to the global scope.
   *
   * @param {Object} gameState - The live game state object.
   */
  _fireSurge(gameState) {
    const collectPollen = gameState.collectPollen;
    if (typeof collectPollen !== "function") return;

    const base = {
      x: this.x,
      z: this.z,
      pattern: this.flowers,
      yOffset: 2.25 + Math.random() * 0.5,
      stackOffset: 0.4 + Math.random() * 0.6,
      field: this.field,
      multiplier: this.beeLevel * 0.1 + 1,
    };

    if (this.type === "honeyMark") {
      collectPollen({ ...base, amount: 7, instantConversion: 1 });
    } else if (this.type === "pollenMark") {
      collectPollen({ ...base, amount: 7 });
    } else if (this.type === "preciseMark") {
      collectPollen({ ...base, amount: 12, alwaysCrit: true });
    }
  }
}
