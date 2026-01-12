import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CTAProps {
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonAction: () => void;
  gradientFrom?: string;
  gradientTo?: string;
  stats?: Array<{
    value: string;
    label: string;
  }>;
  rightContent?: React.ReactNode;
}

const CallToAction: React.FC<CTAProps> = ({
  title,
  subtitle,
  buttonText,
  buttonAction,
  gradientFrom = "from-indigo-600",
  gradientTo = "to-purple-600",
  stats,
  rightContent,
}) => {
  return (
    <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-2xl p-8 lg:p-12 text-white`}>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h3 className="text-3xl font-bold mb-4">
            {title}
          </h3>
          {subtitle && (
            <p className="text-indigo-100 mb-6">
              {subtitle}
            </p>
          )}
          <button 
            onClick={buttonAction}
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2"
          >
            {buttonText}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        
        {rightContent ? (
          <div>{rightContent}</div>
        ) : stats && stats.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-indigo-100">{stat.label}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CallToAction;