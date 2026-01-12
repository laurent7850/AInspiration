import { supabase } from '../utils/supabase';
import { Activity } from '../utils/types';

export const fetchActivities = async (limit: number = 20): Promise<Activity[]> => {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  const enrichedActivities = await Promise.all(
    data.map(async (activity) => {
      let related_to_name = undefined;

      if (activity.related_to && activity.related_to_type) {
        try {
          switch (activity.related_to_type) {
            case 'opportunity': {
              const { data: opp } = await supabase
                .from('opportunities')
                .select('name')
                .eq('id', activity.related_to)
                .maybeSingle();
              related_to_name = opp?.name;
              break;
            }
            case 'contact': {
              const { data: contact } = await supabase
                .from('contacts')
                .select('first_name, last_name')
                .eq('id', activity.related_to)
                .maybeSingle();
              if (contact) {
                related_to_name = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
              }
              break;
            }
            case 'company': {
              const { data: company } = await supabase
                .from('companies')
                .select('name')
                .eq('id', activity.related_to)
                .maybeSingle();
              related_to_name = company?.name;
              break;
            }
            case 'task': {
              const { data: task } = await supabase
                .from('tasks')
                .select('title')
                .eq('id', activity.related_to)
                .maybeSingle();
              related_to_name = task?.title;
              break;
            }
            case 'product': {
              const { data: product } = await supabase
                .from('products')
                .select('name')
                .eq('id', activity.related_to)
                .maybeSingle();
              related_to_name = product?.name;
              break;
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch related entity for activity ${activity.id}:`, err);
        }
      }

      return {
        ...activity,
        related_to_name
      };
    })
  );

  return enrichedActivities;
};

export const fetchActivitiesByRelation = async (
  relatedToType: 'opportunity' | 'contact' | 'company' | 'task',
  relatedToId: string,
  limit: number = 20
): Promise<Activity[]> => {
  const { data, error } = await supabase
    .from('activities')
    .select(`*`)
    .eq('related_to_type', relatedToType)
    .eq('related_to', relatedToId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`Error fetching activities for ${relatedToType}:`, error);
    throw error;
  }

  return data;
};

export const recordActivity = async (
  activity: Omit<Activity, 'id' | 'created_at' | 'related_to_name'>
): Promise<Activity> => {
  const { data, error } = await supabase
    .from('activities')
    .insert(activity)
    .select()
    .single();

  if (error) {
    console.error('Error recording activity:', error);
    throw error;
  }

  return data;
};