import React, { useState, useEffect } from 'react';
import { CheckSquare, Calendar, Tag, AlertCircle, Clock, User, ArrowDownUp } from 'lucide-react';
import { Task } from '../../../utils/types';
import { fetchTasks, getTaskPriorities, getTaskStatuses } from '../../../services/taskService';
import ReportFilters from './ReportFilters';
import ReportExporter from './ReportExporter';
import DateRangePicker from './DateRangePicker';

const TasksReport: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('due_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date()
  });
  
  const priorities = getTaskPriorities();
  const statuses = getTaskStatuses();
  
  const [filters, setFilters] = useState({
    status: {
      label: "Statut",
      options: [
        { value: 'not_started', label: 'Non commencée' },
        { value: 'in_progress', label: 'En cours' },
        { value: 'completed', label: 'Terminée' },
        { value: 'waiting', label: 'En attente' },
        { value: 'deferred', label: 'Reportée' }
      ],
      selected: []
    },
    priority: {
      label: "Priorité",
      options: [
        { value: 'low', label: 'Basse' },
        { value: 'medium', label: 'Moyenne' },
        { value: 'high', label: 'Haute' }
      ],
      selected: []
    },
    completed: {
      label: "Completion",
      options: [
        { value: 'true', label: 'Terminées' },
        { value: 'false', label: 'Non terminées' }
      ],
      selected: []
    }
  });
  
  // Columns for the report table and export
  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'status', label: 'Statut' },
    { key: 'priority', label: 'Priorité' },
    { key: 'due_date', label: 'Échéance' },
    { key: 'completed', label: 'Terminée' },
    { key: 'completed_at', label: 'Terminée le' },
    { key: 'related_to_name', label: 'Lié à' },
    { key: 'created_at', label: 'Date de création' }
  ];
  
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const data = await fetchTasks();
        setTasks(data);
      } catch (err) {
        console.error('Failed to load tasks:', err);
        setError('Impossible de charger les tâches');
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, []);
  
  useEffect(() => {
    // Apply filters to tasks
    let result = [...tasks];
    
    // Filter by date range
    result = result.filter(task => {
      const date = new Date(task.created_at || '');
      return date >= dateRange.start && date <= dateRange.end;
    });
    
    // Apply status filter
    if (filters.status.selected.length > 0) {
      result = result.filter(task => filters.status.selected.includes(task.status));
    }
    
    // Apply priority filter
    if (filters.priority.selected.length > 0) {
      result = result.filter(task => filters.priority.selected.includes(task.priority));
    }
    
    // Apply completed filter
    if (filters.completed.selected.length > 0) {
      const isCompleted = filters.completed.selected.includes('true');
      const isNotCompleted = filters.completed.selected.includes('false');
      
      if (isCompleted && !isNotCompleted) {
        result = result.filter(task => task.completed);
      } else if (!isCompleted && isNotCompleted) {
        result = result.filter(task => !task.completed);
      }
      // If both or neither are selected, no filtering needed
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortField as keyof Task];
      let valueB = b[sortField as keyof Task];
      
      // Handle special cases for sorting
      if (sortField === 'completed') {
        // @ts-ignore - Converting boolean to number for sorting
        valueA = valueA ? 1 : 0;
        // @ts-ignore - Converting boolean to number for sorting
        valueB = valueB ? 1 : 0;
      } else if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      // @ts-ignore - Date check
      else if (valueA instanceof Date && valueB instanceof Date) {
        // @ts-ignore - Converting dates to numbers
        valueA = valueA.getTime();
        // @ts-ignore - Converting dates to numbers
        valueB = valueB.getTime();
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredTasks(result);
  }, [tasks, filters, sortField, sortDirection, dateRange]);
  
  const handleFilterChange = (filterName: string, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: {
        ...prev[filterName],
        selected: values
      }
    }));
  };
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set to default (ascending for dates, descending for others)
      setSortField(field);
      setSortDirection(field === 'due_date' || field === 'created_at' ? 'asc' : 'desc');
    }
  };
  
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  // Function to get display value for a field
  const getDisplayValue = (task: Task, key: string): string => {
    if (key === 'status') {
      const status = statuses.find(s => s.value === task.status);
      return status?.label || task.status;
    } else if (key === 'priority') {
      const priority = priorities.find(p => p.value === task.priority);
      return priority?.label || task.priority;
    } else if (key === 'completed') {
      return task.completed ? 'Oui' : 'Non';
    } else if (key === 'due_date' || key === 'completed_at' || key === 'created_at') {
      return formatDate(task[key as keyof Task] as string);
    } else {
      return (task[key as keyof Task] as string) || '-';
    }
  };
  
  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'waiting': return 'bg-purple-100 text-purple-800';
      case 'deferred': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  const getPriorityColor = (priority: string): string => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
  
  // Calculate summary metrics
  const totalCount = filteredTasks.length;
  const completedCount = filteredTasks.filter(t => t.completed).length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const overdueCount = filteredTasks.filter(t => 
    !t.completed && t.due_date && new Date(t.due_date) < new Date()
  ).length;
  const highPriorityCount = filteredTasks.filter(t => t.priority === 'high').length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Rapport des tâches
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <DateRangePicker 
            startDate={dateRange.start} 
            endDate={dateRange.end}
            onChange={(start, end) => setDateRange({start, end})}
          />
          
          <ReportExporter 
            reportName="tasks_report"
            data={filteredTasks}
            columns={columns}
          />
        </div>
      </div>
      
      <ReportFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold">{totalCount}</div>
          <div className="text-sm text-gray-500">tâches</div>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Taux de complétion</div>
          <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-500">{completedCount} terminées / {totalCount}</div>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Tâches en retard</div>
          <div className="text-2xl font-bold">{overdueCount}</div>
          <div className="text-sm text-gray-500">non terminées et échues</div>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Priorité haute</div>
          <div className="text-2xl font-bold">{highPriorityCount}</div>
          <div className="text-sm text-gray-500">tâches</div>
        </div>
      </div>
      
      {/* Data table */}
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.key === 'title' && (
                      <span className="text-indigo-500"><CheckSquare className="w-4 h-4" /></span>
                    )}
                    {column.key === 'due_date' && (
                      <span className="text-indigo-500"><Calendar className="w-4 h-4" /></span>
                    )}
                    {column.key === 'priority' && (
                      <span className="text-indigo-500"><Tag className="w-4 h-4" /></span>
                    )}
                    {column.key === 'created_at' && (
                      <span className="text-indigo-500"><Clock className="w-4 h-4" /></span>
                    )}
                    
                    <span>{column.label}</span>
                    
                    {sortField === column.key && (
                      <ArrowDownUp className={`w-3.5 h-3.5 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  Aucune tâche trouvée pour les filtres sélectionnés
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                      {getDisplayValue(task, 'status')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                      {getDisplayValue(task, 'priority')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      !task.completed && task.due_date && new Date(task.due_date) < new Date() 
                        ? 'text-red-600 font-medium' 
                        : 'text-gray-900'
                    }`}>
                      {getDisplayValue(task, 'due_date')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {task.completed ? 'Oui' : 'Non'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getDisplayValue(task, 'completed_at')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {task.related_to_name || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getDisplayValue(task, 'created_at')}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TasksReport;