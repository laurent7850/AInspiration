import { api } from '../utils/api';
import { Activity } from '../utils/types';

export const fetchActivities = async (limit: number = 20): Promise<Activity[]> => {
  return api.get<Activity[]>('/activities', { enriched: true, limit });
};

export const fetchActivitiesByRelation = async (
  relatedToType: 'opportunity' | 'contact' | 'company' | 'task',
  relatedToId: string,
  limit: number = 20
): Promise<Activity[]> => {
  return api.get<Activity[]>('/activities', {
    related_to_type: relatedToType,
    related_to: relatedToId,
    limit
  });
};

export const recordActivity = async (
  activity: Omit<Activity, 'id' | 'created_at' | 'related_to_name'>
): Promise<Activity> => {
  return api.post<Activity>('/activities', activity);
};
