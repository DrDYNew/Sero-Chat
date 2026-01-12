import axios from 'axios';
import { API_BASE_URL } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DashboardStats {
  totalUsers: number;
  newUsersThisMonth: number;
  userChangePercent: number;
  totalBlogs: number;
  newBlogsThisMonth: number;
  totalDoctors: number;
  newDoctorsThisMonth: number;
  unresolvedCrisis: number;
  totalCrisisThisMonth: number;
  crisisChange: number;
  revenueThisMonth: number;
  revenueChangePercent: number;
  premiumUsers: number;
  premiumChangePercent: number;
}

export interface RecentActivity {
  type: string;
  icon: string;
  text: string;
  time: string;
  color: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const adminService = {
  // Lấy thống kê dashboard
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/Admin/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Get dashboard stats error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy thống kê dashboard',
      };
    }
  },

  // Lấy hoạt động gần đây
  getRecentActivities: async (limit: number = 10): Promise<ApiResponse<RecentActivity[]>> => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/Admin/recent-activities`, {
        params: { limit },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Get recent activities error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy hoạt động gần đây',
      };
    }
  },

  // Lấy danh sách users
  getAllUsers: async (
    page: number = 1, 
    pageSize: number = 20,
    search?: string,
    role?: string,
    status?: string,
    subscription?: string
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getAuthToken();
      const params: any = { page, pageSize };
      if (search) params.search = search;
      if (role) params.role = role;
      if (status) params.status = status;
      if (subscription) params.subscription = subscription;

      const response = await axios.get(`${API_BASE_URL}/ManageUser`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Get users error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy danh sách người dùng',
      };
    }
  },

  // Lấy chi tiết user
  getUserDetail: async (userId: number): Promise<ApiResponse<any>> => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/ManageUser/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Get user detail error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy thông tin người dùng',
      };
    }
  },

  // Tạo user mới
  createUser: async (userData: any): Promise<ApiResponse<any>> => {
    try {
      const token = await getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/ManageUser`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Create user error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tạo người dùng',
      };
    }
  },

  // Cập nhật user
  updateUser: async (userId: number, userData: any): Promise<ApiResponse<any>> => {
    try {
      const token = await getAuthToken();
      const response = await axios.put(`${API_BASE_URL}/ManageUser/${userId}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Update user error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể cập nhật người dùng',
      };
    }
  },

  // Cập nhật trạng thái user
  updateUserStatus: async (userId: number, status: string): Promise<ApiResponse<any>> => {
    try {
      const token = await getAuthToken();
      const response = await axios.put(
        `${API_BASE_URL}/ManageUser/${userId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Update user status error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể cập nhật trạng thái',
      };
    }
  },

  // Xác thực email user
  verifyUserEmail: async (userId: number): Promise<ApiResponse<any>> => {
    try {
      const token = await getAuthToken();
      const response = await axios.put(
        `${API_BASE_URL}/ManageUser/${userId}/verify-email`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Verify user email error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể xác thực email',
      };
    }
  },

  // Xóa user
  deleteUser: async (userId: number): Promise<ApiResponse<any>> => {
    try {
      const token = await getAuthToken();
      const response = await axios.delete(`${API_BASE_URL}/ManageUser/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Delete user error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể xóa người dùng',
      };
    }
  },
};
