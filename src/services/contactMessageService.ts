import { api } from '../utils/api';
import type { ContactMessage } from '../utils/types';

export const contactMessageService = {
  async getAll(status?: string): Promise<ContactMessage[]> {
    return api.get<ContactMessage[]>('/contact-messages', {
      status: status && status !== 'all' ? status : undefined
    });
  },

  async getById(id: string): Promise<ContactMessage | null> {
    try {
      return await api.get<ContactMessage>(`/contact-messages/${id}`);
    } catch {
      return null;
    }
  },

  async updateStatus(id: string, status: string): Promise<ContactMessage | null> {
    return api.put<ContactMessage>(`/contact-messages/${id}`, { status });
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/contact-messages/${id}`);
  },

  async getStats(): Promise<{
    total: number;
    new: number;
    read: number;
    replied: number;
    archived: number;
  }> {
    return api.get('/contact-messages/stats');
  }
};
