import apiClient from './api';

export interface DailyAffirmation {
  affId: number;
  content: string;
  isDeleted?: boolean;
  createdAt?: string;
}

export interface MoodLog {
  logId: number;
  userId: number;
  moodScore?: number;
  note?: string;
  createdAt?: string;
}

export interface RelaxAsset {
  assetId: number;
  title: string;
  type?: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  isPremium?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
}

export interface ConversationStats {
  totalConversations: number;
  todayConversations: number;
  streak: number;
}

export interface Blog {
  blogId: number;
  title: string;
  summary?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  categoryName?: string;
  readTime?: string;
}

export interface Activity {
  id: number;
  type: string;
  title: string;
  time: string;
  icon: string;
}

// Get daily affirmation
export const getDailyAffirmation = async (): Promise<DailyAffirmation> => {
  const response = await apiClient.get('/affirmations/today');
  return response.data;
};

// Get user mood logs
export const getUserMoodLogs = async (userId: number, limit: number = 7): Promise<MoodLog[]> => {
  const response = await apiClient.get(`/moods/user/${userId}?limit=${limit}`);
  return response.data;
};

// Get latest mood
export const getLatestMood = async (userId: number): Promise<MoodLog | null> => {
  const response = await apiClient.get(`/moods/user/${userId}/latest`);
  return response.data;
};

// Create mood log
export const createMoodLog = async (userId: number, moodScore: number, note?: string): Promise<MoodLog> => {
  const response = await apiClient.post('/moods', {
    userId,
    moodScore,
    note,
  });
  return response.data;
};

// Get relax assets
export const getRelaxAssets = async (type?: string): Promise<RelaxAsset[]> => {
  const url = type ? `/relax/assets?type=${type}` : '/relax/assets';
  const response = await apiClient.get(url);
  return response.data;
};

// Get conversation stats
export const getConversationStats = async (userId: number): Promise<ConversationStats> => {
  const response = await apiClient.get(`/conversations/stats/${userId}`);
  return response.data;
};

// Get user conversations
export const getUserConversations = async (userId: number): Promise<any[]> => {
  const response = await apiClient.get(`/home/conversations/user/${userId}`);
  return response.data;
};

// Get featured blogs
export const getFeaturedBlogs = async (limit: number = 5): Promise<Blog[]> => {
  const response = await apiClient.get(`/home/blogs/featured?limit=${limit}`);
  return response.data;
};

// Get recent activities
export const getRecentActivities = async (userId: number, limit: number = 5): Promise<Activity[]> => {
  const response = await apiClient.get(`/home/activities/recent/${userId}?limit=${limit}`);
  return response.data;
};
