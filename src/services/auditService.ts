import client from '../api/client';

// Backend field names from /admin/audit/logs
export interface AuditLog {
  auditId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

export interface AuditLogListResponse {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// Backend wraps all responses in { success, message, data }
export const auditService = {
  getLogs: async (page = 0, size = 15): Promise<AuditLogListResponse> => {
    const res = await client.get<any>(
      `/admin/audit-logs?page=${page}&size=${size}&sortBy=timestamp&sortDir=desc`
    );
    const data = res.data?.data || res.data;
    
    // Handle Spring Page object
    if (data && typeof data === 'object' && 'content' in data) {
      return data;
    }
    
    // Handle direct array
    if (Array.isArray(data)) {
      return {
        content: data,
        totalElements: data.length,
        totalPages: 1,
        page: 0,
        size: data.length
      };
    }

    return { content: [], totalElements: 0, totalPages: 0, page: 0, size: 0 };
  }
};
