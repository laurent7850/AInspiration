import React from 'react';
import { 
  Scan, 
  FileSearch, 
  PieChart, 
  Lightbulb
} from 'lucide-react';

export default function AuditSection() {
  const auditSteps = [
    {
      id: 1,
      icon: Scan,
      title: 'Analyse initiale',
      description: 'Évaluation complète de vos processus actuels'
    },
    {
      id: 2,
      icon: FileSearch,
      title: 'Diagnostic approfondi',
      description: 'Identification des opportunités d\'amélioration'
    },
    {
      id: 3,
      icon: PieChart,
      title: 'Analyse d\'impact',
      description: 'Estimation des bénéfices potentiels'
    },
    {
      id: 4,
      icon: Lightbulb,
      title: 'Plan d\'action',
      description: 'Recommandations détaillées et feuille de route'
    }
  ];

  return (
    <section id="audit" className="py-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Audit IA
          </h2>
          <p className="text-xl text-gray-600">
            Évaluez votre potentiel d'innovation avec l'IA
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {auditSteps.map((step) => (
            <div 
              key={step.id}
              className="flex flex-col p-6 rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}