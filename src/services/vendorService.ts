import client from '../api/client';

// ── Types ──────────────────────────────────────

export interface ContractResponse {
  id: string;
  contractId: string;
  vendorId: string;
  contractTitle: string;
  description: string;
  startDate: string;
  endDate: string;
  value: number;
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'DRAFT';
  projectId: string;
  projectName: string;
  createdAt: string;
}

export interface DocumentResponse {
  id: string;
  documentId: string;
  vendorId: string;
  documentType: string;
  documentName: string;
  description: string;
  fileSize: number;
  contentType: string;
  uploadedBy: string;
  uploadedAt: string;
  submittedAt: string | null;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceResponse {
  id: string;
  invoiceId: string;
  contractId: string;
  contractTitle: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  description: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';
  submittedAt: string | null;
  lineItems: InvoiceLineItem[];
}

export interface DeliveryItem { description: string; quantity: number; unit: string; }

export interface DeliveryResponse {
  id: string;
  deliveryId: string;
  contractId: string;
  contractTitle: string;
  deliveryDate: string;
  estimatedArrival: string;
  actualArrival: string | null;
  status: 'PENDING' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED';
  items: DeliveryItem[];
  deliveryAddress: string;
  notes: string;
}

export interface VendorTaskResponse {
  assignedTaskId: string;
  projectId: string;
  projectName: string;
  taskDescription: string;
  assignedByName: string;
  assignedAt: string;
  status: 'PENDING' | 'SUBMITTED' | 'COMPLETED' | 'REJECTED';
  submissionDescription: string | null;
}

export interface VendorKpi {
  activeContracts: number;
  pendingDocuments: number;
  submittedInvoices: number;
  assignedTasks: number;
  totalContractValue: number;
}

// ── Service ────────────────────────────────────

const vendorService = {
  // Contracts
  getContracts: async (page = 0, size = 10, sortBy = 'contractId', sortDir = 'asc'): Promise<any> => {
    const res = await client.get<any>(`/api/contracts?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getContractById: async (id: string): Promise<ContractResponse> => {
    const res = await client.get<any>(`/api/contracts/${id}`);
    return res.data?.data || res.data;
  },
  getContractsByVendor: async (vendorId: string): Promise<ContractResponse[]> => {
    const res = await client.get<any>(`/api/contracts/vendor/${vendorId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getContractsByStatus: async (status: string): Promise<ContractResponse[]> => {
    const res = await client.get<any>(`/api/contracts/status/${status}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  createContract: async (payload: Partial<ContractResponse>): Promise<ContractResponse> => {
    const res = await client.post<any>('/api/contracts', payload);
    return res.data?.data || res.data;
  },
  updateContract: async (id: string, payload: Partial<ContractResponse>): Promise<void> => {
    await client.put(`/api/contracts/${id}`, payload);
  },
  deleteContract: async (id: string): Promise<void> => {
    await client.delete(`/api/contracts/${id}`);
  },

  // Invoices
  getInvoices: async (page = 0, size = 10, sortBy = 'invoiceId', sortDir = 'asc'): Promise<any> => {
    const res = await client.get<any>(`/api/invoices?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getInvoiceById: async (id: string): Promise<InvoiceResponse> => {
    const res = await client.get<any>(`/api/invoices/${id}`);
    return res.data?.data || res.data;
  },
  getInvoicesByContract: async (contractId: string): Promise<InvoiceResponse[]> => {
    const res = await client.get<any>(`/api/invoices/contract/${contractId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getInvoicesByStatus: async (status: string): Promise<InvoiceResponse[]> => {
    const res = await client.get<any>(`/api/invoices/status/${status}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  createInvoice: async (payload: Partial<InvoiceResponse>): Promise<InvoiceResponse> => {
    const res = await client.post<any>('/api/invoices', payload);
    return res.data?.data || res.data;
  },
  updateInvoice: async (id: string, payload: Partial<InvoiceResponse>): Promise<void> => {
    await client.put(`/api/invoices/${id}`, payload);
  },
  deleteInvoice: async (id: string): Promise<void> => {
    await client.delete(`/api/invoices/${id}`);
  },
  submitInvoice: async (id: string): Promise<void> => {
    await client.post(`/api/invoices/${id}/submit`);
  },
  getInvoiceStatus: async (id: string): Promise<string> => {
    const res = await client.get<any>(`/api/invoices/${id}/status`);
    return res.data?.data || res.data;
  },

  // Vendor Approval (PM) - PM review and approval of vendor invoices
  getPendingInvoices: async (): Promise<InvoiceResponse[]> => {
    const res = await client.get<any>('/api/vendor/invoices/pending');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  rejectInvoice: async (approvalId: string, rejectionReason: string): Promise<void> => {
    await client.post(`/api/vendor/invoices/${approvalId}/reject?rejectionReason=${rejectionReason}`);
  },
  approveInvoice: async (approvalId: string): Promise<void> => {
    await client.post(`/api/vendor/invoices/${approvalId}/approve`);
  },

  // Deliveries
  getDeliveries: async (page = 0, size = 10, sortBy = 'deliveryId', sortDir = 'asc'): Promise<any> => {
    const res = await client.get<any>(`/api/deliveries?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    return data;
  },
  getDeliveryById: async (id: string): Promise<DeliveryResponse> => {
    const res = await client.get<any>(`/api/deliveries/${id}`);
    return res.data?.data || res.data;
  },
  getDeliveriesByContract: async (contractId: string): Promise<DeliveryResponse[]> => {
    const res = await client.get<any>(`/api/deliveries/contract/${contractId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getDeliveriesByStatus: async (status: string): Promise<DeliveryResponse[]> => {
    const res = await client.get<any>(`/api/deliveries/status/${status}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  createDelivery: async (payload: Partial<DeliveryResponse>): Promise<DeliveryResponse> => {
    const res = await client.post<any>('/api/deliveries', payload);
    return res.data?.data || res.data;
  },
  updateDelivery: async (id: string, payload: Partial<DeliveryResponse>): Promise<void> => {
    await client.put(`/api/deliveries/${id}`, payload);
  },
  deleteDelivery: async (id: string): Promise<void> => {
    await client.delete(`/api/deliveries/${id}`);
  },

  // Documents
  getDocuments: async (page = 0, size = 10, sortBy = 'documentId', sortDir = 'asc'): Promise<any> => {
    const res = await client.get<any>(`/api/documents?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return { content: data, totalElements: data.length };
    // Handle paginated response structure
    if (data && typeof data === 'object' && data.content) {
      return { content: Array.isArray(data.content) ? data.content : [], totalElements: data.totalElements || 0 };
    }
    return { content: Array.isArray(data) ? data : [], totalElements: Array.isArray(data) ? data.length : 0 };
  },
  getDocumentById: async (id: string): Promise<DocumentResponse> => {
    const res = await client.get<any>(`/api/documents/${id}`);
    return res.data?.data || res.data;
  },
  getDocumentsByVendor: async (vendorId: string): Promise<DocumentResponse[]> => {
    const res = await client.get<any>(`/api/documents/vendor/${vendorId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getDocumentsByType: async (type: string): Promise<DocumentResponse[]> => {
    const res = await client.get<any>(`/api/documents/type/${type}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getDocumentsByStatus: async (status: string): Promise<DocumentResponse[]> => {
    const res = await client.get<any>(`/api/documents/status/${status}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  uploadDocument: async (formData: FormData): Promise<DocumentResponse> => {
    const res = await client.post<any>('/api/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data?.data || res.data;
  },
  updateDocument: async (id: string, formData: FormData): Promise<void> => {
    await client.put(`/api/documents/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  downloadDocument: async (id: string): Promise<Blob> => {
    const res = await client.get(`/api/documents/${id}/download`, { responseType: 'blob' });
    return res.data;
  },
  deleteDocument: async (id: string): Promise<void> => {
    await client.delete(`/api/documents/${id}`);
  },
  submitDocument: async (id: string): Promise<void> => {
    await client.post(`/api/documents/${id}/submit`);
  },

  // Vendors
  getVendors: async (): Promise<any[]> => {
    const res = await client.get<any>('/api/vendors');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getVendorById: async (id: string): Promise<any> => {
    const res = await client.get<any>(`/api/vendors/${id}`);
    return res.data?.data || res.data;
  },
  createVendor: async (payload: any): Promise<any> => {
    const res = await client.post<any>('/api/vendors', payload);
    return res.data?.data || res.data;
  },
  updateVendor: async (id: string, payload: any): Promise<void> => {
    await client.put(`/api/vendors/${id}`, payload);
  },
  deleteVendor: async (id: string): Promise<void> => {
    await client.delete(`/api/vendors/${id}`);
  },

  // Vendor Tasks
  getTasks: async (): Promise<VendorTaskResponse[]> => {
    const res = await client.get<any>('/api/vendor/tasks');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getTasksByProject: async (projectId: string): Promise<VendorTaskResponse[]> => {
    const res = await client.get<any>(`/api/vendor/tasks/project/${projectId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  submitTask: async (assignedTaskId: string, payload: any): Promise<void> => {
    await client.post(`/api/vendor/tasks/${assignedTaskId}/submit`, payload);
  },
  syncTasks: async (config?: any): Promise<{ message: string }> => {
    await client.post('/api/vendor/tasks/sync', {}, config);
    return { message: 'Tasks synchronized successfully.' };
  },

  // KPI
  getKpi: async (): Promise<VendorKpi> => {
    try {
      const res = await client.get<any>('/api/vendor/kpi');
      return res.data?.data || res.data;
    } catch {
      return { activeContracts: 0, pendingDocuments: 0, submittedInvoices: 0, assignedTasks: 0, totalContractValue: 0 };
    }
  },

  // Vendor Notifications
  getNotifications: async (): Promise<any[]> => {
    const res = await client.get<any>('/api/vendor-notifications');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  markRead: async (id: string): Promise<void> => {
    await client.patch(`/api/vendor-notifications/${id}/read`);
  },
  markAllRead: async (): Promise<void> => {
    await client.post('/api/vendor-notifications/read-all');
  },

  // Vendor Integration (Internal)
  syncFromPm: async (): Promise<void> => {
    await client.post('/api/vendor-integration/sync-from-pm');
  },
  updateApprovalStatus: async (approvalId: string, params: { status: string; rejectedBy: string; approvedByName: string; rejectionReason: string }): Promise<void> => {
    await client.put(`/api/vendor-integration/approvals/${approvalId}/status`, null, { params });
  },
  getTasksByProjectIntegration: async (projectId: string): Promise<any[]> => {
    const res = await client.get<any>(`/api/vendor-integration/projects/${projectId}/tasks`);
    return res.data?.data || res.data;
  },
  notifyVendorTask: async (payload: { vendorId: string; taskId: string; projectId: string; description: string; plannedStart: string; plannedEnd: string; assignedDepartment: string }): Promise<void> => {
    await client.post('/api/vendor-integration/tasks/notify', null, { params: payload });
  },
  syncDeliveryFromSite: async (deliveryId: string): Promise<void> => {
    await client.post(`/api/vendor-integration/deliveries/${deliveryId}/sync-from-site`);
  },
  updateSiteDeliveryStatus: async (deliveryId: string, params: { status: string; remarks: string }): Promise<void> => {
    await client.patch(`/api/vendor-integration/deliveries/${deliveryId}/site-status`, null, { params });
  }
};

export default vendorService;
