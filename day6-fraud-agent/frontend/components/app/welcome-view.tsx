import { Button } from '@/components/livekit/button';
import { motion } from 'motion/react';

function PhonePeLogo() {
  return (
    <svg viewBox="0 0 200 200" className="h-40 w-40 drop-shadow-2xl">
      <defs>
        <linearGradient id="phonepeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5f259f" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#5f259f" />
        </linearGradient>
        <filter id="ppGlow">
          <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* PhonePe Circle Background */}
      <circle cx="100" cy="100" r="95" fill="url(#phonepeGradient)" filter="url(#ppGlow)" />
      
      {/* White P Symbol - Iconic PhonePe Logo */}
      <path d="M 70 50 L 70 150 L 80 150 L 80 105 L 115 105 C 135 105 145 95 145 80 C 145 65 135 50 115 50 Z M 80 60 L 110 60 C 125 60 135 68 135 80 C 135 92 125 95 110 95 L 80 95 Z" 
            fill="white" 
            stroke="white" 
            strokeWidth="2"/>
      
      {/* Arrow/Phone Element */}
      <path d="M 120 115 L 135 130 L 120 145" 
            stroke="white" 
            strokeWidth="6" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none"/>
      
      {/* Small accent dots */}
      <circle cx="55" cy="65" r="4" fill="#a78bfa" opacity="0.8" />
      <circle cx="150" cy="65" r="4" fill="#a78bfa" opacity="0.8" />
      <circle cx="100" cy="170" r="4" fill="#a78bfa" opacity="0.8" />
    </svg>
  );
}

function WelcomeImage() {
  return (
    <div className="mb-8 flex flex-col items-center">
      {/* PhonePe Logo with animated glow */}
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative">
          <PhonePeLogo />
        </div>
      </div>
      <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#5f259f] via-[#7c3aed] to-[#5f259f] dark:from-purple-400 dark:to-purple-300 mb-4 tracking-tight">
        PhonePe Sales Hub
      </h1>
      <p className="text-xl font-semibold text-purple-800 dark:text-purple-200 mb-2">
        India's Leading Digital Payments Platform
      </p>
      <p className="text-base font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
        <span>Powered by</span>
        <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1.5 text-white font-bold shadow-lg">
          Murf AI Falcon 🚀
        </span>
      </p>
    </div>
  );
}

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref} className="relative min-h-screen">
      {/* Beautiful Gradient Background - Physics Wallah Purple Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-purple-950 dark:via-gray-900 dark:to-purple-900">
        {/* Animated gradient orbs - Purple theme */}
        <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-purple-400/35 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-300/25 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-400/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute bottom-1/3 left-1/4 w-[450px] h-[450px] bg-purple-600/35 rounded-full blur-3xl animate-pulse delay-300"></div>
      </div>

      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 min-h-screen py-20">
        <WelcomeImage />

        {/* Hero Text */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-purple-900 dark:text-purple-100 mb-4">
            Talk to Sarah, Your PhonePe Sales Assistant
          </h2>
          <p className="text-lg text-purple-700 dark:text-purple-300">
            Discover payment solutions • Get instant answers • Explore business opportunities
          </p>
        </motion.div>

        {/* Feature Cards Grid - PhonePe Products */}
        <div className="max-w-5xl w-full grid md:grid-cols-3 gap-6 mb-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl p-6 shadow-lg border border-purple-200/50 dark:border-purple-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#5f259f] to-[#7c3aed] flex items-center justify-center text-3xl shadow-lg">
              💳
            </div>
            <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">Payment Gateway</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">Accept online payments at ZERO cost (0% fees)</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl p-6 shadow-lg border border-purple-200/50 dark:border-purple-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-3xl shadow-lg">
              📱
            </div>
            <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">QR & SmartSpeaker</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">Accept in-store payments with voice alerts</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl p-6 shadow-lg border border-purple-200/50 dark:border-purple-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl shadow-lg">
              🚀
            </div>
            <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">Business Growth</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">Lending, ads, and more business solutions</p>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="max-w-2xl w-full backdrop-blur-2xl bg-gradient-to-br from-white/80 via-purple-50/80 to-white/80 dark:from-gray-900/80 dark:via-purple-900/40 dark:to-gray-900/80 rounded-3xl p-8 shadow-2xl border-2 border-purple-300/50 dark:border-purple-600/50"
        >
          <Button 
            variant="primary" 
            size="lg" 
            onClick={onStartCall} 
            className="w-full font-black text-2xl py-8 bg-gradient-to-r from-[#5f259f] to-[#7c3aed] hover:from-[#4a1d7f] hover:to-[#5f259f] shadow-2xl hover:shadow-[0_0_40px_rgba(95,37,159,0.6)] transform transition-all duration-500 hover:scale-105 hover:-translate-y-1 rounded-2xl relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <span className="text-3xl group-hover:scale-125 transition-transform duration-300">💬</span>
              <span>{startButtonText}</span>
              <span className="text-3xl group-hover:scale-125 transition-transform duration-300">🚀</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </Button>
          
          <div className="mt-6 space-y-3 text-center">
            <div className="backdrop-blur-md bg-purple-100/60 dark:bg-purple-900/40 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
              <p className="text-sm text-purple-900 dark:text-purple-100 font-bold mb-2">
                ✨ Meet Sarah - Your PhonePe Expert
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Ask about our products • Get pricing info • Discover how PhonePe can grow your business
              </p>
            </div>
            <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold flex items-center justify-center gap-2">
              <span>🎙️</span>
              <span>Voice-powered by Murf AI Falcon</span>
              <span>⚡</span>
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-purple-600 dark:text-purple-400">
              <span>💳 0% Fees</span>
              <span>•</span>
              <span>📱 61Cr+ Users</span>
              <span>•</span>
              <span>🏪 4.4Cr+ Merchants</span>
            </div>
          </div>
          
          <p className="text-sm text-purple-600 dark:text-purple-400 mt-6 font-semibold">
            #MurfAIVoiceAgentsChallenge | #10DaysofAIVoiceAgents | Day 5
          </p>
        </motion.div>
      </section>

      <div className="fixed bottom-5 left-0 flex w-full items-center justify-center">
        <p className="text-muted-foreground max-w-prose pt-1 text-xs leading-5 font-normal text-pretty md:text-sm">
          Need help getting set up? Check out the{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.livekit.io/agents/start/voice-ai/"
            className="underline"
          >
            Voice AI quickstart
          </a>
          .
        </p>
      </div>
    </div>
  );
};
