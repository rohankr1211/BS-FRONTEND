import client from '../api/client';
import { getRandomProjectImage } from '../utils/projectImages';

// ── Types ──────────────────────────────────────

export interface DashboardSummaryRecord {
  activeProjects: number;
  averageBudgetVariance: number;
  safetyComplianceRate: number;
  resourceUtilization: number;
  pendingItems?: number;
  overdueTasks?: number;
  totalBudget?: number;
  spentBudget?: number;
}

export interface ProjectTrendRecord {
  month: string;
  progress: number;
}

export interface ProjectHealthRecord {
  projectId: string;
  projectName: string;
  scheduleVariance: number;
  costPerformanceIndex: number;
  budgetVariance: number;
}

export interface SafetyComplianceRecord {
  category: string;
  value: number;
  color: string;
}

export interface HistoricalReportRecord {
  reportId: string;
  scope: string;
  generatedDate: string;
}

export interface ReportResponseRecord extends HistoricalReportRecord {
  metrics: string;
}

export interface ProjectSummaryRecord {
  projectId: string;
  projectName: string;
  progressPercent: number;
  budgetVariance: number;
  startDate: string;
  endDate: string;
  status: string;
  imageUrl?: string;
}

export interface BudgetAlertRecord {
  projectId: string;
  plannedAmount: number;
  actualAmount: number;
  variancePercent: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface CashFlowRecord {
  month: string;
  invoices: number;
  payments: number;
  netOutflow: number;
}

export interface VendorPerformanceRecord {
  vendorId: string;
  vendorName: string;
  onTimeDeliveryRate: number;
  qualityScore: number;
  contractComplianceRate: number;
  totalOrders: number;
  avgResponseTimeDays: number;
}

export interface VendorComplianceRecord {
  totalVendors: number;
  compliantVendors: number;
  nonCompliantVendors: number;
  pendingReviewVendors: number;
  documentApprovalRate: number;
}

export interface SiteEngineerPerformanceRecord {
  engineerId: string;
  engineerName: string;
  assignedProject: string;
  tasksCompleted: number;
  tasksPending: number;
  avgCompletionTimeHours: number;
  qualityScore: number;
  attendanceRate: number;
}

export interface SiteProgressSummaryRecord {
  totalSiteEngineers: number;
  activeSites: number;
  avgTaskCompletionRate: number;
  delayedTasksCount: number;
  onTrackProjects: number;
}

export interface SiteEngineerDailyLogRecord {
  logId: string;
  engineerId: string;
  engineerName: string;
  logDate: string;
  siteLocation: string;
  workDescription: string;
  hoursWorked: number;
  issuesReported: number;
  photosAttached: number;
}

export interface SafetyTrendRecord {
  date: string;
  severityCategory: 'LOW' | 'MEDIUM' | 'HIGH';
  incidentCount: number;
}

export interface SafetyInspectionSummaryRecord {
  scheduled: number;
  inProgress: number;
  completed: number;
  overdue: number;
  complianceRate: number;
}

export interface ResourceUtilizationRecord {
  usedHours: number;
  idleHours: number;
  utilizationRate: number;
  totalLabors: number;
  equipmentUptimePercent: number;
}

export interface LaborAllocationRecord {
  site: string;
  allocatedHours: number;
  availableHours: number;
  numberOfLabors: number;
}

export interface UserAnalyticsRecord {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  usersByRole: Record<string, number>;
}

export interface UserMockRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

// ── Service ────────────────────────────────────

const analyticsService = {
  // 1. Dashboard Overview
  getDashboardSummary: async (projectId?: string): Promise<DashboardSummaryRecord> => {
    const res = await client.get<any>(`/api/reports/dashboard-summary${projectId ? `?projectId=${projectId}` : ''}`);
    const data = res.data?.data || res.data;
    console.log('📊 Dashboard Summary Data:', data);
    return data;
  },

  getProjectProgressTrends: async (projectId?: string): Promise<ProjectTrendRecord[]> => {
    const res = await client.get<any>(`/api/reports/project/summary`);
    const data = res.data?.data || res.data;
    const rawList = Array.isArray(data) ? data : (data?.content || []);
    console.log('📈 Project Trends Data:', rawList);
    return rawList.map((p: any) => ({
      month: p.projectName,
      progress: p.progressPercent || 0
    }));
  },

  getProjectHealth: async (projectId: string): Promise<ProjectHealthRecord> => {
    const res = await client.get<any>(`/api/reports/project/${projectId}/health`);
    const data = res.data?.data || res.data;
    console.log('🏥 Project Health Data:', data);
    return data;
  },

  getAllProjectHealth: async (): Promise<ProjectHealthRecord[]> => {
    const res = await client.get<any>(`/api/reports/project/summary`);
    const data = res.data?.data || res.data;
    const rawList = Array.isArray(data) ? data : (data?.content || []);
    console.log('🏥 All Project Health Data (Mapped):', rawList);
    // Map budgetVariancePercent to budgetVariance for the bar chart
    return rawList.map((p: any) => ({
      ...p,
      budgetVariance: p.budgetVariancePercent || 0
    }));
  },

  getSafetyComplianceBreakdown: async (projectId?: string): Promise<SafetyComplianceRecord[]> => {
    try {
      const res = await client.get<any>(`/api/reports/safety/compliance-breakdown`);
      const data = res.data?.data || res.data;
      const list = Array.isArray(data) ? data : (data?.content || []);
      
      if (list.length > 0) {
        console.log('🛡️ Safety Compliance Breakdown (Real):', list);
        return list;
      }

      console.log('🛡️ Safety Compliance Breakdown (Mock Fallback)');
      return [
        { category: 'Fire Safety', value: 85, color: '#FF4D4F' },
        { category: 'PPE Compliance', value: 92, color: '#52C41A' },
        { category: 'Site Access', value: 78, color: '#1890FF' },
        { category: 'Equipment Safety', value: 88, color: '#722ED1' }
      ];
    } catch (error) {
      console.warn("Safety compliance breakdown failed, using mock data", error);
      return [
        { category: 'Fire Safety', value: 85, color: '#FF4D4F' },
        { category: 'PPE Compliance', value: 92, color: '#52C41A' },
        { category: 'Site Access', value: 78, color: '#1890FF' },
        { category: 'Equipment Safety', value: 88, color: '#722ED1' }
      ];
    }
  },

  // 2. Report Generation & History
  generateReport: async (scope: string, targetId?: string): Promise<ReportResponseRecord> => {
    const res = await client.post<any>('/api/reports/generate', { scope, targetId });
    return res.data?.data || res.data;
  },

  getReportHistory: async (scope: string): Promise<HistoricalReportRecord[]> => {
    const res = await client.get<any>(`/api/reports/history/${scope}`);
    const data = res.data?.data || res.data;
    console.log('📜 Report History:', data);
    return Array.isArray(data) ? data : (data?.content || []);
  },

  // 3. Project Analytics
  getProjectSummaries: async (): Promise<ProjectSummaryRecord[]> => {
    const res = await client.get<any>('/api/reports/project/summary');
    const data = res.data?.data !== undefined ? res.data.data : res.data;
    const projects = Array.isArray(data) ? data : (data?.content || []);
    
    // Assign random images to projects that don't have one
    return projects.map((p: any, index: number) => ({
      ...p,
      imageUrl: p.imageUrl || getRandomProjectImage()
    }));
  },

  getProjectBudgetAlerts: async (projectId: string): Promise<BudgetAlertRecord[]> => {
    const res = await client.get<any>(`/api/reports/finance/budget-variance/${projectId}`);
    return res.data?.data || res.data;
  },

  getProjectCashFlow: async (projectId: string): Promise<CashFlowRecord[]> => {
    const res = await client.get<any>(`/api/reports/finance/cash-flow?projectId=${projectId}`);
    return res.data?.data || res.data;
  },

  // 4. Vendor Analytics
  getVendorPerformance: async (vendorId?: string): Promise<VendorPerformanceRecord[]> => {
    const url = vendorId ? `/api/reports/vendor/performance/${vendorId}` : '/api/reports/vendor/performance';
    const res = await client.get<any>(url);
    return res.data?.data || res.data;
  },

  getVendorCompliance: async (): Promise<VendorComplianceRecord> => {
    const res = await client.get<any>('/api/reports/vendor/compliance');
    return res.data?.data || res.data;
  },

  // 5. Site Engineer Analytics
  getSiteEngineerPerformance: async (engineerId?: string): Promise<SiteEngineerPerformanceRecord[]> => {
    const url = engineerId ? `/api/reports/site-engineer/performance/${engineerId}` : '/api/reports/site-engineer/performance';
    const res = await client.get<any>(url);
    return res.data?.data || res.data;
  },

  getSiteProgressSummary: async (): Promise<SiteProgressSummaryRecord> => {
    const res = await client.get<any>('/api/reports/site-engineer/summary');
    return res.data?.data || res.data;
  },

  getSiteEngineerDailyLogs: async (engineerId?: string): Promise<SiteEngineerDailyLogRecord[]> => {
    const url = engineerId ? `/api/reports/site-engineer/daily-logs/${engineerId}` : '/api/reports/site-engineer/daily-logs';
    const res = await client.get<any>(url);
    return res.data?.data || res.data;
  },

  // 6. Safety Analytics
  getSafetyTrends: async (projectId?: string): Promise<SafetyTrendRecord[]> => {
    const res = await client.get<any>(`/api/reports/safety/trends`);
    const data = res.data?.data || res.data;
    console.log('🛡️ Safety Trends Data:', data);
    return Array.isArray(data) ? data : (data?.content || []);
  },

  getSafetyInspectionSummary: async (projectId?: string): Promise<SafetyInspectionSummaryRecord> => {
    const res = await client.get<any>(`/api/reports/safety/inspections-summary`);
    const data = res.data?.data || res.data;
    console.log('📋 Safety Inspection Summary:', data);
    return data;
  },

  // 7. Resource Analytics
  getResourceUtilization: async (projectId?: string): Promise<ResourceUtilizationRecord> => {
    const res = await client.get<any>(`/api/reports/resources/utilization`);
    return res.data?.data || res.data;
  },

  getLaborAllocation: async (projectId?: string): Promise<LaborAllocationRecord[]> => {
    const res = await client.get<any>(`/api/reports/resources/labor-allocation`);
    return res.data?.data || res.data;
  },

  // 8. User Analytics
  getUserAnalyticsSummary: async (): Promise<UserAnalyticsRecord> => {
    try {
      const res = await client.get<any>('/api/reports/users/analytics', { _skipRedirect: true } as any);
      return res.data?.data || res.data;
    } catch (error) {
      console.warn("User analytics summary failed", error);
      return { totalUsers: 0, activeUsers: 0, inactiveUsers: 0, suspendedUsers: 0, usersByRole: {} };
    }
  },

  getAllUsersList: async (role?: string): Promise<UserMockRecord[]> => {
    try {
      // Admins use /admin/users, others (PM) use /users/all
      const url = role === 'ADMIN' ? '/admin/users' : '/users/all';
      const res = await client.get<any>(url, { _skipRedirect: true } as any);
      
      // Handle the various response formats (data, data.data, data.content)
      const rawData = res.data?.data !== undefined ? res.data.data : res.data;
      
      if (Array.isArray(rawData)) return rawData;
      if (rawData?.content && Array.isArray(rawData.content)) return rawData.content;
      
      return [];
    } catch (error) {
      console.error('Error fetching users list:', error);
      return [];
    }
  }
};

export default analyticsService;
