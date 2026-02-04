import { ComponentType, lazy } from 'react';

// Interfaces
export interface RouteConfig {
  path: string;
  component: ComponentType;
  exact?: boolean;
  private?: boolean;
}

export interface MenuSection {
  label: string;
  path?: string;
  action?: () => void;
  items?: MenuItem[];
}

export interface MenuItem {
  label: string;
  path?: string;
  action?: () => void;
}

// Routes
const routes: RouteConfig[] = [
  {
    path: "/",
    component: lazy(() => import('../pages/HomePage')),
    exact: true
  },
  {
    path: "/login",
    component: lazy(() => import('../pages/LoginPage')),
    exact: true
  },
  {
    path: "/pourquoi-ia",
    component: lazy(() => import('../pages/WhyAIPage')),
    exact: true
  },
  {
    path: "/pour-qui-ia",
    component: lazy(() => import('../pages/ForWhoAIPage')),
    exact: true
  },
  {
    path: "/analyse-ia",
    component: lazy(() => import('../pages/AnalyseIAPage')),
    exact: true
  },
  {
    path: "/transformation",
    component: lazy(() => import('../pages/TransformationPage')),
    exact: true
  },
  {
    path: "/creation-visuelle",
    component: lazy(() => import('../pages/CreationVisuellePage')),
    exact: true
  },
  {
    path: "/recommandations",
    component: lazy(() => import('../pages/RecommendationsPage')),
    exact: true
  },
  {
    path: "/dashboard",
    component: lazy(() => import('../pages/DashboardPage')),
    exact: true,
    private: true
  },
  {
    path: "/solutions",
    component: lazy(() => import('../pages/SolutionsPage')),
    exact: true
  },
  {
    path: "/produits",
    component: lazy(() => import('../pages/ProductsPage')),
    exact: true
  },
  {
    path: "/etudes-de-cas",
    component: lazy(() => import('../pages/CaseStudiesPage')),
    exact: true
  },
  {
    path: "/a-propos",
    component: lazy(() => import('../pages/AboutPage')),
    exact: true
  },
  {
    path: "/contact",
    component: lazy(() => import('../pages/ContactPage')),
    exact: true
  },
  {
    path: "/prompts",
    component: lazy(() => import('../pages/PromptOptimizationPage')),
    exact: true
  },
  {
    path: "/automatisation",
    component: lazy(() => import('../pages/AutomationPage')),
    exact: true
  },
  {
    path: "/assistants",
    component: lazy(() => import('../pages/VirtualAssistantsPage')),
    exact: true
  },
  {
    path: "/creativite",
    component: lazy(() => import('../pages/CreativityPage')),
    exact: true
  },
  {
    path: "/conseil",
    component: lazy(() => import('../pages/ConsultingPage')),
    exact: true
  },
  {
    path: "/formation",
    component: lazy(() => import('../pages/FormationPage')),
    exact: true
  },
  {
    path: "/accompagnement",
    component: lazy(() => import('../pages/CustomSupportPage')),
    exact: true
  },
  {
    path: "/blog",
    component: lazy(() => import('../pages/BlogPage')),
    exact: true
  },
  {
    path: "/blog/thierry-facturation-ia",
    component: lazy(() => import('../pages/ThierryBlogPage')),
    exact: true
  },
  {
    path: "/blog/:slug",
    component: lazy(() => import('../pages/BlogPostPage')),
    exact: true
  },
  {
    path: "/privacy",
    component: lazy(() => import('../pages/PrivacyPolicyPage')),
    exact: true
  },
  {
    path: "/crm",
    component: lazy(() => import('../pages/CRMSolutionPage')),
    exact: true
  },
  {
    path: "/opportunities",
    component: lazy(() => import('../pages/OpportunitiesPage')),
    exact: true,
    private: true
  },
  {
    path: "/opportunities/:id",
    component: lazy(() => import('../pages/OpportunitiesPage')),
    exact: true,
    private: true
  },
  {
    path: "/crm-dashboard",
    component: lazy(() => import('../pages/CrmDashboardPage')),
    exact: true,
    private: true
  },
  {
    path: "/contacts",
    component: lazy(() => import('../pages/ContactsPage')),
    exact: true,
    private: true
  },
  {
    path: "/contacts/:id",
    component: lazy(() => import('../pages/ContactsPage')),
    exact: true,
    private: true
  },
  {
    path: "/companies",
    component: lazy(() => import('../pages/CompaniesPage')),
    exact: true,
    private: true
  },
  {
    path: "/companies/:id",
    component: lazy(() => import('../pages/CompaniesPage')),
    exact: true,
    private: true
  },
  {
    path: "/products",
    component: lazy(() => import('../pages/ProductsPage')),
    exact: true,
    private: true
  },
  {
    path: "/products/:id",
    component: lazy(() => import('../pages/ProductsPage')),
    exact: true,
    private: true
  },
  {
    path: "/tasks",
    component: lazy(() => import('../pages/TasksPage')),
    exact: true,
    private: true
  },
  {
    path: "/tasks/:id",
    component: lazy(() => import('../pages/TasksPage')),
    exact: true,
    private: true
  },
  {
    path: "/reports",
    component: lazy(() => import('../pages/ReportsPage')),
    exact: true,
    private: true
  },
  {
    path: "/messages",
    component: lazy(() => import('../pages/MessagesPage')),
    exact: true,
    private: true
  },
  {
    path: "/newsletter-admin",
    component: lazy(() => import('../pages/NewsletterAdminPage')),
    exact: true,
    private: true
  },
  {
    path: "/unsubscribe",
    component: lazy(() => import('../pages/UnsubscribePage')),
    exact: true
  },
];

// Menu structure - Reorganized to eliminate duplication
export const menuItems: MenuSection[] = [
  { 
    label: 'Découvrir', 
    items: [
      { label: 'Pourquoi l\'IA', path: '/pourquoi-ia' },
      { label: 'Pour qui l\'IA', path: '/pour-qui-ia' },
      { label: 'Audit gratuit', action: () => {} /* Will be set dynamically */ },
      { label: 'À propos', path: '/a-propos' }
    ]
  },
  { 
    label: 'Solutions', 
    path: '/solutions',
    items: [
      { label: 'Vue d\'ensemble', path: '/solutions' },
      { label: 'Analyse de données IA', path: '/analyse-ia' },
      { label: 'Transformation numérique', path: '/transformation' },
      { label: 'Automatisation', path: '/automatisation' },
      { label: 'Assistants virtuels', path: '/assistants' },
      { label: 'Bibliothèque de prompts', path: '/prompts' },
      { label: 'Création visuelle IA', path: '/creation-visuelle' },
      { label: 'Solution CRM', path: '/crm' }
    ]
  },
  {
    label: 'Études de cas',
    path: '/etudes-de-cas'
  },
  { 
    label: 'Accompagnement', 
    path: '/accompagnement',
    items: [
      { label: 'Conseil stratégique', path: '/conseil' },
      { label: 'Formation', path: '/formation' },
      { label: 'Contact', path: '/contact' }
    ]
  },
  { 
    label: 'Blog', 
    path: '/blog'
  },
  {
    label: 'CRM Intelligent',
    path: '/crm-dashboard',
    items: [
      { label: 'Dashboard IA', path: '/crm-dashboard' },
      { label: 'Opportunités', path: '/opportunities' },
      { label: 'Contacts', path: '/contacts' },
      { label: 'Entreprises', path: '/companies' },
      { label: 'Produits', path: '/products' },
      { label: 'Tâches', path: '/tasks' },
      { label: 'Messages', path: '/messages' },
      { label: 'Newsletter', path: '/newsletter-admin' },
      { label: 'Rapports', path: '/reports' }
    ]
  }
];

export default routes;