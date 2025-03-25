import { makeAutoObservable } from 'mobx';

class GameLogic {
  // Define all possible symbols and their properties
  symbols = [
    { id: 'cherry', value: 10, weight: 20 }, // Higher weight = more frequent
    { id: 'lemon', value: 20, weight: 15 },
    { id: 'orange', value: 30, weight: 12 },
    { id: 'plum', value: 40, weight: 10 },
    { id: 'bell', value: 50, weight: 8 },
    { id: 'seven', value: 100, weight: 5 } // Lower weight = rare
  ];

  // Payout table (multipliers for different combinations)
  payouts = {
    threeOfAKind: {
      'seven': 25,
      'bell': 20,
      'plum': 10,
      'orange': 5,
      'lemon': 4,
      'cherry': 3
    },
    fourOfAKind: {
      'seven': 50,
      'bell': 30,
      'plum': 20,
      'orange': 15,
      'lemon': 10,
      'cherry': 5
    },
    fiveOfAKind: {
      'seven': 100,
      'bell': 60,
      'plum': 40,
      'orange': 30,
      'lemon': 20,
      'cherry': 10
    },
    anyPair: 2,
    wildCombo: 5  // For future wild symbol functionality
  };

  // Track game statistics
  stats = {
    spins: 0,
    wins: 0,
    totalBet: 0,
    totalWon: 0
  };
  
  constructor() {
    makeAutoObservable(this);
    // Probability settings
    this.totalWeight = this.symbols.reduce((total, symbol) => total + symbol.weight, 0);
  }

  /**
   * Original method that calculates winnings AND updates stats
   * @param {Array} reelResults - 2D Array of symbol IDs [reel][row]
   * @param {number} betAmount - The amount bet for this spin
   * @return {Object} Win information including total amount and win lines
   */
  calculateMultiRowWinnings(reelResults, betAmount) {
    // NOTE: This method updates stats, which causes double counting if GameStore also updates stats
    this.stats.spins++;
    this.stats.totalBet += betAmount;
    
    // Calculate winnings (common logic)
    const winInfo = this.calculateWinningLogic(reelResults, betAmount);
    
    // Update statistics for wins
    if (winInfo.totalWin > 0) {
      this.stats.wins++;
      this.stats.totalWon += winInfo.totalWin;
    }
    
    return winInfo;
  }
  
  /**
   * New method that calculates winnings WITHOUT updating stats
   * @param {Array} reelResults - 2D Array of symbol IDs [reel][row]
   * @param {number} betAmount - The amount bet for this spin
   * @return {Object} Win information including total amount and win lines
   */
  calculateWinningsWithoutStatsUpdate(reelResults, betAmount) {
    // Just calculate winnings without updating stats
    return this.calculateWinningLogic(reelResults, betAmount);
  }
  
  /**
   * Common winning calculation logic extracted to avoid duplication
   * @param {Array} reelResults - 2D Array of symbol IDs [reel][row]
   * @param {number} betAmount - The amount bet for this spin
   * @return {Object} Win information including total amount and win lines
   */
  calculateWinningLogic(reelResults, betAmount) {
    // Default to no win
    let winInfo = {
      totalWin: 0,
      winLines: []
    };
    
    // Check horizontal lines (each row across all reels)
    const rowCount = reelResults[0].length; // Number of rows
    const reelCount = reelResults.length; // Number of reels
    
    // For each row
    for (let row = 0; row < rowCount; row++) {
      const rowSymbols = reelResults.map(reel => reel[row]);
      
      // Check for consecutive matches anywhere in the row
      // We'll use a sliding window approach to find consecutive matches
      for (let startPos = 0; startPos <= reelCount - 3; startPos++) {
        // Check for consecutive matches starting at startPos
        let currentSymbol = rowSymbols[startPos];
        let matchCount = 1;
        
        // Count consecutive matches
        for (let i = startPos + 1; i < reelCount; i++) {
          if (rowSymbols[i] === currentSymbol) {
            matchCount++;
          } else {
            break; // Stop counting when we hit a different symbol
          }
        }
        
        // If we have at least 3 consecutive matches, it's a win
        if (matchCount >= 3) {
          const symbolId = currentSymbol;
          let multiplier;
          let winType;
          
          // Determine win type and multiplier based on match count
          if (matchCount === 5) {
            winType = 'fiveOfAKind';
            multiplier = this.payouts.fiveOfAKind[symbolId];
          } else if (matchCount === 4) {
            winType = 'fourOfAKind';
            multiplier = this.payouts.fourOfAKind[symbolId];
          } else { // matchCount === 3
            winType = 'threeOfAKind';
            multiplier = this.payouts.threeOfAKind[symbolId];
          }
          
          const winAmount = betAmount * multiplier;
          
          winInfo.totalWin += winAmount;
          winInfo.winLines.push({
            type: winType,
            row,
            startPos,
            endPos: startPos + matchCount - 1,
            symbolId,
            matchCount,
            multiplier,
            amount: winAmount
          });
          
          // Skip ahead to avoid double-counting (e.g. if we have 4 in a row, don't also count the first 3)
          startPos += matchCount - 1;
        }
      }
    }
    
    // Also check for patterns like diagonal matches if desired
    // Example commented out for now
    /*
    // Check diagonal from top-left to bottom-right
    if (reelCount >= 3 && rowCount >= 3) {
      const diagonalSymbols = [];
      for (let i = 0; i < Math.min(reelCount, rowCount); i++) {
        diagonalSymbols.push(reelResults[i][i]);
      }
      
      // Check the diagonal for matches
      // Code similar to row checking...
    }
    */
    
    return winInfo;
  }
}

export default GameLogic;