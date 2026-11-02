import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from './useAuth';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  color: string | null;
  quantity: number;
  price: number;
}

export interface TrackingEntry {
  status: string;
  message: string;
  updatedBy?: { fullName?: string; email?: string };
  updatedAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: any;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: Record<string, any> | null;
  trackingHistory: TrackingEntry[];
  createdAt: string;
  updatedAt: string;
}

export const useOrders = () => {
  const { user } = useAuth();

  const ordersQuery = useQuery({
    queryKey: ['orders', user?._id],
    queryFn: async () => {
      const { data } = await api.get('/orders');
      return data.orders as Order[];
    },
    enabled: !!user,
  });

  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    error: ordersQuery.error,
  };
};

export const useOrder = (id: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data.order as Order;
    },
    enabled: !!user && !!id,
  });
};
