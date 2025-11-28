# QuickMart Express - Swiggy-Themed Grocery Voice Agent Frontend

A modern, Swiggy-inspired frontend for voice-powered grocery ordering.

## Features

- 🎨 **Swiggy-Inspired Design**: Orange/coral color scheme with modern UI
- 🎤 **Voice Ordering**: Real-time voice interaction with AI assistant
- 🛒 **Smart Cart**: Live cart updates with add/remove/quantity controls
- 📦 **Order Tracking**: Real-time order status with visual indicators
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4
- **Voice**: LiveKit Components React
- **Icons**: Phosphor Icons
- **Animation**: Framer Motion

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update with your LiveKit credentials:

```
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Main home page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── api/
│       └── connection-details/
│           └── route.ts      # LiveKit token generation
├── components/
│   ├── voice-agent.tsx       # Voice interaction component
│   ├── cart-display.tsx      # Shopping cart UI
│   └── order-history.tsx     # Order tracking UI
└── package.json
```

## Swiggy Theme Colors

- **Primary Orange**: `#FC8019` - Main brand color
- **Accent Green**: `#60B246` - Success states
- **Background**: Gradient from orange-50 to green-50
- **Cards**: White with orange borders on hover

## Usage

### Voice Commands

- "I need bread"
- "Add 2 liters of milk"
- "Show my cart"
- "I need pasta ingredients"
- "Place my order"
- "Check order status"

### Features

1. **Home View**: Landing page with features and popular items
2. **Voice Agent View**: Real-time voice interaction with cart display
3. **Order History View**: Track past and current orders

## Building for Production

```bash
npm run build
npm start
```

## Customization

### Change Theme Colors

Edit `tailwind.config.ts`:

```typescript
primary: {
  DEFAULT: "#FC8019",  // Change this
  // ...
}
```

### Modify Voice Agent Behavior

Edit `components/voice-agent.tsx` to customize:
- Connection logic
- Transcript display
- Quick action buttons
