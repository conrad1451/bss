// entities/tokens.js

// CHQ: Gemini AI generated file

export class Token {
  constructor(type, amount, pos, isBossDrop = false) {
    this.type = type; // 'honey', 'ticket', 'treat', 'strawberry'
    this.amount = amount;
    this.pos = [...pos];

    // CHQ: Gemini AI increased explosion radius for boss drops
    // If it's a boss drop, give it a wider horizontal "explosion"
    const spread = isBossDrop ? 5 : 1;
    this.velocity = [
      (Math.random() - 0.5) * spread,
      Math.random() * 4 + 2, // Upward bounce
      (Math.random() - 0.5) * spread,
    ];

    // CHQ: Gemini AI increased lifespan of loot from boss drops
    this.lifeSpan = isBossDrop ? 30.0 : 15.0; // Boss loot lasts longer
  }

  update(dt) {
    // Basic gravity and life timer
    this.velocity[1] -= 9.8 * dt;
    this.pos[0] += this.velocity[0] * dt;
    this.pos[1] += this.velocity[1] * dt;
    this.pos[2] += this.velocity[2] * dt;

    if (this.pos[1] < 0) this.pos[1] = 0; // Ground floor

    this.lifeSpan -= dt;
    return this.lifeSpan <= 0;
  }
}

// CHQ: Claude AI (Sonnet) added refactored version of class
export class LootToken {
  /**
   * @param {number} life - Base lifespan in seconds.
   * @param {number[]} pos - World-space spawn position [x, y, z].
   * @param {string} type - Item key into gameState.items, or "honey"
   *   as a special-cased pseudo-item.
   * @param {number} amount - Quantity to grant on collection. Sign is
   *   normalized to positive (matches the original's Math.abs(amount)).
   * @param {boolean} [canBeLinked=false] - Whether Link's effect can
   *   auto-collect this token (see effectsConfig.link in data/effects.js).
   * @param {string} [source] - Optional display label appended to the
   *   collection message, e.g. "(from Ant Challenge)".
   * @param {string[]} [statsToAdd] - Extra player.stats keys to increment
   *   by 1 on collection, alongside the automatic `${type}Tokens` stat.
   * @param {Object} gameState - The live game state object.
   */
  constructor(
    life,
    pos,
    type,
    amount,
    canBeLinked = false,
    source,
    statsToAdd,
    gameState,
  ) {
    this.gameState = gameState;

    this.statsToAdd = statsToAdd || [];
    this.life = life;
    this.pos = pos;
    this.type = type;
    this.amount = Math.abs(amount);
    this.rotation = Math.random() * MATH.TWO_PI;
    this.canBeLinked = canBeLinked;
    this.from = source;
    this.collected = false;

    if (this.type === "honey") {
      this.u = (128 * 3) / 2048;
      this.v = (128 * 4) / 2048;
    } else {
      const itemDef = gameState.items[this.type];
      this.u = itemDef.u;
      this.v = itemDef.v;
    }
  }

  /**
   * @param {number} index - This token's index in gameState.objects.tokens.
   * @returns {void}
   */
  die(index) {
    this.gameState.objects.tokens.splice(index, 1);
  }

  /**
   * Marks this loot token as collected: grants honey or an inventory item,
   * tallies stats, and shows a floating message/combat text.
   *
   * @returns {void}
   */
  collect() {
    if (this.collected) return;

    const { player, items, textRenderer } = this.gameState;

    this.collected = true;
    this.life = 0.75;

    const typeStatKey = `${this.type}Tokens`;
    player.stats[typeStatKey] = (player.stats[typeStatKey] || 0) + 1;

    for (const stat of this.statsToAdd) {
      player.stats[stat] = (player.stats[stat] || 0) + 1;
    }

    if (this.type === "honey") {
      this.amount = Math.round((player.honeyFromTokens ?? 1) * this.amount);
      player.honey += this.amount;

      if (player.extraInfo.enablePollenText && textRenderer) {
        textRenderer.add(
          this.amount + "",
          [
            player.body.position.x,
            player.body.position.y + 2,
            player.body.position.z,
          ],
          this.gameState.COLORS?.honey,
          0,
          "+",
        );
      }

      addMessage(
        `+${MATH.addCommas(this.amount + "")} Honey${
          this.from ? ` (from ${this.from})` : ""
        }`,
      );
      player.stats.honeyTokens = (player.stats.honeyTokens || 0) + 1;
    } else {
      // TODO: the original routed this through player.addItem(type, amount),
      // which also called out.updateInventory() to refresh hotbar DOM
      // elements directly (see stubbedOldIndex.js). The current gameState
      // model (state/gameState.js) tracks items as a flat gameState.items
      // map with no addItem()/inventory-changed event wired up for it yet
      // (eventManager.js's updateInventory() only touches
      // gameState.player.inventory, a different, smaller collection used
      // for translators/spiritPetals/cogs) - mutating directly here until
      // that's built out.
      items[this.type].amount += this.amount;

      addMessage(
        `+${MATH.addCommas(this.amount + "")} ${
          this.amount > 1
            ? MATH.doPlural(MATH.doGrammar(this.type))
            : MATH.doGrammar(this.type)
        }${this.from ? ` (from ${this.from})` : ""}`,
      );
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
    const { player, meshes } = this.gameState;

    this.life -= dt;

    if (this.collected) {
      // CHQ: preserved verbatim from the original  -
      // `this.pos[1]+=(this.pos[1]+5-this.pos[1])*dt` algebraically
      // simplifies to `this.pos[1] += 5*dt` regardless of current
      // position (the `this.pos[1]` terms cancel out). This looks like
      // it was meant to ease toward a target height rather than rise at
      // a flat rate, but reproducing it as originally written rather than
      // guessing at the intended easing formula.
      this.pos[1] += (this.pos[1] + 5 - this.pos[1]) * dt;
      this.rotation += dt * 20;

      meshes.tokens.instanceData.push(
        this.pos[0],
        this.pos[1],
        this.pos[2],
        this.rotation,
        this.u,
        this.v,
        this.life * 5,
        1,
      );
    } else {
      this.rotation += dt * 2.6;

      meshes.tokens.instanceData.push(
        this.pos[0],
        this.pos[1],
        this.pos[2],
        this.rotation,
        this.u,
        this.v,
        this.life * 0.3,
        1,
      );

      if (
        Math.abs(this.pos[0] - player.body.position.x) +
          Math.abs(this.pos[1] - player.body.position.y) +
          Math.abs(this.pos[2] - player.body.position.z) <
        1.75
      ) {
        this.collect();
      }
    }

    return this.life <= 0;
  }
}
