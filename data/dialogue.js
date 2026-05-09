// data/dialogue.js

export const NPC_SCRIPTS = {
  blackBear: (gameState) => [
    "Welcome to the flower fields!",
    "I have some tasks for you if you're interested.",
    [
      ["I'm ready!", () => startQuest("InitialTraining", gameState)],
      ["Maybe later.", () => closeDialogue(gameState)],
    ],
  ],

  polarBear: (gameState) => [
    // Original logic: Uses gameState.NPCs.polarBear.portionsDone
    "I'm starving! Can you cook up some snacks for my cub?",
    "I need specific pollen from different fields to make the perfect meal.",
  ],

  pandaBear: (gameState) => [
    "You look like a strong fighter.",
    "Help me clear out some of the harmful bugs in the fields!",
  ],

  scienceBear: (gameState) => [
    "I'm conducting an experiment on bee behavior.",
    "If you help me collect data, I can enhance your conversion rates!",
  ],

  spiritBear: (gameState) => [
    "The wind tells many stories...",
    "Bring me petals, and I shall grant you the power of the wind.",
  ],

  motherBear: (gameState) => [
    "Your bees look so hungry!",
    "Feeding them treats is the best way to make them grow big and strong.",
  ],

  brownBear: (gameState) => [
    "I've been looking for some specific treasures.",
    "Complete my requests and I'll reward you with something special.",
  ],

  dapperBear: (gameState) => {
    // Requires specific gear to talk properly
    const hasHat = gameState.player.currentGear.mask !== "none";
    const hasBoots = gameState.player.currentGear.boots !== "none";

    if (hasHat && hasBoots) {
      return ["My, you look quite stylish! Welcome to my boutique."];
    }
    return [
      "I only talk to those with a certain... flair. Come back when you're dressed up.",
    ];
  },

  giftedRileyBee: (gameState) => {
    if (gameState.player.inventory.translators > 0) {
      return [
        "Hot enough for you? The Red HQ is always looking for new members.",
      ];
    }
    return ["Bzzzt! (This bee ignores you.)"];
  },

  honeyBee: (gameState) => [
    "Bzz... Honey is the only thing that matters.",
    "Do you have enough for a handsome bee like me?",
  ],

  gummyBear: (gameState) => [
    "Gummy... gummy... gummy...",
    "The world should be covered in goo!",
  ],

  roboBear: (gameState) => {
    if (gameState.player.inventory.cogs > 0) {
      return ["Beep boop. I see you have cogs. Ready for a challenge?"];
    }
    return ["Beep. Access denied. You need cogs to talk to me."];
  },

  giftedBuckoBee: (gameState) => {
    if (gameState.player.inventory.translators > 0) {
      return ["Ah, you speak our language. Welcome!"];
    }
    return ["Bzzzt? (You don't understand this bee...)"];
  },

  datsocool: (gameState) => [
    "Hello there! I'm datsocool.",
    "I help keep the technical side of the hive running smoothly.",
    "Are you enjoying the simulation so far?",
  ],

  hbpencil: (gameState) => [
    "Hey! I'm hbpencil.",
    "I'm usually busy with hierarchical tag searches and Notion integrations.",
    "Bees are a lot like data points—organized, but sometimes unpredictable!",
  ],

  // You can also add specific logic for the ant challenge sign here
  antChallengeSign: (gameState) => [
    "--- Ant Challenge ---",
    `Current High Score: ${gameState.player.stats.antChallengeScore || 0}`,
    "Spend 1 Ant Pass to enter and prove your strength!",
  ],
};
