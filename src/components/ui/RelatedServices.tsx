import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { useLocalizedPath } from '../../hooks/useLocalizedPath';

interface ServiceLink {
  /** Route path, e.g. "/audit". Title/description fall back to common.relatedServices.links[<path>] */
  path: string;
  title?: string;
  description?: string;
}

interface RelatedServicesProps {
  title?: string;
  links: ServiceLink[];
}

export default function RelatedServices({ title, links }: RelatedServicesProps) {
  const { t } = useTranslation('common');
  const heading = title || t('relatedServices.title');
  const resolve = (link: ServiceLink) => {
    const key = link.path.replace(/^\//, '');
    return {
      ...link,
      title: link.title || t(`relatedServices.links.${key}.title`, link.path),
      description: link.description || t(`relatedServices.links.${key}.description`, ''),
    };
  };
  const { localizedPath } = useLocalizedPath();

  return (
    <nav className="bg-gray-50 rounded-2xl p-6 lg:p-8" aria-label="Services connexes">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{heading}</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map(resolve).map((link) => (
          <Link
            key={link.path}
            to={localizedPath(link.path)}
            className="group flex flex-col p-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
          >
            <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
              {link.title}
            </span>
            <span className="text-sm text-gray-500 mt-1">{link.description}</span>
            <span className="flex items-center gap-1 text-sm text-indigo-600 mt-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              En savoir plus <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
