import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  article?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
  schema?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image,
  article = false,
  publishedTime,
  modifiedTime,
  author,
  noindex = false,
  nofollow = false,
  canonical,
  schema
}) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const currentLang = i18n.language;

  const siteUrl = 'https://aimagination.eu';
  const defaultImage = `${siteUrl}/og-image.svg`;
  const currentUrl = `${siteUrl}${location.pathname}`;

  const pageTitle = title
    ? `${title} | Aimagination`
    : 'Aimagination | Solutions d\'Intelligence Artificielle pour Entreprises';

  const pageDescription = description ||
    'Transformez votre entreprise avec nos solutions d\'IA. Audit gratuit, recommandations personnalisées et accompagnement expert pour optimiser vos processus.';

  const pageImage = image || defaultImage;

  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow'
  ].join(', ');

  const alternateUrls = {
    fr: `${siteUrl}/fr${location.pathname}`,
    en: `${siteUrl}/en${location.pathname}`
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={currentLang} />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />

      {/* Canonical */}
      <link rel="canonical" href={canonical || currentUrl} />

      {/* Hreflang Tags for Multilingual SEO */}
      <link rel="alternate" hrefLang="fr" href={alternateUrls.fr} />
      <link rel="alternate" hrefLang="en" href={alternateUrls.en} />
      <link rel="alternate" hrefLang="x-default" href={alternateUrls.fr} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={currentLang === 'fr' ? 'fr_FR' : 'en_US'} />
      <meta property="og:locale:alternate" content={currentLang === 'fr' ? 'en_US' : 'fr_FR'} />
      <meta property="og:site_name" content="Aimagination" />

      {article && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          <meta property="article:modified_time" content={modifiedTime} />
          {author && <meta property="article:author" content={author} />}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      <meta name="twitter:creator" content="@aimagination" />

      {/* Additional Meta Tags */}
      <meta name="author" content="Aimagination" />
      <meta name="theme-color" content="#4f46e5" />
      <meta name="format-detection" content="telephone=no" />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
