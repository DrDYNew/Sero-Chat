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
};
