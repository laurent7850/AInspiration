import { supabase } from '../utils/supabase';
import { Product } from '../utils/types';
import { recordActivity } from './activityService';

export const fetchProducts = async (activeOnly: boolean = true): Promise<Product[]> => {
  let query = supabase
    .from('products')
    .select('*')
    .order('name');
  
  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data;
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }

  return data;
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at'>, userId: string): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  // Log the activity
  await recordActivity({
    user_id: userId,
    activity_type: 'product_created',
    description: `Produit créé: ${product.name}`,
    related_to_type: 'product',
    related_to: data.id
  });

  return data;
};

export const updateProduct = async (id: string, product: Partial<Omit<Product, 'id' | 'created_at'>>, userId: string): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  // Log the activity
  await recordActivity({
    user_id: userId,
    activity_type: 'product_updated',
    description: `Produit mis à jour: ${data.name}`,
    related_to_type: 'product',
    related_to: id
  });

  return data;
};

export const deleteProduct = async (id: string, userId: string): Promise<void> => {
  // Get the product data before deleting for the activity log
  const { data: productData } = await supabase
    .from('products')
    .select('name')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }

  // Log the activity
  if (productData) {
    await recordActivity({
      user_id: userId,
      activity_type: 'product_deleted',
      description: `Produit supprimé: ${productData.name}`,
      related_to_type: 'product',
      related_to: id
    });
  }
};

// Get product statistics
export const getProductStats = async () => {
  // Total count of active products
  const { count: activeCount, error: activeError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  if (activeError) {
    console.error('Error getting active product count:', activeError);
    throw activeError;
  }

  // Total count of all products
  const { count: totalCount, error: totalError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('Error getting total product count:', totalError);
    throw totalError;
  }

  // Products by category
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('category, price');

  if (productsError) {
    console.error('Error getting products data:', productsError);
    throw productsError;
  }

  // Group products by category
  const categoryCounts = productsData.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = {
        count: 0,
        totalValue: 0
      };
    }
    acc[category].count++;
    acc[category].totalValue += product.price || 0;
    return acc;
  }, {} as Record<string, { count: number; totalValue: number }>);

  return {
    activeCount,
    totalCount,
    byCategory: categoryCounts
  };
};