import React, { useState, useEffect } from 'react';
import { Package, CircleDollarSign, Tag, Calendar, ArrowDownUp, PieChart, Eye, EyeOff } from 'lucide-react';
import { Product } from '../../../utils/types';
import { fetchProducts } from '../../../services/productService';
import ReportFilters from './ReportFilters';
import ReportExporter from './ReportExporter';
import DateRangePicker from './DateRangePicker';
import { fetchOpportunities } from '../../../services/opportunityService';
import { Opportunity } from '../../../utils/types';

const ProductsReport: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: new Date(new Date().setDate(new Date().getDate() - 90)),
    end: new Date()
  });
  
  const [filters, setFilters] = useState({
    is_active: {
      label: "Statut",
      options: [
        { value: 'true', label: 'Actif' },
        { value: 'false', label: 'Inactif' }
      ],
      selected: []
    },
    category: {
      label: "Catégorie",
      options: [] as { value: string; label: string }[],
      selected: []
    }
  });
  
  // Columns for the report table and export
  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'description', label: 'Description' },
    { key: 'price', label: 'Prix' },
    { key: 'currency', label: 'Devise' },
    { key: 'category', label: 'Catégorie' },
    { key: 'is_active', label: 'Statut' },
    { key: 'created_at', label: 'Date de création' }
  ];
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, opportunitiesData] = await Promise.all([
          fetchProducts(false), // Get all products, both active and inactive
          fetchOpportunities()
        ]);
        
        setProducts(productsData);
        setOpportunities(opportunitiesData);
        
        // Extract unique categories for filter
        const categories = [...new Set(productsData.map(p => p.category).filter(Boolean))];
        setFilters(prev => ({
          ...prev,
          category: {
            ...prev.category,
            options: categories.map(category => ({ 
              value: category!, 
              label: category! 
            }))
          }
        }));
      } catch (err) {
        console.error('Failed to load products data:', err);
        setError('Impossible de charger les produits');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  useEffect(() => {
    // Apply filters to products
    let result = [...products];
    
    // Filter by date range (created_at)
    result = result.filter(product => {
      const date = new Date(product.created_at || '');
      return date >= dateRange.start && date <= dateRange.end;
    });
    
    // Apply active status filter
    if (filters.is_active.selected.length > 0) {
      const isActive = filters.is_active.selected.includes('true');
      const isInactive = filters.is_active.selected.includes('false');
      
      if (isActive && !isInactive) {
        result = result.filter(product => product.is_active);
      } else if (!isActive && isInactive) {
        result = result.filter(product => !product.is_active);
      }
      // If both or neither are selected, no filtering needed
    }
    
    // Apply category filter
    if (filters.category.selected.length > 0) {
      result = result.filter(product => 
        product.category && filters.category.selected.includes(product.category)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortField as keyof Product];
      let valueB = b[sortField as keyof Product];
      
      // Handle special cases for sorting
      if (sortField === 'is_active') {
        valueA = valueA ? 1 : 0;
        valueB = valueB ? 1 : 0;
      } else if (sortField === 'price') {
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
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredProducts(result);
  }, [products, filters, sortField, sortDirection, dateRange]);
  
  const handleFilterChange = (filterName: string, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: {
        ...prev[filterName],
        selected: values
      }
    }));
  };
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set to default direction
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const formatCurrency = (price?: number, currency?: string): string => {
    if (price === undefined || price === null) return '-';
    
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: currency || 'EUR' 
    }).format(price);
  };
  
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  // Calculate product statistics
  const calculateProductStats = (productId: string) => {
    const productOpportunities = opportunities.filter(opp => opp.product_id === productId);
    const totalCount = productOpportunities.length;
    const wonCount = productOpportunities.filter(opp => opp.stage === 'Gagné').length;
    const lostCount = productOpportunities.filter(opp => opp.stage === 'Perdu').length;
    const openCount = totalCount - wonCount - lostCount;
    
    const totalValue = productOpportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
    const wonValue = productOpportunities
      .filter(opp => opp.stage === 'Gagné')
      .reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
    
    return { totalCount, wonCount, lostCount, openCount, totalValue, wonValue };
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  // Calculate overall statistics
  const activeCount = products.filter(p => p.is_active).length;
  const inactiveCount = products.length - activeCount;
  
  // Group by category
  const categoryCounts: Record<string, number> = {};
  products.forEach(product => {
    if (product.category) {
      categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
    }
  });
  
  const topCategory = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .shift();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Rapport des produits
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <DateRangePicker 
            startDate={dateRange.start} 
            endDate={dateRange.end}
            onChange={(start, end) => setDateRange({start, end})}
          />
          
          <ReportExporter 
            reportName="products_report"
            data={filteredProducts}
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
          <div className="text-2xl font-bold">{products.length}</div>
          <div className="text-sm text-gray-500">produits</div>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Produits actifs</div>
          <div className="text-2xl font-bold">{activeCount}</div>
          <div className="text-sm text-gray-500">{((activeCount / products.length) * 100).toFixed(1)}% du catalogue</div>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Produits inactifs</div>
          <div className="text-2xl font-bold">{inactiveCount}</div>
          <div className="text-sm text-gray-500">{((inactiveCount / products.length) * 100).toFixed(1)}% du catalogue</div>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Top catégorie</div>
          <div className="text-2xl font-bold">
            {topCategory ? topCategory[0] : '-'}
          </div>
          <div className="text-sm text-gray-500">
            {topCategory ? `${topCategory[1]} produits` : 'Aucune catégorie'}
          </div>
        </div>
      </div>
      
      {/* Products performance */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-indigo-600" />
          Performance des produits
        </h3>
        
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <div className="grid grid-cols-6 gap-4 p-4 font-medium text-gray-600 text-sm border-b border-gray-200">
            <div className="col-span-2">Produit</div>
            <div>Opportunités</div>
            <div>Gagnées</div>
            <div>Taux</div>
            <div>Chiffre d'affaires</div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Aucun produit trouvé pour les filtres sélectionnés
              </div>
            ) : (
              filteredProducts
                .filter(product => {
                  const stats = calculateProductStats(product.id);
                  return stats.totalCount > 0;
                })
                .sort((a, b) => {
                  const statsA = calculateProductStats(a.id);
                  const statsB = calculateProductStats(b.id);
                  return statsB.wonValue - statsA.wonValue;
                })
                .slice(0, 10)  // Show top 10 performers
                .map((product) => {
                  const stats = calculateProductStats(product.id);
                  const winRate = stats.totalCount > 0 
                    ? (stats.wonCount / stats.totalCount) * 100 
                    : 0;
                  
                  return (
                    <div key={product.id} className="grid grid-cols-6 gap-4 p-4 hover:bg-gray-100 transition-colors text-sm">
                      <div className="col-span-2 flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${product.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                      </div>
                      <div className="flex items-center">{stats.totalCount}</div>
                      <div className="flex items-center">{stats.wonCount}</div>
                      <div className="flex items-center">{winRate.toFixed(1)}%</div>
                      <div className="flex items-center font-medium text-gray-900">
                        {formatCurrency(stats.wonValue)}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
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
                      <span className="text-indigo-500"><Package className="w-4 h-4" /></span>
                    )}
                    {column.key === 'price' && (
                      <span className="text-indigo-500"><CircleDollarSign className="w-4 h-4" /></span>
                    )}
                    {column.key === 'category' && (
                      <span className="text-indigo-500"><Tag className="w-4 h-4" /></span>
                    )}
                    {column.key === 'is_active' && (
                      <span className="text-indigo-500"><Eye className="w-4 h-4" /></span>
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
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  Aucun produit trouvé pour les filtres sélectionnés
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2.5 h-2.5 rounded-full mr-2 ${
                        product.is_active ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2">{product.description || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(product.price, product.currency)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.currency || 'EUR'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.category ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.is_active ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Eye className="w-3 h-3 mr-1" />Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <EyeOff className="w-3 h-3 mr-1" />Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(product.created_at)}</div>
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

export default ProductsReport;