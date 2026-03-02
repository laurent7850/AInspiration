import { api } from '../utils/api';
import { Product } from '../utils/types';
import { recordActivity } from './activityService';

export const fetchProducts = async (activeOnly: boolean = true): Promise<Product[]> => {
  return api.get<Product[]>('/products', { active_only: activeOnly || undefined });
};

export const fetchProductById = async (id: string): Promise<Product> => {
  return api.get<Product>(`/products/${id}`);
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at'>, userId: string): Promise<Product> => {
  const data = await api.post<Product>('/products', product);

  try {
    await recordActivity({
      user_id: userId,
      activity_type: 'product_created',
      description: `Produit créé: ${product.name}`,
      related_to_type: 'product',
      related_to: data.id
    });
  } catch (activityError) {
    console.warn('Activity logging failed (non-blocking):', activityError);
  }

  return data;
};

export const updateProduct = async (id: string, product: Partial<Omit<Product, 'id' | 'created_at'>>, userId: string): Promise<Product> => {
  const { user_id, ...updateData } = product as Partial<Product>;
  const data = await api.put<Product>(`/products/${id}`, updateData);

  try {
    await recordActivity({
      user_id: userId,
      activity_type: 'product_updated',
      description: `Produit mis à jour: ${data.name}`,
      related_to_type: 'product',
      related_to: id
    });
  } catch (activityError) {
    console.warn('Activity logging failed (non-blocking):', activityError);
  }

  return data;
};

export const deleteProduct = async (id: string, userId: string): Promise<void> => {
  let productName: string | undefined;
  try {
    const productData = await fetchProductById(id);
    productName = productData.name;
  } catch { /* ignore */ }

  await api.delete(`/products/${id}`);

  if (productName) {
    try {
      await recordActivity({
        user_id: userId,
        activity_type: 'product_deleted',
        description: `Produit supprimé: ${productName}`,
        related_to_type: 'product',
        related_to: id
      });
    } catch (activityError) {
      console.warn('Activity logging failed (non-blocking):', activityError);
    }
  }
};

export const getProductStats = async () => {
  return api.get<{
    activeCount: number;
    totalCount: number;
    byCategory: Record<string, { count: number; totalValue: number }>;
  }>('/products/stats');
};
