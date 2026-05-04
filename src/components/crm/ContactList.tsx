import React, { useState, useMemo } from 'react';
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
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Link,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Contact } from '../../utils/types';
import CompanyLink from './CompanyLink';
import BulkActions from './BulkActions';
import { TableSkeleton } from '../ui/Skeleton';
import { useContactsList, useDeleteContact } from '../../hooks/queries/useContacts';

interface ContactListProps {
  onCreateNew: () => void;
  onEditContact: (id: string) => void;
}

const PAGE_SIZE = 50;

const ContactList: React.FC<ContactListProps> = ({ onCreateNew, onEditContact }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);

  const { user } = useAuth();

  const query = useContactsList({ limit: PAGE_SIZE, offset: page * PAGE_SIZE });
  const deleteMutation = useDeleteContact();

  const contacts = query.data?.data ?? [];
  const total = query.data?.total ?? null;
  const isFetchingNewPage = query.isFetching && !query.isLoading;

  // Client-side filter on the current page (for bigger datasets, consider
  // moving search/status to backend query params).
  const filteredContacts = useMemo(() => {
    let result = [...contacts];
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          (c.first_name?.toLowerCase() || '').includes(term) ||
          (c.last_name?.toLowerCase() || '').includes(term) ||
          (c.email?.toLowerCase() || '').includes(term) ||
          (c.phone?.toLowerCase() || '').includes(term) ||
          (c.job_title?.toLowerCase() || '').includes(term) ||
          (c.company_name?.toLowerCase() || '').includes(term),
      );
    }
    return result;
  }, [contacts, statusFilter, searchTerm]);

  const handleDelete = async (id: string) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }
    if (!user) return;
    try {
      await deleteMutation.mutateAsync({ id, userId: user.id });
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete contact', err);
    }
  };

  const getFullName = (contact: Contact): string => {
    const firstName = contact.first_name || '';
    const lastName = contact.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Sans nom';
  };

  const handleSelectContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) newSelected.delete(contactId);
    else newSelected.add(contactId);
    setSelectedContacts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map((c) => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!user || selectedContacts.size === 0) return;
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedContacts.size} contact(s) ?`)) return;
    try {
      await Promise.all(
        Array.from(selectedContacts).map((id) => deleteMutation.mutateAsync({ id, userId: user.id })),
      );
      setSelectedContacts(new Set());
    } catch (err) {
      console.error('Failed to delete contacts', err);
    }
  };

  // Initial load → full skeleton
  if (query.isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Liste des contacts
          </h2>
        </div>
        <TableSkeleton rows={8} cols={6} />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p>Impossible de charger les contacts.</p>
          <button
            onClick={() => query.refetch()}
            className="mt-2 text-white bg-red-600 px-4 py-2 rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const startRow = total !== null && total > 0 ? page * PAGE_SIZE + 1 : 0;
  const endRow = page * PAGE_SIZE + contacts.length;
  const hasNextPage = total !== null ? endRow < total : contacts.length === PAGE_SIZE;
  const hasPrevPage = page > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          Liste des contacts
          {total !== null && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({total.toLocaleString('fr-FR')})
            </span>
          )}
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
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher dans cette page..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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

      {filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex w-16 h-16 rounded-full bg-indigo-50 items-center justify-center mb-4">
            <Users className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-gray-600 mb-1 font-medium">
            {contacts.length === 0 ? 'Aucun contact pour le moment' : 'Aucun contact ne correspond aux filtres'}
          </p>
          <p className="text-gray-500 text-sm mb-4">
            {contacts.length === 0
              ? 'Créez votre premier contact pour démarrer votre CRM.'
              : 'Essayez d’ajuster votre recherche ou les filtres.'}
          </p>
          {contacts.length === 0 && (
            <button
              onClick={onCreateNew}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Créer votre premier contact
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto relative">
          {isFetchingNewPage && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600" />
            </div>
          )}
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
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
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
                    <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
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
                        disabled={deleteMutation.isPending}
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                      <a
                        href={`/contacts/${contact.id}`}
                        className="text-gray-500 hover:text-indigo-600"
                        onClick={(e) => e.stopPropagation()}
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

      {/* Pagination footer */}
      {(hasPrevPage || hasNextPage) && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {total !== null
              ? `Affichage ${startRow.toLocaleString('fr-FR')}–${endRow.toLocaleString('fr-FR')} sur ${total.toLocaleString('fr-FR')}`
              : `Page ${page + 1}`}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={!hasPrevPage || isFetchingNewPage}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage || isFetchingNewPage}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <BulkActions
        selectedCount={selectedContacts.size}
        onDelete={handleBulkDelete}
        onCancel={() => setSelectedContacts(new Set())}
        entityType="contact"
      />
    </div>
  );
};

export default ContactList;
