/**
 * Image optimization utilities
 */

export const getOptimizedImageUrl = (url: string, width: number = 800) => {
  if (!url) return '';
  
  // Unsplash optimization
  if (url.includes('unsplash.com')) {
    // If URL already has query params
    if (url.includes('?')) {
      return `${url}&w=${width}&auto=format&fit=crop&q=80`;
    }
    return `${url}?w=${width}&auto=format&fit=crop&q=80`;
  }
  
  return url;
};

const getResponsiveImageSrcSet = (url: string, sizes: number[] = [400, 800, 1200, 1600]) => {
  if (!url) return '';
  
  // Only handle Unsplash images
  if (!url.includes('unsplash.com')) return url;
  
  return sizes
    .map(size => `${getOptimizedImageUrl(url, size)} ${size}w`)
    .join(', ');
};