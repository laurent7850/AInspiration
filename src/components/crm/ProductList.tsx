import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash, 
  SearchIcon, 
  Filter, 
  Tag, 
  CircleDollarSign,
  Link,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchProducts, deleteProduct } from '../../services/productService';
import { Product } from '../../utils/types';

interface ProductListProps {
  onCreateNew: () => void;
  onEditProduct: (id: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ onCreateNew, onEditProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts(false); // Load all products, not just active ones
        setProducts(data);
        
        // Extract unique categories
        const categories = [...new Set(data.map(product => product.category).filter(Boolean))];
        setUniqueCategories(categories as string[]);
        
        setFilteredProducts(data);
      } catch (err) {
        console.error('Failed to load products', err);
        setError('Impossible de charger les produits. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...products];
    
    // Filter by status (is_active)
    if (statusFilter !== 'all') {
      result = result.filter(product => 
        statusFilter === 'active' ? product.is_active : !product.is_active
      );
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      result = result.filter(product => product.category === categoryFilter);
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => 
        (product.name?.toLowerCase() || '').includes(term) || 
        (product.description?.toLowerCase() || '').includes(term) ||
        (product.category?.toLowerCase() || '').includes(term)
      );
    }
    
    setFilteredProducts(result);
  }, [products, statusFilter, categoryFilter, searchTerm]);

  // Handle product deletion
  const handleDelete = async (id: string) => {
    if (deleteConfirmId === id) {
      try {
        if (user) {
          await deleteProduct(id, user.id);
          setProducts(products.filter(product => product.id !== id));
          setDeleteConfirmId(null);
        }
      } catch (err) {
        console.error('Failed to delete product', err);
        setError('Impossible de supprimer le produit. Veuillez réessayer.');
      }
    } else {
      setDeleteConfirmId(id);
    }
  };

  // Format currency
  const formatCurrency = (price?: number, currency?: string): string => {
    if (price === undefined || price === null) return '-';
    
    const currencyCode = currency || 'EUR';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currencyCode }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-white bg-red-600 px-4 py-2 rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-6 h-6 text-indigo-600" />
          Catalogue produits
        </h2>
        <button 
          onClick={onCreateNew}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau produit
        </button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Category filter */}
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Toutes catégories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Tous statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Aucun produit trouvé.</p>
          <button 
            onClick={onCreateNew}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Créer votre premier produit
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr 
                  key={product.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onEditProduct(product.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-500">
                            {product.description.length > 50 
                              ? `${product.description.substring(0, 50)}...` 
                              : product.description}
                          </div>
                        )}
                      </div>
                    </div>
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
                    <div className="flex items-center">
                      <CircleDollarSign className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900 font-medium">{formatCurrency(product.price, product.currency)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProduct(product.id);
                        }}
                        title="Voir/Modifier"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product.id);
                        }}
                        title={deleteConfirmId === product.id ? "Confirmez la suppression" : "Supprimer"}
                        className={`${deleteConfirmId === product.id ? 'text-red-600' : 'text-gray-500'} hover:text-red-700`}
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                      {product.is_active ? (
                        <button
                          title="Désactiver"
                          className="text-gray-500 hover:text-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Implementation for toggling active state
                          }}
                        >
                          <EyeOff className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          title="Activer"
                          className="text-gray-500 hover:text-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Implementation for toggling active state
                          }}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      )}
                      <a 
                        href={`/products/${product.id}`}
                        title="Lien direct"
                        className="text-gray-500 hover:text-indigo-600"
                        onClick={e => e.stopPropagation()}
                      >
                        <Link className="w-5 h-5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductList;