import api from '../config/api';

export interface MoodLog {
  logId: number;
  userId: number;
  moodScore: number;
  note?: string;
  createdAt: string;
}

export interface CreateMoodLogRequest {
  moodScore: number;
  note?: string;
}

export interface MoodLogResponse {
  success: boolean;
  message?: string;
  data?: MoodLog;
}

export interface MoodLogsResponse {
  success: boolean;
  message?: string;
  data?: MoodLog[];
}

export interface MoodStatsResponse {
  success: boolean;
  data?: {
    totalLogs: number;
    averageScore: number;
    latestMood?: MoodLog;
    streak: number;
  };
}

class MoodService {
  async getMoodLogs(): Promise<MoodLogsResponse> {
    try {
      const response = await api.get<MoodLogsResponse>('/MoodLogs');
      return response.data;
    } catch (error: any) {
      console.error('Get mood logs error:', error.response?.data || error.message);
      throw error;
    }
  }

  async createMoodLog(data: CreateMoodLogRequest): Promise<MoodLogResponse> {
    try {
      const response = await api.post<MoodLogResponse>('/MoodLogs', data);
      return response.data;
    } catch (error: any) {
      console.error('Create mood log error:', error.response?.data || error.message);
      throw error;
    }
  }

  async deleteMoodLog(logId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/MoodLogs/${logId}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete mood log error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getMoodStats(): Promise<MoodStatsResponse> {
    try {
      const response = await api.get<MoodStatsResponse>('/MoodLogs/stats');
      return response.data;
    } catch (error: any) {
      console.error('Get mood stats error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const moodService = new MoodService();
