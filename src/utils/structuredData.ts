export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Aimagination",
  "url": "https://ainspiration.eu",
  "logo": "https://ainspiration.eu/white_logo_-_no_background.svg",
  "description": "Solutions d'Intelligence Artificielle pour entreprises - Audit, conseil, formation et accompagnement IA",
  "email": "info@ainspiration.eu",
  "telephone": "+32477942865",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Grand place 50",
    "addressLocality": "Enghien",
    "postalCode": "7850",
    "addressCountry": "BE"
  },
  "sameAs": [
    "https://www.linkedin.com/company/ainspiration",
    "https://twitter.com/ainspiration"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+32477942865",
    "contactType": "customer service",
    "email": "info@ainspiration.eu",
    "availableLanguage": ["French", "English"]
  }
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Aimagination",
  "url": "https://ainspiration.eu",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://ainspiration.eu/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Aimagination",
  "image": "https://ainspiration.eu/og-image.jpg",
  "@id": "https://ainspiration.eu",
  "url": "https://ainspiration.eu",
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
    "https://www.linkedin.com/company/ainspiration",
    "https://twitter.com/ainspiration"
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
