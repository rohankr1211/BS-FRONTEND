import client from '../api/client';

// ── Types ──────────────────────────────────────

export interface DashboardSummaryRecord {
  activeProjects: number;
  averageBudgetVariance: number;
  safetyComplianceRate: number;
  resourceUtilization: number;
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
    const res = await client.get<any>(`/api/reporting/overview?projectId=${projectId || ''}`);
    return res.data?.data || res.data;
  },

  getProjectProgressTrends: async (projectId?: string): Promise<ProjectTrendRecord[]> => {
    const res = await client.get<any>(`/api/reporting/project-status?projectId=${projectId || ''}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },

  getAllProjectHealth: async (): Promise<ProjectHealthRecord[]> => {
    const res = await client.get<any>('/api/reporting/project-health');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },

  getSafetyComplianceBreakdown: async (projectId?: string): Promise<SafetyComplianceRecord[]> => {
    const res = await client.get<any>(`/api/reporting/safety-metrics?projectId=${projectId || ''}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },

  // 2. Report Generation & History
  generateReport: async (scope: string, targetId?: string): Promise<ReportResponseRecord> => {
    const res = await client.post<any>('/api/reporting/reports/generate', { scope, targetId });
    return res.data?.data || res.data;
  },

  getReportHistory: async (scope: string): Promise<HistoricalReportRecord[]> => {
    const res = await client.get<any>(`/api/reporting/reports/history?scope=${scope}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },

  // 3. Project Analytics
  getProjectSummaries: async (): Promise<ProjectSummaryRecord[]> => {
    const res = await client.get<any>('/api/reporting/projects/summary');
    return res.data?.data || res.data;
  },

  getProjectBudgetAlerts: async (projectId: string): Promise<BudgetAlertRecord[]> => {
    const res = await client.get<any>(`/api/reporting/budget-vs-actual?projectId=${projectId}`);
    return res.data?.data || res.data;
  },

  getProjectCashFlow: async (projectId: string): Promise<CashFlowRecord[]> => {
    const res = await client.get<any>(`/api/reporting/cash-flow?projectId=${projectId}`);
    return res.data?.data || res.data;
  },

  // 4. Vendor Analytics
  getVendorPerformance: async (vendorId?: string): Promise<VendorPerformanceRecord[]> => {
    const res = await client.get<any>(`/api/reporting/vendor-performance?vendorId=${vendorId || ''}`);
    return res.data?.data || res.data;
  },

  getVendorCompliance: async (): Promise<VendorComplianceRecord> => {
    const res = await client.get<any>('/api/reporting/vendor-compliance');
    return res.data?.data || res.data;
  },

  // 5. Site Engineer Analytics
  getSiteEngineerPerformance: async (): Promise<SiteEngineerPerformanceRecord[]> => {
    const res = await client.get<any>('/api/reporting/site-engineer-performance');
    return res.data?.data || res.data;
  },

  getSiteProgressSummary: async (): Promise<SiteProgressSummaryRecord> => {
    const res = await client.get<any>('/api/reporting/site-progress');
    return res.data?.data || res.data;
  },

  getSiteEngineerDailyLogs: async (): Promise<SiteEngineerDailyLogRecord[]> => {
    const res = await client.get<any>('/api/reporting/site-daily-logs');
    return res.data?.data || res.data;
  },

  // 6. Safety Analytics
  getSafetyTrends: async (projectId?: string): Promise<SafetyTrendRecord[]> => {
    const res = await client.get<any>(`/api/reporting/safety-trends?projectId=${projectId || ''}`);
    return res.data?.data || res.data;
  },

  getSafetyInspectionSummary: async (projectId?: string): Promise<SafetyInspectionSummaryRecord> => {
    const res = await client.get<any>(`/api/reporting/safety-metrics?projectId=${projectId || ''}`);
    return res.data?.data || res.data;
  },

  // 7. Resource Analytics
  getResourceUtilization: async (projectId?: string): Promise<ResourceUtilizationRecord> => {
    const res = await client.get<any>(`/api/reporting/resource-utilization?projectId=${projectId || ''}`);
    return res.data?.data || res.data;
  },

  getLaborAllocation: async (projectId?: string): Promise<LaborAllocationRecord[]> => {
    const res = await client.get<any>(`/api/reporting/labor-allocation?projectId=${projectId || ''}`);
    return res.data?.data || res.data;
  },

  // 8. User Analytics
  getUserAnalyticsSummary: async (): Promise<UserAnalyticsRecord> => {
    const res = await client.get<any>('/api/reporting/user-summary');
    return res.data?.data || res.data;
  },

  getAllUsersList: async (): Promise<UserMockRecord[]> => {
    const res = await client.get<any>('/api/reporting/users-list');
    return res.data?.data || res.data;
  }
};

export default analyticsService;
