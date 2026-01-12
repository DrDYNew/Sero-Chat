import api from './api';

interface CreatePaymentRequest {
  planId: number;
  returnUrl: string;
  cancelUrl: string;
}

interface PaymentData {
  checkoutUrl: string;
  orderCode: string;
  transactionId: number;
}

interface TransactionStatus {
  transactionId: number;
  status: string;
  amount: number;
  completedAt: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const paymentService = {
  createPayment: async (request: CreatePaymentRequest): Promise<ApiResponse<PaymentData>> => {
    try {
      const response = await api.post('/Payment/create', request);
      return response.data;
    } catch (error: any) {
      console.error('Create payment error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Lỗi khi tạo thanh toán' 
      };
    }
  },

  verifyPayment: async (orderCode: string): Promise<ApiResponse<TransactionStatus>> => {
    try {
      const response = await api.get(`/Payment/verify/${orderCode}`);
      return response.data;
    } catch (error: any) {
      console.error('Verify payment error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Lỗi khi kiểm tra thanh toán' 
      };
    }
  },
};

export default paymentService;
