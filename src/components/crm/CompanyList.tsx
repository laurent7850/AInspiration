import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Globe, 
  MapPin,
  Edit,
  Trash,
  SearchIcon,
  Link,
  Users,
  PackageOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchCompanies, deleteCompany } from '../../services/companyService';
import { Company } from '../../utils/types';

interface CompanyListProps {
  onCreateNew: () => void;
  onEditCompany: (id: string) => void;
}

const CompanyList: React.FC<CompanyListProps> = ({ onCreateNew, onEditCompany }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        const data = await fetchCompanies();
        setCompanies(data);
        setFilteredCompanies(data);
      } catch (err) {
        console.error('Failed to load companies', err);
        setError('Impossible de charger les entreprises. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadCompanies();
  }, []);

  useEffect(() => {
    // Filter companies based on search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const result = companies.filter(company => 
        (company.name?.toLowerCase() || '').includes(term) || 
        (company.address?.toLowerCase() || '').includes(term) || 
        (company.website?.toLowerCase() || '').includes(term)
      );
      setFilteredCompanies(result);
    } else {
      setFilteredCompanies(companies);
    }
  }, [searchTerm, companies]);

  const handleDelete = async (id: string) => {
    if (deleteConfirmId === id) {
      try {
        if (user) {
          await deleteCompany(id, user.id);
          setCompanies(companies.filter(company => company.id !== id));
          setDeleteConfirmId(null);
        }
      } catch (err) {
        console.error('Failed to delete company', err);
        setError('Impossible de supprimer l\'entreprise. Veuillez réessayer.');
      }
    } else {
      setDeleteConfirmId(id);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getWebsiteDisplayUrl = (url?: string): string => {
    if (!url) return '-';
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
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
          <Building2 className="w-6 h-6 text-indigo-600" />
          Liste des entreprises
        </h2>
        <button 
          onClick={onCreateNew}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle entreprise
        </button>
      </div>

      <div className="mb-6">
        {/* Search */}
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une entreprise..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
          />
        </div>
      </div>

      {filteredCompanies.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Aucune entreprise trouvée.</p>
          <button 
            onClick={onCreateNew}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Créer votre première entreprise
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site web</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créée le</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr 
                  key={company.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onEditCompany(company.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-500">{company.address || '-'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {company.website ? (
                      <a 
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-indigo-600 hover:text-indigo-800 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm">{getWebsiteDisplayUrl(company.website)}</span>
                      </a>
                    ) : (
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-500">-</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(company.created_at)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => navigate('/contacts', { 
                          state: { companyFilter: company.id } 
                        })}
                        title="Voir les contacts"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Users className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => navigate('/opportunities', { 
                          state: { companyFilter: company.id } 
                        })}
                        title="Voir les opportunités"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PackageOpen className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCompany(company.id);
                        }}
                        title="Modifier"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(company.id);
                        }}
                        title={deleteConfirmId === company.id ? "Confirmez la suppression" : "Supprimer"}
                        className={`${deleteConfirmId === company.id ? 'text-red-600' : 'text-gray-500'} hover:text-red-700`}
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                      <a 
                        href={`/companies/${company.id}`}
                        title="Lien direct"
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
    </div>
  );
};

export default CompanyList;