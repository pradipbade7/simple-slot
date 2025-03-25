import React from 'react';
import ReactDOM from 'react-dom/client';
import GameHome from './components/GameHome.jsx';
import { GameStoreProvider } from './stores/GameStore.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GameStoreProvider>
      <GameHome />
    </GameStoreProvider>
  </React.StrictMode>
);