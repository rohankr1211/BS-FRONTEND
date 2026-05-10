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

    console.log('Fetching Inspections from:', `/api/safety/inspections?${params.toString()}`);
    const res = await client.get<any>(`/api/safety/inspections?${params.toString()}`, { 
      // @ts-ignore
      _skipRedirect: true 
    });
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
    console.log('Creating Inspection with payload:', JSON.stringify(payload, null, 2));
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
    console.log('Fetching Inspection Types...');
    const res = await client.get<any>('/api/safety/inspections/types', {
      // @ts-ignore
      _skipRedirect: true
    });
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

    console.log('Fetching Incidents from:', `/api/safety/incidents?${params.toString()}`);
    const res = await client.get<any>(`/api/safety/incidents?${params.toString()}`, {
      // @ts-ignore
      _skipRedirect: true
    });
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
    console.log('Creating Incident with payload:', JSON.stringify(payload, null, 2));
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
    console.log(`Submitting Task ${assignedTaskId} with payload:`, JSON.stringify(payload, null, 2));
    await client.post(`/api/safety/tasks/${assignedTaskId}/submit`, payload);
  },
  syncTasks: async (config?: any): Promise<{ message: string }> => {
    await client.post('/api/safety/tasks/sync', {}, config);
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
      const [incidentsRes, inspectionsRes, tasksRes] = await Promise.all([
        client.get<any>('/api/safety/incidents', { _skipRedirect: true } as any).catch(() => ({ data: { content: [] } })),
        client.get<any>('/api/safety/inspections', { _skipRedirect: true } as any).catch(() => ({ data: { content: [] } })),
        client.get<any>('/api/safety/tasks', { _skipRedirect: true } as any).catch(() => ({ data: { content: [] } }))
      ]);

      const incidents = incidentsRes.data?.data?.content || incidentsRes.data?.content || incidentsRes.data || [];
      const inspections = inspectionsRes.data?.data?.content || inspectionsRes.data?.content || inspectionsRes.data || [];
      const tasks = tasksRes.data?.data?.content || tasksRes.data?.content || tasksRes.data || [];

      return {
        openIncidents: Array.isArray(incidents) ? incidents.filter((i: any) => i.status === 'OPEN').length : 0,
        pendingInspections: Array.isArray(inspections) ? inspections.filter((i: any) => i.status === 'SCHEDULED' || i.status === 'IN_PROGRESS').length : 0,
        assignedTasks: Array.isArray(tasks) ? tasks.length : 0,
        highSeverityIncidents: Array.isArray(incidents) ? incidents.filter((i: any) => i.severity === 'HIGH' || i.severity === 'CRITICAL').length : 0
      };
    } catch (err) {
      console.error('Failed to aggregate KPI summary:', err);
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
