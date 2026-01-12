import React, { useEffect, useState } from 'react';
import { 
  Save, 
  X, 
  AlertTriangle, 
  Mail, 
  Phone, 
  User, 
  Building, 
  MapPin,
  Briefcase,
  Tag,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  createContact, 
  fetchContactById, 
  updateContact 
} from '../../services/contactService';
import { 
  fetchCompanies 
} from '../../services/companyService';
import { Contact, Company } from '../../utils/types';

interface ContactFormProps {
  contactId?: string;
  onClose: () => void;
  onSaved: () => void;
}

const initialContact: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'user_id'> = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  job_title: '',
  company_id: undefined,
  status: 'lead',
  lead_source: undefined,
  notes: undefined,
  assigned_to: undefined,
  address_street: undefined,
  address_city: undefined,
  address_state: undefined,
  address_postal_code: undefined,
  address_country: undefined
};

const ContactForm: React.FC<ContactFormProps> = ({ contactId, onClose, onSaved }) => {
  const [contact, setContact] = useState<Omit<Contact, 'id' | 'created_at' | 'updated_at'>>({
    ...initialContact,
    user_id: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  const { user } = useAuth();

  // Load contact data if editing
  useEffect(() => {
    const loadContact = async () => {
      if (!contactId) return;
      
      try {
        setLoading(true);
        const data = await fetchContactById(contactId);
        setContact(data);
      } catch (err) {
        console.error('Failed to load contact', err);
        setError('Impossible de charger les détails du contact. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadContact();
  }, [contactId]);

  // Load companies for dropdown
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        const data = await fetchCompanies();
        setCompanies(data);
      } catch (err) {
        console.error('Failed to load companies', err);
        setError('Impossible de charger la liste des entreprises. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadCompanies();
  }, []);

  // Set user_id when authenticated user is available
  useEffect(() => {
    if (user) {
      setContact(prev => ({ ...prev, user_id: user.id }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContact(prev => ({
      ...prev,
      [name]: value || undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Validate required fields
      if (!contact.email) {
        setError('L\'email est obligatoire');
        setSaving(false);
        return;
      }
      
      if (contactId) {
        // Update existing contact
        await updateContact(contactId, contact);
      } else {
        // Create new contact
        await createContact(contact);
      }
      
      onSaved();
    } catch (err) {
      console.error('Failed to save contact', err);
      setError('Impossible de sauvegarder le contact. Veuillez réessayer.');
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
          {contactId ? 'Modifier le contact' : 'Nouveau contact'}
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
        {/* Personal Information Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Informations personnelles
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={contact.first_name || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Prénom"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={contact.last_name || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nom"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-indigo-600" />
            Coordonnées
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email*
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={contact.email || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={contact.phone || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            Informations professionnelles
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Job Title */}
            <div>
              <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-1">
                Fonction
              </label>
              <input
                type="text"
                id="job_title"
                name="job_title"
                value={contact.job_title || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Directeur Marketing"
              />
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
                  value={contact.company_id || ''}
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

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  id="status"
                  name="status"
                  value={contact.status || 'lead'}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="lead">Prospect</option>
                  <option value="customer">Client</option>
                  <option value="inactive">Inactif</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>

            {/* Lead Source */}
            <div>
              <label htmlFor="lead_source" className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <input
                type="text"
                id="lead_source"
                name="lead_source"
                value={contact.lead_source || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Site web, Référence, LinkedIn..."
              />
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            Adresse
          </h3>
          
          <div className="grid md:grid-cols-1 gap-6 mb-4">
            {/* Street */}
            <div>
              <label htmlFor="address_street" className="block text-sm font-medium text-gray-700 mb-1">
                Rue
              </label>
              <input
                type="text"
                id="address_street"
                name="address_street"
                value={contact.address_street || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="123 rue de la République"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* City */}
            <div>
              <label htmlFor="address_city" className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <input
                type="text"
                id="address_city"
                name="address_city"
                value={contact.address_city || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Paris"
              />
            </div>

            {/* State/Province */}
            <div>
              <label htmlFor="address_state" className="block text-sm font-medium text-gray-700 mb-1">
                État/Province
              </label>
              <input
                type="text"
                id="address_state"
                name="address_state"
                value={contact.address_state || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Île-de-France"
              />
            </div>

            {/* Postal Code */}
            <div>
              <label htmlFor="address_postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                Code postal
              </label>
              <input
                type="text"
                id="address_postal_code"
                name="address_postal_code"
                value={contact.address_postal_code || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="75000"
              />
            </div>

            {/* Country */}
            <div>
              <label htmlFor="address_country" className="block text-sm font-medium text-gray-700 mb-1">
                Pays
              </label>
              <input
                type="text"
                id="address_country"
                name="address_country"
                value={contact.address_country || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="France"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-600" />
            Notes
          </h3>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes additionnelles
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={contact.notes || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Notes supplémentaires sur ce contact..."
            ></textarea>
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

export default ContactForm;