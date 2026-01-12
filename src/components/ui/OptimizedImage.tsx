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
  const optimizedSrc = src.includes('unsplash.com')
    ? optimizeUnsplashUrl(src, { w: width || 1200, q: 80 })
    : src;

  const imageProps = getOptimizedImageProps(optimizedSrc, alt, {
    loading: priority ? 'eager' : 'lazy',
    fetchPriority: priority ? 'high' : 'auto',
    sizes: getResponsiveSizes(responsive),
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
