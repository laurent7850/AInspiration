import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbRoute {
  path: string;
  breadcrumb: string;
}

interface BreadcrumbsProps {
  routes?: BreadcrumbRoute[];
  className?: string;
}

// Map de routes pour la breadcrumb
const routeMap: Record<string, string> = {
  '': 'Accueil',
  'analyse-ia': 'Analyse de données IA',
  'transformation': 'Transformation numérique',
  'creation-visuelle': 'Création visuelle IA',
  'recommandations': 'Recommandations',
  'dashboard': 'Tableau de bord',
  'solutions': 'Solutions',
  'prompts': 'Bibliothèque de prompts',
  'automatisation': 'Automatisation',
  'assistants': 'Assistants virtuels',
  'creativite': 'Créativité IA',
  'conseil': 'Conseil stratégique',
  'formation': 'Formation',
  'accompagnement': 'Accompagnement personnalisé',
  'blog': 'Blog',
  'etudes-de-cas': 'Études de cas',
  'a-propos': 'À propos',
  'contact': 'Contact',
  'crm': 'CRM intelligent',
  'login': 'Connexion',
  'pourquoi-ia': 'Pourquoi l\'IA',
  'pour-qui-ia': 'Pour qui l\'IA',
  'privacy': 'Politique de confidentialité',
  'opportunities': 'Gestion des opportunités'
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ routes, className = '' }) => {
  const location = useLocation();
  
  // Si des routes sont fournies, utilisez-les. Sinon, générez-les à partir de l'emplacement actuel
  const segments = routes || generateBreadcrumbs(location.pathname);
  
  if (segments.length <= 1) {
    return null; // Ne pas afficher la breadcrumb pour la page d'accueil
  }
  
  return (
    <nav aria-label="Fil d'Ariane" className={`breadcrumb ${className}`}>
      <ol className="flex flex-wrap items-center space-x-2">
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          
          return (
            <li key={index} className={`breadcrumb-item flex items-center ${isLast ? 'breadcrumb-current' : ''}`}>
              {isLast ? (
                <span aria-current="page" className={isLast ? 'font-medium text-indigo-600' : ''}>
                  {segment.breadcrumb}
                </span>
              ) : (
                <>
                  <Link to={segment.path} className="breadcrumb-link hover:text-indigo-600 transition-colors">
                    {segment.breadcrumb}
                  </Link>
                  <ChevronRight className="w-4 h-4 mx-1 text-gray-400" aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Fonction pour générer les breadcrumbs automatiquement à partir du chemin
function generateBreadcrumbs(pathname: string): BreadcrumbRoute[] {
  const segments = pathname.split('/').filter(Boolean);
  let currentPath = '';
  
  // Commencer par la page d'accueil
  const breadcrumbs: BreadcrumbRoute[] = [{ path: '/', breadcrumb: 'Accueil' }];
  
  // Ajouter les segments intermédiaires
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    if (!isLast && segment in routeMap) {
      breadcrumbs.push({
        path: currentPath,
        breadcrumb: routeMap[segment] || segment
      });
    } else {
      // Pour le dernier segment, utiliser le nom du routeMap
      breadcrumbs.push({
        path: currentPath,
        breadcrumb: routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
      });
    }
  });
  
  return breadcrumbs;
}

export default Breadcrumbs;