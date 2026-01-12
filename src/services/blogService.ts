import { supabase } from '../utils/supabase';

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

// Fetch all published blog posts
export const fetchPublishedPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching published posts:', error);
    throw error;
  }

  return data || [];
};

// Fetch a single blog post by slug
export const fetchPostBySlug = async (slug: string): Promise<BlogPost> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching post with slug ${slug}:`, error);
    throw error;
  }

  if (!data) {
    throw new Error(`Post with slug ${slug} not found`);
  }

  return data;
};

// Fetch featured blog posts
export const fetchFeaturedPosts = async (limit: number = 1): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured posts:', error);
    throw error;
  }

  return data || [];
};

// Fetch posts by category
export const fetchPostsByCategory = async (category: string): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .eq('category', category)
    .order('published_at', { ascending: false });

  if (error) {
    console.error(`Error fetching posts for category ${category}:`, error);
    throw error;
  }

  return data || [];
};

// Fetch all categories with post count
export const fetchCategories = async (): Promise<BlogCategory[]> => {
  // First get all categories
  const { data: categories, error: categoriesError } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name');

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
    throw categoriesError;
  }

  // Then get post counts for each category
  const { data: posts, error: postsError } = await supabase
    .from('blog_posts')
    .select('category')
    .eq('published', true);

  if (postsError) {
    console.error('Error fetching post categories:', postsError);
    throw postsError;
  }

  // Count posts per category
  const categoryCounts: Record<string, number> = {};
  posts.forEach(post => {
    if (post.category) {
      categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
    }
  });

  // Combine the data
  return categories.map(category => ({
    ...category,
    post_count: categoryCounts[category.name] || 0
  }));
};

// Fetch comments for a post
export const fetchComments = async (postId: string): Promise<BlogComment[]> => {
  const { data, error } = await supabase
    .from('blog_comments')
    .select('*')
    .eq('post_id', postId)
    .eq('approved', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    throw error;
  }

  return data || [];
};

// Add a comment to a post
export const addComment = async (
  postId: string, 
  content: string, 
  userId?: string,
  name?: string,
  email?: string
): Promise<BlogComment> => {
  const comment = {
    post_id: postId,
    content,
    user_id: userId,
    name: userId ? undefined : name,
    email: userId ? undefined : email,
    approved: userId ? true : false // Auto-approve comments from logged-in users
  };

  const { data, error } = await supabase
    .from('blog_comments')
    .insert(comment)
    .select()
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    throw error;
  }

  return data;
};

// Search blog posts
export const searchPosts = async (query: string): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
    .order('published_at', { ascending: false });

  if (error) {
    console.error(`Error searching posts for "${query}":`, error);
    throw error;
  }

  return data || [];
};

// Create a new blog post (for admin use)
export const createPost = async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert(post)
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }

  return data;
};

// Update a blog post (for admin use)
export const updatePost = async (id: string, updates: Partial<BlogPost>): Promise<BlogPost> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating post ${id}:`, error);
    throw error;
  }

  return data;
};

// Delete a blog post (for admin use)
export const deletePost = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting post ${id}:`, error);
    throw error;
  }
};