# Day 2: Coffee Shop Barista Agent 

## Overview
The voice agent has been transformed into a friendly coffee shop barista for "Brew & Beans Coffee" that can:
- Take voice orders in a natural conversation
- Maintain order state with fields: `drinkType`, `size`, `milk`, `extras`, `name`
- Ask clarifying questions until all fields are complete
- Save completed orders as JSON files in the `orders/` directory

## Agent Features

### Barista Persona
- Friendly, polite coffee shop assistant
- Asks clear questions to complete orders
- Confirms details to avoid mistakes
- Uses natural conversational flow

### Order Management
- Tracks order state: drink type, size, milk preference, extras, customer name
- Normalizes extras from comma-separated strings to arrays
- Saves orders with timestamp and customer name in filename
- Creates `orders/` directory automatically

### Example Interaction
```
User: "Hi, I'd like a large oat latte with caramel."
Agent: "What's your name for the order?"
User: "Alex."
Agent: "Got it — large oat latte with caramel for Alex. Anything else (extra shots, whipped cream)?"
User: "No."
Agent: "Thanks — saving your order now."
```

### Order JSON Format
```json
{
  "drinkType": "latte",
  "size": "large", 
  "milk": "oat",
  "extras": ["caramel"],
  "name": "Alex"
}
```

## Running the Agent

1. Ensure LiveKit server is running on port 7880
2. Start the backend: `python src/agent.py dev`
3. Start the frontend: `pnpm dev`
4. Open browser to frontend URL and start voice conversation

## Files Created
- Orders are saved to `backend/orders/order_{name}_{timestamp}.json`
- Example: `order_Alex_20251122T190430Z.json`

## Technical Implementation
- Uses `@function_tool` decorator for the `save_order` tool
- Integrates with LiveKit Agents framework
- Gemini 2.5 Flash LLM with Murf TTS (Matthew voice)
- Deepgram Nova-3 STT for speech recognition