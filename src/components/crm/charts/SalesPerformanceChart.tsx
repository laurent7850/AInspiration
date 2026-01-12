import React, { useEffect, useMemo } from 'react';
import { Opportunity } from '../../../utils/types';

interface SalesPerformanceChartProps {
  opportunities: Opportunity[];
}

const SalesPerformanceChart: React.FC<SalesPerformanceChartProps> = ({ opportunities }) => {
  // Utiliser un tableau simple pour le moment - dans une version future on pourrait ajouter une bibliothèque de graphiques plus avancée
  const performanceData = useMemo(() => {
    // Obtenir les 6 derniers mois
    const today = new Date();
    const lastSixMonths = Array.from({length: 6}, (_, i) => {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      return {
        month: date.toLocaleDateString('fr-FR', {month: 'short', year: 'numeric'}),
        date: date,
        won: 0,
        lost: 0,
        pending: 0
      };
    }).reverse();
    
    // Regrouper les opportunités par mois
    opportunities.forEach(opp => {
      const closeDate = opp.close_date ? new Date(opp.close_date) : null;
      const createdDate = new Date(opp.created_at || new Date());
      
      // Utiliser la date de clôture si disponible, sinon la date de création
      const date = closeDate || createdDate;
      
      // Trouver le mois correspondant
      const monthData = lastSixMonths.find(m => {
        return date.getMonth() === m.date.getMonth() && date.getFullYear() === m.date.getFullYear();
      });
      
      if (monthData) {
        if (opp.stage === 'Gagné') {
          monthData.won += opp.estimated_value || 0;
        } else if (opp.stage === 'Perdu') {
          monthData.lost += opp.estimated_value || 0;
        } else {
          monthData.pending += opp.estimated_value || 0;
        }
      }
    });
    
    return lastSixMonths;
  }, [opportunities]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  };

  const maxValue = Math.max(
    ...performanceData.map(d => Math.max(d.won, d.lost, d.pending))
  );
  
  const getHeight = (value: number) => {
    if (maxValue === 0) return 0;
    return (value / maxValue) * 100;
  };

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
          <span className="text-xs text-gray-600">Gagné</span>
        </div>
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
          <span className="text-xs text-gray-600">Perdu</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-300 rounded-full mr-1"></div>
          <span className="text-xs text-gray-600">En cours</span>
        </div>
      </div>
      
      <div className="flex h-52 items-end justify-between">
        {performanceData.map((data, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full h-44 flex justify-center items-end gap-0.5">
              {/* Barre "Gagné" */}
              {data.won > 0 && (
                <div 
                  className="w-4 bg-green-500 rounded-t-sm transition-all duration-500"
                  style={{height: `${getHeight(data.won)}%`}}
                  title={`Gagné: ${formatCurrency(data.won)}`}
                ></div>
              )}
              
              {/* Barre "Perdu" */}
              {data.lost > 0 && (
                <div 
                  className="w-4 bg-red-500 rounded-t-sm transition-all duration-500"
                  style={{height: `${getHeight(data.lost)}%`}}
                  title={`Perdu: ${formatCurrency(data.lost)}`}
                ></div>
              )}
              
              {/* Barre "En cours" */}
              {data.pending > 0 && (
                <div 
                  className="w-4 bg-blue-300 rounded-t-sm transition-all duration-500"
                  style={{height: `${getHeight(data.pending)}%`}}
                  title={`En cours: ${formatCurrency(data.pending)}`}
                ></div>
              )}
              
              {/* Si pas de données, afficher une barre vide */}
              {data.won === 0 && data.lost === 0 && data.pending === 0 && (
                <div className="w-4 bg-gray-200 rounded-t-sm" style={{height: '5px'}}></div>
              )}
            </div>
            
            <div className="text-xs text-gray-600 mt-2 whitespace-nowrap">
              {data.month}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesPerformanceChart;