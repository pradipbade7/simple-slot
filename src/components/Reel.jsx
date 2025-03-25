import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameStore } from '../stores/GameStore.jsx';
import Symbol, { symbolImages } from './Symbol.jsx';

const Reel = observer(forwardRef(({ symbols, index, rowCount = 3 }, ref) => {
  const gameStore = useGameStore();
  // Create an array for each visible row with random symbols
  const [visibleSymbols, setVisibleSymbols] = useState(
    Array.from({ length: rowCount }, () => getRandomSymbol())
  );
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const spinningElementRef = useRef(null);
  const reelContainerRef = useRef(null);

  const symbolRefs = useRef([]);

  // Initialize the refs array
  useEffect(() => {
    symbolRefs.current = symbolRefs.current.slice(0, rowCount);
  }, [rowCount]);

  // Effect to watch for changes in winning positions
  useEffect(() => {
    // Check if we have winning positions to highlight
    if (gameStore.winningPositions &&
      gameStore.winningPositions.length > 0 &&
      gameStore.winningPositions[index]) {

      // Apply animations to winning symbols
      highlightWinningSymbols();
    }
  }, [gameStore.winningPositions]);

  const highlightWinningSymbols = () => {
    // If no spinning element ref, return early
    if (!spinningElementRef.current) return;

    // Get all symbol divs
    const symbolDivs = spinningElementRef.current.querySelectorAll('.symbol');

    // Loop through each position and apply/remove highlight
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const isWinning = gameStore.winningPositions &&
        gameStore.winningPositions.length > 0 &&
        gameStore.winningPositions[index] &&
        gameStore.winningPositions[index][rowIndex];

      if (symbolDivs[rowIndex]) {
        const imgElement = symbolDivs[rowIndex].querySelector('img');
        if (imgElement) {
          if (isWinning) {
            // First, remove any existing classes to reset the animation
            imgElement.classList.remove('winning-symbol', 'winning-symbol-animation');

            // Remove any inline styles that might interfere with animations
            imgElement.style.removeProperty('transform');

            // Force a reflow to ensure clean animation state
            void imgElement.offsetHeight;

            // Check if it's a premium symbol (seven)
            const isPremium = imgElement.alt === 'seven';

            // Add winning classes
            imgElement.classList.add('winning-symbol');

            // Add additional class based on symbol type
            if (isPremium) {
              imgElement.classList.add('premium-winning');
            } else {
              imgElement.classList.add('regular-winning');
            }

            // Add animation class
            imgElement.classList.add('winning-symbol-animation');

          } else {
            // Remove all animation classes
            imgElement.classList.remove(
              'winning-symbol',
              'winning-symbol-animation',
              'premium-winning',
              'regular-winning'
            );
            imgElement.style.removeProperty('transform');
          }
        }
      }
    }
  };

  // Update the clear function to remove all classes
  const clearWinningHighlights = () => {
    if (!spinningElementRef.current) return;

    // Get all symbol images
    const imgElements = spinningElementRef.current.querySelectorAll('img');

    // Remove all winning classes and reset transform
    imgElements.forEach(img => {
      img.classList.remove(
        'winning-symbol',
        'winning-symbol-animation',
        'premium-winning',
        'regular-winning'
      );
      img.style.removeProperty('transform');
    });
  };


  // Preload images when component mounts
  useEffect(() => {
    let loadedCount = 0;
    const totalImages = Object.keys(symbolImages).length;

    Object.values(symbolImages).forEach((src) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        console.error(`Failed to load image: ${src}`);
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };
      img.src = src;
    });
  }, []);

  function getRandomSymbol() {
    // Use weighted probabilities from symbols
    const totalWeight = symbols.reduce((sum, symbol) => sum + symbol.weight, 0);
    let random = Math.random() * totalWeight;

    for (const symbol of symbols) {
      random -= symbol.weight;
      if (random <= 0) {
        return symbol.id;
      }
    }

    return symbols[0].id;
  }

  // Check if a position is a winning one
  const isWinningPosition = (rowIndex) => {
    return gameStore.winningPositions &&
      gameStore.winningPositions.length > 0 &&
      gameStore.winningPositions[index] &&
      gameStore.winningPositions[index][rowIndex];
  };

  // Expose spin method to parent
  useImperativeHandle(ref, () => ({
    spin: (duration) => {
      return new Promise(resolve => {
        // Clear any existing winning highlights before spinning
        clearWinningHighlights();

        if (!spinningElementRef.current || !reelContainerRef.current)
          return resolve(visibleSymbols);

        // First, generate the final result
        const newSymbols = Array.from({ length: rowCount }, () => getRandomSymbol());

        // We'll create a temporary container for the animation
        const animContainer = document.createElement('div');
        animContainer.className = 'absolute inset-0 overflow-hidden';

        // Create the symbol strip with enough symbols to appear infinite
        const symbolStrip = document.createElement('div');
        symbolStrip.className = 'absolute left-0 w-full h-full';

        // Calculate how many symbols we need for smooth animation
        // We'll add extra symbols before and after, plus the final symbols
        const visibleRowHeight = reelContainerRef.current.clientHeight / rowCount;
        const numExtraSymbols = 10 + index; // More symbols for later reels (staggered effect)

        // Generate random symbols for the strip
        const stripSymbols = [];

        // Add random symbols at the beginning (visible when starting)
        for (let i = 0; i < rowCount; i++) {
          stripSymbols.push(visibleSymbols[i]);
        }

        // Add random symbols for the main spinning part
        for (let i = 0; i < numExtraSymbols; i++) {
          stripSymbols.push(getRandomSymbol());
        }

        // Add the final result symbols at the end
        stripSymbols.push(...newSymbols);

        // Create all the symbol elements
        stripSymbols.forEach(symbolId => {
          const symbolElement = document.createElement('div');
          symbolElement.className = 'symbol flex justify-center items-center w-full h-[33.33%]';

          const symbol = symbols.find(s => s.id === symbolId) || symbols[0];

          const img = document.createElement('img');
          img.src = symbolImages[symbol.id] || symbolImages.default;
          img.alt = symbol.id;
          img.className = `w-[12vh] h-[12vh] object-contain ${symbol.id === 'seven' ? 'premium-symbol' : ''}`;

          symbolElement.appendChild(img);
          symbolStrip.appendChild(symbolElement);
        });

        // Set initial position of the strip - start with current symbols visible
        symbolStrip.style.transform = 'translateY(0)';

        // Add the strip to the animation container
        animContainer.appendChild(symbolStrip);

        // Replace the current content with our animation elements
        spinningElementRef.current.innerHTML = '';
        spinningElementRef.current.appendChild(animContainer);

        // Force a reflow to ensure the initial position is rendered
        void symbolStrip.offsetHeight;

        // Calculate the final position - should stop with new symbols visible
        // Total travel distance is the height of all symbols except the final set
        const totalTravel = (stripSymbols.length - rowCount) * visibleRowHeight;

        // Apply easing animation
        symbolStrip.style.transition = `transform ${duration / 1000}s cubic-bezier(0.12, 0.8, 0.32, 1)`;
        symbolStrip.style.transform = `translateY(-${totalTravel}px)`;

        // Add dynamic blur based on animation progress
        let currentBlur = 0;
        let maxBlur = 1; // Maximum blur in pixels

        // Animation timing variables
        const startTime = performance.now();
        const blurAnimation = () => {
          const elapsed = performance.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Blur pattern: increase quickly, maintain, then decrease slowly
          if (progress < 0.1) {
            // Quick ramp up
            currentBlur = progress * 10 * maxBlur;
          } else if (progress < 0.7) {
            // Maintain max blur during main spinning
            currentBlur = maxBlur;
          } else {
            // Slow decrease
            currentBlur = maxBlur * (1 - ((progress - 0.7) / 0.3));
          }

          // Apply the blur
          symbolStrip.style.filter = `blur(${currentBlur}px)`;

          // Continue animation if not complete
          if (progress < 1) {
            requestAnimationFrame(blurAnimation);
          } else {
            // Animation complete, final cleanup
            symbolStrip.style.filter = 'none';
          }
        };

        // Start the blur animation
        requestAnimationFrame(blurAnimation);

        // Add a bounce effect at the end
        setTimeout(() => {
          if (reelContainerRef.current) {
            reelContainerRef.current.classList.add('reel-bounce');
            setTimeout(() => {
              reelContainerRef.current.classList.remove('reel-bounce');
            }, 300);
          }
        }, duration - 150);

        // After animation completes, restore the normal symbols view
        setTimeout(() => {
          setVisibleSymbols(newSymbols);

          // Remove animation elements
          if (spinningElementRef.current) {
            spinningElementRef.current.innerHTML = '';
          }

          // Re-render with the component's normal JSX
          newSymbols.forEach((symbolId, i) => {
            const symbolDiv = document.createElement('div');
            symbolDiv.className = 'symbol flex justify-center items-center w-full h-[33.33%]';

            const symbol = symbols.find(s => s.id === symbolId) || symbols[0];

            const img = document.createElement('img');
            img.src = symbolImages[symbol.id] || symbolImages.default;
            img.alt = symbol.id;
            img.className = `w-[12vh] h-[12vh] object-contain ${symbol.id === 'seven' ? 'premium-symbol' : ''}`;

            // Store ref to this symbol for direct manipulation later
            symbolRefs.current[i] = img;

            symbolDiv.appendChild(img);
            spinningElementRef.current.appendChild(symbolDiv);
          });

          resolve(newSymbols);

          // After a small delay (to ensure the GameStore has processed winnings),
          // manually check and highlight winning symbols
          setTimeout(() => {
            highlightWinningSymbols();
          }, 100);

        }, duration);
      });
    }
  }));

  return (
    <div
      ref={reelContainerRef}
      className={`reel relative w-[95%] md:w-[90%] h-[30vh] sm:h-[45vh] md:h-[51vh] mx-0.5 overflow-hidden border-2 ${index === 2 ? 'border-blue-500' : 'border-yellow-500'} rounded bg-reel${index}`}
    >
      <div ref={spinningElementRef} className="spinning-symbols absolute w-full h-full">
        {visibleSymbols.map((symbolId, rowIndex) => (
          <Symbol
            key={rowIndex}
            symbolId={symbolId}
            isWinning={false}
            imagesLoaded={imagesLoaded}
            symbols={symbols}
          />
        ))}
      </div>

      {/* Light effects on the sides of reels */}
      <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-r from-blue-400 to-transparent opacity-30"></div>
      <div className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-l from-blue-400 to-transparent opacity-30"></div>
      
    </div>
  );
}));

export default Reel;