import json
import logging
import os
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
    function_tool,
)
from livekit.plugins import deepgram, google, murf, silero

logger = logging.getLogger("phonepe-sdr-agent")
logger.setLevel(logging.INFO)


def load_phonepe_faq() -> dict[str, Any]:
    """Load PhonePe FAQ and company information."""
    faq_file = Path(__file__).parent.parent / "phonepe_faq.json"
    with open(faq_file, "r", encoding="utf-8") as f:
        return json.load(f)


# Global FAQ data
FAQ_DATA = load_phonepe_faq()

# Lead storage
LEAD_DATA = {
    "name": None,
    "company": None,
    "email": None,
    "role": None,
    "use_case": None,
    "team_size": None,
    "timeline": None,
}


class PhonePeSDRAgent(Agent):
    """PhonePe Sales Development Representative Agent."""

    def __init__(self):
        # Prepare FAQ context
        faq_context = self._prepare_faq_context()
        
        instructions = f"""You are a friendly and professional Sales Development Representative (SDR) for PhonePe, India's leading digital payments platform.

**YOUR ROLE:**
- Greet visitors warmly and professionally
- Understand their business needs and challenges
- Answer questions about PhonePe products and services using the FAQ
- Naturally collect lead information during conversation
- Be helpful, conversational, and genuine

**PHONEPE OVERVIEW:**
{FAQ_DATA['company_info']['description']}
Key Stats: {FAQ_DATA['company_info']['name']} has 61+ crore registered users, accepted at 4.4+ crore merchants across 98% of India's postal codes.

**AVAILABLE PRODUCTS & PRICING:**

1. **Payment Gateway** - ZERO cost (0% fees)
   - For online businesses (e-commerce, apps, websites)
   - Supports UPI, cards, wallets, net banking
   - Instant settlements
   
2. **Offline Payments (QR + SmartSpeaker)** - FREE QR codes
   - For retail stores, restaurants, kirana shops
   - Voice alerts with SmartSpeaker (4 days battery)
   - Real-time payment notifications

3. **Business Lending** - Quick loans for growth
   - Competitive interest rates
   - Fast approval, minimal documentation

4. **PhonePe Ads** - Reach 61+ crore users
   - Contact sales for pricing

**FAQ KNOWLEDGE BASE:**
{faq_context}

**CONVERSATION GUIDELINES:**

1. **Opening (First 30 seconds):**
   - Warm greeting: "Hi! I'm Sarah from PhonePe. Great to connect with you!"
   - Ask: "What brought you here today?" or "Tell me a bit about what you're working on?"

2. **Discovery (Understand their needs):**
   - Listen actively to their business/use case
   - Ask clarifying questions about their challenges
   - Naturally collect information:
     * Their name (if not mentioned, ask: "I didn't catch your name?")
     * Company name (ask: "Which company are you with?")
     * Role (ask: "What's your role there?")
     * Use case (infer from conversation or ask: "What are you looking to solve?")
     * Team size (ask: "How big is your team?")
     * Timeline (ask: "When are you looking to get started?")

3. **Answering Questions:**
   - Use ONLY information from the FAQ above
   - If unsure, say: "Let me check with our team and get back to you"
   - Highlight the FREE 0% fees for Payment Gateway
   - Emphasize our massive reach (61+ crore users)

4. **Qualification:**
   - Determine if they're a good fit based on:
     * Online business → Payment Gateway
     * Offline store → QR + SmartSpeaker
     * Need funding → Business Lending
     * Want to advertise → PhonePe Ads

5. **Closing the Conversation:**
   - When user says: "That's all", "I'm done", "Thanks", "Goodbye" etc.
   - Summarize what you learned: "Great chatting with you [Name]! So you're [Role] at [Company], looking to [Use Case] for a team of [Team Size], planning to start [Timeline]."
   - Offer next steps: "I'll have our team reach out to you at [Email] with the next steps!"

**LEAD COLLECTION STRATEGY:**
- Collect information NATURALLY during conversation - don't make it feel like a form
- If they mention something, store it immediately using the save_lead_field tool
- Don't ask all questions at once - spread them throughout the conversation
- Some fields can be inferred (e.g., if they say "I run a small shop" → use_case = "offline payments")

**IMPORTANT RULES:**
- Always be warm, friendly, and professional
- Never make up features or pricing not in the FAQ
- If asked about competitors, focus on PhonePe's strengths (0% fees, massive reach, security)
- Use simple language - avoid jargon
- Keep responses concise (2-3 sentences max)
- Show genuine interest in helping them succeed

**EXAMPLE CONVERSATION FLOW:**
User: "Hi, I'm looking for a payment solution"
You: "Hi! I'm Sarah from PhonePe. Great to connect! I'd love to help you find the right solution. What kind of business are you running?"

User: "I have an online clothing store"
You: [Save use_case: "e-commerce - online clothing store"] "That's awesome! How's business going? By the way, I didn't catch your name?"

User: "I'm Rahul"
You: [Save name: "Rahul"] "Nice to meet you, Rahul! So for your online store, are you currently using any payment gateway?"

User: "Yes, but the fees are killing me - 2% per transaction!"
You: "Oh I totally understand! That adds up fast. Good news - PhonePe Payment Gateway is completely FREE with 0% transaction fees. You'd save a ton on every order."

Remember: You're here to help them succeed. Be genuinely interested, listen well, and offer solutions that fit their needs!
"""

        super().__init__(
            instructions=instructions,
            tts=murf.TTS(voice="en-US-natalie"),  # Professional female voice for SDR
        )

    def _prepare_faq_context(self) -> str:
        """Format FAQ data into a readable context string."""
        context_parts = []
        
        # Add FAQs
        context_parts.append("**FREQUENTLY ASKED QUESTIONS:**")
        for i, faq in enumerate(FAQ_DATA['faqs'], 1):
            context_parts.append(f"\nQ{i}: {faq['question']}")
            context_parts.append(f"A{i}: {faq['answer']}")
        
        return "\n".join(context_parts)

    @function_tool()
    async def save_lead_field(self, field_name: str, value: str):
        """
        Save a lead field when the user provides information.
        
        Args:
            field_name: One of: name, company, email, role, use_case, team_size, timeline
            value: The value to save
        """
        if field_name in LEAD_DATA:
            LEAD_DATA[field_name] = value
            logger.info(f"Saved lead field: {field_name} = {value}")
            return f"Got it! I've noted that down."
        return "Invalid field name"

    @function_tool()
    async def search_faq(self, query: str):
        """
        Search the FAQ for relevant information.
        
        Args:
            query: The user's question or keywords to search for
        """
        query_lower = query.lower()
        relevant_faqs = []
        
        # Simple keyword matching
        for faq in FAQ_DATA['faqs']:
            if any(keyword in faq['question'].lower() or keyword in faq['answer'].lower() 
                   for keyword in query_lower.split()):
                relevant_faqs.append(f"Q: {faq['question']}\nA: {faq['answer']}")
        
        if relevant_faqs:
            return "\n\n".join(relevant_faqs[:3])  # Return top 3 matches
        return "I don't have specific information on that. Let me connect you with our team for details."

    @function_tool()
    async def get_product_info(self, product_name: str):
        """
        Get detailed information about a PhonePe product.
        
        Args:
            product_name: Name of the product (e.g., "Payment Gateway", "QR", "SmartSpeaker")
        """
        for product in FAQ_DATA['products']:
            if product_name.lower() in product['name'].lower():
                return f"{product['name']}: {product['description']}\nPricing: {product['pricing']}\nIdeal for: {product['ideal_for']}"
        return "Product not found. Available products: Payment Gateway, QR Codes, SmartSpeaker, Business Lending, PhonePe Ads"


async def entrypoint(ctx: JobContext):
    """Agent entrypoint - called when user joins the room."""
    
    logger.info(f"Starting PhonePe SDR Agent for room: {ctx.room.name}")
    
    # Connect to the room
    await ctx.connect()
    
    # Create agent session with plugins
    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=murf.TTS(),  # Default voice, overridden by agent
        vad=silero.VAD.load(),
    )
    
    # Start the session with PhonePe SDR agent
    await session.start(PhonePeSDRAgent(), room=ctx.room)
    
    # Save lead data to JSON file after session ends
    save_lead_data()


def save_lead_data():
    """Save collected lead data to JSON file."""
    if any(LEAD_DATA.values()):  # Only save if we collected something
        leads_file = Path(__file__).parent.parent / "leads.json"
        
        # Load existing leads
        existing_leads = []
        if leads_file.exists():
            with open(leads_file, "r", encoding="utf-8") as f:
                existing_leads = json.load(f)
        
        # Add new lead with timestamp
        from datetime import datetime
        lead_entry = {
            "timestamp": datetime.now().isoformat(),
            **LEAD_DATA
        }
        existing_leads.append(lead_entry)
        
        # Save back to file
        with open(leads_file, "w", encoding="utf-8") as f:
            json.dump(existing_leads, f, indent=2)
        
        logger.info(f"Lead data saved: {LEAD_DATA}")


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, agent_name="PhonePe SDR Agent"))
