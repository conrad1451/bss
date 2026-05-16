// data/itemEffects.js

// CHQ: Gemini AI generated code

export const ITEM_EFFECTS = {
  fieldDice: (gameState) => {
    const fields = ["SunflowerField", "DandelionField", "MushroomField"];
    const picked = fields[Math.floor(Math.random() * fields.length)];
    gameState.player.addEffect(`${picked}Boost`, 900); // 15 mins
    return `Dice rolled! +100% Pollen in ${picked}`;
  },
  redExtract: (gameState) => {
    gameState.player.addEffect("redExtractBuff", 600); // 10 mins
    gameState.player.redPollen *= 1.25; // Apply multiplier
    return "Red Extract consumed! x1.25 Red Pollen";
  },
  microConverter: (gameState) => {
    const amount = gameState.player.pollenInBag;
    gameState.player.honey += amount;
    gameState.player.pollenInBag = 0;
    return `Converted ${Math.floor(amount)} pollen into honey!`;
  },
};
