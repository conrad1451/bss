// GameComponent.tsx

export const GameComponent = ({ gameData, onExit }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-yellow-500 font-sans">
        Welcome to the Game!
      </h1>
      <p className="text-lg text-gray-700 mb-6">You're playing a saved game.</p>
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
