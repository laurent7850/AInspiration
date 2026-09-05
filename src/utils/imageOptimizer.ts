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
