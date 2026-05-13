// entities/npcs.js
import { questDefinitions } from "../data/quests.js";

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

  interactv1(gameState) {
    // This is called by the "E" key trigger we set up!
    this.isTalking = true;
    this.processQuestLogic(gameState);
  }

  interactv2(gameState) {
    // 1. Check if the player has an active quest from this NPC
    const active = gameState.activeQuests.find((q) => q.npc === this.name);

    if (active) {
      this.checkProgress(active, gameState);
    } else {
      this.offerNextQuest(gameState);
    }
  }

  // CHQ: Gemini AI filled in the method
  checkProgress(quest, gameState) {
    const definition = questDefinitions[quest.id];
    const requirements = definition.requirements;

    // Check if every requirement (e.g., pollen: 100) is met
    const isComplete = Object.keys(requirements).every((key) => {
      return (gameState.stats[key] || 0) >= requirements[key];
    });

    if (isComplete) {
      gameState.ui.dialogue = `Great job! You finished ${definition.name}!`;
      // Move from active to completed
      gameState.completedQuests.push(quest.id);
      gameState.activeQuests = gameState.activeQuests.filter(
        (q) => q.id !== quest.id,
      );

      // Reward the player (optional logic)
      if (definition.rewards) {
        gameState.honey += definition.rewards.honey || 0;
      }
    } else {
      gameState.ui.dialogue = `You still need more resources for ${definition.name}. Keep going!`;
    }
  }

  // CHQ: Gemini AI filled in the method
  offerNextQuest(gameState) {
    // Find quest IDs for this NPC that aren't finished yet
    const availableQuests = Object.keys(questDefinitions).filter((id) => {
      const isMine = questDefinitions[id].npc === this.name;
      const isDone = gameState.completedQuests.includes(id);
      return isMine && !isDone;
    });

    if (availableQuests.length > 0) {
      const nextId = availableQuests[0]; // Take the first one available

      gameState.activeQuests.push({
        id: nextId,
        npc: this.name,
        startTime: Date.now(),
      });

      // Update UI to show the new quest
      gameState.ui.dialogue = `${this.name}: ${questDefinitions[nextId].description}`;
      gameState.ui.prompt = `New Quest: ${questDefinitions[nextId].name}`;
    } else {
      gameState.ui.dialogue = `${this.name}: I have no more tasks for you!`;
    }
    // REMOVED the redundant 'nextQuestId' block here to avoid the ReferenceError
  }

  // CHQ: Gemini AI filled in the method
  processQuestLogic(gameState) {
    // Use your v2 logic to handle the flow
    this.interactv2(gameState);
  }
}
