import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  icon?: React.ElementType;
  tagline?: string;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  centered = true,
  icon: Icon,
  tagline,
  className = "",
}) => {
  return (
    <div className={`${centered ? 'text-center' : 'text-left'} mb-12 ${className}`}>
      {tagline && (
        <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide block mb-2">
          {tagline}
        </span>
      )}
      
      {Icon ? (
        <div className={`flex items-center gap-2 ${centered ? 'justify-center' : 'justify-start'} mb-4`}>
          <Icon className="h-8 w-8 text-indigo-600" />
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            {title}
          </h2>
        </div>
      ) : (
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
      )}
      
      {subtitle && (
        <p className={`text-xl text-gray-600 ${centered ? 'max-w-3xl mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;