import { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert, Linking } from 'react-native';
import { Analytics, Performance, initializeMonitoring } from '@/services/monitoring';
import {
  deleteReport as deleteReportFromDb,
  getPendingAlerts,
  getReports,
  getReportById,
  getResources,
  initializeDatabase,
  logPendingAlert,
  saveReport,
  updateReportStatus,
  updateAlertStatus,
} from '@/services/database';
import { ApiService } from '../services/api';
import type { AppState, ReportStatus, Report } from '@/types';

type AppContextValue = AppState & {
  actions: {
    createReport: (payload: { title: string; description: string; isAnonymous: boolean; mediaAttachments?: any[] }) => Promise<void>;
    saveDraft: (payload: { id?: number; title: string; description: string; isAnonymous: boolean; mediaAttachments?: any[] }) => Promise<void>;
    deleteReport: (id: number) => Promise<void>;
    markSynced: (id: number) => Promise<void>;
    triggerSOS: () => Promise<void>;
    syncNow: () => Promise<void>;
    completeOnboarding: () => Promise<void>;
    togglePinLock: () => Promise<void>;
    toggleBiometric: () => Promise<void>;
    loadReportForEdit: (id: number) => Promise<Report | undefined>;
    signIn: () => Promise<void>;
  };
};

const STORAGE_KEYS = {
  onboarding: '@protectme/onboarding-complete',
  pinEnabled: '@protectme/pin-enabled',
  biometricEnabled: '@protectme/biometric-enabled',
  authenticated: '@protectme/authenticated',
};

const SOS_NUMBER = '112';

const initialState: AppState = {
  reports: [],
  resources: [],
  pendingAlerts: [],
  syncState: 'idle',
  hasCompletedOnboarding: false,
  pinEnabled: false,
  biometricEnabled: false,
  loading: true,
  isAuthenticated: false,
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  // Initialize monitoring
  useEffect(() => {
    initializeMonitoring();
  }, []);

  useEffect(() => {
    (async () => {
      await initializeDatabase();
      const [reports, resources, pendingAlerts] = await Promise.all([getReports(), getResources(), getPendingAlerts()]);
      const [[, onboardingValue], [, pinValue], [, biometricValue], [, authenticatedValue]] = await AsyncStorage.multiGet([
        STORAGE_KEYS.onboarding,
        STORAGE_KEYS.pinEnabled,
        STORAGE_KEYS.biometricEnabled,
        STORAGE_KEYS.authenticated,
      ]);

      setState((prev) => ({
        ...prev,
        reports,
        resources,
        pendingAlerts,
        hasCompletedOnboarding: onboardingValue === 'true',
        pinEnabled: pinValue === 'true',
        biometricEnabled: biometricValue === 'true',
        isAuthenticated: authenticatedValue === 'true',
        loading: false,
      }));
    })();
  }, []);

  const refreshReports = async () => {
    const reports = await getReports();
    setState((prev) => ({ ...prev, reports }));
  };

  const refreshAlerts = async () => {
    const pendingAlerts = await getPendingAlerts();
    setState((prev) => ({ ...prev, pendingAlerts }));
  };

  const refreshResources = async () => {
    const resources = await getResources();
    setState((prev) => ({ ...prev, resources }));
  };

  const createOrUpdateReport = async (
    payload: { id?: number; title: string; description: string; isAnonymous: boolean; mediaAttachments?: any[] },
    status: ReportStatus,
  ) => {
    await saveReport({
      id: payload.id,
      title: payload.title,
      description: payload.description,
      status,
      isAnonymous: payload.isAnonymous,
    });
    const hasAttachments = Boolean(payload.mediaAttachments && payload.mediaAttachments.length > 0);
    Analytics.trackReportCreated(payload.isAnonymous, hasAttachments);
    await refreshReports();
  };

  const actions: AppContextValue['actions'] = {
    createReport: async ({ title, description, isAnonymous, mediaAttachments }) => {
      // Input validation
      if (!title || title.trim().length === 0) {
        throw new Error('Report title is required');
      }
      if (!description || description.trim().length === 0) {
        throw new Error('Report description is required');
      }
      if (title.length > 200) {
        throw new Error('Report title must be 200 characters or less');
      }
      if (description.length > 2000) {
        throw new Error('Report description must be 2000 characters or less');
      }
      await createOrUpdateReport({ title: title.trim(), description: description.trim(), isAnonymous, mediaAttachments }, 'pending');
    },
    saveDraft: async ({ id, title, description, isAnonymous, mediaAttachments }) => {
      await createOrUpdateReport({ id, title, description, isAnonymous, mediaAttachments }, 'draft');
    },
    deleteReport: async (id: number) => {
      await deleteReportFromDb(id);
      await refreshReports();
    },
    markSynced: async (id: number) => {
      await updateReportStatus(id, 'synced');
      await refreshReports();
    },
    triggerSOS: async () => {
      Analytics.trackSOSActivated();
      await logPendingAlert(SOS_NUMBER);
      await refreshAlerts();
      const supported = await Linking.canOpenURL(`tel:${SOS_NUMBER}`);
      if (supported) {
        await Linking.openURL(`tel:${SOS_NUMBER}`);
      } else {
        Alert.alert('Unable to place call', `Please dial ${SOS_NUMBER} manually.`);
      }
    },
    syncNow: async () => {
      if (state.syncState === 'syncing') return;
      setState((prev) => ({ ...prev, syncState: 'syncing' }));
      try {
        const syncResult = await Performance.measureSyncPerformance(async () => {
          // Check backend availability
          if (!(await ApiService.isBackendAvailable())) {
            throw new Error('No network connection');
          }

          // Sync reports
          const pendingReports = state.reports.filter((report) => report.status === 'pending');
          if (pendingReports.length > 0) {
            const reportsToSync = pendingReports.map((r) => ({
              id: r.id,
              title: r.title,
              description: r.description,
              isAnonymous: r.isAnonymous,
              createdAt: r.createdAt,
              updatedAt: r.updatedAt,
            }));
            const reportResult = await ApiService.syncReports(reportsToSync);
            await Promise.all(reportResult.synced.map((id) => updateReportStatus(id, 'synced')));
          }

          // Sync alerts
          const pendingAlerts = state.pendingAlerts.filter((alert) => alert.status === 'pending');
          if (pendingAlerts.length > 0) {
            const alertsToSync = pendingAlerts.map((a) => ({
              id: a.id,
              phoneNumber: a.phoneNumber,
              createdAt: a.createdAt,
            }));
            const alertResult = await ApiService.syncAlerts(alertsToSync);
            await Promise.all(alertResult.synced.map((id) => updateAlertStatus(id, 'resolved')));
          }

          // Fetch latest resources
          const resourceResult = await ApiService.fetchResources();
          if (resourceResult.resources) {
            await refreshResources();
          }

          await refreshReports();
          await refreshAlerts();
        });

        setState((prev) => ({ ...prev, syncState: 'idle' }));
      } catch (error) {
        console.error(error);
        setState((prev) => ({ ...prev, syncState: 'error' }));
      }
    },
    completeOnboarding: async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.onboarding, 'true');
      setState((prev) => ({ ...prev, hasCompletedOnboarding: true }));
    },
    togglePinLock: async () => {
      const next = !state.pinEnabled;
      await AsyncStorage.setItem(STORAGE_KEYS.pinEnabled, next ? 'true' : 'false');
      setState((prev) => ({ ...prev, pinEnabled: next }));
      Analytics.trackSettingsChanged('pin_lock', next);
    },
    toggleBiometric: async () => {
      if (!state.biometricEnabled) {
        const hardware = await LocalAuthentication.hasHardwareAsync();
        if (!hardware) {
          Alert.alert('Biometric unavailable', 'Your device does not support biometric authentication.');
          return;
        }
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!enrolled) {
          Alert.alert('Biometric unavailable', 'Please enroll a fingerprint or face ID first.');
          return;
        }
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Enable biometric lock',
          cancelLabel: 'Cancel',
        });
        if (!result.success) {
          return;
        }
      }
      const next = !state.biometricEnabled;
      await AsyncStorage.setItem(STORAGE_KEYS.biometricEnabled, next ? 'true' : 'false');
      setState((prev) => ({ ...prev, biometricEnabled: next }));
      Analytics.trackSettingsChanged('biometric_lock', next);
    },
    loadReportForEdit: async (id: number) => {
      const report = await getReportById(id);
      return report;
    },
    signIn: async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.authenticated, 'true');
      setState((prev) => ({ ...prev, isAuthenticated: true }));
    },
  };

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      actions,
    }),
    [state],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}