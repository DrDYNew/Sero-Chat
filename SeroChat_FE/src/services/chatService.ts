import api from '../config/api';

export interface ChatLimitData {
  success: boolean;
  dailyLimit: number;
  messagesSentToday: number;
  remaining: number;
  message?: string;
}

export interface SendMessageData {
  message: string;
  conversationId?: number;
}

export interface SendMessageResponse {
  response: string;
  success: boolean;
  error?: string;
  isCrisisDetected: boolean;
  remainingMessages?: number;
}

export interface Conversation {
  convId: number;
  title: string;
  createdAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface Message {
  msgId: number;
  senderType: string;
  content: string;
  isCrisisDetected: boolean;
  sentAt: string;
}

export interface ConversationDetail {
  convId: number;
  title: string;
  createdAt: string;
  messages: Message[];
}

export interface GetConversationsResponse {
  success: boolean;
  message?: string;
  data?: Conversation[];
}

export interface GetConversationDetailResponse {
  success: boolean;
  message?: string;
  data?: ConversationDetail;
}

export interface CreateConversationResponse {
  success: boolean;
  message?: string;
  data?: Conversation;
}

export interface SendMessageToConversationRequest {
  convId: number;
  message: string;
}

class ChatService {
  async getDailyLimit(): Promise<ChatLimitData> {
    try {
      const response = await api.get<ChatLimitData>('/Chat/daily-limit');
      return response.data;
    } catch (error: any) {
      console.error('Get daily limit error:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendMessage(data: SendMessageData): Promise<SendMessageResponse> {
    try {
      const response = await api.post<SendMessageResponse>('/Chat/send', data);
      return response.data;
    } catch (error: any) {
      console.error('Send message error:', error.response?.data || error.message);
      throw error;
    }
  }

  async checkInappropriate(message: string): Promise<boolean> {
    try {
      const response = await api.post<boolean>('/Chat/check-inappropriate', { message });
      return response.data;
    } catch (error: any) {
      console.error('Check inappropriate error:', error.response?.data || error.message);
      return false;
    }
  }

  // ===== CONVERSATION METHODS =====

  async getConversations(): Promise<GetConversationsResponse> {
    try {
      const response = await api.get<GetConversationsResponse>('/Chat/conversations');
      return response.data;
    } catch (error: any) {
      console.error('Get conversations error:', error.response?.data || error.message);
      throw error;
    }
  }

  async createConversation(initialMessage?: string): Promise<CreateConversationResponse> {
    try {
      const response = await api.post<CreateConversationResponse>('/Chat/conversations', {
        initialMessage
      });
      return response.data;
    } catch (error: any) {
      console.error('Create conversation error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getConversationDetail(convId: number): Promise<GetConversationDetailResponse> {
    try {
      const response = await api.get<GetConversationDetailResponse>(`/Chat/conversations/${convId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get conversation detail error:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendMessageToConversation(data: SendMessageToConversationRequest): Promise<SendMessageResponse> {
    try {
      const response = await api.post<SendMessageResponse>('/Chat/conversations/send', data);
      return response.data;
    } catch (error: any) {
      console.error('Send message to conversation error:', error.response?.data || error.message);
      throw error;
    }
  }

  async deleteConversation(convId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/Chat/conversations/${convId}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete conversation error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const chatService = new ChatService();
