import { supabase } from '../utils/supabase';

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
    const { data: { user } } = await supabase.auth.getUser();

    const logEntry = {
      ...log,
      user_id: user?.id || log.user_id,
      user_agent: navigator.userAgent,
      page_url: log.page_url || window.location.href,
    };

    const { error } = await supabase
      .from('access_logs')
      .insert(logEntry);

    if (error) {
      console.error('Error logging access:', error);
    }
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
  let query = supabase
    .from('access_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  if (eventType) {
    query = query.eq('event_type', eventType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching access logs:', error);
    throw error;
  }

  return data || [];
};

export const fetchAccessLogStats = async (userId?: string): Promise<{
  total: number;
  byEventType: Record<string, number>;
  byStatus: Record<string, number>;
  recentLogins: number;
}> => {
  let query = supabase.from('access_logs').select('event_type, status, created_at');

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching access log stats:', error);
    throw error;
  }

  const stats = {
    total: data?.length || 0,
    byEventType: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    recentLogins: 0
  };

  if (data) {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    data.forEach(log => {
      stats.byEventType[log.event_type] = (stats.byEventType[log.event_type] || 0) + 1;
      stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;

      if (log.event_type === 'login' && new Date(log.created_at) > oneDayAgo) {
        stats.recentLogins++;
      }
    });
  }

  return stats;
};
