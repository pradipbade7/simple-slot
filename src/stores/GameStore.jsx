import React, { createContext, useContext } from 'react';
import { makeAutoObservable, action } from 'mobx';
import GameLogic from '../utils/gameLogic.jsx';


// Import sound files
import spinClickSound from '../assets/sounds/spin-click.mp3';
import reelSpinSound from '../assets/sounds/reel-spins.mp3';
// import reelStopSound from '../assets/sounds/reel-stop.mp3';
import smallWinSound from '../assets/sounds/win.mp3';
import bigWinSound from '../assets/sounds/win.mp3';
import jackpotWinSound from '../assets/sounds/jackpot.mp3';

// Storage key constants
const STORAGE_KEYS = {
  CREDITS: 'slotMachine_credits',
  STATS: 'slotMachine_stats',
  LAST_WIN: 'slotMachine_lastWin',
  CURRENT_BET: 'slotMachine_currentBet',
  SOUND_ENABLED: 'slotMachine_soundEnabled' // Add sound setting
};

// Default values if no stored data
const DEFAULT_CREDITS = 1000;
const DEFAULT_STATS = {
  spins: 0,
  wins: 0,
  totalBet: 0,
  totalWon: 0
};
const DEFAULT_BET = 10;

class GameStore {
  // State
  credits = this.loadCredits();
  currentBet = this.loadCurrentBet();
  isSpinning = false;
  reelResults = [];
  lastWin = this.loadLastWin();
  gameLogic = new GameLogic();

  // Bet constraints
  minBet = 1;
  maxBet = 100;

  // Bet options
  betOptions = [1, 2, 5, 10, 25];

  // Add this property to your GameStore class if it doesn't exist:
  winningPositions = []; // 2D array to track which positions are part of winning combinations

  // Add sound-related properties
  soundEnabled = true;
  sounds = {
    spinClick: null,
    reelSpin: null,
    reelStop: null,
    smallWin: null,
    bigWin: null,
    jackpotWin: null
  };

  constructor() {
    // Initialize gameLogic with saved stats but don't use its internal stats tracking
    // We'll handle all stats in the store to avoid double-counting
    this.gameLogic.stats = this.loadStats();
    // Initialize sound preferences
    this.soundEnabled = this.loadSoundPreference();

    // Initialize audio objects
    this.initSounds();

    makeAutoObservable(this, {
      toggleSound: action,
      playSound: action
    });



    // Save data on window unload
    window.addEventListener('beforeunload', () => {
      this.saveGameData();
    });
  }


  // Sound-related methods
  initSounds() {
    // Create audio objects for each sound
    this.sounds.spinClick = new Audio(spinClickSound);
    this.sounds.reelSpin = new Audio(reelSpinSound);
    // this.sounds.reelStop = new Audio(reelStopSound);
    this.sounds.smallWin = new Audio(smallWinSound);
    this.sounds.bigWin = new Audio(bigWinSound);
    this.sounds.jackpotWin = new Audio(jackpotWinSound);

    // Pre-load all sounds
    Object.values(this.sounds).forEach(sound => {
      if (sound) {
        sound.load();
        // Set appropriate volumes
        sound.volume = 0.6; // Default volume at 60%
      }
    });

    // Set specific volumes if needed
    if (this.sounds.jackpotWin) this.sounds.jackpotWin.volume = 0.7;
    if (this.sounds.reelSpin) this.sounds.reelSpin.volume = 0.4;
  }

  playSound(soundName) {
    if (!this.soundEnabled || !this.sounds[soundName]) return;

    const sound = this.sounds[soundName];

    // Stop and reset any currently playing sounds
    sound.pause();
    sound.currentTime = 0;

    // Play the sound
    sound.play().catch(error => {
      console.warn(`Failed to play sound ${soundName}:`, error);
    });
  }

  toggleSound = () => {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, this.soundEnabled.toString());
  }

  loadSoundPreference() {
    const storedPref = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    return storedPref === null ? true : storedPref === 'true';
  }

  // Load methods
  loadCredits() {
    const storedCredits = localStorage.getItem(STORAGE_KEYS.CREDITS);
    return storedCredits ? parseInt(storedCredits, 10) : DEFAULT_CREDITS;
  }

  loadLastWin() {
    const storedLastWin = localStorage.getItem(STORAGE_KEYS.LAST_WIN);
    return storedLastWin ? parseInt(storedLastWin, 10) : 0;
  }

  loadCurrentBet() {
    const storedBet = localStorage.getItem(STORAGE_KEYS.CURRENT_BET);
    return storedBet ? parseInt(storedBet, 10) : DEFAULT_BET;
  }

  loadStats() {
    const storedStats = localStorage.getItem(STORAGE_KEYS.STATS);
    return storedStats ? JSON.parse(storedStats) : DEFAULT_STATS;
  }

  // Save methods
  saveGameData() {
    localStorage.setItem(STORAGE_KEYS.CREDITS, this.credits.toString());
    localStorage.setItem(STORAGE_KEYS.LAST_WIN, this.lastWin.toString());
    localStorage.setItem(STORAGE_KEYS.CURRENT_BET, this.currentBet.toString());
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(this.gameLogic.stats));
  }

  // Actions
  spin = async () => {

    if (this.isSpinning || this.credits < this.currentBet) return;

    // Play spin button click sound
    this.playSound('spinClick');

    this.isSpinning = true;
    this.credits -= this.currentBet;
    this.lastWin = 0; // Reset last win amount

    // Clear winning positions when starting a new spin
    this.winningPositions = [];

    // Play reel spinning sound
    this.playSound('reelSpin');

    // Update stats for this spin - ONLY update here, not in gameLogic
    this.gameLogic.stats.spins++;
    this.gameLogic.stats.totalBet += this.currentBet;

    // Save immediately after deducting credits
    this.saveGameData();
  }

  // And in the finishSpin method:
  // Modify the finishSpin method to include a small delay for animations
  finishSpin = (results) => {
    this.reelResults = results;


    // Stop the reel spin sound if it's playing
    if (this.sounds.reelSpin) {
      this.sounds.reelSpin.pause();
      this.sounds.reelSpin.currentTime = 0;
    }
    // Calculate winnings
    const winInfo = this.gameLogic.calculateWinningsWithoutStatsUpdate(results, this.currentBet);

    // Clear any previous winning positions first
    this.winningPositions = [];

    if (winInfo.totalWin > 0) {
      this.lastWin = winInfo.totalWin;
      this.credits += winInfo.totalWin;

      if (this.sounds.reelSpin) {
        this.sounds.reelSpin.pause();
        this.sounds.reelSpin.currentTime = 0;
      }
      // Play appropriate win sound based on win amount
      const winRatio = winInfo.totalWin / this.currentBet;

      if (winRatio >= 50) {
        // Jackpot win (50x or more)
        this.playSound('jackpotWin');
        this.createConfetti(winRatio);
      } else if (winRatio >= 30) {
        this.playSound('bigWin');
        this.createConfetti(winRatio * 10);
      } else {
        this.playSound('smallWin');
        this.createConfetti(winRatio * 10);
      }

      // Update win stats
      this.gameLogic.stats.wins++;
      this.gameLogic.stats.totalWon += winInfo.totalWin;

      // Add a slight delay before setting winning positions
      // This ensures DOM has time to settle after spin animation
      setTimeout(() => {
        // Initialize winning positions array
        this.winningPositions = Array(results.length)
          .fill()
          .map(() => Array(results[0].length).fill(false));

        // Mark winning positions based on winLines
        winInfo.winLines.forEach(line => {
          for (let reel = line.startPos; reel <= line.endPos; reel++) {
            this.winningPositions[reel][line.row] = true;
          }
        });
      }, 200);
    } else {
      this.lastWin = 0;
    }

    this.isSpinning = false;

    // Save data after updating credits and stats
    this.saveGameData();
  }

  // Add the confetti creation methods to your GameStore class
  createConfetti = (count = 150) => {
    const colors = [
      // Original colors
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
      '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',

      // Additional vibrant colors
      '#D500F9', '#651FFF', '#3D5AFE', '#00B0FF', '#1DE9B6', '#76FF03', '#FFEA00', '#FF9100',

      // Pastel colors
      '#FFCDD2', '#F8BBD0', '#E1BEE7', '#D1C4E9', '#C5CAE9', '#BBDEFB', '#B3E5FC', '#B2EBF2',
      '#B2DFDB', '#C8E6C9', '#DCEDC8', '#F0F4C3', '#FFF9C4', '#FFECB3', '#FFE0B2', '#FFCCBC',

      // Metallic colors (lighter variants for better visibility)
      '#FFD700', // Gold
      '#FFC107', // Amber-gold
      '#E6C200', // Darker gold
      '#C0C0C0', // Silver
      '#DDDDDD', // Light silver
      '#A7A7A7', // Darker silver
      '#CD7F32', // Bronze
      '#B87333', // Copper

      // Bright neon colors
      '#39FF14', // Neon green
      '#FF10F0', // Neon pink
      '#FFF01F', // Neon yellow
      '#7DF9FF', // Electric blue
      '#FF2301', // Bright red

      // Gradient-friendly complementary pairs
      '#FF0000', '#00FFFF', // Red & Cyan
      '#FF00FF', '#FFFF00', // Magenta & Yellow
      '#0000FF', '#00FF00'  // Blue & Green
    ];
    const shapes = ['square', 'circle', 'triangle', 'star', ''];
  // Find the game-home element
  const gameHome = document.querySelector('.game-home');
  
  // If game-home is not found, fallback to body
  const container = gameHome || document.body;

    // Make sure the container has position relative if it's not already
    if (container === gameHome) {
      const currentPosition = window.getComputedStyle(container).position;
      if (currentPosition === 'static') {
        container.style.position = 'relative';
      }
    }
    
    // Create a confetti container to prevent overflow issues
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    confettiContainer.style.position = 'absolute';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.overflow = 'hidden';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '1000';
  // Append the container
  container.appendChild(confettiContainer);

    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');

      // Random shape
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      confetti.className = `confetti ${shape}`;

      // Random color
      confetti.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);

      // Random width (between 1px and 6px)
      const width = Math.random() * 5 + 1;

      // Calculate height inversely proportional to width (scaled within 20px to 40px)
      const height = 60 - width * 10; // Ensures height is in the range of ~20px to 40px

      confetti.style.setProperty('--width', `${width}px`);
      confetti.style.setProperty('--height', `${height}px`);


      // Random opacity (between 0.6 and 1)
      confetti.style.setProperty('--opacity', Math.random() * 0.4 + 0.6);

      // Random fall duration (between 2 and 5 seconds)
      confetti.style.setProperty('--fall-duration', `${Math.random() * 3 + 2}s`);

      // Random starting position
      confetti.style.left = `${Math.random() * 100}vw`;

     // Append confetti to the container instead of directly to the document
    confettiContainer.appendChild(confetti);

      // Remove confetti after animation
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.remove();
        }
      }, 5000);
    }
  }



  setBet = (bet) => {
    if (!this.isSpinning && bet >= this.minBet && bet <= this.maxBet) {
      this.currentBet = bet;
      this.saveGameData();
    }
  }

  incrementBet = () => {
    if (!this.isSpinning && this.currentBet < this.maxBet) {
      this.currentBet += 1;
      this.saveGameData();
    }
  }

  decrementBet = () => {
    if (!this.isSpinning && this.currentBet > this.minBet) {
      this.currentBet -= 1;
      this.saveGameData();
    }
  }

  // Reset game (for testing or if player wants to start fresh)
  resetGame = () => {
    this.credits = DEFAULT_CREDITS;
    this.currentBet = DEFAULT_BET;
    this.lastWin = 0;
    this.gameLogic.stats = { ...DEFAULT_STATS };
    this.saveGameData();
  }

  // Add credits (for demo purposes or in-app purchases)
  addCredits = (amount) => {
    if (amount > 0) {
      this.credits += amount;
      this.saveGameData();
    }
  }

  // Computed values
  get canSpin() {
    return !this.isSpinning && this.credits >= this.currentBet;
  }
}

// Create a React context for the store
const GameStoreContext = createContext();

// Create a provider component
export const GameStoreProvider = ({ children }) => {
  const store = new GameStore();

  return (
    <GameStoreContext.Provider value={store}>
      {children}
    </GameStoreContext.Provider>
  );
};

// Hook to use the store
export const useGameStore = () => {
  const store = useContext(GameStoreContext);
  if (!store) {
    throw new Error('useGameStore must be used within a GameStoreProvider');
  }
  return store;
};

export default GameStore;