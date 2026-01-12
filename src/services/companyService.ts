import { supabase } from '../utils/supabase';
import { Company } from '../utils/types';
import { recordActivity } from './activityService';

export const fetchCompanies = async (): Promise<Company[]> => {
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

export const fetchCompanyById = async (id: string): Promise<Company> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching company:', error);
    throw error;
  }

  return data;
};

export const createCompany = async (company: Omit<Company, 'id' | 'created_at'>, userId: string): Promise<Company> => {
  const { data, error } = await supabase
    .from('companies')
    .insert(company)
    .select()
    .single();

  if (error) {
    console.error('Error creating company:', error);
    throw error;
  }

  // Log the activity
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
  const { data, error } = await supabase
    .from('companies')
    .update(company)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating company:', error);
    throw error;
  }

  // Log the activity
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
  // Get the company data before deleting for the activity log
  const { data: companyData } = await supabase
    .from('companies')
    .select('name')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting company:', error);
    throw error;
  }

  // Log the activity
  if (companyData) {
    await recordActivity({
      user_id: userId,
      activity_type: 'company_deleted',
      description: `Entreprise supprimée: ${companyData.name}`,
      related_to_type: 'company',
      related_to: id
    });
  }
};

// Search companies
export const searchCompanies = async (query: string): Promise<Company[]> => {
  if (!query || query.trim().length < 2) return [];

  const searchTerm = `%${query.toLowerCase()}%`;

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .or(`name.ilike.${searchTerm},website.ilike.${searchTerm}`)
    .order('name', { ascending: true })
    .limit(10);

  if (error) {
    console.error('Error searching companies:', error);
    throw error;
  }

  return data;
};

// Get company statistics
export const getCompanyStats = async () => {
  // For total companies count
  const { count: totalCount, error: countError } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error getting company count:', countError);
    throw countError;
  }

  // Get recent additions
  const { data: recentCompanies, error: recentError } = await supabase
    .from('companies')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentError) {
    console.error('Error getting recent companies:', recentError);
    throw recentError;
  }

  return {
    total: totalCount,
    recentAdditions: recentCompanies
  };
};