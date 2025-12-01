from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from src import agent

load_dotenv()

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/voice")
async def voice_endpoint(
    audio: UploadFile = File(...),
    session_id: str = Form(...),
    user_message: str = Form(None)
):
    # This is a placeholder for integrating your agent logic
    # You should process the audio, run STT, LLM, TTS, and return the response
    # For now, just return a dummy response
    return JSONResponse({
        "text": "Voice agent response (replace with real logic)",
        "audio_url": None
    })

@app.get("/")
def root():
    return {"message": "Voice Agent Backend Running"}
