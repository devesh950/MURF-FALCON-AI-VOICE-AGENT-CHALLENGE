import { Button } from '@/components/livekit/button';
import { motion } from 'motion/react';

function PhysicsWallahLogo() {
  return (
    <svg viewBox="0 0 200 200" className="h-32 w-32 drop-shadow-2xl">
      {/* Outer Circle - Purple gradient */}
      <defs>
        <linearGradient id="pwGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Background Circle */}
      <circle cx="100" cy="100" r="95" fill="url(#pwGradient)" filter="url(#glow)" />
      
      {/* White inner circle */}
      <circle cx="100" cy="100" r="80" fill="white" />
      
      {/* PW Text - Bold and Stylized */}
      <text x="100" y="125" fontSize="70" fontWeight="900" fill="url(#pwGradient)" textAnchor="middle" fontFamily="Arial, sans-serif">
        PW
      </text>
      
      {/* Graduation cap accent */}
      <path d="M100 35 L70 45 L100 55 L130 45 Z" fill="#7c3aed" />
      <path d="M75 50 L75 60 Q75 65 85 67 L100 70 L115 67 Q125 65 125 60 L125 50" fill="#7c3aed" opacity="0.8" />
      
      {/* Small stars for excellence */}
      <circle cx="60" cy="60" r="3" fill="#fbbf24" />
      <circle cx="140" cy="60" r="3" fill="#fbbf24" />
      <circle cx="100" cy="165" r="3" fill="#fbbf24" />
    </svg>
  );
}

function WelcomeImage() {
  return (
    <div className="mb-8 flex flex-col items-center">
      {/* Physics Wallah Logo with animated glow */}
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative">
          <PhysicsWallahLogo />
        </div>
      </div>
      <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400 dark:from-purple-400 dark:to-purple-300 mb-3 tracking-tight">
        Physics Wallah Teach-the-Tutor
      </h1>
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
            Master Programming Through Active Recall
          </h2>
          <p className="text-lg text-purple-700 dark:text-purple-300">
            Learn • Quiz • Teach Back • Master Programming Concepts
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="max-w-5xl w-full grid md:grid-cols-3 gap-6 mb-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl p-6 shadow-lg border border-purple-200/50 dark:border-purple-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl shadow-lg">
              📚
            </div>
            <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">Learn Mode</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">Get concepts explained clearly by Matthew</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl p-6 shadow-lg border border-purple-200/50 dark:border-purple-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-3xl shadow-lg">
              ❓
            </div>
            <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">Quiz Mode</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">Test your knowledge with Alicia</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl p-6 shadow-lg border border-purple-200/50 dark:border-purple-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg">
              🎤
            </div>
            <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">Teach Back Mode</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">Explain concepts to Ken to solidify learning</p>
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
            className="w-full font-black text-2xl py-8 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 shadow-2xl hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] transform transition-all duration-500 hover:scale-105 hover:-translate-y-1 rounded-2xl relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <span className="text-3xl group-hover:scale-125 transition-transform duration-300">🎓</span>
              <span>{startButtonText}</span>
              <span className="text-3xl group-hover:scale-125 transition-transform duration-300">📚</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </Button>
          
          <div className="mt-6 space-y-2 text-center">
            <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold flex items-center justify-center gap-2">
              <span>🎙️</span>
              <span>Voice-powered by Murf AI Falcon</span>
              <span>⚡</span>
            </p>
            <p className="text-xs text-purple-500 dark:text-purple-500">
              💬 Say "Teach me about variables" • ❓ Say "Quiz me on loops" • 🎤 Say "Let me explain functions"
            </p>
          </div>
          
          <p className="text-sm text-purple-600 dark:text-purple-400 mt-6 font-semibold">
            #MurfAIVoiceAgentsChallenge | #10DaysofAIVoiceAgents | Day 4
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
