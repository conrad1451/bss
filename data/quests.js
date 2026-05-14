// data/quests.js

// CHQ: Gemini AI generated this

export const questDefinitionsOld = {
  black_bear_1: {
    name: "Pollen Perplexity",
    npc: "Black Bear",
    description:
      "Welcome! Start by gathering 100 White Pollen from the Sunflower Field.",
    requirements: {
      whitePollen: 100, // Matches your updated player.stats key
    },
    rewards: {
      honey: 500,
      treats: 5,
    },
  },
  black_bear_2: {
    name: "Pollen Party",
    npc: "Black Bear",
    description:
      "Great start. Now show me you can collect 500 of any pollen you can find!",
    requirements: {
      totalPollen: 500, // Matches the new stat key
    },
    reward: {
      honey: 1500,
      treats: 10,
    },
  },
  black_bear_3: {
    name: "Red & Blue Review",
    npc: "Black Bear",
    description: "Let's diversify. Collect 300 Red and 300 Blue pollen.",
    requirements: {
      redPollen: 300,
      bluePollen: 300,
    },
    reward: {
      honey: 5000,
      royalJelly: 1,
    },
  },

  // --- MOTHER BEAR: Focused on Bee Care & Bonding ---
  mother_bear_1: {
    name: "Treat Time",
    npc: "Mother Bear",
    description:
      "Your bees look hungry! Feed 10 treats to strengthen your bond.",
    requirements: {
      treatsFed: 10, // Matches your updated player.stats key
    },
    rewards: {
      honey: 1000,
      bond: 50,
    },
  },
  mother_bear_2: {
    name: "The Sugar Rush",
    npc: "Mother Bear",
    description: "They're still hungry. Feed 50 more treats to your hive.",
    requirements: {
      treatsFed: 50,
    },
    reward: {
      honey: 2500,
      bond: 150,
      starTreat: 0, // Rare drop chance or placeholder
    },
  },

  // --- BROWN BEAR: Focused on bulk volume and "The Grind" --
  brown_bear_1: {
    name: "Basic Training",
    npc: "Brown Bear",
    description: "I need raw materials. Bring me 1,000 total pollen.",
    requirements: {
      totalPollen: 1000,
    },
    reward: {
      honey: 2000,
      tickets: 5,
    },
  },

  brown_bear_2: {
    name: "The Grinder",
    npc: "Brown Bear",
    description: "Keep it up! I need 5,000 total pollen for my research.",
    requirements: {
      totalPollen: 5000,
    },
    reward: {
      honey: 10000,
      tickets: 10,
      oil: 1,
    },
  },

  // --- ADVANCED QUESTS (Placeholder for later gear) ---
  black_bear_4: {
    name: "Spectrum Mastery",
    npc: "Black Bear",
    description:
      "Collect 10,000 of each color to prove you're a master collector.",
    requirements: {
      whitePollen: 10000,
      redPollen: 10000,
      bluePollen: 10000,
    },
    reward: {
      honey: 100000,
      silverEgg: 1,
    },
  },
};

// data/quests.js
export const questDefinitions = {
  black_bear_1: {
    name: "Sunflower Start",
    npc: "Black Bear",
    description: "Welcome! Gather 100 pollen from the Sunflower Field.",
    requirements: {
      pollenFromSunflowerField: 100, // Note: Ensure this key exists in your collection logic!
    },
    reward: {
      honey: 200,
    },
  },
  black_bear_2: {
    name: "Dandelion Deed",
    npc: "Black Bear",
    description: "Great! Now collect 200 pollen from the Dandelion Field.",
    requirements: {
      pollenFromDandelionField: 200,
    },
    reward: {
      honey: 250,
      royalJelly: 1,
    },
  },
  black_bear_3: {
    name: "Pollen Fetcher",
    npc: "Black Bear",
    description: "Cool! Bring me 500 total pollen.",
    requirements: {
      totalPollen: 500,
    },
    reward: {
      honey: 400,
    },
  },
};
