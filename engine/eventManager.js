// engine/eventManager.js

// CHQ: Gemini AI created

// A simple map to keep track of event string names and their bound callback functions
const listeners = {};

export const EventManager = {
  /**
   * Subscribe to a specific engine event.
   * @param {string} eventName - Name of the event (e.g., 'INVENTORY_CHANGED')
   * @param {Function} callback - Function to invoke when event triggers
   */
  on(eventName, callback) {
    if (!listeners[eventName]) {
      listeners[eventName] = [];
    }
    listeners[eventName].push(callback);

    // Return an unsubscribe function for easy cleanup (especially in React useEffects)
    return () => {
      listeners[eventName] = listeners[eventName].filter(
        (cb) => cb !== callback,
      );
    };
  },

  /**
   * Broadcast an event out to all subscribed listeners.
   * @param {string} eventName - Name of the event to fire
   * @param {any} data - Content payload accompanying the event
   */
  emit(eventName, data) {
    if (!listeners[eventName]) return;
    listeners[eventName].forEach((callback) => callback(data));
  },
};

/**
 * Handles updating an item count inside the game state and broadcasts the change.
 * @param {Object} gameState - The global state object
 * @param {string} itemKey - The inventory item identifier (e.g., 'translators')
 * @param {number} amount - The relative modifier (positive or negative)
 */
export function updateInventory(gameState, itemKey, amount) {
  if (!gameState.player.inventory) {
    gameState.player.inventory = {};
  }

  const currentAmount = gameState.player.inventory[itemKey] || 0;
  const newAmount = Math.max(0, currentAmount + amount); // Prevent going negative

  gameState.player.inventory[itemKey] = newAmount;

  // Broadcast out to any UI components listening
  EventManager.emit("INVENTORY_CHANGED", {
    itemKey,
    amount: newAmount,
    delta: amount,
    inventory: { ...gameState.player.inventory },
  });
}

/**
 * Broadcasts a text or system message intended for the UI chat/log console.
 * @param {string} text - The core string message text
 * @param {string} type - Message classification styling ('info', 'quest', 'warning')
 */
export function addMessage(text, type = "info") {
  EventManager.emit("NEW_MESSAGE", {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
    text,
    type,
  });
}
