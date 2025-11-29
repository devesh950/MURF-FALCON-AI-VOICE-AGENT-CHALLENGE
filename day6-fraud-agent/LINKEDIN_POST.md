# Day 6: SBI Fraud Alert Voice Agent 🛡️🏦

🎯 **Challenge:** Build a fraud alert voice agent for your favorite bank

Today I built a fraud detection voice agent for State Bank of India (Demo) that handles suspicious transaction verification calls with real-time voice interaction!

## 🚀 What I Built:

**Smart Fraud Detection System:**
- Real-time voice verification using security questions
- JSON database with fraud case management
- Dynamic transaction detail retrieval
- Automated case status updates (safe/fraudulent)
- Professional fraud department workflow

**Custom SBI-Themed UI:**
- Built from scratch with SBI blue (#22409A) gradient design
- Alert boxes highlighting suspicious activity
- Security badges and trust indicators
- Smooth animations and transitions
- Professional banking interface

**Real-Time Status Indicators:**
- 🎤 **Listening** - Blue animated mic with pulse effect
- 🧠 **Thinking** - Yellow brain icon with processing animation  
- 🔊 **Speaking** - Green volume icon with audio waves
- Always visible in center of screen with contextual hints
- Live state tracking throughout conversation

## 💡 Key Features:

1. **Security-First Verification:**
   - Agent retrieves exact security question from database
   - No made-up questions - always database-driven
   - Secure identity confirmation before revealing transaction details

2. **Natural Conversation Flow:**
   - "Namaste! This is SBI Fraud Detection Department..."
   - Asks for customer name
   - Verifies identity with personalized security question
   - Reads transaction details only after verification
   - Confirms if customer made the transaction
   - Updates case status automatically

3. **Complete Fraud Database:**
   - Customer profiles with security Q&A
   - Transaction details (amount, merchant, location)
   - Card information (last 4 digits)
   - Case status tracking
   - Verification outcomes

## 🛠️ Tech Stack:

- **Voice AI:** LiveKit Agents 1.3.3
- **STT:** Deepgram nova-3
- **LLM:** Google Gemini (default model)
- **TTS:** Murf AI Falcon (en-US-natalie voice) - Fastest TTS!
- **VAD:** Silero
- **Frontend:** Next.js 15 with custom SBI theme
- **Database:** JSON with 3 fraud case scenarios

## 🎯 Test Scenarios:

**Customer 1:** John Smith
- Security: "What is your favorite color?" → "blue"
- Transaction: $1,299.99 from China

**Customer 2:** Sarah Johnson  
- Security: "What is your pet's name?" → "max"
- Transaction: $549 from Nigeria

**Customer 3:** Michael Chen
- Security: "What is your first pet's name?" → "fluffy"
- Transaction: $2,450.50 from Italy

## 🎨 UI Highlights:

- Shield icon with SBI branding
- "Suspicious Activity Detected" alert box
- Security features: 🔐 Encrypted | ⚡ Instant | 🛡️ Protected
- Important reminder about never sharing PINs/passwords
- Gradient background from SBI blue to dark navy
- Real-time agent state visualization

## 📝 Lessons Learned:

1. **Agent Instructions Matter:** Had to make instructions crystal clear that agent MUST fetch security questions from database first, not make them up
2. **Agent Name Matching:** Frontend and backend agent names must match exactly (no extra "(Demo)" suffix)
3. **Default LLM Works Best:** Using google.LLM() without model param more stable than specifying versions
4. **Status Indicators UX:** Always-visible status indicators greatly improve user confidence during voice interactions
5. **LiveKit Connection:** Need LiveKit server running before agent connects

## 🔗 Links:

GitHub Branch: day6-fraud
Demo: State Bank of India Fraud Alert Agent (Educational Demo)

Building with the fastest TTS API - Murf Falcon! 🚀

#MurfAIVoiceAgentsChallenge #10DaysofAIVoiceAgents #VoiceAI #FraudDetection #BankingSecurity #LiveKit #AI #MurfAI #VoiceAgents #ConversationalAI #SBI #FraudPrevention

---
Day 6/10 Complete! ✅
Next up: More advanced agent capabilities!

@Murf AI - Thank you for the amazing Falcon TTS API! 🙏
