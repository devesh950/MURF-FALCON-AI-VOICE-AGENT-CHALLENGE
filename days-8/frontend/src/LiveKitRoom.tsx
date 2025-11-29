import React, { useState } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;
const LIVEKIT_API_KEY = import.meta.env.VITE_LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = import.meta.env.VITE_LIVEKIT_API_SECRET;

async function fetchToken(identity: string, room: string): Promise<string> {
  // Fetch token from your backend
  const resp = await fetch('http://localhost:8008/api/livekit-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      room,
      identity,
    }),
  });
  if (!resp.ok) throw new Error('Failed to fetch LiveKit token');
  const data = await resp.json();
  return data.token;
}

// LiveKitRoomComponent removed from UI as requested
export const LiveKitRoomComponent = () => null;

// Modal component for join and room UI
const LiveKitRoomModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [token, setToken] = useState<string | null>(null);
  const [identity, setIdentity] = useState('player-' + Math.floor(Math.random() * 10000));
  const [roomName] = useState('day8-demo');
  const [loading, setLoading] = useState(false);

  const handleJoinRoom = async () => {
    setLoading(true);
    try {
      const t = await fetchToken(identity, roomName);
      setToken(t);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.85)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ position: 'relative', background: '#23272f', borderRadius: 12, boxShadow: '0 4px 32px #000a', padding: 16, minWidth: 320 }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, padding: '0.3rem 0.8rem', fontWeight: 'bold', cursor: 'pointer', zIndex: 10 }}>Close</button>
        {!token ? (
          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <h2>Join LiveKit Room</h2>
            <input value={identity} onChange={e => setIdentity(e.target.value)} placeholder="Your name" style={{ marginRight: 8, padding: '0.5rem', borderRadius: 6, border: '1px solid #444' }} />
            <button
              onClick={handleJoinRoom}
              style={{ padding: '0.7rem 1.5rem', borderRadius: 8, background: '#1e88e5', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}
              disabled={loading}
            >
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        ) : (
          <LiveKitRoom
            token={token}
            serverUrl={LIVEKIT_URL}
            connect={true}
            data-lk-theme="default"
            style={{ height: 500, width: 700, maxWidth: '90vw' }}
          >
            <VideoConference />
          </LiveKitRoom>
        )}
      </div>
    </div>
  );
};
