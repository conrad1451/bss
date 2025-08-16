// MainMenu.tsx

export const MainMenu = (callckFctn: () => void) => (
  <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl shadow-lg w-full max-w-lg mx-auto">
    <h1 className="text-4xl font-bold mb-4 text-yellow-500 font-sans">
      Bee Swarm Simulator
    </h1>
    <p className="text-gray-600 mb-6 text-center">
      A game about bees, pollen, and honey!
    </p>
    <button
      onClick={callckFctn}
      className="w-full bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 hover:bg-yellow-600 shadow-md transform hover:scale-105"
    >
      Start Playing
    </button>
  </div>
);
