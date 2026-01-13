import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV from '../config/env';

const API_BASE_URL = ENV.API_BASE_URL;

export interface Specialty {
  specialtyId: number;
  specialtyName: string;
  description?: string;
  doctorCount: number;
}

export interface Doctor {
  doctorId: number;
  name: string;
  specialtyId: number;
  specialtyName: string;
  experienceYears?: number;
  phone?: string;
  zaloUrl?: string;
  address?: string;
  bioDetail?: string;
  imageUrl?: string;
  certificateCount: number;
}

export interface DoctorDetail extends Doctor {
  specialtyDescription?: string;
  certificates: Certificate[];
}

export interface Certificate {
  certId: number;
  certificateName?: string;
  imageUrl: string;
  uploadedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const doctorService = {
  getAllDoctors: async (specialtyId?: number): Promise<ApiResponse<Doctor[]>> => {
    const token = await AsyncStorage.getItem('authToken');
    const url = specialtyId 
      ? `${API_BASE_URL}/Doctor?specialtyId=${specialtyId}`
      : `${API_BASE_URL}/Doctor`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch doctors');
    }

    return await response.json();
  },

  getDoctorById: async (doctorId: number): Promise<ApiResponse<DoctorDetail>> => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/Doctor/${doctorId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch doctor detail');
    }

    return await response.json();
  },

  getSpecialties: async (): Promise<ApiResponse<Specialty[]>> => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/Doctor/specialties`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch specialties');
    }

    return await response.json();
  },

  // ===== ADMIN ENDPOINTS =====

  // Lấy danh sách bác sĩ (Admin)
  adminGetDoctors: async (page: number = 1, pageSize: number = 10, search?: string): Promise<any> => {
    const token = await AsyncStorage.getItem('authToken');
    let url = `${API_BASE_URL}/Admin/Doctors?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${search}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch doctors');
    }

    return await response.json();
  },

  // Lấy chi tiết bác sĩ (Admin)
  adminGetDoctorById: async (doctorId: number): Promise<any> => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/Admin/Doctors/${doctorId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch doctor');
    }

    return await response.json();
  },

  // Tạo bác sĩ mới (Admin)
  adminCreateDoctor: async (data: {
    specialtyId: number;
    name: string;
    experienceYears?: number;
    phone?: string;
    zaloUrl?: string;
    address?: string;
    bioDetail?: string;
    imageUrl?: string;
  }): Promise<any> => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/Admin/Doctors`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create doctor');
    }

    return await response.json();
  },

  // Cập nhật bác sĩ (Admin)
  adminUpdateDoctor: async (doctorId: number, data: {
    specialtyId?: number;
    name?: string;
    experienceYears?: number;
    phone?: string;
    zaloUrl?: string;
    address?: string;
    bioDetail?: string;
    imageUrl?: string;
    isActive?: boolean;
  }): Promise<any> => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/Admin/Doctors/${doctorId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update doctor');
    }

    return await response.json();
  },

  // Xóa bác sĩ (Admin)
  adminDeleteDoctor: async (doctorId: number): Promise<any> => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/Admin/Doctors/${doctorId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete doctor');
    }

    return await response.json();
  },

  // Toggle trạng thái bác sĩ (Admin)
  adminToggleActive: async (doctorId: number): Promise<any> => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/Admin/Doctors/${doctorId}/toggle-active`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to toggle doctor status');
    }

    return await response.json();
  },

  // Lấy danh sách chuyên khoa (Admin)
  adminGetSpecialties: async (): Promise<any> => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/Admin/Doctors/specialties`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Specialties error:', response.status, errorText);
      throw new Error(`Failed to fetch specialties: ${response.status}`);
    }

    return await response.json();
  },

  // Thống kê bác sĩ (Admin)
  adminGetStats: async (): Promise<any> => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/Admin/Doctors/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch doctor stats');
    }

    return await response.json();
  },

  // Upload avatar cho bác sĩ (Admin)
  adminUploadAvatar: async (doctorId: number, imageUri: string): Promise<any> => {
    const token = await AsyncStorage.getItem('authToken');
    
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);

    const response = await fetch(`${API_BASE_URL}/Admin/Doctors/${doctorId}/upload-avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }

    return await response.json();
  },

  // Upload chứng chỉ cho bác sĩ (Admin)
  adminUploadCertificate: async (doctorId: number, certificateName: string, imageUri: string): Promise<any> => {
    const token = await AsyncStorage.getItem('authToken');
    
    const formData = new FormData();
    formData.append('certificateName', certificateName);
    
    const filename = imageUri.split('/').pop() || 'certificate.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);

    const response = await fetch(`${API_BASE_URL}/Admin/Doctors/${doctorId}/upload-certificate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload certificate');
    }

    return await response.json();
  },

  // Xóa chứng chỉ (Admin)
  adminDeleteCertificate: async (certId: number): Promise<any> => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/Admin/Doctors/certificates/${certId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete certificate');
    }

    return await response.json();
  },
};

export default doctorService;
