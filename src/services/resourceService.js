import client from '../api/client';

export const resourceService = {
  // Resource Management
  getResources: () =>
    client.get('/resources').then(r => r.data?.data || r.data),

  getResourceById: (resourceId) =>
    client.get(`/resources/${resourceId}`).then(r => r.data?.data || r.data),

  createResource: (resourceData) =>
    client.post('/resources', resourceData).then(r => r.data?.data || r.data),

  updateResource: (resourceId, resourceData) =>
    client.put(`/resources/${resourceId}`, resourceData).then(r => r.data?.data || r.data),

  deleteResource: (resourceId) =>
    client.delete(`/resources/${resourceId}`).then(r => r.data?.data || r.data),

  // Resource Categories
  getResourceCategories: () =>
    client.get('/resources/categories').then(r => r.data?.data || r.data),

  createResourceCategory: (categoryData) =>
    client.post('/resources/categories', categoryData).then(r => r.data?.data || r.data),

  updateResourceCategory: (categoryId, categoryData) =>
    client.put(`/resources/categories/${categoryId}`, categoryData).then(r => r.data?.data || r.data),

  deleteResourceCategory: (categoryId) =>
    client.delete(`/resources/categories/${categoryId}`).then(r => r.data?.data || r.data),

  // Resource Allocation
  getResourceAllocations: () =>
    client.get('/resources/allocations').then(r => r.data?.data || r.data),

  allocateResource: (allocationData) =>
    client.post('/resources/allocations', allocationData).then(r => r.data?.data || r.data),

  updateAllocation: (allocationId, allocationData) =>
    client.put(`/resources/allocations/${allocationId}`, allocationData).then(r => r.data?.data || r.data),

  deleteAllocation: (allocationId) =>
    client.delete(`/resources/allocations/${allocationId}`).then(r => r.data?.data || r.data),

  // Resource Availability
  checkAvailability: (resourceId, startDate, endDate) =>
    client.get(`/resources/${resourceId}/availability?startDate=${startDate}&endDate=${endDate}`).then(r => r.data?.data || r.data),

  // Resource Utilization
  getUtilizationReport: (timeRange = '30d') =>
    client.get(`/resources/utilization?range=${timeRange}`).then(r => r.data?.data || r.data),

  // Resource Inventory
  getInventory: () =>
    client.get('/resources/inventory').then(r => r.data?.data || r.data),

  updateInventory: (resourceId, quantity) =>
    client.put(`/resources/inventory/${resourceId}`, { quantity }).then(r => r.data?.data || r.data),

  // Resource Requests
  getResourceRequests: () =>
    client.get('/resources/requests').then(r => r.data?.data || r.data),

  createResourceRequest: (requestData) =>
    client.post('/resources/requests', requestData).then(r => r.data?.data || r.data),

  updateResourceRequest: (requestId, requestData) =>
    client.put(`/resources/requests/${requestId}`, requestData).then(r => r.data?.data || r.data),

  deleteResourceRequest: (requestId) =>
    client.delete(`/resources/requests/${requestId}`).then(r => r.data?.data || r.data),

  // Resource Analytics
  getResourceAnalytics: (timeRange = '30d') =>
    client.get(`/resources/analytics?range=${timeRange}`).then(r => r.data?.data || r.data),

  // Resource Search
  searchResources: (query, filters) =>
    client.post('/resources/search', { query, ...filters }).then(r => r.data?.data || r.data),

  // Resource Export
  exportResources: (format = 'csv', filters) =>
    client.post('/resources/export', { format, ...filters }).then(r => r.data?.data || r.data),

  // Resource Import
  importResources: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post('/resources/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data?.data || r.data);
  }
};
