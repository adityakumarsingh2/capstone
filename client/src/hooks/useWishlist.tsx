import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface WishlistItem {
  _id: string;
  userId: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[] | null;
    brand: string | null;
    sizes: string[];
    colors: string[] | null;
    isActive: boolean;
    stockQuantity: number;
  };
  createdAt: string;
}

export const useWishlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const wishlistQuery = useQuery({
    queryKey: ['wishlist', user?._id],
    queryFn: async () => {
      const { data } = await api.get('/wishlist');
      return data.items as WishlistItem[];
    },
    enabled: !!user,
  });

  const addToWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Please sign in to add items to wishlist');
      const { data } = await api.post('/wishlist', { productId });
      return data.items;
    },
    onSuccess: (items) => {
      queryClient.setQueryData(['wishlist', user?._id], items);
      toast.success('Added to wishlist');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  const removeFromWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Please sign in');
      const { data } = await api.delete(`/wishlist/${productId}`);
      return data.items;
    },
    onSuccess: (items) => {
      queryClient.setQueryData(['wishlist', user?._id], items);
      toast.success('Removed from wishlist');
    },
  });

  const isInWishlist = (productId: string) => {
    return wishlistQuery.data?.some(item => item.productId?._id === productId) || false;
  };

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist.mutateAsync(productId);
    } else {
      await addToWishlist.mutateAsync(productId);
    }
  };

  return {
    items: wishlistQuery.data || [],
    isLoading: wishlistQuery.isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    wishlistCount: wishlistQuery.data?.length || 0,
  };
};
