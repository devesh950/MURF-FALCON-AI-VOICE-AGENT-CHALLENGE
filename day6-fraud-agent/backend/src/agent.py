import logging
import os
from dotenv import load_dotenv
from pathlib import Path

from livekit.agents import (
    Agent,
    AgentSession,
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    llm,
    function_tool,
)
from livekit.plugins import deepgram, google, murf, silero

from database import get_fraud_case, update_fraud_case

# Load environment variables
env_path = Path(__file__).parent.parent / ".env.local"
load_dotenv(dotenv_path=env_path)

logger = logging.getLogger("fraud-alert-agent")


class FraudAlertAgent(Agent):
    """Fraud Alert Voice Agent for bank security verification."""
    
    def __init__(self):
        # Current fraud case being investigated
        self.current_case = None
        self.user_verified = False
        self.user_name = None
        
        instructions = """You are a professional fraud detection representative for State Bank of India (SBI).

Your role is to:
1. Introduce yourself clearly: "Namaste! This is State Bank of India Fraud Detection Department. I'm calling about a suspicious transaction on your account."
2. Ask for the customer's full name to look up their case
3. Once you have their name, call verify_customer with ONLY the name (no security answer yet)
4. The tool will return the EXACT security question to ask - you MUST ask that exact question word-for-word
5. After customer answers, call verify_customer again with both name AND their answer
6. If verified, use get_transaction_details tool and read the details
7. Ask: "Did you make this transaction?" (yes/no)
8. Use update_case_status tool based on their answer
9. Explain next steps and end call professionally

CRITICAL RULES:
- NEVER make up security questions - ALWAYS call verify_customer first to get the exact question from database
- Use calm, professional, and reassuring language
- NEVER ask for full card numbers, PINs, or passwords
- Keep the conversation focused and efficient
- If verification fails, politely end the call without revealing transaction details

EXAMPLE FLOW:
You: "May I have your full name please?"
Customer: "John Smith"
[You call verify_customer("John Smith", "") - tool returns: "For verification, please ask the customer: What is your favorite color?"]
You: "For verification purposes, what is your favorite color?"
Customer: "Blue"
[You call verify_customer("John Smith", "blue")]
[Tool returns verification success]
You: [Get transaction details and continue...]

Remember: ALWAYS get the security question from the database first before asking customer!"""

        super().__init__(
            instructions=instructions,
            tts=murf.TTS(voice="en-US-natalie"),
            stt=deepgram.STT(model="nova-3"),
            llm=google.LLM(),
            vad=silero.VAD.load(),
        )
    
    @function_tool()
    async def verify_customer(self, user_name: str, security_answer: str = ""):
        """Verify customer identity by checking their name and security answer.
        
        Args:
            user_name: Full name of the customer
            security_answer: Answer to the security question (empty for first call to get question)
        
        Returns:
            Message about verification status or the security question to ask
        """
        # Load fraud case
        self.user_name = user_name
        self.current_case = get_fraud_case(user_name)
        
        if not self.current_case:
            return f"No fraud case found for customer: {user_name}. Please verify the name and try again."
        
        # If no security answer provided, return the security question
        if not security_answer:
            return f"For verification, please ask the customer: {self.current_case['securityQuestion']}"
        
        # Verify the security answer
        correct_answer = self.current_case['securityAnswer'].lower()
        provided_answer = security_answer.lower().strip()
        
        if provided_answer == correct_answer:
            self.user_verified = True
            return "Customer identity verified successfully. You can now proceed with transaction details."
        else:
            self.user_verified = False
            return "Verification failed. The security answer is incorrect. Please end the call politely without sharing transaction details."
    
    @function_tool()
    async def get_transaction_details(self):
        """Get suspicious transaction details after customer is verified.
        
        Returns:
            Transaction details including merchant, amount, card ending, time, and location.
            Only call this AFTER customer is successfully verified.
        """
        if not self.user_verified:
            return "Cannot provide transaction details. Customer verification is required first."
        
        if not self.current_case:
            return "No active fraud case found."
        
        details = f"""Here are the suspicious transaction details:
- Amount: {self.current_case['transactionAmount']}
- Merchant: {self.current_case['transactionName']}
- Card ending in: {self.current_case['cardEnding']}
- Date/Time: {self.current_case['transactionTime']}
- Location: {self.current_case['transactionLocation']}

Please ask the customer if they made this transaction."""
        
        return details
    
    @function_tool()
    async def update_case_status(self, customer_confirmed: bool, notes: str = ""):
        """Update the fraud case status based on customer's confirmation.
        
        Args:
            customer_confirmed: True if customer confirmed they made the transaction, False if they deny it
            notes: Additional notes about the conversation (optional)
        
        Returns:
            Confirmation message with next steps for the customer
        """
        if not self.user_verified:
            return "Cannot update case status. Customer verification is required first."
        
        if not self.current_case or not self.user_name:
            return "No active fraud case to update."
        
        if customer_confirmed:
            # Customer confirmed the transaction - mark as safe
            update_fraud_case(self.user_name, "confirmed_safe", notes or "Customer confirmed transaction")
            return "Case updated to 'confirmed safe'. Tell the customer: Your account is secure. We'll update our records. Thank you for your time. Have a great day!"
        else:
            # Customer denied the transaction - mark as fraud
            update_fraud_case(self.user_name, "confirmed_fraud", notes or "Customer denied transaction")
            return "Case updated to 'confirmed fraud'. Tell the customer: We will immediately block your card and issue a replacement. A new card will arrive in 3-5 business days. Check your registered email for further instructions. Is there anything else I can help you with?"


async def entrypoint(ctx: JobContext):
    """Entry point for the fraud alert agent."""
    logger.info(f"Starting SBI Fraud Alert Agent for room: {ctx.room.name}")
    
    # Start agent session
    session = AgentSession()
    await session.start(FraudAlertAgent(), room=ctx.room)
    
    logger.info("SBI Fraud Alert Agent session started")


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="SBI Fraud Alert Agent",
        )
    )
