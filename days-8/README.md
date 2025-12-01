# Day 8 — Voice Game Master (D&D-Style Adventure)

This folder contains a self-contained browser-based Voice Game Master prototype that satisfies the Day 8 primary goal:

- GM persona + system prompt presets
- Voice-driven interactive story (Web Speech API for STT + TTS)
- Continuity via chat history
- Simple UI that shows GM messages and transcribed player speech
- Restart/reset and a JSON state inspector

No backend is required for this prototype—open `frontend/index.html` in a modern browser (Chrome/Edge recommended) to run locally.

Quick start (Windows):

1. Open `c:\Users\deves\OneDrive\Desktop\murf test\ten-days-of-voice-agents-2025\days-8\frontend\index.html` in Chrome or Edge (double-click or use `Ctrl+O`).
2. Allow microphone access when prompted.
3. Press **Start Game**, then press **Speak** and talk to the Game Master.

Next steps (I can do on request):
- Hook this frontend to a backend LLM (OpenAI/Murf) for richer responses.
- Add JSON world-state persistence (save/load).
- Add dice-roll mechanics and a character sheet UI.

If you want me to add LLM/backend integration or LiveKit-based voice channels, tell me which provider/credentials to use and I will scaffold the backend.
