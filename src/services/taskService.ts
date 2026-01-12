import { supabase } from '../utils/supabase';
import { Task, TaskPriority, TaskStatus } from '../utils/types';
import { recordActivity } from './activityService';

export const fetchTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      opportunities:opportunity_id(name),
      contacts:contact_id(first_name, last_name),
      companies:company_id(name)
    `)
    .order('due_date', { ascending: true })
    .order('priority', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }

  // Map the data to include related_to_name
  return data.map(item => {
    let related_to_name = undefined;
    
    if (item.related_to_type === 'opportunity' && item.opportunities) {
      related_to_name = item.opportunities.name;
    } else if (item.related_to_type === 'contact' && item.contacts) {
      related_to_name = `${item.contacts.first_name || ''} ${item.contacts.last_name || ''}`.trim();
    } else if (item.related_to_type === 'company' && item.companies) {
      related_to_name = item.companies.name;
    }
    
    return {
      ...item,
      related_to_name
    };
  });
};

export const fetchTaskById = async (id: string): Promise<Task> => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      opportunities:opportunity_id(name),
      contacts:contact_id(first_name, last_name),
      companies:company_id(name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching task:', error);
    throw error;
  }

  let related_to_name = undefined;
  
  if (data.related_to_type === 'opportunity' && data.opportunities) {
    related_to_name = data.opportunities.name;
  } else if (data.related_to_type === 'contact' && data.contacts) {
    related_to_name = `${data.contacts.first_name || ''} ${data.contacts.last_name || ''}`.trim();
  } else if (data.related_to_type === 'company' && data.companies) {
    related_to_name = data.companies.name;
  }
  
  return {
    ...data,
    related_to_name
  };
};

export const fetchTasksByRelation = async (
  relatedToType: 'opportunity' | 'contact' | 'company',
  relatedToId: string
): Promise<Task[]> => {
  let column = '';
  
  // Map the relatedToType to the actual column name
  if (relatedToType === 'opportunity') {
    column = 'opportunity_id';
  } else if (relatedToType === 'contact') {
    column = 'contact_id';
  } else if (relatedToType === 'company') {
    column = 'company_id';
  }
  
  if (!column) {
    throw new Error(`Invalid related type: ${relatedToType}`);
  }
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq(column, relatedToId)
    .order('due_date', { ascending: true });

  if (error) {
    console.error(`Error fetching tasks for ${relatedToType}:`, error);
    throw error;
  }

  return data;
};

export const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'related_to_name'>): Promise<Task> => {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await recordActivity({
      user_id: user.id,
      activity_type: 'task_created',
      description: `Tâche créée: ${data.title}`,
      related_to_type: 'task',
      related_to: data.id
    });
  }

  return data;
};

export const updateTask = async (id: string, task: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'related_to_name'>>): Promise<Task> => {
  const { data, error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await recordActivity({
      user_id: user.id,
      activity_type: 'task_updated',
      description: `Tâche mise à jour: ${data.title}`,
      related_to_type: 'task',
      related_to: data.id
    });
  }

  return data;
};

export const deleteTask = async (id: string): Promise<void> => {
  const task = await fetchTaskById(id);

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await recordActivity({
      user_id: user.id,
      activity_type: 'task_deleted',
      description: `Tâche supprimée: ${task.title}`,
      related_to_type: 'task',
      related_to: id
    });
  }
};

export const markTaskAsCompleted = async (id: string, completed: boolean = true): Promise<Task> => {
  const updates: Partial<Task> = {
    completed,
    status: completed ? 'completed' : 'not_started',
    completed_at: completed ? new Date().toISOString() : undefined
  };

  return updateTask(id, updates);
};

export const getTaskPriorities = (): {value: TaskPriority; label: string}[] => [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' }
];

export const getTaskStatuses = (): {value: TaskStatus; label: string}[] => [
  { value: 'not_started', label: 'Non commencée' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'waiting', label: 'En attente' },
  { value: 'deferred', label: 'Reportée' },
  { value: 'completed', label: 'Terminée' }
];