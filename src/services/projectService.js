import client from '../api/client';
import { getRandomProjectImage } from '../utils/projectImages';

// ── Type Definitions ──────────────────────────────
export const createProjectResponse = (projectId, projectName, description, templateId, templateName, startDate, endDate, status, budget, createdBy, createdAt, updatedAt, totalMilestones, completedMilestones, totalTasks, completedTasks, imageUrl) => ({
  projectId,
  projectName,
  description,
  templateId,
  templateName,
  startDate,
  endDate,
  status,
  budget,
  createdBy,
  createdAt,
  updatedAt,
  totalMilestones,
  completedMilestones,
  totalTasks,
  completedTasks,
  imageUrl
});

export const createMilestoneResponse = (milestoneId, projectId, name, description, order, status, plannedStartDate, plannedEndDate, actualStartDate, actualEndDate, daysRemaining, isOverdue) => ({
  milestoneId,
  projectId,
  name,
  description,
  order,
  status,
  plannedStartDate,
  plannedEndDate,
  actualStartDate,
  actualEndDate,
  daysRemaining,
  isOverdue
});

export const createTaskResponse = (taskId, projectId, description, assignedDepartment, assignedTo, assignedBy, plannedStart, plannedEnd, actualStart, actualEnd, status, completedAt) => ({
  taskId,
  projectId,
  description,
  assignedDepartment,
  assignedTo,
  assignedBy,
  plannedStart,
  plannedEnd,
  actualStart,
  actualEnd,
  status,
  completedAt
});

export const createAllocationResponse = (allocationId, projectId, resourceName, allocatedTo, allocatedBy, quantity, unit, allocatedAt, status) => ({
  allocationId,
  projectId,
  resourceName,
  allocatedTo,
  allocatedBy,
  quantity,
  unit,
  allocatedAt,
  status
});

export const createTemplateResponse = (templateId, name, description, category, tasks) => ({
  templateId,
  name,
  description,
  category,
  tasks
});

// ── Project Service ──────────────────────────────
const projectService = {
  // Projects
  getProjects: async (page = 0, size = 10, sortBy = 'projectId', sortDir = 'asc') => {
    const res = await client.get(`/api/projects?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getProjectById: async (id) => {
    const res = await client.get(`/api/projects/${id}`);
    return res.data?.data || res.data;
  },
  createProject: async (payload) => {
    const res = await client.post('/api/projects', payload);
    return res.data?.data || res.data;
  },
  updateProject: async (id, payload) => {
    await client.put(`/api/projects/${id}`, payload);
  },
  deleteProject: async (id) => {
    await client.delete(`/api/projects/${id}`);
  },

  // Milestones
  getMilestones: async (projectId) => {
    const res = await client.get(`/api/projects/${projectId}/milestones`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  createMilestone: async (projectId, payload) => {
    const res = await client.post(`/api/projects/${projectId}/milestones`, payload);
    return res.data?.data || res.data;
  },
  updateMilestone: async (projectId, milestoneId, payload) => {
    await client.put(`/api/projects/${projectId}/milestones/${milestoneId}`, payload);
  },
  deleteMilestone: async (projectId, milestoneId) => {
    await client.delete(`/api/projects/${projectId}/milestones/${milestoneId}`);
  },

  // Tasks
  getTasks: async (projectId) => {
    const res = await client.get(`/api/projects/${projectId}/tasks`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  createTask: async (projectId, payload) => {
    const res = await client.post(`/api/projects/${projectId}/tasks`, payload);
    return res.data?.data || res.data;
  },
  updateTask: async (projectId, taskId, payload) => {
    await client.put(`/api/projects/${projectId}/tasks/${taskId}`, payload);
  },
  deleteTask: async (projectId, taskId) => {
    await client.delete(`/api/projects/${projectId}/tasks/${taskId}`);
  },

  // Allocations
  getAllocations: async (projectId) => {
    const res = await client.get(`/api/projects/${projectId}/allocations`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  createAllocation: async (projectId, payload) => {
    const res = await client.post(`/api/projects/${projectId}/allocations`, payload);
    return res.data?.data || res.data;
  },
  updateAllocation: async (projectId, allocationId, payload) => {
    await client.put(`/api/projects/${projectId}/allocations/${allocationId}`, payload);
  },
  deleteAllocation: async (projectId, allocationId) => {
    await client.delete(`/api/projects/${projectId}/allocations/${allocationId}`);
  },

  // Templates
  getTemplates: async () => {
    const res = await client.get('/api/templates');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getTemplateById: async (id) => {
    const res = await client.get(`/api/templates/${id}`);
    return res.data?.data || res.data;
  },
  createTemplate: async (payload) => {
    const res = await client.post('/api/templates', payload);
    return res.data?.data || res.data;
  },
  updateTemplate: async (id, payload) => {
    await client.put(`/api/templates/${id}`, payload);
  },
  deleteTemplate: async (id) => {
    await client.delete(`/api/templates/${id}`);
  },

  // Team Members
  getTeamMembers: async (projectId) => {
    const res = await client.get(`/api/projects/${projectId}/team`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  addTeamMember: async (projectId, payload) => {
    const res = await client.post(`/api/projects/${projectId}/team`, payload);
    return res.data?.data || res.data;
  },
  removeTeamMember: async (projectId, userId) => {
    await client.delete(`/api/projects/${projectId}/team/${userId}`);
  }
};

export default projectService;
export { 
  createProjectResponse, 
  createMilestoneResponse, 
  createTaskResponse, 
  createAllocationResponse,
  createTemplateResponse 
};
