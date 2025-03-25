import React, { memo, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import cherryImg from '../assets/images/symbols/cherry.png';
import lemonImg from '../assets/images/symbols/lemon.png';
import orangeImg from '../assets/images/symbols/orange.png';
import plumImg from '../assets/images/symbols/plum.png';
import bellImg from '../assets/images/symbols/bell.png';
import sevenImg from '../assets/images/symbols/seven.png';
import defaultImg from '../assets/images/symbols/default.png';

// Symbol image mapping - moved to a separate file for reuse
export const symbolImages = {
  cherry: cherryImg,
  lemon: lemonImg,
  orange: orangeImg,
  plum: plumImg,
  bell: bellImg,
  seven: sevenImg,
  default: defaultImg
};

const Symbol = observer(({ 
  symbolId, 
  isWinning = false, 
  imagesLoaded = true, 
  symbols,
  className = ''
}) => {
  // Find the symbol definition
  const symbol = symbols.find(s => s.id === symbolId) || symbols[0];
  const symbolImage = symbolImages[symbol.id] || symbolImages.default;
  
  // State to handle animation
  const [scale, setScale] = useState(1);
  
  // Effect to animate when winning state changes
  useEffect(() => {
    if (isWinning) {
      // Start with larger scale
      setScale(1.8);
      
      // Then return to normal scale after animation completes
      const timeout = setTimeout(() => {
        setScale(1.3);
      }, 500);
      
      return () => clearTimeout(timeout);
    } else {
      setScale(1);
    }
  }, [isWinning]);
  
  return (
    <div className={`symbol flex justify-center items-center w-full h-[33.33%] ${className}`}>
      {imagesLoaded ? (
        <img 
          src={symbolImage}
          alt={symbol.id}
          className={`w-[12vh] h-[12vh] object-contain ${symbol.id === 'seven' ? 'premium-symbol' : ''} transition-transform duration-300`}
          style={{ transform: `scale(${scale})` }}
        />
      ) : (
        <div className="w-[10vh] h-[10vh] bg-gray-700 animate-pulse rounded-full"></div>
      )}
    </div>
  );
});

export default memo(Symbol);