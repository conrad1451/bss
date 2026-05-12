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
