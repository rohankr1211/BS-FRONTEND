import client from '../api/client';

export const authService = {
  // Authentication
  login: (credentials) =>
    client.post('/auth/login', credentials).then(r => r.data?.data || r.data),

  logout: () =>
    client.post('/auth/logout'),

  register: (userData) =>
    client.post('/auth/register', userData).then(r => r.data?.data || r.data),

  // Token Management
  refreshToken: () =>
    client.post('/auth/refresh-token').then(r => r.data?.data || r.data),

  // Password Reset
  requestPasswordReset: (email) =>
    client.post('/auth/request-password-reset', { email }).then(r => r.data?.data || r.data),

  resetPassword: (token, newPassword) =>
    client.post('/auth/reset-password', { token, newPassword }).then(r => r.data?.data || r.data),

  // Email Verification
  verifyEmail: (token) =>
    client.post('/auth/verify-email', { token }).then(r => r.data?.data || r.data),

  resendVerification: (email) =>
    client.post('/auth/resend-verification', { email }).then(r => r.data?.data || r.data),

  // User Profile
  getProfile: () =>
    client.get('/auth/profile').then(r => r.data?.data || r.data),

  updateProfile: (profileData) =>
    client.put('/auth/profile', profileData).then(r => r.data?.data || r.data),

  // Change Password
  changePassword: (passwordData) =>
    client.post('/auth/change-password', passwordData).then(r => r.data?.data || r.data),

  // Two-Factor Authentication
  enable2FA: () =>
    client.post('/auth/enable-2fa').then(r => r.data?.data || r.data),

  disable2FA: () =>
    client.post('/auth/disable-2fa').then(r => r.data?.data || r.data),

  verify2FA: (code) =>
    client.post('/auth/verify-2fa', { code }).then(r => r.data?.data || r.data),

  // Session Management
  getSessions: () =>
    client.get('/auth/sessions').then(r => r.data?.data || r.data),

  revokeSession: (sessionId) =>
    client.delete(`/auth/sessions/${sessionId}`).then(r => r.data?.data || r.data),

  revokeAllSessions: () =>
    client.delete('/auth/sessions').then(r => r.data?.data || r.data),

  // Security Settings
  getSecuritySettings: () =>
    client.get('/auth/security-settings').then(r => r.data?.data || r.data),

  updateSecuritySettings: (settings) =>
    client.put('/auth/security-settings', settings).then(r => r.data?.data || r.data),

  // Account Status
  getAccountStatus: () =>
    client.get('/auth/account-status').then(r => r.data?.data || r.data),

  // User Preferences
  getPreferences: () =>
    client.get('/auth/preferences').then(r => r.data?.data || r.data),

  updatePreferences: (preferences) =>
    client.put('/auth/preferences', preferences).then(r => r.data?.data || r.data),

  // Account Deletion
  deleteAccount: () =>
    client.delete('/auth/account').then(r => r.data?.data || r.data)
};
