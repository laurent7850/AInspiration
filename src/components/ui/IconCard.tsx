import React from 'react';
import { CheckCircle, LucideIcon } from 'lucide-react';

interface IconCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  size?: 'sm' | 'md' | 'lg';
  items?: string[];
  className?: string;
}

const sizeConfig = {
  sm: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  md: { container: 'w-12 h-12', icon: 'w-6 h-6' },
  lg: { container: 'w-14 h-14', icon: 'w-7 h-7' },
};

const IconCard: React.FC<IconCardProps> = ({
  icon: Icon,
  title,
  description,
  size = 'md',
  items,
  className = '',
}) => {
  const { container, icon } = sizeConfig[size];

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow ${className}`}>
      <div className={`${container} bg-indigo-100 rounded-lg flex items-center justify-center mb-4`}>
        <Icon className={`${icon} text-indigo-600`} />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      <p className="text-gray-600 mb-4">
        {description}
      </p>

      {items && items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default IconCard;
