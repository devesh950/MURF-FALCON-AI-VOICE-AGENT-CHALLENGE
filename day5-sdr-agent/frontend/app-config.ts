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
  companyName: 'PhonePe',
  pageTitle: 'PhonePe Sales Hub | Talk to Sarah, Your Payment Expert',
  pageDescription: 'Discover PhonePe payment solutions with our AI sales assistant powered by Murf AI Falcon',

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,

  logo: '/lk-logo.svg',
  accent: '#5f259f', // PhonePe purple
  logoDark: '/lk-logo-dark.svg',
  accentDark: '#7c3aed', // Lighter purple for dark mode
  startButtonText: '💬 Talk to Sarah',

  // for LiveKit Cloud Sandbox
  sandboxId: undefined,
  agentName: 'PhonePe SDR Agent',
};
