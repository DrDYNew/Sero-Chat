import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.209:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface UserStats {
  conversations: number;
  savedBlogs: number;
  moodLogs: number;
  affirmations: number;
}

export const profileService = {
  // Lấy thống kê của user
  getUserStats: async (userId: number): Promise<UserStats> => {
    try {
      const response = await api.get(`/profile/stats/${userId}`);
      return response.data.data;
    } catch (error: any) {
      console.log('Error loading user stats:', error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy danh sách conversations của user
  getConversations: async (userId: number) => {
    try {
      const response = await api.get(`/conversations/user/${userId}`);
      return response.data.data || [];
    } catch (error: any) {
      console.log('Error loading conversations:', error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy saved blogs của user
  getSavedBlogs: async (userId: number) => {
    try {
      const response = await api.get(`/blogs/saved/${userId}`);
      return response.data.data || [];
    } catch (error: any) {
      console.log('Error loading saved blogs:', error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy mood logs của user
  getMoodLogs: async (userId: number) => {
    try {
      const response = await api.get(`/mood-logs/user/${userId}`);
      return response.data.data || [];
    } catch (error: any) {
      console.log('Error loading mood logs:', error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy thông tin profile
  getProfile: async (userId: number) => {
    try {
      const response = await api.get(`/profile/${userId}`);
      return response.data;
    } catch (error: any) {
      console.log('Error loading profile:', error.response?.data || error.message);
      throw error;
    }
  },

  // Cập nhật profile
  updateProfile: async (userId: number, data: {
    fullName?: string;
    phoneNumber?: string;
    gender?: string;
    dateOfBirth?: string;
    avatarUrl?: string;
  }) => {
    try {
      const response = await api.put(`/profile/${userId}`, data);
      return response.data;
    } catch (error: any) {
      console.log('Error updating profile:', error.response?.data || error.message);
      throw error;
    }
  },

  // Đổi mật khẩu
  changePassword: async (userId: number, oldPassword: string, newPassword: string) => {
    try {
      const response = await api.post(`/profile/${userId}/change-password`, {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error: any) {
      console.log('Error changing password:', error.response?.data || error.message);
      throw error;
    }
  },

  // Upload avatar
  uploadAvatar: async (userId: number, imageUri: string) => {
    try {
      // Tạo FormData
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      // Gửi request với multipart/form-data
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(
        `${API_BASE_URL}/profile/${userId}/upload-avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.log('Error uploading avatar:', error.response?.data || error.message);
      throw error;
    }
  },
};
