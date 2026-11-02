import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Review {
  _id: string;
  userId: { _id: string; fullName?: string; avatarUrl?: string } | string;
  productId: string;
  orderId: string;
  rating: number;
  title: string | null;
  content: string | null;
  helpfulCount: number;
  helpfulVotes?: string[];
  verifiedPurchase: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useReviews = (productId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      if (!productId) return { reviews: [], distribution: {} };
      const { data } = await api.get(`/reviews/product/${productId}`);
      return { reviews: data.reviews as Review[], distribution: data.distribution as Record<number, number> };
    },
    enabled: !!productId,
  });

  const addReview = useMutation({
    mutationFn: async ({ productId, orderId, rating, title, content }: {
      productId: string; orderId: string; rating: number; title?: string; content?: string;
    }) => {
      if (!user) throw new Error('Please sign in to write a review');
      const { data } = await api.post('/reviews', { productId, orderId, rating, title, content });
      return data.review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      toast.success('Review submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  const updateReview = useMutation({
    mutationFn: async ({ reviewId, rating, title, content }: {
      reviewId: string; rating: number; title?: string; content?: string;
    }) => {
      const { data } = await api.put(`/reviews/${reviewId}`, { rating, title, content });
      return data.review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Review updated');
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      await api.delete(`/reviews/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Review deleted');
    },
  });

  const markHelpful = useMutation({
    mutationFn: async (reviewId: string) => {
      const { data } = await api.post(`/reviews/${reviewId}/helpful`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });

  const reviews = reviewsQuery.data?.reviews || [];
  const distribution = reviewsQuery.data?.distribution || {};
  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const userReview = reviews.find(r => {
    const uid = typeof r.userId === 'object' ? r.userId._id : r.userId;
    return uid === user?._id;
  });

  return {
    reviews,
    distribution,
    isLoading: reviewsQuery.isLoading,
    addReview,
    updateReview,
    deleteReview,
    markHelpful,
    averageRating,
    reviewCount: reviews.length,
    userReview,
  };
};
