import type { Report, Resource, PendingAlert } from '@/types';

// API Configuration
const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.protectme.example.com',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  apiKey: process.env.EXPO_PUBLIC_API_KEY || 'demo-api-key',
};

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface SyncReportRequest {
  id: number;
  title: string;
  description: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SyncReportResponse {
  id: number;
  serverId?: string;
  syncedAt: string;
}

interface SyncAlertRequest {
  id: number;
  phoneNumber: string;
  createdAt: string;
}

// Network utilities
class NetworkUtils {
  static async isConnected(): Promise<boolean> {
    try {
      // For Expo apps, we can use a simple fetch to check connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_CONFIG.baseURL}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.log('Network check failed:', error);
      return false;
    }
  }

  static async waitForConnection(maxWaitMs: number = 10000): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      if (await this.isConnected()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return false;
  }
}

// HTTP Client with retry logic
class HttpClient {
  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = `${API_CONFIG.baseURL}${endpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.apiKey,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error(`API request failed (${endpoint}):`, error);

      // Retry logic for network errors
      if (retryCount < API_CONFIG.retryAttempts && this.isRetryableError(error)) {
        const delay = API_CONFIG.retryDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Retrying request in ${delay}ms (attempt ${retryCount + 1}/${API_CONFIG.retryAttempts})`);
        await this.delay(delay);
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private static isRetryableError(error: any): boolean {
    // Retry on network errors, timeouts, but not on 4xx client errors
    if (error.name === 'AbortError') return true; // Timeout
    if (error.message?.includes('Network request failed')) return true;
    if (error.message?.includes('Failed to fetch')) return true;
    return false;
  }
}

// API Service Class
export class ApiService {
  // Check if backend is available
  static async isBackendAvailable(): Promise<boolean> {
    return NetworkUtils.isConnected();
  }

  // Sync reports to backend
  static async syncReports(reports: SyncReportRequest[]): Promise<{
    synced: number[];
    failed: number[];
    errors: string[];
  }> {
    const synced: number[] = [];
    const failed: number[] = [];
    const errors: string[] = [];

    // Check network first
    if (!(await NetworkUtils.isConnected())) {
      errors.push('No network connection');
      return { synced, failed: reports.map(r => r.id), errors };
    }

    // Process reports in batches to avoid overwhelming the server
    const batchSize = 5;
    for (let i = 0; i < reports.length; i += batchSize) {
      const batch = reports.slice(i, i + batchSize);

      for (const report of batch) {
        try {
          const response = await HttpClient.request<SyncReportResponse>('/reports/sync', {
            method: 'POST',
            body: JSON.stringify(report),
          });

          if (response.success && response.data) {
            synced.push(report.id);
          } else {
            failed.push(report.id);
            errors.push(`Report ${report.id}: ${response.error || 'Unknown error'}`);
          }
        } catch (error) {
          failed.push(report.id);
          errors.push(`Report ${report.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    return { synced, failed, errors };
  }

  // Sync SOS alerts to backend
  static async syncAlerts(alerts: SyncAlertRequest[]): Promise<{
    synced: number[];
    failed: number[];
    errors: string[];
  }> {
    const synced: number[] = [];
    const failed: number[] = [];
    const errors: string[] = [];

    // Check network first
    if (!(await NetworkUtils.isConnected())) {
      errors.push('No network connection');
      return { synced, failed: alerts.map(a => a.id), errors };
    }

    for (const alert of alerts) {
      try {
        const response = await HttpClient.request<{ id: string }>('/alerts/sync', {
          method: 'POST',
          body: JSON.stringify(alert),
        });

        if (response.success) {
          synced.push(alert.id);
        } else {
          failed.push(alert.id);
          errors.push(`Alert ${alert.id}: ${response.error || 'Unknown error'}`);
        }
      } catch (error) {
        failed.push(alert.id);
        errors.push(`Alert ${alert.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { synced, failed, errors };
  }

  // Fetch latest resources from backend
  static async fetchResources(): Promise<{
    resources?: Resource[];
    error?: string;
  }> {
    if (!(await NetworkUtils.isConnected())) {
      return { error: 'No network connection' };
    }

    try {
      const response = await HttpClient.request<Resource[]>('/resources', {
        method: 'GET',
      });

      if (response.success && response.data) {
        return { resources: response.data };
      } else {
        return { error: response.error || 'Failed to fetch resources' };
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Test backend connectivity
  static async testConnection(): Promise<{
    available: boolean;
    latency?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const response = await HttpClient.request('/health', { method: 'GET' });
      const latency = Date.now() - startTime;

      return {
        available: response.success,
        latency,
        error: response.error,
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  }
}

// Export utilities for use in components
export { NetworkUtils };