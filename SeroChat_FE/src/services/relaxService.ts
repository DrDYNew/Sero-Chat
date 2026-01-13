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

// Admin API methods
export const adminGetRelaxAssets = async (page: number = 1, pageSize: number = 10, search?: string, type?: string): Promise<any> => {
  let url = `/Admin/Relax?page=${page}&pageSize=${pageSize}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (type) url += `&type=${type}`;
  
  const response = await apiClient.get(url);
  return response.data;
};

export const adminGetRelaxAssetById = async (assetId: number): Promise<any> => {
  const response = await apiClient.get(`/Admin/Relax/${assetId}`);
  return response.data;
};

export const adminCreateRelaxAsset = async (data: {
  title: string;
  type?: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  isPremium?: boolean;
}): Promise<any> => {
  const response = await apiClient.post('/Admin/Relax', data);
  return response.data;
};

export const adminUpdateRelaxAsset = async (assetId: number, data: {
  title?: string;
  type?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  isPremium?: boolean;
}): Promise<any> => {
  const response = await apiClient.put(`/Admin/Relax/${assetId}`, data);
  return response.data;
};

export const adminDeleteRelaxAsset = async (assetId: number): Promise<any> => {
  const response = await apiClient.delete(`/Admin/Relax/${assetId}`);
  return response.data;
};

export const adminUploadMedia = async (fileUri: string, type: 'video' | 'audio' = 'video'): Promise<any> => {
  const formData = new FormData();
  const filename = fileUri.split('/').pop() || 'media.mp4';
  const mediaType = type === 'video' ? 'video/mp4' : 'audio/mpeg';

  formData.append('file', {
    uri: fileUri,
    name: filename,
    type: mediaType,
  } as any);
  
  formData.append('type', type);

  const response = await apiClient.post('/Admin/Relax/upload-media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const adminUploadThumbnail = async (imageUri: string): Promise<any> => {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'thumbnail.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const imageType = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('file', {
    uri: imageUri,
    name: filename,
    type: imageType,
  } as any);

  const response = await apiClient.post('/Admin/Relax/upload-thumbnail', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const adminGetStats = async (): Promise<any> => {
  const response = await apiClient.get('/Admin/Relax/stats');
  return response.data;
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
