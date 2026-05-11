import client from '../api/client';

// ── Type Definitions ──────────────────────────────
export const createSiteLogResponse = (id, logId, projectId, projectName, logDate, activities, issuesSummary, progressPercent, submittedBy, submittedByName, submittedAt, reviewStatus, photoPath) => ({
  id,
  logId,
  projectId,
  projectName,
  logDate,
  activities,
  issuesSummary,
  progressPercent,
  submittedBy,
  submittedByName,
  submittedAt,
  reviewStatus,
  photoPath
});

export const createIssueResponse = (id, issueId, projectId, projectName, title, description, severity, status, reportedBy, reportedByName, reportedAt) => ({
  id,
  issueId,
  projectId,
  projectName,
  title,
  description,
  severity,
  status,
  reportedBy,
  reportedByName,
  reportedAt
});

export const createSiteTaskResponse = (assignedTaskId, projectId, projectName, taskDescription, assignedByName, assignedAt, status, submissionDescription) => ({
  assignedTaskId,
  projectId,
  projectName,
  taskDescription,
  assignedByName,
  assignedAt,
  status,
  submissionDescription
});

export const createInboundDelivery = (id, deliveryId, contractId, item, quantity, deliveryDate, vendorStatus, siteStatus, siteRemarks, receivedAt) => ({
  id,
  deliveryId,
  contractId,
  item,
  quantity,
  deliveryDate,
  vendorStatus,
  siteStatus,
  siteRemarks,
  receivedAt
});

// ── Site Operations Service ──────────────────────────────
const siteOpsService = {
  // Site Logs
  getSiteLogs: async (page = 0, size = 10, sortBy = 'logId', sortDir = 'asc') => {
    const res = await client.get(`/api/site-logs?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getSiteLogById: async (id) => {
    const res = await client.get(`/api/site-logs/${id}`);
    return res.data?.data || res.data;
  },
  createSiteLog: async (payload) => {
    const res = await client.post('/api/site-logs', payload);
    return res.data?.data || res.data;
  },
  updateSiteLog: async (id, payload) => {
    await client.put(`/api/site-logs/${id}`, payload);
  },
  deleteSiteLog: async (id) => {
    await client.delete(`/api/site-logs/${id}`);
  },
  updateSiteLogStatus: async (id, status) => {
    await client.put(`/api/site-logs/${id}/status`, { status });
  },
  uploadSiteLogPhoto: async (id, formData) => {
    const res = await client.post(`/api/site-logs/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data?.data || res.data;
  },

  // Issues
  getIssues: async (page = 0, size = 10, sortBy = 'issueId', sortDir = 'asc') => {
    const res = await client.get(`/api/issues?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getIssueById: async (id) => {
    const res = await client.get(`/api/issues/${id}`);
    return res.data?.data || res.data;
  },
  createIssue: async (payload) => {
    const res = await client.post('/api/issues', payload);
    return res.data?.data || res.data;
  },
  updateIssue: async (id, payload) => {
    await client.put(`/api/issues/${id}`, payload);
  },
  deleteIssue: async (id) => {
    await client.delete(`/api/issues/${id}`);
  },
  updateIssueStatus: async (id, status) => {
    await client.put(`/api/issues/${id}/status`, { status });
  },

  // SiteOps Tasks
  getTasks: async (page = 0, size = 10, sortBy = 'assignedTaskId', sortDir = 'asc') => {
    const res = await client.get(`/api/site-tasks?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getTaskById: async (id) => {
    const res = await client.get(`/api/site-tasks/${id}`);
    return res.data?.data || res.data;
  },
  createTask: async (payload) => {
    const res = await client.post('/api/site-tasks', payload);
    return res.data?.data || res.data;
  },
  updateTask: async (id, payload) => {
    await client.put(`/api/site-tasks/${id}`, payload);
  },
  deleteTask: async (id) => {
    await client.delete(`/api/site-tasks/${id}`);
  },
  submitTask: async (id, payload) => {
    const res = await client.post(`/api/site-tasks/${id}/submit`, payload);
    return res.data?.data || res.data;
  },

  // Inbound Deliveries
  getInboundDeliveries: async (page = 0, size = 10, sortBy = 'deliveryId', sortDir = 'asc') => {
    const res = await client.get(`/api/deliveries?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getDeliveryById: async (id) => {
    const res = await client.get(`/api/deliveries/${id}`);
    return res.data?.data || res.data;
  },
  createDelivery: async (payload) => {
    const res = await client.post('/api/deliveries', payload);
    return res.data?.data || res.data;
  },
  updateDelivery: async (id, payload) => {
    await client.put(`/api/deliveries/${id}`, payload);
  },
  deleteDelivery: async (id) => {
    await client.delete(`/api/deliveries/${id}`);
  },

  // Notifications
  getNotifications: async (page = 0, size = 10, sortBy = 'notificationId', sortDir = 'asc') => {
    const res = await client.get(`/api/site-notifications?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getNotificationById: async (id) => {
    const res = await client.get(`/api/site-notifications/${id}`);
    return res.data?.data || res.data;
  },
  markAsRead: async (id) => {
    await client.put(`/api/site-notifications/${id}/read`);
  },
  markAllAsRead: async () => {
    await client.put('/api/site-notifications/read-all');
  },

  // KPI & Analytics
  getKpiSummary: async () => {
    const res = await client.get('/api/site-ops/kpi');
    return res.data?.data || res.data;
  },
  getTaskCompletion: async (timeRange = '7d') => {
    const res = await client.get(`/api/site-ops/task-completion?range=${timeRange}`);
    return res.data?.data || res.data;
  },
  getIssueTrends: async (timeRange = '30d') => {
    const res = await client.get(`/api/site-ops/issue-trends?range=${timeRange}`);
    return res.data?.data || res.data;
  }
};

export default siteOpsService;
export { 
  createSiteLogResponse, 
  createIssueResponse, 
  createSiteTaskResponse, 
  createInboundDelivery 
};
