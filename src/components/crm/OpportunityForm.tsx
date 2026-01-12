import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Building, 
  User, 
  Package, 
  Save, 
  X,
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  createOpportunity, 
  fetchOpportunityById, 
  updateOpportunity,
  getOpportunityStages,
  fetchCompanies,
  fetchContacts,
  fetchProducts
} from '../../services/opportunityService';
import { Opportunity, OpportunityStage, Company, Contact, Product } from '../../utils/types';

interface OpportunityFormProps {
  opportunityId?: string;
  onClose: () => void;
  onSaved: () => void;
}

const initialOpportunity: Omit<Opportunity, 'id' | 'created_at' | 'updated_at' | 'user_id'> = {
  name: '',
  stage: 'Qualification',
  company_id: undefined,
  contact_id: undefined,
  product_id: undefined,
  estimated_value: undefined,
  close_date: undefined,
  description: undefined
};

const OpportunityForm: React.FC<OpportunityFormProps> = ({ opportunityId, onClose, onSaved }) => {
  const [opportunity, setOpportunity] = useState<Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>>({
    ...initialOpportunity,
    user_id: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const { user } = useAuth();
  const stages = getOpportunityStages();

  // Load opportunity data if editing
  useEffect(() => {
    const loadOpportunity = async () => {
      if (!opportunityId) return;
      
      try {
        setLoading(true);
        const data = await fetchOpportunityById(opportunityId);
        setOpportunity(data);
      } catch (err) {
        console.error('Failed to load opportunity', err);
        setError('Impossible de charger les détails de l\'opportunité. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadOpportunity();
  }, [opportunityId]);

  // Load reference data (companies, contacts, products)
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setLoading(true);
        const [companiesData, contactsData, productsData] = await Promise.all([
          fetchCompanies(),
          fetchContacts(),
          fetchProducts()
        ]);
        
        setCompanies(companiesData);
        setContacts(contactsData);
        setProducts(productsData);
      } catch (err) {
        console.error('Failed to load reference data', err);
        setError('Impossible de charger les données de référence. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadReferenceData();
  }, []);

  // Set user_id when authenticated user is available
  useEffect(() => {
    if (user) {
      setOpportunity(prev => ({ ...prev, user_id: user.id }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle different types of fields
    if (name === 'estimated_value') {
      setOpportunity(prev => ({
        ...prev,
        [name]: value ? parseFloat(value) : undefined
      }));
    } else {
      setOpportunity(prev => ({
        ...prev,
        [name]: value || undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Validate required fields
      if (!opportunity.name || !opportunity.stage) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      if (opportunityId) {
        // Update existing opportunity
        await updateOpportunity(opportunityId, opportunity);
      } else {
        // Create new opportunity
        await createOpportunity(opportunity);
      }
      
      onSaved();
    } catch (err) {
      console.error('Failed to save opportunity', err);
      setError('Impossible de sauvegarder l\'opportunité. Veuillez réessayer.');
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
          {opportunityId ? 'Modifier l\'opportunité' : 'Nouvelle opportunité'}
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

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Opportunity Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'opportunité*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={opportunity.name || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: Projet d'automatisation pour XYZ"
            />
          </div>

          {/* Stage */}
          <div>
            <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-1">
              Étape*
            </label>
            <select
              id="stage"
              name="stage"
              required
              value={opportunity.stage}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company_id" className="block text-sm font-medium text-gray-700 mb-1">
              Entreprise
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                id="company_id"
                name="company_id"
                value={opportunity.company_id || ''}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Sélectionner une entreprise --</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact */}
          <div>
            <label htmlFor="contact_id" className="block text-sm font-medium text-gray-700 mb-1">
              Contact
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                id="contact_id"
                name="contact_id"
                value={opportunity.contact_id || ''}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Sélectionner un contact --</option>
                {contacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {`${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product */}
          <div>
            <label htmlFor="product_id" className="block text-sm font-medium text-gray-700 mb-1">
              Produit/Service
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                id="product_id"
                name="product_id"
                value={opportunity.product_id || ''}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Sélectionner un produit --</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Estimated Value */}
          <div>
            <label htmlFor="estimated_value" className="block text-sm font-medium text-gray-700 mb-1">
              Valeur estimée
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                id="estimated_value"
                name="estimated_value"
                value={opportunity.estimated_value || ''}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: 5000"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Close Date */}
          <div>
            <label htmlFor="close_date" className="block text-sm font-medium text-gray-700 mb-1">
              Date de clôture prévue
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                id="close_date"
                name="close_date"
                value={opportunity.close_date || ''}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={opportunity.description || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Description de l'opportunité..."
            ></textarea>
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
        </div>
      </form>
    </div>
  );
};

export default OpportunityForm;