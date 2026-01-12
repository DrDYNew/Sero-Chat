import apiClient from '../config/api';

export interface RelaxAsset {
  assetId: number;
  title: string;
  type: 'MUSIC' | 'BREATHING' | 'MEDITATION';
  mediaUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  createdAt?: string;
}

interface GetRelaxAssetsResponse {
  success: boolean;
  data: RelaxAsset[];
  count: number;
}

interface GetRelaxAssetResponse {
  success: boolean;
  data: RelaxAsset;
}

// Get all relax assets (optional filter by type)
export const getRelaxAssets = async (type?: 'MUSIC' | 'BREATHING' | 'MEDITATION'): Promise<GetRelaxAssetsResponse> => {
  const params = type ? { type } : {};
  const response = await apiClient.get('/Relax/assets', { params });
  return response.data;
};

// Get single relax asset by ID
export const getRelaxAssetById = async (assetId: number): Promise<GetRelaxAssetResponse> => {
  const response = await apiClient.get(`/Relax/assets/${assetId}`);
  return response.data;
};

// Check if user can access premium content
export const canAccessPremiumContent = (userSubscriptionStatus?: string): boolean => {
  return userSubscriptionStatus === 'PREMIUM';
};

// Get asset type label in Vietnamese
export const getAssetTypeLabel = (type: string): string => {
  switch (type) {
    case 'MUSIC':
      return 'Âm nhạc';
    case 'BREATHING':
      return 'Bài tập thở';
    case 'MEDITATION':
      return 'Thiền';
    default:
      return 'Khác';
  }
};

// Get asset type icon
export const getAssetTypeIcon = (type: string): string => {
  switch (type) {
    case 'MUSIC':
      return 'music';
    case 'BREATHING':
      return 'lungs';
    case 'MEDITATION':
      return 'yoga';
    default:
      return 'spa';
  }
};
