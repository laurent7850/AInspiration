interface ImageOptimizationOptions {
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  sizes?: string;
  srcSet?: string;
  width?: number;
  height?: number;
}

export const getOptimizedImageProps = (
  src: string,
  alt: string,
  options: ImageOptimizationOptions = {}
) => {
  const {
    loading = 'lazy',
    fetchPriority = 'auto',
    sizes,
    srcSet,
    width,
    height
  } = options;

  return {
    src,
    alt,
    loading,
    fetchPriority,
    ...(sizes && { sizes }),
    ...(srcSet && { srcSet }),
    ...(width && { width }),
    ...(height && { height }),
    decoding: 'async' as const
  };
};

export const isHeroImage = (src: string): boolean => {
  return src.includes('hero') || src.includes('banner') || src.includes('header');
};

export const generateSrcSet = (baseUrl: string, sizes: number[]): string => {
  return sizes
    .map(size => `${baseUrl}?w=${size} ${size}w`)
    .join(', ');
};

export const getResponsiveSizes = (type: 'full' | 'half' | 'third' | 'quarter'): string => {
  const sizesMap = {
    full: '100vw',
    half: '(min-width: 768px) 50vw, 100vw',
    third: '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw',
    quarter: '(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw'
  };

  return sizesMap[type];
};

export const preloadCriticalImages = (urls: string[]) => {
  if (typeof document === 'undefined') return;

  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

export const optimizeUnsplashUrl = (url: string, options: { w?: number; h?: number; q?: number; fit?: string } = {}): string => {
  if (!url.includes('unsplash.com')) return url;

  const { w = 1200, h, q = 80, fit = 'crop' } = options;
  const params = new URLSearchParams();

  params.set('w', w.toString());
  if (h) params.set('h', h.toString());
  params.set('q', q.toString());
  params.set('fit', fit);
  params.set('auto', 'format');

  return `${url}?${params.toString()}`;
};

export const generateImageAlt = (filename: string, context?: string): string => {
  let alt = filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  if (context) {
    alt = `${context} - ${alt}`;
  }

  return alt;
};
