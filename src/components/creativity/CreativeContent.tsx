import React from 'react';
import { FileText } from 'lucide-react';

interface CreativeContentProps {
  title: string;
  description: string;
  wordCount: string;
  languages: string;
}

export default function CreativeContent({ title, description, wordCount, languages }: CreativeContentProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium mb-3">
        <FileText className="w-4 h-4" />
        {title}
      </div>
      <p className="text-gray-600 mb-4">
        {description}
      </p>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{wordCount}</span>
        <span>{languages}</span>
      </div>
    </div>
  );
}