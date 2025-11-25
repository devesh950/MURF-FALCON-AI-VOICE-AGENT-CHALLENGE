'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { AppConfig } from '@/app-config';
import { ChatTranscript } from '@/components/app/chat-transcript';
import { PreConnectMessage } from '@/components/app/preconnect-message';
import { TileLayout } from '@/components/app/tile-layout';
import {
  AgentControlBar,
  type ControlBarControls,
} from '@/components/livekit/agent-control-bar/agent-control-bar';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useConnectionTimeout } from '@/hooks/useConnectionTimout';
import { useDebugMode } from '@/hooks/useDebug';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../livekit/scroll-area/scroll-area';

const MotionBottom = motion.create('div');

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.3,
    delay: 0.5,
    ease: 'easeOut',
  },
};

interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'from-background pointer-events-none h-4 bg-linear-to-b to-transparent',
        top && 'bg-linear-to-b',
        bottom && 'bg-linear-to-t',
        className
      )}
    />
  );
}
interface SessionViewProps {
  appConfig: AppConfig;
}

export const SessionView = ({
  appConfig,
  ...props
}: React.ComponentProps<'section'> & SessionViewProps) => {
  useConnectionTimeout(200_000);
  useDebugMode({ enabled: IN_DEVELOPMENT });

  const messages = useChatMessages();
  const [chatOpen, setChatOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const controls: ControlBarControls = {
    leave: true,
    microphone: true,
    chat: appConfig.supportsChatInput,
    camera: appConfig.supportsVideoInput,
    screenShare: appConfig.supportsVideoInput,
  };

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;

    if (scrollAreaRef.current && lastMessageIsLocal) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <section className="relative z-10 h-full w-full overflow-hidden" {...props}>
      {/* Beautiful Gradient Background - Always visible */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-50 via-teal-50 to-indigo-100 dark:from-purple-900/95 dark:via-teal-900/95 dark:to-indigo-800/95">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-400/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-teal-400/35 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-300/30 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-40 left-1/3 w-80 h-80 bg-purple-300/25 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute bottom-40 right-1/3 w-[450px] h-[450px] bg-teal-300/30 rounded-full blur-3xl animate-pulse delay-300"></div>
      </div>

      {/* Enhanced Wellness Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-40 backdrop-blur-2xl bg-gradient-to-r from-white/90 via-purple-50/90 to-white/90 dark:from-gray-900/90 dark:via-purple-900/40 dark:to-gray-900/90 rounded-2xl shadow-2xl border-2 border-purple-400/70 dark:border-purple-500/70 px-8 py-4 hover:scale-105 transition-transform duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/50 rounded-full blur-lg animate-pulse" />
            <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 via-purple-500 to-teal-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl animate-pulse">🌟</span>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-teal-600 dark:from-purple-300 dark:to-teal-300">
              Wellness Companion
            </h2>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
              <span>💜</span>
              <span>Live Check-in Session</span>
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1" />
            </p>
          </div>
          <div className="ml-4 flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 border border-purple-300 dark:border-purple-600">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300">🎙️ AI Voice Active</span>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Wellness Info Card - Left side */}
      <div className="absolute left-8 top-32 z-30 max-w-md">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-2xl bg-gradient-to-br from-white/95 via-purple-50/90 to-white/95 dark:from-gray-900/95 dark:via-purple-900/30 dark:to-gray-900/95 rounded-3xl shadow-2xl border-2 border-purple-300/70 dark:border-purple-600/70 p-7 hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/50 rounded-2xl blur-md" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-3xl shadow-lg">
                  💜
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-purple-800 dark:text-purple-200">
                  Check-in Guide
                </h3>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Follow the conversation flow</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="group flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-100/70 to-purple-50/50 dark:from-purple-900/30 dark:to-purple-800/20 border-2 border-purple-200/70 dark:border-purple-700/50 hover:border-purple-400 hover:shadow-lg transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-purple-400/50 rounded-xl blur-md group-hover:blur-lg transition-all" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                  🌱
                </div>
              </div>
              <div className="flex-1">
                <p className="font-black text-purple-900 dark:text-purple-100 mb-1">Step 1: Mood Check</p>
                <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">Share your current feelings</p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="h-1 flex-1 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                    <div className="h-full w-1/4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-pulse" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">Active</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="group flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-teal-100/70 to-teal-50/50 dark:from-teal-900/30 dark:to-teal-800/20 border-2 border-teal-200/70 dark:border-teal-700/50 hover:border-teal-400 hover:shadow-lg transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-teal-400/50 rounded-xl blur-md group-hover:blur-lg transition-all" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                  ⚡
                </div>
              </div>
              <div className="flex-1">
                <p className="font-black text-teal-900 dark:text-teal-100 mb-1">Step 2: Energy Level</p>
                <p className="text-xs text-teal-700 dark:text-teal-300 leading-relaxed">Rate vitality (1-10)</p>
                <div className="mt-2 flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-1 flex-1 bg-teal-200 dark:bg-teal-800 rounded-full" />
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="group flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-indigo-100/70 to-indigo-50/50 dark:from-indigo-900/30 dark:to-indigo-800/20 border-2 border-indigo-200/70 dark:border-indigo-700/50 hover:border-indigo-400 hover:shadow-lg transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-400/50 rounded-xl blur-md group-hover:blur-lg transition-all" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                  🎯
                </div>
              </div>
              <div className="flex-1">
                <p className="font-black text-indigo-900 dark:text-indigo-100 mb-1">Step 3: Daily Goals</p>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">Set 1-3 intentions</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold">Goal 1</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold">Goal 2</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold">Goal 3</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="group flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-100/70 via-teal-50/50 to-purple-50/50 dark:from-purple-900/30 dark:via-teal-900/20 dark:to-purple-800/20 border-2 border-purple-200/70 dark:border-purple-700/50 hover:border-purple-400 hover:shadow-lg transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/50 to-teal-400/50 rounded-xl blur-md group-hover:blur-lg transition-all" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                  💡
                </div>
              </div>
              <div className="flex-1">
                <p className="font-black text-purple-900 dark:text-purple-100 mb-1">Step 4: Smart Guidance</p>
                <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">Get personalized advice</p>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                  <span>✨</span>
                  <span>AI-powered tips</span>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 pt-5 border-t-2 border-purple-300/50 dark:border-purple-600/50"
          >
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-100/50 to-teal-100/50 dark:from-purple-900/30 dark:to-teal-900/30 border border-purple-300/50 dark:border-purple-600/50">
              <div className="flex items-center gap-2">
                <span className="text-lg animate-pulse">💾</span>
                <p className="text-xs font-bold text-purple-700 dark:text-purple-300">
                  Auto-saved securely
                </p>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">Live</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Chat Transcript - Right side when open */}
      <div
        className={cn(
          'absolute right-8 top-20 bottom-32 w-96 z-20',
          !chatOpen && 'hidden'
        )}
      >
        <div className="h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-200/50 dark:border-emerald-700/50 overflow-hidden">
          <Fade top className="absolute inset-x-0 top-0 h-8 z-10" />
          <ScrollArea ref={scrollAreaRef} className="h-full px-4 pt-12 pb-4">
            <ChatTranscript
              hidden={!chatOpen}
              messages={messages}
              className="space-y-3"
            />
          </ScrollArea>
        </div>
      </div>

      {/* Tile Layout - Agent visualization */}
      <TileLayout chatOpen={chatOpen} />

      {/* Bottom */}
      <MotionBottom
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="fixed inset-x-3 bottom-0 z-50 md:inset-x-12"
      >
        {appConfig.isPreConnectBufferEnabled && (
          <PreConnectMessage messages={messages} className="pb-4" />
        )}
        <div className="bg-background relative mx-auto max-w-2xl pb-3 md:pb-12">
          <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full" />
          <AgentControlBar controls={controls} onChatOpenChange={setChatOpen} />
        </div>
      </MotionBottom>
    </section>
  );
};
