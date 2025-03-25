import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameStore } from '../stores/GameStore.jsx';
import Reel from './Reel.jsx';

const SlotMachine = observer(({ className }) => {
  const gameStore = useGameStore();
  const reelsRef = useRef([]);
  const [reelCount] = useState(5); // 5 reels like in the reference game
  const [rowCount] = useState(3); // 3 visible rows per reel

  useEffect(() => {
    // When isSpinning changes to true, start the spin
    if (gameStore.isSpinning) {
      spinAllReels();
    }
  }, [gameStore.isSpinning]);

  const spinAllReels = async () => {
    const spinPromises = reelsRef.current.map((reel, index) => {
      // Stagger the reel spin time for visual effect
      const spinTime = 1000 + (index * 300);
      return reel.spin(spinTime);
    });

    // Wait for all reels to stop spinning
    const results = await Promise.all(spinPromises);
    
    // Update the store with the results
    gameStore.finishSpin(results);
  };

  // Create array of reel indexes
  const reelIndexes = Array.from({ length: reelCount }, (_, i) => i);

  return (
    <div className="slot-machine-cabinet sm:p-4 rounded-lg">

      
      <div className={`flex justify-center items-center rounded-lg shadow-inner ${className}`}>
        {reelIndexes.map((reelIndex) => (
          <div key={reelIndex} className="reel-container">
            <Reel
              key={reelIndex}
              index={reelIndex}
              symbols={gameStore.gameLogic.symbols}
              rowCount={rowCount}
              ref={(el) => (reelsRef.current[reelIndex] = el)}
            />
          </div>
        ))}
      </div>
      
    </div>
  );
});

export default SlotMachine;