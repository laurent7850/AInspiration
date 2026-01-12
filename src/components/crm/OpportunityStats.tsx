import { useEffect, useState } from 'react';
import {
  TrendingUp,
  PieChart,
  BarChart2,
  Clock,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { fetchOpportunities } from '../../services/opportunityService';
import { Opportunity, OpportunityStage } from '../../utils/types';

const OpportunityStats: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setLoading(true);
        const data = await fetchOpportunities();
        setOpportunities(data);
      } catch (err) {
        console.error('Failed to load opportunities for stats', err);
        setError('Impossible de charger les statistiques. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadOpportunities();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        <p>{error}</p>
      </div>
    );
  }

  // Calculer les statistiques
  const totalValue = opportunities
    .filter(opp => opp.stage !== 'Perdu')
    .reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
  
  const wonOpportunities = opportunities.filter(opp => opp.stage === 'Gagné');
  const wonValue = wonOpportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
  
  const negotiationOpportunities = opportunities.filter(opp => opp.stage === 'Négociation');
  const negotiationValue = negotiationOpportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);

  const upcomingClosings = opportunities
    .filter(opp => opp.close_date && opp.stage !== 'Gagné' && opp.stage !== 'Perdu')
    .sort((a, b) => {
      if (!a.close_date || !b.close_date) return 0;
      return new Date(a.close_date).getTime() - new Date(b.close_date).getTime();
    })
    .slice(0, 3);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const calculateWinRate = (): string => {
    const closedOpportunities = opportunities.filter(opp => opp.stage === 'Gagné' || opp.stage === 'Perdu');
    if (closedOpportunities.length === 0) return '0%';
    
    const wonCount = wonOpportunities.length;
    return `${Math.round((wonCount / closedOpportunities.length) * 100)}%`;
  };

  // Compter les opportunités par étape
  const getStageDistribution = () => {
    const distribution: Record<OpportunityStage, number> = {
      'Qualification': 0,
      'Proposition': 0,
      'Négociation': 0,
      'Gagné': 0,
      'Perdu': 0
    };

    opportunities.forEach(opp => {
      if (distribution[opp.stage] !== undefined) {
        distribution[opp.stage]++;
      }
    });

    return (Object.keys(distribution) as OpportunityStage[]).map(stage => ({
      stage,
      count: distribution[stage]
    }));
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Si pas d'opportunités
  if (opportunities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <BarChart2 className="w-5 h-5 text-indigo-600" />
          Statistiques du pipeline
        </h2>
        <p className="text-gray-600 text-center py-8">
          Ajoutez vos premières opportunités pour voir apparaître des statistiques ici.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* KPIs */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Vue d'ensemble
        </h2>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-indigo-600 mb-1">
              <DollarSign className="w-4 h-4" />
              <span>Valeur totale</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-green-600 mb-1">
              <DollarSign className="w-4 h-4" />
              <span>Gagné (YTD)</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(wonValue)}</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-purple-600 mb-1">
              <PieChart className="w-4 h-4" />
              <span>Taux de conversion</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{calculateWinRate()}</div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-blue-600 mb-1">
              <BarChart2 className="w-4 h-4" />
              <span>En négociation</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(negotiationValue)}</div>
          </div>
        </div>
      </div>
      
      {/* Clôtures à venir */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-indigo-600" />
          Clôtures prochaines
        </h2>
        
        {upcomingClosings.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            Aucune clôture prochaine planifiée.
          </p>
        ) : (
          <div className="space-y-4">
            {upcomingClosings.map(opp => (
              <div key={opp.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{opp.name}</h3>
                    <p className="text-sm text-gray-600">{opp.company_name || 'Aucune entreprise'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-indigo-600">{formatCurrency(opp.estimated_value || 0)}</div>
                    <div className="text-xs text-gray-500">{formatDate(opp.close_date)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityStats;