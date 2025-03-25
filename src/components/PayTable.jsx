import React from 'react';
import { observer } from 'mobx-react-lite';
import { useGameStore } from '../stores/GameStore.jsx';
import cherryImg from '../assets/images/symbols/cherry.png';
import lemonImg from '../assets/images/symbols/lemon.png';
import orangeImg from '../assets/images/symbols/orange.png';
import plumImg from '../assets/images/symbols/plum.png';
import bellImg from '../assets/images/symbols/bell.png';
import sevenImg from '../assets/images/symbols/seven.png';

// Symbol image mapping for the pay table
const symbolImages = {
  cherry: cherryImg,
  lemon: lemonImg,
  orange: orangeImg,
  plum: plumImg,
  bell: bellImg,
  seven: sevenImg
};

const PayTable = observer(({ className }) => {
  const gameStore = useGameStore();
  const payouts = gameStore.gameLogic.payouts;
  const stats = gameStore.gameLogic.stats;
  
  const getWinRate = () => {
    if (stats.spins === 0) return '0.0';
    return ((stats.wins / stats.spins) * 100).toFixed(1);
  };
  
  // Symbol names for display
  const symbolNames = {
    seven: 'Lucky 7',
    bell: 'Golden Bell',
    plum: 'Purple Plum',
    orange: 'Orange',
    lemon: 'Lemon',
    cherry: 'Cherry'
  };
  
  // Create symbol rows for each symbol in order of value
  const symbolRows = Object.keys(symbolNames).map(symbolId => {
    return {
      id: symbolId,
      name: symbolNames[symbolId],
      image: symbolImages[symbolId],
      payouts: {
        three: payouts.threeOfAKind[symbolId],
        four: payouts.fourOfAKind[symbolId],
        five: payouts.fiveOfAKind[symbolId]
      }
    };
  }).sort((a, b) => b.payouts.five - a.payouts.five); // Sort by highest 5x value
  
  return (
    <div className={`bg-gray-800 bg-opacity-90 p-4 rounded-lg shadow-lg text-white max-w-5xl overflow-y-auto max-h-[90vh] ${className}`}>
    <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">Pay Table</h3>
    
    {/* Modern pay table with symbols */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <table className="w-full text-center border-collapse">
        <thead>
          <tr className="bg-gray-700">
            <th className="px-2 py-2 rounded-tl-lg">Symbol</th>
            <th className="px-2 py-2">3 of a Kind</th>
            <th className="px-2 py-2">4 of a Kind</th>
            <th className="px-2 py-2 rounded-tr-lg">5 of a Kind</th>
          </tr>
        </thead>
        <tbody>
          {symbolRows.map((symbol, index) => (
            <tr key={symbol.id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
              <td className="px-2 py-3 flex items-center justify-center">
                <img src={symbol.image} alt={symbol.name} className="w-8 h-8 mr-2" />
                <span>{symbol.name}</span>
              </td>
              <td className="px-2 py-3">{symbol.payouts.three}x</td>
              <td className="px-2 py-3">{symbol.payouts.four}x</td>
              <td className="px-2 py-3 font-bold text-yellow-300">{symbol.payouts.five}x</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="bg-gray-700 rounded-lg p-4 flex flex-col justify-between">
        <div>
          <h4 className="text-lg font-bold text-yellow-400 mb-2">How to Win</h4>
          <p className="mb-4">Match 3 or more of the same symbols in adjacent positions in a row.</p>
        
          <h4 className="text-lg font-bold text-yellow-400 mb-2">Game Rules</h4>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Symbols must be in adjacent positions</li>
            <li>Multiple winning combinations are paid</li>
            <li>Each symbol can be used in multiple winning combinations</li>
            <li>Seven is the highest paying symbol.</li>
          </ul>
          
          {/* <h4 className="text-lg font-bold text-yellow-400 mb-2">Special Features</h4>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><span className="text-yellow-300">Big Win:</span> Win 30x or more of your bet</li>
            <li><span className="text-yellow-300">Mega Win:</span> Win 50x or more of your bet</li>
            <li>Big and Mega wins feature special celebrations!</li>
          </ul> */}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-600">
          <h4 className="text-lg font-bold text-yellow-400 mb-2">Game Statistics</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-sm text-gray-400">Spins</div>
              <div className="text-xl">{stats.spins}</div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-sm text-gray-400">Win Rate</div>
              <div className="text-xl">{getWinRate()}%</div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-sm text-gray-400">Total Bet</div>
              <div className="text-xl">{stats.totalBet}</div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-sm text-gray-400">Total Won</div>
              <div className="text-xl text-green-400">{stats.totalWon}</div>
            </div>
            <div className="bg-gray-800 p-2 rounded col-span-2">
              <div className="text-sm text-gray-400">Return to Player (RTP)</div>
              <div className="text-xl">{stats.totalBet > 0 ? ((stats.totalWon / stats.totalBet) * 100).toFixed(2) : '0.00'}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  </div>
  );
});

export default PayTable;