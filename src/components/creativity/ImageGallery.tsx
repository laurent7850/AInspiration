import React from 'react';

interface ImageGalleryProps {
  images: Array<{
    url: string;
    title: string;
    description: string;
  }>;
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {images.map((image, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
          <img 
            src={image.url} 
            alt={image.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {image.title}
            </h3>
            <p className="text-gray-600">
              {image.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}