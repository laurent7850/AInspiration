import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Link,
  Flag,
  Edit,
  Trash,
  CheckCircle,
  SearchIcon,
  Filter
} from 'lucide-react';
import { Task } from '../../../utils/types';
import { 
  fetchTasks, 
  markTaskAsCompleted, 
  deleteTask,
  getTaskPriorities,
  getTaskStatuses
} from '../../../services/taskService';

interface TaskListProps {
  relatedToType?: 'opportunity' | 'contact' | 'company';
  relatedToId?: string;
  onCreateNew: (relatedToType?: string, relatedToId?: string) => void;
  onEditTask: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ 
  relatedToType, 
  relatedToId, 
  onCreateNew, 
  onEditTask 
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const priorities = getTaskPriorities();
  const statuses = getTaskStatuses();

  // Load tasks
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const data = await fetchTasks();
        
        // If relatedToType and relatedToId are provided, filter tasks
        const filteredData = relatedToType && relatedToId
          ? data.filter(task => 
              task.related_to_type === relatedToType && 
              task.related_to === relatedToId
            )
          : data;
        
        setTasks(filteredData);
        setFilteredTasks(filteredData);
      } catch (err) {
        console.error('Failed to load tasks', err);
        setError('Impossible de charger les tâches. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, [relatedToType, relatedToId]);

  // Apply filters and search
  useEffect(() => {
    let result = [...tasks];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        result = result.filter(task => !task.completed);
      } else if (statusFilter === 'completed') {
        result = result.filter(task => task.completed);
      } else {
        result = result.filter(task => task.status === statusFilter);
      }
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter);
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(term) ||
        (task.description && task.description.toLowerCase().includes(term)) ||
        (task.related_to_name && task.related_to_name.toLowerCase().includes(term))
      );
    }
    
    setFilteredTasks(result);
  }, [tasks, statusFilter, priorityFilter, searchTerm]);

  // Handle task completion toggle
  const handleCompleteToggle = async (id: string, currentStatus: boolean) => {
    try {
      await markTaskAsCompleted(id, !currentStatus);
      
      // Update the tasks state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id 
            ? { 
                ...task, 
                completed: !currentStatus,
                status: !currentStatus ? 'completed' : 'not_started',
                completed_at: !currentStatus ? new Date().toISOString() : undefined
              } 
            : task
        )
      );
    } catch (err) {
      console.error('Failed to update task status', err);
      setError("Impossible de mettre à jour le statut de la tâche. Veuillez réessayer.");
    }
  };

  // Handle task deletion
  const handleDelete = async (id: string) => {
    if (deleteConfirmId === id) {
      try {
        await deleteTask(id);
        setTasks(tasks.filter(task => task.id !== id));
        setDeleteConfirmId(null);
      } catch (err) {
        console.error('Failed to delete task', err);
        setError('Impossible de supprimer la tâche. Veuillez réessayer.');
      }
    } else {
      setDeleteConfirmId(id);
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

  const getStatusColor = (status: string, completed: boolean): string => {
    if (completed) return 'bg-green-100 text-green-800';
    
    switch(status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'waiting': return 'bg-purple-100 text-purple-800';
      case 'deferred': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    date.setHours(0, 0, 0, 0);
    
    if (date.getTime() === today.getTime()) {
      return "Aujourd'hui";
    } else if (date.getTime() === tomorrow.getTime()) {
      return "Demain";
    } else if (date.getTime() === yesterday.getTime()) {
      return "Hier";
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };
  
  const isOverdue = (task: Task): boolean => {
    return !task.completed &&
           !!task.due_date &&
           new Date(task.due_date).getTime() < new Date().setHours(0, 0, 0, 0);
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
          <CheckSquare className="w-6 h-6 text-indigo-600" />
          Tâches
        </h2>
        <button 
          onClick={() => onCreateNew(relatedToType, relatedToId)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle tâche
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

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Status filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="completed">Terminées</option>
              <option value="not_started">Non commencées</option>
              <option value="in_progress">En cours</option>
              <option value="waiting">En attente</option>
              <option value="deferred">Reportées</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="relative">
            <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Toutes les priorités</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Aucune tâche trouvée.</p>
          <button 
            onClick={() => onCreateNew(relatedToType, relatedToId)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Créer votre première tâche
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {filteredTasks.map(task => (
            <li key={task.id} className="py-4">
              <div className="flex items-start gap-4">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleCompleteToggle(task.id, task.completed)}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                  />
                </div>
                
                <div className="flex-grow" onClick={() => onEditTask(task.id)}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h3 className={`text-base font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                      {task.due_date && (
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          isOverdue(task) ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(task.due_date)}
                        </span>
                      )}
                      
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status, task.completed)}`}>
                        {task.completed ? 'Terminée' : statuses.find(s => s.value === task.status)?.label || task.status}
                      </span>
                      
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        <Flag className="w-3 h-3 mr-1" />
                        {priorities.find(p => p.value === task.priority)?.label || task.priority}
                      </span>
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                      {task.description.length > 150 
                        ? `${task.description.substring(0, 150)}...` 
                        : task.description}
                    </p>
                  )}
                  
                  {task.related_to_name && (
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <Link className="w-3 h-3 mr-1" />
                      <span>
                        {task.related_to_type === 'opportunity' ? 'Opportunité: ' :
                         task.related_to_type === 'contact' ? 'Contact: ' :
                         task.related_to_type === 'company' ? 'Entreprise: ' : ''}
                        {task.related_to_name}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => onEditTask(task.id)}
                    className="text-indigo-600 hover:text-indigo-900 p-1"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(task.id)}
                    className={`${deleteConfirmId === task.id ? 'text-red-600' : 'text-gray-500'} hover:text-red-700 p-1`}
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;