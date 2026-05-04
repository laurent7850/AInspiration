// Centralized query key factory — one source of truth for cache invalidation.
// See https://tkdodo.eu/blog/effective-react-query-keys
export const qk = {
  contacts: {
    all: ['contacts'] as const,
    list: (params?: { limit?: number; offset?: number; company_id?: string }) =>
      ['contacts', 'list', params || {}] as const,
    detail: (id: string) => ['contacts', 'detail', id] as const,
  },
  opportunities: {
    all: ['opportunities'] as const,
    list: (params?: { status?: string; company_id?: string; limit?: number; offset?: number }) =>
      ['opportunities', 'list', params || {}] as const,
    detail: (id: string) => ['opportunities', 'detail', id] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    list: (params?: { status?: string; priority?: string; limit?: number; offset?: number }) =>
      ['tasks', 'list', params || {}] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
  },
  activities: {
    all: ['activities'] as const,
    list: (params?: { entity_type?: string; entity_id?: string; limit?: number; enriched?: boolean }) =>
      ['activities', 'list', params || {}] as const,
  },
  companies: {
    all: ['companies'] as const,
    list: ['companies', 'list'] as const,
    detail: (id: string) => ['companies', 'detail', id] as const,
  },
  products: {
    all: ['products'] as const,
    list: ['products', 'list'] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
  },
};
