import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  DollarSign, 
  Plus, 
  Calendar, 
  Building, 
  User, 
  Package, 
  Edit, 
  Trash,
  SearchIcon,
  Link
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchOpportunities, getOpportunityStages, deleteOpportunity } from '../../services/opportunityService';
import { Opportunity, OpportunityStage } from '../../utils/types';
import CompanyLink from './CompanyLink';
import ContactLink from './ContactLink';
import ProductLink from './ProductLink';

interface OpportunityListProps {
  onCreateNew: () => void;
  onEditOpportunity: (id: string) => void;
}

const OpportunityList: React.FC<OpportunityListProps> = ({ onCreateNew, onEditOpportunity }) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const stages = getOpportunityStages();

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setLoading(true);
        const data = await fetchOpportunities();
        setOpportunities(data);
        setFilteredOpportunities(data);
      } catch (err) {
        console.error('Failed to load opportunities', err);
        setError('Impossible de charger les opportunités. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadOpportunities();
  }, []);

  useEffect(() => {
    // Filter opportunities based on stage filter and search term
    let result = [...opportunities];
    
    if (stageFilter !== 'all') {
      result = result.filter(opp => opp.stage === stageFilter);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(opp => 
        opp.name.toLowerCase().includes(term) || 
        opp.company_name?.toLowerCase().includes(term) ||
        opp.contact_name?.toLowerCase().includes(term) ||
        opp.product_name?.toLowerCase().includes(term) ||
        opp.description?.toLowerCase().includes(term)
      );
    }
    
    setFilteredOpportunities(result);
  }, [stageFilter, searchTerm, opportunities]);

  const handleDelete = async (id: string) => {
    if (deleteConfirmId === id) {
      try {
        await deleteOpportunity(id);
        setOpportunities(opportunities.filter(opp => opp.id !== id));
        setDeleteConfirmId(null);
      } catch (err) {
        console.error('Failed to delete opportunity', err);
        setError('Impossible de supprimer l\'opportunité. Veuillez réessayer.');
      }
    } else {
      setDeleteConfirmId(id);
    }
  };

  const getStageColor = (stage: OpportunityStage): string => {
    switch(stage) {
      case 'Qualification': return 'bg-blue-100 text-blue-800';
      case 'Proposition': return 'bg-purple-100 text-purple-800';
      case 'Négociation': return 'bg-orange-100 text-orange-800';
      case 'Gagné': return 'bg-green-100 text-green-800';
      case 'Perdu': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value?: number): string => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
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
          <BarChart className="w-6 h-6 text-indigo-600" />
          Pipeline des opportunités
        </h2>
        <button 
          onClick={onCreateNew}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle opportunité
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

        {/* Stage filter */}
        <div>
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">Toutes les étapes</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredOpportunities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Aucune opportunité trouvée.</p>
          <button 
            onClick={onCreateNew}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Créer votre première opportunité
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étape</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valeur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de clôture</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOpportunities.map((opportunity) => (
                <tr 
                  key={opportunity.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onEditOpportunity(opportunity.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{opportunity.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStageColor(opportunity.stage)}`}>
                      {opportunity.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center">
                      {opportunity.company_id ? (
                        <CompanyLink companyId={opportunity.company_id} />
                      ) : (
                        <div className="flex items-center">
                          <Building className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-500">-</div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center">
                      {opportunity.contact_id ? (
                        <ContactLink contactId={opportunity.contact_id} />
                      ) : (
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-500">-</div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center">
                      {opportunity.product_id ? (
                        <ProductLink productId={opportunity.product_id} />
                      ) : (
                        <div className="flex items-center">
                          <Package className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-500">-</div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-500">{formatCurrency(opportunity.estimated_value)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-500">{formatDate(opportunity.close_date)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditOpportunity(opportunity.id);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(opportunity.id);
                        }}
                        className={`${deleteConfirmId === opportunity.id ? 'text-red-600' : 'text-gray-500'} hover:text-red-700`}
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                      <a 
                        href={`/opportunities/${opportunity.id}`}
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

export default OpportunityList;