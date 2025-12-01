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
                // Audio Agent - Wellness Themed - Beautiful Center Display
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
                    'relative aspect-square h-[200px] w-[200px] rounded-[2rem] border-4 transition-all duration-500',
                    'bg-gradient-to-br from-purple-500 via-purple-600 to-teal-600',
                    'shadow-[0_0_60px_rgba(168,85,247,0.6)] hover:shadow-[0_0_80px_rgba(168,85,247,0.8)]',
                    'border-white/80 dark:border-purple-300/80 ring-[10px] ring-purple-400/40 dark:ring-purple-500/60',
                    'hover:scale-110 hover:rotate-3'
                  )}
                >
                  {/* Animated Gradient Overlay */}
                  <div className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-tr from-white/20 via-transparent to-teal-300/20 animate-pulse" />
                  
                  {/* Wellness Heart Icon Background */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <svg viewBox="0 0 64 64" className="h-32 w-32 text-white animate-pulse">
                      <path
                        d="M32 52c-1 0-2-1-2-1-8-8-16-16-16-24 0-6 4-10 10-10 3 0 6 2 8 4 2-2 5-4 8-4 6 0 10 4 10 10 0 8-8 16-16 24 0 0-1 1-2 1z"
                        fill="currentColor"
                      />
                      <circle cx="20" cy="24" r="2.5" fill="currentColor" opacity="0.9" />
                      <circle cx="44" cy="24" r="2.5" fill="currentColor" opacity="0.9" />
                      <circle cx="32" cy="16" r="1.5" fill="currentColor" opacity="0.7" />
                    </svg>
                  </div>

                  {/* Agent Label - More Prominent */}
                  <div className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-500/50 blur-xl rounded-full" />
                      <span className="relative text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-purple-800 to-teal-600 dark:from-purple-300 dark:via-purple-100 dark:to-teal-300 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border-3 border-purple-400 dark:border-purple-500 flex items-center gap-2">
                        <span className="text-2xl">🌟</span>
                        <span>Wellness Companion</span>
                        <span className="text-2xl">💜</span>
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

                  {/* Status Indicator - Larger & More Visible */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <div className={cn(
                      'h-4 w-4 rounded-full border-3 border-white shadow-lg',
                      agentState === 'speaking' && 'bg-green-400 animate-pulse shadow-green-400/50',
                      agentState === 'listening' && 'bg-blue-400 animate-pulse shadow-blue-400/50',
                      agentState === 'thinking' && 'bg-yellow-400 animate-pulse shadow-yellow-400/50',
                      agentState === 'idle' && 'bg-gray-400'
                    )} />
                    <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                      {agentState === 'speaking' && '🗣️ Speaking'}
                      {agentState === 'listening' && '👂 Listening'}
                      {agentState === 'thinking' && '💭 Thinking'}
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
