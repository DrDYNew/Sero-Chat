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

export interface Notification {
  notificationId: number;
  userId: number;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  // Lấy danh sách notifications
  getUserNotifications: async (userId: number, isRead?: boolean) => {
    try {
      const params = isRead !== undefined ? { isRead } : {};
      const response = await api.get(`/notifications/user/${userId}`, { params });
      return response.data;
    } catch (error: any) {
      console.log('Error loading notifications:', error.response?.data || error.message);
      throw error;
    }
  },

  // Đếm số notifications chưa đọc
  getUnreadCount: async (userId: number) => {
    try {
      const response = await api.get(`/notifications/user/${userId}/unread-count`);
      return response.data;
    } catch (error: any) {
      console.log('Error getting unread count:', error.response?.data || error.message);
      throw error;
    }
  },

  // Đánh dấu một notification là đã đọc
  markAsRead: async (notificationId: number) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/mark-read`);
      return response.data;
    } catch (error: any) {
      console.log('Error marking as read:', error.response?.data || error.message);
      throw error;
    }
  },

  // Đánh dấu tất cả là đã đọc
  markAllAsRead: async (userId: number) => {
    try {
      const response = await api.put(`/notifications/user/${userId}/mark-all-read`);
      return response.data;
    } catch (error: any) {
      console.log('Error marking all as read:', error.response?.data || error.message);
      throw error;
    }
  },

  // Tạo notification mới
  createNotification: async (userId: number, type: string, title: string, message: string) => {
    try {
      const response = await api.post('/notifications', {
        userId,
        type,
        title,
        message,
      });
      return response.data;
    } catch (error: any) {
      console.log('Error creating notification:', error.response?.data || error.message);
      throw error;
    }
  },

  // Xóa notification
  deleteNotification: async (notificationId: number) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error: any) {
      console.log('Error deleting notification:', error.response?.data || error.message);
      throw error;
    }
  },

  // Xóa tất cả notifications
  deleteAllNotifications: async (userId: number) => {
    try {
      const response = await api.delete(`/notifications/user/${userId}`);
      return response.data;
    } catch (error: any) {
      console.log('Error deleting all notifications:', error.response?.data || error.message);
      throw error;
    }
  },
};
