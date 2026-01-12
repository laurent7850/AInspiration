import { supabase } from '../utils/supabase';
import type { ContactMessage } from '../utils/types';

export const contactMessageService = {
  async getAll(status?: string): Promise<ContactMessage[]> {
    let query = supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contact messages:', error);
      throw error;
    }

    return data || [];
  },

  async getById(id: string): Promise<ContactMessage | null> {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching contact message:', error);
      throw error;
    }

    return data;
  },

  async updateStatus(id: string, status: string): Promise<ContactMessage | null> {
    const { data, error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating contact message status:', error);
      throw error;
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting contact message:', error);
      throw error;
    }
  },

  async getStats(): Promise<{
    total: number;
    new: number;
    read: number;
    replied: number;
    archived: number;
  }> {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('status');

    if (error) {
      console.error('Error fetching contact message stats:', error);
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      new: data?.filter(m => m.status === 'new').length || 0,
      read: data?.filter(m => m.status === 'read').length || 0,
      replied: data?.filter(m => m.status === 'replied').length || 0,
      archived: data?.filter(m => m.status === 'archived').length || 0,
    };

    return stats;
  }
};
