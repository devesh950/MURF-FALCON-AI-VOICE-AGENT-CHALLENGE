# FastAPI backend for Day 9 ACP-inspired shopping agent

from fastapi import FastAPI, Request, UploadFile, File, Form
import logging
from fastapi.middleware.cors import CORSMiddleware
from catalog import list_products, create_order, get_last_order
from llm_agent import process_voice_command
import os
from google.cloud import speech, texttospeech
from deepgram import DeepgramClient
from dotenv import load_dotenv
import requests
import base64
import io
from typing import Optional
from pydantic import BaseModel



# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice-backend")
app = FastAPI()

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Set Google credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.join(os.path.dirname(__file__), "google-credentials.json")


# For backward compatibility, keep text-based requests
class VoiceRequest(BaseModel):
    text: str = None



# /voice endpoint: supports Deepgram (if provider=deepgram), else Google APIs

# /voice endpoint: supports Google, Deepgram, Murf Falcon for both input/output
@app.post("/voice")
async def voice_command(
    file: UploadFile = File(None),
    text: str = Form(None),
    stt_provider: str = Form("google"),
    tts_provider: str = Form("google")
):
    logger.info(f"/voice called with text={text} file={file is not None} stt_provider={stt_provider} tts_provider={tts_provider}")
    transcript = text
    # Speech-to-Text
    if file is not None:
        logger.info("Processing audio file upload for STT...")
        audio_bytes = await file.read()
        if stt_provider == "deepgram":
            dg_key = os.getenv("DEEPGRAM_API_KEY")
            if not dg_key:
                return {"error": "Deepgram API key not set."}
            dg_client = DeepgramClient(dg_key)
            response = await dg_client.speech.transcribe_prerecorded(
                {"buffer": io.BytesIO(audio_bytes), "mimetype": file.content_type or "audio/wav"},
                {"model": "general", "language": "en-US", "punctuate": True}
            )
            transcript = response['results']['channels'][0]['alternatives'][0]['transcript']
        elif stt_provider == "murf":
            murf_key = os.getenv("MURF_API_KEY")
            if not murf_key:
                return {"error": "Murf API key not set."}
            # Example Murf Falcon API call (replace with actual endpoint and params)
            response = requests.post(
                "https://api.murf.ai/v1/speech-to-text",
                headers={"Authorization": f"Bearer {murf_key}"},
                files={"file": (file.filename, audio_bytes, file.content_type or "audio/wav")}
            )
            if response.status_code == 200:
                transcript = response.json().get("transcript", "")
            else:
                return {"error": f"Murf Falcon STT failed: {response.text}"}
        else:
            client = speech.SpeechClient()
            audio = speech.RecognitionAudio(content=audio_bytes)
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code="en-US",
            )
            response = client.recognize(config=config, audio=audio)
            transcript = " ".join([result.alternatives[0].transcript for result in response.results])
    if not transcript:
        logger.warning("No transcript received from STT or text input.")
        return {"response": "Sorry, I didn't catch that. Please try again.", "audio": None, "transcript": "", "stt_provider": stt_provider, "tts_provider": tts_provider}
    logger.info(f"Transcript: {transcript}")
    reply = process_voice_command(transcript)
    logger.info(f"Agent reply: {reply}")
    # Always respond with text, even if TTS fails
    return {"response": reply, "audio": None, "transcript": transcript, "stt_provider": stt_provider, "tts_provider": tts_provider}

@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    import traceback
    logger.error(f"Exception in /voice: {exc}\n{traceback.format_exc()}")
    # Always return a fallback response
    return {"response": "Sorry, something went wrong, but you can still shop by text.", "audio": None, "transcript": "", "stt_provider": None, "tts_provider": None}

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/acp/catalog")
def get_catalog(category: Optional[str] = None, color: Optional[str] = None):
    filters = {}
    if category:
        filters["category"] = category
    if color:
        filters["color"] = color
    return list_products(filters if filters else None)

@app.post("/acp/orders")
def post_order(order_req: dict):
    # Expects: {"line_items": [{"product_id": ..., "quantity": ...}, ...]}
    line_items = order_req.get("line_items", [])
    order = create_order(line_items)
    return order

@app.get("/acp/orders/last")
def get_last():
    order = get_last_order()
    if order:
        return order
    return {"error": "No orders found"}

@app.get("/")
def root():
    return {"message": "Day 9 ACP-inspired shopping backend running."}
