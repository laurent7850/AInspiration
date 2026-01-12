import { supabase } from '../utils/supabase';
import { Opportunity, OpportunityStage } from '../utils/types';
import { recordActivity } from './activityService';

export const fetchOpportunities = async (): Promise<Opportunity[]> => {
  // Join with companies and contacts to get their names
  const { data, error } = await supabase
    .from('opportunities')
    .select(`
      *,
      companies:company_id(name),
      contacts:contact_id(first_name, last_name),
      products:product_id(name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching opportunities:', error);
    throw error;
  }

  // Map the data to include company_name, contact_name, and product_name
  return data.map(item => ({
    ...item,
    company_name: item.companies?.name,
    contact_name: item.contacts ? `${item.contacts.first_name || ''} ${item.contacts.last_name || ''}`.trim() : undefined,
    product_name: item.products?.name
  }));
};

export const fetchOpportunityById = async (id: string): Promise<Opportunity> => {
  const { data, error } = await supabase
    .from('opportunities')
    .select(`
      *,
      companies:company_id(name),
      contacts:contact_id(first_name, last_name),
      products:product_id(name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching opportunity:', error);
    throw error;
  }

  return {
    ...data,
    company_name: data.companies?.name,
    contact_name: data.contacts ? `${data.contacts.first_name || ''} ${data.contacts.last_name || ''}`.trim() : undefined,
    product_name: data.products?.name
  };
};

export const createOpportunity = async (opportunity: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>): Promise<Opportunity> => {
  const { data, error } = await supabase
    .from('opportunities')
    .insert(opportunity)
    .select()
    .single();

  if (error) {
    console.error('Error creating opportunity:', error);
    throw error;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await recordActivity({
      user_id: user.id,
      activity_type: 'opportunity_created',
      description: `Opportunité créée: ${data.name}`,
      related_to_type: 'opportunity',
      related_to: data.id
    });
  }

  return data;
};

export const updateOpportunity = async (id: string, opportunity: Partial<Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>>): Promise<Opportunity> => {
  const { data, error } = await supabase
    .from('opportunities')
    .update(opportunity)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating opportunity:', error);
    throw error;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await recordActivity({
      user_id: user.id,
      activity_type: 'opportunity_updated',
      description: `Opportunité mise à jour: ${data.name}`,
      related_to_type: 'opportunity',
      related_to: data.id
    });
  }

  return data;
};

export const deleteOpportunity = async (id: string): Promise<void> => {
  const opportunity = await fetchOpportunityById(id);

  const { error } = await supabase
    .from('opportunities')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting opportunity:', error);
    throw error;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await recordActivity({
      user_id: user.id,
      activity_type: 'opportunity_deleted',
      description: `Opportunité supprimée: ${opportunity.name}`,
      related_to_type: 'opportunity',
      related_to: id
    });
  }
};

export const getOpportunityStages = (): OpportunityStage[] => {
  return ['Qualification', 'Proposition', 'Négociation', 'Gagné', 'Perdu'];
};

export const fetchCompanies = async () => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }

  return data;
};

export const fetchContacts = async () => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('first_name');

  if (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }

  return data;
};

export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data;
};