import client from '../api/client';

// ── Types ──────────────────────────────────────

export interface IncidentResponse {
  id: string;
  incidentId: string;
  projectId: string;
  projectName: string;
  date: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reportedBy: string;
  reportedByName: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
}

export interface InspectionResponse {
  id: string;
  inspectionId: string;
  projectId: string;
  projectName: string;
  date: string;
  officerId: string;
  officerName: string;
  inspectionType: string;
  findings: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedTaskId: string | null;
}

export interface SafetyTaskResponse {
  assignedTaskId: string;
  projectId: string;
  projectName: string;
  taskId: string;
  taskDescription: string;
  assignedBy: string;
  assignedByName: string;
  assignedAt: string;
  status: 'PENDING' | 'SUBMITTED' | 'COMPLETED' | 'REJECTED';
  submittedAt: string | null;
  submissionDescription: string | null;
}

export interface NotificationResponse {
  notificationId: string;
  message: string;
  type: string;
  createdAt: string;
  read: boolean;
  relatedEntityId: string;
}

export interface SafetyKpiSummary {
  openIncidents: number;
  pendingInspections: number;
  assignedTasks: number;
  highSeverityIncidents: number;
}

// ── Service ────────────────────────────────────

const safetyService = {
  // Inspections
  getInspections: async (filters?: { projectId?: string; status?: string; dateFrom?: string; dateTo?: string; page?: number; size?: number }): Promise<any> => {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    params.append('page', (filters?.page || 0).toString());
    params.append('size', (filters?.size || 10).toString());

    const res = await client.get<any>(`/api/safety/inspections?${params.toString()}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) {
      return { content: data, totalElements: data.length };
    }
    return data;
  },
  getInspectionById: async (id: string): Promise<InspectionResponse> => {
    const res = await client.get<any>(`/api/safety/inspections/${id}`);
    return res.data?.data || res.data;
  },
  createInspection: async (payload: any): Promise<InspectionResponse> => {
    const res = await client.post<any>('/api/safety/inspections', payload);
    return res.data?.data || res.data;
  },
  updateInspectionStatus: async (id: string, status: string): Promise<void> => {
    await client.patch(`/api/safety/inspections/${id}/status?status=${status}`);
  },
  deleteInspection: async (id: string): Promise<void> => {
    await client.delete(`/api/safety/inspections/${id}`);
  },
  getInspectionTypes: async (): Promise<string[]> => {
    const res = await client.get<any>('/api/safety/inspections/types');
    return res.data?.data || res.data;
  },

  // Incidents
  getIncidents: async (filters?: { projectId?: string; status?: string; severity?: string; dateFrom?: string; dateTo?: string; page?: number; size?: number }): Promise<any> => {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    params.append('page', (filters?.page || 0).toString());
    params.append('size', (filters?.size || 10).toString());

    const res = await client.get<any>(`/api/safety/incidents?${params.toString()}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) {
      return { content: data, totalElements: data.length };
    }
    return data;
  },
  getIncidentById: async (id: string): Promise<IncidentResponse> => {
    const res = await client.get<any>(`/api/safety/incidents/${id}`);
    return res.data?.data || res.data;
  },
  createIncident: async (payload: any): Promise<IncidentResponse> => {
    const res = await client.post<any>('/api/safety/incidents', payload);
    return res.data?.data || res.data;
  },
  updateIncidentStatus: async (id: string, status: string): Promise<void> => {
    await client.patch(`/api/safety/incidents/${id}/status?status=${status}`);
  },
  deleteIncident: async (id: string): Promise<void> => {
    await client.delete(`/api/safety/incidents/${id}`);
  },

  // Safety Tasks
  getTasks: async (): Promise<SafetyTaskResponse[]> => {
    const res = await client.get<any>('/api/safety/tasks');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getTasksByProject: async (projectId: string): Promise<SafetyTaskResponse[]> => {
    const res = await client.get<any>(`/api/safety/tasks/project/${projectId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  submitTask: async (assignedTaskId: string, payload: any): Promise<void> => {
    await client.post(`/api/safety/tasks/${assignedTaskId}/submit`, payload);
  },
  syncTasks: async (): Promise<{ message: string }> => {
    await client.post('/api/safety/tasks/sync');
    return { message: 'Tasks synchronized successfully with the project management service.' };
  },

  // Safety Notifications
  getNotifications: async (): Promise<NotificationResponse[]> => {
    const res = await client.get<any>('/api/safety/notifications');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  createNotification: async (payload: any): Promise<void> => {
    await client.post('/api/safety/notifications', payload);
  },

  // KPI Summary
  getKpiSummary: async (): Promise<SafetyKpiSummary> => {
    try {
      const res = await client.get<any>('/api/safety/analytics/summary');
      return res.data?.data || res.data;
    } catch {
      return { openIncidents: 0, pendingInspections: 0, assignedTasks: 0, highSeverityIncidents: 0 };
    }
  },

  // Notifications Actions
  markRead: async (id: string): Promise<void> => {
    await client.patch(`/api/safety/notifications/${id}/read`);
  },
  markAllRead: async (): Promise<void> => {
    await client.post('/api/safety/notifications/read-all');
  }
};

export default safetyService;
