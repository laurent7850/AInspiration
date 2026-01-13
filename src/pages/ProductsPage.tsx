import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import CrmLayout from '../components/crm/CrmLayout';
import ProductList from '../components/crm/ProductList';
import ProductForm from '../components/crm/ProductForm';
import ProductDetail from '../components/crm/ProductDetail';
import { fetchProductById } from '../services/productService';

const ProductsPage: React.FC = () => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const edit = searchParams.get('edit') === 'true';
  
  // Set up the view based on URL parameters
  useEffect(() => {
    const setupView = async () => {
      if (id === 'new') {
        // New product form
        setIsCreatingNew(true);
        setIsEditing(false);
        setSelectedProductId(null);
      } else if (id) {
        // Editing or viewing an existing product
        setLoading(true);
        try {
          // Verify product exists
          await fetchProductById(id);
          setSelectedProductId(id);
          setIsEditing(edit);
          setIsCreatingNew(false);
        } catch (error) {
          console.error('Error fetching product:', error);
          // Navigate back to list if product not found
          navigate('/products');
        } finally {
          setLoading(false);
        }
      } else {
        // List view
        setIsCreatingNew(false);
        setIsEditing(false);
        setSelectedProductId(null);
      }
    };
    
    setupView();
  }, [id, edit, navigate]);

  const handleCreateNew = () => {
    navigate('/products/new');
  };

  const handleEditProduct = (productId: string) => {
    navigate(`/products/${productId}?edit=true`);
  };

  const handleViewProduct = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const handleCloseForm = () => {
    navigate('/products');
  };

  const handleSaved = () => {
    if (isCreatingNew) {
      navigate('/products');
    } else if (isEditing && selectedProductId) {
      navigate(`/products/${selectedProductId}`);
    }
  };

  if (loading) {
    return (
      <PrivateRoute>
        <CrmLayout>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        </CrmLayout>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute>
      <CrmLayout>
        <section className="py-10 bg-gray-50 min-h-screen">
          <Helmet>
            <title>Gestion des produits | AInspiration CRM</title>
            <meta name="description" content="Gérez votre catalogue de produits et services dans le CRM." />
          </Helmet>
          
          <div className="container mx-auto px-4">
            {isCreatingNew ? (
              <ProductForm 
                onClose={handleCloseForm}
                onSaved={handleSaved}
              />
            ) : isEditing && selectedProductId ? (
              <ProductForm
                productId={selectedProductId}
                onClose={handleCloseForm}
                onSaved={handleSaved}
              />
            ) : selectedProductId ? (
              <ProductDetail
                productId={selectedProductId}
                onBack={handleCloseForm}
                onEdit={() => handleEditProduct(selectedProductId)}
              />
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                  Gestion des produits
                </h1>
                
                <ProductList
                  onCreateNew={handleCreateNew}
                  onEditProduct={handleViewProduct}
                />
              </>
            )}
          </div>
        </section>
      </CrmLayout>
    </PrivateRoute>
  );
};

export default ProductsPage;