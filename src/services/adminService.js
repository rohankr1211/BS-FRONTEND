import client from '../api/client';

export const adminService = {
  /**
   * GET /admin/pending-users
   */
  getPendingUsers: () =>
    client.get('/admin/pending-users').then(r => r.data?.data || r.data),

  /**
   * POST /admin/approve-user/{userId}
   */
  approveUser: (userId) =>
    client.post(`/admin/approve-user/${userId}`).then(r => r.data?.data || r.data),

  /**
   * POST /admin/reject-user/{userId}
   */
  rejectUser: (userId) =>
    client.post(`/admin/reject-user/${userId}`),

  /**
   * GET /admin/users?page=0&size=10&sortBy=createdAt&sortDir=desc
   */
  getAllUsers: (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') =>
    client.get(`/admin/users?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`).then(r => {
      const data = r.data?.data || r.data;
      if (Array.isArray(data)) {
        return { content: data, totalElements: data.length };
      }
      return data;
    }),

  /**
   * GET /admin/audit-logs?page=0&size=15&sortBy=timestamp&sortDir=desc
   */
  getAuditLogs: (page = 0, size = 15, sortBy = 'timestamp', sortDir = 'desc') =>
    client.get(`/admin/audit-logs?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`).then(r => {
      const data = r.data?.data || r.data;
      if (Array.isArray(data)) {
        return { content: data, totalElements: data.length };
      }
      return data;
    }),

  /**
   * GET /admin/system-health
   */
  getSystemHealth: () =>
    client.get('/admin/system-health').then(r => r.data?.data || r.data),

  /**
   * GET /admin/user-stats
   */
  getUserStats: () =>
    client.get('/admin/user-stats').then(r => r.data?.data || r.data),

  /**
   * GET /admin/activity-summary
   */
  getActivitySummary: () =>
    client.get('/admin/activity-summary').then(r => r.data?.data || r.data)
};
