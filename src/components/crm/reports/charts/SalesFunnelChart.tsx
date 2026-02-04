import React, { useEffect, useState } from 'react';
import { Opportunity } from '../../../../utils/types';

interface SalesFunnelChartProps {
  opportunities: Opportunity[];
}

const SalesFunnelChart: React.FC<SalesFunnelChartProps> = ({ opportunities }) => {
  const [stageData, setStageData] = useState<{ stage: string; count: number; value: number }[]>([]);
  
  useEffect(() => {
    // Define the stages in the correct order
    const stages = ['Qualification', 'Proposition', 'Négociation', 'Gagné', 'Perdu'];
    
    // Create a map to hold the data for each stage
    const stageMap = new Map<string, { count: number; value: number }>();
    
    // Initialize all stages with 0
    stages.forEach(stage => {
      stageMap.set(stage, { count: 0, value: 0 });
    });
    
    // Count opportunities and sum values for each stage
    opportunities.forEach(opp => {
      if (stageMap.has(opp.stage)) {
        const stageData = stageMap.get(opp.stage)!;
        stageData.count += 1;
        stageData.value += opp.estimated_value || 0;
        stageMap.set(opp.stage, stageData);
      }
    });
    
    // Convert the map to an array for rendering
    const data = stages.map(stage => ({
      stage,
      count: stageMap.get(stage)?.count || 0,
      value: stageMap.get(stage)?.value || 0
    }));
    
    setStageData(data);
  }, [opportunities]);
  
  const maxCount = Math.max(...stageData.map(d => d.count), 1);
  const maxWidth = 100; // percentage
  
  // Calculate the appropriate width for each stage
  const getBarWidth = (count: number) => {
    return count > 0 ? Math.max((count / maxCount) * maxWidth, 10) : 5;
  };
  
  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const stageColors: Record<string, string> = {
    'Qualification': '#8b5cf6', // Violet
    'Proposition': '#6366f1',   // Indigo
    'Négociation': '#f59e0b',   // Amber
    'Gagné': '#10b981',         // Green
    'Perdu': '#ef4444'          // Red
  };
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="space-y-3">
        {stageData.map((data, index) => (
          <div key={index} className="flex flex-col">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{data.stage}</span>
              <span className="text-sm font-medium text-gray-500">{data.count} ({formatCurrency(data.value)})</span>
            </div>
            <div className="relative h-7">
              <div
                className="absolute inset-0 bg-gray-200 rounded-lg"
                style={{ width: '100%' }}
              ></div>
              <div
                className={`absolute inset-0 rounded-lg`}
                style={{ 
                  width: `${getBarWidth(data.count)}%`,
                  backgroundColor: stageColors[data.stage] || '#94a3b8'
                }}
              >
                <div className="h-full flex items-center justify-center">
                  {data.count > 0 && (
                    <span className="text-xs font-semibold text-white">
                      {data.count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesFunnelChart;