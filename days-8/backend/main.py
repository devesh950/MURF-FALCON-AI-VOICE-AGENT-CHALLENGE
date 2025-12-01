
from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv
import google.generativeai as genai
import json
import requests
import base64
import io
from fastapi import HTTPException





load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
LIVEKIT_URL = os.getenv("LIVEKIT_URL")
if not GOOGLE_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY not set in .env")
if not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
    raise RuntimeError("LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set in .env")
genai.configure(api_key=GOOGLE_API_KEY)

# Print available Gemini models and their supported methods
print("\nAvailable Gemini models and supported methods:")
for m in genai.list_models():
    print(f"- {m.name}: {getattr(m, 'supported_generation_methods', [])}")
from fastapi import Body

# --- LiveKit Token Endpoint ---


MODEL_NAME = "models/gemini-flash-lite-latest"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatTurn(BaseModel):
    role: str
    text: str

class GMRequest(BaseModel):
    history: List[ChatTurn]
    world: Dict[str, Any]
    universe: str
    player_input: str


class GMResponse(BaseModel):
    narration: str
    update: Dict[str, Any]
    audio_base64: str = None



# --- Murf Falcon TTS API helper ---
def murf_tts(text, api_key, voice="en-US-matthew", model="falcon"):
    url = "https://api.murf.ai/v1/speech/generate"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "voice": voice,
        "model": model,
        "text": text,
        "format": "mp3"
    }
    resp = requests.post(url, headers=headers, json=payload)
    if resp.status_code == 200:
        audio_url = resp.json().get("audioUrl")
        if audio_url:
            audio_resp = requests.get(audio_url)
            if audio_resp.status_code == 200:
                return base64.b64encode(audio_resp.content).decode("utf-8")
    return None


@app.post("/api/gm", response_model=GMResponse)
async def gm_endpoint(
    request: Request,
    audio: UploadFile = File(None),
    history: str = Form(None),
    world: str = Form(None),
    universe: str = Form(None),
    player_input: str = Form(None),
):
    # If audio is sent, use Deepgram STT
    if audio is not None:
        deepgram_api_key = os.getenv("DEEPGRAM_API_KEY")
        audio_bytes = await audio.read()
        deepgram_url = "https://api.deepgram.com/v1/listen"
        headers = {"Authorization": f"Token {deepgram_api_key}"}
        dg_resp = requests.post(deepgram_url, headers=headers, data=audio_bytes, params={"punctuate": True, "language": "en"})
        if dg_resp.status_code == 200:
            player_input = dg_resp.json().get("results", {}).get("channels", [{}])[0].get("alternatives", [{}])[0].get("transcript", "")
        else:
            player_input = "[STT error]"
        # Parse other fields
        history = history and json.loads(history) or []
        world = world and json.loads(world) or {}
    else:
        # JSON body
        req = await request.json()
        history = req.get("history", [])
        world = req.get("world", {})
        universe = req.get("universe", "fantasy")
        player_input = req.get("player_input", "")

    # Compose prompt for Gemini
    history_text = "\n".join([
        f"{turn['role'].capitalize()}: {turn['text']}" for turn in history[-8:]
    ])
    prompt = (
        f"You are a creative, helpful Game Master for a {universe} scenario. "
        f"Maintain a consistent world state: {world}.\n"
        f"Here is the recent conversation:\n{history_text}\n"
        f"Player just said: '{player_input}'.\n"
        f"Respond with a short, vivid narration (1-3 sentences) that guides the player, then end with a question or suggestion for what to do next."
    )
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        narration = response.text.strip()
    except Exception as e:
        narration = f"[Gemini error] {e}"

    # Murf Falcon TTS
    murf_api_key = os.getenv("MURF_API_KEY")
    audio_base64 = None
    if murf_api_key:
        audio_base64 = murf_tts(narration, murf_api_key)

    turn = world.get('turn', 1) + 1
    update = dict(world)
    update['turn'] = turn
    return GMResponse(narration=narration, update=update, audio_base64=audio_base64 or "")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8008, reload=True)
