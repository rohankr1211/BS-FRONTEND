import client from '../api/client';

// ── Types ──────────────────────────────────────

export interface BudgetResponse {
  budgetId: string;
  projectId: string;
  projectName: string;
  budgetCategory: 'LABOR' | 'MATERIALS' | 'EQUIPMENT' | 'OVERHEAD' | 'CONTINGENCY';
  plannedAmount: number;
  actualAmount: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface ExpenseResponse {
  expenseId: string;
  projectId: string;
  budgetId: string;
  expenseType: string;
  description: string;
  amount: number;
  expenseDate: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdByName: string;
}

export interface PaymentResponse {
  paymentId: string;
  expenseId: string;
  paymentMethod: 'BANK_TRANSFER' | 'CASH' | 'CHECK' | 'ONLINE';
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED' | 'CANCELLED';
  vendorId: string;
  vendorName: string;
  referenceNumber: string;
}

export interface FinanceTaskResponse {
  assignedTaskId: string;
  projectId: string;
  projectName: string;
  taskDescription: string;
  assignedByName: string;
  assignedAt: string;
  status: 'PENDING' | 'SUBMITTED' | 'COMPLETED' | 'REJECTED';
}

export interface FinanceKpi {
  totalBudget: number;
  totalExpenses: number;
  budgetUtilization: number;
  pendingApprovals: number;
}

// ── Service ────────────────────────────────────

export const financeService = {
  // Budgets
  getBudgets: async (): Promise<BudgetResponse[]> => {
    const res = await client.get<any>('/api/budgets/status/APPROVED?page=0&size=100');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getBudgetById: async (id: string): Promise<BudgetResponse> => {
    const res = await client.get<any>(`/api/budgets/${id}`);
    return res.data?.data || res.data;
  },
  getBudgetsByProject: async (projectId: string, page = 0, size = 10): Promise<any> => {
    const res = await client.get<any>(`/api/budgets/projects/${projectId}?page=${page}&size=${size}&sortBy=createdAt&sortOrder=DESC`);
    return res.data?.data || res.data;
  },
  createBudget: async (payload: Partial<BudgetResponse>): Promise<BudgetResponse> => {
    const res = await client.post<any>('/api/budgets', payload);
    return res.data?.data || res.data;
  },
  updateBudget: async (id: string, payload: Partial<BudgetResponse>): Promise<void> => {
    await client.patch(`/api/budgets/${id}`, payload);
  },
  deleteBudget: async (id: string): Promise<void> => {
    await client.delete(`/api/budgets/${id}`);
  },
  submitBudget: async (id: string): Promise<void> => {
    await client.post(`/api/budgets/${id}/submit`);
  },
  approveBudget: async (id: string): Promise<void> => {
    await client.post(`/api/budgets/${id}/approval`);
  },

  // Expenses
  getExpenses: async (): Promise<ExpenseResponse[]> => {
    const res = await client.get<any>('/api/expenses/status/APPROVED?page=0&size=100');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getExpenseById: async (id: string): Promise<ExpenseResponse> => {
    const res = await client.get<any>(`/api/expenses/${id}`);
    return res.data?.data || res.data;
  },
  getExpensesByBudget: async (budgetId: string, page = 0, size = 10): Promise<any> => {
    const res = await client.get<any>(`/api/expenses/budgets/${budgetId}?page=${page}&size=${size}&sortBy=createdAt&sortOrder=DESC`);
    return res.data?.data || res.data;
  },
  getExpensesByProject: async (projectId: string, page = 0, size = 10): Promise<any> => {
    const res = await client.get<any>(`/api/expenses/projects/${projectId}?page=${page}&size=${size}&sortBy=createdAt&sortOrder=DESC`);
    return res.data?.data || res.data;
  },
  createExpense: async (payload: Partial<ExpenseResponse>): Promise<ExpenseResponse> => {
    const res = await client.post<any>('/api/expenses', payload);
    return res.data?.data || res.data;
  },
  updateExpense: async (id: string, payload: Partial<ExpenseResponse>): Promise<void> => {
    await client.patch(`/api/expenses/${id}`, payload);
  },
  deleteExpense: async (id: string): Promise<void> => {
    await client.delete(`/api/expenses/${id}`);
  },
  submitExpense: async (id: string): Promise<void> => {
    await client.post(`/api/expenses/${id}/submit`);
  },
  approveExpense: async (id: string): Promise<void> => {
    await client.post(`/api/expenses/${id}/approval`);
  },

  // Payments
  getPayments: async (): Promise<PaymentResponse[]> => {
    const res = await client.get<any>('/api/payments/status/PROCESSED?page=0&size=100');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getPaymentById: async (id: string): Promise<PaymentResponse> => {
    const res = await client.get<any>(`/api/payments/${id}`);
    return res.data?.data || res.data;
  },
  getPaymentsByExpense: async (expenseId: string, page = 0, size = 10): Promise<any> => {
    const res = await client.get<any>(`/api/payments/expenses/${expenseId}?page=${page}&size=${size}&sortBy=createdAt&sortOrder=DESC`);
    return res.data?.data || res.data;
  },
  createPayment: async (payload: Partial<PaymentResponse>): Promise<PaymentResponse> => {
    const res = await client.post<any>('/api/payments', payload);
    return res.data?.data || res.data;
  },
  updatePaymentStatus: async (id: string): Promise<void> => {
    await client.post(`/api/payments/${id}/status`);
  },
  getPendingPayments: async (page = 0, size = 10): Promise<any> => {
    const res = await client.get<any>(`/api/payments/pending?page=${page}&size=${size}&sortBy=createdAt&sortOrder=DESC`);
    return res.data?.data || res.data;
  },

  // Finance Tasks
  getTasks: async (): Promise<FinanceTaskResponse[]> => {
    const res = await client.get<any>('/api/finance/tasks');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  getTasksByProject: async (projectId: string): Promise<FinanceTaskResponse[]> => {
    const res = await client.get<any>(`/api/finance/tasks/project/${projectId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  submitTask: async (id: string): Promise<void> => {
    await client.post(`/api/finance/tasks/${id}/submit`);
  },
  syncTasks: async (): Promise<{ message: string }> => {
    await client.post('/api/finance/tasks/sync');
    return { message: 'Tasks synchronized successfully.' };
  },

  // Internal / Helper
  getResourceBudgetStatus: async (projectId: string, resourceId: string): Promise<any> => {
    const res = await client.get<any>(`/api/finance/budget/status?projectId=${projectId}&resourceId=${resourceId}`);
    return res.data?.data || res.data;
  },
  requestResourceBudget: async (payload: any): Promise<void> => {
    await client.post('/api/finance/budget/resource-request', payload);
  },

  // KPI
  getKpi: async (): Promise<FinanceKpi> => {
    try {
      const res = await client.get<any>('/api/finance/kpi');
      return res.data?.data || res.data;
    } catch {
      return { totalBudget: 0, totalExpenses: 0, budgetUtilization: 0, pendingApprovals: 0 };
    }
  },

  // Notifications
  getNotifications: async (): Promise<any[]> => {
    const res = await client.get<any>('/api/finance/notifications');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : (data?.content || []);
  },
  markRead: async (id: string): Promise<void> => {
    await client.patch(`/api/finance/notifications/${id}/read`);
  },
  markAllRead: async (): Promise<void> => {
    await client.post('/api/finance/notifications/read-all');
  }
};
