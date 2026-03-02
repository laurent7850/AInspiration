import { api } from '../utils/api';
import { Opportunity, OpportunityStage, Company, Contact, Product } from '../utils/types';
import { recordActivity } from './activityService';

export const fetchOpportunities = async (): Promise<Opportunity[]> => {
  return api.get<Opportunity[]>('/opportunities');
};

export const fetchOpportunityById = async (id: string): Promise<Opportunity> => {
  return api.get<Opportunity>(`/opportunities/${id}`);
};

export const createOpportunity = async (opportunity: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>): Promise<Opportunity> => {
  const data = await api.post<Opportunity>('/opportunities', opportunity);

  try {
    await recordActivity({
      activity_type: 'opportunity_created',
      description: `Opportunité créée: ${data.name}`,
      related_to_type: 'opportunity',
      related_to: data.id
    });
  } catch { /* non-blocking */ }

  return data;
};

export const updateOpportunity = async (id: string, opportunity: Partial<Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>>): Promise<Opportunity> => {
  const data = await api.put<Opportunity>(`/opportunities/${id}`, opportunity);

  try {
    await recordActivity({
      activity_type: 'opportunity_updated',
      description: `Opportunité mise à jour: ${data.name}`,
      related_to_type: 'opportunity',
      related_to: data.id
    });
  } catch { /* non-blocking */ }

  return data;
};

export const deleteOpportunity = async (id: string): Promise<void> => {
  let oppName: string | undefined;
  try {
    const opp = await fetchOpportunityById(id);
    oppName = opp.name;
  } catch { /* ignore */ }

  await api.delete(`/opportunities/${id}`);

  if (oppName) {
    try {
      await recordActivity({
        activity_type: 'opportunity_deleted',
        description: `Opportunité supprimée: ${oppName}`,
        related_to_type: 'opportunity',
        related_to: id
      });
    } catch { /* non-blocking */ }
  }
};

export const getOpportunityStages = (): OpportunityStage[] => {
  return ['Qualification', 'Proposition', 'Négociation', 'Gagné', 'Perdu'];
};

// Helper functions used by OpportunityForm
export const fetchCompanies = async (): Promise<Company[]> => {
  return api.get<Company[]>('/companies');
};

export const fetchContacts = async (): Promise<Contact[]> => {
  return api.get<Contact[]>('/contacts');
};

export const fetchProducts = async (): Promise<Product[]> => {
  return api.get<Product[]>('/products', { active_only: true });
};
