import React from 'react';
import { useTranslation } from 'react-i18next';
import Blog from '../components/Blog';
import SEOHead from '../components/SEOHead';
import { getSEOConfig } from '../config/seoConfig';

export default function BlogPage() {
  const { i18n } = useTranslation();
  const seoConfig = getSEOConfig('/blog', i18n.language as 'fr' | 'en');

  return (
    <>
      <SEOHead
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
      />
      <Blog />
    </>
  );
}
