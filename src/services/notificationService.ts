import client from '../api/client';

// ── Types ──────────────────────────────────────

export interface NotificationResponse {
  id: string;
  eventType: string;
  message: string;
  fromService: string;
  fromRole: string;
  referenceId: string;
  read: boolean;
  createdAt: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface UnreadCountResponse {
  totalUnread: number;
  criticalCount: number;
}

// ── Service ────────────────────────────────────

export const notificationService = {
  getNotifications: async (page = 0, size = 20, eventType?: string, fromRole?: string): Promise<NotificationResponse[]> => {
    try {
      let url = `/api/notifications?page=${page}&size=${size}`;
      if (eventType) url += `&eventType=${eventType}`;
      if (fromRole) url += `&fromRole=${fromRole}`;
      
      const res = await client.get<any>(url, { _skipRedirect: true } as any);
      const data = res.data?.data || res.data;
      if (data && typeof data === 'object' && 'content' in data) {
        return data.content;
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn("Failed to fetch notifications from backend", error);
      return [];
    }
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    try {
      const res = await client.get<any>('/api/notifications/unread-count', { _skipRedirect: true } as any);
      const data = res.data?.data || res.data;
      return {
        totalUnread: data?.totalUnread ?? 0,
        criticalCount: data?.criticalCount ?? 0
      };
    } catch (error) {
      console.warn("Unread count endpoint failed, falling back to manual count", error);
      try {
        // Fallback: Fetch latest notifications and count unread
        const res = await client.get<any>('/api/notifications?size=50', { _skipRedirect: true } as any);
        const data = res.data?.data || res.data;
        const list = Array.isArray(data) ? data : (data?.content || []);
        const unread = list.filter((n: any) => !n.read);
        return {
          totalUnread: unread.length,
          criticalCount: unread.filter((n: any) => n.priority === 'CRITICAL').length
        };
      } catch {
        return { totalUnread: 0, criticalCount: 0 };
      }
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    await client.put(`/api/notifications/${id}/read`);
  },

  createNotification: async (payload: any): Promise<void> => {
    await client.post('/api/notifications', payload);
  },

  markAllAsRead: async (): Promise<void> => {
    await client.put('/api/notifications/read-all');
  },

  deleteNotification: async (id: string): Promise<void> => {
    await client.delete(`/api/notifications/${id}`);
  }
};
