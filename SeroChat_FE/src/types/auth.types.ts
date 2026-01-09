export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber?: string;
}

export interface LoginResponse {
  userId: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: string;
  subscriptionStatus: string;
  token: string;
  premiumExpiry?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
