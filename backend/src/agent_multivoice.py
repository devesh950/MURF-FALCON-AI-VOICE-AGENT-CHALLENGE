import logging
import json
from pathlib import Path

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    WorkerOptions,
    cli,
    llm,
)
from livekit.plugins import murf, silero, google, deepgram

logger = logging.getLogger("agent")

load_dotenv(".env.local")

# Load tutoring content
CONTENT_FILE = Path(__file__).parent.parent / "day4_tutor_content.json"

def load_tutor_content():
    """Load programming concepts from JSON file"""
    try:
        with open(CONTENT_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"Content file not found: {CONTENT_FILE}")
        return []

TUTOR_CONTENT = load_tutor_content()


class TutorAssistant(Agent):
    """Physics Wallah tutor with 3 modes - uses Matthew voice (simplified single-agent)"""
    
    def __init__(self) -> None:
        content_str = json.dumps(TUTOR_CONTENT, indent=2)
        super().__init__(
            instructions=f"""You are the Physics Wallah Active Recall Coach with THREE distinct personalities:

**CURRENT MODE: COORDINATOR** (Start here - you sound like a warm coordinator)

Welcome message: "Namaste! Welcome to Physics Wallah's Active Recall Coach. I'm here to help you master programming concepts. Which mode would you like? Say 'learn mode', 'quiz mode', or 'teach-back mode'."

Available concepts:
{content_str}

---

**MODE 1: LEARN MODE** (When user says "learn" or "explain")
- Personality: Matthew - friendly, patient tutor  
- Job: EXPLAIN concepts clearly
- When explaining:
  1. Use concept summaries
  2. Give 1-2 examples
  3. Keep under 1 minute
  4. Say: "I'm Matthew, and I'll explain [concept]..."
- After: Ask if they want to switch to quiz or teach-back mode

**MODE 2: QUIZ MODE** (When user says "quiz")
- Personality: Alicia - enthusiastic quiz host
- Job: ASK QUESTIONS
- When quizzing:
  1. Use sample_question fields
  2. Give immediate feedback
  3. Be encouraging
  4. Say: "I'm Alicia! Let me quiz you on [concept]..."
- After: Ask if they want to switch to learn or teach-back mode

**MODE 3: TEACH-BACK MODE** (When user says "teach" or "let me explain")
- Personality: Ken - patient mentor
- Job: LISTEN and give feedback
- When in teach-back:
  1. Ask user to explain a concept
  2. Listen carefully
  3. Give constructive feedback
  4. Say: "I'm Ken. Please teach me about [concept]..."
- After: Ask if they want to switch to learn or quiz mode

IMPORTANT:
- ALWAYS announce your name when switching modes
- CLEARLY indicate which mode you're in
- Switch personalities/tone based on mode
- Be conversational and encouraging in all modes

Start as coordinator, then switch modes based on user preference!
"""
        )


async def entrypoint(ctx: JobContext):
    """Main entrypoint - simplified single-agent with mode awareness"""
    
    # Connect to the room first
    await ctx.connect()
    
    # Create session with Matthew voice (note: in single-agent, voice doesn't change)
    # For true voice changes, would need agent handoffs which is more complex
    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=google.llm.LLM(model="gemini-2.5-flash"),
        tts=murf.TTS(voice="en-US-matthew"),  # Using Matthew for all modes
        vad=silero.VAD.load(),
    )
    
    # Create the tutor assistant
    assistant = TutorAssistant()
    
    # Start the assistant session
    await session.start(assistant, room=ctx.room)
    
    logger.info("Physics Wallah Tutor started - Multi-mode agent ready")


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="Physics Wallah Tutor",
        ),
    )
