import React from 'react';
import { getOptimizedImageProps, getResponsiveSizes, optimizeUnsplashUrl } from '../../utils/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  responsive?: 'full' | 'half' | 'third' | 'quarter';
  onLoad?: () => void;
  onError?: () => void;
}

const SRCSET_WIDTHS = [400, 800, 1200, 1600];

/**
 * Strips existing query params from an Unsplash URL to get the base photo URL.
 */
function getUnsplashBase(url: string): string {
  const idx = url.indexOf('?');
  return idx > -1 ? url.substring(0, idx) : url;
}

/**
 * Generates srcSet for Unsplash images at multiple widths with WebP auto-format.
 */
function buildUnsplashSrcSet(url: string): string {
  const base = getUnsplashBase(url);
  return SRCSET_WIDTHS
    .map(w => `${base}?w=${w}&auto=format&fit=crop&q=80 ${w}w`)
    .join(', ');
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  responsive = 'full',
  onLoad,
  onError
}) => {
  const isUnsplash = src.includes('unsplash.com');

  const optimizedSrc = isUnsplash
    ? optimizeUnsplashUrl(src, { w: width || 1200, q: 80 })
    : src;

  const srcSet = isUnsplash ? buildUnsplashSrcSet(src) : undefined;

  const imageProps = getOptimizedImageProps(optimizedSrc, alt, {
    loading: priority ? 'eager' : 'lazy',
    fetchPriority: priority ? 'high' : 'auto',
    sizes: getResponsiveSizes(responsive),
    srcSet,
    width,
    height
  });

  return (
    <img
      {...imageProps}
      className={className}
      onLoad={onLoad}
      onError={onError}
    />
  );
};

export default OptimizedImage;
