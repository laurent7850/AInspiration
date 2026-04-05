import React from 'react';
import { ArrowRight } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface ServiceHeroProps {
  badge?: string;
  title: string;
  highlight?: string;
  description: string;
  ctaText: string;
  onCtaClick: () => void;
  image?: string;
  imageAlt?: string;
}

const ServiceHero: React.FC<ServiceHeroProps> = ({
  badge,
  title,
  highlight,
  description,
  ctaText,
  onCtaClick,
  image,
  imageAlt,
}) => {
  const hasImage = Boolean(image);

  return (
    <section className="pt-20 pb-16 bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-4">
        {hasImage ? (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {badge && (
                <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                  {badge}
                </div>
              )}

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                {title}
                {highlight && (
                  <>
                    {' '}
                    <span className="text-indigo-600">{highlight}</span>
                  </>
                )}
              </h1>

              <p className="text-xl text-gray-600 mb-8">
                {description}
              </p>

              <button
                onClick={onCtaClick}
                className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center gap-3"
              >
                {ctaText}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-2xl blur-3xl" />
              <OptimizedImage
                src={image!}
                alt={imageAlt || title}
                responsive="half"
                className="relative rounded-xl shadow-xl w-full object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto text-center">
            {badge && (
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                {badge}
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              {title}
              {highlight && (
                <>
                  {' '}
                  <span className="text-indigo-600">{highlight}</span>
                </>
              )}
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {description}
            </p>

            <button
              onClick={onCtaClick}
              className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center gap-3"
            >
              {ctaText}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServiceHero;
