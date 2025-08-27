// InstructionPage.tsx

import React from "react";

/**
 * Renders the instructions and info page for the Bee Swarm Simulator game.
 * @param {Function} callckFctn The callback function to execute when the "Start Playing" button is clicked.
 * @returns {JSX.Element} The InstructionsPage component.
 */
export const InstructionsPage = ({ callckFctn }) => {
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
        Go Back
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

export default InstructionsPage;
