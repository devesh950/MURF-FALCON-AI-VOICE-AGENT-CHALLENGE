
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import GameMaster from './GameMaster';
import './index.css';

function App() {
  const [showAdventure, setShowAdventure] = useState(false);
  if (!showAdventure) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
      }}>
        <button
          className="join-voice-btn"
          onClick={() => setShowAdventure(true)}
          style={{ padding: '1rem 2.5rem', borderRadius: 12, background: '#1e88e5', color: '#fff', fontWeight: 'bold', fontSize: '1.3rem', border: 'none', cursor: 'pointer' }}
        >
          Join Voice Room
        </button>
      </div>
    );
  }
  // Only show GameMaster after button click
  return <GameMaster />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
