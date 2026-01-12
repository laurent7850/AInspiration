import { useState, useEffect } from 'react';
import { DollarSign, Calendar, User, Building, Package, ArrowDownUp } from 'lucide-react';
import { Opportunity } from '../../../utils/types';
import { fetchOpportunities } from '../../../services/opportunityService';
import ReportFilters from './ReportFilters';
import ReportExporter from './ReportExporter';
import DateRangePicker from './DateRangePicker';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  label: string;
  options: FilterOption[];
  selected: string[];
}

type OpportunityFilters = {
  stage: FilterConfig;
};

const OpportunitiesReport: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date()
  });

  const [filters, setFilters] = useState<OpportunityFilters>({
    stage: {
      label: "Étape",
      options: [
        { value: 'Qualification', label: 'Qualification' },
        { value: 'Proposition', label: 'Proposition' },
        { value: 'Négociation', label: 'Négociation' },
        { value: 'Gagné', label: 'Gagné' },
        { value: 'Perdu', label: 'Perdu' }
      ],
      selected: []
    }
  });
  
  // Columns for the report table and export
  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'stage', label: 'Étape' },
    { key: 'company_name', label: 'Entreprise' },
    { key: 'contact_name', label: 'Contact' },
    { key: 'estimated_value', label: 'Valeur estimée' },
    { key: 'close_date', label: 'Date de clôture' },
    { key: 'created_at', label: 'Date de création' }
  ];
  
  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setLoading(true);
        const data = await fetchOpportunities();
        setOpportunities(data);
      } catch (err) {
        console.error('Failed to load opportunities:', err);
        setError('Impossible de charger les opportunités');
      } finally {
        setLoading(false);
      }
    };
    
    loadOpportunities();
  }, []);
  
  useEffect(() => {
    // Apply filters to opportunities
    let result = [...opportunities];
    
    // Filter by date range
    result = result.filter(opp => {
      const date = new Date(opp.created_at || '');
      return date >= dateRange.start && date <= dateRange.end;
    });
    
    // Apply stage filter
    if (filters.stage.selected.length > 0) {
      result = result.filter(opp => filters.stage.selected.includes(opp.stage));
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortField as keyof Opportunity];
      let valueB = b[sortField as keyof Opportunity];
      
      // Handle special cases for sorting
      if (sortField === 'estimated_value') {
        valueA = valueA || 0;
        valueB = valueB || 0;
      } else if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      // @ts-ignore - Date check
      else if (valueA instanceof Date && valueB instanceof Date) {
        // @ts-ignore - Converting dates to numbers
        valueA = valueA.getTime();
        // @ts-ignore - Converting dates to numbers
        valueB = valueB.getTime();
      }
      
      if (valueA !== undefined && valueB !== undefined) {
        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredOpportunities(result);
  }, [opportunities, filters, sortField, sortDirection, dateRange]);

  const handleFilterChange = (filterName: string, values: string[]) => {
    if (filterName in filters) {
      setFilters(prev => ({
        ...prev,
        [filterName]: {
          ...prev[filterName as keyof OpportunityFilters],
          selected: values
        }
      }));
    }
  };
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set to default (descending)
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const formatCurrency = (value?: number): string => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };
  
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  const stageColors: Record<string, string> = {
    'Qualification': 'bg-blue-100 text-blue-800',
    'Proposition': 'bg-purple-100 text-purple-800',
    'Négociation': 'bg-orange-100 text-orange-800',
    'Gagné': 'bg-green-100 text-green-800',
    'Perdu': 'bg-red-100 text-red-800',
  };
  
  // Calculate totals for summary
  const totalCount = filteredOpportunities.length;
  const totalValue = filteredOpportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
  const avgValue = totalCount > 0 ? totalValue / totalCount : 0;
  const wonCount = filteredOpportunities.filter(opp => opp.stage === 'Gagné').length;
  const wonRate = totalCount > 0 ? (wonCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Rapport des opportunités
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <DateRangePicker 
            startDate={dateRange.start} 
            endDate={dateRange.end}
            onChange={(start, end) => setDateRange({start, end})}
          />
          
          <ReportExporter 
            reportName="opportunities_report"
            data={filteredOpportunities}
            columns={columns}
          />
        </div>
      </div>
      
      <ReportFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold">{totalCount}</div>
          <div className="text-sm text-gray-500">opportunités</div>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Valeur totale</div>
          <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          <div className="text-sm text-gray-500">du pipeline</div>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Valeur moyenne</div>
          <div className="text-2xl font-bold">{formatCurrency(avgValue)}</div>
          <div className="text-sm text-gray-500">par opportunité</div>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Taux de conversion</div>
          <div className="text-2xl font-bold">{wonRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-500">{wonCount} gagnées / {totalCount}</div>
        </div>
      </div>
      
      {/* Data table */}
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.key === 'name' && (
                      <span className="text-indigo-500"><DollarSign className="w-4 h-4" /></span>
                    )}
                    {column.key === 'company_name' && (
                      <span className="text-indigo-500"><Building className="w-4 h-4" /></span>
                    )}
                    {column.key === 'contact_name' && (
                      <span className="text-indigo-500"><User className="w-4 h-4" /></span>
                    )}
                    {column.key === 'close_date' && (
                      <span className="text-indigo-500"><Calendar className="w-4 h-4" /></span>
                    )}
                    {column.key === 'product_name' && (
                      <span className="text-indigo-500"><Package className="w-4 h-4" /></span>
                    )}
                    
                    <span>{column.label}</span>
                    
                    {sortField === column.key && (
                      <ArrowDownUp className={`w-3.5 h-3.5 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOpportunities.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  Aucune opportunité trouvée pour les filtres sélectionnés
                </td>
              </tr>
            ) : (
              filteredOpportunities.map((opportunity) => (
                <tr key={opportunity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{opportunity.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${stageColors[opportunity.stage] || 'bg-gray-100 text-gray-800'}`}>
                      {opportunity.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{opportunity.company_name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{opportunity.contact_name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(opportunity.estimated_value)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(opportunity.close_date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(opportunity.created_at)}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpportunitiesReport;