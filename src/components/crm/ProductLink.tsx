import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Loader } from 'lucide-react';
import { fetchProductById } from '../../services/productService';
import { Product } from '../../utils/types';

interface ProductLinkProps {
  productId: string;
  showIcon?: boolean;
  className?: string;
}

const ProductLink: React.FC<ProductLinkProps> = ({ 
  productId, 
  showIcon = true, 
  className = 'text-indigo-600 hover:text-indigo-800 hover:underline' 
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProductById(productId);
        setProduct(data);
      } catch (err) {
        console.error('Failed to load product:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [productId]);

  if (loading) {
    return <span className="inline-flex items-center"><Loader className="w-4 h-4 animate-spin mr-1" /> Chargement...</span>;
  }

  if (error || !product) {
    return <span>Produit indisponible</span>;
  }

  return (
    <Link to={`/products/${productId}`} className={className}>
      {showIcon && <Package className="w-4 h-4 inline-block mr-1" />}
      {product.name}
    </Link>
  );
};

export default ProductLink;