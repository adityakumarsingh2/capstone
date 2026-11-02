import { useAuth } from './useAuth';

export const useUserRole = () => {
  const { user } = useAuth();

  return {
    userRole: user?.role || null,
    isLoading: false,
    isSeller: false, // Seller role removed, admin manages products
    isCustomer: user?.role === 'customer',
    isAdmin: user?.role === 'admin',
  };
};
