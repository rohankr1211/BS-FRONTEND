import client from '../api/client';

export const financeService = {
  // Budget Management
  getBudgets: () =>
    client.get('/finance/budgets').then(r => r.data?.data || r.data),

  createBudget: (budgetData) =>
    client.post('/finance/budgets', budgetData).then(r => r.data?.data || r.data),

  updateBudget: (budgetId, budgetData) =>
    client.put(`/finance/budgets/${budgetId}`, budgetData).then(r => r.data?.data || r.data),

  deleteBudget: (budgetId) =>
    client.delete(`/finance/budgets/${budgetId}`).then(r => r.data?.data || r.data),

  // Expense Management
  getExpenses: () =>
    client.get('/finance/expenses').then(r => r.data?.data || r.data),

  createExpense: (expenseData) =>
    client.post('/finance/expenses', expenseData).then(r => r.data?.data || r.data),

  updateExpense: (expenseId, expenseData) =>
    client.put(`/finance/expenses/${expenseId}`, expenseData).then(r => r.data?.data || r.data),

  deleteExpense: (expenseId) =>
    client.delete(`/finance/expenses/${expenseId}`).then(r => r.data?.data || r.data),

  // Payment Management
  getPayments: () =>
    client.get('/finance/payments').then(r => r.data?.data || r.data),

  createPayment: (paymentData) =>
    client.post('/finance/payments', paymentData).then(r => r.data?.data || r.data),

  updatePayment: (paymentId, paymentData) =>
    client.put(`/finance/payments/${paymentId}`, paymentData).then(r => r.data?.data || r.data),

  deletePayment: (paymentId) =>
    client.delete(`/finance/payments/${paymentId}`).then(r => r.data?.data || r.data),

  // Invoice Management
  getInvoices: () =>
    client.get('/finance/invoices').then(r => r.data?.data || r.data),

  approveInvoice: (invoiceId) =>
    client.post(`/finance/invoices/${invoiceId}/approve`).then(r => r.data?.data || r.data),

  rejectInvoice: (invoiceId) =>
    client.post(`/finance/invoices/${invoiceId}/reject`).then(r => r.data?.data || r.data),

  // Financial Reports
  getFinancialReports: () =>
    client.get('/finance/reports').then(r => r.data?.data || r.data),

  // Dashboard Data
  getDashboardData: () =>
    client.get('/finance/dashboard').then(r => r.data?.data || r.data),

  // Financial Analytics
  getFinancialAnalytics: (timeRange = '30d') =>
    client.get(`/finance/analytics?range=${timeRange}`).then(r => r.data?.data || r.data),

  // Budget Tracking
  getBudgetTracking: () =>
    client.get('/finance/budget-tracking').then(r => r.data?.data || r.data),

  // Expense Categories
  getExpenseCategories: () =>
    client.get('/finance/expense-categories').then(r => r.data?.data || r.data),

  // Payment Methods
  getPaymentMethods: () =>
    client.get('/finance/payment-methods').then(r => r.data?.data || r.data)
};
