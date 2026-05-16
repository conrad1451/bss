// engine/inventory.js

// CHQ: Gemini AI generated code

import { ITEM_EFFECTS } from "../data/itemEffects.js";
import { fieldDefinitions } from "../data/fieldData.js";

export function useFieldDice(gameState) {
  const { player, ui } = gameState;

  // 1. Random Selection
  // Filter for valid fields (excluding shops/hives)
  const validFields = fieldDefinitions.filter((f) => !f.isSafeZone);
  const selectedField =
    validFields[Math.floor(Math.random() * validFields.length)];
  const fieldName = selectedField.name;

  // 2. Apply Multiplier
  // We use a key like "SunflowerField" to match your collection logic
  player.fieldBoosts[fieldName] = (player.fieldBoosts[fieldName] || 1) + 1.0;

  // 3. Register Effect for the UI/Timer
  const effectId = `${fieldName}Boost`;
  player.effects.push({
    id: effectId,
    type: "fieldBoost",
    target: fieldName,
    endTime: Date.now() + 15 * 60 * 1000, // 15 mins
    multiplier: 1.0,
  });

  ui.prompt = `🎲 Dice rolled! +100% Pollen in ${fieldName.replace(/([A-Z])/g, " $1")}!`;
}

export function useItem(itemId, gameState) {
  const { player } = gameState;

  // 1. Check if player has the item
  if ((player.inventory[itemId] || 0) <= 0) {
    gameState.ui.prompt = "You don't have any of that!";
    return;
  }

  // 2. Apply the effect
  if (ITEM_EFFECTS[itemId]) {
    const message = ITEM_EFFECTS[itemId](gameState);

    // 3. Consume the item
    player.inventory[itemId]--;
    gameState.ui.prompt = message;

    // 4. Update UI
    updateInventoryUI(gameState);
  }
}
