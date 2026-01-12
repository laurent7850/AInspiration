import React, { useEffect, useState } from 'react';
import { 
  Save, 
  X, 
  AlertTriangle, 
  Clock, 
  AlignLeft,
  Tag,
  Link,
  Flag,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { 
  createTask, 
  fetchTaskById, 
  updateTask,
  getTaskPriorities,
  getTaskStatuses
} from '../../../services/taskService';
import { 
  fetchOpportunities 
} from '../../../services/opportunityService';
import { 
  fetchContacts 
} from '../../../services/contactService';
import { 
  fetchCompanies 
} from '../../../services/companyService';
import { Task, Opportunity, Contact, Company } from '../../../utils/types';

interface TaskFormProps {
  taskId?: string;
  initialRelatedToType?: 'opportunity' | 'contact' | 'company';
  initialRelatedTo?: string;
  onClose: () => void;
  onSaved: () => void;
}

const initialTask: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'completed' | 'related_to_name'> = {
  title: '',
  description: '',
  due_date: undefined,
  priority: 'medium',
  status: 'not_started',
  related_to_type: undefined,
  related_to: undefined
};

const TaskForm: React.FC<TaskFormProps> = ({ 
  taskId, 
  initialRelatedToType, 
  initialRelatedTo, 
  onClose, 
  onSaved 
}) => {
  const [task, setTask] = useState<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'related_to_name'>>({
    ...initialTask,
    user_id: '',
    completed: false,
    related_to_type: initialRelatedToType,
    related_to: initialRelatedTo
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  const { user } = useAuth();
  const priorities = getTaskPriorities();
  const statuses = getTaskStatuses();

  // Load task data if editing
  useEffect(() => {
    const loadTask = async () => {
      if (!taskId) return;
      
      try {
        setLoading(true);
        const data = await fetchTaskById(taskId);
        setTask(data);
      } catch (err) {
        console.error('Failed to load task', err);
        setError('Impossible de charger les détails de la tâche. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadTask();
  }, [taskId]);

  // Load reference data (opportunities, contacts, companies)
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setLoading(true);
        const [opportunitiesData, contactsData, companiesData] = await Promise.all([
          fetchOpportunities(),
          fetchContacts(),
          fetchCompanies()
        ]);
        
        setOpportunities(opportunitiesData);
        setContacts(contactsData);
        setCompanies(companiesData);
      } catch (err) {
        console.error('Failed to load reference data', err);
        setError('Impossible de charger les données de référence. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadReferenceData();
  }, []);

  // Set user_id when authenticated user is available
  useEffect(() => {
    if (user) {
      setTask(prev => ({ ...prev, user_id: user.id }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'related_to_type') {
      // Reset related_to when changing the type
      setTask(prev => ({
        ...prev,
        [name]: (value || undefined) as 'company' | 'opportunity' | 'contact' | undefined,
        related_to: undefined
      }));
    } else if (name === 'completed') {
      // Handle checkbox
      setTask(prev => ({
        ...prev,
        completed: (e.target as HTMLInputElement).checked,
        status: (e.target as HTMLInputElement).checked ? 'completed' : prev.status,
        completed_at: (e.target as HTMLInputElement).checked ? new Date().toISOString() : undefined
      }));
    } else {
      // Handle all other fields
      setTask(prev => ({
        ...prev,
        [name]: value || undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Validate required fields
      if (!task.title) {
        setError('Veuillez remplir tous les champs obligatoires');
        setSaving(false);
        return;
      }
      
      if (taskId) {
        // Update existing task
        await updateTask(taskId, task);
      } else {
        // Create new task
        await createTask(task);
      }
      
      onSaved();
    } catch (err) {
      console.error('Failed to save task', err);
      setError('Impossible de sauvegarder la tâche. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {taskId ? 'Modifier la tâche' : 'Nouvelle tâche'}
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Task Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titre de la tâche*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={task.title || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: Rappeler le client"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Due Date */}
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                Date d'échéance
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={task.due_date ? task.due_date.substring(0, 10) : ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priorité
              </label>
              <div className="relative">
                <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  id="priority"
                  name="priority"
                  value={task.priority || 'medium'}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  id="status"
                  name="status"
                  value={task.status || 'not_started'}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Completed */}
            <div className="flex items-center pl-2">
              <input
                type="checkbox"
                id="completed"
                name="completed"
                checked={task.completed || false}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="completed" className="ml-2 block text-sm text-gray-700">
                Marquer comme terminée
              </label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Related To Type */}
            <div>
              <label htmlFor="related_to_type" className="block text-sm font-medium text-gray-700 mb-1">
                Lié à (type)
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  id="related_to_type"
                  name="related_to_type"
                  value={task.related_to_type || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Aucun --</option>
                  <option value="opportunity">Opportunité</option>
                  <option value="contact">Contact</option>
                  <option value="company">Entreprise</option>
                </select>
              </div>
            </div>
            
            {/* Related To */}
            <div>
              <label htmlFor="related_to" className="block text-sm font-medium text-gray-700 mb-1">
                Lié à (élément)
              </label>
              <select
                id="related_to"
                name="related_to"
                value={task.related_to || ''}
                onChange={handleChange}
                disabled={!task.related_to_type}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">-- Sélectionner --</option>
                {task.related_to_type === 'opportunity' && opportunities.map(opp => (
                  <option key={opp.id} value={opp.id}>{opp.name}</option>
                ))}
                {task.related_to_type === 'contact' && contacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {`${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email}
                  </option>
                ))}
                {task.related_to_type === 'company' && companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                id="description"
                name="description"
                rows={4}
                value={task.description || ''}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Description de la tâche..."
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;