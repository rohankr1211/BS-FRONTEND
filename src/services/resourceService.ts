import client from '../api/client';

// ── Types ──────────────────────────────────────

export interface Resource {
  id: string;
  resourceId: string;
  type: 'LABOR' | 'EQUIPMENT' | 'MATERIAL';
  availability: 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE';
  numberOfLabors?: number;
  skillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
  equipmentName?: string;
  equipmentLevel?: 'BASIC' | 'ADVANCED' | 'SPECIALIZED';
  costPerHour: number;
  totalHours: number;
  totalCost: number;
  projectId: string;
  projectName: string;
  purpose: string;
  budgetStatus: 'NONE' | 'BUDGET_PENDING' | 'BUDGET_APPROVED' | 'BUDGET_REJECTED';
  budgetId?: string;
}

export interface Allocation {
  id: string;
  allocationId: string;
  projectId: string;
  projectName: string;
  resourceId: string;
  resourceName: string;
  assignedDate: string;
  releasedDate: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'PENDING' | 'CANCELLED';
  siteId?: string;
}

export interface AllocationCost {
  allocationId: string;
  totalCost: number;
  actualCost: number;
  remainingCost: number;
  utilizationPercentage: number;
}

// ── Service ────────────────────────────────────

export const resourceService = {
  // Resources
  getResources: async (): Promise<Resource[]> => {
    const res = await client.get<any>('/api/resources');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getResourcesPaginated: async (page = 0, size = 10, type?: string, availability?: string): Promise<any> => {
    const res = await client.get<any>(`/api/resources/page?page=${page}&size=${size}&type=${type || ''}&availability=${availability || ''}`);
    return res.data?.data || res.data;
  },
  getResourceById: async (id: string): Promise<Resource> => {
    const res = await client.get<any>(`/api/resources/${id}`);
    return res.data?.data || res.data;
  },
  addResource: async (payload: Partial<Resource>): Promise<Resource> => {
    const res = await client.post<any>('/api/resources', payload);
    return res.data?.data || res.data;
  },
  updateResource: async (id: string, payload: Partial<Resource>): Promise<void> => {
    await client.put(`/api/resources/${id}`, payload);
  },
  deleteResource: async (id: string): Promise<void> => {
    await client.delete(`/api/resources/${id}`);
  },
  getResourcesByType: async (type: string): Promise<Resource[]> => {
    const res = await client.get<any>(`/api/resources/type/${type}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getAvailableResources: async (): Promise<Resource[]> => {
    const res = await client.get<any>('/api/resources/available');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },

  // Allocations
  getAllocations: async (): Promise<Allocation[]> => {
    const res = await client.get<any>('/api/allocations');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  createAllocation: async (payload: Partial<Allocation>): Promise<Allocation> => {
    const res = await client.post<any>('/api/allocations', payload);
    return res.data?.data || res.data;
  },
  getAllocationsByProject: async (projectId: string): Promise<Allocation[]> => {
    const res = await client.get<any>(`/api/allocations/project/${projectId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getAllocationsByResource: async (resourceId: string): Promise<Allocation[]> => {
    const res = await client.get<any>(`/api/allocations/resource/${resourceId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  updateAllocation: async (id: string, payload: Partial<Allocation>): Promise<void> => {
    await client.put(`/api/allocations/${id}`, payload);
  },
  deleteAllocation: async (id: string): Promise<void> => {
    await client.delete(`/api/allocations/${id}`);
  },
  internalResourceCallback: async (payload: any): Promise<void> => {
    await client.post('/api/internal/resources/callback', payload);
  }
};
