// engine/eventManager.js

// CHQ: Gemini AI optimized

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
   * Broadcast an event out to all subscribed listeners asynchronously
   * to ensure UI updates never block the core engine loop.
   * @param {string} eventName - Name of the event to fire
   * @param {any} data - Content payload accompanying the event
   */
  emit(eventName, data) {
    if (!listeners[eventName]) return;

    // CHQ: Defer the callback execution to the next event
    //      loop tick to keep engine loop non-blocking
    listeners[eventName].forEach((callback) => {
      // queueMicrotask drops the execution to the end of the current tick,
      // protecting game updates from slow DOM/UI rendering.
      queueMicrotask(() => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    });
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
  // CHQ: explicit check to prevent calling without first safely checking execution context
  const hasCryptoUUID =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function";

  EventManager.emit("NEW_MESSAGE", {
    id: hasCryptoUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
    text,
    type,
  });
}
