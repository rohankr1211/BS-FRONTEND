// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    GET_PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    ENABLE_2FA: '/auth/enable-2fa',
    DISABLE_2FA: '/auth/disable-2fa',
    VERIFY_2FA: '/auth/verify-2fa',
    GET_SESSIONS: '/auth/sessions',
    REVOKE_SESSION: '/auth/sessions/{sessionId}',
    REVOKE_ALL_SESSIONS: '/auth/sessions',
    GET_SECURITY_SETTINGS: '/auth/security-settings',
    UPDATE_SECURITY_SETTINGS: '/auth/security-settings',
    GET_ACCOUNT_STATUS: '/auth/account-status',
    GET_PREFERENCES: '/auth/preferences',
    UPDATE_PREFERENCES: '/auth/preferences',
    DELETE_ACCOUNT: '/auth/account'
  },
  
  ADMIN: {
    GET_PENDING_USERS: '/admin/pending-users',
    APPROVE_USER: '/admin/approve-user/{userId}',
    REJECT_USER: '/admin/reject-user/{userId}',
    GET_ALL_USERS: '/admin/users',
    GET_AUDIT_LOGS: '/admin/audit-logs',
    GET_SYSTEM_HEALTH: '/admin/system-health',
    GET_USER_STATS: '/admin/user-stats',
    GET_ACTIVITY_SUMMARY: '/admin/activity-summary'
  },
  
  PROJECTS: {
    GET_PROJECTS: '/projects',
    GET_PROJECT: '/projects/{projectId}',
    CREATE_PROJECT: '/projects',
    UPDATE_PROJECT: '/projects/{projectId}',
    DELETE_PROJECT: '/projects/{projectId}',
    GET_MILESTONES: '/projects/{projectId}/milestones',
    CREATE_MILESTONE: '/projects/{projectId}/milestones',
    UPDATE_MILESTONE: '/projects/{projectId}/milestones/{milestoneId}',
    DELETE_MILESTONE: '/projects/{projectId}/milestones/{milestoneId}',
    GET_TASKS: '/projects/{projectId}/tasks',
    CREATE_TASK: '/projects/{projectId}/tasks',
    UPDATE_TASK: '/projects/{projectId}/tasks/{taskId}',
    DELETE_TASK: '/projects/{projectId}/tasks/{taskId}',
    GET_TEMPLATES: '/templates',
    GET_TEMPLATE: '/templates/{templateId}',
    CREATE_TEMPLATE: '/templates',
    UPDATE_TEMPLATE: '/templates/{templateId}',
    DELETE_TEMPLATE: '/templates/{templateId}',
    GET_ALLOCATIONS: '/projects/{projectId}/allocations',
    CREATE_ALLOCATION: '/projects/{projectId}/allocations',
    UPDATE_ALLOCATION: '/projects/{projectId}/allocations/{allocationId}',
    DELETE_ALLOCATION: '/projects/{projectId}/allocations/{allocationId}'
  },
  
  SAFETY: {
    GET_INCIDENTS: '/incidents',
    CREATE_INCIDENT: '/incidents',
    UPDATE_INCIDENT: '/incidents/{incidentId}',
    DELETE_INCIDENT: '/incidents/{incidentId}',
    UPDATE_INCIDENT_STATUS: '/incidents/{incidentId}/status',
    GET_INSPECTIONS: '/inspections',
    CREATE_INSPECTION: '/inspections',
    UPDATE_INSPECTION: '/inspections/{inspectionId}',
    DELETE_INSPECTION: '/inspections/{inspectionId}',
    UPDATE_INSPECTION_STATUS: '/inspections/{inspectionId}/status',
    GET_SAFETY_TASKS: '/safety-tasks',
    CREATE_SAFETY_TASK: '/safety-tasks',
    UPDATE_SAFETY_TASK: '/safety-tasks/{taskId}',
    DELETE_SAFETY_TASK: '/safety-tasks/{taskId}',
    SUBMIT_SAFETY_TASK: '/safety-tasks/{taskId}/submit',
    GET_SAFETY_NOTIFICATIONS: '/safety-notifications',
    MARK_NOTIFICATION_READ: '/safety-notifications/{notificationId}/read',
    MARK_ALL_NOTIFICATIONS_READ: '/safety-notifications/read-all',
    GET_SAFETY_KPI: '/safety/kpi'
  },
  
  FINANCE: {
    GET_BUDGETS: '/finance/budgets',
    CREATE_BUDGET: '/finance/budgets',
    UPDATE_BUDGET: '/finance/budgets/{budgetId}',
    DELETE_BUDGET: '/finance/budgets/{budgetId}',
    GET_EXPENSES: '/finance/expenses',
    CREATE_EXPENSE: '/finance/expenses',
    UPDATE_EXPENSE: '/finance/expenses/{expenseId}',
    DELETE_EXPENSE: '/finance/expenses/{expenseId}',
    GET_PAYMENTS: '/finance/payments',
    CREATE_PAYMENT: '/finance/payments',
    UPDATE_PAYMENT: '/finance/payments/{paymentId}',
    DELETE_PAYMENT: '/finance/payments/{paymentId}',
    GET_INVOICES: '/finance/invoices',
    APPROVE_INVOICE: '/finance/invoices/{invoiceId}/approve',
    REJECT_INVOICE: '/finance/invoices/{invoiceId}/reject',
    GET_FINANCIAL_REPORTS: '/finance/reports',
    GET_FINANCIAL_ANALYTICS: '/finance/analytics',
    GET_BUDGET_TRACKING: '/finance/budget-tracking',
    GET_EXPENSE_CATEGORIES: '/finance/expense-categories',
    GET_PAYMENT_METHODS: '/finance/payment-methods'
  },
  
  SITE_OPS: {
    GET_SITE_LOGS: '/site-logs',
    CREATE_SITE_LOG: '/site-logs',
    UPDATE_SITE_LOG: '/site-logs/{logId}',
    DELETE_SITE_LOG: '/site-logs/{logId}',
    UPDATE_SITE_LOG_STATUS: '/site-logs/{logId}/status',
    UPLOAD_SITE_LOG_PHOTO: '/site-logs/{logId}/photo',
    GET_ISSUES: '/issues',
    CREATE_ISSUE: '/issues',
    UPDATE_ISSUE: '/issues/{issueId}',
    DELETE_ISSUE: '/issues/{issueId}',
    UPDATE_ISSUE_STATUS: '/issues/{issueId}/status',
    GET_SITE_TASKS: '/site-tasks',
    CREATE_SITE_TASK: '/site-tasks',
    UPDATE_SITE_TASK: '/site-tasks/{taskId}',
    DELETE_SITE_TASK: '/site-tasks/{taskId}',
    SUBMIT_SITE_TASK: '/site-tasks/{taskId}/submit',
    GET_INBOUND_DELIVERIES: '/deliveries',
    CREATE_DELIVERY: '/deliveries',
    UPDATE_DELIVERY: '/deliveries/{deliveryId}',
    DELETE_DELIVERY: '/deliveries/{deliveryId}',
    UPDATE_SITE_DELIVERY_STATUS: '/deliveries/{deliveryId}/site-status',
    GET_SITE_NOTIFICATIONS: '/site-notifications',
    MARK_SITE_NOTIFICATION_READ: '/site-notifications/{notificationId}/read',
    MARK_ALL_SITE_NOTIFICATIONS_READ: '/site-notifications/read-all',
    GET_SITE_OPS_KPI: '/site-ops/kpi',
    GET_TASK_COMPLETION: '/site-ops/task-completion',
    GET_ISSUE_TRENDS: '/site-ops/issue-trends'
  },
  
  VENDORS: {
    GET_VENDORS: '/vendors',
    GET_VENDOR: '/vendors/{vendorId}',
    CREATE_VENDOR: '/vendors',
    UPDATE_VENDOR: '/vendors/{vendorId}',
    DELETE_VENDOR: '/vendors/{vendorId}',
    GET_CONTRACTS: '/contracts',
    GET_CONTRACT: '/contracts/{contractId}',
    CREATE_CONTRACT: '/contracts',
    UPDATE_CONTRACT: '/contracts/{contractId}',
    DELETE_CONTRACT: '/contracts/{contractId}',
    GET_INVOICES: '/invoices',
    GET_INVOICE: '/invoices/{invoiceId}',
    CREATE_INVOICE: '/invoices',
    UPDATE_INVOICE: '/invoices/{invoiceId}',
    DELETE_INVOICE: '/invoices/{invoiceId}',
    SUBMIT_INVOICE: '/invoices/{invoiceId}/submit',
    GET_DELIVERIES: '/deliveries',
    GET_DELIVERY: '/deliveries/{deliveryId}',
    CREATE_DELIVERY: '/deliveries',
    UPDATE_DELIVERY: '/deliveries/{deliveryId}',
    DELETE_DELIVERY: '/deliveries/{deliveryId}',
    GET_VENDOR_TASKS: '/vendor/tasks',
    GET_VENDOR_TASK: '/vendor/tasks/{taskId}',
    CREATE_VENDOR_TASK: '/vendor/tasks',
    UPDATE_VENDOR_TASK: '/vendor/tasks/{taskId}',
    DELETE_VENDOR_TASK: '/vendor/tasks/{taskId}',
    GET_VENDOR_NOTIFICATIONS: '/vendor-notifications',
    MARK_VENDOR_NOTIFICATION_READ: '/vendor-notifications/{notificationId}/read',
    MARK_ALL_VENDOR_NOTIFICATIONS_READ: '/vendor-notifications/read-all',
    GET_VENDOR_INTEGRATION: '/vendor-integration',
    SYNC_WITH_ERP: '/vendor-integration/sync',
    GET_INTEGRATION_STATUS: '/vendor-integration/status'
  },
  
  NOTIFICATIONS: {
    GET_NOTIFICATIONS: '/notifications',
    GET_NOTIFICATION: '/notifications/{notificationId}',
    MARK_AS_READ: '/notifications/{notificationId}/read',
    MARK_ALL_AS_READ: '/notifications/read-all',
    GET_NOTIFICATION_PREFERENCES: '/notifications/preferences',
    UPDATE_NOTIFICATION_PREFERENCES: '/notifications/preferences',
    DELETE_NOTIFICATION: '/notifications/{notificationId}',
    GET_UNREAD_COUNT: '/notifications/unread-count'
  },
  
  REPORTS: {
    GET_DASHBOARD_OVERVIEW: '/reports/dashboard-overview',
    GENERATE_REPORT: '/reports/generate',
    GET_PROJECT_ANALYTICS: '/reports/projects',
    GET_VENDOR_ANALYTICS: '/reports/vendors',
    GET_SITE_ENGINEER_ANALYTICS: '/reports/site-engineers',
    GET_SAFETY_ANALYTICS: '/reports/safety',
    GET_RESOURCE_ANALYTICS: '/reports/resources',
    GET_USER_ANALYTICS: '/reports/users',
    GET_RESOURCE_UTILIZATION: '/reports/resource-utilization'
  },
  
  ANALYTICS: {
    GET_USER_ANALYTICS: '/analytics/users',
    GET_PROJECT_ANALYTICS: '/analytics/projects',
    GET_SAFETY_ANALYTICS: '/analytics/safety',
    GET_VENDOR_ANALYTICS: '/analytics/vendors',
    GET_SITE_ENGINEER_ANALYTICS: '/analytics/site-engineers',
    GET_RESOURCE_ANALYTICS: '/analytics/resources',
    GET_FINANCE_ANALYTICS: '/analytics/finance',
    GET_SYSTEM_HEALTH: '/analytics/system-health',
    GET_ACTIVITY_TRENDS: '/analytics/activity-trends',
    GET_PERFORMANCE_METRICS: '/analytics/performance-metrics',
    GET_DASHBOARD_OVERVIEW: '/analytics/dashboard-overview'
  }
};

// Status Constants
export const STATUS = {
  USER: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    SUSPENDED: 'SUSPENDED',
    PENDING_VERIFICATION: 'PENDING_VERIFICATION'
  },
  PROJECT: {
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    ON_HOLD: 'ON_HOLD',
    CANCELLED: 'CANCELLED',
    NOT_STARTED: 'NOT_STARTED'
  },
  INCIDENT: {
    OPEN: 'OPEN',
    INVESTIGATING: 'INVESTIGATING',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED'
  },
  INSPECTION: {
    SCHEDULED: 'SCHEDULED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
  },
  TASK: {
    PENDING: 'PENDING',
    SUBMITTED: 'SUBMITTED',
    COMPLETED: 'COMPLETED',
    REJECTED: 'REJECTED'
  },
  INVOICE: {
    DRAFT: 'DRAFT',
    SUBMITTED: 'SUBMITTED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    PAID: 'PAID'
  },
  DOCUMENT: {
    DRAFT: 'DRAFT',
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
  },
  DELIVERY: {
    PENDING: 'PENDING',
    IN_TRANSIT: 'IN_TRANSIT',
    DELIVERED: 'DELIVERED',
    RECEIVED: 'RECEIVED',
    RETURNED: 'RETURNED'
  },
  CONTRACT: {
    ACTIVE: 'ACTIVE',
    EXPIRED: 'EXPIRED',
    TERMINATED: 'TERMINATED',
    DRAFT: 'DRAFT'
  },
  ISSUE: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
    OPEN: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED'
  }
};

// Role Constants
export const ROLES = {
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  SITE_ENGINEER: 'SITE_ENGINEER',
  SAFETY_OFFICER: 'SAFETY_OFFICER',
  FINANCE_OFFICER: 'FINANCE_OFFICER',
  VENDOR: 'VENDOR'
};

// Document Types
export const DOCUMENT_TYPES = {
  CONTRACT: 'CONTRACT',
  INVOICE: 'INVOICE',
  DELIVERY_NOTE: 'DELIVERY_NOTE',
  CERTIFICATE: 'CERTIFICATE',
  OTHER: 'OTHER'
};

// Priority Levels
export const PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

// Date Formats
export const DATE_FORMATS = {
  SHORT_DATE: 'MM/dd/yyyy',
  LONG_DATE: 'MMMM dd, yyyy',
  DATETIME: 'MM/dd/yyyy HH:mm:ss',
  ISO_DATE: 'yyyy-MM-dd'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  LARGE_PAGE_SIZE: 25,
  SMALL_PAGE_SIZE: 5
};

// File Upload
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx']
};

// UI Constants
export const UI = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 500,
  MODAL_SIZE: {
    SMALL: 'sm',
    MEDIUM: 'md',
    LARGE: 'lg',
    EXTRA_LARGE: 'xl'
  }
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'File type is not supported.',
  UPLOAD_FAILED: 'File upload failed. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTER_SUCCESS: 'Registration successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  FILE_UPLOADED: 'File uploaded successfully',
  DATA_SAVED: 'Data saved successfully',
  ACTION_COMPLETED: 'Action completed successfully'
};

// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-]?[\d\s-]?[\d\s-]?[\d\s-]?[\d\s-]?[\d]$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  PROJECT_NAME: /^[a-zA-Z0-9\s-]+$/,
  BUDGET: /^\d+(\.\d{1,2})?$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/
};

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: '#0d6efd',
  SECONDARY: '#6c757d',
  SUCCESS: '#198754',
  DANGER: '#dc3545',
  WARNING: '#ffc107',
  INFO: '#0dcaf0',
  LIGHT: '#f8f9fa',
  DARK: '#343a40'
};

// Breakpoints
export const BREAKPOINTS = {
  XS: 576,
  SM: 768,
  MD: 992,
  LG: 1200,
  XL: 1400,
  XXL: 1600
};
