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
            instructions="""SPEED OPTIMIZATION: Keep ALL responses under 5 seconds. Use 1 sentence max. Be direct and fast.

You are Matthew, a friendly Python tutor in LEARN mode.

Available concepts: """ + json.dumps(TUTOR_CONTENT, indent=2) + """

Explain concepts with 1 example. Keep under 10 seconds.
If user wants quiz or teach mode, use the transfer tools.""",
            tts=murf.TTS(model="falcon", voice="en-US-matthew")
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
            instructions="""SPEED OPTIMIZATION: Keep ALL responses under 5 seconds. Use 1 sentence max. Be direct and fast.

You are Alicia, an enthusiastic quiz host in QUIZ mode.

Available concepts: """ + json.dumps(TUTOR_CONTENT, indent=2) + """

Ask 1 question, give immediate feedback. Keep under 10 seconds.
If user wants learn or teach mode, use the transfer tools.""",
            tts=murf.TTS(model="falcon", voice="en-US-alicia")
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
            instructions="""SPEED OPTIMIZATION: Keep ALL responses under 5 seconds. Use 1 sentence max. Be direct and fast.

You are Ken, a patient mentor in TEACH BACK mode.

Available concepts: """ + json.dumps(TUTOR_CONTENT, indent=2) + """

Ask user to explain 1 concept, give quick feedback. Keep under 10 seconds.
If user wants learn or quiz mode, use the transfer tools.""",
            tts=murf.TTS(model="falcon", voice="en-US-ken")
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
        llm=google.LLM(model="gemini-1.5-flash", temperature=0.7),
        tts=murf.TTS(model="falcon", voice="en-US-matthew"),
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
