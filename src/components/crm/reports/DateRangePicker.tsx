import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (startDate: Date, endDate: Date) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ 
  startDate, 
  endDate, 
  onChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Predefined ranges
  const presets = [
    { 
      label: '7 derniers jours', 
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);
        return { start, end };
      }
    },
    { 
      label: '30 derniers jours', 
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        return { start, end };
      }
    },
    { 
      label: 'Ce mois', 
      getValue: () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth(), 1);
        return { start, end };
      }
    },
    { 
      label: 'Mois dernier', 
      getValue: () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
        end.setDate(0); // Last day of previous month
        return { start, end };
      }
    },
    { 
      label: 'Cette année', 
      getValue: () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), 0, 1);
        return { start, end };
      }
    },
    { 
      label: 'Année dernière', 
      getValue: () => {
        const end = new Date(new Date().getFullYear() - 1, 11, 31);
        const start = new Date(end.getFullYear(), 0, 1);
        return { start, end };
      }
    }
  ];
  
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR');
  };

  const handlePresetClick = (preset: typeof presets[0]) => {
    const { start, end } = preset.getValue();
    onChange(start, end);
    setIsOpen(false);
  };
  
  // Get the current date range label
  const getCurrentRangeLabel = (): string => {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Calendar className="w-4 h-4 text-gray-500" />
        <span>{getCurrentRangeLabel()}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
          <div className="p-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => handlePresetClick(preset)}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
          
          <div className="border-t border-gray-100 p-2">
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full text-center px-3 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-md transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;