import client from '../api/client';

type IamResponse<T> = { success: boolean; message: string; data: T };

export const adminService = {
  /**
   * GET /admin/pending-users
   */
  getPendingUsers: () =>
    client.get<any>('/admin/pending-users').then(r => r.data?.data || r.data),

  /**
   * POST /admin/approve-user/{userId}
   */
  approveUser: (userId: string) =>
    client.post<any>(`/admin/approve-user/${userId}`).then(r => r.data?.data || r.data),

  /**
   * POST /admin/reject-user/{userId}
   */
  rejectUser: (userId: string) =>
    client.post(`/admin/reject-user/${userId}`),

  /**
   * GET /admin/users?page=0&size=10&sortBy=createdAt&sortDir=desc
   */
  getAllUsers: (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') =>
    client.get<any>(`/admin/users?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`).then(r => {
      const data = r.data?.data || r.data;
      if (Array.isArray(data)) {
        return { content: data, totalElements: data.length };
      }
      return data;
    }),

  /**
   * GET /admin/users/{userId}
   */
  getUserById: (userId: string) =>
    client.get<any>(`/admin/users/${userId}`).then(r => r.data?.data || r.data),

  /**
   * PUT /admin/users/{userId}
   */
  updateUser: (userId: string, data: any) =>
    client.put<any>(`/admin/users/${userId}`, data).then(r => r.data?.data || r.data),

  /**
   * DELETE /admin/users/{userId}
   */
  deleteUser: (userId: string) =>
    client.delete(`/admin/users/${userId}`),

  /**
   * GET /admin/users/role/{role}
   */
  getUsersByRole: (role: string) =>
    client.get<any>(`/admin/users/role/${role}`).then(r => r.data?.data || r.data),

  /**
   * GET /admin/audit-logs?page=0&size=20
   */
  getAuditLogs: (page = 0, size = 20) =>
    client.get<any>(`/admin/audit-logs?page=${page}&size=${size}`).then(r => r.data?.data || r.data),

  /**
   * GET /admin/audit-logs/user/{userId}
   */
  getAuditLogsByUser: (userId: string) =>
    client.get<any>(`/admin/audit-logs/user/${userId}`).then(r => r.data?.data || r.data),
};
