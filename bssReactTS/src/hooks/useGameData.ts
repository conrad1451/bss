// hooks/useGameData.ts
import { useState, useEffect, useCallback } from "react";
// ... (rest of your functions from GameApp.tsx)
// ... (modal state, fetchSaves, deleteFromBackend, saveToBackend)

export const useGameData = () => {
  const [saves, setSaves] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false });

  // Function to save or update a game
  const saveToBackend = useCallback(
    async (saveId, data) => {
      if (!userId) return false;

      // Prepare the payload for the backend
      const payload = {
        user_name: userId,
        checkpoint_data: data.saveCode,
      };

      try {
        let response;
        if (saveId) {
          // Update existing save with PUT request
          response = await fetch(`${API_BASE_URL}/${saveId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else {
          // Create a new save with POST request
          response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }

        if (!response.ok) {
          throw new Error("Failed to save game");
        }

        await response.json();
        await fetchSaves(); // Refresh the list of saves
        return true;
      } catch (error) {
        console.error("Error saving document:", error);
        setModal({
          isOpen: true,
          title: "Save Error",
          message:
            "Failed to save the game. Please check your network and API URL.",
          onConfirm: () => setModal({ isOpen: false }),
        });
        return false;
      }
    },
    [userId, fetchSaves]
  );

  return {
    saves,
    userId,
    isLoading,
    modal,
    setModal,
    fetchSaves,
    saveToBackend,
    deleteFromBackend,
  };
};
