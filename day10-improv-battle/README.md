# Improv Battle - Voice-First Game Show

A voice-first improv game show built with LiveKit Agents for Day 10 of the Murf AI Voice Agent Challenge.

## Features

- Single-player improv battle with AI host
- 3 rounds of improv scenarios
- Realistic host reactions (varied feedback)
- Voice-powered interaction
- Built with LiveKit and Murf Falcon TTS

## Setup

### Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -e .
```

4. Configure `.env.local` with your API keys:
   - DEEPGRAM_API_KEY
   - MURF_API_KEY
   - OPENAI_API_KEY
   - LiveKit server credentials

5. Start the agent:
```bash
python src/agent.py dev
```

### Frontend

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure `.env.local` with LiveKit URL

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

## How to Play

1. Enter your name
2. Click "Start Improv Battle"
3. Listen to the host's scenario
4. Improvise in character
5. Listen to the host's reaction
6. Continue for 3 rounds
7. Get your final summary!

## Technologies

- **LiveKit Agents** - Voice agent framework
- **Murf Falcon** - Ultra-fast TTS
- **Deepgram** - Speech-to-text
- **Next.js** - Frontend framework
- **React** - UI library
