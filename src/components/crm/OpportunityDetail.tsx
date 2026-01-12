import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Building, 
  User, 
  Package, 
  Edit, 
  ArrowLeft, 
  Clock,
  FileText,
  PlusSquare,
  ListTodo
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchOpportunityById } from '../../services/opportunityService';
import { fetchTasksByRelation } from '../../services/taskService';
import { Opportunity, OpportunityStage, Task } from '../../utils/types';
import ActivityFeed from './ActivityFeed';

interface OpportunityDetailProps {
  opportunityId: string;
  onBack: () => void;
  onEdit: () => void;
}

const OpportunityDetail: React.FC<OpportunityDetailProps> = ({ opportunityId, onBack, onEdit }) => {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [relatedTasks, setRelatedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [opportunityData, tasksData] = await Promise.all([
          fetchOpportunityById(opportunityId),
          fetchTasksByRelation('opportunity', opportunityId)
        ]);
        
        setOpportunity(opportunityData);
        setRelatedTasks(tasksData);
      } catch (err) {
        console.error('Failed to load opportunity details', err);
        setError('Impossible de charger les détails de l\'opportunité. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [opportunityId]);

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

  if (error || !opportunity) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        <p>{error || "Opportunité introuvable"}</p>
        <button 
          onClick={onBack} 
          className="mt-2 text-white bg-red-600 px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-start mb-8">
        <button 
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/tasks/new', { 
              state: { 
                relatedToType: 'opportunity', 
                relatedToId: opportunityId 
              }
            })}
            className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
          >
            <PlusSquare className="w-5 h-5" />
            Ajouter une tâche
          </button>
          <button 
            onClick={onEdit}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Edit className="w-5 h-5" />
            Modifier
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{opportunity.name}</h1>
        
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 inline-flex text-sm font-medium rounded-full ${getStageColor(opportunity.stage)}`}>
            {opportunity.stage}
          </span>
          
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            Créée le {formatDate(opportunity.created_at)}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails de l'opportunité</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Valeur estimée</p>
                <p className="text-lg">{formatCurrency(opportunity.estimated_value)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Date de clôture prévue</p>
                <p className="text-lg">{formatDate(opportunity.close_date)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Produit/Service</p>
                <p className="text-lg">{opportunity.product_name || '-'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations de contact</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Entreprise</p>
                {opportunity.company_id ? (
                  <a 
                    href={`/companies/${opportunity.company_id}`}
                    className="text-lg text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    {opportunity.company_name || 'Voir détails'}
                  </a>
                ) : (
                  <p className="text-lg">-</p>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Contact principal</p>
                {opportunity.contact_id ? (
                  <a 
                    href={`/contacts/${opportunity.contact_id}`}
                    className="text-lg text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    {opportunity.contact_name || 'Voir détails'}
                  </a>
                ) : (
                  <p className="text-lg">-</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {opportunity.description && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Description
          </h2>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{opportunity.description}</p>
          </div>
        </div>
      )}

      {/* Related Tasks Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-indigo-600" />
            Tâches associées
          </h2>
          
          <button
            onClick={() => navigate('/tasks/new', { 
              state: { 
                relatedToType: 'opportunity', 
                relatedToId: opportunityId 
              }
            })}
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <PlusSquare className="w-4 h-4" />
            Ajouter une tâche
          </button>
        </div>
        
        {relatedTasks.length === 0 ? (
          <p className="text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
            Aucune tâche associée à cette opportunité
          </p>
        ) : (
          <div className="bg-gray-50 rounded-lg divide-y divide-gray-100">
            {relatedTasks.map(task => (
              <div key={task.id} className="p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      readOnly
                      className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <div>
                      <h3 className={`text-base font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {task.description.substring(0, 100)}
                          {task.description.length > 100 && '...'}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        {task.due_date && (
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(task.due_date)}
                          </span>
                        )}
                        <span>
                          {task.priority === 'high' ? 'Priorité haute' : 
                           task.priority === 'medium' ? 'Priorité moyenne' : 
                           'Priorité basse'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Feed Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          Historique des activités
        </h2>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <ActivityFeed 
            relatedToType="opportunity" 
            relatedToId={opportunityId} 
            limit={5} 
          />
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetail;