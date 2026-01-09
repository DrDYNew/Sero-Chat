import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.209:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Blog {
  blogId: number;
  title: string;
  summary: string;
  thumbnailUrl: string;
  createdAt: string;
  categoryName: string;
  categoryId: number;
  readTime: string;
}

export interface BlogCategory {
  categoryId: number;
  categoryName: string;
  description: string;
}

export interface BlogDetail {
  blogId: number;
  title: string;
  content: string;
  thumbnailUrl: string;
  createdAt: string;
  authorName: string;
  categoryName: string;
  categoryId: number;
  readTime: string;
}

export const exploreService = {
  getAllBlogs: async (categoryId?: number): Promise<Blog[]> => {
    try {
      const url = categoryId 
        ? `/Home/blogs/all?categoryId=${categoryId}`
        : '/Home/blogs/all';
      const response = await api.get<Blog[]>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  },

  getBlogCategories: async (): Promise<BlogCategory[]> => {
    try {
      const response = await api.get<BlogCategory[]>('/Home/blogs/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getBlogById: async (blogId: number): Promise<BlogDetail> => {
    try {
      const response = await api.get<BlogDetail>(`/Home/blogs/${blogId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching blog detail:', error);
      throw error;
    }
  },
};
