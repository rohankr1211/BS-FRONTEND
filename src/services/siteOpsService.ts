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
    const res = await client.get<any>(`/api/siteops/sitelogs?projectId=${projectId}&from=${from || ''}&to=${to || ''}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getSiteLogsPaginated: async (projectId: string, pageNumber = 0, pageSize = 10, sortBy = 'logDate', sortDirection = 'DESC'): Promise<any> => {
    const res = await client.get<any>(`/api/siteops/sitelogs/paginated/list?projectId=${projectId}&pageNumber=${pageNumber}&pageSize=${pageSize}&sortBy=${sortBy}&sortDirection=${sortDirection}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getSiteLogById: async (logId: string): Promise<SiteLogResponse> => {
    const res = await client.get<any>(`/api/siteops/sitelogs/${logId}`);
    return res.data?.data || res.data;
  },
  createSiteLog: async (payload: any): Promise<SiteLogResponse> => {
    const res = await client.post<any>('/api/siteops/sitelogs', payload);
    return res.data?.data || res.data;
  },
  uploadPhoto: async (logId: string, formData: FormData): Promise<void> => {
    await client.post(`/api/siteops/sitelogs/${logId}/photo-upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  submitSiteLog: async (logId: string): Promise<void> => {
    await client.post(`/api/siteops/sitelogs/${logId}/submit`);
  },
  deleteSiteLog: async (logId: string): Promise<void> => {
    await client.delete(`/api/siteops/sitelogs/${logId}`);
  },
  updateSiteLogStatus: async (logId: string, status: string): Promise<void> => {
    await client.patch(`/api/siteops/sitelogs/${logId}`, { reviewStatus: status });
  },
  getLatestLog: async (projectId: string): Promise<SiteLogResponse> => {
    const res = await client.get<any>(`/api/siteops/sitelogs/latest/${projectId}`);
    return res.data?.data || res.data;
  },
  getInstanceInfo: async (): Promise<any> => {
    const res = await client.get<any>('/api/siteops/sitelogs/instance-info');
    return res.data?.data || res.data;
  },
  getSiteLogsByDate: async (date: string): Promise<SiteLogResponse[]> => {
    const res = await client.get<any>(`/api/siteops/sitelogs/by-date?date=${date}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
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
  getIssuesPaginated: async (pageNumber = 0, pageSize = 10, sortBy = 'reportedAt', sortDirection = 'DESC'): Promise<any> => {
    const res = await client.get<any>(`/api/issues/paginated/list?pageNumber=${pageNumber}&pageSize=${pageSize}&sortBy=${sortBy}&sortDirection=${sortDirection}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getIssuesByStatus: async (status: string, pageNumber = 0, pageSize = 10): Promise<any> => {
    const res = await client.get<any>(`/api/issues/paginated/by-status?status=${status}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getIssuesBySeverity: async (severity: string, pageNumber = 0, pageSize = 10): Promise<any> => {
    const res = await client.get<any>(`/api/issues/paginated/by-severity?severity=${severity}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getIssuesByReporter: async (reportedBy: string, pageNumber = 0, pageSize = 10): Promise<any> => {
    const res = await client.get<any>(`/api/issues/paginated/by-reporter?reportedBy=${reportedBy}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
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
  deleteIssue: async (issueId: string): Promise<void> => {
    await client.delete(`/api/issues/${issueId}`);
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
  syncTasks: async (config?: any): Promise<{ message: string }> => {
    await client.post('/api/siteops/tasks/sync', {}, config);
    return { message: 'Tasks synchronized successfully.' };
  },
  handleApprovalResult: async (payload: any): Promise<void> => {
    await client.post('/internal/approval-result', payload);
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

  // KPI & Analytics
  getKpi: async (userId?: string): Promise<SiteOpsKpi> => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // 1. Try to get official summary (might be 0 if stale)
      const res = await client.get<any>('/api/reports/site-engineer/summary', { _skipRedirect: true } as any).catch(() => ({ data: {} }));
      const summary = res.data?.data || res.data;

      // 2. Fetch live counts as a "Source of Truth" (especially for Today's Logs)
      // We check Project 2 specifically as requested
      const [logs, issues] = await Promise.all([
        siteOpsService.getSiteLogs('CHEBS26002', today, today).catch(() => []),
        siteOpsService.getIssues({ projectId: 'CHEBS26002', status: 'OPEN' }).catch(() => [])
      ]);

      return {
        todaysLogs: Math.max(logs.length, summary?.todaysLogsCount || summary?.todaysLogs || 0),
        openIssues: Math.max(issues.length, summary?.openIssuesCount || summary?.openIssues || 0),
        pendingTasks: summary?.pendingTasksCount || summary?.pendingTasks || 0,
        pendingDeliveries: 0
      };
    } catch (e) {
      console.error("Failed to fetch SiteOps KPIs", e);
      return { todaysLogs: 0, openIssues: 0, pendingTasks: 0, pendingDeliveries: 0 };
    }
  },

  getPerformanceReport: async (): Promise<any> => {
    const url = '/api/reports/site-engineer/performance';
    const res = await client.get<any>(url, { _skipRedirect: true } as any);
    return res.data?.data || res.data;
  },

  getDailyLogsReport: async (): Promise<any> => {
    const url = '/api/reports/site-engineer/daily-logs';
    const res = await client.get<any>(url, { _skipRedirect: true } as any);
    return res.data?.data || res.data;
  },

  // Deliveries
  getInboundDeliveries: async (): Promise<InboundDelivery[]> => {
    const res = await client.get<any>('/api/siteops/deliveries');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  createDelivery: async (payload: any): Promise<InboundDelivery> => {
    const res = await client.post<any>('/internal/deliveries', payload);
    return res.data?.data || res.data;
  },
  getPendingDeliveries: async (): Promise<InboundDelivery[]> => {
    const res = await client.get<any>('/api/siteops/deliveries/pending');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getDeliverySiteStatus: async (deliveryId: string): Promise<any> => {
    const res = await client.get<any>(`/internal/deliveries/${deliveryId}/site-status`);
    return res.data?.data || res.data;
  },
  confirmDelivery: async (deliveryId: string, status: string, remarks: string): Promise<void> => {
    await client.patch(`/api/siteops/deliveries/${deliveryId}/confirm`, {
      siteStatus: status,
      siteRemarks: remarks
    });
  },
};
