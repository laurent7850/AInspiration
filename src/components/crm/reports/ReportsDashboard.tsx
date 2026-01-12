import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  PieChart, 
  LineChart, 
  Calendar, 
  Download,
  Filter,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';
import { fetchOpportunities } from '../../../services/opportunityService';
import { fetchTasks } from '../../../services/taskService';
import { fetchContacts } from '../../../services/contactService';
import { fetchCompanies } from '../../../services/companyService';
import { Opportunity, Task, Contact } from '../../../utils/types';
import SalesFunnelChart from './charts/SalesFunnelChart';
import SalesPerformanceChart from '../charts/SalesPerformanceChart';
import TaskCompletionChart from './charts/TaskCompletionChart';
import LeadSourceChart from './charts/LeadSourceChart';
import DateRangePicker from './DateRangePicker';

const ReportsDashboard: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date()
  });
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch all necessary data
        const [opportunitiesData, tasksData, contactsData] = await Promise.all([
          fetchOpportunities(),
          fetchTasks(),
          fetchContacts()
        ]);
        
        setOpportunities(opportunitiesData);
        setTasks(tasksData);
        setContacts(contactsData);
      } catch (error) {
        console.error('Error loading report data:', error);
        setError('Impossible de charger les données des rapports');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter data based on selected date range
  const filteredOpportunities = opportunities.filter(opp => {
    const date = new Date(opp.created_at || '');
    return date >= dateRange.start && date <= dateRange.end;
  });
  
  const filteredTasks = tasks.filter(task => {
    const date = new Date(task.created_at || '');
    return date >= dateRange.start && date <= dateRange.end;
  });
  
  // Calculate key metrics
  const totalOpportunities = filteredOpportunities.length;
  const wonOpportunities = filteredOpportunities.filter(opp => opp.stage === 'Gagné').length;
  const lostOpportunities = filteredOpportunities.filter(opp => opp.stage === 'Perdu').length;
  const winRate = totalOpportunities ? Math.round((wonOpportunities / totalOpportunities) * 100) : 0;
  
  const totalEstimatedValue = filteredOpportunities.reduce(
    (sum, opp) => sum + (opp.estimated_value || 0),
    0
  );
  
  const wonValue = filteredOpportunities
    .filter(opp => opp.stage === 'Gagné')
    .reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
  
  const completedTasks = filteredTasks.filter(task => task.completed).length;
  const totalTasks = filteredTasks.length;
  const taskCompletionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const exportReport = () => {
    // Logic to export report data (could be CSV, PDF, etc.)
    alert('Fonctionnalité d\'export en cours de développement');
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      
      const [opportunitiesData, tasksData, contactsData] = await Promise.all([
        fetchOpportunities(),
        fetchTasks(),
        fetchContacts()
      ]);
      
      setOpportunities(opportunitiesData);
      setTasks(tasksData);
      setContacts(contactsData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Impossible de rafraîchir les données');
      setLoading(false);
    }
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
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart className="w-6 h-6 text-indigo-600" />
          Rapports et Analyses
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <DateRangePicker 
            startDate={dateRange.start} 
            endDate={dateRange.end} 
            onChange={(start, end) => setDateRange({start, end})}
          />
          
          <div className="flex gap-2">
            <button
              onClick={refreshData}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              <RefreshCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Rafraîchir</span>
            </button>
            
            <button
              onClick={exportReport}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exporter</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPIs summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Valeur du pipeline</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalEstimatedValue)}
          </p>
          <div className="mt-2 text-sm">
            <span className="text-green-600 font-medium">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(wonValue)} gagnés
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Taux de conversion</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{winRate}%</p>
          <div className="mt-2 text-sm text-gray-600">
            {wonOpportunities} gagnées / {totalOpportunities} totales
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Valeur moyenne</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {totalOpportunities ? 
              new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                .format(totalEstimatedValue / totalOpportunities) :
              '€0'}
          </p>
          <div className="mt-2 text-sm text-gray-600">
            Par opportunité
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Productivité</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{taskCompletionRate}%</p>
          <div className="mt-2 text-sm text-gray-600">
            {completedTasks} tâches terminées / {totalTasks} totales
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            Pipeline commercial
          </h3>
          <div className="h-64">
            <SalesFunnelChart opportunities={filteredOpportunities} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-indigo-600" />
            Performance des ventes
          </h3>
          <div className="h-64">
            <SalesPerformanceChart opportunities={filteredOpportunities} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-indigo-600" />
            Réalisation des tâches
          </h3>
          <div className="h-64">
            <TaskCompletionChart tasks={filteredTasks} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            Sources des leads
          </h3>
          <div className="h-64">
            <LeadSourceChart contacts={contacts} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;