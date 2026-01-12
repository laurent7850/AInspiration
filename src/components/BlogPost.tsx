import React, { useEffect, useState } from 'react';
import { Calendar, User, Tag, ArrowLeft, Clock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPostBySlug, BlogPost as BlogPostType } from '../services/blogService';
import BlogCTA from './blog/BlogCTA';
import EnhancedBlogContent from './blog/EnhancedBlogContent';

export default function BlogPost() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        setError('Article non trouvé');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchPostBySlug(slug);
        setPost(data);
      } catch (err) {
        console.error('Error loading blog post:', err);
        setError('Impossible de charger l\'article');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
              <div className="h-96 bg-gray-200 rounded mb-8"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !post) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Article non trouvé</h1>
            <p className="text-gray-600 mb-8">{error || 'Cet article n\'existe pas ou n\'est plus disponible.'}</p>
            <button
              onClick={() => navigate('/blog')}
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour au blog
            </button>
          </div>
        </div>
      </section>
    );
  }

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date(post.created_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  const getCtaVariant = (): 'audit' | 'consultation' | 'formation' | 'default' => {
    const category = post.category?.toLowerCase() || '';
    const title = post.title?.toLowerCase() || '';
    const content = post.content?.toLowerCase() || '';

    if (category.includes('formation') || title.includes('formation') || content.includes('formation')) {
      return 'formation';
    }
    if (category.includes('conseil') || title.includes('conseil') || title.includes('accompagnement')) {
      return 'consultation';
    }
    if (category.includes('audit') || title.includes('audit') || title.includes('roi') || title.includes('transformation')) {
      return 'audit';
    }
    return 'audit';
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate('/blog')}
          className="mb-8 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au blog
        </button>

        <article className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-600">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {formattedDate}
              </span>
              {post.author_name && (
                <span className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {post.author_name}
                </span>
              )}
              {post.category && (
                <span className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  {post.category}
                </span>
              )}
              {post.read_time && (
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {post.read_time} min de lecture
                </span>
              )}
            </div>
          </div>

          {post.image_url && (
            <div className="relative h-[400px] rounded-2xl overflow-hidden mb-12 shadow-2xl">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          )}

          <EnhancedBlogContent content={post.content} title={post.title} />

          <BlogCTA variant={getCtaVariant()} />
        </article>
      </div>
    </section>
  );
}