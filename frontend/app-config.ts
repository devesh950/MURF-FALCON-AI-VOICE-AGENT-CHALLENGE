export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  startButtonText: string;
  accent?: string;
  logoDark?: string;
  accentDark?: string;

  // for LiveKit Cloud Sandbox
  sandboxId?: string;
  agentName?: string;
}

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'Wellness Companion',
  pageTitle: 'Health & Wellness Voice Companion | Daily Check-ins',
  pageDescription: 'Your supportive daily wellness check-in assistant powered by Murf AI Falcon',

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,

  logo: '/lk-logo.svg',
  accent: '#5f259f', // PharmEasy purple
  logoDark: '/lk-logo-dark.svg',
  accentDark: '#8b5cf6', // Lighter purple for dark mode
  startButtonText: '🌟 Start Daily Check-in',

  // for LiveKit Cloud Sandbox
  sandboxId: undefined,
  agentName: 'Wellness Companion',
};
