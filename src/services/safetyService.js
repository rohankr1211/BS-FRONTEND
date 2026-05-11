import client from '../api/client';

// ── Type Definitions ──────────────────────────────
export const createIncidentResponse = (id, incidentId, projectId, projectName, date, description, severity, reportedBy, reportedByName, status) => ({
  id,
  incidentId,
  projectId,
  projectName,
  date,
  description,
  severity,
  reportedBy,
  reportedByName,
  status
});

export const createInspectionResponse = (id, inspectionId, projectId, projectName, date, officerId, officerName, inspectionType, findings, status, assignedTaskId) => ({
  id,
  inspectionId,
  projectId,
  projectName,
  date,
  officerId,
  officerName,
  inspectionType,
  findings,
  status,
  assignedTaskId
});

export const createSafetyTaskResponse = (assignedTaskId, projectId, projectName, taskId, taskDescription, assignedBy, assignedByName, assignedAt, status, submittedAt, submissionDescription) => ({
  assignedTaskId,
  projectId,
  projectName,
  taskId,
  taskDescription,
  assignedBy,
  assignedByName,
  assignedAt,
  status,
  submittedAt,
  submissionDescription
});

export const createNotificationResponse = (notificationId, message, type, createdAt) => ({
  notificationId,
  message,
  type,
  createdAt
});

// ── Safety Service ──────────────────────────────
const safetyService = {
  // Incidents
  getIncidents: async (page = 0, size = 10, sortBy = 'incidentId', sortDir = 'asc') => {
    const res = await client.get(`/api/incidents?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getIncidentById: async (id) => {
    const res = await client.get(`/api/incidents/${id}`);
    return res.data?.data || res.data;
  },
  createIncident: async (payload) => {
    const res = await client.post('/api/incidents', payload);
    return res.data?.data || res.data;
  },
  updateIncident: async (id, payload) => {
    await client.put(`/api/incidents/${id}`, payload);
  },
  deleteIncident: async (id) => {
    await client.delete(`/api/incidents/${id}`);
  },
  updateIncidentStatus: async (id, status) => {
    await client.put(`/api/incidents/${id}/status`, { status });
  },

  // Inspections
  getInspections: async (page = 0, size = 10, sortBy = 'inspectionId', sortDir = 'asc') => {
    const res = await client.get(`/api/inspections?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getInspectionById: async (id) => {
    const res = await client.get(`/api/inspections/${id}`);
    return res.data?.data || res.data;
  },
  createInspection: async (payload) => {
    const res = await client.post('/api/inspections', payload);
    return res.data?.data || res.data;
  },
  updateInspection: async (id, payload) => {
    await client.put(`/api/inspections/${id}`, payload);
  },
  deleteInspection: async (id) => {
    await client.delete(`/api/inspections/${id}`);
  },
  updateInspectionStatus: async (id, status) => {
    await client.put(`/api/inspections/${id}/status`, { status });
  },

  // Safety Tasks
  getTasks: async (page = 0, size = 10, sortBy = 'assignedTaskId', sortDir = 'asc') => {
    const res = await client.get(`/api/safety-tasks?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getTaskById: async (id) => {
    const res = await client.get(`/api/safety-tasks/${id}`);
    return res.data?.data || res.data;
  },
  createTask: async (payload) => {
    const res = await client.post('/api/safety-tasks', payload);
    return res.data?.data || res.data;
  },
  updateTask: async (id, payload) => {
    await client.put(`/api/safety-tasks/${id}`, payload);
  },
  deleteTask: async (id) => {
    await client.delete(`/api/safety-tasks/${id}`);
  },
  submitTask: async (id, payload) => {
    const res = await client.post(`/api/safety-tasks/${id}/submit`, payload);
    return res.data?.data || res.data;
  },

  // Notifications
  getNotifications: async (page = 0, size = 10, sortBy = 'notificationId', sortDir = 'asc') => {
    const res = await client.get(`/api/safety-notifications?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getNotificationById: async (id) => {
    const res = await client.get(`/api/safety-notifications/${id}`);
    return res.data?.data || res.data;
  },
  markAsRead: async (id) => {
    await client.put(`/api/safety-notifications/${id}/read`);
  },
  markAllAsRead: async () => {
    await client.put('/api/safety-notifications/read-all');
  },

  // KPI Summary
  getKpiSummary: async () => {
    const res = await client.get('/api/safety/kpi');
    return res.data?.data || res.data;
  }
};

export default safetyService;
export { 
  createIncidentResponse, 
  createInspectionResponse, 
  createSafetyTaskResponse, 
  createNotificationResponse 
};
