import client from '../api/client';

export const notificationService = {
  // Get Notifications
  getNotifications: () =>
    client.get('/notifications').then(r => r.data?.data || r.data),

  getNotificationById: (notificationId) =>
    client.get(`/notifications/${notificationId}`).then(r => r.data?.data || r.data),

  // Create Notification
  createNotification: (notificationData) =>
    client.post('/notifications', notificationData).then(r => r.data?.data || r.data),

  // Update Notification
  updateNotification: (notificationId, notificationData) =>
    client.put(`/notifications/${notificationId}`, notificationData).then(r => r.data?.data || r.data),

  // Delete Notification
  deleteNotification: (notificationId) =>
    client.delete(`/notifications/${notificationId}`).then(r => r.data?.data || r.data),

  // Mark as Read
  markAsRead: (notificationId) =>
    client.put(`/notifications/${notificationId}/read`).then(r => r.data?.data || r.data),

  // Mark All as Read
  markAllAsRead: () =>
    client.put('/notifications/read-all').then(r => r.data?.data || r.data),

  // Get Notification Preferences
  getPreferences: () =>
    client.get('/notifications/preferences').then(r => r.data?.data || r.data),

  // Update Notification Preferences
  updatePreferences: (preferences) =>
    client.put('/notifications/preferences', preferences).then(r => r.data?.data || r.data),

  // Get Unread Count
  getUnreadCount: () =>
    client.get('/notifications/unread-count').then(r => r.data?.data || r.data),

  // Search Notifications
  searchNotifications: (query, filters) =>
    client.post('/notifications/search', { query, ...filters }).then(r => r.data?.data || r.data),

  // Filter Notifications
  filterNotifications: (filters) =>
    client.post('/notifications/filter', filters).then(r => r.data?.data || r.data),

  // Get Notification Types
  getNotificationTypes: () =>
    client.get('/notifications/types').then(r => r.data?.data || r.data),

  // Get Notification Settings
  getSettings: () =>
    client.get('/notifications/settings').then(r => r.data?.data || r.data),

  // Update Notification Settings
  updateSettings: (settings) =>
    client.put('/notifications/settings', settings).then(r => r.data?.data || r.data),

  // Push Notification Settings
  updatePushSettings: (pushSettings) =>
    client.put('/notifications/push-settings', pushSettings).then(r => r.data?.data || r.data),

  // Test Push Notification
  testPushNotification: (testData) =>
    client.post('/notifications/test-push', testData).then(r => r.data?.data || r.data),

  // Get Notification History
  getHistory: (page = 0, size = 20) =>
    client.get(`/notifications/history?page=${page}&size=${size}`).then(r => r.data?.data || r.data),

  // Export Notifications
  exportNotifications: (format = 'csv', filters) =>
    client.post('/notifications/export', { format, ...filters }).then(r => r.data?.data || r.data),

  // Delete All Notifications
  deleteAllNotifications: () =>
    client.delete('/notifications/delete-all').then(r => r.data?.data || r.data),

  // Get Notification Statistics
  getStatistics: (timeRange = '30d') =>
    client.get(`/notifications/statistics?range=${timeRange}`).then(r => r.data?.data || r.data)
};
