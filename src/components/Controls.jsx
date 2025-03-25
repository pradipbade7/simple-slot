import React from 'react';
import { observer } from 'mobx-react-lite';
import { useGameStore } from '../stores/GameStore.jsx';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const Controls = observer(({ className }) => {
  const gameStore = useGameStore();

  // Define quick bets based on what's available in the betOptions
  const quickBets = gameStore.betOptions.filter(bet =>
    bet !== gameStore.maxBet && bet !== gameStore.minBet
  );

  return (
    <div className={`bg-controls w-[100%] md:w-[80%] mx-auto p-2 rounded-lg shadow-lg ${className}`}>
<div className="flex flex-col-reverse sm:flex-row flex-wrap items-center justify-between gap-4 sm:gap-2">
        {/* Add sound toggle button */}
        <button
          onClick={gameStore.toggleSound}
          className="flex-shrink-0 sound-button text-white bg-purple-700 hover:bg-purple-600 rounded-full items-center justify-center transition-all"
          aria-label={gameStore.soundEnabled ? "Mute sounds" : "Enable sounds"}
        >
          <img
            src={gameStore.soundEnabled ? "/speaker_on.png" : "/speaker_off.png"}
            alt={gameStore.soundEnabled ? "Sound On" : "Sound Off"}
            width="24"
            height="24"
          />
        </button>


        {/* Credits Display */}
        <div className="flex-shrink-0  sm:w-auto text-center">
          <div className="bg-black border-2 border-yellow-500 rounded-lg overflow-hidden shadow-lg">
            <div className="bg-gradient-to-b from-yellow-900 to-yellow-800 px-3 py-1 text-xs uppercase font-bold text-yellow-300">
              Credits
            </div>
            <div className="px-4 py-2 text-2xl font-mono font-bold text-green-400 bg-black">
              {gameStore.credits.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Win Display */}
        <div className={`justify-center  md:flex-grow sm:w-auto text-center items-center  ${gameStore.lastWin > 0 ? '' : 'opacity-70'}`}>
          <div className="bg-black border-2 border-purple-500 rounded-lg overflow-hidden shadow-lg">
            <div className="bg-gradient-to-b from-purple-900 to-purple-800 px-3 py-1 text-xs uppercase font-bold text-purple-300 text-center">
              Last Win
            </div>
            <div className={`px-4 py-2 text-3xl font-mono font-bold text-center ${gameStore.lastWin > 0 ? 'text-yellow-400 animate-pulse' : 'text-gray-600'}`}>
              {gameStore.lastWin > 0 ? gameStore.lastWin.toLocaleString() : '0'}
            </div>
          </div>
        </div>

        {/* Bet Controls */}
        <div className="flex-shrink-0 items-center sm:w-auto text-center">
          <div className="bg-black border-2 border-blue-500 rounded-lg overflow-hidden shadow-lg mb-2">
            <div className="bg-gradient-to-b from-blue-900 to-blue-800 px-3 py-1 text-xs uppercase font-bold text-blue-300 text-center">
              Bet
            </div>
            <div className="flex items-center justify-between px-1 py-2 text-2xl font-mono font-bold text-blue-400 bg-black">
              <button
                className={`flex items-center justify-center w-8 h-8 rounded-full bg-blue-800 text-white ${gameStore.isSpinning || gameStore.currentBet <= gameStore.minBet ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                onClick={() => gameStore.decrementBet()}
                disabled={gameStore.isSpinning || gameStore.currentBet <= gameStore.minBet}
              >
                <span className="text-xl font-bold">-</span>

              </button>

              <span className="mx-2 text-yellow-500">{gameStore.currentBet.toLocaleString()}</span>

              <button
                className={`flex items-center justify-center w-8 h-8 rounded-full bg-blue-800 text-white ${gameStore.isSpinning || gameStore.currentBet >= gameStore.maxBet ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                onClick={() => gameStore.incrementBet()}
                disabled={gameStore.isSpinning || gameStore.currentBet >= gameStore.maxBet}
              >
                <span className="text-xl font-bold">+</span>
              </button>
            </div>
          </div>

          {/* Quick Bet Buttons */}
          <div className="flex space-x-2 mb-2">
            {quickBets.map(bet => (
              <button
                key={bet}
                className={`px-3 py-1 rounded ${gameStore.currentBet === bet ? 'bg-yellow-500 text-black font-bold' : 'bg-yellow-700 text-black-300 hover:bg-blue-800'} ${gameStore.isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => gameStore.setBet(bet)}
                disabled={gameStore.isSpinning}
              >
                {bet}
              </button>
            ))}
          </div>
        </div>

        {/* Spin Button */}
        <div className="flex-shrink-0 sm:w-auto text-center">
          <button
            className={`transform transition-all duration-200 p-0 
              hover:border-none
              ${gameStore.canSpin ? 'hover:from-yellow-600 hover:to-yellow-800 hover:scale-105' : 'opacity-50 cursor-not-allowed'}
              ${gameStore.isSpinning ? 'animate-pulse' : ''}
            `}
            style={{ background: 'none' }}
            onClick={() => gameStore.spin()}
            disabled={!gameStore.canSpin}
          >
            <img
              src="/controls/spin.png"
              alt="Simple Slot Machine"
              className={`h-24 logo-glow
                ${gameStore.isSpinning ? 'animate-pulse animate-spin' : ''}
                `}
            />
          </button>
        </div>
      </div>
    </div>
  );
});

export default Controls;