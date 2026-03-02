import { api } from '../utils/api';

export interface AccessLog {
  id?: string;
  user_id?: string;
  event_type: string;
  ip_address?: string;
  user_agent?: string;
  page_url?: string;
  status?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export const logAccess = async (log: Omit<AccessLog, 'id' | 'created_at'>): Promise<void> => {
  try {
    await api.post('/access-logs', {
      ...log,
      user_agent: navigator.userAgent,
      page_url: log.page_url || window.location.href,
    });
  } catch (err) {
    console.error('Failed to log access:', err);
  }
};

export const logLogin = async (userId: string, status: 'success' | 'failed'): Promise<void> => {
  await logAccess({
    user_id: userId,
    event_type: 'login',
    status,
    metadata: { timestamp: new Date().toISOString() }
  });
};

export const logLogout = async (): Promise<void> => {
  await logAccess({
    event_type: 'logout',
    status: 'success'
  });
};

export const logPageView = async (pageUrl: string): Promise<void> => {
  await logAccess({
    event_type: 'page_view',
    page_url: pageUrl,
    status: 'success'
  });
};

export const logApiCall = async (
  endpoint: string,
  method: string,
  status: 'success' | 'failed',
  metadata?: Record<string, any>
): Promise<void> => {
  await logAccess({
    event_type: 'api_call',
    status,
    metadata: {
      endpoint,
      method,
      ...metadata
    }
  });
};

export const fetchAccessLogs = async (
  userId?: string,
  limit: number = 50,
  eventType?: string
): Promise<AccessLog[]> => {
  return api.get<AccessLog[]>('/access-logs', {
    user_id: userId,
    limit,
    event_type: eventType
  });
};

export const fetchAccessLogStats = async (userId?: string): Promise<{
  total: number;
  byEventType: Record<string, number>;
  byStatus: Record<string, number>;
  recentLogins: number;
}> => {
  return api.get('/access-logs/stats', { user_id: userId });
};
