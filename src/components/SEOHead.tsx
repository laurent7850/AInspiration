import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
  getSEOConfig,
  getHreflangTags,
  getOrganizationSchema,
  defaultSEO,
  type SupportedLanguage
} from '../config/seoConfig';

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
  includeOrganizationSchema?: boolean;
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
  schema,
  includeOrganizationSchema = false
}) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const currentLang = (i18n.language?.substring(0, 2) || 'fr') as SupportedLanguage;

  const { siteUrl, siteName, defaultImage: defaultOgImage, twitterHandle } = defaultSEO;
  const currentUrl = `${siteUrl}${location.pathname}`;

  // Get SEO config from centralized configuration
  const seoConfig = getSEOConfig(location.pathname, currentLang);

  // Use provided values or fall back to config
  const pageTitle = title || seoConfig.title;
  const pageDescription = description || seoConfig.description;
  const pageKeywords = keywords || seoConfig.keywords;
  const pageImage = image || `${siteUrl}${defaultOgImage}`;

  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow'
  ].join(', ');

  // Get hreflang tags
  const hreflangTags = getHreflangTags(location.pathname);

  // Get locale for Open Graph
  const getOgLocale = (lang: string) => {
    switch (lang) {
      case 'en': return 'en_US';
      case 'nl': return 'nl_BE';
      default: return 'fr_BE';
    }
  };

  // Build combined schema
  const combinedSchema = [];

  if (includeOrganizationSchema) {
    combinedSchema.push(getOrganizationSchema());
  }

  if (schema) {
    combinedSchema.push(schema);
  }

  // WebPage schema (always included)
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': article ? 'Article' : 'WebPage',
    name: pageTitle,
    description: pageDescription,
    url: currentUrl,
    inLanguage: currentLang,
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl
    },
    ...(article && publishedTime && {
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      author: author ? {
        '@type': 'Person',
        name: author
      } : {
        '@type': 'Organization',
        name: siteName
      }
    })
  };
  combinedSchema.push(webPageSchema);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={currentLang} />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {pageKeywords && <meta name="keywords" content={pageKeywords} />}
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />

      {/* Canonical */}
      <link rel="canonical" href={canonical || currentUrl} />

      {/* Hreflang Tags for Multilingual SEO */}
      {hreflangTags.map((tag) => (
        <link
          key={tag.lang}
          rel="alternate"
          hrefLang={tag.lang}
          href={tag.href}
        />
      ))}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={getOgLocale(currentLang)} />
      <meta property="og:locale:alternate" content={currentLang === 'fr' ? 'en_US' : 'fr_BE'} />
      <meta property="og:locale:alternate" content={currentLang === 'nl' ? 'fr_BE' : 'nl_BE'} />
      <meta property="og:site_name" content={siteName} />

      {article && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {article && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {article && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />

      {/* Additional Meta Tags */}
      <meta name="author" content={siteName} />
      <meta name="theme-color" content="#4f46e5" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="geo.region" content="BE" />
      <meta name="geo.placename" content="Belgium" />

      {/* Structured Data (JSON-LD) */}
      {combinedSchema.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(
            combinedSchema.length === 1 ? combinedSchema[0] : combinedSchema
          )}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
