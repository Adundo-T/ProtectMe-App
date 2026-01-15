import * as Sentry from '@sentry/react-native';
import { getAnalytics, isSupported, logEvent, setUserProperties, setUserId } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getPerformance } from 'firebase/performance';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "protectme-demo.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "protectme-demo",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "protectme-demo.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ABCDEFGHIJ"
};

// Initialize Firebase
let analytics: any = null;
let performance: any = null;

const initializeFirebase = async () => {
  try {
    const app = initializeApp(firebaseConfig);
    const analyticsSupported = await isSupported();
    if (analyticsSupported) {
      analytics = getAnalytics(app);
    } else {
      console.warn('Firebase Analytics is not supported in this environment');
    }
    performance = getPerformance(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
};

// Initialize Firebase asynchronously
initializeFirebase();

// Initialize Sentry
const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN || 'https://your-sentry-dsn@sentry.io/project-id';

// Only initialize Sentry if we have a valid DSN (not the placeholder)
if (sentryDsn && sentryDsn !== 'https://your-sentry-dsn@sentry.io/project-id') {
  Sentry.init({
    dsn: sentryDsn,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: __DEV__ ? 1.0 : 0.1,
    profilesSampleRate: __DEV__ ? 1.0 : 0.1,
    integrations: [
      Sentry.reactNavigationIntegration(),
    ],
    beforeSend: (event) => {
      // Add custom context
      event.tags = {
        ...event.tags,
        device_type: Device.deviceType?.toString(),
        os_version: Device.osVersion,
        app_version: Application.nativeApplicationVersion,
      };

      return event;
    },
  });
} else {
  console.warn('Sentry not initialized: Invalid or missing DSN');
}

// Analytics tracking functions
export const Analytics = {
  // User identification
  setUserId: (userId: string) => {
    if (analytics) {
      setUserId(analytics, userId);
      Sentry.setUser({ id: userId });
    }
  },

  setUserProperties: (properties: Record<string, any>) => {
    if (analytics) {
      setUserProperties(analytics, properties);
      Sentry.setContext('user_properties', properties);
    }
  },

  // Event tracking
  trackEvent: (eventName: string, parameters?: Record<string, any>) => {
    if (analytics) {
      logEvent(analytics, eventName, parameters);
    }

    // Also send to Sentry for correlation
    Sentry.addBreadcrumb({
      category: 'analytics',
      message: eventName,
      data: parameters,
      level: 'info',
    });
  },

  // Screen tracking
  trackScreen: (screenName: string, screenClass?: string) => {
    Analytics.trackEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenClass,
    });
  },

  // App lifecycle events
  trackAppOpen: () => {
    Analytics.trackEvent('app_open');
  },

  trackAppBackground: () => {
    Analytics.trackEvent('app_background');
  },

  // Feature usage
  trackReportCreated: (isAnonymous: boolean, hasAttachments: boolean) => {
    Analytics.trackEvent('report_created', {
      anonymous: isAnonymous,
      has_attachments: hasAttachments,
    });
  },

  trackReportSynced: (success: boolean, duration?: number) => {
    Analytics.trackEvent('report_synced', {
      success,
      duration_ms: duration,
    });
  },

  trackSOSActivated: () => {
    Analytics.trackEvent('sos_activated');
  },

  trackSyncPerformed: (success: boolean, duration: number, itemsSynced: number) => {
    Analytics.trackEvent('sync_performed', {
      success,
      duration_ms: duration,
      items_synced: itemsSynced,
    });
  },

  trackSettingsChanged: (setting: string, value: any) => {
    Analytics.trackEvent('settings_changed', {
      setting,
      value: typeof value === 'boolean' ? value : 'changed',
    });
  },

  // Error tracking
  trackError: (error: Error, context?: Record<string, any>) => {
    Analytics.trackEvent('error_occurred', {
      error_name: error.name,
      error_message: error.message,
      ...context,
    });

    // Sentry will automatically capture errors
    Sentry.captureException(error, {
      tags: context,
    });
  },

  // Performance tracking
  trackApiCall: (endpoint: string, method: string, duration: number, success: boolean) => {
    Analytics.trackEvent('api_call', {
      endpoint,
      method,
      duration_ms: duration,
      success,
    });
  },
};

// Performance monitoring
export const Performance = {
  startTrace: (name: string) => {
    if (performance) {
      return performance.trace(name);
    }
    return null;
  },

  // Custom performance metrics
  measureSyncPerformance: async (operation: () => Promise<any>) => {
    const startTime = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - startTime;

      Analytics.trackSyncPerformed(true, duration, Array.isArray(result) ? result.length : 1);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      Analytics.trackSyncPerformed(false, duration, 0);
      throw error;
    }
  },
};

// Error boundary for React components
export const ErrorBoundary = Sentry.wrap;

// Utility functions
export const getDeviceInfo = () => ({
  deviceType: Device.deviceType,
  deviceName: Device.deviceName,
  osName: Device.osName,
  osVersion: Device.osVersion,
  appVersion: Application.nativeApplicationVersion,
  buildVersion: Application.nativeBuildVersion,
});

export const logAppInfo = () => {
  const deviceInfo = getDeviceInfo();
  console.log('App Info:', deviceInfo);

  Sentry.setContext('device', deviceInfo);
  Sentry.setTag('app_version', deviceInfo.appVersion);
  Sentry.setTag('build_version', deviceInfo.buildVersion);
  Sentry.setTag('os', `${deviceInfo.osName} ${deviceInfo.osVersion}`);
};

// Initialize monitoring on app start
export const initializeMonitoring = () => {
  logAppInfo();
  Analytics.trackAppOpen();
};

// Export Sentry for direct use if needed
export { Sentry };