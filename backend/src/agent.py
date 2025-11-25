import logging
import json
from pathlib import Path
from typing import Annotated
from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    WorkerOptions,
    cli,
    llm,
    function_tool,
)
from livekit.plugins import murf, silero, google, deepgram

logger = logging.getLogger("agent")
load_dotenv(".env.local")

# Load tutor content
CONTENT_FILE = Path(__file__).parent.parent / "day4_tutor_content.json"

def load_tutor_content():
    try:
        with open(CONTENT_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"Content file not found: {CONTENT_FILE}")
        return []

TUTOR_CONTENT = load_tutor_content()


# LEARN MODE AGENT - Matthew voice
class LearnAgent(Agent):
    def __init__(self) -> None:
        content_str = json.dumps(TUTOR_CONTENT, indent=2)
        super().__init__(
            instructions=f"""You are Matthew, a friendly Python tutor in LEARN mode.

Available concepts: {content_str}

Explain concepts clearly with examples. Keep explanations under 1 minute.
If user wants quiz or teach mode, use the transfer tools.""",
            tts=murf.TTS(voice="en-US-matthew")
        )
    
    @function_tool()
    async def transfer_to_quiz(self):
        """Transfer to quiz mode when user wants to be quizzed"""
        return QuizAgent()
    
    @function_tool()
    async def transfer_to_teach(self):
        """Transfer to teach back mode when user wants to explain concepts"""
        return TeachBackAgent()


# QUIZ MODE AGENT - Alicia voice  
class QuizAgent(Agent):
    def __init__(self) -> None:
        content_str = json.dumps(TUTOR_CONTENT, indent=2)
        super().__init__(
            instructions=f"""You are Alicia, an enthusiastic quiz host in QUIZ mode.

Available concepts: {content_str}

Ask questions and give immediate feedback. Keep it fun and encouraging!
If user wants learn or teach mode, use the transfer tools.""",
            tts=murf.TTS(voice="en-US-alicia")
        )
    
    @function_tool()
    async def transfer_to_learn(self):
        """Transfer to learn mode when user wants explanations"""
        return LearnAgent()
    
    @function_tool()
    async def transfer_to_teach(self):
        """Transfer to teach back mode when user wants to explain concepts"""
        return TeachBackAgent()


# TEACH BACK MODE AGENT - Ken voice
class TeachBackAgent(Agent):
    def __init__(self) -> None:
        content_str = json.dumps(TUTOR_CONTENT, indent=2)
        super().__init__(
            instructions=f"""You are Ken, a patient mentor in TEACH BACK mode.

Available concepts: {content_str}

Ask user to explain concepts and give constructive feedback.
If user wants learn or quiz mode, use the transfer tools.""",
            tts=murf.TTS(voice="en-US-ken")
        )
    
    @function_tool()
    async def transfer_to_learn(self):
        """Transfer to learn mode when user wants explanations"""
        return LearnAgent()
    
    @function_tool()
    async def transfer_to_quiz(self):
        """Transfer to quiz mode when user wants to be quizzed"""
        return QuizAgent()


async def entrypoint(ctx: JobContext):
    await ctx.connect()
    
    # Start with Learn mode - Matthew voice
    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=google.llm.LLM(model="gemini-2.5-flash"),
        tts=murf.TTS(voice="en-US-matthew"),
        vad=silero.VAD.load(),
    )
    
    await session.start(LearnAgent(), room=ctx.room)


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="Physics Wallah Tutor",
        ),
    )
