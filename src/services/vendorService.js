import client from '../api/client';

// ── Type Definitions ──────────────────────────────
export const createContractResponse = (id, contractId, vendorId, contractTitle, description, startDate, endDate, value, status, projectId, projectName, createdAt) => ({
  id,
  contractId,
  vendorId,
  contractTitle,
  description,
  startDate,
  endDate,
  value,
  status,
  projectId,
  projectName,
  createdAt
});

export const createDocumentResponse = (id, documentId, vendorId, documentType, documentName, description, fileSize, contentType, uploadedBy, uploadedAt, submittedAt, status) => ({
  id,
  documentId,
  vendorId,
  documentType,
  documentName,
  description,
  fileSize,
  contentType,
  uploadedBy,
  uploadedAt,
  submittedAt,
  status
});

export const createInvoiceLineItem = (description, quantity, unitPrice, total) => ({
  description,
  quantity,
  unitPrice,
  total
});

export const createInvoiceResponse = (id, invoiceId, contractId, contractTitle, invoiceNumber, amount, dueDate, description, lineItems, submittedAt, status) => ({
  id,
  invoiceId,
  contractId,
  contractTitle,
  invoiceNumber,
  amount,
  dueDate,
  description,
  lineItems,
  submittedAt,
  status
});

export const createVendorTaskResponse = (id, taskId, vendorId, taskTitle, description, priority, status, dueDate, assignedAt, completedAt) => ({
  id,
  taskId,
  vendorId,
  taskTitle,
  description,
  priority,
  status,
  dueDate,
  assignedAt,
  completedAt
});

export const createVendorNotificationResponse = (id, notificationId, vendorId, title, message, type, isRead, createdAt) => ({
  id,
  notificationId,
  vendorId,
  title,
  message,
  type,
  isRead,
  createdAt
});

// ── Vendor Service ──────────────────────────────
const vendorService = {
  // Contracts
  getContracts: async (page = 0, size = 10, sortBy = 'contractId', sortDir = 'asc') => {
    const res = await client.get(`/api/contracts?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getContractById: async (id) => {
    const res = await client.get(`/api/contracts/${id}`);
    return res.data?.data || res.data;
  },
  getContractsByVendor: async (vendorId) => {
    const res = await client.get(`/api/contracts/vendor/${vendorId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  createContract: async (payload) => {
    const res = await client.post('/api/contracts', payload);
    return res.data?.data || res.data;
  },
  updateContract: async (id, payload) => {
    await client.put(`/api/contracts/${id}`, payload);
  },
  deleteContract: async (id) => {
    await client.delete(`/api/contracts/${id}`);
  },

  // Invoices
  getInvoices: async (page = 0, size = 10, sortBy = 'invoiceId', sortDir = 'asc') => {
    const res = await client.get(`/api/invoices?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getInvoicesByVendor: async (vendorId) => {
    const res = await client.get(`/api/invoices/vendor/${vendorId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getInvoicesByStatus: async (status) => {
    const res = await client.get(`/api/invoices/status/${status}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  createInvoice: async (payload) => {
    const res = await client.post('/api/invoices', payload);
    return res.data?.data || res.data;
  },
  updateInvoice: async (id, payload) => {
    await client.put(`/api/invoices/${id}`, payload);
  },
  deleteInvoice: async (id) => {
    await client.delete(`/api/invoices/${id}`);
  },
  submitInvoice: async (id) => {
    await client.post(`/api/invoices/${id}/submit`);
  },

  // Documents
  getDocuments: async (page = 0, size = 10, sortBy = 'documentId', sortDir = 'asc') => {
    const res = await client.get(`/api/documents?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    // Handle paginated response structure
    if (data && typeof data === 'object' && data.content) {
      return { content: Array.isArray(data.content) ? data.content : [], totalElements: data.totalElements || 0 };
    }
    return { content: Array.isArray(data) ? data : [], totalElements: Array.isArray(data) ? data.length : 0 };
  },
  getDocumentById: async (id) => {
    const res = await client.get(`/api/documents/${id}`);
    return res.data?.data || res.data;
  },
  getDocumentsByVendor: async (vendorId) => {
    const res = await client.get(`/api/documents/vendor/${vendorId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getDocumentsByType: async (type) => {
    const res = await client.get(`/api/documents/type/${type}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getDocumentsByStatus: async (status) => {
    const res = await client.get(`/api/documents/status/${status}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  uploadDocument: async (formData) => {
    const res = await client.post('/api/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data?.data || res.data;
  },
  updateDocument: async (id, formData) => {
    await client.put(`/api/documents/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteDocument: async (id) => {
    await client.delete(`/api/documents/${id}`);
  },
  downloadDocument: async (id) => {
    const res = await client.get(`/api/documents/${id}/download`, {
      responseType: 'blob'
    });
    return res.data;
  },
  submitDocument: async (id) => {
    await client.post(`/api/documents/${id}/submit`);
  },

  // Deliveries
  getDeliveries: async (page = 0, size = 10, sortBy = 'deliveryId', sortDir = 'asc') => {
    const res = await client.get(`/api/deliveries?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getDeliveryById: async (id) => {
    const res = await client.get(`/api/deliveries/${id}`);
    return res.data?.data || res.data;
  },
  getDeliveriesByVendor: async (vendorId) => {
    const res = await client.get(`/api/deliveries/vendor/${vendorId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getDeliveriesByStatus: async (status) => {
    const res = await client.get(`/api/deliveries/status/${status}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  createDelivery: async (payload) => {
    const res = await client.post('/api/deliveries', payload);
    return res.data?.data || res.data;
  },
  updateDelivery: async (id, payload) => {
    await client.put(`/api/deliveries/${id}`, payload);
  },
  deleteDelivery: async (id) => {
    await client.delete(`/api/deliveries/${id}`);
  },
  updateSiteDeliveryStatus: async (deliveryId, params) => {
    await client.post(`/api/deliveries/${deliveryId}/site-status`, params);
  },

  // Vendors
  getVendors: async () => {
    const res = await client.get('/api/vendors');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getVendorById: async (id) => {
    const res = await client.get(`/api/vendors/${id}`);
    return res.data?.data || res.data;
  },
  createVendor: async (payload) => {
    const res = await client.post('/api/vendors', payload);
    return res.data?.data || res.data;
  },
  updateVendor: async (id, payload) => {
    await client.put(`/api/vendors/${id}`, payload);
  },
  deleteVendor: async (id) => {
    await client.delete(`/api/vendors/${id}`);
  },

  // Vendor Tasks
  getTasks: async () => {
    const res = await client.get('/api/vendor/tasks');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getTasksByProject: async (projectId) => {
    const res = await client.get(`/api/vendor/tasks/project/${projectId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getTaskById: async (id) => {
    const res = await client.get(`/api/vendor/tasks/${id}`);
    return res.data?.data || res.data;
  },
  createTask: async (payload) => {
    const res = await client.post('/api/vendor/tasks', payload);
    return res.data?.data || res.data;
  },
  updateTask: async (id, payload) => {
    await client.put(`/api/vendor/tasks/${id}`, payload);
  },
  deleteTask: async (id) => {
    await client.delete(`/api/vendor/tasks/${id}`);
  },

  // Vendor Notifications
  getNotifications: async () => {
    const res = await client.get('/api/vendor-notifications');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getNotificationById: async (id) => {
    const res = await client.get(`/api/vendor-notifications/${id}`);
    return res.data?.data || res.data;
  },
  markAsRead: async (id) => {
    await client.put(`/api/vendor-notifications/${id}/read`);
  },
  markAllAsRead: async () => {
    await client.put('/api/vendor-notifications/read-all');
  },

  // Vendor Integration
  syncWithERP: async () => {
    const res = await client.post('/api/vendor-integration/sync');
    return res.data?.data || res.data;
  },
  getIntegrationStatus: async () => {
    const res = await client.get('/api/vendor-integration/status');
    return res.data?.data || res.data;
  }
};

export default vendorService;
export { 
  createContractResponse, 
  createDocumentResponse, 
  createInvoiceLineItem, 
  createInvoiceResponse, 
  createVendorTaskResponse, 
  createVendorNotificationResponse 
};
