import { api } from '../utils/api';
import { Company } from '../utils/types';
import { recordActivity } from './activityService';

export const fetchCompanies = async (): Promise<Company[]> => {
  return api.get<Company[]>('/companies');
};

export const fetchCompanyById = async (id: string): Promise<Company> => {
  return api.get<Company>(`/companies/${id}`);
};

export const createCompany = async (company: Omit<Company, 'id' | 'created_at'>, userId: string): Promise<Company> => {
  const data = await api.post<Company>('/companies', company);

  await recordActivity({
    user_id: userId,
    activity_type: 'company_created',
    description: `Entreprise créée: ${company.name}`,
    related_to_type: 'company',
    related_to: data.id
  });

  return data;
};

export const updateCompany = async (id: string, company: Partial<Omit<Company, 'id' | 'created_at'>>, userId: string): Promise<Company> => {
  const data = await api.put<Company>(`/companies/${id}`, company);

  await recordActivity({
    user_id: userId,
    activity_type: 'company_updated',
    description: `Entreprise mise à jour: ${data.name}`,
    related_to_type: 'company',
    related_to: id
  });

  return data;
};

export const deleteCompany = async (id: string, userId: string): Promise<void> => {
  let companyName: string | undefined;
  try {
    const companyData = await fetchCompanyById(id);
    companyName = companyData.name;
  } catch { /* ignore */ }

  await api.delete(`/companies/${id}`);

  if (companyName) {
    await recordActivity({
      user_id: userId,
      activity_type: 'company_deleted',
      description: `Entreprise supprimée: ${companyName}`,
      related_to_type: 'company',
      related_to: id
    });
  }
};

export const searchCompanies = async (query: string): Promise<Company[]> => {
  if (!query || query.trim().length < 2) return [];
  return api.get<Company[]>('/companies/search', { q: query });
};

export const getCompanyStats = async () => {
  return api.get<{ total: number; recentAdditions: any[] }>('/companies/stats');
};
