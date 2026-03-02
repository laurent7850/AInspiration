import { api } from '../utils/api';
import { Task, TaskPriority, TaskStatus } from '../utils/types';
import { recordActivity } from './activityService';

export const fetchTasks = async (): Promise<Task[]> => {
  return api.get<Task[]>('/tasks');
};

export const fetchTaskById = async (id: string): Promise<Task> => {
  return api.get<Task>(`/tasks/${id}`);
};

export const fetchTasksByRelation = async (
  relatedToType: 'opportunity' | 'contact' | 'company',
  relatedToId: string
): Promise<Task[]> => {
  return api.get<Task[]>('/tasks', {
    related_to_type: relatedToType,
    related_to: relatedToId
  });
};

export const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'related_to_name'>): Promise<Task> => {
  const data = await api.post<Task>('/tasks', task);

  try {
    await recordActivity({
      activity_type: 'task_created',
      description: `Tâche créée: ${data.title}`,
      related_to_type: 'task',
      related_to: data.id
    });
  } catch { /* non-blocking */ }

  return data;
};

export const updateTask = async (id: string, task: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'related_to_name'>>): Promise<Task> => {
  const data = await api.put<Task>(`/tasks/${id}`, task);

  try {
    await recordActivity({
      activity_type: 'task_updated',
      description: `Tâche mise à jour: ${data.title}`,
      related_to_type: 'task',
      related_to: data.id
    });
  } catch { /* non-blocking */ }

  return data;
};

export const deleteTask = async (id: string): Promise<void> => {
  let taskTitle: string | undefined;
  try {
    const task = await fetchTaskById(id);
    taskTitle = task.title;
  } catch { /* ignore */ }

  await api.delete(`/tasks/${id}`);

  if (taskTitle) {
    try {
      await recordActivity({
        activity_type: 'task_deleted',
        description: `Tâche supprimée: ${taskTitle}`,
        related_to_type: 'task',
        related_to: id
      });
    } catch { /* non-blocking */ }
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
