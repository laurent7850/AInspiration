export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://ainspiration.eu/#organization",
  "name": "AInspiration",
  "url": "https://ainspiration.eu",
  "logo": {
    "@type": "ImageObject",
    "url": "https://ainspiration.eu/logo-ainspiration.png",
    "width": 512,
    "height": 512
  },
  "image": "https://ainspiration.eu/og-image.png",
  "description": "Solutions d'Intelligence Artificielle pour PME — automatisation, audit gratuit, conseil, formation et accompagnement IA en Belgique et France.",
  "email": "info@ainspiration.eu",
  "telephone": "+32477942865",
  "foundingDate": "2025",
  "founder": {
    "@type": "Person",
    "name": "Laurent Doyen"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Grand place 50",
    "addressLocality": "Enghien",
    "postalCode": "7850",
    "addressRegion": "Hainaut",
    "addressCountry": "BE"
  },
  "areaServed": [
    { "@type": "Country", "name": "Belgium" },
    { "@type": "Country", "name": "France" }
  ],
  "knowsAbout": [
    "Artificial Intelligence",
    "Machine Learning",
    "Business Automation",
    "Digital Transformation",
    "Chatbots",
    "Data Analysis"
  ],
  "sameAs": [
    "https://www.linkedin.com/company/ainspiration"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+32477942865",
    "contactType": "customer service",
    "email": "info@ainspiration.eu",
    "availableLanguage": ["French", "English", "Dutch"]
  }
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://ainspiration.eu/#website",
  "name": "AInspiration",
  "url": "https://ainspiration.eu",
  "inLanguage": ["fr", "en", "nl"],
  "publisher": { "@id": "https://ainspiration.eu/#organization" },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://ainspiration.eu/blog?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://ainspiration.eu/#localbusiness",
  "name": "AInspiration",
  "image": "https://ainspiration.eu/og-image.png",
  "url": "https://ainspiration.eu",
  "telephone": "+32477942865",
  "email": "info@ainspiration.eu",
  "priceRange": "€€-€€€",
  "description": "Conseil et accompagnement en Intelligence Artificielle pour PME. Audit gratuit, formation, automatisation.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Grand place 50",
    "addressLocality": "Enghien",
    "postalCode": "7850",
    "addressRegion": "Hainaut",
    "addressCountry": "BE"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 50.6931661,
    "longitude": 3.9830214
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "18:00"
  },
  "areaServed": [
    { "@type": "Country", "name": "Belgium" },
    { "@type": "Country", "name": "France" }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Solutions IA",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Audit IA gratuit" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Formation IA" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Accompagnement IA" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Automatisation IA" } }
    ]
  },
  "sameAs": [
    "https://www.linkedin.com/company/ainspiration"
  ]
};

export const createServiceSchema = (service: {
  name: string;
  description: string;
  provider: string;
  areaServed?: string[];
}) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": service.name,
  "description": service.description,
  "provider": {
    "@type": "Organization",
    "name": service.provider
  },
  "areaServed": service.areaServed?.map(area => ({
    "@type": "Country",
    "name": area
  })),
  "serviceType": "AI Solutions",
  "category": "Technology Services"
});
