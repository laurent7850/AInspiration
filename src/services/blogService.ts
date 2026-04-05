export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image_url?: string;
  author_id?: string;
  category?: string;
  published: boolean;
  featured: boolean;
  read_time?: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  language: string;

  // Joined fields
  author_name?: string;
  author_avatar?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  post_count?: number;
}

export interface BlogComment {
  id: string;
  post_id: string;
  user_id?: string;
  name?: string;
  email?: string;
  content: string;
  approved: boolean;
  created_at: string;

  // Joined fields
  user_name?: string;
  user_avatar?: string;
}

const API_BASE = '/api/blog-posts';

export async function fetchPublishedPosts(language = 'fr'): Promise<BlogPost[]> {
  const res = await fetch(`${API_BASE}?language=${language}`);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/slug/${slug}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Post with slug ${slug} not found`);
    throw new Error('Failed to fetch post');
  }
  return res.json();
}

export async function fetchFeaturedPosts(limit = 1): Promise<BlogPost[]> {
  const posts = await fetchPublishedPosts();
  return posts.filter(p => p.featured).slice(0, limit);
}

export async function fetchPostsByCategory(category: string, language = 'fr'): Promise<BlogPost[]> {
  const res = await fetch(`${API_BASE}?language=${language}&category=${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error('Failed to fetch posts by category');
  return res.json();
}

export async function fetchCategories(): Promise<BlogCategory[]> {
  const posts = await fetchPublishedPosts();
  const counts: Record<string, number> = {};
  for (const p of posts) {
    if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
  }
  return Object.entries(counts).map(([name, count]) => ({
    id: name,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    post_count: count,
  }));
}

/** Stub -- not yet supported via local API. */
export async function fetchComments(_postId: string): Promise<BlogComment[]> {
  return [];
}

/** Stub -- not yet supported via local API. */
export async function addComment(
  _postId: string,
  _content: string,
  _userId?: string,
  _name?: string,
  _email?: string
): Promise<BlogComment> {
  throw new Error('Comments not yet supported');
}

export async function searchPosts(query: string): Promise<BlogPost[]> {
  const posts = await fetchPublishedPosts();
  const q = query.toLowerCase();
  return posts.filter(p =>
    p.title.toLowerCase().includes(q) ||
    (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
    p.content.toLowerCase().includes(q)
  );
}

/** Admin stubs -- use the webhook API instead. */
export async function createPost(_post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost> {
  throw new Error('Use webhook API to create posts');
}

export async function updatePost(_id: string, _updates: Partial<BlogPost>): Promise<BlogPost> {
  throw new Error('Use webhook API to update posts');
}

export async function deletePost(_id: string): Promise<void> {
  throw new Error('Use webhook API to delete posts');
}
