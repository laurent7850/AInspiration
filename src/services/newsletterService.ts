import { api } from '../utils/api';
import { NewsletterSubscriber, Newsletter, NewsletterSendLog } from '../utils/types';

// Proxy backend — les webhooks n8n sont appelés via le serveur Express
// Le backend forwarde vers n8n: https://n8n.srv767464.hstgr.cloud/webhook/
const NEWSLETTER_WEBHOOK_URL = '/api/webhook/newsletter-send';
const NEWSLETTER_GENERATE_URL = '/api/webhook/newsletter-generate';

// ==================== SUBSCRIBER MANAGEMENT ====================

export const getSubscribers = async (status?: string): Promise<NewsletterSubscriber[]> => {
  return api.get<NewsletterSubscriber[]>('/newsletter-subscribers', {
    status: status || undefined
  });
};

export const getActiveSubscribers = async (): Promise<NewsletterSubscriber[]> => {
  return getSubscribers('active');
};

export const getSubscriberByEmail = async (email: string): Promise<NewsletterSubscriber | null> => {
  try {
    return await api.get<NewsletterSubscriber>('/newsletter-subscribers/by-email', {
      email: email.toLowerCase()
    });
  } catch {
    return null;
  }
};

export const getSubscriberByToken = async (token: string): Promise<NewsletterSubscriber | null> => {
  try {
    return await api.get<NewsletterSubscriber>('/newsletter-subscribers/by-token', {
      token
    });
  } catch {
    return null;
  }
};

export const addSubscriber = async (email: string, source: string = 'website'): Promise<NewsletterSubscriber> => {
  return api.post<NewsletterSubscriber>('/newsletter-subscribers', {
    email: email.toLowerCase().trim(),
    source
  });
};

export const unsubscribe = async (token: string): Promise<boolean> => {
  try {
    await api.post('/newsletter-subscribers/unsubscribe', { token });
    return true;
  } catch {
    return false;
  }
};

export const deleteSubscriber = async (id: string): Promise<void> => {
  await api.delete(`/newsletter-subscribers/${id}`);
};

// ==================== NEWSLETTER MANAGEMENT ====================

export const getNewsletters = async (): Promise<Newsletter[]> => {
  return api.get<Newsletter[]>('/newsletters');
};

export const getNewsletterById = async (id: string): Promise<Newsletter | null> => {
  try {
    return await api.get<Newsletter>(`/newsletters/${id}`);
  } catch {
    return null;
  }
};

export const createNewsletter = async (newsletter: Partial<Newsletter>): Promise<Newsletter> => {
  return api.post<Newsletter>('/newsletters', {
    subject: newsletter.subject || '',
    content: newsletter.content || '',
    html_content: newsletter.html_content,
    status: newsletter.status || 'draft',
    scheduled_at: newsletter.scheduled_at
  });
};

export const updateNewsletter = async (id: string, updates: Partial<Newsletter>): Promise<Newsletter> => {
  return api.put<Newsletter>(`/newsletters/${id}`, updates);
};

export const deleteNewsletter = async (id: string): Promise<void> => {
  await api.delete(`/newsletters/${id}`);
};

// ==================== NEWSLETTER SENDING ====================

export const sendNewsletter = async (newsletterId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const newsletter = await getNewsletterById(newsletterId);
    if (!newsletter) {
      return { success: false, message: 'Newsletter non trouvée' };
    }

    const subscribers = await getActiveSubscribers();
    if (subscribers.length === 0) {
      return { success: false, message: 'Aucun abonné actif' };
    }

    // Send to n8n webhook for processing
    const response = await fetch(NEWSLETTER_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newsletter: {
          id: newsletter.id,
          subject: newsletter.subject,
          content: newsletter.content,
          html_content: newsletter.html_content
        },
        subscribers: subscribers.map(s => ({
          id: s.id,
          email: s.email,
          unsubscribe_token: s.unsubscribe_token
        })),
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur webhook: ${response.status}`);
    }

    // Update newsletter status
    await updateNewsletter(newsletterId, {
      status: 'sent',
      sent_at: new Date().toISOString(),
      recipients_count: subscribers.length
    });

    return {
      success: true,
      message: `Newsletter envoyée à ${subscribers.length} abonnés`
    };
  } catch (error) {
    console.error('Error sending newsletter:', error);

    await updateNewsletter(newsletterId, { status: 'failed' });

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur lors de l\'envoi'
    };
  }
};

export const scheduleNewsletter = async (
  newsletterId: string,
  scheduledAt: Date
): Promise<Newsletter> => {
  return updateNewsletter(newsletterId, {
    status: 'scheduled',
    scheduled_at: scheduledAt.toISOString()
  });
};

// ==================== AI CONTENT GENERATION ====================

export const generateNewsletterContent = async (topic?: string): Promise<{ subject: string; content: string }> => {
  try {
    const response = await fetch(NEWSLETTER_GENERATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: topic || 'latest AI trends and tips for businesses',
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur génération: ${response.status}`);
    }

    const data = await response.json();
    return {
      subject: data.subject || 'Newsletter AInspiration',
      content: data.content || ''
    };
  } catch (error) {
    console.error('Error generating newsletter content:', error);
    throw error;
  }
};

// ==================== STATISTICS ====================

export const getNewsletterStats = async (): Promise<{
  totalSubscribers: number;
  activeSubscribers: number;
  unsubscribedCount: number;
  totalNewsletters: number;
  sentNewsletters: number;
}> => {
  return api.get('/newsletter-stats');
};

// ==================== SEND LOGS ====================

export const logSend = async (
  newsletterId: string,
  subscriberId: string,
  status: NewsletterSendLog['status'],
  errorMessage?: string
): Promise<void> => {
  try {
    await api.post('/newsletter-send-logs', {
      newsletter_id: newsletterId,
      subscriber_id: subscriberId,
      status,
      sent_at: new Date().toISOString(),
      error_message: errorMessage
    });
  } catch (error) {
    console.error('Error logging send:', error);
  }
};

export const updateSendLog = async (
  newsletterId: string,
  subscriberId: string,
  updates: Partial<NewsletterSendLog>
): Promise<void> => {
  try {
    await api.put(`/newsletter-send-logs/${newsletterId}/${subscriberId}`, updates);
  } catch (error) {
    console.error('Error updating send log:', error);
  }
};

export const getSendLogs = async (newsletterId?: string): Promise<(NewsletterSendLog & { subscriber_email?: string })[]> => {
  try {
    return await api.get('/newsletter-send-logs', {
      newsletter_id: newsletterId
    });
  } catch (error) {
    console.error('Error in getSendLogs:', error);
    return [];
  }
};
