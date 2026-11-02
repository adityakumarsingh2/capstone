import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Product {
  _id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  brand: string | null;
  sizes: string[];
  colors: string[] | null;
  images: string[] | null;
  stockQuantity: number | null;
  isActive: boolean | null;
  averageRating: number;
  reviewCount: number;
  salesCount: number;
  sellerId?: string;
  createdAt: string;
  updatedAt: string;
}

export const useProducts = (category?: string) => {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (category && category !== 'All') params.category = category.toLowerCase();
      const { data } = await api.get('/products', { params });
      return data.products as Product[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data.product as Product | null;
    },
    enabled: !!id,
  });
};
