import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useState } from 'react';

export interface CartItem {
  _id: string;
  userId: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[] | null;
    brand: string | null;
    isActive: boolean;
    stockQuantity: number;
  };
  size: string;
  color: string | null;
  quantity: number;
  createdAt: string;
}

export const useCart = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const cartQuery = useQuery({
    queryKey: ['cart', user?._id],
    queryFn: async () => {
      const { data } = await api.get('/cart');
      return data.items as CartItem[];
    },
    enabled: !!user,
  });

  const addToCart = useMutation({
    mutationFn: async ({ productId, size, color, quantity = 1 }: {
      productId: string; size: string; color?: string; quantity?: number;
    }) => {
      if (!user) throw new Error('Please sign in to add items to cart');
      const { data } = await api.post('/cart', { productId, size, color, quantity });
      return data.items;
    },
    onSuccess: (items) => {
      queryClient.setQueryData(['cart', user?._id], items);
      toast.success('Added to cart!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      return data.items;
    },
    onSuccess: (items) => {
      queryClient.setQueryData(['cart', user?._id], items);
    },
  });

  const removeFromCart = useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await api.delete(`/cart/${itemId}`);
      return data.items;
    },
    onSuccess: (items) => {
      queryClient.setQueryData(['cart', user?._id], items);
      toast.success('Removed from cart');
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/cart/clear');
    },
    onSuccess: () => {
      queryClient.setQueryData(['cart', user?._id], []);
    },
  });

  const cartTotal = cartQuery.data?.reduce((total, item) => {
    const price = item.productId?.price || 0;
    return total + (price * item.quantity);
  }, 0) || 0;

  const cartCount = cartQuery.data?.reduce((count, item) => count + item.quantity, 0) || 0;

  return {
    items: cartQuery.data || [],
    isLoading: cartQuery.isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart: clearCartMutation,
    cartTotal,
    cartCount,
    isCheckingOut,
    setIsCheckingOut,
  };
};
