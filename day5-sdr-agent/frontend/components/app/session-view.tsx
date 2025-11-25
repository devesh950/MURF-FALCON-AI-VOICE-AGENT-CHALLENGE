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

      {/* Enhanced PhonePe Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-40 backdrop-blur-2xl bg-gradient-to-r from-white/90 via-purple-50/90 to-white/90 dark:from-gray-900/90 dark:via-purple-900/40 dark:to-gray-900/90 rounded-2xl shadow-2xl border-2 border-[#5f259f]/70 dark:border-purple-500/70 px-8 py-4 hover:scale-105 transition-transform duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-[#5f259f]/50 rounded-full blur-lg animate-pulse" />
            <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-[#5f259f] via-[#7c3aed] to-[#5f259f] flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">P</span>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#5f259f] to-[#7c3aed] dark:from-purple-300 dark:to-purple-400">
              PhonePe Sales Assistant
            </h2>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
              <span>💬</span>
              <span>Sarah is Ready to Help</span>
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1" />
            </p>
          </div>
          <div className="ml-4 flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 border border-purple-300 dark:border-purple-600">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300">🎙️ Murf AI Voice</span>
          </div>
        </div>
      </motion.div>

      {/* Enhanced PhonePe Info Card - Left side */}
      <div className="absolute left-8 top-32 z-30 max-w-md">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-2xl bg-gradient-to-br from-white/95 via-purple-50/90 to-white/95 dark:from-gray-900/95 dark:via-purple-900/30 dark:to-gray-900/95 rounded-3xl shadow-2xl border-2 border-[#5f259f]/70 dark:border-purple-600/70 p-7 hover:shadow-[0_0_40px_rgba(95,37,159,0.3)] transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[#5f259f]/50 rounded-2xl blur-md" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5f259f] to-[#7c3aed] flex items-center justify-center text-3xl shadow-lg">
                  💳
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-purple-800 dark:text-purple-200">
                  Quick Guide
                </h3>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">What to Ask Sarah</p>
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
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#5f259f] to-[#7c3aed] flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                  💰
                </div>
              </div>
              <div className="flex-1">
                <p className="font-black text-purple-900 dark:text-purple-100 mb-1">Pricing Questions</p>
                <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">"What are your fees?" "Do you have a free tier?"</p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="h-1 flex-1 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-[#5f259f] to-[#7c3aed] rounded-full" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">0% Fees!</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="group flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-green-100/70 to-green-50/50 dark:from-green-900/30 dark:to-green-800/20 border-2 border-green-200/70 dark:border-green-700/50 hover:border-green-400 hover:shadow-lg transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-green-400/50 rounded-xl blur-md group-hover:blur-lg transition-all" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                  📱
                </div>
              </div>
              <div className="flex-1">
                <p className="font-black text-green-900 dark:text-green-100 mb-1">Product Features</p>
                <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed">"Tell me about your products" "How does SmartSpeaker work?"</p>
                <div className="mt-2 flex gap-1">
                  <div className="h-6 px-2 bg-green-200 dark:bg-green-800 rounded text-[9px] flex items-center font-bold">Gateway</div>
                  <div className="h-6 px-2 bg-green-200 dark:bg-green-800 rounded text-[9px] flex items-center font-bold">QR</div>
                  <div className="h-6 px-2 bg-green-200 dark:bg-green-800 rounded text-[9px] flex items-center font-bold">Lending</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="group flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-100/70 to-amber-50/50 dark:from-amber-900/30 dark:to-amber-800/20 border-2 border-amber-200/70 dark:border-amber-700/50 hover:border-amber-400 hover:shadow-lg transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400/50 rounded-xl blur-md group-hover:blur-lg transition-all" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                  🚀
                </div>
              </div>
              <div className="flex-1">
                <p className="font-black text-amber-900 dark:text-amber-100 mb-1">Business Growth</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">"I need a payment solution" "How can PhonePe help my business?"</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 font-semibold">Online</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 font-semibold">Offline</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 font-semibold">Both</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="group flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-100/70 via-cyan-50/50 to-blue-50/50 dark:from-blue-900/30 dark:via-cyan-900/20 dark:to-blue-800/20 border-2 border-blue-200/70 dark:border-blue-700/50 hover:border-blue-400 hover:shadow-lg transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/50 to-cyan-400/50 rounded-xl blur-md group-hover:blur-lg transition-all" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                  ⚡
                </div>
              </div>
              <div className="flex-1">
                <p className="font-black text-blue-900 dark:text-blue-100 mb-1">Get Started</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">"I want to sign up" "How do I get started?"</p>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                  <span>⚡</span>
                  <span>Quick onboarding • Easy setup</span>
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
            <div className="space-y-3">
              {/* PhonePe Stats */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#5f259f]/10 to-[#7c3aed]/10 dark:from-[#5f259f]/20 dark:to-[#7c3aed]/20 border border-purple-300/50 dark:border-purple-600/50">
                <p className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-2">PhonePe at a Glance</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-black text-[#5f259f] dark:text-purple-300">61Cr+</p>
                    <p className="text-[9px] text-purple-600 dark:text-purple-400">Users</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-[#5f259f] dark:text-purple-300">0%</p>
                    <p className="text-[9px] text-purple-600 dark:text-purple-400">Fees</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-[#5f259f] dark:text-purple-300">98%</p>
                    <p className="text-[9px] text-purple-600 dark:text-purple-400">Coverage</p>
                  </div>
                </div>
              </div>
              
              {/* Live Status */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-100/50 to-emerald-100/50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-300/50 dark:border-green-600/50">
                <div className="flex items-center gap-2">
                  <span className="text-lg animate-pulse">💬</span>
                  <p className="text-xs font-bold text-green-700 dark:text-green-300">
                    Sarah is listening
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">Active</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* PhonePe Features Showcase - Right side when chat is closed */}
      <div className={cn('absolute right-8 top-32 z-30 max-w-md', chatOpen && 'hidden')}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-2xl bg-gradient-to-br from-white/95 via-purple-50/90 to-white/95 dark:from-gray-900/95 dark:via-purple-900/30 dark:to-gray-900/95 rounded-3xl shadow-2xl border-2 border-[#5f259f]/70 dark:border-purple-600/70 p-7 hover:shadow-[0_0_40px_rgba(95,37,159,0.3)] transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#5f259f]/50 rounded-2xl blur-md" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5f259f] to-[#7c3aed] flex items-center justify-center text-3xl shadow-lg">
                💎
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#5f259f] to-[#7c3aed]">
                Why PhonePe?
              </h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">India's #1 Choice</p>
            </div>
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 rounded-xl bg-gradient-to-br from-[#5f259f]/10 to-[#7c3aed]/10 border-2 border-purple-200/50 dark:border-purple-700/50"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-xl shadow-lg">
                  💰
                </div>
                <h4 className="font-black text-purple-900 dark:text-purple-100">0% Transaction Fees</h4>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                Save money on every transaction. Our Payment Gateway is completely FREE with no hidden charges.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 rounded-xl bg-gradient-to-br from-blue-100/70 to-cyan-50/50 dark:from-blue-900/30 dark:to-cyan-800/20 border-2 border-blue-200/50 dark:border-blue-700/50"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-xl shadow-lg">
                  🚀
                </div>
                <h4 className="font-black text-blue-900 dark:text-blue-100">Massive Reach</h4>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                61 crore+ users, accepted at 4.4 crore+ merchants across 98% of India's postal codes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="p-4 rounded-xl bg-gradient-to-br from-amber-100/70 to-orange-50/50 dark:from-amber-900/30 dark:to-orange-800/20 border-2 border-amber-200/50 dark:border-amber-700/50"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl shadow-lg">
                  ⚡
                </div>
                <h4 className="font-black text-amber-900 dark:text-amber-100">Instant Settlements</h4>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                Get your money immediately. No waiting, no delays. Business runs smoothly with PhonePe.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="p-4 rounded-xl bg-gradient-to-br from-purple-100/70 to-pink-50/50 dark:from-purple-900/30 dark:to-pink-800/20 border-2 border-purple-200/50 dark:border-purple-700/50"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-xl shadow-lg">
                  🔒
                </div>
                <h4 className="font-black text-purple-900 dark:text-purple-100">Bank-Grade Security</h4>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                PCI-DSS certified, ISO compliant. Your money and data are protected with top-tier security.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#5f259f] to-[#7c3aed] text-white"
          >
            <p className="text-sm font-bold text-center">Ready to grow your business?</p>
            <p className="text-xs text-center mt-1 text-purple-100">Ask Sarah how to get started!</p>
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
