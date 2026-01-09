import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.209:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ChatMessageResponse {
  response: string;
  success: boolean;
  error?: string;
  isCrisisDetected?: boolean;
}

export const getGeminiResponse = async (userMessage: string, userId?: number): Promise<{ response: string; isCrisis: boolean }> => {
  try {
    const response = await api.post<ChatMessageResponse>('/chat/send', {
      message: userMessage,
      userId,
    });

    if (response.data.success) {
      return {
        response: response.data.response,
        isCrisis: response.data.isCrisisDetected || false,
      };
    } else {
      throw new Error(response.data.error || 'Lỗi khi gửi tin nhắn');
    }
  } catch (error: any) {
    console.error('Error sending message:', error);
    if (error.response?.data?.error) {
      return { response: error.response.data.error, isCrisis: false };
    }
    return { response: 'Không thể kết nối đến server. Vui lòng thử lại sau. 🙏', isCrisis: false };
  }
};

export const checkInappropriateContent = async (message: string): Promise<boolean> => {
  try {
    const response = await api.post<boolean>('/chat/check-inappropriate', {
      message,
    });
    return response.data;
  } catch (error) {
    console.error('Error checking inappropriate content:', error);
    return false;
  }
};

