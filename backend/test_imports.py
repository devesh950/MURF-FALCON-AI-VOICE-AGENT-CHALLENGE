#!/usr/bin/env python3
try:
    from livekit.plugins import google
    print("✅ Google TTS import successful")
    tts = google.TTS(voice="en-US-Neural2-D", language="en-US")
    print("✅ Google TTS initialized successfully")
except Exception as e:
    print(f"❌ Error: {e}")

try:
    from livekit.plugins import deepgram
    print("✅ Deepgram STT import successful")
    stt = deepgram.STT(model="nova-3")
    print("✅ Deepgram STT initialized successfully")
except Exception as e:
    print(f"❌ Deepgram Error: {e}")

try:
    from livekit.plugins import silero
    print("✅ Silero VAD import successful")
    vad = silero.VAD.load()
    print("✅ Silero VAD initialized successfully")
except Exception as e:
    print(f"❌ Silero Error: {e}")