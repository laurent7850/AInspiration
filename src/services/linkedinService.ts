import { api } from '../utils/api';

export interface LinkedinPost {
  id: string;
  title: string;
  hook: string;
  content: string;
  cta: string;
  hashtags: string[];
  service_tags: string[];
  theme_tags: string[];
  angle: string;
  status: 'generated' | 'review_pending' | 'approved' | 'published' | 'failed' | 'queued' | 'draft';
  linkedin_post_id?: string;
  linkedin_post_url?: string;
  published_at?: string;
  similarity_score?: number;
  approved_by?: string;
  approved_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface LinkedinStatus {
  connected: boolean;
  subjectId?: string;
  profileData?: { name?: string; email?: string; picture?: string };
  expiresAt?: string;
  daysLeft?: number;
  message?: string;
}

export interface LinkedinSettings {
  editorial_config?: { max_length: number; min_length: number; max_hashtags: number; min_hashtags: number };
  linkedin_config?: { publish_enabled: boolean; auto_publish: boolean; manual_approval: boolean };
  scheduling_config?: { cron_day: string; cron_hour: number; cron_minute: number; timezone: string };
  content_angles?: string[];
}

export const fetchLinkedinStatus = () =>
  api.get<LinkedinStatus>('/linkedin/status');

export const fetchLinkedinConnectUrl = () =>
  api.get<{ url: string; state: string }>('/linkedin/connect');

export const fetchLinkedinPosts = (params?: { status?: string; limit?: number; offset?: number }) =>
  api.get<{ posts: LinkedinPost[]; total: number }>('/linkedin/posts', params);

export const generateLinkedinPost = () =>
  api.post<LinkedinPost>('/linkedin/posts/generate');

export const publishLinkedinPost = (id: string) =>
  api.post<{ success: boolean; postId?: string; postUrl?: string }>(`/linkedin/posts/${id}/publish`);

export const approveLinkedinPost = (id: string) =>
  api.post<{ success: boolean }>(`/linkedin/posts/${id}/approve`);

export const updateLinkedinPost = (id: string, data: Partial<LinkedinPost>) =>
  api.put<LinkedinPost>(`/linkedin/posts/${id}`, data);

export const deleteLinkedinPost = (id: string) =>
  api.delete(`/linkedin/posts/${id}`);

export const fetchLinkedinSettings = () =>
  api.get<LinkedinSettings>('/linkedin/settings');

export const updateLinkedinSettings = (key: string, value: unknown) =>
  api.put<{ success: boolean }>('/linkedin/settings', { key, value });
