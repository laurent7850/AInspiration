import React from 'react';
import { Calendar, Tag } from 'lucide-react';

interface BlogSidebarProps {
  recentPosts?: Array<{
    id: number;
    title: string;
    date: string;
    slug: string;
  }>;
  categories?: Array<{
    name: string;
    count: number;
  }>;
}

export default function BlogSidebar({ recentPosts = [], categories = [] }: BlogSidebarProps) {
  return (
    <aside className="space-y-8">
      {recentPosts.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Articles récents</h3>
          <ul className="space-y-4">
            {recentPosts.map((post) => (
              <li key={post.id}>
                <a
                  href={`/blog/${post.slug}`}
                  className="group block"
                >
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {categories.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Catégories</h3>
          <ul className="space-y-2">
            {categories.map((category, index) => (
              <li key={index}>
                <a
                  href={`/blog/category/${category.name}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <span className="flex items-center gap-2 text-gray-700 group-hover:text-blue-600">
                    <Tag className="w-4 h-4" />
                    {category.name}
                  </span>
                  <span className="text-sm text-gray-500">{category.count}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
