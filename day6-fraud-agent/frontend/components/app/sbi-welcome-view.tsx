'use client'

import { appConfig } from '@/app-config'
import { Button } from '@/components/livekit/button'
import { ShieldCheck, AlertTriangle, Phone, Lock } from 'lucide-react'

export function SBIWelcomeView({ 
  startButtonText, 
  onStartCall 
}: { 
  startButtonText: string
  onStartCall: () => void 
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#22409A] via-[#1a3278] to-[#0f1f4d] p-6">
      {/* SBI Logo Header */}
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-2xl">
          <ShieldCheck className="h-14 w-14 text-[#22409A]" />
        </div>
        <h1 className="mb-2 text-center text-4xl font-bold text-white">
          {appConfig.companyName}
        </h1>
        <div className="flex items-center gap-2 text-yellow-300">
          <Lock className="h-5 w-5" />
          <p className="text-lg font-semibold">Fraud Detection Department (Demo)</p>
        </div>
      </div>

      {/* Alert Box */}
      <div className="mb-8 w-full max-w-2xl rounded-2xl border-2 border-red-400 bg-red-50 p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-8 w-8 flex-shrink-0 text-red-600" />
          <div>
            <h2 className="mb-2 text-xl font-bold text-red-800">
              Suspicious Activity Detected
            </h2>
            <p className="text-gray-700">
              We have identified potentially fraudulent transaction(s) on your account. 
              Our fraud prevention team needs to verify this activity with you immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="mb-8 grid w-full max-w-2xl gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white/10 p-4 text-center backdrop-blur-sm">
          <div className="mb-2 text-3xl">🔐</div>
          <p className="text-sm font-semibold text-white">Secure</p>
          <p className="text-xs text-blue-200">End-to-end encrypted</p>
        </div>
        <div className="rounded-xl bg-white/10 p-4 text-center backdrop-blur-sm">
          <div className="mb-2 text-3xl">⚡</div>
          <p className="text-sm font-semibold text-white">Instant</p>
          <p className="text-xs text-blue-200">Real-time verification</p>
        </div>
        <div className="rounded-xl bg-white/10 p-4 text-center backdrop-blur-sm">
          <div className="mb-2 text-3xl">🛡️</div>
          <p className="text-sm font-semibold text-white">Protected</p>
          <p className="text-xs text-blue-200">24/7 fraud monitoring</p>
        </div>
      </div>

      {/* Main CTA */}
      <Button
        onClick={onStartCall}
        className="mb-6 h-14 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-8 text-lg font-bold text-gray-900 shadow-2xl transition-all hover:scale-105 hover:from-yellow-300 hover:to-orange-400"
      >
        <Phone className="mr-2 h-6 w-6" />
        {startButtonText}
      </Button>

      {/* Instructions */}
      <div className="w-full max-w-2xl rounded-xl bg-white/10 p-6 backdrop-blur-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <span className="text-2xl">📋</span>
          What to Expect:
        </h3>
        <ol className="space-y-3 text-sm text-blue-100">
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-gray-900">
              1
            </span>
            <span>Our agent will greet you and ask for your registered name</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-gray-900">
              2
            </span>
            <span>You'll be asked a security question to verify your identity</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-gray-900">
              3
            </span>
            <span>We'll share details of the suspicious transaction</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-gray-900">
              4
            </span>
            <span>Confirm if you made this transaction (Yes/No)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-gray-900">
              5
            </span>
            <span>We'll take immediate action to secure your account</span>
          </li>
        </ol>
      </div>

      {/* Security Notice */}
      <div className="mt-6 max-w-2xl rounded-lg bg-yellow-50 p-4 text-center">
        <p className="text-sm text-gray-800">
          <strong className="text-red-700">Important:</strong> SBI will NEVER ask for your complete card number, 
          CVV, PIN, or OTP over any call. This is a demo environment with fake data only.
        </p>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-blue-200">
        <p>© State Bank of India • Trusted Banking Since 1806</p>
        <p className="mt-1 text-xs">
          Available in: English, हिंदी, and 20+ Indian languages
        </p>
      </div>
    </div>
  )
}
