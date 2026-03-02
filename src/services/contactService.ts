import { api } from '../utils/api';
import { Contact } from '../utils/types';
import { recordActivity } from './activityService';

export const fetchContacts = async (): Promise<Contact[]> => {
  return api.get<Contact[]>('/contacts');
};

export const fetchContact = async (id: string): Promise<Contact> => {
  return api.get<Contact>(`/contacts/${id}`);
};

// Export fetchContact as fetchContactById for backward compatibility
export const fetchContactById = fetchContact;

export const createContact = async (contactData: Partial<Contact>): Promise<Contact> => {
  const data = await api.post<Contact>('/contacts', contactData);

  const name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
  try {
    await recordActivity({
      activity_type: 'contact_created',
      description: `Contact créé: ${name}`,
      related_to_type: 'contact',
      related_to: data.id
    });
  } catch { /* non-blocking */ }

  return data;
};

export const updateContact = async (id: string, contactData: Partial<Contact>): Promise<Contact> => {
  const data = await api.put<Contact>(`/contacts/${id}`, contactData);

  const name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
  try {
    await recordActivity({
      activity_type: 'contact_updated',
      description: `Contact mis à jour: ${name}`,
      related_to_type: 'contact',
      related_to: data.id
    });
  } catch { /* non-blocking */ }

  return data;
};

export const deleteContact = async (id: string, userId: string): Promise<void> => {
  let contactName: string | undefined;
  try {
    const contact = await fetchContact(id);
    contactName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
  } catch { /* ignore */ }

  await api.delete(`/contacts/${id}`);

  if (contactName) {
    try {
      await recordActivity({
        user_id: userId,
        activity_type: 'contact_deleted',
        description: `Contact supprimé: ${contactName}`,
        related_to_type: 'contact',
        related_to: id
      });
    } catch { /* non-blocking */ }
  }
};

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
  updated_at: string;
}

export const contactMessageService = {
  async getAllMessages(): Promise<ContactMessage[]> {
    return api.get<ContactMessage[]>('/contact-messages');
  },

  async getMessageById(id: string): Promise<ContactMessage | null> {
    try {
      return await api.get<ContactMessage>(`/contact-messages/${id}`);
    } catch {
      return null;
    }
  },

  async updateMessageStatus(id: string, status: ContactMessage['status']): Promise<void> {
    await api.put(`/contact-messages/${id}`, { status });
  },

  async deleteMessage(id: string): Promise<void> {
    await api.delete(`/contact-messages/${id}`);
  },

  async getMessagesByStatus(status: ContactMessage['status']): Promise<ContactMessage[]> {
    return api.get<ContactMessage[]>('/contact-messages', { status });
  },

  async searchMessages(searchTerm: string): Promise<ContactMessage[]> {
    return api.get<ContactMessage[]>('/contact-messages', { search: searchTerm });
  }
};
