import React from 'react';
import { Filter, Check } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface ReportFiltersProps {
  filters: {
    [key: string]: {
      label: string;
      options: FilterOption[];
      selected: string[];
    }
  };
  onFilterChange: (filterName: string, values: string[]) => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({ filters, onFilterChange }) => {
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);
  
  const toggleFilterMenu = (filterName: string) => {
    setActiveFilter(activeFilter === filterName ? null : filterName);
  };
  
  const toggleFilterOption = (filterName: string, value: string) => {
    const currentSelected = filters[filterName].selected;
    let newSelected: string[];
    
    // If already selected, remove it
    if (currentSelected.includes(value)) {
      newSelected = currentSelected.filter(v => v !== value);
    } else {
      // Otherwise, add it
      newSelected = [...currentSelected, value];
    }
    
    onFilterChange(filterName, newSelected);
  };
  
  const isSelected = (filterName: string, value: string): boolean => {
    return filters[filterName].selected.includes(value);
  };
  
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {Object.entries(filters).map(([filterName, filterData]) => (
        <div key={filterName} className="relative">
          <button
            onClick={() => toggleFilterMenu(filterName)}
            className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-lg text-sm ${
              activeFilter === filterName || filterData.selected.length > 0
                ? 'border-indigo-600 text-indigo-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>{filterData.label}</span>
            {filterData.selected.length > 0 && (
              <span className="bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full px-1.5 py-0.5 min-w-5 text-center">
                {filterData.selected.length}
              </span>
            )}
          </button>
          
          {activeFilter === filterName && (
            <div className="absolute left-0 mt-1 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-40">
              {filterData.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleFilterOption(filterName, option.value)}
                  className={`flex items-center w-full gap-2 px-3 py-2 text-sm rounded-md text-left ${
                    isSelected(filterName, option.value)
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    isSelected(filterName, option.value)
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-gray-300'
                  }`}>
                    {isSelected(filterName, option.value) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReportFilters;