import React, { useEffect, useState } from 'react';
import {
  Package,
  CircleDollarSign,
  Tag,
  Edit,
  ArrowLeft,
  FileText,
  PlusSquare,
  Clock,
  BarChart2,
  Link as LinkIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchProductById } from '../../services/productService';
import { fetchOpportunities } from '../../services/opportunityService';
import { Product, Opportunity } from '../../utils/types';
import ActivityFeed from './ActivityFeed';

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
  onEdit: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onBack, onEdit }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedOpportunities, setRelatedOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch product details
        const productData = await fetchProductById(productId);
        setProduct(productData);
        
        // Fetch all opportunities, then filter by product_id
        const allOpportunities = await fetchOpportunities();
        const productOpportunities = allOpportunities.filter(opp => opp.product_id === productId);
        setRelatedOpportunities(productOpportunities);
        
      } catch (err) {
        console.error('Failed to load product details', err);
        setError('Impossible de charger les détails du produit. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [productId]);

  // Format currency
  const formatCurrency = (price?: number, currency?: string): string => {
    if (price === undefined || price === null) return '-';
    
    const currencyCode = currency || 'EUR';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currencyCode }).format(price);
  };

  // Calculate opportunity statistics for this product
  const calculateStats = () => {
    const total = relatedOpportunities.length;
    const open = relatedOpportunities.filter(
      opp => opp.stage !== 'Gagné' && opp.stage !== 'Perdu'
    ).length;
    const won = relatedOpportunities.filter(opp => opp.stage === 'Gagné').length;
    const lost = relatedOpportunities.filter(opp => opp.stage === 'Perdu').length;
    
    const totalValue = relatedOpportunities.reduce(
      (sum, opp) => sum + (opp.estimated_value || 0), 
      0
    );
    
    const wonValue = relatedOpportunities
      .filter(opp => opp.stage === 'Gagné')
      .reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
    
    return { total, open, won, lost, totalValue, wonValue };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        <p>{error || "Produit introuvable"}</p>
        <button 
          onClick={onBack} 
          className="mt-2 text-white bg-red-600 px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-start mb-8">
        <button 
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/opportunities/new', { 
              state: { 
                productId: productId 
              }
            })}
            className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
          >
            <PlusSquare className="w-5 h-5" />
            Nouvelle opportunité
          </button>
          <button 
            onClick={onEdit}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Edit className="w-5 h-5" />
            Modifier
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-1/3">
          <div className="bg-indigo-50 rounded-xl p-8 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                <div className="flex items-center mt-1">
                  <div className={`w-3 h-3 rounded-full mr-2 ${product.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {product.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CircleDollarSign className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Prix</p>
                  <p className="text-xl font-semibold">{formatCurrency(product.price, product.currency)}</p>
                </div>
              </div>
              
              {product.category && (
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Catégorie</p>
                    <p className="text-lg">{product.category}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Product Statistics Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              Statistiques
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Opportunités totales</p>
                <p className="text-xl font-semibold">{stats.total}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Opportunités ouvertes</p>
                <p className="text-xl font-semibold">{stats.open}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm text-green-700">Opportunités gagnées</p>
                <p className="text-xl font-semibold text-green-700">{stats.won}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-sm text-red-700">Opportunités perdues</p>
                <p className="text-xl font-semibold text-red-700">{stats.lost}</p>
              </div>
              {stats.totalValue > 0 && (
                <div className="col-span-2 bg-indigo-50 rounded-lg p-3">
                  <p className="text-sm text-indigo-700">Valeur totale</p>
                  <p className="text-xl font-semibold text-indigo-700">{formatCurrency(stats.totalValue)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="md:w-2/3">
          {/* Description Section */}
          {product.description && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Description
              </h2>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
              </div>
            </div>
          )}
          
          {/* Related Opportunities Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-600" />
                Opportunités liées
              </h2>
              
              <button
                onClick={() => navigate('/opportunities/new', { 
                  state: { productId: productId } 
                })}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <PlusSquare className="w-4 h-4" />
                Nouvelle opportunité
              </button>
            </div>
            
            {relatedOpportunities.length === 0 ? (
              <p className="text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
                Aucune opportunité liée à ce produit
              </p>
            ) : (
              <div className="bg-gray-50 rounded-lg divide-y divide-gray-100">
                {relatedOpportunities.map(opportunity => (
                  <div key={opportunity.id} className="p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <a 
                          href={`/opportunities/${opportunity.id}`}
                          className="text-base font-medium text-gray-900 hover:text-indigo-600"
                        >
                          {opportunity.name}
                        </a>
                        {opportunity.company_name && (
                          <p className="text-sm text-gray-600">{opportunity.company_name}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            opportunity.stage === 'Gagné' ? 'bg-green-100 text-green-800' :
                            opportunity.stage === 'Perdu' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {opportunity.stage}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatCurrency(opportunity.estimated_value)}
                          </span>
                        </div>
                      </div>
                      <a 
                        href={`/opportunities/${opportunity.id}`}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Activity Feed Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Historique des activités
            </h2>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <ActivityFeed 
                relatedToType="product" 
                relatedToId={productId} 
                limit={5} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;