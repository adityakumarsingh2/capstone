import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';

export interface User {
  _id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: 'customer' | 'admin';
  isBlocked?: boolean;
  bodyMeasurements?: { weight?: number; height?: number };
  stylePreferences?: string[];
  addresses?: Address[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  _id: string;
  label?: string;
  fullName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem('fitkart_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      if (data.success) {
        setUser(data.user);
      } else {
        localStorage.removeItem('fitkart_token');
        setUser(null);
      }
    } catch {
      localStorage.removeItem('fitkart_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUser(); }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data } = await api.post('/auth/register', { email, password, fullName });
      if (data.success) {
        localStorage.setItem('fitkart_token', data.token);
        setUser(data.user);
        return { error: null };
      }
      return { error: { message: data.message } };
    } catch (err: any) {
      return { error: { message: err.response?.data?.message || 'Registration failed' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('fitkart_token', data.token);
        setUser(data.user);
        return { error: null };
      }
      return { error: { message: data.message } };
    } catch (err: any) {
      return { error: { message: err.response?.data?.message || 'Invalid login credentials' } };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('fitkart_token');
    setUser(null);
  };

  const refreshUser = async () => { await loadUser(); };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
