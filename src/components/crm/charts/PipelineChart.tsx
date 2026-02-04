import { useEffect, useRef, useState } from 'react';
import { Opportunity } from '../../../utils/types';

type StageKey = 'Qualification' | 'Proposition' | 'Négociation' | 'Gagné' | 'Perdu';

interface PipelineChartProps {
  opportunities: Opportunity[];
}

const PipelineChart: React.FC<PipelineChartProps> = ({ opportunities }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<{stage: StageKey; count: number; value: number}[]>([]);

  const stageColors: Record<StageKey, string> = {
    'Qualification': '#3B82F6', // blue-500
    'Proposition': '#8B5CF6', // violet-500
    'Négociation': '#F97316', // orange-500
    'Gagné': '#22C55E', // green-500
    'Perdu': '#EF4444' // red-500
  };

  useEffect(() => {
    // Calculate data for chart
    const stages: StageKey[] = ['Qualification', 'Proposition', 'Négociation', 'Gagné', 'Perdu'];
    const data = stages.map(stage => {
      const stageOpportunities = opportunities.filter(opp => opp.stage === stage);
      const count = stageOpportunities.length;
      const value = stageOpportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);

      return { stage, count, value };
    });

    setChartData(data);
  }, [opportunities]);
  
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  };
  
  const maxValue = Math.max(...chartData.map(d => d.value || 0));
  const barHeight = 200; // Maximum height for bars in pixels
  
  return (
    <div ref={chartRef} className="w-full h-full flex flex-col">
      <div className="flex flex-1 items-end justify-center gap-4 pb-8">
        {chartData.map((data, index) => (
          <div key={index} className="flex flex-col items-center relative">
            <div className="text-xs mb-1 font-medium text-gray-600">
              {formatCurrency(data.value)}
            </div>
            <div
              className="w-12 rounded-t-md flex items-end justify-center transition-all duration-500"
              style={{
                height: `${data.value ? (data.value / maxValue) * barHeight : 10}px`,
                backgroundColor: stageColors[data.stage] || '#94A3B8',
              }}
            >
              <div className="text-white text-xs font-bold py-1">{data.count}</div>
            </div>
            <div
              className="text-xs mt-2 text-center absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
              style={{color: stageColors[data.stage] || '#94A3B8'}}
            >
              {data.stage}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PipelineChart;