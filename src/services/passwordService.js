import client from '../api/client';

export const passwordService = {
  // Password Reset
  requestPasswordReset: (email) =>
    client.post('/auth/request-password-reset', { email }).then(r => r.data?.data || r.data),

  resetPassword: (token, newPassword) =>
    client.post('/auth/reset-password', { token, newPassword }).then(r => r.data?.data || r.data),

  // Password Validation
  validatePassword: (password) =>
    client.post('/auth/validate-password', { password }).then(r => r.data?.data || r.data),

  // Password Strength Check
  checkPasswordStrength: (password) =>
    client.post('/auth/password-strength', { password }).then(r => r.data?.data || r.data),

  // Password History
  getPasswordHistory: () =>
    client.get('/auth/password-history').then(r => r.data?.data || r.data),

  // Password Requirements
  getPasswordRequirements: () =>
    client.get('/auth/password-requirements').then(r => r.data?.data || r.data),

  // Update Password Policy
  updatePasswordPolicy: (policy) =>
    client.put('/auth/password-policy', policy).then(r => r.data?.data || r.data),

  // Get Password Policy
  getPasswordPolicy: () =>
    client.get('/auth/password-policy').then(r => r.data?.data || r.data),

  // Password Expiry Check
  checkPasswordExpiry: () =>
    client.get('/auth/password-expiry').then(r => r.data?.data || r.data),

  // Force Password Change
  forcePasswordChange: (userId) =>
    client.post(`/auth/force-password-change/${userId}`).then(r => r.data?.data || r.data),

  // Password Recovery Options
  getRecoveryOptions: () =>
    client.get('/auth/recovery-options').then(r => r.data?.data || r.data),

  // Security Questions
  getSecurityQuestions: () =>
    client.get('/auth/security-questions').then(r => r.data?.data || r.data),

  // Set Security Questions
  setSecurityQuestions: (questions) =>
    client.post('/auth/security-questions', { questions }).then(r => r.data?.data || r.data),

  // Verify Security Questions
  verifySecurityQuestions: (answers) =>
    client.post('/auth/verify-security-questions', { answers }).then(r => r.data?.data || r.data),

  // Two-Factor Authentication
  enable2FA: () =>
    client.post('/auth/enable-2fa').then(r => r.data?.data || r.data),

  disable2FA: () =>
    client.post('/auth/disable-2fa').then(r => r.data?.data || r.data),

  verify2FA: (code) =>
    client.post('/auth/verify-2fa', { code }).then(r => r.data?.data || r.data),

  // Backup Codes
  generateBackupCodes: () =>
    client.get('/auth/backup-codes').then(r => r.data?.data || r.data),

  // Session Management
  getActiveSessions: () =>
    client.get('/auth/active-sessions').then(r => r.data?.data || r.data),

  revokeSession: (sessionId) =>
    client.delete(`/auth/sessions/${sessionId}`).then(r => r.data?.data || r.data),

  revokeAllSessions: () =>
    client.delete('/auth/sessions').then(r => r.data?.data || r.data),

  // Account Security
  getSecuritySettings: () =>
    client.get('/auth/security-settings').then(r => r.data?.data || r.data),

  updateSecuritySettings: (settings) =>
    client.put('/auth/security-settings', settings).then(r => r.data?.data || r.data),

  // Account Lockout
  lockAccount: (reason) =>
    client.post('/auth/lock-account', { reason }).then(r => r.data?.data || r.data),

  // Account Unlock
  unlockAccount: (unlockCode) =>
    client.post('/auth/unlock-account', { unlockCode }).then(r => r.data?.data || r.data)
};
