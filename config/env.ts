/**
 * Environment Configuration
 * Centralizes all environment variable access with type safety
 */

import Constants from 'expo-constants';

interface EnvConfig {
  env: 'development' | 'staging' | 'production';
  apiUrl: string;
  apiTimeout: number;
  maxRetries: number;
  debug: boolean;
  google: {
    androidClientId: string;
    webClientId: string;
    iosClientId: string;
  };
  facebook: {
    appId: string;
  };
  sentry: {
    dsn: string;
  };
  analytics: {
    id: string;
  };
}

const getEnvVar = (key: string, fallback: string = ''): string => {
  return Constants.expoConfig?.extra?.[key] || process.env[key] || fallback;
};

const config: EnvConfig = {
  env: getEnvVar('EXPO_PUBLIC_ENV', 'development') as EnvConfig['env'],
  apiUrl: getEnvVar('EXPO_PUBLIC_API_URL', 'http://localhost:3000'),
  apiTimeout: parseInt(getEnvVar('EXPO_PUBLIC_API_TIMEOUT', '30000'), 10),
  maxRetries: parseInt(getEnvVar('EXPO_PUBLIC_MAX_RETRIES', '3'), 10),
  debug: getEnvVar('EXPO_PUBLIC_DEBUG', 'false') === 'true',
  google: {
    androidClientId: getEnvVar('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'),
    webClientId: getEnvVar('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'),
    iosClientId: getEnvVar('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'),
  },
  facebook: {
    appId: getEnvVar('EXPO_PUBLIC_FACEBOOK_APP_ID'),
  },
  sentry: {
    dsn: getEnvVar('EXPO_PUBLIC_SENTRY_DSN'),
  },
  analytics: {
    id: getEnvVar('EXPO_PUBLIC_ANALYTICS_ID'),
  },
};

// Validate required environment variables
const validateConfig = (): void => {
  const requiredVars = [
    'apiUrl',
    'google.androidClientId',
    'google.webClientId',
    'facebook.appId',
  ];

  const missing: string[] = [];

  requiredVars.forEach((key) => {
    const keys = key.split('.');
    let value: any = config;
    for (const k of keys) {
      value = value[k];
    }
    if (!value) {
      missing.push(key);
    }
  });

  if (missing.length > 0 && config.env !== 'development') {
    console.warn(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
};

if (config.debug) {
  validateConfig();
}

export default config;