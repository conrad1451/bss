// FirstApp.tsx
import React, { useState } from "react";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import CheckpointsDisplay from "./components/CheckpointsDisplay";

import type { Player } from "./utils/dataTypes";

/**
 * A placeholder component for the main game.
 * All game logic and UI will be rendered within this component.
 */

const GameApp = (props: {
  mySessionToken: string;
  selectedPlayer: Player;
  button1Text: string;
  callckFctn: () => void | Promise<void>;
}) => {
  const { mySessionToken, selectedPlayer, button1Text, callckFctn } = props;

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // CHQ: Claude AI added saveCheckpoint function
  const saveCheckpoint = async () => {
    if (saving) return;
    setSaving(true);
    setSaveMessage(null);

    const now = new Date();
    const title = `Save - ${now.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    })}`;

    const data = {
      saved_at: now.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      }),
    };

    const apiURL = `${import.meta.env.VITE_API_BASE_URL}/api/players/${selectedPlayer.id}/checkpoints`;

    try {
      const res = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mySessionToken}`,
        },
        body: JSON.stringify({ title, data }),
      });

      if (!res.ok) throw new Error("Failed to save");
      setSaveMessage("Checkpoint saved!");
    } catch {
      setSaveMessage("Failed to save checkpoint.");
    } finally {
      setSaving(false);
    }
  };

  if (!mySessionToken) return <div>Loading game data...</div>;

  // CHQ: Gemini AI added check to API call
  // Essential check to prevent the API call with a bad token
  if (!mySessionToken) {
    console.log(
      "GameApp: Session token is not available. Displaying loading state.",
    );
    return <div>Loading game data...</div>;
  }

  // console.log("session token is " + mySessionToken);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl shadow-lg w-full max-w-lg mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Gameplay Area</h1>

      {/* Button to start playing the game */}

      <p>Playing as: {selectedPlayer.playername}</p>
      <button onClick={callckFctn}>{button1Text}</button>

      {/* CHQ: Claude AI added saveCheckpoint button */}
      <button
        onClick={saveCheckpoint}
        disabled={saving}
        className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg mt-4 transition-all duration-300 hover:bg-green-600 shadow-md transform hover:scale-105"
      >
        {saving ? "Saving…" : "Save Checkpoint"}
      </button>

      {saveMessage && (
        <p className="mt-2 text-sm text-gray-600">{saveMessage}</p>
      )}

      <p className="text-gray-600">
        This is where the Bee Swarm Simulator game will be built.
      </p>

      <CheckpointsDisplay
        theSessionToken={mySessionToken}
        selectedPlayer={selectedPlayer}
      />

      {/* <button
        onClick={callckFctn}
        className="w-full bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 hover:bg-yellow-600 shadow-md transform hover:scale-105"
      >
        {button1Text}
      </button>
      <p className="text-gray-600">
        This is where the Bee Swarm Simulator game will be built.
      </p>
      <CheckpointsDisplay theSessionToken={mySessionToken} /> */}
    </div>
  );
};

/**
 * Renders the instructions and info page for the Bee Swarm Simulator game.
 * @param {Function} callckFctn The callback function to execute when the "Start Playing" button is clicked.
 * @returns {JSX.Element} The InstructionsPage component.
 */
export const InstructionsPage = (props: {
  buttonText: string;
  callckFctn: () => void | Promise<void>;
}) => {
  const { buttonText, callckFctn } = props;
  return (
    // The main container for the entire page, centered and styled with Tailwind.
    <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl shadow-lg w-full max-w-lg mx-auto">
      {/* Title of the game */}
      <h1 className="text-4xl font-bold mb-4 text-yellow-500 font-sans">
        Bee Swarm Simulator
      </h1>

      {/* Game description */}
      <p className="text-gray-600 mb-6 text-center">
        A game about bees, pollen, and honey!
      </p>

      {/* Button to start playing the game */}
      <button
        onClick={callckFctn}
        className="w-full bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 hover:bg-yellow-600 shadow-md transform hover:scale-105"
      >
        {buttonText}
      </button>

      {/* Container for the game instructions */}
      <div className="mt-8 p-4 bg-white rounded-lg shadow-inner">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Instructions & Info
        </h2>
        <div className="text-gray-700 text-base leading-relaxed">
          Welcome to Bee Swarm Simulator! In this game, you collect pollen from
          flowers and make honey.
          <br />
          <br />
          But you don't do it alone... You are the leader of your own personal
          swarm of bees!
          <br />
          <br />
          Open your inventory by clicking on the egg button. Click on the egg to
          select it, and then click a slot in your hive to hatch it.
          <br />
          <br />
          With your bees, go into the fields to collect pollen. You can collect
          pollen by swinging your tool or when your bee gathers. After your bag
          becomes full, go back to your hive and your bees will convert the
          pollen into honey.
          <br />
          <br />
          Talk to bears and NPCs around the mountain and complete their quests
          for rewards!
          <br />
          <br />
          Expand your hive by buying more eggs and level up bees with treats.
          Upgrade your tools to make more honey. Defeat monsters around the map
          for loot. Collect rare ingredients to craft powerful gear!
          <br />
          <br />
          <br />
          <br />
          <br />
          <hr className="border-gray-300" />
          <br />
          <br />
          <p className="text-sm italic text-gray-500">
            <strong>
              Note: Not all features are accurate to the original game. Many
              changes include dialogue, quests, gear stats, loot drops, certain
              calculations, improved RNG rates, and singleplayer. All graphics
              are recreations of the original, not copied. Gameplay is meant to
              be accelerated from the original through the use of decreased item
              & bee rarity + easier & more rewarding quests. Audio is
              non-existent for this game.
            </strong>
          </p>
          <br />
          <br />
          <p className="text-sm text-gray-500">
            Made by Dat
            <br />
            <br />
            Original made by Onett
            <br />
            <br />
            Some info from the BSS Fandom Wiki
            <br />
            <br />
            Bugtesters: HB_The_Pencil, Astro, and more.
          </p>
        </div>
      </div>
    </div>
  );
};

// This component will serve as the landing page with navigation buttons
const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "grid", gap: 2, justifyContent: "center", mb: 2 }}>
      <Button variant="contained" onClick={() => navigate("/gameplay")}>
        Start Playing
      </Button>
      <Button variant="contained" onClick={() => navigate("/instructions")}>
        Instructions
      </Button>
    </Box>
  );
};

// The main application component that handles routing
const FirstApp = (props: {
  mySessionToken: string;
  selectedPlayer: Player;
}) => {
  const { mySessionToken, selectedPlayer } = props;
  const navigate = useNavigate();

  return (
    // The main container for the app, using a router to handle different pages
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-200 font-sans">
      <Routes>
        {/* Route for the home page */}
        <Route path="/" element={<HomePage />} />

        {/* Route for the instructions page. The button now correctly navigates to the gameplay page. */}
        <Route
          path="/instructions"
          element={
            // <InstructionsPage callckFctn={() => navigate("/gameplay")} />
            // <InstructionsPage
            //   buttonText={"Start Playing"}
            //   callckFctn={() => navigate("/gameplay")}
            // />
            <InstructionsPage
              buttonText={"Go Back"}
              callckFctn={() => navigate("/")}
            />
          }
        />

        {/* Route for the main game itself */}
        <Route
          path="/gameplay"
          element={
            <GameApp
              mySessionToken={mySessionToken}
              selectedPlayer={selectedPlayer}
              button1Text={"Go Back"}
              callckFctn={() => navigate("/")}
            />
          }
        />
      </Routes>
    </div>
  );
};

// Wrap the app with the Router to enable navigation
export default function AppWrapper(props: {
  sessionToken: string;
  selectedPlayer: Player;
}) {
  const { sessionToken, selectedPlayer } = props;
  return (
    <Router>
      <FirstApp mySessionToken={sessionToken} selectedPlayer={selectedPlayer} />
    </Router>
  );
}
