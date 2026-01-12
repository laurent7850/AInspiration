import React, { useEffect, useState } from 'react';
import { Contact } from '../../../../utils/types';

interface LeadSourceChartProps {
  contacts: Contact[];
}

const LeadSourceChart: React.FC<LeadSourceChartProps> = ({ contacts }) => {
  type SourceData = {
    source: string;
    count: number;
    percentage: number;
    color: string;
  };

  const [sourceData, setSourceData] = useState<SourceData[]>([]);
  
  // Define colors for lead sources
  const sourceColors: Record<string, string> = {
    'Website': '#8b5cf6',     // Violet
    'Site web': '#8b5cf6',    // Violet (French)
    'Referral': '#10b981',    // Green
    'Référence': '#10b981',   // Green (French)
    'LinkedIn': '#6366f1',    // Indigo
    'Email': '#f59e0b',       // Amber
    'Cold Call': '#ef4444',   // Red
    'Prospection': '#ef4444', // Red (French)
    'Conference': '#0ea5e9',  // Sky blue
    'Conférence': '#0ea5e9',  // Sky blue (French)
    'Partner': '#8b5cf6',     // Violet
    'Partenaire': '#8b5cf6',  // Violet (French)
    'Other': '#94a3b8',       // Slate
    'Autre': '#94a3b8',       // Slate (French)
  };
  
  const defaultColors = [
    '#8b5cf6', '#10b981', '#6366f1', '#f59e0b', 
    '#ef4444', '#0ea5e9', '#ec4899', '#64748b'
  ];
  
  useEffect(() => {
    // Count contacts by lead_source
    const sourceCounts: Record<string, number> = {};
    
    contacts.forEach(contact => {
      const source = contact.lead_source || 'Unknown';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });
    
    // Convert to array format needed for chart
    const total = contacts.length;
    let colorIndex = 0;
    
    const data = Object.entries(sourceCounts)
      // Sort by count (descending)
      .sort((a, b) => b[1] - a[1])
      // Transform to required format
      .map(([source, count]) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        const color = sourceColors[source] || defaultColors[colorIndex % defaultColors.length];
        colorIndex++;
        
        return {
          source: source === 'Unknown' ? 'Non spécifié' : source,
          count,
          percentage,
          color
        };
      });
    
    setSourceData(data);
  }, [contacts]);
  
  // Pie chart rendering variables
  const size = 200;
  const center = size / 2;
  const radius = size / 2;
  const totalPercentage = 100;
  
  // Calculate the segments of the pie chart
  const segments = sourceData.map((item, index) => {
    // Calculate the angles
    let startAngle = 0;
    sourceData.slice(0, index).forEach(d => {
      startAngle += (d.percentage / totalPercentage) * 360;
    });
    
    const angle = (item.percentage / totalPercentage) * 360;
    const endAngle = startAngle + angle;
    
    // Convert angles to radians
    const startAngleRad = (startAngle - 90) * Math.PI / 180;
    const endAngleRad = (endAngle - 90) * Math.PI / 180;
    
    // Calculate the path
    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = `M ${center},${center} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;
    
    return {
      ...item,
      path: pathData,
      startAngle,
      endAngle
    };
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-grow items-center justify-center">
        <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {segments.map((segment, i) => (
              <path
                key={i}
                d={segment.path}
                fill={segment.color}
                stroke="white"
                strokeWidth="1"
              />
            ))}
          </svg>
          
          {/* Optional: Add a circle in the middle for a donut chart effect */}
          <div 
            className="absolute bg-white rounded-full flex items-center justify-center text-center"
            style={{
              top: '25%',
              left: '25%',
              width: '50%',
              height: '50%'
            }}
          >
            <div>
              <div className="font-bold text-xl">{contacts.length}</div>
              <div className="text-xs text-gray-600">Contacts</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
        {sourceData.map((source, i) => (
          <div key={i} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: source.color }}
            />
            <div className="flex justify-between w-full">
              <span className="text-xs text-gray-700">{source.source}</span>
              <span className="text-xs font-medium">
                {source.count} ({source.percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadSourceChart;