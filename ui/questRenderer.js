// ui/questRenderer.js

// CHQ: Gemini AI generated

import { questDefinitions } from "../data/quests.js";

export function updateQuestUI(gameState) {
  const questContainer = document.getElementById("questList");
  if (!questContainer) return;

  // Clear previous render
  questContainer.innerHTML = "";

  if (gameState.activeQuests.length === 0) {
    questContainer.innerHTML =
      "<div style='text-align:center; padding-top:20px; color:rgba(0,0,0,0.5)'>No Active Quests</div>";
    return;
  }

  gameState.activeQuests.forEach((quest) => {
    // Handle Repeatable vs Static definitions
    const isRepeatable =
      quest.id.startsWith("repeatable_") || quest.id.startsWith("polar_");
    const definition = isRepeatable ? quest : questDefinitions[quest.id];

    if (!definition) return;

    const questCard = document.createElement("div");
    questCard.style.cssText =
      "background:rgba(255,255,255,0.8); margin-bottom:5px; border-radius:5px; padding:5px; border-left: 4px solid #fbc02d;";

    let reqsHTML = "";
    Object.entries(definition.requirements).forEach(([stat, goal]) => {
      const current = gameState.player.stats[stat] || 0;
      const percent = Math.min((current / goal) * 100, 100);

      // Re-using the naming logic style from your dialogue.js grammar helper
      const displayName = stat
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());

      reqsHTML += `
                <div style="margin-top:5px;">
                    <div style="display:flex; justify-content:space-between; font-size:10px;">
                        <span>${displayName}</span>
                        <span>${Math.floor(current).toLocaleString()} / ${goal.toLocaleString()}</span>
                    </div>
                    <div style="width:100%; height:6px; background:#ddd; border-radius:3px; overflow:hidden; margin-top:2px;">
                        <div style="width:${percent}%; height:100%; background:#4caf50; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            `;
    });

    questCard.innerHTML = `
            <div style="font-weight:bold; font-size:12px; border-bottom:1px solid #ccc; padding-bottom:2px;">
                ${definition.name || "Quest"} 
                <span style="font-size:9px; color:#666; float:right;">${quest.npc}</span>
            </div>
            ${reqsHTML}
        `;

    questContainer.appendChild(questCard);
  });
}
