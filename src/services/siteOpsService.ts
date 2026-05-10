import client from '../api/client';

// ── Types ──────────────────────────────────────

export interface SiteLogResponse {
  id: string;
  logId: string;
  projectId: string;
  projectName: string;
  logDate: string;
  activities: string;
  issuesSummary: string;
  progressPercent: number;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  reviewStatus: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  photoPath?: string;
}

export interface IssueResponse {
  id: string;
  issueId: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  reportedBy: string;
  reportedByName: string;
  reportedAt: string;
}

export interface SiteTaskResponse {
  assignedTaskId: string;
  projectId: string;
  projectName: string;
  taskDescription: string;
  assignedByName: string;
  assignedAt: string;
  status: 'PENDING' | 'SUBMITTED' | 'COMPLETED' | 'REJECTED';
  submissionDescription: string | null;
}

export interface InboundDelivery {
  id: string;
  deliveryId: string;
  contractId: string;
  item: string;
  quantity: number;
  deliveryDate: string;
  vendorStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED';
  siteStatus: 'RECEIVED' | 'NOT_RECEIVED' | null;
  siteRemarks: string | null;
  receivedAt: string | null;
}

export interface SiteOpsKpi {
  todaysLogs: number;
  openIssues: number;
  pendingTasks: number;
  pendingDeliveries: number;
}

// ── Service ────────────────────────────────────

export const siteOpsService = {
  // Site Logs
  getSiteLogs: async (projectId: string, from?: string, to?: string): Promise<SiteLogResponse[]> => {
    const res = await client.get<any>(`/api/sitelogs?projectId=${projectId}&from=${from || ''}&to=${to || ''}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getSiteLogsPaginated: async (projectId: string, pageNumber = 0, pageSize = 10, sortBy = 'logDate', sortDirection = 'DESC'): Promise<any> => {
    const res = await client.get<any>(`/api/sitelogs/paginated/list?projectId=${projectId}&pageNumber=${pageNumber}&pageSize=${pageSize}&sortBy=${sortBy}&sortDirection=${sortDirection}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getSiteLogById: async (logId: string): Promise<SiteLogResponse> => {
    const res = await client.get<any>(`/api/sitelogs/${logId}`);
    return res.data?.data || res.data;
  },
  createSiteLog: async (payload: any): Promise<SiteLogResponse> => {
    const res = await client.post<any>('/api/sitelogs', payload);
    return res.data?.data || res.data;
  },
  uploadPhoto: async (logId: string, formData: FormData): Promise<void> => {
    await client.post(`/api/sitelogs/${logId}/photo-upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  submitSiteLog: async (logId: string): Promise<void> => {
    await client.post(`/api/sitelogs/${logId}/submit`);
  },
  getLatestLog: async (projectId: string): Promise<SiteLogResponse> => {
    const res = await client.get<any>(`/api/sitelogs/latest/${projectId}`);
    return res.data?.data || res.data;
  },

  // Issues
  getIssues: async (filters?: { projectId?: string; status?: string; severity?: string; reportedBy?: string }): Promise<IssueResponse[]> => {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.reportedBy) params.append('reportedBy', filters.reportedBy);
    const res = await client.get<any>(`/api/issues?${params.toString()}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getIssuesPaginated: async (projectId: string, pageNumber = 0, pageSize = 10, sortBy = 'reportedAt', sortDirection = 'DESC'): Promise<any> => {
    const res = await client.get<any>(`/api/issues/paginated/list?projectId=${projectId}&pageNumber=${pageNumber}&pageSize=${pageSize}&sortBy=${sortBy}&sortDirection=${sortDirection}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getIssueById: async (issueId: string): Promise<IssueResponse> => {
    const res = await client.get<any>(`/api/issues/${issueId}`);
    return res.data?.data || res.data;
  },
  reportIssue: async (payload: any): Promise<IssueResponse> => {
    const res = await client.post<any>('/api/issues', payload);
    return res.data?.data || res.data;
  },
  updateIssue: async (issueId: string, payload: any): Promise<void> => {
    await client.patch(`/api/issues/${issueId}`, payload);
  },
  getIssuesByLog: async (logId: string): Promise<IssueResponse[]> => {
    const res = await client.get<any>(`/api/issues/by-log/${logId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },

  // SiteOps Tasks
  getTasks: async (): Promise<SiteTaskResponse[]> => {
    const res = await client.get<any>('/api/siteops/tasks');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getTasksByProject: async (projectId: string): Promise<SiteTaskResponse[]> => {
    const res = await client.get<any>(`/api/siteops/tasks/project/${projectId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  submitTask: async (assignedTaskId: string, payload: any): Promise<void> => {
    await client.post(`/api/siteops/tasks/${assignedTaskId}/submit`, payload);
  },
  syncTasks: async (): Promise<{ message: string }> => {
    await client.post('/api/siteops/tasks/sync');
    return { message: 'Tasks synchronized successfully.' };
  },

  // Notifications
  getNotifications: async (): Promise<any> => {
    const res = await client.get<any>('/api/siteops-notifications');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },

  markRead: async (id: string): Promise<void> => {
    await client.patch(`/api/siteops-notifications/${id}/read`);
  },
  markAllRead: async (): Promise<void> => {
    await client.post('/api/siteops-notifications/read-all');
  },

  // KPI
  getKpi: async (): Promise<SiteOpsKpi> => {
    try {
      const res = await client.get<any>('/api/siteops/kpi');
      return res.data?.data || res.data;
    } catch {
      return { todaysLogs: 0, openIssues: 0, pendingTasks: 0, pendingDeliveries: 0 };
    }
  }
};
