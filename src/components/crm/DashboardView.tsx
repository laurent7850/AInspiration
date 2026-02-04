import { useEffect, useState } from 'react';
import {
  BarChart2,
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  CheckSquare,
  AlertCircle,
  Sparkles,
  Flame,
  Bell,
  Brain
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchOpportunities } from '../../services/opportunityService';
import { fetchTasks } from '../../services/taskService';
import { fetchContacts } from '../../services/contactService';
import { fetchActivities } from '../../services/activityService';
import { Opportunity, Task, Contact, Activity } from '../../utils/types';
import PipelineChart from './charts/PipelineChart';
import SalesPerformanceChart from './charts/SalesPerformanceChart';
import CrmQuickLinks from './CrmQuickLinks';
import AdvancedStats from './AdvancedStats';
import AIInsights from './AIInsights';
import LeadScoring from './LeadScoring';
import FollowUpSuggestions from './FollowUpSuggestions';
import { FollowUpSuggestion } from '../../services/n8nService';

type DashboardTab = 'overview' | 'ai-insights' | 'lead-scoring' | 'follow-up';

const DashboardView: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [opportunitiesData, tasksData, contactsData, activitiesData] = await Promise.all([
          fetchOpportunities(),
          fetchTasks(),
          fetchContacts(),
          fetchActivities(10)
        ]);

        setOpportunities(opportunitiesData);
        setTasks(tasksData);
        setContacts(contactsData);
        setActivities(activitiesData);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        setError('Impossible de charger les données du tableau de bord. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        <p>{error}</p>
      </div>
    );
  }

  // Calculer les statistiques
  const totalValue = opportunities
    .filter(opp => opp.stage !== 'Perdu')
    .reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
  
  const wonValue = opportunities
    .filter(opp => opp.stage === 'Gagné')
    .reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
    
  const pendingTasks = tasks.filter(task => !task.completed);
  const overdueTasksCount = tasks.filter(task => 
    !task.completed && task.due_date && new Date(task.due_date) < new Date()
  ).length;
  
  const activeOpportunitiesCount = opportunities.filter(opp => 
    opp.stage !== 'Gagné' && opp.stage !== 'Perdu'
  ).length;
  
  const upcomingTasks = pendingTasks
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    })
    .slice(0, 5);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Calculer le ratio de conversion (opportunités gagnées / opportunités fermées)
  const closedOpportunities = opportunities.filter(opp => 
    opp.stage === 'Gagné' || opp.stage === 'Perdu'
  );
  
  const winRate = closedOpportunities.length > 0
    ? (opportunities.filter(opp => opp.stage === 'Gagné').length / closedOpportunities.length * 100).toFixed(1)
    : '0.0';

  const handleContactClick = (contactId: string) => {
    navigate(`/contacts/${contactId}`);
  };

  const handleCreateTask = (suggestion: FollowUpSuggestion) => {
    navigate('/tasks/new', {
      state: {
        prefill: {
          title: suggestion.suggestedAction,
          description: suggestion.reason,
          related_to: suggestion.contactId,
          related_to_type: 'contact',
          due_date: suggestion.suggestedDate,
          priority: suggestion.priority === 'high' ? 'high' : suggestion.priority === 'medium' ? 'medium' : 'low'
        }
      }
    });
  };

  const tabs = [
    { id: 'overview' as DashboardTab, label: 'Vue d\'ensemble', icon: BarChart2 },
    { id: 'ai-insights' as DashboardTab, label: 'Insights IA', icon: Sparkles },
    { id: 'lead-scoring' as DashboardTab, label: 'Lead Scoring', icon: Flame },
    { id: 'follow-up' as DashboardTab, label: 'Relances', icon: Bell }
  ];

  return (
    <div className="space-y-6">
      {/* Header with AI Badge */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord CRM</h1>
            <p className="text-sm text-gray-500">Propulsé par l'Intelligence Artificielle</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[140px] py-3 px-4 flex items-center justify-center space-x-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium text-sm whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <>
          {/* Quick Links */}
          <CrmQuickLinks />

          {/* AI Insights Summary - Compact version */}
          <AIInsights
            opportunities={opportunities}
            tasks={tasks}
            contacts={contacts}
          />

          {/* Advanced Statistics */}
          <AdvancedStats
            opportunities={opportunities}
            tasks={tasks}
            contacts={contacts}
          />

      {/* KPI Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Valeur du pipeline</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalValue)}</p>
            </div>
            <div className="bg-indigo-100 p-2 rounded-lg">
              <BarChart2 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <button 
              onClick={() => navigate('/opportunities')}
              className="text-green-600 ml-1 hover:underline"
            >
              {activeOpportunitiesCount} affaires actives
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Chiffre gagné</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(wonValue)}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600 ml-1">Taux de conversion: {winRate}%</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Tâches en attente</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pendingTasks.length}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <CheckSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {overdueTasksCount > 0 ? (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                <button
                  onClick={() => navigate('/tasks?filter=overdue')}
                  className="text-red-600 ml-1 hover:underline"
                >
                  {overdueTasksCount} tâches en retard
                </button>
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4 text-green-500" />
                <span className="text-green-600 ml-1">Tout est à jour !</span>
              </>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Total contacts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{contacts.length}</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <button
              onClick={() => navigate('/contacts')}
              className="text-indigo-600 ml-1 hover:underline"
            >
              Gérer les contacts
            </button>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pipeline des ventes</h2>
            <button 
              onClick={() => navigate('/opportunities')}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Voir toutes
            </button>
          </div>
          <div className="h-64">
            <PipelineChart opportunities={opportunities} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Performance des ventes</h2>
            <button 
              onClick={() => navigate('/reports')}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Voir les rapports
            </button>
          </div>
          <div className="h-64">
            <SalesPerformanceChart opportunities={opportunities} />
          </div>
        </div>
      </div>
      
      {/* Upcoming Tasks and Activities */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tâches à venir</h2>
            <button 
              onClick={() => navigate('/tasks')}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Voir toutes
            </button>
          </div>
          
          {upcomingTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-6">Aucune tâche à venir</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {upcomingTasks.map(task => (
                <li key={task.id} className="py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-0.5 ${task.due_date && new Date(task.due_date) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
                        <CheckSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <a 
                          href={`/tasks/${task.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                        >
                          {task.title}
                        </a>
                        <p className="text-xs text-gray-500">
                          {task.related_to_name && `${task.related_to_type}: ${task.related_to_name}`}
                          {task.due_date && (
                            <span className="ml-1">
                              · Échéance: {formatDate(task.due_date)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-800' : task.priority === 'medium' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                      {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Activité récente</h2>
          </div>

          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-6">Aucune activité récente</p>
          ) : (
            <ul className="space-y-3">
              {activities.slice(0, 8).map(activity => (
                <li key={activity.id} className="flex items-start space-x-3 text-sm">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900">
                      {activity.description}
                      {activity.related_to_name && (
                        <span className="font-medium"> · {activity.related_to_name}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(activity.created_at!).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
        </>
      )}

      {/* Tab: AI Insights */}
      {activeTab === 'ai-insights' && (
        <div className="space-y-6">
          <AIInsights
            opportunities={opportunities}
            tasks={tasks}
            contacts={contacts}
          />

          {/* Stats supplémentaires pour l'onglet IA */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques clés</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Opportunités actives</span>
                  <span className="font-bold text-indigo-600">
                    {opportunities.filter(o => !['Gagné', 'Perdu'].includes(o.stage)).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valeur du pipeline</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(totalValue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tâches en retard</span>
                  <span className="font-bold text-red-600">
                    {overdueTasksCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taux de conversion</span>
                  <span className="font-bold text-purple-600">
                    {winRate}%
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions recommandées</h3>
              <ul className="space-y-3">
                {opportunities.filter(o => o.stage === 'Négociation').length > 0 && (
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Clôturer les négociations</p>
                      <p className="text-sm text-gray-500">
                        {opportunities.filter(o => o.stage === 'Négociation').length} opportunité(s) en attente
                      </p>
                    </div>
                  </li>
                )}
                {tasks.filter(t => !t.completed && t.priority === 'high').length > 0 && (
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Traiter les tâches urgentes</p>
                      <p className="text-sm text-gray-500">
                        {tasks.filter(t => !t.completed && t.priority === 'high').length} tâche(s) haute priorité
                      </p>
                    </div>
                  </li>
                )}
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Enrichir les contacts</p>
                    <p className="text-sm text-gray-500">
                      Compléter les informations manquantes des leads
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Lead Scoring */}
      {activeTab === 'lead-scoring' && (
        <LeadScoring
          contacts={contacts}
          opportunities={opportunities}
          activities={activities}
          onContactClick={handleContactClick}
        />
      )}

      {/* Tab: Follow-up Suggestions */}
      {activeTab === 'follow-up' && (
        <FollowUpSuggestions
          contacts={contacts}
          opportunities={opportunities}
          tasks={tasks}
          activities={activities}
          onContactClick={handleContactClick}
          onCreateTask={handleCreateTask}
        />
      )}
    </div>
  );
};

export default DashboardView;