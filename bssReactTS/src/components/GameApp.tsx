// GameApp.tsx

import React, { useState, useEffect, useCallback } from "react";

import { MainMenu } from "./MainMenu";
import { GameComponent } from "./GameComponent";
import { SaveSelectMenu } from "./SelectionMenu";
// import { saveToBackend } from "../hooks/useGameData";
import { useGameData } from "../hooks/useGameData";

// Main application component
const GameApp = () => {
  const {
    saves,
    userId,
    isLoading,
    modal,
    setModal,
    fetchSaves,
    saveToBackend,
    deleteFromBackend,
  } = useGameData();
  // === Constants and State ===
  // Placeholder URL for your Go backend.
  // IMPORTANT: Replace this with your deployed backend URL.
  const API_BASE_URL = import.meta.env.API_BASE_URL;

  const [view, setView] = useState("mainMenu"); // 'mainMenu', 'selectMenu', 'game'
  const [saves, setSaves] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentGame, setCurrentGame] = useState(null);
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // === User ID Initialization ===
  useEffect(() => {
    // Retrieve or create a unique user ID
    let currentUserId = localStorage.getItem("bss_user_id");
    if (!currentUserId) {
      currentUserId = crypto.randomUUID();
      localStorage.setItem("bss_user_id", currentUserId);
    }
    setUserId(currentUserId);
  }, []);

  // === Backend API Functions ===
  // Function to fetch all saves from the backend
  const fetchSaves = useCallback(async () => {
    if (!userId) return; // Wait for userId to be initialized
    setIsLoading(true);
    try {
      const response = await fetch(API_BASE_URL, { method: "GET" });
      if (!response.ok) {
        throw new Error("Failed to fetch saves");
      }
      const allSaves = await response.json();
      // Filter saves on the client-side to only show the current user's saves
      const userSaves = allSaves
        .filter((save) => save.user_name === userId)
        .map((save) => ({
          id: save.id,
          data: {
            name: `Game #${save.id}`, // Use a placeholder name for now
            lastSaved: Date.now(), // No last saved time in backend, using current time as placeholder
            saveCode: save.checkpoint_data,
          },
        }));

      // Sort by ID, newest first (assuming higher ID means newer)
      userSaves.sort((a, b) => b.id - a.id);
      setSaves(userSaves);
    } catch (error) {
      console.error("Error fetching saves:", error);
      setModal({
        isOpen: true,
        title: "Data Error",
        message:
          "Failed to fetch saved games from the backend. Please check your API URL.",
        onConfirm: () => setModal({ isOpen: false }),
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Function to delete a save
  const deleteFromBackend = useCallback(
    async (saveId) => {
      if (!userId) return;
      try {
        const response = await fetch(`${API_BASE_URL}/${saveId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete save");
        }
        await fetchSaves(); // Refresh the list of saves
      } catch (error) {
        console.error("Error deleting document:", error);
        setModal({
          isOpen: true,
          title: "Delete Error",
          message: "Failed to delete the game. Please try again.",
          onConfirm: () => setModal({ isOpen: false }),
        });
      }
    },
    [userId, fetchSaves]
  );

  // === Effects for Data Loading ===
  useEffect(() => {
    if (userId) {
      fetchSaves();
    }
  }, [userId, fetchSaves]);

  // === Game Logic Handlers ===
  const handleNewGame = async () => {
    const newGameData = {
      name: "New Game",
      lastSaved: Date.now(),
      saveCode: JSON.stringify({
        player: { level: 1, honey: 0 },
        bees: [],
      }),
    };
    const success = await saveToBackend(null, newGameData);
    if (success) {
      setView("game");
      setCurrentGame(newGameData);
    }
  };

  const handleImportGame = async (saveCode) => {
    try {
      const parsedData = JSON.parse(saveCode);
      if (typeof parsedData !== "object" || parsedData === null) {
        throw new Error("Invalid save code format.");
      }
      const newGameData = {
        name: "Imported Game",
        lastSaved: Date.now(),
        saveCode: saveCode,
      };
      const success = await saveToBackend(null, newGameData);
      if (success) {
        setView("game");
        setCurrentGame(newGameData);
      }
    } catch (e) {
      console.error("Import failed:", e);
      setModal({
        isOpen: true,
        title: "Import Error",
        message:
          "The save code you entered is invalid or corrupted. Please try a different code.",
        onConfirm: () => setModal({ isOpen: false }),
      });
    }
  };

  // Function to handle save game export
  const handleExportSave = (saveCode, saveName) => {
    // Fallback for document.execCommand if clipboard.writeText fails or is not available
    const fallbackCopyTextToClipboard = (text) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand("copy");
        if (successful) {
          setModal({
            isOpen: true,
            title: "Success!",
            message: `The save code for "${saveName}" has been copied to your clipboard.`,
            onConfirm: () => setModal({ isOpen: false }),
          });
        } else {
          throw new Error("Failed to copy command");
        }
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
        setModal({
          isOpen: true,
          title: "Error",
          message: `There was an error copying the save code for "${saveName}". Please copy the code manually from the console.`,
          onConfirm: () => setModal({ isOpen: false }),
        });
        console.log("Save Code:", saveCode);
      }
      document.body.removeChild(textArea);
    };

    if (document.execCommand) {
      fallbackCopyTextToClipboard(saveCode);
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(saveCode)
        .then(() => {
          setModal({
            isOpen: true,
            title: "Success!",
            message: `The save code for "${saveName}" has been copied to your clipboard.`,
            onConfirm: () => setModal({ isOpen: false }),
          });
        })
        .catch((e) => {
          console.error("Clipboard API failed, using fallback:", e);
          fallbackCopyTextToClipboard(saveCode);
        });
    } else {
      console.error("No clipboard support available.");
      fallbackCopyTextToClipboard(saveCode);
    }
  };

  // === Components ===

  const Modal = ({ isOpen, title, message, onConfirm }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-sm">
          <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
          <p className="text-gray-600 mb-4">{message}</p>
          <div className="flex justify-end space-x-2">
            {onConfirm && (
              <button
                onClick={onConfirm}
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-blue-600"
              >
                OK
              </button>
            )}
            {!onConfirm && (
              <button
                onClick={() => setModal({ isOpen: false })}
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-blue-600"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Main render based on the current view state
  const renderContent = () => {
    switch (view) {
      case "mainMenu":
        // CHQ: Gemini AI debugged the function call to remove infinite render
        return <MainMenu callckFctn={() => setView("selectMenu")} />;
      case "selectMenu":
        // CHQ: Gemini AI passed down missing props into SaveSelectMenu
        return (
          <SaveSelectMenu
            theHandleNewGame={handleNewGame}
            theHandleImportGame={handleImportGame}
            saves={saves} // ✅ Pass the list of saves
            isLoading={isLoading} // ✅ Pass the loading state
            userId={userId} // ✅ Pass the user ID
            deleteFromBackend={deleteFromBackend} // ✅ Pass the delete function
          />
        );
      case "game":
        return (
          <GameComponent
            gameData={currentGame}
            onExit={() => setView("selectMenu")}
          />
        );
      default:
        // CHQ: Gemini AI debugged the function call to remove infinite render
        return <MainMenu callckFctn={() => setView("selectMenu")} />;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Modal {...modal} />
      {renderContent()}
    </div>
  );
};

export default GameApp;
