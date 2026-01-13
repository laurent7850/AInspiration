import React, { useEffect, useState } from 'react';
import { Calendar, User, Tag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { fetchPublishedPosts } from '../services/blogService';
import type { BlogPost } from '../services/blogService';

export default function Blog() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const posts = await fetchPublishedPosts();
        const currentLang = (i18n.language || 'fr').split('-')[0];
        const filteredPosts = posts.filter(post => post.language === currentLang);
        setArticles(filteredPosts);
      } catch (err) {
        console.error('Error loading blog posts:', err);
        setError('Erreur lors du chargement des articles');
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [i18n.language]);

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <Helmet>
        <title>Blog AInspiration | Actualités et insights IA</title>
        <meta name="description" content="Découvrez les derniers articles, cas d'usage et conseils sur l'intelligence artificielle pour les entreprises." />
      </Helmet>
      
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog AInspiration
          </h1>
          <p className="text-xl text-gray-600">
            Insights et actualités sur l'IA pour les entreprises
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="max-w-5xl mx-auto text-center py-20">
            <p className="text-gray-600">Aucun article disponible pour le moment.</p>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <div className="grid gap-8 max-w-5xl mx-auto">
            {articles.map((article) => {
              const formattedDate = article.published_at
                ? new Date(article.published_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : '';

              const defaultImage = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60";

              return (
                <article
                  key={article.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <img
                        src={article.image_url || defaultImage}
                        alt={article.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="md:w-2/3 p-8">
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formattedDate}
                        </span>
                        {article.author_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {article.author_name}
                          </span>
                        )}
                        {article.category && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {article.category}
                          </span>
                        )}
                        {article.read_time && (
                          <span className="text-gray-500">
                            {article.read_time} min
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {article.title}
                      </h2>

                      {article.excerpt && (
                        <p className="text-gray-600 mb-6">
                          {article.excerpt}
                        </p>
                      )}

                      <button
                        onClick={() => navigate(`/blog/${article.slug}`)}
                        className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                      >
                        Lire l'article
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}