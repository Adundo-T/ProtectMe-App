export type ReportStatus = 'draft' | 'pending' | 'synced';

export type AttachmentMeta = {
  photoUri?: string;
  audioUri?: string;
};

export type Report = {
  id: number;
  title: string;
  description: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  isAnonymous: boolean;
  hasAttachment: boolean;
  attachments?: AttachmentMeta;
};

export type Resource = {
  id: number;
  name: string;
  category: 'Safe House' | 'Medical' | 'Legal' | 'Helpline';
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
  isOpen24h: boolean;
};

export type PendingAlert = {
  id: number;
  createdAt: string;
  phoneNumber: string;
  status: 'pending' | 'resolved';
};

export type SyncState = 'idle' | 'syncing' | 'error';

export type AppState = {
  reports: Report[];
  resources: Resource[];
  pendingAlerts: PendingAlert[];
  syncState: SyncState;
  hasCompletedOnboarding: boolean;
  pinEnabled: boolean;
  biometricEnabled: boolean;
  loading: boolean;
  isAuthenticated: boolean;
};

