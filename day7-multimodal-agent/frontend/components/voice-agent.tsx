"use client";

import { useEffect, useState, useRef } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  BarVisualizer,
  DisconnectButton,
  useConnectionState,
} from "@livekit/components-react";
import { Microphone, MicrophoneSlash, Waveform, ShoppingCart } from "@phosphor-icons/react";
import { ConnectionState } from "livekit-client";
import { CartDisplay } from "./cart-display";

interface VoiceAgentProps {
  onCartUpdate?: (count: number) => void;
}

export function VoiceAgent({ onCartUpdate }: VoiceAgentProps) {
  const [connectionDetails, setConnectionDetails] = useState<{
    serverUrl: string;
    roomName: string;
    participantToken: string;
    participantName: string;
  } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch("/api/connection-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_config: { agents: [{ agent_name: "QuickMart Grocery Agent" }] } }),
      });
      // Defensive parsing: some responses could be empty or truncated.
      const text = await response.text();
      if (!response.ok) {
        // include body text for easier debugging
        throw new Error(`Server returned ${response.status}: ${text || "<empty>"}`);
      }

      let data = null as any;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (err) {
        console.error("Failed to parse JSON from /api/connection-details:", err, text);
        throw new Error("Invalid JSON response from server");
      }

      if (!data) {
        throw new Error("Empty response from /api/connection-details");
      }

      setConnectionDetails(data);
    } catch (error) {
      console.error("Failed to get connection details:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!connectionDetails) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Microphone size={48} weight="duotone" className="text-primary animate-pulse-slow" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Order?</h2>
          <p className="text-gray-600 mb-8">
            Click below to start your voice shopping experience. Our AI assistant will help you
            find everything you need!
          </p>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto border-4 border-orange-700 hover:scale-110 transform"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Microphone size={28} weight="fill" />
                <span>Start Voice Chat</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={connectionDetails.serverUrl}
      token={connectionDetails.participantToken}
      connect={true}
      audio={true}
      video={false}
      connectOptions={{
        autoSubscribe: true,
      }}
      onConnected={() => {
        console.log("Room connected successfully");
      }}
      className="grid md:grid-cols-2 gap-6"
    >
      <AgentInterface onCartUpdate={onCartUpdate} />
      <CartDisplay />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function AgentInterface({ onCartUpdate }: VoiceAgentProps) {
  const { state, audioTrack } = useVoiceAssistant();
  const connectionState = useConnectionState();
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string }>>([]);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [lastState, setLastState] = useState<string>("");

  // Track state changes for debugging
  useEffect(() => {
    if (state !== lastState) {
      console.log("Agent state changed:", state);
      setLastState(state);
    }
  }, [state, lastState]);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const isConnected = connectionState === ConnectionState.Connected;
  const isAgentSpeaking = state === "speaking";
  const isListening = state === "listening";

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Microphone size={28} weight="bold" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Voice Assistant</h3>
              <p className="text-sm text-white/80">
                {isConnected ? "Ready to help!" : "Connecting..."}
              </p>
            </div>
          </div>
          <DisconnectButton className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl border-2 border-red-700 hover:scale-105 transform">
            Disconnect
          </DisconnectButton>
        </div>

        {/* Status Indicator with Visual States */}
        <div className="flex items-center gap-3">
          {isAgentSpeaking && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2 rounded-full shadow-lg animate-pulse">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span className="text-sm font-bold text-white">🗣️ Speaking</span>
            </div>
          )}
          {isListening && !isAgentSpeaking && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-full shadow-lg">
              <div className="relative w-4 h-4">
                <div className="absolute inset-0 bg-white rounded-full animate-ping" />
                <div className="relative w-4 h-4 bg-white rounded-full" />
              </div>
              <span className="text-sm font-bold text-white">👂 Listening...</span>
            </div>
          )}
          {state === "thinking" && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 rounded-full shadow-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span className="text-sm font-bold text-white">🤔 Thinking...</span>
            </div>
          )}
          {!isAgentSpeaking && !isListening && state !== "thinking" && isConnected && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 px-4 py-2 rounded-full shadow-lg">
              <div className="w-3 h-3 rounded-full bg-white" />
              <span className="text-sm font-bold text-white">✓ Ready</span>
            </div>
          )}
          {!isConnected && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 rounded-full shadow-lg">
              <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
              <span className="text-sm font-bold text-white">Connecting...</span>
            </div>
          )}
        </div>
      </div>

      {/* Audio Visualizer */}
      {audioTrack && (
        <div className="bg-gradient-to-r from-orange-100 via-yellow-100 to-orange-100 border-y-2 border-orange-300 p-6">
          <BarVisualizer
            state={state}
            trackRef={audioTrack}
            barCount={30}
            options={{
              barColor: "#FC8019",
              barSpacing: 4,
              barWidth: 8,
              borderRadius: 4,
            }}
            className="h-24"
          />
        </div>
      )}

      {/* Transcript Area */}
      <div
        ref={transcriptRef}
        className="p-6 h-96 overflow-y-auto bg-gradient-to-br from-gray-50 to-orange-50 space-y-4"
      >
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-primary p-4 rounded-r-lg shadow-md">
          <p className="text-sm text-gray-900 font-medium">
            <strong className="text-primary text-base">🤖 Assistant:</strong> Welcome to QuickMart Express! 
            I'm your voice shopping assistant. You can say things like "I need bread", 
            "Add 2 liters of milk", or "I need pasta ingredients". How can I help you today?
          </p>
        </div>

        {transcript.length === 0 && (
          <div className="text-center py-12">
            <div className="relative inline-block mb-4">
              <Waveform size={64} weight="duotone" className="text-orange-400 animate-pulse" />
              {isListening && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <p className="text-gray-600 font-semibold text-lg">
              {isListening ? "I'm listening... speak now!" : "Start speaking to see the conversation here..."}
            </p>
            {isAgentSpeaking && (
              <p className="text-purple-600 font-bold text-base mt-2 animate-pulse">Agent is speaking...</p>
            )}
          </div>
        )}

        {/* Transcript messages will be added here dynamically */}
        {transcript.map((msg, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg shadow-md ${
              msg.role === "assistant"
                ? "bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-500"
                : "bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500"
            }`}
          >
            <p className="text-sm text-gray-900 font-medium">
              <strong className={msg.role === "assistant" ? "text-orange-600" : "text-blue-600"}>
                {msg.role === "assistant" ? "🤖 Assistant" : "👤 You"}:
              </strong>{" "}
              {msg.text}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-t-2 border-orange-200">
        <p className="text-base text-gray-900 font-bold mb-3">💬 Quick commands you can try:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Show my cart",
            "I need bread",
            "Pasta ingredients",
            "Place order",
            "Order status",
          ].map((command, idx) => (
            <button
              key={idx}
              className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-xl hover:scale-105 transform"
            >
              "{command}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
