import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginRequest, RegisterRequest, LoginResponse, ApiResponse } from '../types/auth.types';

const API_BASE_URL = 'http://192.168.1.209:5000/api'; // IP của máy tính trong mạng WiFi

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào mọi request
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

export const authService = {
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data);
      
      // Lưu token vào AsyncStorage
      if (response.data.success && response.data.data?.token) {
        await AsyncStorage.setItem('authToken', response.data.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.data));
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/register', data);
      
      // Lưu token vào AsyncStorage
      if (response.data.success && response.data.data?.token) {
        await AsyncStorage.setItem('authToken', response.data.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.data));
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  },

  getCurrentUser: async (): Promise<LoginResponse | null> => {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  },
};
