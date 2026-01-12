import { Bot, FileText, GraduationCap, Zap, Users } from 'lucide-react';
import React from 'react';

interface Product {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  price?: string;
  duration?: string;
  format?: string;
  callToAction: string;
}

export const products: Product[] = [
  {
    id: 'audit-ia',
    title: 'Audit IA Gratuit',
    description: 'Évaluez vos processus et identifiez les opportunités d\'automatisation',
    icon: FileText,
    features: [
      'Analyse complète de vos processus actuels',
      'Identification des opportunités d\'automatisation',
      'Recommandations personnalisées',
      'Estimation des gains potentiels'
    ],
    duration: '2-3 semaines',
    price: 'Gratuit',
    callToAction: 'Demander un audit'
  },
  {
    id: 'pack-demarrage',
    title: 'Pack "Démarrage IA"',
    description: 'Lancez-vous avec une solution clé en main',
    icon: Zap,
    features: [
      'Mise en place d\'un chatbot personnalisé',
      'Automatisation de 3 tâches administratives',
      'Formation de vos équipes',
      'Support pendant 3 mois'
    ],
    duration: '2-4 semaines',
    price: 'À partir de 2 500€',
    callToAction: 'Demander un devis'
  },
  {
    id: 'formation-ia',
    title: 'Formation IA pour PME',
    description: 'Formez vos équipes aux outils IA',
    icon: GraduationCap,
    features: [
      'Utilisation avancée de ChatGPT',
      'Automatisation des processus',
      'Analyse de données',
      'Création de contenu IA'
    ],
    format: 'Présentiel ou distanciel',
    duration: '1-3 jours',
    price: 'À partir de 990€',
    callToAction: 'S\'inscrire'
  },
  {
    id: 'abonnement-ia',
    title: 'Abonnement "IA au Quotidien"',
    description: 'Support continu et accès à nos outils',
    icon: Bot,
    features: [
      'Accès illimité à nos outils IA',
      'Mises à jour continues',
      'Support prioritaire',
      'Session mensuelle de conseil'
    ],
    price: 'À partir de 199€/mois',
    callToAction: 'S\'abonner'
  },
  {
    id: 'crm-solution',
    title: 'Solution CRM Intelligente',
    description: 'Transformez votre relation client avec notre CRM nouvelle génération',
    icon: Users,
    features: [
      'Gestion complète des contacts et opportunités',
      'Automatisation des processus de vente',
      'Analyses et rapports personnalisés',
      'Intégration avec vos outils existants'
    ],
    price: 'À partir de 29€/utilisateur/mois',
    callToAction: 'Demander une démo'
  }
];