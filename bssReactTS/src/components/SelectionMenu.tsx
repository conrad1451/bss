// SelectionMenu.tsx

import React, { useState } from "react";

// The SaveCard component has been updated to include renaming functionality.
export const SaveCard = ({ save, onPlay, onDelete, onExport, onRename }) => {
  // CHQ: Gemini AI added new states and handler
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(save.data.name);

  const handleRename = () => {
    // Call the onRename prop with the new name
    onRename(newName);
    setIsRenaming(false);
  };

  //   CHQ: Gemini AI added text fields and button connected to onrename
  return (
    <div className="flex items-center p-4 bg-yellow-200 rounded-lg border-2 border-yellow-500 shadow-md">
      <div className="flex-1">
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="text-xl font-bold bg-transparent border-b border-yellow-500 w-full pb-1 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-md px-2"
          />
        ) : (
          <p className="text-xl font-bold bg-transparent border-b border-yellow-500 w-full pb-1">
            {save.data.name}
          </p>
        )}
        <p className="text-sm text-gray-600 mt-1">
          Last Saved: {new Date(save.data.lastSaved).toLocaleDateString()}{" "}
          {new Date(save.data.lastSaved).toLocaleTimeString()}
        </p>
      </div>
      <div className="flex space-x-2 ml-4">
        {isRenaming ? (
          <button
            onClick={handleRename}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-blue-600"
          >
            Save
          </button>
        ) : (
          <>
            <button
              onClick={onPlay}
              className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-green-600"
            >
              Play
            </button>
            <button
              onClick={() => setIsRenaming(true)}
              className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-gray-600"
            >
              Rename
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
          </>
        )}
      </div>
    </div>
  );
};

// SelectionMenu.tsx - updated to accept new props
export const SaveSelectMenu = ({
  theHandleNewGame,
  theHandleImportGame,
  saves,
  isLoading,
  userId,
  deleteFromBackend,
  handleExportSave,
  saveToBackend,
  setCurrentGame,
  setView,
  setModal,
  importCode,
  setImportCode,
}) => {
  const [showImport, setShowImport] = useState(false);

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-yellow-500 font-sans">
        Your Saved Games
      </h2>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full mb-6 justify-center">
        <button
          onClick={theHandleNewGame}
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
            onClick={theHandleImportGame}
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
                  onCancel: () => setModal({ isOpen: false }),
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
