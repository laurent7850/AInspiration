import React from 'react';
import SectionHeader from '../components/ui/SectionHeader';
import { 
  Users, 
  Award, 
  Shield, 
  Globe, 
  Clock, 
  CheckCircle 
} from 'lucide-react';

const AboutPage: React.FC = () => {
  const teamMembers = [
    {
      name: "Maxence Durand",
      role: "Fondateur & CEO",
      bio: "15+ ans d'expérience en IA et transformation digitale. Passionné par l'innovation accessible aux PME.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop"
    },
    {
      name: "Sophie Laurent",
      role: "Directrice des Opérations",
      bio: "Experte en optimisation des processus et en gestion de projet agile. Accompagne les clients dans leur transition numérique.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop"
    },
    {
      name: "Thomas Lefevre",
      role: "Lead IA",
      bio: "Docteur en Intelligence Artificielle, spécialiste des solutions adaptées aux besoins spécifiques des PME.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop"
    }
  ];
  
  const values = [
    {
      icon: Globe,
      title: "Innovation accessible",
      description: "Nous croyons que l'IA doit être accessible à toutes les entreprises, quelle que soit leur taille."
    },
    {
      icon: Shield,
      title: "Éthique & Transparence",
      description: "Nous développons des solutions éthiques et nous sommes transparents sur nos pratiques."
    },
    {
      icon: Users,
      title: "Humain au centre",
      description: "Nos technologies visent à améliorer l'humain, pas à le remplacer."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Nous visons l'excellence dans chaque solution que nous proposons à nos clients."
    }
  ];

  const milestones = [
    {
      year: "2019",
      title: "Création d'AImagination",
      description: "Fondation de l'entreprise avec pour mission de démocratiser l'IA pour les PME."
    },
    {
      year: "2020",
      title: "Lancement des premiers produits",
      description: "Développement de solutions d'automatisation et d'analyse de données."
    },
    {
      year: "2021",
      title: "Élargissement de l'offre",
      description: "Introduction des assistants virtuels et des services d'IA générative."
    },
    {
      year: "2022",
      title: "Expansion internationale",
      description: "Ouverture aux marchés francophones européens : Belgique, Luxembourg et Suisse."
    },
    {
      year: "2023",
      title: "Révolution IA générative",
      description: "Lancement de notre plateforme PromptMaster et intégration des modèles GPT et Claude dans nos solutions."
    },
    {
      year: "2024",
      title: "CRM Intelligent & Automatisation avancée",
      description: "Déploiement de notre solution CRM propulsée par l'IA et automatisation des workflows métier complexes."
    },
    {
      year: "2025",
      title: "IA Agents & Personnalisation",
      description: "Lancement des agents IA autonomes et solutions d'analyse prédictive sur mesure pour chaque secteur."
    },
    {
      year: "2026",
      title: "AInspiration - Nouvelle ère",
      description: "Rebranding en AInspiration. Plateforme unifiée d'IA pour PME avec accompagnement 360° et formation certifiante."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="À propos d'AInspiration"
          subtitle="Notre mission : rendre l'IA accessible et efficace pour toutes les entreprises"
          centered
        />

        {/* Notre Mission */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Chez AInspiration, nous sommes convaincus que l'Intelligence Artificielle est un levier de croissance incontournable pour les entreprises de toutes tailles. Notre mission est de démocratiser l'accès à l'IA en proposant des solutions innovantes, accessibles et sur mesure qui répondent aux besoins spécifiques des PME.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed mt-4">
            Nous accompagnons nos clients dans leur transformation digitale en leur offrant non seulement des outils technologiques de pointe, mais aussi l'expertise et le support nécessaires pour les intégrer efficacement dans leur activité quotidienne. Notre objectif est de créer un impact positif mesurable sur leur productivité, leur rentabilité et leur compétitivité.
          </p>
        </div>

        {/* Notre Équipe */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Notre Équipe</h2>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img 
                src={member.image} 
                alt={member.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="text-indigo-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Nos Valeurs */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nos Valeurs</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {values.map((value, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <value.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {value.title}
              </h3>
              <p className="text-gray-600">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        {/* Notre Histoire */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Notre Histoire</h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-indigo-100"></div>
          
          <div className="space-y-12 relative">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex justify-center">
                <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'order-last text-left pl-8'}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
                
                <div className="w-2/12 flex justify-center">
                  <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-10">
                    {milestone.year}
                  </div>
                </div>
                
                <div className={`w-5/12 ${index % 2 === 0 ? 'order-last text-left pl-8' : 'text-right pr-8'}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;