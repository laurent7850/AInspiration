import React from 'react';
import { 
  LineChart,
  BarChart2,
  PieChart,
  Activity,
  ArrowRight,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const metrics = [
    {
      label: "Ventes",
      value: "€45,289",
      change: "+12.5%",
      trend: "up"
    },
    {
      label: "Clients",
      value: "1,249",
      change: "+18.2%",
      trend: "up"
    },
    {
      label: "Conversion",
      value: "3.2%",
      change: "+2.1%",
      trend: "up"
    },
    {
      label: "Durée session",
      value: "2m 45s",
      change: "+0.8%",
      trend: "up"
    }
  ];

  const features = [
    {
      icon: LineChart,
      title: "Temps réel",
      description: "Données en direct"
    },
    {
      icon: BarChart2,
      title: "Analyse comparative",
      description: "Comparez vos performances"
    },
    {
      icon: PieChart,
      title: "Personnalisation",
      description: "Adaptez vos métriques"
    },
    {
      icon: Activity,
      title: "Alertes",
      description: "Notifications intelligentes"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tableau de Bord
          </h1>
          <p className="text-xl text-gray-600">
            Pilotez votre performance en temps réel
          </p>
        </div>

        {/* Métriques */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-600 text-sm">{metric.label}</h3>
                <span className={`text-sm font-semibold ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Fonctionnalités */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h2>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-indigo-600 rounded-2xl p-8 lg:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Optimisez votre performance
              </h2>
              <p className="text-indigo-100 mb-6">
                Accédez à toutes vos données en un coup d'œil
              </p>
              <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2">
                Commencer maintenant
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Zap className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">0.1s</div>
                <div className="text-indigo-100">Temps de réponse</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <RefreshCw className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">Live</div>
                <div className="text-indigo-100">Mises à jour</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}