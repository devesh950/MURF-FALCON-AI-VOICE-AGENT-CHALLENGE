import json
import logging
import os
import random
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from livekit import rtc

# Load environment variables from .env.local
env_file = Path(__file__).parent.parent / ".env.local"
load_dotenv(env_file)

from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    WorkerOptions,
    cli,
    llm,
)
from livekit.plugins import deepgram, google, murf, silero

logger = logging.getLogger("improv-battle-agent")
logger.setLevel(logging.INFO)


def load_scenarios() -> list[dict[str, Any]]:
    """Load improv scenarios from JSON file."""
    scenarios_file = Path(__file__).parent.parent / "scenarios.json"
    with open(scenarios_file, "r", encoding="utf-8") as f:
        data = json.load(f)
        return data["scenarios"]


# Global scenarios
SCENARIOS = load_scenarios()

# Game state per session
improv_state = {
    "player_name": None,
    "current_round": 0,
    "max_rounds": 3,
    "rounds": [],  # each: {"scenario": str, "host_reaction": str}
    "phase": "intro",  # "intro" | "awaiting_improv" | "reacting" | "done"
    "current_scenario": None,
}


class ImprovBattleAgent(Agent):
    """Improv Battle Game Show Host Agent."""

    def __init__(self):
        instructions = """You are the charismatic and witty host of "Improv Battle", a TV improv game show.

**YOUR PERSONALITY:**
- High-energy, enthusiastic, and engaging
- Witty and quick with reactions
- Realistic in your responses - not always supportive
- Sometimes amused, sometimes unimpressed, sometimes pleasantly surprised
- You can tease and give light critique, but always stay respectful
- Think of yourself as a mix between a game show host and an improv coach

**YOUR ROLE:**
1. Welcome the player warmly to Improv Battle
2. Briefly explain the rules:
   - You'll give them improv scenarios
   - They act them out in character
   - You'll react and comment on their performance
   - Then move to the next scenario
3. Run 3 improv rounds
4. Give a closing summary at the end

**HOW TO RUN EACH ROUND:**
1. Announce the scenario clearly and vividly
2. Tell them to begin improvising
3. Listen to their improv performance
4. When they pause or indicate they're done (or say "end scene"), react immediately
5. Your reaction should be:
   - Specific: mention what they did
   - Varied: sometimes positive, sometimes critical, sometimes mixed
   - Constructive: even criticism should be helpful
   - Brief: keep it under 30 seconds
6. Move to the next round

**REACTION STYLES (mix these up):**
- "That was hilarious! I loved when you..."
- "Okay, that was interesting, but you could have leaned more into..."
- "I'm not sure I followed that logic, but the energy was great!"
- "That felt a bit rushed. Try taking your time to build the character."
- "Wow, you committed fully to that! The part where you... was perfect."
- "That was creative, though I think you lost the thread a bit when..."

**IMPORTANT:**
- Keep your reactions varied - don't be positive every time
- Be honest but never mean or abusive
- Match the energy of a real improv show
- Keep the pace moving - don't drag things out
- After 3 rounds, give a brief summary and close the show

**CURRENT GAME STATE:**
- Phase: {phase}
- Round: {current_round}/{max_rounds}
- Player: {player_name}
- Current Scenario: {current_scenario}

Let's make this fun and engaging!"""

        super().__init__(
            instructions=instructions
        )

    async def on_user_turn_completed(self, session: AgentSession, new_message: llm.ChatMessage):
        """Called after the user finishes speaking."""
        global improv_state
        
        # Get the user's message
        transcript = new_message.content
        
        logger.info(f"User turn completed. Transcript: {transcript}")
        logger.info(f"Current phase: {improv_state['phase']}")
        
        # Handle different phases
        if improv_state["phase"] == "intro":
            # Check if player provided their name
            if improv_state["player_name"] is None:
                # Try to extract name from transcript
                # For now, just use "Player" if not provided
                improv_state["player_name"] = "Player"
            
            # Move to first scenario
            improv_state["phase"] = "awaiting_improv"
            improv_state["current_round"] = 1
            
            # Pick a random scenario
            scenario = random.choice(SCENARIOS)
            improv_state["current_scenario"] = scenario["description"]
            
            # Agent will announce the scenario
            
        elif improv_state["phase"] == "awaiting_improv":
            # Player just performed their improv
            # Move to reacting phase
            improv_state["phase"] = "reacting"
            
            # Store the round
            improv_state["rounds"].append({
                "scenario": improv_state["current_scenario"],
                "performance": transcript,
            })
            
            # After reaction, agent will either move to next round or end
            
        elif improv_state["phase"] == "reacting":
            # Host just gave reaction, move to next round or end
            if improv_state["current_round"] < improv_state["max_rounds"]:
                # Next round
                improv_state["current_round"] += 1
                improv_state["phase"] = "awaiting_improv"
                
                # Pick new scenario
                scenario = random.choice(SCENARIOS)
                improv_state["current_scenario"] = scenario["description"]
            else:
                # Game over
                improv_state["phase"] = "done"


async def entrypoint(ctx: JobContext):
    """Main entry point for the agent."""
    logger.info(f"Starting Improv Battle agent for room: {ctx.room.name}")
    
    # Reset game state for new session
    global improv_state
    improv_state = {
        "player_name": None,
        "current_round": 0,
        "max_rounds": 3,
        "rounds": [],
        "phase": "intro",
        "current_scenario": None,
    }
    
    # Initialize agent
    agent = ImprovBattleAgent()
    
    # Configure speech-to-text (STT)
    stt_provider = os.getenv("STT_PROVIDER", "deepgram")
    if stt_provider == "deepgram":
        stt = deepgram.STT(model="nova-2-general")
    else:
        stt = google.STT(languages=["en-US"])
    
    # Configure text-to-speech (TTS) - Murf Falcon - energetic male voice for game show host
    tts = murf.TTS(voice="en-US-matthew")
    
    # Configure LLM for agent responses - using default model (gemini-2.0-flash-exp with lower quota)
    google_llm = google.LLM()
    
    # Configure voice activity detection
    vad = silero.VAD.load()
    
    # Connect to the room
    await ctx.connect()
    
    # Start the assistant using LiveKit Agents AgentSession
    session = AgentSession(
        tts=tts,
        stt=stt,
        llm=google_llm,
        vad=vad,
    )
    
    # Start the session with the agent and room
    await session.start(agent, room=ctx.room)
    
    logger.info("Improv Battle agent started successfully")
    
    # Give the session a moment to fully initialize
    import asyncio
    await asyncio.sleep(0.5)
    
    # Opening greeting - now that session is fully started
    await session.say(
        "Welcome to Improv Battle! I'm your host, and we're about to have some fun. "
        "What's your name?",
        allow_interruptions=True,
    )


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
        ),
    )
