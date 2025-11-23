import logging

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    MetricsCollectedEvent,
    RoomInputOptions,
    WorkerOptions,
    cli,
    metrics,
    tokenize,
    function_tool,
    RunContext,
)
from livekit.plugins import murf, silero, google, deepgram, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")

load_dotenv(".env.local")


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""You are a supportive Health & Wellness Voice Companion - a caring, realistic, and grounded daily check-in assistant.

            IMPORTANT BOUNDARIES:
            - You are NOT a therapist, doctor, or medical professional
            - You do NOT diagnose conditions or prescribe treatments
            - You offer simple, practical lifestyle suggestions only
            - If serious mental health concerns arise, gently suggest professional help
            
            Your job: Conduct daily wellness check-ins and save them to wellness_log.json using the save_wellness_checkin tool.
            
            Check-in structure (one question at a time):
            1. Mood & Energy (required):
               - "Hi! How are you feeling today?"
               - "What's your energy level like right now?" (ask for 1-10 scale)
               - Optional: "Anything on your mind or stressing you out?"
            
            2. Daily Intentions (required):
               - "What are 1 to 3 things you'd like to get done today?"
               - "Is there anything you want to do for yourself? Rest, exercise, a hobby?"
            
            3. Simple Advice (when appropriate):
               - Break big goals into smaller steps
               - Suggest: short walks, breaks, stretching, hydration
               - Keep it practical: "Maybe try a 5-minute walk?" NOT medical advice
            
            4. Recap & Save (required):
               - Summarize: mood, energy level, and objectives
               - Ask: "Does this sound right?"
               - Get their name
               - Call save_wellness_checkin tool with: mood (text), energy (1-10), objectives (array), name (string)
            
            5. Reference Past Check-ins:
               - If wellness_log.json exists with entries, briefly mention something:
                 "Last time you mentioned [X]. How's that going?"
               - Keep it natural and brief
            
            Conversation style:
            - Warm and empathetic: "I hear you", "That makes sense"
            - Brief: 1-2 sentences per turn
            - Encouraging: "You've got this!", "One step at a time"
            - Match their energy level
            - Non-judgmental always
            
            Example:
            You: "Hi there! How are you feeling today?"
            User: "Pretty tired"
            You: "I hear you. On a scale of 1 to 10, what's your energy level?"
            User: "Maybe a 5"
            You: "Got it. What's one thing you'd like to accomplish today?"
            User: "Finish my report"
            You: "That's a solid goal. Anything else or something just for you?"
            User: "Maybe take a walk"
            You: "I love that! So you're feeling tired, energy at 5 out of 10, and you want to finish the report and take a walk. Sound right?"
            User: "Yes"
            You: "Perfect! What's your name?"
            User: "Jordan"
            You: "Thanks Jordan! I've saved your check-in. Remember, one step at a time - you've got this!"
            User: "No, that's all."
            Agent: "Awesome! I've saved your order. One Venti oat milk latte with caramel for Alex. We'll have that ready for you soon!"
            """,
        )

    @function_tool
    async def save_wellness_checkin(
        self,
        context: RunContext,
        mood: str,
        energy: int,
        objectives: list,
        name: str
    ):
        """Save a wellness check-in to wellness_log.json.

        Args:
            mood: User's mood description (text like "tired", "good", "stressed")
            energy: Energy level on 1-10 scale
            objectives: List of 1-3 daily goals/intentions
            name: User's name
        
        Returns:
            Confirmation message with entry count
        """
        from pathlib import Path
        import json
        from datetime import datetime

        log_file = Path("wellness_log.json")
        
        # Load existing log or create new
        if log_file.exists():
            with open(log_file, "r", encoding="utf-8") as fh:
                log_data = json.load(fh)
        else:
            log_data = {"entries": []}
        
        # Create new entry
        entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "name": name,
            "mood": mood,
            "energy_level": energy,
            "objectives": objectives if isinstance(objectives, list) else [objectives],
            "agent_summary": f"{name} feeling {mood}, energy {energy}/10, focusing on: {', '.join(objectives if isinstance(objectives, list) else [objectives])}"
        }
        
        # Append and save
        log_data["entries"].append(entry)
        
        with open(log_file, "w", encoding="utf-8") as fh:
            json.dump(log_data, fh, indent=2, ensure_ascii=False)
        
        return f"Check-in saved successfully! This is entry #{len(log_data['entries'])} in your wellness log."
    
    @function_tool
    async def get_previous_checkins(self, context: RunContext, days: int = 7):
        """Retrieve previous wellness check-ins from the log.

        Args:
            days: Number of recent days to retrieve (default 7)
        
        Returns:
            List of recent check-in summaries
        """
        from pathlib import Path
        import json
        from datetime import datetime, timedelta

        log_file = Path("wellness_log.json")
        
        if not log_file.exists():
            return "No previous check-ins found. This is your first time!"
        
        with open(log_file, "r", encoding="utf-8") as fh:
            log_data = json.load(fh)
        
        entries = log_data.get("entries", [])
        if not entries:
            return "No previous check-ins found."
        
        # Get recent entries
        cutoff_date = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")
        recent = [e for e in entries if e.get("date", "") >= cutoff_date]
        
        if not recent:
            recent = entries[-3:]  # Last 3 if none in date range
        
        summaries = []
        for e in recent[-5:]:  # Max 5 most recent
            summaries.append(
                f"{e.get('date')}: {e.get('name')} - {e.get('mood')}, "
                f"energy {e.get('energy_level')}/10, goals: {', '.join(e.get('objectives', []))}"
            )
        
        return "\n".join(summaries)

    # To add tools, use the @function_tool decorator.
    # Here's an example that adds a simple weather tool.
    # You also have to add `from livekit.agents import function_tool, RunContext` to the top of this file
    # @function_tool
    # async def lookup_weather(self, context: RunContext, location: str):
    #     """Use this tool to look up current weather information in the given location.
    #
    #     If the location is not supported by the weather service, the tool will indicate this. You must tell the user the location's weather is unavailable.
    #
    #     Args:
    #         location: The location to look up weather information for (e.g. city name)
    #     """
    #
    #     logger.info(f"Looking up weather for {location}")
    #
    #     return "sunny with a temperature of 70 degrees."


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Set up a voice AI pipeline using OpenAI, Cartesia, AssemblyAI, and the LiveKit turn detector
    session = AgentSession(
        # Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
        # See all available models at https://docs.livekit.io/agents/models/stt/
        stt=deepgram.STT(model="nova-3"),
        # A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
        # See all available models at https://docs.livekit.io/agents/models/llm/
        llm=google.LLM(
                model="gemini-2.5-flash",
            ),
        # Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
        # See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
        tts=murf.TTS(
                voice="en-US-matthew", 
                style="Conversation",
                tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
                text_pacing=True
            ),
        # VAD and turn detection are used to determine when the user is speaking and when the agent should respond
        # See more at https://docs.livekit.io/agents/build/turns
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        # allow the LLM to generate a response while waiting for the end of turn
        # See more at https://docs.livekit.io/agents/build/audio/#preemptive-generation
        preemptive_generation=True,
    )

    # To use a realtime model instead of a voice pipeline, use the following session setup instead.
    # (Note: This is for the OpenAI Realtime API. For other providers, see https://docs.livekit.io/agents/models/realtime/))
    # 1. Install livekit-agents[openai]
    # 2. Set OPENAI_API_KEY in .env.local
    # 3. Add `from livekit.plugins import openai` to the top of this file
    # 4. Use the following session setup instead of the version above
    # session = AgentSession(
    #     llm=openai.realtime.RealtimeModel(voice="marin")
    # )

    # Metrics collection, to measure pipeline performance
    # For more information, see https://docs.livekit.io/agents/build/metrics/
    usage_collector = metrics.UsageCollector()

    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent):
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)

    async def log_usage():
        summary = usage_collector.get_summary()
        logger.info(f"Usage summary: {summary}")

    # Connect to room and start session
    await ctx.connect()
    await session.start(
        Assistant(),
        room=ctx.room
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(
        entrypoint_fnc=entrypoint,
        prewarm_fnc=prewarm,
        agent_name="Wellness Companion"
    ))
