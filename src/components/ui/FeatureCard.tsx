import React from 'react';

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  className?: string;
  iconClassName?: string;
  // Additional optional props
  stats?: string;
  statsColor?: string;
  examples?: string[];
  isHoverable?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  className = "",
  iconClassName = "bg-indigo-100",
  stats,
  statsColor = "text-green-500",
  examples = [],
  isHoverable = false,
}) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-lg p-6 ${isHoverable ? 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300' : ''} ${className}`}
    >
      <div className={`w-12 h-12 ${iconClassName} rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-indigo-600" />
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
        {stats && (
          <span className={`font-bold ${statsColor}`}>
            {stats}
          </span>
        )}
      </div>
      
      <p className="text-gray-600 mb-4">
        {description}
      </p>
      
      {examples.length > 0 && (
        <ul className="space-y-2">
          {examples.map((example, idx) => (
            <li key={idx} className="flex items-center gap-2 text-gray-600">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              <span>{example}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FeatureCard;