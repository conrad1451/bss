import React, { useState, useEffect, useCallback } from "react";

// Main application component
const GameApp = () => {
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
  const MainMenu = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl shadow-lg w-full max-w-lg mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-yellow-500 font-sans">
        Bee Swarm Simulator
      </h1>
      <p className="text-gray-600 mb-6 text-center">
        A game about bees, pollen, and honey!
      </p>
      <button
        onClick={() => setView("selectMenu")}
        className="w-full bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 hover:bg-yellow-600 shadow-md transform hover:scale-105"
      >
        Start Playing
      </button>
    </div>
  );

  const SaveSelectMenu = () => {
    const [importCode, setImportCode] = useState("");
    const [showImport, setShowImport] = useState(false);

    return (
      <div className="flex flex-col items-center p-8 bg-gray-100 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-yellow-500 font-sans">
          Your Saved Games
        </h2>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full mb-6 justify-center">
          <button
            onClick={handleNewGame}
            className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 hover:bg-green-600 shadow-md transform hover:scale-105 flex-grow"
          >
            Create New Game
          </button>
          <button
            onClick={() => setShowImport(!showImport)}
            className="bg-purple-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 hover:bg-purple-600 shadow-md transform hover:scale-105 flex-grow"
          >
            Import Game
          </button>
        </div>

        {showImport && (
          <div className="mt-4 p-4 bg-gray-200 rounded-lg w-full max-w-lg shadow-inner">
            <p className="text-gray-700 text-sm mb-2">
              To import a game, paste a saved data string below. An invalid code
              may corrupt the game.
            </p>
            <textarea
              className="w-full p-2 rounded-md border-2 border-gray-300 focus:outline-none focus:border-purple-500"
              placeholder="Paste your save code here..."
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              rows="4"
            ></textarea>
            <button
              onClick={() => handleImportGame(importCode)}
              className="mt-2 w-full bg-purple-600 text-white font-bold py-2 rounded-lg transition-all duration-300 hover:bg-purple-700"
            >
              Import
            </button>
          </div>
        )}

        <div className="w-full max-w-xl mt-6 space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-500 p-8 bg-gray-200 rounded-lg">
              Loading saves...
            </div>
          ) : saves.length > 0 ? (
            saves.map((save) => (
              <SaveCard
                key={save.id}
                save={save}
                onPlay={() => {
                  setCurrentGame(save.data);
                  setView("game");
                }}
                onDelete={() =>
                  setModal({
                    isOpen: true,
                    title: "Confirm Deletion",
                    message: `Are you sure you want to delete this save? This action cannot be undone.`,
                    onConfirm: () => {
                      deleteFromBackend(save.id);
                      setModal({ isOpen: false });
                    },
                  })
                }
                onExport={() =>
                  handleExportSave(save.data.saveCode, save.data.name)
                }
                onRename={(newName) =>
                  saveToBackend(save.id, { ...save.data, name: newName })
                }
              />
            ))
          ) : (
            <div className="text-center text-gray-500 p-8 bg-gray-200 rounded-lg">
              You have no saves. Start a new game or import one.
              <br />
              <br />
              Your saves are tied to your unique user ID and the Go backend.
              <br />
              <br />
              **Your User ID:**{" "}
              <span className="font-mono text-sm break-all">{userId}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setView("mainMenu")}
          className="mt-6 bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-gray-400"
        >
          Back to Main Menu
        </button>
      </div>
    );
  };

  const SaveCard = ({ save, onPlay, onDelete, onExport, onRename }) => {
    return (
      <div className="flex items-center p-4 bg-yellow-200 rounded-lg border-2 border-yellow-500 shadow-md">
        <div className="flex-1">
          <p className="text-xl font-bold bg-transparent border-b border-yellow-500 w-full pb-1">
            {`Game Checkpoint #${save.id}`}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Last Saved: {new Date().toLocaleDateString()}{" "}
            {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={onPlay}
            className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-green-600"
          >
            Play
          </button>
          <button
            onClick={onExport}
            className="bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-purple-600"
          >
            Export
          </button>
          <button
            onClick={onDelete}
            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  const GameComponent = ({ gameData, onExit }) => {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-yellow-500 font-sans">
          Welcome to the Game!
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          You're playing a saved game.
        </p>
        <div className="bg-white p-6 rounded-lg shadow-inner w-full text-left font-mono text-sm">
          <pre>{JSON.stringify(JSON.parse(gameData.saveCode), null, 2)}</pre>
        </div>
        <button
          onClick={onExit}
          className="mt-6 bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:bg-gray-400"
        >
          Exit Game
        </button>
      </div>
    );
  };

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
        return <MainMenu />;
      case "selectMenu":
        return <SaveSelectMenu />;
      case "game":
        return (
          <GameComponent
            gameData={currentGame}
            onExit={() => setView("selectMenu")}
          />
        );
      default:
        return <MainMenu />;
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
