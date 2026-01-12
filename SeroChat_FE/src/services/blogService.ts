import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV from '../config/env';

const API_BASE_URL = ENV.API_BASE_URL;

export interface BlogCategory {
  blogCatId: number;
  categoryName: string;
  description?: string;
}

export interface BlogListItem {
  blogId: number;
  title: string;
  thumbnailUrl?: string;
  authorName?: string;
  createdAt: string;
  category: {
    blogCatId: number;
    categoryName: string;
  };
}

export interface BlogDetail {
  blogId: number;
  blogCatId: number;
  title: string;
  content: string;
  thumbnailUrl?: string;
  authorName?: string;
  createdAt: string;
  category: {
    blogCatId: number;
    categoryName: string;
  };
}

export interface CreateBlogRequest {
  blogCatId: number;
  title: string;
  content: string;
  thumbnailUrl?: string;
  authorName?: string;
}

export interface UpdateBlogRequest {
  blogCatId?: number;
  title?: string;
  content?: string;
  thumbnailUrl?: string;
  authorName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

const blogService = {
  getAllBlogs: async (
    page: number = 1,
    pageSize: number = 20,
    search?: string,
    categoryId?: number
  ): Promise<ApiResponse<BlogListItem[]>> => {
    const token = await AsyncStorage.getItem('authToken');
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (search) params.append('search', search);
    if (categoryId) params.append('categoryId', categoryId.toString());

    const response = await fetch(`${API_BASE_URL}/Blog?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch blogs');
    }

    return await response.json();
  },

  getBlogById: async (blogId: number): Promise<ApiResponse<BlogDetail>> => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/Blog/${blogId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch blog');
    }

    return await response.json();
  },

  getBlogCategories: async (): Promise<ApiResponse<BlogCategory[]>> => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/Blog/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return await response.json();
  },

  createBlog: async (blogData: CreateBlogRequest): Promise<ApiResponse<any>> => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/Blog`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blogData),
    });

    if (!response.ok) {
      throw new Error('Failed to create blog');
    }

    return await response.json();
  },

  updateBlog: async (blogId: number, blogData: UpdateBlogRequest): Promise<ApiResponse<any>> => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/Blog/${blogId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blogData),
    });

    if (!response.ok) {
      throw new Error('Failed to update blog');
    }

    return await response.json();
  },

  deleteBlog: async (blogId: number): Promise<ApiResponse<any>> => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/Blog/${blogId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete blog');
    }

    return await response.json();
  },
};

export default blogService;
