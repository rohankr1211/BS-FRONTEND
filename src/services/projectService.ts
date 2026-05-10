import client from '../api/client';
import { getRandomProjectImage } from '../utils/projectImages';

// ── Types ──────────────────────────────────────

export interface ProjectResponse {
  projectId: string;
  projectName: string;
  description: string;
  templateId: string;
  templateName: string;
  startDate: string;
  endDate: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED' | 'NOT_STARTED';
  budget: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  totalMilestones: number;
  completedMilestones: number;
  totalTasks: number;
  completedTasks: number;
  imageUrl?: string;
}

export interface MilestoneResponse {
  milestoneId: string;
  projectId: string;
  name: string;
  description: string;
  order: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate: string | null;
  actualEndDate: string | null;
  daysRemaining: number;
  isOverdue: boolean;
}

export interface TaskResponse {
  taskId: string;
  projectId: string;
  description: string;
  assignedDepartment: string;
  assignedTo: string;
  assignedBy: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  rejectionReason: string | null;
}

export interface ApprovalResponse {
  approvalId: string;
  projectId: string;
  projectName: string;
  taskDescription: string;
  requestType: string;
  requestedBy: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
}

export interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface IssueResponse {
  issueId: string;
  projectId: string;
  title: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  reportedBy: string;
  reportedAt: string;
  assignedTo: string | null;
}

export interface TemplateResponse {
  templateId: string;
  templateName: string;
  description: string;
  estimatedDuration: number;
  defaultBudget: number;
  milestoneCount: number;
  milestones: Array<{ name: string; order: number; durationWeeks: number }>;
}

export interface CreateProjectPayload {
  templateId: string;
  projectName: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  imageUrl?: string;
}

export interface CreateTaskPayload {
  description: string;
  assignedDepartment: string;
  assignedTo: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart: string;
  actualEnd: string;
}

export interface ResolveIssuePayload {
  allocationId: string;
  resourceId: string;
  assignedTo: string;
  resolutionNotes: string;
}

// ── Service ────────────────────────────────────

const projectService = {
  // Projects
  getProjects: async (config?: any): Promise<ProjectResponse[]> => {
    const res = await client.get<any>('/api/projects', config);
    const data = res.data?.data || res.data;
    const projects = Array.isArray(data) ? data : (data?.content || []);
    // Assign random images to projects that don't have one
    return projects.map((p: any) => ({
      ...p,
      imageUrl: p.imageUrl || getRandomProjectImage()
    }));
  },
  getProject: async (projectId: string): Promise<ProjectResponse> => {
    const res = await client.get<any>(`/api/projects/${projectId}`);
    const project = res.data?.data || res.data;
    // Assign a random image if the project doesn't have one
    return {
      ...project,
      imageUrl: project?.imageUrl || getRandomProjectImage()
    };
  },
  createProject: async (payload: CreateProjectPayload): Promise<ProjectResponse> => {
    const res = await client.post<any>('/api/projects', payload);
    return res.data?.data || res.data;
  },

  // Milestones
  getMilestones: async (projectId: string): Promise<MilestoneResponse[]> => {
    const res = await client.get<any>(`/api/projects/${projectId}/milestones`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  updateMilestoneStatus: async (milestoneId: string, status: string): Promise<void> => {
    await client.patch(`/api/projects/milestones/${milestoneId}/status?status=${status}`);
  },
  updateMilestoneProgress: async (projectId: string, data: any): Promise<void> => {
    await client.post(`/api/projects/${projectId}/milestones/progress`, data);
  },

  // Tasks
  getTasks: async (projectId: string): Promise<TaskResponse[]> => {
    const res = await client.get<any>(`/api/projects/${projectId}/tasks`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  createTask: async (projectId: string, payload: CreateTaskPayload): Promise<TaskResponse> => {
    const res = await client.post<any>(`/api/projects/${projectId}/tasks`, payload);
    return res.data?.data || res.data;
  },
  updateTaskStatus: async (taskId: string, status: string): Promise<void> => {
    await client.patch(`/api/projects/tasks/${taskId}/status?status=${status}`);
  },
  getMyTasks: async (userId: string): Promise<TaskResponse[]> => {
    const res = await client.get<any>(`/api/projects/tasks/my?userId=${userId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },

  // Approvals
  getApprovals: async (): Promise<ApprovalResponse[]> => {
    const res = await client.get<any>('/api/approvals');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getPendingApprovals: async (): Promise<ApprovalResponse[]> => {
    const res = await client.get<any>('/api/approvals/pending');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getProjectApprovals: async (projectId: string): Promise<ApprovalResponse[]> => {
    const res = await client.get<any>(`/api/approvals/project/${projectId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  createApproval: async (payload: any): Promise<ApprovalResponse> => {
    const res = await client.post<any>('/api/approvals', payload);
    return res.data?.data || res.data;
  },
  approveRequest: async (approvalId: string): Promise<void> => {
    await client.post(`/api/approvals/${approvalId}/approve`);
  },
  rejectRequest: async (approvalId: string, reason: string): Promise<void> => {
    await client.post(`/api/approvals/${approvalId}/reject?rejectionReason=${reason}`);
  },
  getApprovalStats: async (): Promise<ApprovalStats> => {
    const res = await client.get<any>('/api/approvals/stats');
    return res.data?.data || res.data;
  },

  // Issues (Project Manager View)
  getIssues: async (projectId?: string): Promise<IssueResponse[]> => {
    const res = await client.get<any>(`/api/projects/issues${projectId ? `?projectId=${projectId}` : ''}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  resolveIssue: async (issueId: string, payload: ResolveIssuePayload): Promise<void> => {
    await client.post(`/api/projects/issues/${issueId}/resolve`, payload);
  },

  // Templates
  getTemplates: async (): Promise<TemplateResponse[]> => {
    const res = await client.get<any>('/api/templates');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getTemplate: async (templateId: string): Promise<TemplateResponse> => {
    const res = await client.get<any>(`/api/templates/${templateId}`);
    return res.data?.data || res.data;
  },

  // Additional PM Views
  getVendorApprovals: async (): Promise<any> => {
    const res = await client.get<any>('/api/vendor');
    return res.data?.data || res.data;
  },
  getFinanceApprovals: async (): Promise<any> => {
    const res = await client.get<any>('/api/finance');
    return res.data?.data || res.data;
  },
  getPMNotifications: async (): Promise<any> => {
    const res = await client.get<any>('/api/notifications');
    return res.data?.data || res.data;
  }
};
export default projectService;
