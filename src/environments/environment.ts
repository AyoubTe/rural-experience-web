export const environment = {
  production: true,
  API_BASE_URL: (window as any).__RXP_ENV__?.API_BASE_URL ?? '/api/v1',
  WS_BASE_URL: (window as any).__RXP_ENV__?.WS_BASE_URL ?? '/ws',
  appVersion: (window as any).__RXP_ENV__?.APP_VERSION ?? 'local',

  // Feature flags
  features: {
    enableGoogleLogin: true,
    enableAnalytics: true,
  },
};
