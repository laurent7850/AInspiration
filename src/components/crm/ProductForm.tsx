import React, { useEffect, useState } from 'react';
import { 
  Save, 
  X, 
  AlertTriangle, 
  Package, 
  CircleDollarSign, 
  FileText, 
  Tag,
  ToggleLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  createProduct, 
  fetchProductById, 
  updateProduct 
} from '../../services/productService';
import { Product } from '../../utils/types';

interface ProductFormProps {
  productId?: string;
  onClose: () => void;
  onSaved: () => void;
}

const initialProduct: Omit<Product, 'id' | 'created_at'> = {
  name: '',
  description: '',
  price: undefined,
  currency: 'EUR',
  category: '',
  is_active: true
};

const ProductForm: React.FC<ProductFormProps> = ({ productId, onClose, onSaved }) => {
  const [product, setProduct] = useState<Omit<Product, 'id' | 'created_at'>>(initialProduct);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  
  const currencies = [
    { code: 'EUR', label: 'Euro (€)' },
    { code: 'USD', label: 'Dollar US ($)' },
    { code: 'GBP', label: 'Livre sterling (£)' },
    { code: 'CHF', label: 'Franc suisse (CHF)' }
  ];
  
  const categories = [
    'Audit IA',
    'Consultation',
    'Formation',
    'Développement sur mesure',
    'Logiciel SaaS',
    'Assistance technique',
    'Automatisation',
    'Autre'
  ];

  // Load product data if editing
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        const data = await fetchProductById(productId);
        setProduct(data);
      } catch (err) {
        console.error('Failed to load product', err);
        setError('Impossible de charger les détails du produit. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      // Handle checkbox for is_active
      setProduct(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else if (name === 'price') {
      // Handle numeric input for price
      setProduct(prev => ({
        ...prev,
        [name]: value ? parseFloat(value) : undefined
      }));
    } else {
      // Handle all other inputs
      setProduct(prev => ({
        ...prev,
        [name]: value || undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Vous devez être connecté pour effectuer cette action.');
      return;
    }
    
    try {
      setSaving(true);
      
      // Validate required fields
      if (!product.name) {
        setError('Le nom du produit est obligatoire');
        setSaving(false);
        return;
      }
      
      if (productId) {
        // Update existing product
        await updateProduct(productId, product, user.id);
      } else {
        // Create new product
        await createProduct(product, user.id);
      }
      
      onSaved();
    } catch (err) {
      console.error('Failed to save product', err);
      setError('Impossible de sauvegarder le produit. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {productId ? 'Modifier le produit' : 'Nouveau produit'}
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            Informations produit
          </h3>
          
          <div className="space-y-4">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom du produit*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={product.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nom du produit ou service"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={product.description || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Description détaillée du produit..."
                ></textarea>
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={product.category || ''}
                  onChange={handleChange}
                  list="category-suggestions"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: Formation, Audit, Service..."
                />
                <datalist id="category-suggestions">
                  {categories.map(category => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-indigo-600" />
            Tarification
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Prix
              </label>
              <div className="relative">
                <CircleDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={product.price || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Devise
              </label>
              <select
                id="currency"
                name="currency"
                value={product.currency || 'EUR'}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <ToggleLeft className="w-5 h-5 text-indigo-600" />
            Statut
          </h3>
          
          <div className="relative flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={product.is_active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="is_active" className="font-medium text-gray-700">Produit actif</label>
              <p className="text-gray-500">Les produits inactifs ne sont pas visibles lors de la création d'opportunités</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;