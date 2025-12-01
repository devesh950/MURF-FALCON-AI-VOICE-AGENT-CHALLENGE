"use client";

import { useState, useEffect, useRef } from "react";
import { LiveKitRoom, RoomAudioRenderer, useVoiceAssistant, useRoomContext } from "@livekit/components-react";
import type { TrackReferenceOrPlaceholder } from "@livekit/components-core";

export default function ImprovBattlePage() {
  const [playerName, setPlayerName] = useState("");
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const startGame = async () => {
    if (!playerName.trim()) {
      alert("Please enter your name!");
      return;
    }

    setIsConnecting(true);
    try {
      const response = await fetch("/api/connection-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantName: playerName }),
      });

      if (!response.ok) {
        throw new Error("Failed to get connection details");
      }

      const data = await response.json();
      setConnectionDetails(data);
    } catch (error) {
      console.error("Error connecting:", error);
      alert("Failed to connect. Please try again.");
      setIsConnecting(false);
    }
  };

  if (!connectionDetails) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}>
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "48px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          maxWidth: "500px",
          width: "90%",
        }}>
          <h1 style={{
            fontSize: "48px",
            fontWeight: "800",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "16px",
            textAlign: "center",
          }}>
            🎭 Improv Battle
          </h1>
          <p style={{
            fontSize: "18px",
            color: "#64748b",
            textAlign: "center",
            marginBottom: "32px",
          }}>
            Ready to test your improv skills? Our AI host has 3 wild scenarios for you!
          </p>
          
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#334155",
              marginBottom: "8px",
            }}>
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startGame()}
              placeholder="Enter your name..."
              disabled={isConnecting}
              style={{
                width: "100%",
                padding: "14px 16px",
                fontSize: "16px",
                border: "2px solid #e2e8f0",
                borderRadius: "12px",
                outline: "none",
                transition: "all 0.2s",
              }}
            />
          </div>

          <button
            onClick={startGame}
            disabled={isConnecting}
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "18px",
              fontWeight: "700",
              color: "white",
              background: isConnecting
                ? "#94a3b8"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "12px",
              cursor: isConnecting ? "not-allowed" : "pointer",
              transition: "all 0.3s",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
            }}
          >
            {isConnecting ? "Connecting..." : "🎤 Start Improv Battle"}
          </button>

          <div style={{
            marginTop: "32px",
            padding: "20px",
            background: "#f8fafc",
            borderRadius: "12px",
          }}>
            <h3 style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "#334155",
              marginBottom: "12px",
            }}>
              How it works:
            </h3>
            <ul style={{
              fontSize: "14px",
              color: "#64748b",
              lineHeight: "1.6",
              paddingLeft: "20px",
            }}>
              <li>The host will give you an improv scenario</li>
              <li>You act it out in character</li>
              <li>The host reacts with honest feedback</li>
              <li>Repeat for 3 rounds</li>
              <li>Get your final summary!</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <LiveKitRoom
        serverUrl={connectionDetails.serverUrl}
        token={connectionDetails.participantToken}
        connect={true}
        audio={true}
        video={false}
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "48px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          maxWidth: "600px",
          width: "90%",
        }}
      >
        <GameView playerName={playerName} />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

function GameView({ playerName }: { playerName: string }) {
  const { state } = useVoiceAssistant();
  const room = useRoomContext();
  const [transcripts, setTranscripts] = useState<{ role: string; text: string; time: string }[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!room) return;

    const handleTranscript = (
      segments: { text: string; final: boolean }[],
      participant?: any
    ) => {
      const finalSegments = segments.filter(s => s.final && s.text.trim());
      if (finalSegments.length === 0) return;

      const lastText = finalSegments[finalSegments.length - 1].text;
      const isAgent = participant?.identity?.includes('agent') || !participant;

      setTranscripts(prev => {
        // Avoid duplicates
        if (prev.length > 0 && prev[prev.length - 1].text === lastText) {
          return prev;
        }
        return [...prev, {
          role: isAgent ? "Agent" : "You",
          text: lastText,
          time: new Date().toLocaleTimeString()
        }];
      });
    };

    room.on('transcriptionReceived', handleTranscript);
    return () => {
      room.off('transcriptionReceived', handleTranscript);
    };
  }, [room]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  return (
    <div style={{ textAlign: "center" }}>
      <h1 style={{
        fontSize: "36px",
        fontWeight: "800",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: "16px",
      }}>
        🎭 Improv Battle
      </h1>
      
      <div style={{
        fontSize: "18px",
        color: "#64748b",
        marginBottom: "32px",
      }}>
        Welcome, <strong>{playerName}</strong>!
      </div>

      <div style={{
        padding: "32px",
        background: "#f8fafc",
        borderRadius: "16px",
        marginBottom: "24px",
      }}>
        <div style={{
          width: "80px",
          height: "80px",
          margin: "0 auto 16px",
          borderRadius: "50%",
          background: state === "listening" 
            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            : "#e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "36px",
          animation: state === "listening" ? "pulse 1.5s infinite" : "none",
        }}>
          {state === "listening" ? "🎤" : state === "speaking" ? "🗣️" : "⏸️"}
        </div>
        
        <div style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "#334155",
          textTransform: "capitalize",
        }}>
          {state === "listening" ? "Your turn - go!" : 
           state === "speaking" ? "Host is speaking..." : 
           "Connected"}
        </div>
      </div>

      <div style={{
        fontSize: "14px",
        color: "#94a3b8",
        padding: "16px",
        background: "#f1f5f9",
        borderRadius: "12px",
      }}>
        💡 Tip: Speak clearly and commit to your character!
      </div>

      {/* Transcript Display */}
      {transcripts.length > 0 && (
        <div style={{
          marginTop: "24px",
          padding: "20px",
          background: "#f8fafc",
          borderRadius: "12px",
          maxHeight: "300px",
          overflowY: "auto",
          textAlign: "left",
        }}>
          <h3 style={{
            fontSize: "16px",
            fontWeight: "700",
            color: "#334155",
            marginBottom: "12px",
          }}>
            📝 Conversation Transcript
          </h3>
          {transcripts.map((t, i) => (
            <div
              key={i}
              style={{
                marginBottom: "12px",
                padding: "12px",
                background: t.role === "Agent" ? "#e0e7ff" : "#dbeafe",
                borderRadius: "8px",
                borderLeft: t.role === "Agent" ? "4px solid #667eea" : "4px solid #3b82f6",
              }}
            >
              <div style={{
                fontSize: "12px",
                fontWeight: "700",
                color: t.role === "Agent" ? "#667eea" : "#3b82f6",
                marginBottom: "4px",
              }}>
                {t.role === "Agent" ? "🎭 Host" : "👤 You"} • {t.time}
              </div>
              <div style={{
                fontSize: "14px",
                color: "#334155",
                lineHeight: "1.5",
              }}>
                {t.text}
              </div>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
