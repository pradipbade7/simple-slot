import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import SlotMachine from './SlotMachine.jsx';
import Controls from './Controls.jsx';
import PayTable from './PayTable.jsx';
import { useGameStore } from '../stores/GameStore.jsx';
import '../styles/main.css';
import { PiSpeakerSimpleXFill } from "react-icons/pi";
import { PiSpeakerSimpleHighFill } from "react-icons/pi";


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

  {
    gameStore.lastWin > 0 && (
      <div className="win-flash absolute inset-0 pointer-events-none"></div>
    )
  }


  return (
    <div className="flex flex-col items-center p-4 min-h-screen game-home">

      <div className="absolute top-4 right-4 flex space-x-2 z-10">
        {/* Sound Toggle - mobile */}
        <button
          onClick={gameStore.toggleSound}
          className="w-10 h-10 border-none bg-gradient-to-br from-purple-600 via-purple-700 to-pink-500 hover:from-pink-500 hover:via-purple-700 hover:to-purple-600 text-white rounded-full flex text-center items-center justify-center"
          aria-label={gameStore.soundEnabled ? "Mute sounds" : "Enable sounds"}
        >
          <span>{gameStore.soundEnabled ? <PiSpeakerSimpleHighFill className='text-xl text-white' />
            : <PiSpeakerSimpleXFill className='text-xl  text-pink-300' />
          }</span>
        </button>

        {/* Info button */}
        <button
          className="w-10 h-10 border-none bg-gradient-to-br from-purple-600 via-purple-700 to-pink-500 hover:from-pink-500 hover:via-purple-700 hover:to-purple-600 text-white rounded-full flex text-center items-center justify-center"
          onClick={() => setShowPayTable(true)}
          title="Show Pay Table"
        >
          <span className="font-bold">𝓲</span>
        </button>
      </div>


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
      {/* Footer */}
      <footer className="mt-auto text-center text-sm font-bold text-white">
        <p>
          © {new Date().getFullYear()}  <a className="text-yellow-400" href="https://pradipbade.com" target="_blank" rel="noopener noreferrer">Pradip Bade</a>
        </p>
      </footer>
    </div>
  );
});

export default GameHome;