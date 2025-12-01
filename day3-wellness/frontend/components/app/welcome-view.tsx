import { Button } from '@/components/livekit/button';
import { motion } from 'motion/react';

function WelcomeImage() {
  return (
    <div className="mb-8 flex flex-col items-center">
      {/* Wellness Heart Logo with glow effect */}
      <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-teal-500 shadow-2xl shadow-purple-400/50 ring-4 ring-white/50 dark:ring-purple-900/50 animate-pulse">
        <svg viewBox="0 0 64 64" className="h-20 w-20 text-white drop-shadow-lg">
          {/* Heart with wellness symbol */}
          <path
            d="M32 52c-1 0-2-1-2-1-8-8-16-16-16-24 0-6 4-10 10-10 3 0 6 2 8 4 2-2 5-4 8-4 6 0 10 4 10 10 0 8-8 16-16 24 0 0-1 1-2 1z"
            fill="currentColor"
          />
          {/* Sparkle/wellness dots */}
          <circle cx="20" cy="20" r="2" fill="currentColor" opacity="0.8" />
          <circle cx="44" cy="20" r="2" fill="currentColor" opacity="0.8" />
          <circle cx="32" cy="12" r="2" fill="currentColor" opacity="0.8" />
        </svg>
      </div>
      <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-teal-500 dark:from-purple-400 dark:to-teal-400 mb-3 tracking-tight">
        🌟 Wellness Companion
      </h1>
      <p className="text-base font-bold text-purple-600 dark:text-purple-300 flex items-center gap-2">
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
      {/* Beautiful Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-teal-50 to-indigo-100 dark:from-purple-950 dark:via-teal-950 dark:to-indigo-900">
        {/* Animated gradient orbs - More vibrant */}
        <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-purple-400/35 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-teal-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-300/25 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute bottom-1/3 left-1/4 w-[450px] h-[450px] bg-teal-300/35 rounded-full blur-3xl animate-pulse delay-300"></div>
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
            Your Personal Wellness Companion
          </h2>
          <p className="text-lg text-purple-700 dark:text-purple-300">
            Start each day with intention • Track your progress • Build healthy habits
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="max-w-5xl w-full grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl p-6 shadow-lg border border-purple-200/50 dark:border-purple-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg">
              🌱
            </div>
            <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">Mood Tracking</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">Share feelings & emotions</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl p-6 shadow-lg border border-teal-200/50 dark:border-teal-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-3xl shadow-lg">
              ⚡
            </div>
            <h3 className="font-bold text-teal-900 dark:text-teal-100 mb-2">Energy Levels</h3>
            <p className="text-sm text-teal-700 dark:text-teal-300">Rate vitality 1-10</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl p-6 shadow-lg border border-indigo-200/50 dark:border-indigo-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg">
              🎯
            </div>
            <h3 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2">Daily Goals</h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">Set 1-3 intentions</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl p-6 shadow-lg border border-purple-200/50 dark:border-purple-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-teal-500 flex items-center justify-center text-3xl shadow-lg">
              💡
            </div>
            <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">Smart Advice</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">Practical guidance</p>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="max-w-2xl w-full backdrop-blur-2xl bg-gradient-to-br from-white/80 via-purple-50/80 to-teal-50/80 dark:from-gray-900/80 dark:via-purple-900/40 dark:to-teal-900/40 rounded-3xl p-8 shadow-2xl border-2 border-purple-300/50 dark:border-purple-600/50"
        >
          <Button 
            variant="primary" 
            size="lg" 
            onClick={onStartCall} 
            className="w-full font-black text-2xl py-8 bg-gradient-to-r from-purple-600 via-purple-500 to-teal-500 hover:from-purple-700 hover:via-purple-600 hover:to-teal-600 shadow-2xl hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] transform transition-all duration-500 hover:scale-105 hover:-translate-y-1 rounded-2xl relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <span className="text-3xl group-hover:scale-125 transition-transform duration-300">🌟</span>
              <span>{startButtonText}</span>
              <span className="text-3xl group-hover:scale-125 transition-transform duration-300">💜</span>
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
              🔒 Privacy protected • ✨ Lightning-fast responses • 💾 Securely saved
            </p>
          </div>
          
          <p className="text-sm text-purple-600 dark:text-purple-400 mt-6 font-semibold">
            #MurfAIVoiceAgentsChallenge | #10DaysofAIVoiceAgents
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
