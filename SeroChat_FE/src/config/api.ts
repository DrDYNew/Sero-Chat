import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV from './env';

const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
      
      if (error.response.status === 401) {
        // Unauthorized - could trigger logout here
        console.log('Unauthorized access - token may be invalid');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server:', error.message);
    } else {
      // Error in request setup
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
