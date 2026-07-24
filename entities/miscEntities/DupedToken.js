// entities/miscEntities/DupedToken.js

// CHQ: Claude AI (Sonnet) refactored: converted from a standalone class
// reading bare globals (player, objects, textRenderer, meshes, effects, dt)
// to a gameState-based class, following the pattern established in
// entities/tokens.js's Token class and entities/miscEntities/Bubble.js.

import { MATH } from "../../utils/math.js";
import { effectsConfig } from "../../data/effects.js";

export class DupedToken {
  /**
   * @param {number} life - Base lifespan in seconds, before the
   *   player.tokenLifespan*1.5 scalar is applied.
   * @param {number[]} pos - World-space spawn position [x, y, z]. Mutated
   *   in place (matches the original: `this.pos=pos; this.pos[1]+=3.5`).
   * @param {string} type - Effect/ability type key into effectsConfig.
   *   Rolls a chance (or is forced, for "glitch"/"mapCorruption" source
   *   types) to instead become a "smiley" duped token.
   * @param {Object} funcParams - Params forwarded to effectsConfig[type].func
   *   when the effect isn't a plain player.addEffect() type.
   * @param {Object} gameState - The live game state object.
   */
  constructor(life, pos, type, funcParams, gameState) {
    this.gameState = gameState;

    const { player } = gameState;

    if (
      Math.random() < 0.1 + player.extraInfo.drives.glitched * 0.001 ||
      type === "glitch" ||
      type === "mapCorruption"
    ) {
      type = "smiley";
    }

    this.funcParams = funcParams;
    this.life = life * player.tokenLifespan * 1.5;
    this.pos = pos;
    this.type = type;
    this.rotation = Math.random() * MATH.TWO_PI;
    this.func = effectsConfig[type].svg ? false : effectsConfig[type].func;
    this.canBeLinked =
      effectsConfig[type].canBeLinked === undefined ||
      effectsConfig[type].canBeLinked;

    this.collected = false;
    this.activationTimer = 0;
    this.pos[1] += 3.5;
  }

  /**
   * @param {number} index - This token's index in gameState.objects.tokens.
   * @returns {void}
   */
  die(index) {
    this.gameState.objects.tokens.splice(index, 1);
  }

  /**
   * Marks this duped token as collected: fires its effect (either a
   * bespoke func(funcParams) callback, or a plain player.addEffect(type)),
   * tallies stats, and starts the brief post-collect fade timer.
   *
   * @returns {void}
   */
  collect() {
    if (this.collected) return;

    const { player } = this.gameState;

    this.collected = true;
    this.life = 0.75;
    player.stats.abilityTokens++;

    if (effectsConfig[this.type].statsToAddTo) {
      for (const stat of effectsConfig[this.type].statsToAddTo) {
        player.stats[stat]++;
      }
    }

    if (this.func) {
      this.func(this.funcParams, this.gameState); // CHQ: Claude AI (Sonnet) add this.gameState here
    } else {
      player.addEffect(this.type);
    }
  }

  /**
   * @param {number} dt - Delta time in seconds since the previous frame.
   * @returns {boolean} true if this token's life has expired and it should
   *   be removed by the caller (matches the tokens/mobs update-loop
   *   convention in updateEngine.js: caller checks the return value, then
   *   calls die(i) itself).
   */
  update(dt) {
    const { player, textRenderer, meshes } = this.gameState;

    this.life -= dt;

    if (this.collected) {
      textRenderer.addDecalRaw(
        this.pos[0],
        this.pos[1],
        this.pos[2],
        0,
        0,
        ...textRenderer.decalUV.smiley,
        1,
        0,
        0.85,
        -3,
        -3,
        0,
      );
    } else {
      textRenderer.addDecalRaw(
        this.pos[0],
        this.pos[1],
        this.pos[2],
        0,
        0,
        ...textRenderer.decalUV.circle,
        0.1,
        0.1,
        0.1,
        3,
        3,
        0,
      );

      textRenderer.addDecalRaw(
        this.pos[0],
        this.pos[1],
        this.pos[2],
        0,
        0,
        ...textRenderer.decalUV.arc,
        1,
        1,
        1,
        -3,
        -3,
        MATH.dupedTokenLoadingArcRotation(this.activationTimer),
      );

      this.rotation += dt * 2.6;

      meshes.tokens.instanceData.push(
        this.pos[0],
        this.pos[1],
        this.pos[2],
        this.rotation,
        effectsConfig[this.type].u,
        effectsConfig[this.type].v,
        this.life * 0.15,
        1.5,
      );

      if (
        Math.abs(this.pos[0] - player.body.position.x) +
          Math.abs(this.pos[1] - 3.5 - player.body.position.y) +
          Math.abs(this.pos[2] - player.body.position.z) <
        3.5
      ) {
        this.activationTimer += dt;
      } else {
        this.activationTimer = Math.max(this.activationTimer - dt, 0);
      }

      if (this.activationTimer >= 1) {
        this.collect();
      }
    }

    return this.life <= 0;
  }
}
