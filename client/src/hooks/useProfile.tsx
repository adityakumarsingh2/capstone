import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Profile {
  _id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  stylePreferences: string[] | null;
  bodyMeasurements: BodyMeasurements | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface BodyMeasurements {
  weight?: number;
  height?: number;
}

interface ProfileUpdate {
  fullName?: string;
  avatarUrl?: string;
  stylePreferences?: string[];
  bodyMeasurements?: BodyMeasurements;
}

export const useProfile = () => {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?._id],
    queryFn: async () => {
      const { data } = await api.get('/profile');
      return data.profile as Profile;
    },
    enabled: !!user?._id,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      const { data } = await api.put('/profile', updates);
      return data.profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      refreshUser();
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to update profile: ' + (error.response?.data?.message || error.message));
    },
  });

  return {
    profile,
    isLoading,
    updateProfile,
  };
};
