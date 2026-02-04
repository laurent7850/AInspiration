import { supabase } from '../utils/supabase';
import { NewsletterSubscriber, Newsletter, NewsletterSendLog } from '../utils/types';

// n8n webhook URLs
const N8N_BASE_URL = "https://n8n.srv767464.hstgr.cloud/webhook";
const NEWSLETTER_WEBHOOK_URL = `${N8N_BASE_URL}/newsletter-send`;
const NEWSLETTER_GENERATE_URL = `${N8N_BASE_URL}/newsletter-generate`;

// Generate a unique unsubscribe token
const generateUnsubscribeToken = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

// ==================== SUBSCRIBER MANAGEMENT ====================

export const getSubscribers = async (status?: string): Promise<NewsletterSubscriber[]> => {
  let query = supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching subscribers:', error);
    throw error;
  }

  return data || [];
};

export const getActiveSubscribers = async (): Promise<NewsletterSubscriber[]> => {
  return getSubscribers('active');
};

export const getSubscriberByEmail = async (email: string): Promise<NewsletterSubscriber | null> => {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching subscriber:', error);
    throw error;
  }

  return data;
};

export const getSubscriberByToken = async (token: string): Promise<NewsletterSubscriber | null> => {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('unsubscribe_token', token)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching subscriber by token:', error);
    throw error;
  }

  return data;
};

export const addSubscriber = async (email: string, source: string = 'website'): Promise<NewsletterSubscriber> => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if already subscribed
  const existing = await getSubscriberByEmail(normalizedEmail);

  if (existing) {
    // If unsubscribed, resubscribe
    if (existing.status === 'unsubscribed') {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .update({
          status: 'active',
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
          source
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
    return existing;
  }

  // Create new subscriber
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert([{
      email: normalizedEmail,
      status: 'active',
      source,
      unsubscribe_token: generateUnsubscribeToken(),
      subscribed_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding subscriber:', error);
    throw error;
  }

  return data;
};

export const unsubscribe = async (token: string): Promise<boolean> => {
  const subscriber = await getSubscriberByToken(token);

  if (!subscriber) {
    return false;
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString()
    })
    .eq('id', subscriber.id);

  if (error) {
    console.error('Error unsubscribing:', error);
    throw error;
  }

  return true;
};

export const deleteSubscriber = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting subscriber:', error);
    throw error;
  }
};

// ==================== NEWSLETTER MANAGEMENT ====================

export const getNewsletters = async (): Promise<Newsletter[]> => {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching newsletters:', error);
    throw error;
  }

  return data || [];
};

export const getNewsletterById = async (id: string): Promise<Newsletter | null> => {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching newsletter:', error);
    throw error;
  }

  return data;
};

export const createNewsletter = async (newsletter: Partial<Newsletter>): Promise<Newsletter> => {
  const { data, error } = await supabase
    .from('newsletters')
    .insert([{
      subject: newsletter.subject || '',
      content: newsletter.content || '',
      html_content: newsletter.html_content,
      status: newsletter.status || 'draft',
      scheduled_at: newsletter.scheduled_at
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating newsletter:', error);
    throw error;
  }

  return data;
};

export const updateNewsletter = async (id: string, updates: Partial<Newsletter>): Promise<Newsletter> => {
  const { data, error } = await supabase
    .from('newsletters')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating newsletter:', error);
    throw error;
  }

  return data;
};

export const deleteNewsletter = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('newsletters')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting newsletter:', error);
    throw error;
  }
};

// ==================== NEWSLETTER SENDING ====================

export const sendNewsletter = async (newsletterId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Get newsletter
    const newsletter = await getNewsletterById(newsletterId);
    if (!newsletter) {
      return { success: false, message: 'Newsletter non trouvée' };
    }

    // Get active subscribers
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

    // Update status to failed
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
  const [allSubscribers, newsletters] = await Promise.all([
    getSubscribers(),
    getNewsletters()
  ]);

  const activeSubscribers = allSubscribers.filter(s => s.status === 'active').length;
  const unsubscribedCount = allSubscribers.filter(s => s.status === 'unsubscribed').length;
  const sentNewsletters = newsletters.filter(n => n.status === 'sent').length;

  return {
    totalSubscribers: allSubscribers.length,
    activeSubscribers,
    unsubscribedCount,
    totalNewsletters: newsletters.length,
    sentNewsletters
  };
};

// ==================== SEND LOGS ====================

export const logSend = async (
  newsletterId: string,
  subscriberId: string,
  status: NewsletterSendLog['status'],
  errorMessage?: string
): Promise<void> => {
  const { error } = await supabase
    .from('newsletter_send_logs')
    .insert([{
      newsletter_id: newsletterId,
      subscriber_id: subscriberId,
      status,
      sent_at: new Date().toISOString(),
      error_message: errorMessage
    }]);

  if (error) {
    console.error('Error logging send:', error);
  }
};

export const updateSendLog = async (
  newsletterId: string,
  subscriberId: string,
  updates: Partial<NewsletterSendLog>
): Promise<void> => {
  const { error } = await supabase
    .from('newsletter_send_logs')
    .update(updates)
    .eq('newsletter_id', newsletterId)
    .eq('subscriber_id', subscriberId);

  if (error) {
    console.error('Error updating send log:', error);
  }
};

export const getSendLogs = async (newsletterId?: string): Promise<(NewsletterSendLog & { subscriber_email?: string })[]> => {
  try {
    // Get send logs
    let logsQuery = supabase
      .from('newsletter_send_logs')
      .select('*')
      .order('sent_at', { ascending: false });

    if (newsletterId) {
      logsQuery = logsQuery.eq('newsletter_id', newsletterId);
    }

    const { data: logs, error: logsError } = await logsQuery;

    if (logsError) {
      console.error('Error fetching send logs:', logsError);
      return [];
    }

    if (!logs || logs.length === 0) {
      return [];
    }

    // Get subscribers to map emails
    const subscriberIds = [...new Set(logs.map(l => l.subscriber_id))];
    const { data: subscribers } = await supabase
      .from('newsletter_subscribers')
      .select('id, email')
      .in('id', subscriberIds);

    const subscriberMap = new Map(subscribers?.map(s => [s.id, s.email]) || []);

    return logs.map(log => ({
      ...log,
      subscriber_email: subscriberMap.get(log.subscriber_id)
    }));
  } catch (error) {
    console.error('Error in getSendLogs:', error);
    return [];
  }
};
