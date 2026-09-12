import React, { useEffect, useState } from 'react';
import { Calendar, User, Tag, ArrowLeft, Clock, ArrowRight } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchPostBySlug, BlogPost as BlogPostType } from '../services/blogService';
import BlogCTA from './blog/BlogCTA';
import EnhancedBlogContent from './blog/EnhancedBlogContent';
import SEOHead from './SEOHead';
import { getBlogPostSchema } from '../config/seoConfig';
import { metaTitleFor, metaDescriptionFor, plainTextFrom } from '../utils/seoMeta';
import { useLocalizedPath } from '../hooks/useLocalizedPath';

export default function BlogPost() {
  const navigate = useNavigate();
  const { localizedPath } = useLocalizedPath();
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

  const titleFromSlug = slug
    ? slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'Article';

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <SEOHead
          title={metaTitleFor(titleFromSlug)}
          description={`Article du blog AInspiration sur ${titleFromSlug.toLowerCase()}. Conseils, retours d'expérience et bonnes pratiques IA pour PME.`}
          article={true}
        />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="sr-only">{titleFromSlug}</h1>
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
        <SEOHead
          title={metaTitleFor(titleFromSlug)}
          description="Article non trouvé. Découvrez nos autres articles sur l'intelligence artificielle pour PME."
          noindex={true}
        />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display font-light text-3xl sm:text-5xl text-ink mb-4">Article non trouvé</h1>
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

  // La date porte un libellé et une balise <time> : un moteur génératif cite le
  // texte affiché, pas les méta article:published_time. Elle suit la langue de
  // l'article (les traductions -en / -nl affichaient un mois français).
  const dateLocale = post.language === 'nl' ? 'nl-NL' : post.language === 'en' ? 'en-US' : 'fr-FR';
  const dateLabels = post.language === 'nl'
    ? { published: 'Gepubliceerd op', updated: 'Bijgewerkt op' }
    : post.language === 'en'
      ? { published: 'Published on', updated: 'Updated on' }
      : { published: 'Publié le', updated: 'Mis à jour le' };
  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' });
  const isoDay = (value?: string) => (value ? new Date(value).toISOString().slice(0, 10) : null);

  const publishedIso = post.published_at || post.created_at;
  const formattedDate = formatDate(publishedIso);
  // Affichée seulement quand la mise à jour tombe un autre jour que la
  // publication : sinon la ligne répète deux fois la même date.
  const updatedIso = isoDay(post.updated_at) !== isoDay(publishedIso) ? post.updated_at : null;

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

  // Same rules as the server injection, and the same source order: the
  // excerpt when the author wrote one, the body otherwise. The two used to
  // disagree on every article.
  const articleDescription = metaDescriptionFor(post.excerpt, plainTextFrom(post.content) || post.title);

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <SEOHead
        title={metaTitleFor(post.title)}
        description={articleDescription}
        image={post.image_url}
        article={true}
        publishedTime={post.published_at || post.created_at}
        modifiedTime={post.updated_at || post.published_at || post.created_at}
        author={post.author_name || 'AInspiration'}
        schema={getBlogPostSchema(
          post.title,
          articleDescription,
          post.published_at || post.created_at,
          post.author_name || 'AInspiration',
          {
            image: post.image_url,
            dateModified: post.updated_at || post.published_at || post.created_at,
            slug: slug,
            wordCount: post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).length : undefined,
            category: post.category
          }
        )}
      />
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
                <time dateTime={isoDay(publishedIso) ?? undefined}>
                  {dateLabels.published} {formattedDate}
                </time>
              </span>
              {updatedIso && (
                <span className="flex items-center gap-2">
                  <time dateTime={isoDay(updatedIso) ?? undefined}>
                    {dateLabels.updated} {formatDate(updatedIso)}
                  </time>
                </span>
              )}
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
            <div className="relative h-[250px] sm:h-[350px] md:h-[400px] rounded-2xl overflow-hidden mb-12 shadow-2xl">
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

          {/* Internal linking - pages de services liees */}
          <nav className="mt-12 pt-8 border-t border-gray-200" aria-label="Articles et services liés">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Découvrir nos solutions</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link to={localizedPath('/automatisation')} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors">
                <ArrowRight className="w-4 h-4" />
                Automatisation IA
              </Link>
              <Link to={localizedPath('/solutions')} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors">
                <ArrowRight className="w-4 h-4" />
                Toutes nos solutions
              </Link>
              <Link to={localizedPath('/contact')} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors">
                <ArrowRight className="w-4 h-4" />
                Audit IA gratuit
              </Link>
            </div>
          </nav>
        </article>
      </div>
    </section>
  );
}
