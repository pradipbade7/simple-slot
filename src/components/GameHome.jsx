import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import SlotMachine from './SlotMachine.jsx';
import Controls from './Controls.jsx';
import PayTable from './PayTable.jsx';
import { useGameStore } from '../stores/GameStore.jsx';
import '../styles/main.css';

const GameHome = observer(() => {
  const gameStore = useGameStore();
  const [showPayTable, setShowPayTable] = useState(false);

  // Close paytable when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowPayTable(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  {gameStore.lastWin > 0 && (
    <div className="win-flash absolute inset-0 pointer-events-none"></div>
  )}
  

  return (
    <div className="flex flex-col items-center p-4 min-h-screen game-home">
      {/* Info button in the top right corner */}
      <button
        className="absolute top-4 right-4 w-10 h-10 border-none bg-gradient-to-br from-purple-600 via-purple-700 to-pink-500 hover:from-pink-500 hover:via-purple-700 hover:to-purple-600 text-white rounded-full flex text-center items-center justify-center z-10"
        onClick={() => setShowPayTable(true)}
        title="Show Pay Table"
      >
        <span className="font-bold">𝓲</span>

      </button>

      <div className="flex justify-center mb-4 h-[10vh]">
        <img
          src="/logo1.png"
          alt="Simple Slot Machine"
          className="h-16 md:h-28 logo-glow"
        />
      </div>


      <SlotMachine className="mb-6" />
      <Controls className="mb-6" />

      {/* PayTable popup */}
      {showPayTable && (
        <div className="fixed md:inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-5xl w-full">
            {/* Close button */}
            <button
              className="absolute -top-4 -right-4 w-10 h-10 border-none bg-gradient-to-br from-red-700 via-red-600 to-pink-300 hover:from-pink-500 hover:via-red-700 hover:to-red-600 text-white rounded-full flex text-center items-center justify-center z-15"
              onClick={() => setShowPayTable(false)}
            >
              <span className="text-xl font-bold">✗</span>
            </button>

            <PayTable />
          </div>
        </div>
      )}
    </div>
  );
});

export default GameHome;