import {
  BarChart2,
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Opportunity, Task, Contact, Activity } from '../../utils/types';
import PipelineChart from './charts/PipelineChart';
import SalesPerformanceChart from './charts/SalesPerformanceChart';
import CrmQuickLinks from './CrmQuickLinks';
import OpenRouterCostsCard from './OpenRouterCostsCard';
import AdvancedStats from './AdvancedStats';
import Skeleton, { CardSkeleton } from '../ui/Skeleton';
import {
  useOpportunitiesQuery,
  useTasksQuery,
  useContactsQuery,
  useActivitiesQuery,
} from '../../hooks/queries/useDashboard';

const DashboardView: React.FC = () => {
  const navigate = useNavigate();

  const oppQuery = useOpportunitiesQuery();
  const tasksQuery = useTasksQuery();
  const contactsQuery = useContactsQuery();
  const activitiesQuery = useActivitiesQuery(10);

  const opportunities: Opportunity[] = oppQuery.data ?? [];
  const tasks: Task[] = tasksQuery.data ?? [];
  const contacts: Contact[] = contactsQuery.data ?? [];
  const activities: Activity[] = activitiesQuery.data ?? [];

  const isLoading = oppQuery.isLoading || tasksQuery.isLoading || contactsQuery.isLoading || activitiesQuery.isLoading;
  const error = oppQuery.error || tasksQuery.error || contactsQuery.error || activitiesQuery.error;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Skeleton variant="rounded" width={44} height={44} />
          <div>
            <Skeleton variant="text" width={220} height={24} className="mb-2" />
            <Skeleton variant="text" width={180} height={14} />
          </div>
        </div>
        <Skeleton variant="rounded" height={48} />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} className="p-5!" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton variant="rounded" height={320} />
          <Skeleton variant="rounded" height={320} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p>Impossible de charger les données du tableau de bord.</p>
          <button
            onClick={() => {
              oppQuery.refetch();
              tasksQuery.refetch();
              contactsQuery.refetch();
              activitiesQuery.refetch();
            }}
            className="mt-2 text-white bg-red-600 px-4 py-2 rounded-sm hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-linear-to-r from-indigo-500 to-purple-600 rounded-lg">
            <BarChart2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord CRM</h1>
            <p className="text-sm text-gray-500">Vue d'ensemble de votre activité commerciale</p>
          </div>
        </div>
      </div>

        {/* Quick Links */}
        <CrmQuickLinks />

        {/* OpenRouter costs (admin only — renders nothing for the demo account) */}
        <OpenRouterCostsCard />

        {/* Advanced Statistics */}
        <AdvancedStats
          opportunities={opportunities}
          tasks={tasks}
          contacts={contacts}
        />

    {/* KPI Cards */}
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl shadow-sm p-5">
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
      
      <div className="bg-white rounded-xl shadow-sm p-5">
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
      
      <div className="bg-white rounded-xl shadow-sm p-5">
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
      
      <div className="bg-white rounded-xl shadow-sm p-5">
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
      <div className="bg-white rounded-xl shadow-sm p-5">
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
      
      <div className="bg-white rounded-xl shadow-sm p-5">
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
      <div className="bg-white rounded-xl shadow-sm p-5">
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
      
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Activité récente</h2>
        </div>

        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-6">Aucune activité récente</p>
        ) : (
          <ul className="space-y-3">
            {activities.slice(0, 8).map(activity => (
              <li key={activity.id} className="flex items-start space-x-3 text-sm">
                <div className="shrink-0 mt-0.5">
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
    </div>
  );
};

export default DashboardView;
