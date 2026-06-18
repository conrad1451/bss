// entities/npcs.js
import { questDefinitions } from "../data/quests.js";
import { mulberry32 } from "../utils/math.js";
// CHQ: Gemini AI generated

// CHQ: Claude AI (Haiku) applied JSDocs

/**
 * Represents a non-player character (NPC) that can offer quests and interact with the player.
 * Supports both static single-completion quests and repeatable procedurally-generated quests.
 * NPCs include Bears (Black Bear, Brown Bear, Polar Bear, Panda Bear) and Bees (WildWindyBee, etc).
 *
 * @class NPC
 */
export class NPC {
  /**
   * Creates a new NPC instance.
   * @constructor
   * @param {string} name - The NPC's display name (e.g., "Brown Bear", "Polar Bear")
   * @param {number[]} pos - 3D world position as [x, y, z]
   * @param {string} type - NPC type/species (e.g., "Black Bear")
   * @param {Object} gameState - Reference to the game state object
   * @param {Object} [gameState.savedNPCs] - Persisted NPC data from previous sessions
   * @param {number} [gameState.savedNPCs[name].portionsDone] - Number of completed repeatable quest cycles
   * @param {number} [gameState.savedNPCs[name].seed] - PRNG seed for deterministic quest generation
   *
   * @property {string} name - The NPC's display name
   * @property {number[]} pos - 3D world position [x, y, z]
   * @property {string} type - NPC species/type
   * @property {number} dialogueIndex - Current dialogue line index (for multi-line conversations)
   * @property {boolean} isTalking - Whether the NPC is currently in a conversation with the player
   * @property {number} portionsDone - Number of times this NPC's repeatable quest loop has been completed
   * @property {number} seed - PRNG seed for generating consistent repeatable quests
   */
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

  /**
   * Updates the NPC's state each frame.
   * Currently checks distance to player and displays interaction prompt if nearby.
   *
   * @param {number} dt - Delta time since last frame (in seconds)
   * @param {Object} gameState - Current game state
   * @param {Object} gameState.player - Player object with position
   * @param {Object} gameState.player.pos - Player world position with x, z properties
   * @param {Object} gameState.ui - UI state object
   */
  update(dt, gameState) {
    const dist = this.getDistanceToPlayer(gameState.player.pos);

    // Auto-display an interaction prompt if close
    if (dist < 10) {
      gameState.ui.prompt = `Press E to talk to ${this.name}`;
    }
  }

  /**
   * Calculates the horizontal distance (ignoring Y) between the NPC and player.
   * Uses 3D distance formula projected onto the XZ plane.
   *
   * @param {Object} playerPos - Player position object
   * @param {number} playerPos.x - Player X coordinate
   * @param {number} playerPos.z - Player Z coordinate
   * @returns {number} Distance in world units
   */
  getDistanceToPlayer(playerPos) {
    // Basic 3D distance formula
    return Math.sqrt(
      Math.pow(this.pos[0] - playerPos.x, 2) +
        Math.pow(this.pos[2] - playerPos.z, 2),
    );
  }

  /**
   * Handles NPC interaction when the player presses the interaction key (E).
   * Legacy method; delegates to processQuestLogic.
   *
   * @param {Object} gameState - Current game state
   * @deprecated Use interactv2 instead
   */
  interactv1(gameState) {
    // This is called by the "E" key trigger we set up!
    this.isTalking = true;
    this.processQuestLogic(gameState);
  }

  /**
   * Handles NPC interaction with quest logic.
   * Checks if the player has an active quest from this NPC:
   * - If active: checks progress toward completion
   * - If none: offers the next available quest
   *
   * @param {Object} gameState - Current game state
   * @param {Object[]} gameState.activeQuests - Array of active quests
   * @param {string} gameState.activeQuests[].npc - NPC name that issued the quest
   */
  interactv2(gameState) {
    // 1. Check if the player has an active quest from this NPC
    const active = gameState.activeQuests.find((q) => q.npc === this.name);

    if (active) {
      this.checkProgress(active, gameState);
    } else {
      this.offerNextQuest(gameState);
    }
  }

  /**
   * Generates a procedural repeatable quest specific to the Polar Bear.
   * Creates a cooking quest with randomized recipes and scaling rewards.
   * Grants a permanent "polarPower" buff on completion.
   *
   * @param {Object} gameState - Current game state
   * @param {Object} gameState.player - Player object
   * @param {number} gameState.player.discoveredBees - Array of discovered bee types (affects recipe selection)
   * @param {Object[]} gameState.activeQuests - Active quest list
   *
   * @note Uses this.seed + this.portionsDone to ensure deterministic recipe generation per cycle
   * @note Recipes scale in difficulty with bee discoveries; only recipes 1-7 available initially
   */
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

  /**
   * Retrieves a Polar Bear cooking recipe by index.
   * Updates the reward object with any recipe-specific bonuses.
   *
   * @param {number} index - Recipe index (0-7)
   * @param {Object} reward - Reward object to augment with recipe bonuses
   * @returns {Object} Recipe data
   * @returns {string} return.name - Recipe display name
   * @returns {Object} return.requirements - Item requirements (keys = item IDs, values = quantities)
   *
   * @example
   * const recipe = npc.getPolarRecipe(2, rewardObj);
   * // Returns: { name: "Microwaved Sweets", requirements: { redPollen: 12000, ... } }
   */
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

  /**
   * Generates a procedural repeatable quest with scaling difficulty.
   * Available for NPCs: Brown Bear, Polar Bear, Honey Bee.
   * Quest difficulty and rewards scale exponentially with portionsDone.
   * Unlocks new pollen fields as the player discovers more bee species.
   *
   * @param {Object} gameState - Current game state
   * @param {Object} gameState.player - Player object
   * @param {string[]} gameState.player.discoveredBees - Array of discovered bee species (affects available fields)
   * @param {Object[]} gameState.activeQuests - Active quest list
   *
   * @note Difficulty (portionsDone) affects:
   *   - Amount required: 4.75 * difficulty^4 + 500
   *   - Honey reward: amount * 1.35
   *   - Number of pollen types requested: 2-3 per quest
   *
   * @note Field unlock progression:
   *   - 3+ bees: Spider, Strawberry, Bamboo fields
   *   - 7+ bees: Pineapple, Stump fields
   *   - 12+ bees: Cactus, Pumpkin, Pine Tree, Rose fields
   *   - Additional thresholds at 18, 24, 30 bees
   */
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

  /**
   * Checks if the player has completed a quest and handles progression.
   * Compares player inventory/stats against quest requirements.
   * On completion: grants rewards, advances NPC progression, and removes the quest.
   *
   * Handles two quest types differently:
   * - **Repeatable quests** (Brown Bear, Polar Bear, Honey Bee): Increment portionsDone, apply NPC-specific effects
   * - **Static quests**: Add to completedQuests array, unlocking subsequent quests
   *
   * @param {Object} quest - Active quest object
   * @param {string} quest.id - Unique quest identifier
   * @param {string} quest.npc - NPC name that issued the quest
   * @param {Object} gameState - Current game state
   * @param {Object} gameState.player - Player object with stats and inventory
   * @param {Object} gameState.player.stats - Player resource counts (pollen types, etc)
   * @param {Object} gameState.player.inventory - Player inventory for non-honey items
   * @param {number} gameState.player.honey - Player honey currency
   * @param {string[]} gameState.completedQuests - Array of completed quest IDs
   * @param {Object[]} gameState.activeQuests - Active quest list
   * @param {Object} gameState.ui - UI state for dialogue messages
   *
   * @example
   * // Repeatable quest completion
   * if (gameState.player.stats.honey >= 50000) {
   *   npc.checkProgress(activeQuest, gameState);
   *   // npc.portionsDone increments, quest removed from active list
   * }
   */
  checkProgress(quest, gameState) {
    // Gemini Ai filled in implementation
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

  /**
   * Offers the player the next available quest from this NPC.
   * Behavior differs based on whether the NPC has repeatable or static quests:
   *
   * **Repeatable NPCs** (Brown Bear, Polar Bear, Honey Bee):
   * - Generates a new procedural quest via generateRepeatableQuest()
   * - Player can repeat infinitely with scaling difficulty
   *
   * **Static NPCs**:
   * - Searches questDefinitions for quests assigned to this NPC
   * - Filters out already-completed quests
   * - Offers the first available quest in order
   * - If all quests are completed, displays a "no more tasks" message
   *
   * @param {Object} gameState - Current game state
   * @param {Object[]} gameState.activeQuests - Active quest list to add new quest to
   * @param {string[]} gameState.completedQuests - Array of completed quest IDs
   * @param {Object} gameState.ui - UI state
   * @param {string} gameState.ui.dialogue - Dialogue message to display
   * @param {string} gameState.ui.prompt - UI prompt message
   *
   * @example
   * // Repeatable NPC
   * npc.name = "Brown Bear";
   * npc.offerNextQuest(gameState);
   * // Generates a new quest and adds to activeQuests
   *
   * @example
   * // Static NPC with available quest
   * npc.name = "Black Bear";
   * npc.offerNextQuest(gameState);
   * // Finds first uncompleted quest from questDefinitions where npc === "Black Bear"
   */
  offerNextQuest(gameState) {
    // Gemini Ai filled in implementation

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

  /**
   * Processes quest interaction logic when the player initiates dialogue.
   * Delegates to interactv2() which handles the full quest flow.
   *
   * This method serves as a wrapper to keep a clear separation between the
   * low-level interaction trigger (E key press) and the quest state machine logic.
   *
   * @param {Object} gameState - Current game state
   * @see {@link interactv2} for the actual quest logic implementation
   */
  processQuestLogic(gameState) {
    // Gemini Ai filled in implementation

    // Use your v2 logic to handle the flow
    this.interactv2(gameState);
  }
}
