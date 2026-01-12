import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-gray-200';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: ''
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : undefined)
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

// Skeleton pour une carte
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-xl shadow p-6 ${className}`}>
    <Skeleton variant="rounded" height={200} className="mb-4" />
    <Skeleton variant="text" width="60%" height={24} className="mb-2" />
    <Skeleton variant="text" width="100%" height={16} className="mb-1" />
    <Skeleton variant="text" width="80%" height={16} />
  </div>
);

// Skeleton pour le Hero
export const HeroSkeleton: React.FC = () => (
  <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white pt-20 lg:pt-32 pb-12 lg:pb-20">
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="text-center lg:text-left">
          <Skeleton variant="text" width="80%" height={48} className="mb-4 mx-auto lg:mx-0" />
          <Skeleton variant="text" width="100%" height={24} className="mb-2" />
          <Skeleton variant="text" width="90%" height={24} className="mb-8" />

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Skeleton variant="rounded" width={180} height={48} />
            <Skeleton variant="rounded" width={180} height={48} />
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-center lg:justify-start gap-2">
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="text" width={100} height={16} />
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-8 lg:mt-0">
          <Skeleton variant="rounded" height={400} className="w-full" />
        </div>
      </div>
    </div>
  </section>
);

// Skeleton pour les Features
export const FeaturesSkeleton: React.FC = () => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <Skeleton variant="text" width={300} height={32} className="mx-auto mb-4" />
        <Skeleton variant="text" width={500} height={20} className="mx-auto" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  </section>
);

// Skeleton pour les Testimonials
export const TestimonialsSkeleton: React.FC = () => (
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <Skeleton variant="text" width={250} height={32} className="mx-auto mb-4" />
        <Skeleton variant="text" width={400} height={20} className="mx-auto" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton variant="circular" width={48} height={48} />
              <div>
                <Skeleton variant="text" width={120} height={18} className="mb-1" />
                <Skeleton variant="text" width={80} height={14} />
              </div>
            </div>
            <Skeleton variant="text" width="100%" height={16} className="mb-1" />
            <Skeleton variant="text" width="100%" height={16} className="mb-1" />
            <Skeleton variant="text" width="60%" height={16} />
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Skeleton pour une page complète
export const PageSkeleton: React.FC = () => (
  <div className="min-h-screen">
    <HeroSkeleton />
    <FeaturesSkeleton />
  </div>
);

// Skeleton pour un formulaire
export const FormSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i}>
        <Skeleton variant="text" width={100} height={16} className="mb-2" />
        <Skeleton variant="rounded" height={44} />
      </div>
    ))}
    <Skeleton variant="rounded" width={150} height={44} className="mt-6" />
  </div>
);

// Skeleton pour une liste
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" height={18} className="mb-1" />
          <Skeleton variant="text" width="40%" height={14} />
        </div>
        <Skeleton variant="rounded" width={80} height={32} />
      </div>
    ))}
  </div>
);

// Skeleton pour une table
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4
}) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="bg-gray-50 px-6 py-3 border-b flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} variant="text" width={100} height={16} />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="px-6 py-4 border-b flex gap-4">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" width={100} height={16} />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;
