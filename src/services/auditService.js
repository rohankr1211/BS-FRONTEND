import client from '../api/client';

export const auditService = {
  // Audit Logs
  getLogs: (page = 0, size = 15, sortBy = 'timestamp', sortDir = 'desc') =>
    client.get(`/audit/logs?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`).then(r => {
      const data = r.data?.data || r.data;
      if (Array.isArray(data)) {
        return { content: data, totalElements: data.length };
      }
      return data;
    }),

  // User Activities
  getUserActivities: (userId) =>
    client.get(`/audit/users/${userId}/activities`).then(r => r.data?.data || r.data),

  // System Events
  getSystemEvents: () =>
    client.get('/audit/system-events').then(r => r.data?.data || r.data),

  // Security Logs
  getSecurityLogs: (page = 0, size = 20) =>
    client.get(`/audit/security-logs?page=${page}&size=${size}`).then(r => r.data?.data || r.data),

  // Login Attempts
  getLoginAttempts: () =>
    client.get('/audit/login-attempts').then(r => r.data?.data || r.data),

  // Failed Logins
  getFailedLogins: () =>
    client.get('/audit/failed-logins').then(r => r.data?.data || r.data),

  // Permission Changes
  getPermissionChanges: () =>
    client.get('/audit/permission-changes').then(r => r.data?.data || r.data),

  // Data Access Logs
  getDataAccessLogs: () =>
    client.get('/audit/data-access').then(r => r.data?.data || r.data),

  // Configuration Changes
  getConfigChanges: () =>
    client.get('/audit/config-changes').then(r => r.data?.data || r.data),

  // Export Audit Data
  exportAuditData: (filters) =>
    client.post('/audit/export', filters).then(r => r.data?.data || r.data),

  // Search Audit Logs
  searchAuditLogs: (query, filters) =>
    client.post('/audit/search', { query, ...filters }).then(r => r.data?.data || r.data),

  // Get Audit Summary
  getAuditSummary: (timeRange = '7d') =>
    client.get(`/audit/summary?range=${timeRange}`).then(r => r.data?.data || r.data)
};
