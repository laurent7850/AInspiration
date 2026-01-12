# 🚀 OPTIMISATION PERFORMANCE & CORE WEB VITALS

## 📊 État Actuel

### Métriques Core Web Vitals ciblées:
- **LCP (Largest Contentful Paint)**: < 2.5s ✅
- **FID (First Input Delay)** / **INP (Interaction to Next Paint)**: < 200ms ✅
- **CLS (Cumulative Layout Shift)**: < 0.1 ✅

---

## ✅ OPTIMISATIONS IMPLÉMENTÉES

### 1. **Images Optimisées**

#### Composant `OptimizedImage`
**Fichier**: `src/components/ui/OptimizedImage.tsx`

Fonctionnalités:
- Lazy loading automatique
- Responsive sizing
- Optimisation Unsplash URLs
- Preload pour images critiques
- Format WebP automatique

**Utilisation:**
```tsx
import OptimizedImage from '../components/ui/OptimizedImage';

<OptimizedImage
  src="https://images.unsplash.com/..."
  alt="Description SEO-friendly"
  width={1200}
  height={800}
  priority={false} // true pour images above-the-fold
  responsive="full" // full | half | third | quarter
/>
```

#### Utilitaires d'optimisation
**Fichier**: `src/utils/imageOptimization.ts`

Fonctions disponibles:
- `getOptimizedImageProps()` - Props optimisées pour images
- `optimizeUnsplashUrl()` - Optimiser URLs Unsplash
- `generateSrcSet()` - Générer srcSet responsive
- `getResponsiveSizes()` - Tailles responsive automatiques
- `preloadCriticalImages()` - Précharger images critiques
- `generateImageAlt()` - Générer alt text depuis filename

### 2. **Code Splitting & Lazy Loading**

#### React.lazy() sur toutes les routes
**Déjà implémenté** dans `src/config/routes.ts`

```tsx
const routes: RouteConfig[] = [
  {
    path: "/",
    component: lazy(() => import('../pages/HomePage')),
    exact: true
  },
  // ... autres routes avec lazy()
];
```

#### Lazy loading des composants
**Exemple dans HomePage:**
```tsx
const Hero = lazy(() => import('../components/Hero'));
const Features = lazy(() => import('../components/Features'));
const AuditSection = lazy(() => import('../components/AuditSection'));
```

### 3. **Build Configuration Optimisée**

**Fichier**: `vite.config.performance.ts` (nouvelle config)

Optimisations:
- ✅ Compression Gzip
- ✅ Compression Brotli
- ✅ Manual chunks (vendor splitting)
- ✅ Minification Terser
- ✅ Drop console.log en production
- ✅ CSS minification
- ✅ Bundle analyzer

**Vendor chunks créés:**
- `react-vendor` - React, React-DOM, React-Router
- `ui-vendor` - Lucide React icons
- `supabase-vendor` - Supabase client
- `i18n-vendor` - i18next et dépendances

### 4. **Préchargement Assets Critiques**

**Fichier**: `index.html`

```html
<!-- Preconnect domaines externes -->
<link rel="preconnect" href="https://images.unsplash.com" crossorigin>
<link rel="dns-prefetch" href="https://images.unsplash.com">

<!-- Preload assets critiques -->
<link rel="preload" as="image" href="/white_logo_-_no_background.svg" type="image/svg+xml" />
```

---

## 📋 ACTIONS RESTANTES À IMPLÉMENTER

### 🔴 PRIORITÉ HAUTE

#### 1. Activer la nouvelle config Vite
```bash
# Renommer le fichier
mv vite.config.ts vite.config.old.ts
mv vite.config.performance.ts vite.config.ts

# Installer dépendances manquantes
npm install -D rollup-plugin-visualizer vite-plugin-compression2
```

#### 2. Remplacer toutes les balises `<img>` par `<OptimizedImage>`

**Pages à mettre à jour:**
- Hero.tsx
- Features.tsx
- Blog.tsx
- CreativityPage.tsx
- CaseStudiesPage.tsx
- Toute page avec images

**Recherche globale:**
```bash
# Trouver toutes les balises img
grep -r "<img" src/ --include="*.tsx"
```

#### 3. Ajouter dimensions explicites aux images

Pour éviter CLS (Cumulative Layout Shift):
```tsx
// ❌ Mauvais
<img src="image.jpg" alt="..." />

// ✅ Bon
<OptimizedImage
  src="image.jpg"
  alt="..."
  width={1200}
  height={800}
/>
```

#### 4. Optimiser fonts

**Dans index.html:**
```html
<!-- Preload fonts critiques -->
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>

<!-- Font display swap pour éviter FOIT -->
<style>
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    src: url('/fonts/inter-var.woff2') format('woff2');
  }
</style>
```

### 🟠 PRIORITÉ MOYENNE

#### 5. Implémenter Service Worker (PWA)

**Créer**: `public/sw.js`
```javascript
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/white_logo_-_no_background.svg',
        // ... assets critiques
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**Enregistrer dans main.tsx:**
```tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
```

#### 6. Lazy load iframe (Google Maps)

**Dans ContactPage.tsx:**
```tsx
const [mapLoaded, setMapLoaded] = useState(false);

useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setMapLoaded(true);
    }
  });

  const mapContainer = document.getElementById('map-container');
  if (mapContainer) observer.observe(mapContainer);

  return () => observer.disconnect();
}, []);

// ...

<div id="map-container" className="relative h-full min-h-[400px]">
  {mapLoaded ? (
    <iframe src="..." />
  ) : (
    <div className="bg-gray-200 animate-pulse h-full" />
  )}
</div>
```

#### 7. Implémenter Caching Headers

**Fichier**: `.htaccess` (pour Apache) ou nginx config

```apache
# Cache assets statiques
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Compression Gzip
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css
  AddOutputFilterByType DEFLATE application/javascript application/json
  AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>
```

### 🟢 PRIORITÉ BASSE

#### 8. Analyser et réduire bundle size

```bash
# Build avec analyse
npm run build

# Ouvrir dist/stats.html pour voir le bundle visualizer
```

**Identifiez:**
- Librairies trop lourdes
- Code dupliqué
- Dépendances inutilisées

#### 9. Implémenter HTTP/2 Server Push

**Nginx config:**
```nginx
location / {
  http2_push /white_logo_-_no_background.svg;
  http2_push /styles.css;
  http2_push /main.js;
}
```

#### 10. Resource Hints avancés

**Dans index.html:**
```html
<!-- Prefetch pages probables -->
<link rel="prefetch" href="/solutions">
<link rel="prefetch" href="/contact">

<!-- Prerender page suivante -->
<link rel="prerender" href="/analyse-ia">

<!-- DNS prefetch pour domaines tiers -->
<link rel="dns-prefetch" href="https://www.google-analytics.com">
```

---

## 🧪 TESTS & VALIDATION

### Outils de test

1. **Lighthouse (Chrome DevTools)**
```bash
# CLI Lighthouse
npm install -g lighthouse
lighthouse https://aimagination.eu --view
```

2. **PageSpeed Insights**
https://pagespeed.web.dev/

3. **WebPageTest**
https://www.webpagetest.org/

4. **Chrome User Experience Report**
https://developers.google.com/web/tools/chrome-user-experience-report

### Checklist validation

- [ ] LCP < 2.5s (Lighthouse)
- [ ] FID/INP < 200ms (Lighthouse)
- [ ] CLS < 0.1 (Lighthouse)
- [ ] Performance score > 90 (Lighthouse)
- [ ] Accessibility score > 95 (Lighthouse)
- [ ] Best Practices > 95 (Lighthouse)
- [ ] SEO score = 100 (Lighthouse)
- [ ] Images lazy loadées
- [ ] Fonts optimisées (font-display: swap)
- [ ] JS minifié et compressé
- [ ] CSS minifié et compressé
- [ ] Gzip/Brotli activé
- [ ] Cache headers configurés

---

## 📈 MONITORING CONTINU

### Google Analytics 4

**Événements Core Web Vitals:**
```javascript
// Dans main.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics({ name, delta, id }) {
  // Envoyer à GA4
  gtag('event', name, {
    event_category: 'Web Vitals',
    value: Math.round(name === 'CLS' ? delta * 1000 : delta),
    event_label: id,
    non_interaction: true,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Real User Monitoring (RUM)

**Services recommandés:**
- Google Analytics 4 (Core Web Vitals report)
- Sentry (Performance monitoring)
- New Relic
- Datadog

---

## 🎯 OBJECTIFS PERFORMANCE

### Targets

| Métrique | Cible | Actuel | Statut |
|----------|-------|--------|--------|
| LCP | < 2.5s | ? | 🔄 À tester |
| FID/INP | < 200ms | ? | 🔄 À tester |
| CLS | < 0.1 | ? | 🔄 À tester |
| Performance Score | > 90 | ? | 🔄 À tester |
| Bundle size (main) | < 500KB | 650KB | ⚠️ À optimiser |
| Time to Interactive | < 3.8s | ? | 🔄 À tester |
| Speed Index | < 3.4s | ? | 🔄 À tester |

### Budget Performance

**Limites strictes:**
- Main bundle: 500KB max
- Vendor chunks: 800KB max total
- CSS: 100KB max
- Images (par page): 2MB max
- Fonts: 200KB max

---

## 📞 PROCHAINES ÉTAPES

1. **Installer dépendances performance**
```bash
npm install -D rollup-plugin-visualizer vite-plugin-compression2 web-vitals
```

2. **Activer nouvelle config Vite**
```bash
mv vite.config.ts vite.config.old.ts
mv vite.config.performance.ts vite.config.ts
```

3. **Remplacer images par OptimizedImage**
```bash
# Chercher toutes les images
grep -r "<img" src/ --include="*.tsx"
```

4. **Tester performance**
```bash
npm run build
lighthouse https://aimagination.eu --view
```

5. **Monitorer en production**
- Configurer Google Analytics 4
- Activer Core Web Vitals tracking
- Surveiller Real User Monitoring

---

**Performance is a feature! 🚀**
