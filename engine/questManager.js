// engine/questManager.js

export const QuestManager = {
  checkRequirements: (quest, gameState) => {
    const { player, stats } = gameState;
    return quest.req.every((r) => {
      const currentVal = stats[r[0]] - r[2]; // current - startValue
      return currentVal >= r[1]; // target amount
    });
  },

  completeQuest: (questName, gameState) => {
    const quest = gameState.player.quests.find((q) => q.name === questName);
    if (this.checkRequirements(quest, gameState)) {
      // Award rewards (Honey, items, etc.)
      gameState.player.honey += quest.rewardHoney;
      // Mark as done
      quest.completed = true;
    }
  },
};
