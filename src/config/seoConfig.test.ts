import { describe, it, expect } from 'vitest';
import {
  getSEOConfig,
  getHreflangTags,
  getOrganizationSchema,
  getBreadcrumbSchema,
  getServiceSchema,
  getBlogPostSchema,
  getFAQSchema,
  getReviewSchema,
  defaultSEO,
  seoPages,
} from './seoConfig';

describe('defaultSEO', () => {
  it('should have correct base config', () => {
    expect(defaultSEO.siteName).toBe('AInspiration');
    expect(defaultSEO.siteUrl).toBe('https://ainspiration.eu');
    expect(defaultSEO.defaultImage).toBe('/og-image.png');
  });
});

describe('getSEOConfig', () => {
  it('should return French config by default', () => {
    const config = getSEOConfig('/');
    expect(config.title).toContain('AInspiration');
    expect(config.description).toBeTruthy();
  });

  it('should return English config when requested', () => {
    const config = getSEOConfig('/', 'en');
    expect(config.title).toContain('AInspiration');
    expect(config.description).toContain('AI');
  });

  it('should return Dutch config when requested', () => {
    const config = getSEOConfig('/', 'nl');
    expect(config.title).toContain('AInspiration');
  });

  it('should return config for known pages', () => {
    const knownPaths = ['/', '/contact', '/solutions', '/blog', '/privacy'];
    knownPaths.forEach((path) => {
      const config = getSEOConfig(path, 'fr');
      expect(config.title).toBeTruthy();
      expect(config.description).toBeTruthy();
    });
  });

  it('should return fallback for unknown paths', () => {
    const config = getSEOConfig('/unknown-page-xyz', 'fr');
    expect(config.title).toContain('AInspiration');
    expect(config.description).toBeTruthy();
  });

  it('should handle dynamic routes (strip UUID)', () => {
    const config = getSEOConfig('/contacts/a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'fr');
    expect(config.title).toContain('Contacts');
  });

  it('should return keywords for main pages', () => {
    const config = getSEOConfig('/', 'fr');
    expect(config.keywords).toBeTruthy();
  });
});

describe('getHreflangTags', () => {
  it('should return 4 tags (fr, en, nl, x-default)', () => {
    const tags = getHreflangTags('/contact');
    expect(tags).toHaveLength(4);
    expect(tags.map((t) => t.lang)).toEqual(['fr', 'en', 'nl', 'x-default']);
  });

  it('should build correct URLs', () => {
    const tags = getHreflangTags('/solutions');
    const frTag = tags.find((t) => t.lang === 'fr');
    const enTag = tags.find((t) => t.lang === 'en');
    const nlTag = tags.find((t) => t.lang === 'nl');
    const defaultTag = tags.find((t) => t.lang === 'x-default');

    expect(frTag?.href).toBe('https://ainspiration.eu/solutions');
    expect(enTag?.href).toBe('https://ainspiration.eu/en/solutions');
    expect(nlTag?.href).toBe('https://ainspiration.eu/nl/solutions');
    expect(defaultTag?.href).toBe('https://ainspiration.eu/solutions');
  });

  it('should handle root path', () => {
    const tags = getHreflangTags('/');
    const frTag = tags.find((t) => t.lang === 'fr');
    expect(frTag?.href).toBe('https://ainspiration.eu/');
  });
});

describe('getOrganizationSchema', () => {
  it('should return valid schema.org Organization', () => {
    const schema = getOrganizationSchema();
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBe('AInspiration');
    expect(schema.url).toBe('https://ainspiration.eu');
  });

  it('should include contact point with languages', () => {
    const schema = getOrganizationSchema();
    expect(schema.contactPoint.availableLanguage).toContain('French');
    expect(schema.contactPoint.availableLanguage).toContain('English');
    expect(schema.contactPoint.availableLanguage).toContain('Dutch');
  });
});

describe('getBreadcrumbSchema', () => {
  it('should start with Home', () => {
    const schema = getBreadcrumbSchema('/contact', 'fr');
    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement[0].name).toBe('Accueil');
    expect(schema.itemListElement[0].position).toBe(1);
  });

  it('should translate breadcrumb names', () => {
    const frSchema = getBreadcrumbSchema('/contact', 'fr');
    const enSchema = getBreadcrumbSchema('/contact', 'en');
    expect(frSchema.itemListElement[1].name).toBe('Contact');
    expect(enSchema.itemListElement[0].name).toBe('Home');
  });

  it('should handle multi-segment paths', () => {
    const schema = getBreadcrumbSchema('/blog/thierry-facturation-ia', 'fr');
    expect(schema.itemListElement).toHaveLength(3); // Home + Blog + article
    expect(schema.itemListElement[1].name).toBe('Blog');
  });
});

describe('getServiceSchema', () => {
  it('should return valid Service schema', () => {
    const schema = getServiceSchema('Test Service', 'A test description');
    expect(schema['@type']).toBe('Service');
    expect(schema.name).toBe('Test Service');
    expect(schema.description).toBe('A test description');
    expect(schema.provider.name).toBe('AInspiration');
  });
});

describe('getBlogPostSchema', () => {
  it('should return valid BlogPosting schema', () => {
    const schema = getBlogPostSchema('Test Title', 'Test desc', '2026-01-01', 'Author');
    expect(schema['@type']).toBe('BlogPosting');
    expect(schema.headline).toBe('Test Title');
    expect(schema.datePublished).toBe('2026-01-01');
    expect(schema.author.name).toBe('Author');
    expect(schema.publisher.name).toBe('AInspiration');
  });
});

describe('getFAQSchema', () => {
  it('should return valid FAQPage schema', () => {
    const faqs = [
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2', answer: 'A2' },
    ];
    const schema = getFAQSchema(faqs);
    expect(schema['@type']).toBe('FAQPage');
    expect(schema.mainEntity).toHaveLength(2);
    expect(schema.mainEntity[0].name).toBe('Q1');
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe('A1');
  });
});

describe('getReviewSchema', () => {
  it('should calculate aggregate rating', () => {
    const reviews = [
      { author: 'Alice', rating: 5, text: 'Great' },
      { author: 'Bob', rating: 4, text: 'Good' },
    ];
    const schema = getReviewSchema(reviews);
    expect(schema.aggregateRating.ratingValue).toBe('4.5');
    expect(schema.aggregateRating.reviewCount).toBe(2);
  });
});

describe('seoPages coverage', () => {
  it('should have all three languages for each page', () => {
    Object.entries(seoPages).forEach(([path, config]) => {
      expect(config.fr, `${path} missing fr`).toBeDefined();
      expect(config.en, `${path} missing en`).toBeDefined();
      expect(config.nl, `${path} missing nl`).toBeDefined();
      expect(config.fr.title, `${path} fr missing title`).toBeTruthy();
      expect(config.en.title, `${path} en missing title`).toBeTruthy();
      expect(config.nl.title, `${path} nl missing title`).toBeTruthy();
    });
  });
});
