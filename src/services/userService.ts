import client from '../api/client';
import type { User, Role } from '../types';

// ── Types ────────────────────────────────────────────────────────

export interface CreateUserPayload {
  name: string;
  email: string;
  phone?: string;
  role: Role;
  password: string;
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  role?: Role;
}

export interface UserListResponse {
  content: User[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// All IAM responses: { success, message, data }
type IamResponse<T> = { success: boolean; message: string; data: T };

// ── Service ──────────────────────────────────────────────────────

export const userService = {
  /**
   * GET /admin/users?page=0&size=10&sortBy=createdAt&sortDir=desc
   */
  getAllUsers: async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc'): Promise<UserListResponse> => {
    const res = await client.get<any>(
      `/admin/users?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
    const data = res.data?.data || res.data;
    
    // Handle both Spring Page object and direct Array
    if (Array.isArray(data)) {
      return {
        content: data,
        totalElements: data.length,
        totalPages: 1,
        page: 0,
        size: data.length
      };
    }
    return data;
  },

  /**
   * GET /admin/pending-users
   */
  getPendingUsers: async (): Promise<User[]> => {
    const res = await client.get<any>('/admin/pending-users');
    return res.data?.data || res.data;
  },

  /**
   * POST /admin/approve-user/{userId}
   */
  approveUser: async (userId: string): Promise<User> => {
    const res = await client.post<any>(`/admin/approve-user/${userId}`);
    return res.data?.data || res.data;
  },

  /**
   * POST /admin/reject-user/{userId}
   */
  rejectUser: async (userId: string): Promise<void> => {
    await client.post(`/admin/reject-user/${userId}`);
  },

  /**
   * GET /admin/users/{userId}
   */
  getUserByIdAdmin: async (userId: string): Promise<User> => {
    const res = await client.get<any>(`/admin/users/${userId}`);
    return res.data?.data || res.data;
  },

  /**
   * PUT /admin/users/{userId}
   */
  updateUser: async (userId: string, payload: UpdateUserPayload): Promise<User> => {
    const res = await client.put<IamResponse<User>>(`/admin/users/${userId}`, payload);
    return res.data.data;
  },

  /**
   * DELETE /admin/users/{userId}
   */
  deleteUser: async (userId: string): Promise<void> => {
    await client.delete(`/admin/users/${userId}`);
  },

  /**
   * GET /admin/users/role/{role}
   */
  getUsersByRole: async (role: string): Promise<User[]> => {
    const res = await client.get<any>(`/admin/users/role/${role}`);
    return res.data?.data || res.data;
  },

  /**
   * GET /users/profile
   */
  getProfile: async (): Promise<User> => {
    const res = await client.get<any>('/users/profile');
    return res.data?.data || res.data;
  },

  /**
   * PUT /users/profile
   */
  updateProfile: async (payload: { name?: string; phone?: string }): Promise<User> => {
    const res = await client.put<IamResponse<User>>('/users/profile', payload);
    return res.data.data;
  },

  /**
   * GET /users/check-role/{requiredRole}
   */
  checkRole: async (requiredRole: string): Promise<boolean> => {
    const res = await client.get<any>(`/users/check-role/${requiredRole}`);
    return res.data?.data || res.data;
  },

  /**
   * GET /users/{userId}
   */
  getUserById: async (userId: string): Promise<User> => {
    const res = await client.get<any>(`/users/${userId}`);
    return res.data?.data || res.data;
  },

  /**
   * GET /users/by-email?email={email}
   */
  getUserByEmail: async (email: string): Promise<User> => {
    const res = await client.get<any>(`/users/by-email?email=${email}`);
    return res.data?.data || res.data;
  },

  /**
   * GET /users/all
   */
  getAllUsersList: async (): Promise<User[]> => {
    const res = await client.get<IamResponse<User[]>>('/users/all');
    return res.data.data;
  }
};
