import React, { useEffect, useState } from 'react';
import { 
  Save, 
  X, 
  AlertTriangle, 
  Building2, 
  Globe, 
  MapPin,
  CircleDollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  createCompany, 
  fetchCompanyById, 
  updateCompany 
} from '../../services/companyService';
import { Company } from '../../utils/types';

interface CompanyFormProps {
  companyId?: string;
  onClose: () => void;
  onSaved: () => void;
}

const initialCompany: Omit<Company, 'id' | 'created_at'> = {
  name: '',
  address: undefined,
  website: undefined,
  tva_number: undefined
};

const CompanyForm: React.FC<CompanyFormProps> = ({ companyId, onClose, onSaved }) => {
  const [company, setCompany] = useState<Omit<Company, 'id' | 'created_at'>>(initialCompany);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  // Load company data if editing
  useEffect(() => {
    const loadCompany = async () => {
      if (!companyId) return;
      
      try {
        setLoading(true);
        const data = await fetchCompanyById(companyId);
        setCompany(data);
      } catch (err) {
        console.error('Failed to load company', err);
        setError('Impossible de charger les détails de l\'entreprise. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadCompany();
  }, [companyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompany(prev => ({
      ...prev,
      [name]: value || undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Vous devez être connecté pour effectuer cette action.');
      return;
    }
    
    try {
      setSaving(true);
      
      // Validate required fields
      if (!company.name) {
        setError('Le nom de l\'entreprise est obligatoire');
        setSaving(false);
        return;
      }
      
      if (companyId) {
        // Update existing company
        await updateCompany(companyId, company, user.id);
      } else {
        // Create new company
        await createCompany(company, user.id);
      }
      
      onSaved();
    } catch (err) {
      console.error('Failed to save company', err);
      setError('Impossible de sauvegarder l\'entreprise. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {companyId ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Informations de l'entreprise
          </h3>
          
          <div className="space-y-4">
            {/* Company Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'entreprise*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={company.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nom de l'entreprise"
              />
            </div>

            {/* TVA Number - New field */}
            <div>
              <label htmlFor="tva_number" className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de TVA
              </label>
              <div className="relative">
                <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="tva_number"
                  name="tva_number"
                  value={company.tva_number || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="BE0123456789"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Site web
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={company.website || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={company.address || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="123 rue de la République, 75001 Paris, France"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;