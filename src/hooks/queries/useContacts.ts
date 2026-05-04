import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { Contact } from '../../utils/types';
import { recordActivity } from '../../services/activityService';
import { qk } from './queryKeys';

interface ContactListParams {
  limit?: number;
  offset?: number;
  company_id?: string;
  [key: string]: string | number | undefined;
}

export function useContactsList(params: ContactListParams = {}) {
  return useQuery({
    queryKey: qk.contacts.list(params),
    queryFn: () => api.getWithMeta<Contact[]>('/contacts', params),
    placeholderData: keepPreviousData,
  });
}

export function useContact(id: string | null | undefined) {
  return useQuery({
    queryKey: qk.contacts.detail(id || ''),
    queryFn: () => api.get<Contact>(`/contacts/${id}`),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Contact>) => {
      const data = await api.post<Contact>('/contacts', input);
      const name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
      recordActivity({
        activity_type: 'contact_created',
        description: `Contact créé: ${name}`,
        related_to_type: 'contact',
        related_to: data.id,
      }).catch(() => {});
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.contacts.all });
    },
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; data: Partial<Contact> }) => {
      const updated = await api.put<Contact>(`/contacts/${input.id}`, input.data);
      const name = `${updated.first_name || ''} ${updated.last_name || ''}`.trim();
      recordActivity({
        activity_type: 'contact_updated',
        description: `Contact mis à jour: ${name}`,
        related_to_type: 'contact',
        related_to: updated.id,
      }).catch(() => {});
      return updated;
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: qk.contacts.all });
      qc.setQueryData(qk.contacts.detail(updated.id), updated);
    },
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      let contactName: string | undefined;
      try {
        const c = await api.get<Contact>(`/contacts/${id}`);
        contactName = `${c.first_name || ''} ${c.last_name || ''}`.trim();
      } catch {
        /* ignore */
      }
      await api.delete(`/contacts/${id}`);
      if (contactName) {
        recordActivity({
          user_id: userId,
          activity_type: 'contact_deleted',
          description: `Contact supprimé: ${contactName}`,
          related_to_type: 'contact',
          related_to: id,
        }).catch(() => {});
      }
      return id;
    },
    // Optimistic update — remove from cache before server confirms
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: qk.contacts.all });
      const previous = qc.getQueriesData<{ data: Contact[]; total: number | null }>({
        queryKey: qk.contacts.all,
      });
      previous.forEach(([key, value]) => {
        if (value?.data) {
          qc.setQueryData(key, {
            data: value.data.filter((c) => c.id !== id),
            total: value.total !== null ? value.total - 1 : null,
          });
        }
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      // Rollback on failure
      ctx?.previous.forEach(([key, value]) => qc.setQueryData(key, value));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.contacts.all });
    },
  });
}
