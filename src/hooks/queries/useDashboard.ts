import { useQuery } from '@tanstack/react-query';
import { fetchOpportunities } from '../../services/opportunityService';
import { fetchTasks } from '../../services/taskService';
import { fetchContacts } from '../../services/contactService';
import { fetchActivities } from '../../services/activityService';
import { qk } from './queryKeys';

// Dashboard hooks — each query is independent so it can refetch on its own.
// React Query dedupes by key so visiting another page that shares the contacts
// query doesn't re-fetch.

export function useOpportunitiesQuery() {
  return useQuery({
    queryKey: qk.opportunities.list(),
    queryFn: () => fetchOpportunities(),
  });
}

export function useTasksQuery() {
  return useQuery({
    queryKey: qk.tasks.list(),
    queryFn: () => fetchTasks(),
  });
}

export function useContactsQuery() {
  return useQuery({
    queryKey: qk.contacts.list(),
    queryFn: () => fetchContacts(),
  });
}

export function useActivitiesQuery(limit = 10) {
  return useQuery({
    queryKey: qk.activities.list({ limit }),
    queryFn: () => fetchActivities(limit),
  });
}
