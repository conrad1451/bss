// entities/npcs.js

// CHQ: Gemini AI generated

export class NPC {
  constructor(name, pos, type, gameState) {
    this.name = name;
    this.pos = pos;
    this.type = type; // e.g., "Black Bear"
    this.dialogueIndex = 0;
    this.isTalking = false;
  }

  update(dt, gameState) {
    const dist = this.getDistanceToPlayer(gameState.player.pos);

    // Auto-display an interaction prompt if close
    if (dist < 10) {
      gameState.ui.prompt = `Press E to talk to ${this.name}`;
    }
  }

  getDistanceToPlayer(playerPos) {
    // Basic 3D distance formula
    return Math.sqrt(
      Math.pow(this.pos[0] - playerPos.x, 2) +
        Math.pow(this.pos[2] - playerPos.z, 2),
    );
  }

  interact(gameState) {
    // This is called by the "E" key trigger we set up!
    this.isTalking = true;
    this.processQuestLogic(gameState);
  }

  processQuestLogic(gameState) {
    // Check if player finished "Collect 100 Pollen" etc.
  }
}
