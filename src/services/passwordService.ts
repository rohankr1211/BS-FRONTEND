import client from '../api/client';

export const passwordService = {
  forgotPassword: (email: string) =>
    client.post('/api/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; newPassword: string }) =>
    client.post('/api/auth/reset-password', data),

  validateToken: (token: string) =>
    client.get(`/api/auth/validate-reset-token/${token}`),
};
