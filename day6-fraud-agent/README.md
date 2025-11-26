# Day 6 - Fraud Alert Voice Agent

## Overview
A voice-powered fraud detection agent for SecureBank that handles suspicious transaction verification through natural conversation.

## Features
- **Customer Verification**: Uses security questions to verify identity
- **Transaction Review**: Reads suspicious transaction details after verification
- **Case Management**: Updates fraud case status in JSON database
- **Professional Flow**: Mimics real bank fraud department procedures

## Architecture
```
day6-fraud-agent/
├── backend/
│   ├── src/
│   │   ├── agent.py          # Main fraud alert agent
│   │   ├── database.py       # JSON database operations
│   │   └── __init__.py
│   ├── fraud_cases.json      # Sample fraud cases database
│   ├── pyproject.toml        # Dependencies
│   └── .env.local            # API keys
└── frontend/
    ├── app-config.ts         # SecureBank branding (red theme)
    └── [Next.js app files]
```

## Database Structure
```json
{
  "userName": "John Smith",
  "securityIdentifier": "12345",
  "securityQuestion": "What is your favorite color?",
  "securityAnswer": "blue",
  "cardEnding": "4242",
  "status": "pending_review",
  "transactionAmount": "$1,299.99",
  "transactionName": "Luxury Electronics Store",
  "transactionTime": "2025-11-25 23:45:00",
  "transactionCategory": "e-commerce",
  "transactionSource": "luxuryelectronics.com",
  "transactionLocation": "Shanghai, China",
  "outcome": null
}
```

## Agent Function Tools

### 1. verify_customer
- First call: Get security question by username
- Second call: Verify with security answer
- Returns verification status

### 2. get_transaction_details
- Only accessible after verification
- Returns full transaction info

### 3. update_case_status
- Updates case to `confirmed_safe` or `confirmed_fraud`
- Writes outcome to database

## Call Flow
1. Agent introduces as SecureBank Fraud Department
2. Asks for customer's full name
3. Retrieves security question from database
4. Asks security question to verify identity
5. If verified: Reads suspicious transaction details
6. Asks: "Did you make this transaction?"
7. Updates database based on yes/no answer
8. Explains next steps (card active OR card blocked)
9. Ends call professionally

## Setup

### Backend
```bash
cd day6-fraud-agent/backend
# Update .env.local with your API keys
python src/agent.py dev
```

### Frontend
```bash
cd day6-fraud-agent/frontend
pnpm install
pnpm dev
```

### LiveKit Server
```bash
livekit-server --dev
```

## Test Scenarios

### Scenario 1: Confirmed Safe
- User: John Smith
- Security Answer: blue
- Transaction Confirmation: Yes
- Expected: Status → `confirmed_safe`, card remains active

### Scenario 2: Confirmed Fraud
- User: Sarah Johnson
- Security Answer: max
- Transaction Confirmation: No
- Expected: Status → `confirmed_fraud`, card blocked

### Scenario 3: Verification Failed
- User: Michael Chen
- Security Answer: wrong answer
- Expected: Call ends, no transaction details revealed

## Tech Stack
- **STT**: Deepgram nova-3
- **LLM**: Google Gemini 2.0 Flash
- **TTS**: Murf AI (en-US-natalie)
- **VAD**: Silero
- **Database**: JSON file (fraud_cases.json)
- **Framework**: LiveKit Agents
- **Frontend**: Next.js 15

## Security Notes
⚠️ **This is a demo only**
- Uses fake data only
- Never asks for real card numbers, PINs, or passwords
- Security questions are for demo purposes
- Do not use with real customer data

## Completion Checklist
- [x] Created fraud cases database with 3 sample cases
- [x] Implemented fraud alert agent persona
- [x] Added customer verification flow
- [x] Implemented transaction detail reading
- [x] Created database update functions
- [x] Configured SecureBank branding (red theme)
- [ ] Test all three scenarios (safe, fraud, failed verification)
- [ ] Record demo video
- [ ] Post to LinkedIn

## Advanced Goals (Optional)
- [ ] Integrate LiveKit Telephony for real phone calls
- [ ] Add DTMF support for yes/no responses
- [ ] Implement multiple fraud cases per user
- [ ] Add SMS notification simulation
- [ ] Create fraud ops dashboard

## Resources
- [LiveKit Agents Prompting](https://docs.livekit.io/agents/build/prompting/)
- [LiveKit Function Tools](https://docs.livekit.io/agents/build/tools/)
- [LiveKit Telephony](https://docs.livekit.io/agents/start/telephony/)
