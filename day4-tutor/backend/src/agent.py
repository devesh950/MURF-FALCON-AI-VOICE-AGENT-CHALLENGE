import json
import logging
import os
from pathlib import Path
from typing import Annotated

from livekit.agents import Agent, WorkerOptions, cli, llm
from livekit.agents.multimodal import MultimodalAgent
from livekit.plugins import deepgram, google, murf, silero

logger = logging.getLogger("tutor-agent")
logger.setLevel(logging.INFO)

# Load tutor content from JSON file
CONTENT_FILE = Path(__file__).parent.parent.parent / "shared-data" / "day4_tutor_content.json"

def load_tutor_content():
    """Load the tutor content from JSON file."""
    try:
        with open(CONTENT_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load tutor content: {e}")
        return []

TUTOR_CONTENT = load_tutor_content()


# LEARN MODE AGENT - Matthew voice
class LearnAgent(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=f"""You are a friendly Python programming tutor named Matthew in LEARN mode.

Your job is to EXPLAIN programming concepts clearly and simply.

Available concepts to teach:
{json.dumps([{"id": c["id"], "title": c["title"]} for c in TUTOR_CONTENT], indent=2)}

When the user asks to learn a concept:
1. Check if it's in the available concepts
2. Explain it clearly using the concept summary
3. Give 1-2 practical examples
4. Keep explanations under 1 minute
5. Ask if they want to learn another concept or switch to quiz/teach mode

If user wants to switch modes, tell them to say "switch to quiz mode" or "switch to teach mode".

Be encouraging and patient. Make learning fun!
"""
        )


# QUIZ MODE AGENT - Alicia voice
class QuizAgent(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=f"""You are an enthusiastic quiz host named Alicia in QUIZ mode.

Your job is to ASK QUESTIONS about programming concepts.

Available concepts to quiz:
{json.dumps([{"id": c["id"], "title": c["title"]} for c in TUTOR_CONTENT], indent=2)}

When quizzing:
1. Ask one question at a time from the sample_question field
2. Wait for the user's answer
3. Give immediate feedback - correct or incorrect
4. If incorrect, give a brief hint
5. Keep it interactive and fun

After each answer, ask if they want:
- Another question on the same concept
- A different concept
- To switch to learn or teach mode

Be supportive and encouraging, even when answers are wrong!
"""
        )


# TEACH BACK MODE AGENT - Ken voice
class TeachBackAgent(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=f"""You are a patient mentor named Ken in TEACH BACK mode.

Your job is to ASK THE USER to explain concepts back to you.

Available concepts:
{json.dumps([{"id": c["id"], "title": c["title"]} for c in TUTOR_CONTENT], indent=2)}

When in teach-back mode:
1. Ask the user to explain a specific concept to you
2. Listen carefully to their explanation
3. Give constructive feedback:
   - What they explained well
   - What they missed or could improve
   - One key point to remember
4. Rate their explanation qualitatively (Excellent/Good/Needs Work)

Keep feedback brief (30-45 seconds) and encouraging.

After feedback, ask if they want to:
- Try explaining another concept
- Switch to learn or quiz mode

Teaching others is the best way to learn - encourage and praise their efforts!
"""
        )


# COORDINATOR AGENT - Greets and manages handoffs
class CoordinatorAgent(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""You are a friendly coordinator for the Active Recall Coach learning system.

Your role:
1. GREET the user warmly
2. ASK which learning mode they prefer:
   - LEARN mode - I'll explain concepts (tutor Matthew)
   - QUIZ mode - I'll ask you questions (host Alicia)
   - TEACH mode - You explain concepts to me (mentor Ken)

3. Once they choose, tell them you're connecting them to the right tutor.

Keep your greeting brief and enthusiastic. Make them excited to learn!

Available concepts: Variables, Loops, Functions, Conditionals, Data Types

Ready? Let's start learning!
"""
        )


async def entrypoint(ctx):
    """Main entrypoint that starts with coordinator and enables handoffs."""
    
    async def _will_synthesize_assistant_reply(
        agent: MultimodalAgent, chat_ctx: llm.ChatContext
    ):
        # Add tutor content to context for all agents
        content_str = json.dumps(TUTOR_CONTENT, indent=2)
        chat_ctx.messages.append(
            llm.ChatMessage(
                role="system",
                content=f"Available tutor content:\n{content_str}"
            )
        )
    
    # Create STT (Speech-to-Text)
    stt = deepgram.STT(model="nova-3")
    
    # Create LLM
    google_llm = google.LLM(model="gemini-2.0-flash-exp")
    
    # Create TTS instances with different voices
    tts_matthew = murf.TTS(voice="en-US-matthew")  # Learn mode
    tts_alicia = murf.TTS(voice="en-US-alicia")    # Quiz mode
    tts_ken = murf.TTS(voice="en-US-ken")          # Teach mode
    
    # Create assistant with coordinator agent (default)
    coordinator_assistant = MultimodalAgent(
        model=google_llm,
        tts=tts_matthew,  # Default voice
        instructions=CoordinatorAgent().instructions,
    )
    
    coordinator_assistant.on("agent_speech_committed", _will_synthesize_assistant_reply)
    
    # Start session with coordinator
    session = await ctx.connect()
    await session.start(coordinator_assistant, room=ctx.room)
    
    logger.info("Tutor agent started - Coordinator ready")


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="Active Recall Coach",
        )
    )
