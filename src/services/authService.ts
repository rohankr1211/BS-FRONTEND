import client from '../api/client';

type IamResponse<T> = { success: boolean; message: string; data: T };

export const authService = {
  /**
   * POST /api/auth/login
   */
  login: (credentials: { email: string; password: string }) =>
    client.post('/api/auth/login', credentials),

  /**
   * POST /api/auth/signup
   */
  signup: (data: any) =>
    client.post<IamResponse<any>>('/api/auth/signup', data),

  /**
   * POST /api/auth/logout
   */
  logout: () =>
    client.post('/api/auth/logout'),

  /**
   * POST /api/auth/forgot-password
   */
  forgotPassword: (email: string) =>
    client.post('/api/auth/forgot-password', { email }),

  /**
   * POST /api/auth/reset-password
   */
  resetPassword: (data: { token: string; newPassword: string }) =>
    client.post('/api/auth/reset-password', data),

  /**
   * GET /api/auth/validate-reset-token/{token}
   */
  validateToken: (token: string) =>
    client.get(`/api/auth/validate-reset-token/${token}`),
};
