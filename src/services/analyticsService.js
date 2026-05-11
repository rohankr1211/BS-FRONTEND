import client from '../api/client';

export const analyticsService = {
  // User Analytics
  getUserAnalyticsSummary: () =>
    client.get('/analytics/users').then(r => r.data?.data || r.data),

  // Project Analytics
  getProjectAnalytics: () =>
    client.get('/analytics/projects').then(r => r.data?.data || r.data),

  // Safety Analytics
  getSafetyAnalytics: () =>
    client.get('/analytics/safety').then(r => r.data?.data || r.data),

  // Vendor Analytics
  getVendorAnalytics: () =>
    client.get('/analytics/vendors').then(r => r.data?.data || r.data),

  // Resource Analytics
  getResourceAnalytics: () =>
    client.get('/analytics/resources').then(r => r.data?.data || r.data),

  // Site Engineer Analytics
  getSiteEngineerAnalytics: () =>
    client.get('/analytics/site-engineers').then(r => r.data?.data || r.data),

  // Finance Analytics
  getFinanceAnalytics: () =>
    client.get('/analytics/finance').then(r => r.data?.data || r.data),

  // System Health
  getSystemHealth: () =>
    client.get('/analytics/system-health').then(r => r.data?.data || r.data),

  // Activity Trends
  getActivityTrends: (timeRange = '7d') =>
    client.get(`/analytics/activity-trends?range=${timeRange}`).then(r => r.data?.data || r.data),

  // Performance Metrics
  getPerformanceMetrics: () =>
    client.get('/analytics/performance-metrics').then(r => r.data?.data || r.data),

  // Dashboard Overview
  getDashboardOverview: () =>
    client.get('/analytics/dashboard-overview').then(r => r.data?.data || r.data)
};
