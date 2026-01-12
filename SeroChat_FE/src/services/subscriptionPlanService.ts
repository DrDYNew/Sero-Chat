import api from './api';

interface SubscriptionPlan {
  planId: number;
  planName: string;
  price: number;
  durationDays: number;
  dailyMessageLimit: number | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const subscriptionPlanService = {
  getAllPlans: async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
    try {
      const response = await api.get('/SubscriptionPlan');
      return response.data;
    } catch (error: any) {
      console.error('Get plans error:', error);
      return { success: false, message: error.response?.data?.message || 'Lỗi khi lấy danh sách gói' };
    }
  },

  getPlanById: async (planId: number): Promise<ApiResponse<SubscriptionPlan>> => {
    try {
      const response = await api.get(`/SubscriptionPlan/${planId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get plan detail error:', error);
      return { success: false, message: error.response?.data?.message || 'Lỗi khi lấy thông tin gói' };
    }
  },

  createPlan: async (planData: {
    planName: string;
    price: number;
    durationDays: number;
    dailyMessageLimit: number | null;
  }): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/SubscriptionPlan', planData);
      return response.data;
    } catch (error: any) {
      console.error('Create plan error:', error);
      return { success: false, message: error.response?.data?.message || 'Lỗi khi tạo gói' };
    }
  },

  updatePlan: async (planId: number, planData: {
    planName?: string;
    price?: number;
    durationDays?: number;
    dailyMessageLimit?: number | null;
  }): Promise<ApiResponse<any>> => {
    try {
      const response = await api.put(`/SubscriptionPlan/${planId}`, planData);
      return response.data;
    } catch (error: any) {
      console.error('Update plan error:', error);
      return { success: false, message: error.response?.data?.message || 'Lỗi khi cập nhật gói' };
    }
  },

  deletePlan: async (planId: number): Promise<ApiResponse<any>> => {
    try {
      const response = await api.delete(`/SubscriptionPlan/${planId}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete plan error:', error);
      return { success: false, message: error.response?.data?.message || 'Lỗi khi xóa gói' };
    }
  },
};
