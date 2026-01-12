import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Phone, 
  Mail,
  Building,
  Edit,
  Trash,
  SearchIcon,
  Filter,
  UserCheck,
  Link
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchContacts, deleteContact } from '../../services/contactService';
import { Contact } from '../../utils/types';
import CompanyLink from './CompanyLink';
import BulkActions from './BulkActions';

interface ContactListProps {
  onCreateNew: () => void;
  onEditContact: (id: string) => void;
}

const ContactList: React.FC<ContactListProps> = ({ onCreateNew, onEditContact }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true);
        const data = await fetchContacts();
        setContacts(data);
        setFilteredContacts(data);
      } catch (err) {
        console.error('Failed to load contacts', err);
        setError('Impossible de charger les contacts. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadContacts();
  }, []);

  useEffect(() => {
    // Filter contacts based on search term and status filter
    let result = [...contacts];
    
    if (statusFilter !== 'all') {
      result = result.filter(contact => contact.status === statusFilter);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(contact => 
        (contact.first_name?.toLowerCase() || '').includes(term) || 
        (contact.last_name?.toLowerCase() || '').includes(term) || 
        (contact.email?.toLowerCase() || '').includes(term) || 
        (contact.phone?.toLowerCase() || '').includes(term) || 
        (contact.job_title?.toLowerCase() || '').includes(term) || 
        (contact.company_name?.toLowerCase() || '').includes(term)
      );
    }
    
    setFilteredContacts(result);
  }, [statusFilter, searchTerm, contacts]);

  const handleDelete = async (id: string) => {
    if (deleteConfirmId === id) {
      try {
        if (user) {
          await deleteContact(id, user.id);
          setContacts(contacts.filter(contact => contact.id !== id));
          setDeleteConfirmId(null);
        }
      } catch (err) {
        console.error('Failed to delete contact', err);
        setError('Impossible de supprimer le contact. Veuillez réessayer.');
      }
    } else {
      setDeleteConfirmId(id);
    }
  };

  const getFullName = (contact: Contact): string => {
    const firstName = contact.first_name || '';
    const lastName = contact.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Sans nom';
  };

  const handleSelectContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!user || selectedContacts.size === 0) return;

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedContacts.size} contact(s) ?`)) {
      try {
        await Promise.all(
          Array.from(selectedContacts).map(id => deleteContact(id, user.id))
        );
        setContacts(contacts.filter(c => !selectedContacts.has(c.id)));
        setSelectedContacts(new Set());
      } catch (err) {
        console.error('Failed to delete contacts', err);
        setError('Impossible de supprimer les contacts. Veuillez réessayer.');
      }
    }
  };

  const handleCancelSelection = () => {
    setSelectedContacts(new Set());
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-white bg-red-600 px-4 py-2 rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          Liste des contacts
        </h2>
        <button 
          onClick={onCreateNew}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau contact
        </button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
          />
        </div>

        {/* Status filter */}
        <div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Tous les statuts</option>
              <option value="lead">Prospect</option>
              <option value="customer">Client</option>
              <option value="inactive">Inactif</option>
              <option value="other">Autre</option>
            </select>
          </div>
        </div>
      </div>

      {filteredContacts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Aucun contact trouvé.</p>
          <button 
            onClick={onCreateNew}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Créer votre premier contact
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fonction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
                  className={`hover:bg-gray-50 cursor-pointer ${selectedContacts.has(contact.id) ? 'bg-indigo-50' : ''}`}
                  onClick={() => onEditContact(contact.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedContacts.has(contact.id)}
                      onChange={() => handleSelectContact(contact.id)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {getFullName(contact).substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{getFullName(contact)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-500">{contact.email || '-'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-500">{contact.phone || '-'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center">
                      {contact.company_id ? (
                        <CompanyLink companyId={contact.company_id} />
                      ) : (
                        <div className="flex items-center">
                          <Building className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-500">{contact.company_name || '-'}</div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{contact.job_title || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contact.status ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {contact.status}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditContact(contact.id);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(contact.id);
                        }}
                        className={`${deleteConfirmId === contact.id ? 'text-red-600' : 'text-gray-500'} hover:text-red-700`}
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                      <a 
                        href={`/contacts/${contact.id}`}
                        className="text-gray-500 hover:text-indigo-600"
                        onClick={e => e.stopPropagation()}
                      >
                        <Link className="w-5 h-5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <BulkActions
        selectedCount={selectedContacts.size}
        onDelete={handleBulkDelete}
        onCancel={handleCancelSelection}
        entityType="contact"
      />
    </div>
  );
};

export default ContactList;