import React, { useMemo } from 'react';
import { Track } from 'livekit-client';
import { AnimatePresence, motion } from 'motion/react';
import {
  BarVisualizer,
  type TrackReference,
  VideoTrack,
  useLocalParticipant,
  useTracks,
  useVoiceAssistant,
} from '@livekit/components-react';
import { cn } from '@/lib/utils';

const MotionContainer = motion.create('div');

const ANIMATION_TRANSITION = {
  type: 'spring',
  stiffness: 675,
  damping: 75,
  mass: 1,
};

const classNames = {
  // GRID
  // 2 Columns x 3 Rows
  grid: [
    'h-full w-full',
    'grid gap-x-2 place-content-center',
    'grid-cols-[1fr_1fr] grid-rows-[90px_1fr_90px]',
  ],
  // Agent
  // chatOpen: true,
  // hasSecondTile: true
  // layout: Column 1 / Row 1
  // align: x-end y-center
  agentChatOpenWithSecondTile: ['col-start-1 row-start-1', 'self-center justify-self-end'],
  // Agent
  // chatOpen: true,
  // hasSecondTile: false
  // layout: Column 1 / Row 1 / Column-Span 2
  // align: x-center y-center
  agentChatOpenWithoutSecondTile: ['col-start-1 row-start-1', 'col-span-2', 'place-content-center'],
  // Agent
  // chatOpen: false
  // layout: Column 1 / Row 1 / Column-Span 2 / Row-Span 3
  // align: x-center y-center
  agentChatClosed: ['col-start-1 row-start-1', 'col-span-2 row-span-3', 'place-content-center'],
  // Second tile
  // chatOpen: true,
  // hasSecondTile: true
  // layout: Column 2 / Row 1
  // align: x-start y-center
  secondTileChatOpen: ['col-start-2 row-start-1', 'self-center justify-self-start'],
  // Second tile
  // chatOpen: false,
  // hasSecondTile: false
  // layout: Column 2 / Row 2
  // align: x-end y-end
  secondTileChatClosed: ['col-start-2 row-start-3', 'place-content-end'],
};

export function useLocalTrackRef(source: Track.Source) {
  const { localParticipant } = useLocalParticipant();
  const publication = localParticipant.getTrackPublication(source);
  const trackRef = useMemo<TrackReference | undefined>(
    () => (publication ? { source, participant: localParticipant, publication } : undefined),
    [source, publication, localParticipant]
  );
  return trackRef;
}

interface TileLayoutProps {
  chatOpen: boolean;
}

export function TileLayout({ chatOpen }: TileLayoutProps) {
  const {
    state: agentState,
    audioTrack: agentAudioTrack,
    videoTrack: agentVideoTrack,
  } = useVoiceAssistant();
  const [screenShareTrack] = useTracks([Track.Source.ScreenShare]);
  const cameraTrack: TrackReference | undefined = useLocalTrackRef(Track.Source.Camera);

  const isCameraEnabled = cameraTrack && !cameraTrack.publication.isMuted;
  const isScreenShareEnabled = screenShareTrack && !screenShareTrack.publication.isMuted;
  const hasSecondTile = isCameraEnabled || isScreenShareEnabled;

  const animationDelay = chatOpen ? 0 : 0.15;
  const isAvatar = agentVideoTrack !== undefined;
  const videoWidth = agentVideoTrack?.publication.dimensions?.width ?? 0;
  const videoHeight = agentVideoTrack?.publication.dimensions?.height ?? 0;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div className="relative">
        {/* Agent - Fixed Center Position */}
        <div className="flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              {!isAvatar && (
                // Audio Agent - PhonePe Sales Theme
                <MotionContainer
                  key="agent"
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.5,
                    ease: 'easeOut',
                  }}
                  className={cn(
                    'relative aspect-square h-[220px] w-[220px] rounded-[2rem] border-4 transition-all duration-500',
                    'bg-gradient-to-br from-[#5f259f] via-[#7c3aed] to-[#5f259f]',
                    'shadow-[0_0_60px_rgba(95,37,159,0.7)] hover:shadow-[0_0_90px_rgba(95,37,159,0.9)]',
                    'border-white/90 dark:border-purple-300/90 ring-[12px] ring-[#5f259f]/40 dark:ring-purple-500/60',
                    'hover:scale-110 hover:rotate-2'
                  )}
                >
                  {/* Animated Gradient Overlay */}
                  <div className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-tr from-white/25 via-transparent to-purple-200/25 animate-pulse" />
                  
                  {/* PhonePe Logo Background */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-25">
                    <svg viewBox="0 0 100 100" className="h-40 w-40 text-white">
                      <path d="M 35 25 L 35 75 L 42 75 L 42 55 L 60 55 C 70 55 75 50 75 42 C 75 34 70 25 60 25 Z M 42 32 L 58 32 C 66 32 68 37 68 42 C 68 47 66 48 58 48 L 42 48 Z" 
                            fill="currentColor"/>
                      <path d="M 55 58 L 65 68 L 55 78" 
                            stroke="currentColor" 
                            strokeWidth="5" 
                            strokeLinecap="round" 
                            fill="none"/>
                    </svg>
                  </div>

                  {/* Agent Label - PhonePe Sarah */}
                  <div className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#5f259f]/60 blur-xl rounded-full" />
                      <span className="relative text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-[#5f259f] via-[#7c3aed] to-[#5f259f] dark:from-purple-300 dark:via-purple-100 dark:to-purple-200 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border-3 border-[#5f259f] dark:border-purple-500 flex items-center gap-2">
                        <span className="text-2xl">💬</span>
                        <span>Sarah - PhonePe Sales</span>
                        <span className="text-2xl">🚀</span>
                      </span>
                    </div>
                  </div>

                  {/* Voice Visualizer - Larger Bars */}
                  <BarVisualizer
                    barCount={7}
                    state={agentState}
                    options={{ minHeight: 8 }}
                    trackRef={agentAudioTrack}
                    className={cn('flex h-full items-center justify-center gap-2 relative z-10')}
                  >
                    <span
                      className={cn([
                        'min-h-4 w-4 rounded-full',
                        'origin-center transition-all duration-250 ease-linear',
                        'bg-white/50',
                        'data-[lk-highlighted=true]:bg-white data-[lk-highlighted=true]:shadow-2xl data-[lk-highlighted=true]:shadow-white/70 data-[lk-highlighted=true]:scale-110',
                        'data-[lk-muted=true]:bg-white/30',
                      ])}
                    />
                  </BarVisualizer>

                  {/* Status Indicator - Enhanced & More Prominent */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
                    <div className={cn(
                      'h-5 w-5 rounded-full border-4 border-white shadow-2xl transition-all duration-300',
                      agentState === 'speaking' && 'bg-green-500 animate-pulse shadow-green-500/70 scale-110',
                      agentState === 'listening' && 'bg-blue-500 animate-pulse shadow-blue-500/70 scale-110',
                      agentState === 'thinking' && 'bg-yellow-500 animate-bounce shadow-yellow-500/70 scale-110',
                      agentState === 'idle' && 'bg-gray-400 shadow-gray-400/50'
                    )} />
                    <span className={cn(
                      'text-sm font-black text-white px-4 py-2 rounded-full backdrop-blur-md shadow-2xl transition-all duration-300 border-2',
                      agentState === 'speaking' && 'bg-green-500/90 border-green-300 animate-pulse',
                      agentState === 'listening' && 'bg-blue-500/90 border-blue-300 animate-pulse',
                      agentState === 'thinking' && 'bg-yellow-500/90 border-yellow-300 animate-bounce',
                      agentState === 'idle' && 'bg-gray-500/80 border-gray-300'
                    )}>
                      {agentState === 'speaking' && '🗣️ Speaking'}
                      {agentState === 'listening' && '👂 Listening'}
                      {agentState === 'thinking' && '💭 Thinking...'}
                      {agentState === 'idle' && '💤 Ready'}
                    </span>
                  </div>
                </MotionContainer>
              )}

              {isAvatar && (
                // Avatar Agent
                <MotionContainer
                  key="avatar"
                  layoutId="avatar"
                  initial={{
                    scale: 1,
                    opacity: 1,
                    maskImage:
                      'radial-gradient(circle, rgba(0, 0, 0, 1) 0, rgba(0, 0, 0, 1) 20px, transparent 20px)',
                    filter: 'blur(20px)',
                  }}
                  animate={{
                    maskImage:
                      'radial-gradient(circle, rgba(0, 0, 0, 1) 0, rgba(0, 0, 0, 1) 500px, transparent 500px)',
                    filter: 'blur(0px)',
                    borderRadius: chatOpen ? 6 : 12,
                  }}
                  transition={{
                    ...ANIMATION_TRANSITION,
                    delay: animationDelay,
                    maskImage: {
                      duration: 1,
                    },
                    filter: {
                      duration: 1,
                    },
                  }}
                  className={cn(
                    'overflow-hidden bg-black drop-shadow-xl/80',
                    chatOpen ? 'h-[90px]' : 'h-auto w-full'
                  )}
                >
                  <VideoTrack
                    width={videoWidth}
                    height={videoHeight}
                    trackRef={agentVideoTrack}
                    className={cn(chatOpen && 'size-[90px] object-cover')}
                  />
                </MotionContainer>
              )}
            </AnimatePresence>
        </div>
      </div>

      {/* Camera & Screen Share - Bottom Right Corner */}
      <div className="absolute bottom-8 right-8 z-60">
        <AnimatePresence>
              {((cameraTrack && isCameraEnabled) || (screenShareTrack && isScreenShareEnabled)) && (
                <MotionContainer
                  key="camera"
                  layout="position"
                  layoutId="camera"
                  initial={{
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{
                    ...ANIMATION_TRANSITION,
                    delay: animationDelay,
                  }}
                  className="drop-shadow-lg/20"
                >
                  <VideoTrack
                    trackRef={cameraTrack || screenShareTrack}
                    width={(cameraTrack || screenShareTrack)?.publication.dimensions?.width ?? 0}
                    height={(cameraTrack || screenShareTrack)?.publication.dimensions?.height ?? 0}
                    className="bg-muted aspect-square w-[90px] rounded-md object-cover"
                  />
                </MotionContainer>
              )}
        </AnimatePresence>
      </div>
    </div>
  );
}
