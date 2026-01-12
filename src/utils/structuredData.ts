export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Aimagination",
  "url": "https://aimagination.eu",
  "logo": "https://aimagination.eu/white_logo_-_no_background.svg",
  "description": "Solutions d'Intelligence Artificielle pour entreprises - Audit, conseil, formation et accompagnement IA",
  "email": "info@aimagination.eu",
  "telephone": "+32477942865",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Grand place 50",
    "addressLocality": "Enghien",
    "postalCode": "7850",
    "addressCountry": "BE"
  },
  "sameAs": [
    "https://www.linkedin.com/company/aimagination",
    "https://twitter.com/aimagination"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+32477942865",
    "contactType": "customer service",
    "email": "info@aimagination.eu",
    "availableLanguage": ["French", "English"]
  }
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Aimagination",
  "url": "https://aimagination.eu",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://aimagination.eu/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Aimagination",
  "image": "https://aimagination.eu/og-image.jpg",
  "@id": "https://aimagination.eu",
  "url": "https://aimagination.eu",
  "telephone": "+32477942865",
  "priceRange": "€€€",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Grand place 50",
    "addressLocality": "Enghien",
    "postalCode": "7850",
    "addressCountry": "BE"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 50.6931661,
    "longitude": 3.9830214
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ],
    "opens": "09:00",
    "closes": "18:00"
  },
  "sameAs": [
    "https://www.linkedin.com/company/aimagination",
    "https://twitter.com/aimagination"
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
