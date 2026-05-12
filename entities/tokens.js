// entities/tokens.js

// CHQ: Gemini AI generated file

export class Token {
  constructor(type, amount, pos) {
    this.type = type; // 'honey', 'ticket', 'treat', 'strawberry'
    this.amount = amount;
    this.pos = [...pos];
    this.velocity = [Math.random() - 0.5, 2, Math.random() - 0.5]; // Initial jump
    this.lifeSpan = 15.0; // Seconds before it despawns
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
