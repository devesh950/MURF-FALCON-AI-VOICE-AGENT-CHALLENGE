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
            instructions="""You are a friendly coffee shop barista assistant for Brew & Beans Coffee.
            Your job is to take voice orders and confirm them clearly. Maintain an order object with these exact fields: drinkType, size, milk, extras, name.
            Ask clarifying questions until all fields are provided. Only accept concise answers from the user (single values or short lists).
            When the order is complete, call the `save_order` tool with the final order (as a JSON object). Then tell the user the order was saved and repeat the order summary.

            Behavior rules:
            - Always confirm ambiguous answers (e.g., if size unclear, ask small/medium/large).
            - For extras, accept a comma-separated list and normalize to an array of strings.
            - Use polite, friendly language and keep messages short.
            - Do NOT write files yourself; use the provided `save_order` tool to persist orders.

            Example interaction:
            User: "Hi, I'd like a large oat latte with caramel."
            Agent: "What's your name for the order?"
            User: "Alex."
            Agent: "Got it — large oat latte with caramel for Alex. Anything else (extra shots, whipped cream)?"
            User: "No."
            Agent: "Thanks — saving your order now."
            """,
        )

    @function_tool
    async def save_order(self, context: RunContext, order: dict):
        """Save a completed order to `orders/` as a JSON file and return the filepath.

        The LLM should call this tool with a dictionary matching the order state:
        {"drinkType":"...","size":"...","milk":"...","extras":[...],"name":"..."}
        """
        from pathlib import Path
        import json
        from datetime import datetime

        orders_dir = Path("orders")
        orders_dir.mkdir(exist_ok=True)
        ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
        safe_name = (order.get("name") or "anon").replace(" ", "_")
        filename = orders_dir / f"order_{safe_name}_{ts}.json"
        # Normalize extras
        extras = order.get("extras") or []
        if isinstance(extras, str):
            extras = [e.strip() for e in extras.split(",") if e.strip()]
        order["extras"] = extras
        with open(filename, "w", encoding="utf-8") as fh:
            json.dump(order, fh, indent=2, ensure_ascii=False)
        return str(filename)

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
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
