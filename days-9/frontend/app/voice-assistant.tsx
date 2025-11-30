
"use client";
import React, { useRef, useState, useEffect } from 'react';

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [continuous, setContinuous] = useState(true); // Always-on mode
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const recognitionRef = useRef<any>(null);

  // Start/stop browser speech recognition
  // Start listening (used for both button and auto-restart)
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    if (!recognitionRef.current) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.lang = 'en-US';
      recog.interimResults = false;
      recog.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setResponse('');
        // Only speak after user input and backend response
        try {
          const form = new FormData();
          form.append('text', text);
          form.append('stt_provider', 'deepgram');
          form.append('tts_provider', 'murf');
          const res = await fetch('http://localhost:8001/voice', {
            method: 'POST',
            body: form,
          });
          const data = await res.json();
          setResponse(data.response);
          // Only speak if transcript is not empty (i.e., user actually spoke)
          if (text && (data.audio || data.response)) {
            if (data.audio) {
              playAudio(data.audio);
            } else {
              speak(data.response);
            }
          }
        } catch (e) {
          setResponse('Sorry, there was a problem connecting to the voice agent.');
        }
      };
      recog.onend = () => {
        setListening(false);
        // If continuous mode, auto-restart listening after a short delay
        if (continuous) {
          setTimeout(() => {
            setListening(true);
            recog.start();
          }, 600); // 600ms pause between turns
        }
      };
      recognitionRef.current = recog;
    }
    setListening(true);
    setTranscript('');
    setResponse('');
    recognitionRef.current.start();
  };

  // Button handler (for manual start)
  const handleListen = () => {
    startListening();
  };

  // Auto-start listening on mount if continuous mode
  useEffect(() => {
    if (continuous) {
      startListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continuous]);

  // Play base64 audio from backend
  const playAudio = (b64: string) => {
    const audio = new Audio('data:audio/mp3;base64,' + b64);
    audio.play();
  };

  // Use browser speech synthesis for output (fallback)
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <section style={{ marginTop: 32, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(60,60,100,0.08)', padding: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: '#3f51b5' }}>Voice Assistant</h2>
      <div style={{ marginBottom: 16, color: '#444', fontSize: 15 }}>
        Shop hands-free! Ask for products, place orders, or check your last order.
      </div>
      <button
        onClick={() => setContinuous((c) => !c)}
        style={{
          background: continuous ? '#3f51b5' : '#b0b3c6',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          padding: '10px 22px',
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 16,
          marginRight: 12,
          boxShadow: '0 1px 4px rgba(60,60,100,0.08)',
        }}
      >
        {continuous ? '🟢 Always Listening (Click to Pause)' : '🔴 Click to Enable Always Listening'}
      </button>
      {!continuous && (
        <button
          onClick={handleListen}
          disabled={listening}
          style={{
            background: listening ? '#b0b3c6' : 'linear-gradient(90deg, #3f51b5 0%, #2196f3 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '12px 28px',
            fontSize: 18,
            fontWeight: 600,
            cursor: listening ? 'not-allowed' : 'pointer',
            marginBottom: 16,
            boxShadow: '0 1px 4px rgba(60,60,100,0.08)',
          }}
        >
          {listening ? 'Listening...' : '🎤 Speak to Shop'}
        </button>
      )}
      {transcript && (
        <div style={{ marginTop: 10, color: '#222', fontSize: 16 }}><b>You:</b> {transcript}</div>
      )}
      {response && (
        <div style={{ marginTop: 10, color: '#3f51b5', fontSize: 16 }}><b>Assistant:</b> {response}</div>
      )}
    </section>
  );
}
