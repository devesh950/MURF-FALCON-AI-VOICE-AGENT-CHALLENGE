import React, { useState, useRef } from 'react';

interface WorldState {
  location: string;
  players: { name: string; hp: number }[];
  turn: number;
  [key: string]: any;
}

interface GMResponse {
  narration: string;
  update: Partial<WorldState>;
  audio_base64?: string;
}

const defaultWorld = (universe: string): WorldState => ({
  location:
    universe === 'fantasy'
      ? 'village square'
      : universe === 'sci-fi'
      ? 'derelict shuttle'
      : 'old manor',
  players: [{ name: 'Player1', hp: 10 }],
  turn: 1,
});

function GameMaster() {
  const [pendingGreeting, setPendingGreeting] = useState(false);
  const [universe, setUniverse] = useState('fantasy');
  const [selectedUser, setSelectedUser] = useState('Player1');
  const userOptions = ['Player1', 'Player2', 'Player3'];
  const [world, setWorld] = useState<WorldState>(defaultWorld('fantasy'));
  const [greeted, setGreeted] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);

    function defaultWorldWithUser(universe: string, user: string): WorldState {
      return {
        location:
          universe === 'fantasy'
            ? 'village square'
            : universe === 'sci-fi'
            ? 'derelict shuttle'
            : 'old manor',
        players: [{ name: user, hp: 10 }],
        turn: 1,
      };
    }
  const [history, setHistory] = useState<{ role: string; text: string }[]>([]);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [gmMessages, setGMMessages] = useState<string[]>([]);
  const [playerMessages, setPlayerMessages] = useState<string[]>([]);
  const [statePanelVisible, setStatePanelVisible] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [agentState, setAgentState] = useState<'ready' | 'listening' | 'thinking' | 'speaking'>('ready');
  const playerInputRef = useRef<HTMLInputElement>(null);
  const [micLevel, setMicLevel] = useState(0);

  // For immersive header art
  const universeArt = {
    fantasy: '🗡️🐉',
    'sci-fi': '🚀🤖',
    mystery: '🕵️‍♂️🏚️',
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    const u = new window.SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const createPrompt = (playerText: string) => {
    return `You are a creative Game Master for a ${universe} scenario. Keep scenes short and vivid. Maintain a consistent world state in JSON: ${JSON.stringify(
      world
    )}. Player said: "${playerText}". Respond with a short narration (1-3 sentences) and end by asking "What do you do next?". Also include a one-line JSON_UPDATE block that describes any changes to the world state in JSON.`;
  };

  const callLocalLLM = async (prompt: string, playerText: string, audioBlob?: Blob): Promise<GMResponse> => {
    try {
      let res;
      if (audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'input.wav');
        formData.append('history', JSON.stringify(history));
        formData.append('world', JSON.stringify(world));
        formData.append('universe', universe);
        // player_input left blank, will be filled by STT
        res = await fetch('http://localhost:8008/api/gm', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('http://localhost:8008/api/gm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            history,
            world,
            universe,
            player_input: playerText,
          }),
        });
      }
      if (!res.ok) throw new Error('Backend error');
      return await res.json();
    } catch (e: any) {
      return {
        narration: '[Backend unavailable] ' + e.message,
        update: { ...world, turn: world.turn + 1 },
      };
    }
  };

  // Audio recording state
  const [recording, setRecording] = useState(false);
  const [liveSession, setLiveSession] = useState(false); // true = continuous mode
  const liveSessionRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder|null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream|null>(null);
  const silenceTimeoutRef = useRef<number|null>(null);


  // Live/continuous audio input logic with silence detection and auto-restart

  // Persistent stream for the whole live session
  const persistentStreamRef = useRef<MediaStream|null>(null);
  const persistentAudioContextRef = useRef<AudioContext|null>(null);
  const persistentAnalyserRef = useRef<AnalyserNode|null>(null);
  const persistentSourceRef = useRef<MediaStreamAudioSourceNode|null>(null);


  // True live session: persistent stream, analyser, and source
  const startLiveSession = async () => {
    if (!navigator.mediaDevices) return;
    setLiveSession(true);
    liveSessionRef.current = true;
    setTranscript('');
    setAgentState('listening');

    // Only request stream once per session
    if (!persistentStreamRef.current) {
      persistentStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    }
    const stream = persistentStreamRef.current;
    streamRef.current = stream;
    audioChunksRef.current = [];

    // Only create audio context/analyser/source once per session
    if (!persistentAudioContextRef.current) {
      persistentAudioContextRef.current = new window.AudioContext();
    }
    const audioContext = persistentAudioContextRef.current;
    if (!persistentSourceRef.current) {
      persistentSourceRef.current = audioContext.createMediaStreamSource(stream);
    }
    if (!persistentAnalyserRef.current) {
      persistentAnalyserRef.current = audioContext.createAnalyser();
      persistentSourceRef.current.connect(persistentAnalyserRef.current);
      persistentAnalyserRef.current.fftSize = 2048;
    }
    const analyser = persistentAnalyserRef.current;
    const dataArray = new Uint8Array(analyser.fftSize);

    // Helper to start a new utterance
    const startUtterance = () => {
      audioChunksRef.current = [];
      const mediaRecorder = new window.MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      let recordingStart = 0;
      let speechDetected = false;
      const MIN_RECORDING_MS = 1000; // 1 second minimum
      const SILENCE_THRESHOLD = 0.035; // less sensitive than before
      const SPEECH_START_THRESHOLD = 0.045; // require this loudness to start silence detection

      // Visual mic level and speech detection
      const checkMicLevel = () => {
        if (!liveSessionRef.current) return;
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const val = (dataArray[i] - 128) / 128;
          sum += val * val;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        setMicLevel(rms);
        if (!speechDetected && rms > SPEECH_START_THRESHOLD) {
          speechDetected = true;
          recordingStart = Date.now();
          silenceTimeoutRef.current = window.setTimeout(checkSilence, 300);
        } else if (!speechDetected) {
          silenceTimeoutRef.current = window.setTimeout(checkMicLevel, 100);
        }
      };

      const checkSilence = () => {
        if (!liveSessionRef.current) return;
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const val = (dataArray[i] - 128) / 128;
          sum += val * val;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        setMicLevel(rms);
        const now = Date.now();
        if (rms < SILENCE_THRESHOLD && now - recordingStart > MIN_RECORDING_MS) {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        } else {
          silenceTimeoutRef.current = window.setTimeout(checkSilence, 300);
        }
      };

      mediaRecorder.onstart = () => {
        speechDetected = false;
        setMicLevel(0);
        silenceTimeoutRef.current = window.setTimeout(checkMicLevel, 100);
      };

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        setAgentState('thinking');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setTranscript('Recognizing...');
        const formData = new FormData();
        formData.append('audio', audioBlob, 'input.wav');
        formData.append('history', JSON.stringify(history));
        formData.append('world', JSON.stringify(world));
        formData.append('universe', universe);
        const res = await fetch('http://localhost:8008/api/gm', {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          setTranscript(data.player_input || '[No speech detected]');
          setGMMessages((msgs) => [...msgs, '...thinking...']);
          setPlayerMessages((msgs) => [...msgs, data.player_input || '']);
          setHistory((h) => [...h, { role: 'player', text: data.player_input || '' }]);
          setExchangeCount((c) => c + 1);
          setWorld((w) => ({ ...w, ...data.update }));
          setAgentState('speaking');
          if (data.audio_base64) {
            const audio = new Audio('data:audio/mp3;base64,' + data.audio_base64);
            audio.onended = () => {
              setAgentState('ready');
              if (liveSessionRef.current) startUtterance();
            };
            audio.play();
          } else {
            speakText(data.narration);
            setTimeout(() => {
              setAgentState('ready');
              if (liveSessionRef.current) startUtterance();
            }, 2000);
          }
          setGMMessages((msgs) => [...msgs.slice(0, -1), data.narration]);
          setHistory((h) => [...h, { role: 'gm', text: data.narration }]);
          if (exchangeCount + 1 >= 15) {
            setGMMessages((msgs) => [...msgs, 'Session complete. Thanks for playing!']);
            speakText('Session complete. Thanks for playing!');
            setInputDisabled(true);
            setLiveSession(false);
            liveSessionRef.current = false;
            // Clean up persistent stream and audio context
            if (persistentStreamRef.current) {
              persistentStreamRef.current.getTracks().forEach((track) => track.stop());
              persistentStreamRef.current = null;
            }
            if (persistentAudioContextRef.current) {
              persistentAudioContextRef.current.close();
              persistentAudioContextRef.current = null;
            }
            persistentAnalyserRef.current = null;
            persistentSourceRef.current = null;
          }
        } else {
          setTranscript('[STT error]');
          setAgentState('ready');
          if (liveSessionRef.current) startUtterance();
        }
      };
      mediaRecorder.start();
      setRecording(true);
    };

    startUtterance();
  };

  const stopLiveSession = () => {
    setLiveSession(false);
    liveSessionRef.current = false;
    setRecording(false);
    setMicLevel(0);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    // Clean up persistent stream and audio context
    if (persistentStreamRef.current) {
      persistentStreamRef.current.getTracks().forEach((track) => track.stop());
      persistentStreamRef.current = null;
    }
    if (persistentAudioContextRef.current) {
      persistentAudioContextRef.current.close();
      persistentAudioContextRef.current = null;
    }
    persistentAnalyserRef.current = null;
    persistentSourceRef.current = null;
  };

  const onPlayerInput = async (text: string, audioBlob?: Blob) => {
    setPlayerMessages((msgs) => [...msgs, text]);
    setHistory((h) => [...h, { role: 'player', text }]);
    setExchangeCount((c) => c + 1);
    setGMMessages((msgs) => [...msgs, '...thinking...']);
    setAgentState('thinking');
    // If this is the first input after greeting, or user says hello, always greet and show suggestions
    const isGreeting = /\bhello\b|\bhi\b|\bhey\b|\bgreetings\b/i.test(text.trim());
    if (!greeted || isGreeting) {
      setGreeted(true);
      setShowSuggestions(true);
      if (universe === 'fantasy') setSuggestedActions(['Look around', 'Talk to a villager', 'Check inventory']);
      else if (universe === 'sci-fi') setSuggestedActions(['Scan the area', 'Check the console', 'Open the airlock']);
      else setSuggestedActions(['Inspect the room', 'Call out', 'Check your pockets']);
    }
    const prompt = createPrompt(text);
    const res = await callLocalLLM(prompt, text, audioBlob);
    setGMMessages((msgs) => [...msgs.slice(0, -1), res.narration]);
    setWorld((w) => ({ ...w, ...res.update }));
    setAgentState('speaking');
    // Play TTS audio from backend if present, else use browser TTS
    if (res.audio_base64) {
      const audio = new Audio('data:audio/mp3;base64,' + res.audio_base64);
      audio.onended = () => setAgentState('ready');
      audio.play();
    } else {
      speakText(res.narration);
      setTimeout(() => setAgentState('ready'), 2000);
    }
    setHistory((h) => [...h, { role: 'gm', text: res.narration }]);
    // Always show suggestions after agent response
    setShowSuggestions(true);
    if (universe === 'fantasy') setSuggestedActions(['Look around', 'Talk to a villager', 'Check inventory']);
    else if (universe === 'sci-fi') setSuggestedActions(['Scan the area', 'Check the console', 'Open the airlock']);
    else setSuggestedActions(['Inspect the room', 'Call out', 'Check your pockets']);
    if (exchangeCount + 1 >= 15) {
      setGMMessages((msgs) => [...msgs, 'Session complete. Thanks for playing!']);
      speakText('Session complete. Thanks for playing!');
      setInputDisabled(true);
    }
  };

  const handleStart = () => {
    setWorld(defaultWorldWithUser(universe, selectedUser));
    setHistory([]);
    setExchangeCount(0);
    setGMMessages([]);
    setPlayerMessages([]);
    setInputDisabled(false);
    setStatePanelVisible(false);
    setGreeted(false);
    setShowSuggestions(true);
    if (universe === 'fantasy') setSuggestedActions(['Look around', 'Talk to a villager', 'Check inventory']);
    else if (universe === 'sci-fi') setSuggestedActions(['Scan the area', 'Check the console', 'Open the airlock']);
    else setSuggestedActions(['Inspect the room', 'Call out', 'Check your pockets']);
    setPendingGreeting(true);
  };

  React.useEffect(() => {
    if (pendingGreeting) {
      const greeting = `Hello ${selectedUser}! Welcome to the ${universe} adventure. Get ready for your quest! What would you like to do first?`;
      setGMMessages([greeting]);
      speakText(greeting);
      setPendingGreeting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingGreeting, selectedUser, universe]);

  return (
    <div className="game-master-modern">
      <header className="gm-header-modern">
        <div className="gm-title-modern">
          <span className="gm-art-modern">{universeArt[universe as keyof typeof universeArt]}</span>
          <span>Voice Game Master</span>
        </div>
        <div className="gm-universe-select-modern">
          <label htmlFor="universe">Universe:</label>
          <select
            id="universe"
            value={universe}
            onChange={(e) => setUniverse(e.target.value)}
            disabled={exchangeCount > 0}
          >
            <option value="fantasy">Fantasy</option>
            <option value="sci-fi">Sci-Fi</option>
            <option value="mystery">Mystery</option>
          </select>
        </div>
        <div className="gm-user-select-modern">
          <label htmlFor="user">User:</label>
          <select
            id="user"
            value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}
            disabled={exchangeCount > 0}
          >
            {userOptions.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </header>
      <main className="gm-main-modern">
        {showSuggestions && suggestedActions.length > 0 && (
          <section className="gm-suggested-actions" style={{ textAlign: 'center', margin: '1rem 0' }}>
            <div style={{ marginBottom: 8 }}>Try one of these actions:</div>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
              {suggestedActions.map((action, idx) => (
                <button
                  key={idx}
                  style={{ margin: 4, cursor: inputDisabled ? 'not-allowed' : 'pointer', minWidth: 120 }}
                  onClick={() => onPlayerInput(action)}
                  disabled={inputDisabled}
                >
                  {action}
                </button>
              ))}
            </div>
          </section>
        )}
        <section className="gm-chat-scrollable-modern">
          {gmMessages.map((msg, i) => (
            <div key={i} className="gm ff-bubble gm-bubble-modern">
              <span className="gm-label-modern">GM:</span> {msg}
            </div>
          ))}
          {playerMessages.map((msg, i) => (
            <div key={i} className="player ff-bubble ff-bubble-player player-bubble-modern">
              <span className="player-label-modern">{selectedUser}:</span> {msg}
            </div>
          ))}
        </section>
        <section className="gm-audio-input-row">
          <button
            className={`gm-audio-btn${liveSession ? ' recording' : ''}`}
            onClick={liveSession ? stopLiveSession : startLiveSession}
            disabled={inputDisabled}
          >
            {liveSession ? '🛑 Stop Live Session' : '🎤 Start Live Voice'}
          </button>
          <span className="gm-transcript">{transcript}</span>
          <div style={{ display: 'inline-block', marginLeft: 8, verticalAlign: 'middle' }}>
            <div style={{ width: 40, height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(1, micLevel * 4) * 100}%`, height: '100%', background: micLevel > 0.045 ? '#22c55e' : '#888', transition: 'width 0.1s' }} />
            </div>
          </div>
          <button
            className="gm-fallback-text-btn"
            onClick={() => {
              const val = prompt('Type your action:');
              if (val) onPlayerInput(val);
            }}
            disabled={inputDisabled}
          >
            Use Text
          </button>
        </section>
        {statePanelVisible && (
          <section className="character-sheet-modern">
            <h3>Character Sheet</h3>
            <div><b>Name:</b> {world.players?.[0]?.name || 'Player1'}</div>
            <div><b>HP:</b> {world.players?.[0]?.hp ?? 'N/A'}</div>
            <div><b>Location:</b> {world.location}</div>
            <div><b>Turn:</b> {world.turn}</div>
          </section>
        )}
      </main>
      <div className="gm-controls-modern">
        <button className="gm-btn-modern" onClick={handleStart} disabled={exchangeCount === 0 && gmMessages.length > 0}>
          Start Adventure
        </button>
        <button
          className="gm-btn-modern gm-btn-restart-modern"
          onClick={() => {
            setGMMessages([]);
            setPlayerMessages([]);
            setStatePanelVisible(false);
            setInputDisabled(true);
            setExchangeCount(0);
          }}
        >
          Restart Adventure
        </button>
        <button className="gm-btn-modern gm-btn-state-modern" onClick={() => setStatePanelVisible((v) => !v)}>
          {statePanelVisible ? 'Hide Character Sheet' : 'Show Character Sheet'}
        </button>
      </div>
      {exchangeCount >= 15 && (
        <div className="gm-session-complete-modern">Session complete. Thanks for playing!</div>
      )}
    </div>
  );
}

export default GameMaster;
