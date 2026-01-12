import { supabase } from '../utils/supabase';
import { Contact } from '../utils/types';
import { recordActivity } from './activityService';

export const fetchContacts = async (): Promise<Contact[]> => {
  // Fetch contacts with company information in a single query using join
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select(`
      *,
      company:companies(id, name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contacts:', error);
    throw new Error('Failed to load contacts');
  }

  // Transform data to match expected format
  return contacts.map(contact => ({
    ...contact,
    company_name: contact.company?.name || null
  }));
};

export const fetchContact = async (id: string): Promise<Contact> => {
  // Fetch contact with company in a single query
  const { data, error } = await supabase
    .from('contacts')
    .select(`
      *,
      company:companies(id, name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching contact:', error);
    throw new Error('Failed to load contact details');
  }

  return {
    ...data,
    company_name: data.company?.name || null
  };
};

// Export fetchContact as fetchContactById for backward compatibility
export const fetchContactById = fetchContact;

export const createContact = async (contactData: Partial<Contact>): Promise<Contact> => {
  const { data, error } = await supabase
    .from('contacts')
    .insert([contactData])
    .select()
    .single();

  if (error) {
    console.error('Error creating contact:', error);
    throw new Error('Failed to create contact');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
    await recordActivity({
      user_id: user.id,
      activity_type: 'contact_created',
      description: `Contact créé: ${name}`,
      related_to_type: 'contact',
      related_to: data.id
    });
  }

  return data;
};

export const updateContact = async (id: string, contactData: Partial<Contact>): Promise<Contact> => {
  const { data, error } = await supabase
    .from('contacts')
    .update(contactData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating contact:', error);
    throw new Error('Failed to update contact');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
    await recordActivity({
      user_id: user.id,
      activity_type: 'contact_updated',
      description: `Contact mis à jour: ${name}`,
      related_to_type: 'contact',
      related_to: data.id
    });
  }

  return data;
};

export const deleteContact = async (id: string, userId: string): Promise<void> => {
  const contact = await fetchContact(id);

  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting contact:', error);
    throw new Error('Failed to delete contact');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const name = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
    await recordActivity({
      user_id: user.id,
      activity_type: 'contact_deleted',
      description: `Contact supprimé: ${name}`,
      related_to_type: 'contact',
      related_to: id
    });
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
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contact messages:', error);
      throw error;
    }

    return data || [];
  },

  async getMessageById(id: string): Promise<ContactMessage | null> {
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

  async updateMessageStatus(id: string, status: ContactMessage['status']): Promise<void> {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating message status:', error);
      throw error;
    }
  },

  async deleteMessage(id: string): Promise<void> {
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting contact message:', error);
      throw error;
    }
  },

  async getMessagesByStatus(status: ContactMessage['status']): Promise<ContactMessage[]> {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages by status:', error);
      throw error;
    }

    return data || [];
  },

  async searchMessages(searchTerm: string): Promise<ContactMessage[]> {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%,message.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching messages:', error);
      throw error;
    }

    return data || [];
  }
};