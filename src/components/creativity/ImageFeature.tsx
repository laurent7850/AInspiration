import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ImageFeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function ImageFeature({ icon: Icon, title, description }: ImageFeatureProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-indigo-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
}