// entities/npcs.js
import { questDefinitions } from "../data/quests.js";
import { mulberry32 } from "../utils/math.js";
// CHQ: Gemini AI generated

export class NPC {
  constructor(name, pos, type, gameState) {
    this.name = name;
    this.pos = pos;
    this.type = type; // e.g., "Black Bear"
    this.dialogueIndex = 0;
    this.isTalking = false;

    // portionsDone tracks how many times a repeatable NPC's quest loop has completed
    // We check if it exists in the saved NPC data, otherwise start at 0
    this.portionsDone = gameState?.savedNPCs?.[this.name]?.portionsDone || 0;

    // Seed for the PRNG used in repeatable quests
    this.seed =
      gameState?.savedNPCs?.[this.name]?.seed ||
      Math.floor(Math.random() * 1000000);
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

  generatePolarQuest(gameState) {
    const diff = this.portionsDone || 0;
    const rand = mulberry32(this.seed + diff);

    // Base rewards from dialogue.js
    let reward = {
      honey: 100000 + Math.floor(rand() * 12 - 2) * 10000,
      treat: 10 + Math.floor(rand() * 4) * 5,
    };

    // 50% chance for a ticket, 20% for a rare ingredient
    if (rand() < 0.5) reward.ticket = 1;
    if (rand() < 0.2) {
      const rareItems = ["glitter", "magicBean", "oil", "enzymes", "glue"];
      const picked = rareItems[Math.floor(rand() * 5)];
      reward[picked] = 1;
    }

    // Pick 1 of 8 recipes based on bee count
    const beeCount = gameState.player.discoveredBees?.length || 0;
    const recipeIndex = Math.floor(beeCount > 24 ? rand() * 8 : rand() * 7 + 1);

    let questData = this.getPolarRecipe(recipeIndex, reward);

    gameState.activeQuests.push({
      id: `polar_cook_${diff}`,
      npc: this.name,
      name: questData.name,
      requirements: questData.requirements,
      reward: reward,
      onComplete: () => {
        // Polar Bear's unique permanent buff
        gameState.player.addEffect("polarPower");
        this.portionsDone++;
      },
    });
  }

  getPolarRecipe(index, reward) {
    // Mapping the switch(index) logic from dialogue.js
    const recipes = [
      {
        name: "Keep Calm and Eat Chicken",
        req: { mondoChick: 1 },
        bonus: { neonberry: 2 },
      },
      {
        name: "Choco Milk Shake",
        req: { pollenFromSpiderField: 160000, werewolf: 1 },
        bonus: { gumdrops: 3 },
      },
      {
        name: "Microwaved Sweets",
        req: {
          redPollen: 12000,
          pollenFromPineTreeForest: 80000,
          gumdropsTokens: 3,
        },
        bonus: { jellyBeans: 1 },
      },
      {
        name: "Spiky Stew",
        req: { pollenFromCactusField: 100000, whitePollen: 75000 },
      },
      {
        name: "Pumpkin Pie",
        req: {
          pollenFromPumpkinPatch: 150000,
          pollenFromSunflowerField: 60000,
          ladybug: 1,
        },
      },
      {
        name: "Beetle Brew",
        req: {
          pollenFromPineapplePatch: 120000,
          pollenFromDandelionField: 50000,
          ladybug: 1,
          rhinoBeetle: 1,
        },
      },
      {
        name: "Candied Beetles",
        req: {
          pollenFromStrawberryField: 150000,
          pollenFromBlueFlowerField: 25000,
          rhinoBeetle: 2,
        },
      },
      {
        name: "Scorpion Salad",
        req: { pollenFromRoseField: 300000, scorpion: 1 },
      },
    ];

    const selected = recipes[index];
    if (selected.bonus) Object.assign(reward, selected.bonus);
    return { name: selected.name, requirements: selected.req };
  }
  // CHQ: Ported logic from dialogue.js to handle repeatable quests
  generateRepeatableQuest(gameState) {
    const diff = this.portionsDone || 0;
    // Initialize the PRNG seed from the NPC's base seed + completion count
    const rand = mulberry32(this.seed + diff);

    // am = amount: This scales exponentially with difficulty (portionsDone)
    const am = Math.floor(4.75 * Math.pow(diff, 4) + 500);
    const rewardHoney = Math.floor(am * 1.35);

    let req = [];
    let types = [
      "pollenFromSunflowerField",
      "pollenFromDandelionField",
      "pollenFromMushroomField",
      "pollenFromBlueFlowerField",
      "pollenFromCloverField",
    ];

    // Logic from dialogue.js: Unlock more fields as player discovers more bees
    const beeCount = gameState.player.discoveredBees?.length || 0;
    if (beeCount >= 3)
      types.push(
        "pollenFromSpiderField",
        "pollenFromStrawberryField",
        "pollenFromBambooField",
      );
    if (beeCount >= 7)
      types.push("pollenFromPineapplePatch", "pollenFromStumpField");
    if (beeCount >= 12)
      types.push(
        "pollenFromCactusField",
        "pollenFromPumpkinPatch",
        "pollenFromPineTreeForest",
        "pollenFromRoseField",
      );
    // ... and so on for higher zones

    // Pick random fields (logic from dialogue.js loop)
    for (let i = 0, r = Math.round(rand()) + 2; i < r; i++) {
      let n = types[(rand() * types.length) | 0];
      types.splice(types.indexOf(n), 1); // Prevent duplicate fields in one quest

      req.push([
        n,
        Math.floor(
          am * 0.5 * (rand() * 0.25 + 0.8) * (1 / ((r - 1) * 0.25 + 1)),
        ),
      ]);
    }

    // Push to gameState
    gameState.activeQuests.push({
      id: `repeatable_${this.name}_${diff}`,
      npc: this.name,
      requirements: Object.fromEntries(req),
      reward: { honey: rewardHoney },
    });
  }

  // CHQ: Gemini AI filled in the method
  checkProgress(quest, gameState) {
    // 1. Determine if we are using a static definition or a dynamic one
    const isRepeatable = ["Brown Bear", "Polar Bear", "Honey Bee"].includes(
      this.name,
    );
    const definition = isRepeatable ? quest : questDefinitions[quest.id];
    const requirements = definition.requirements;

    // 2. Standard progress check
    const isComplete = Object.keys(requirements).every((key) => {
      return (gameState.player.stats[key] || 0) >= requirements[key];
    });

    if (isComplete) {
      gameState.ui.dialogue = `Great job! You finished ${definition.name || quest.id}!`;

      // A. Handle Repeatable-specific progression
      if (isRepeatable) {
        this.portionsDone++;
        if (this.name === "Polar Bear") {
          gameState.player.stats.polarPowerStacks++; //
        }
      } else {
        // B. Handle Static-specific progression
        gameState.completedQuests.push(quest.id);
      }

      // C. Shared Completion Logic: Cleanup & Rewards
      gameState.activeQuests = gameState.activeQuests.filter(
        (q) => q.id !== quest.id,
      );

      if (definition.reward) {
        Object.entries(definition.reward).forEach(([item, amount]) => {
          if (item === "honey") {
            gameState.player.honey += amount;
          } else {
            if (!gameState.player.inventory[item])
              gameState.player.inventory[item] = 0;
            gameState.player.inventory[item] += amount;
          }
          console.log(`+ ${amount} ${item} (from ${this.name})`);
        });
      }

      // Optional: Auto-save or trigger inventory UI update here
    } else {
      gameState.ui.dialogue = `You still need more resources for ${definition.name || "this task"}. Keep going!`;
    }
  }

  // CHQ: Gemini AI filled in the method
  offerNextQuest(gameState) {
    if (["Brown Bear", "Polar Bear", "Honey Bee"].includes(this.name)) {
      this.generateRepeatableQuest(gameState);
      gameState.ui.dialogue = `${this.name}: Check your quest menu to see what I need!`;
    } else {
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
    }
  }

  // CHQ: Gemini AI filled in the method
  processQuestLogic(gameState) {
    // Use your v2 logic to handle the flow
    this.interactv2(gameState);
  }
}
