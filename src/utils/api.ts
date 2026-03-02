/**
 * Client HTTP centralisé — remplace le SDK Supabase
 * Gère le JWT token et les appels vers l'API Express/PostgreSQL
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ==================== TOKEN MANAGEMENT ====================

let token: string | null = localStorage.getItem('auth_token');

export function setToken(newToken: string) {
  token = newToken;
  localStorage.setItem('auth_token', newToken);
}

export function clearToken() {
  token = null;
  localStorage.removeItem('auth_token');
}

export function getToken(): string | null {
  return token;
}

// ==================== ERROR CLASS ====================

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// ==================== CORE REQUEST ====================

type QueryParams = Record<string, string | number | boolean | undefined | null>;

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  params?: QueryParams
): Promise<T> {
  let url = `${API_BASE}${path}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(
      errorData.error || errorData.message || res.statusText,
      res.status
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

// ==================== PUBLIC API ====================

export const api = {
  get: <T>(path: string, params?: QueryParams) =>
    request<T>('GET', path, undefined, params),

  post: <T>(path: string, body?: unknown) =>
    request<T>('POST', path, body),

  put: <T>(path: string, body?: unknown) =>
    request<T>('PUT', path, body),

  delete: <T>(path: string) =>
    request<T>('DELETE', path),
};
