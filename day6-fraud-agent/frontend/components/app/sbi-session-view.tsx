'use client'

import { AlertTriangle, Shield, CheckCircle, XCircle, Phone, Mic, Brain, Volume2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRoomContext, useVoiceAssistant } from '@livekit/components-react'
import { useSession } from './session-provider'
import { ChatTranscript } from './chat-transcript'
import { AgentControlBar } from '@/components/livekit/agent-control-bar/agent-control-bar'

interface SBISessionViewProps {
  appConfig: any
  onAnimationComplete?: () => void
}

export function SBISessionView({ 
  appConfig,
  onAnimationComplete 
}: SBISessionViewProps) {
  const room = useRoomContext()
  const { endSession } = useSession()
  const { state: agentState } = useVoiceAssistant()
  
  // Get chat messages and agent state from LiveKit hooks
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; message: string; timestamp: number }>>([])
  const [callDuration, setCallDuration] = useState(0)
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending')

  const handleDisconnect = () => {
    endSession()
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Check verification status from chat messages
  useEffect(() => {
    const lastMessage = chatMessages[chatMessages.length - 1]
    if (lastMessage?.role === 'assistant') {
      const msg = lastMessage.message.toLowerCase()
      if (msg.includes('verified') || msg.includes('correct')) {
        setVerificationStatus('verified')
      } else if (msg.includes('verification failed') || msg.includes('incorrect')) {
        setVerificationStatus('failed')
      }
    }
  }, [chatMessages])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-br from-[#22409A] via-[#1a3278] to-[#0f1f4d]">
      {/* Header */}
      <div className="border-b border-white/20 bg-white/10 p-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <Shield className="h-7 w-7 text-[#22409A]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SBI Fraud Detection</h1>
              <p className="text-sm text-blue-200">Secure Verification Call</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Call Duration */}
            <div className="flex items-center gap-2 text-white">
              <Phone className="h-5 w-5 animate-pulse text-green-400" />
              <span className="font-mono text-lg">{formatDuration(callDuration)}</span>
            </div>

            {/* Verification Status Badge */}
            {verificationStatus === 'pending' && (
              <div className="flex items-center gap-2 rounded-full bg-yellow-500/20 px-4 py-2 text-yellow-300">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-semibold">Verification Pending</span>
              </div>
            )}
            {verificationStatus === 'verified' && (
              <div className="flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2 text-green-300">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-semibold">Verified</span>
              </div>
            )}
            {verificationStatus === 'failed' && (
              <div className="flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-2 text-red-300">
                <XCircle className="h-5 w-5" />
                <span className="text-sm font-semibold">Verification Failed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Info & Status */}
        <div className="w-80 border-r border-white/20 bg-white/5 p-6 backdrop-blur-sm">
          <div className="space-y-6">
            {/* Security Notice */}
            <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 flex-shrink-0 text-red-400" />
                <div>
                  <h3 className="mb-1 font-bold text-red-300">Security Alert</h3>
                  <p className="text-xs text-red-200">
                    Suspicious transaction detected on your account
                  </p>
                </div>
              </div>
            </div>

            {/* Call Progress */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">Verification Steps:</h3>
              <div className="space-y-2">
                <ProgressStep 
                  number={1} 
                  text="Identity Verification" 
                  status={verificationStatus === 'pending' ? 'active' : verificationStatus === 'verified' ? 'complete' : 'failed'}
                />
                <ProgressStep 
                  number={2} 
                  text="Transaction Review" 
                  status={verificationStatus === 'verified' ? 'active' : 'pending'}
                />
                <ProgressStep 
                  number={3} 
                  text="Case Resolution" 
                  status="pending"
                />
              </div>
            </div>

            {/* Important Reminders */}
            <div className="rounded-xl bg-yellow-500/10 p-4 border border-yellow-500/30">
              <h3 className="mb-2 text-sm font-bold text-yellow-300">Remember:</h3>
              <ul className="space-y-1 text-xs text-yellow-200">
                <li>✓ Never share complete card number</li>
                <li>✓ Never share CVV or PIN</li>
                <li>✓ Never share OTP codes</li>
                <li>✓ Only answer security questions</li>
              </ul>
            </div>

            {/* Agent Status */}
            <div className="rounded-xl bg-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${
                  agentState === 'speaking' ? 'bg-green-400 animate-pulse' : 
                  agentState === 'listening' ? 'bg-blue-400 animate-pulse' :
                  agentState === 'thinking' ? 'bg-yellow-400 animate-pulse' :
                  'bg-gray-400'
                }`} />
                <div>
                  <p className="text-xs text-blue-200">Agent Status</p>
                  <p className="text-sm font-semibold text-white">
                    {agentState === 'speaking' ? 'Speaking...' : 
                     agentState === 'listening' ? 'Listening...' :
                     agentState === 'thinking' ? 'Thinking...' :
                     'Idle'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Chat Transcript */}
        <div className="flex flex-1 flex-col relative">
          <div className="flex-1 overflow-hidden p-6">
            <ChatTranscript messages={chatMessages} />
          </div>

          {/* Center Status Indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <AgentStatusIndicator state={agentState} />
          </div>

          {/* Control Bar */}
          <div className="border-t border-white/20 bg-white/5 p-4 backdrop-blur-sm">
            <AgentControlBar onDisconnect={handleDisconnect} />
          </div>
        </div>

        {/* Right Panel - Help & Support */}
        <div className="w-64 border-l border-white/20 bg-white/5 p-6 backdrop-blur-sm">
          <div className="space-y-4">
            <div>
              <h3 className="mb-3 text-sm font-bold text-white">Need Help?</h3>
              <div className="space-y-2 text-xs text-blue-200">
                <p>📞 Customer Care: 1800 1234</p>
                <p>🌐 www.onlinesbi.com</p>
                <p>📧 care@sbi.co.in</p>
              </div>
            </div>

            <div className="rounded-lg bg-white/10 p-3">
              <h4 className="mb-2 text-xs font-bold text-white">Quick Tips:</h4>
              <ul className="space-y-1 text-xs text-blue-200">
                <li>• Speak clearly</li>
                <li>• Answer yes or no</li>
                <li>• Take your time</li>
                <li>• Ask to repeat if needed</li>
              </ul>
            </div>

            <div className="rounded-lg bg-blue-500/10 p-3 border border-blue-500/30">
              <p className="text-xs text-blue-200">
                This call is recorded for quality and security purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProgressStep({ 
  number, 
  text, 
  status 
}: { 
  number: number
  text: string
  status: 'pending' | 'active' | 'complete' | 'failed'
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold
        ${status === 'complete' ? 'bg-green-500 text-white' : 
          status === 'active' ? 'bg-yellow-500 text-gray-900 animate-pulse' : 
          status === 'failed' ? 'bg-red-500 text-white' :
          'bg-white/20 text-white'}`}
      >
        {status === 'complete' ? '✓' : status === 'failed' ? '✗' : number}
      </div>
      <span className={`text-sm ${status === 'active' ? 'text-white font-semibold' : 'text-blue-200'}`}>
        {text}
      </span>
    </div>
  )
}

function AgentStatusIndicator({ state }: { state: string }) {
  const getStateConfig = () => {
    switch (state) {
      case 'listening':
        return {
          icon: Mic,
          text: 'Listening',
          color: 'bg-blue-500',
          ringColor: 'ring-blue-400',
          textColor: 'text-blue-100',
          glowColor: 'shadow-blue-500/50',
          animation: 'animate-pulse'
        }
      case 'thinking':
        return {
          icon: Brain,
          text: 'Thinking',
          color: 'bg-yellow-500',
          ringColor: 'ring-yellow-400',
          textColor: 'text-yellow-100',
          glowColor: 'shadow-yellow-500/50',
          animation: 'animate-bounce'
        }
      case 'speaking':
        return {
          icon: Volume2,
          text: 'Speaking',
          color: 'bg-green-500',
          ringColor: 'ring-green-400',
          textColor: 'text-green-100',
          glowColor: 'shadow-green-500/50',
          animation: 'animate-pulse'
        }
      case 'connecting':
        return {
          icon: Shield,
          text: 'Connecting',
          color: 'bg-purple-500',
          ringColor: 'ring-purple-400',
          textColor: 'text-purple-100',
          glowColor: 'shadow-purple-500/50',
          animation: 'animate-spin'
        }
      default:
        return {
          icon: Shield,
          text: 'Waiting',
          color: 'bg-gray-500',
          ringColor: 'ring-gray-400',
          textColor: 'text-gray-100',
          glowColor: 'shadow-gray-500/50',
          animation: ''
        }
    }
  }

  const config = getStateConfig()
  const Icon = config.icon

  return (
    <div className="flex flex-col items-center gap-4 z-10">
      {/* Main Status Circle */}
      <div className="relative">
        <div className={`flex h-32 w-32 items-center justify-center rounded-full ${config.color} ${config.animation} shadow-2xl ${config.glowColor} ring-8 ${config.ringColor} ring-opacity-50`}>
          <Icon className="h-16 w-16 text-white" strokeWidth={2.5} />
        </div>
        
        {/* Outer pulse rings */}
        {(state === 'listening' || state === 'speaking' || state === 'thinking') && (
          <>
            <div className={`absolute inset-0 rounded-full ${config.color} opacity-40 ${config.animation}`} style={{ animationDelay: '200ms', transform: 'scale(1.2)' }} />
            <div className={`absolute inset-0 rounded-full ${config.color} opacity-20 ${config.animation}`} style={{ animationDelay: '400ms', transform: 'scale(1.4)' }} />
          </>
        )}
      </div>
      
      {/* Status Text */}
      <div className={`rounded-full bg-black/70 px-8 py-3 backdrop-blur-md border-2 ${config.ringColor} border-opacity-50`}>
        <p className={`text-2xl font-bold ${config.textColor} tracking-wide`}>
          {config.text}
        </p>
      </div>

      {/* Additional hint text for active states */}
      {state === 'listening' && (
        <p className="text-sm text-blue-200 bg-black/50 px-4 py-1 rounded-full">
          🎤 Speak now...
        </p>
      )}
      {state === 'thinking' && (
        <p className="text-sm text-yellow-200 bg-black/50 px-4 py-1 rounded-full">
          🧠 Processing...
        </p>
      )}
      {state === 'speaking' && (
        <p className="text-sm text-green-200 bg-black/50 px-4 py-1 rounded-full">
          🔊 Agent is speaking...
        </p>
      )}
    </div>
  )
}
