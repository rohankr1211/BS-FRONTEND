import React, { useState, useEffect, useRef } from 'react';
import { NavDropdown, Badge, ListGroup, Button } from 'react-bootstrap';
import { FaBell, FaCircle, FaTasks, FaCheckCircle, FaFileInvoice, FaShieldAlt, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import type { NotificationResponse } from '../../services/notificationService';

const getIcon = (type: string, priority: string) => {
  if (priority === 'CRITICAL') return <FaExclamationCircle className="text-danger" />;
  const safeType = type || '';
  if (safeType.startsWith('TASK')) return <FaTasks className="text-primary" />;
  if (safeType.startsWith('APPROVAL')) return <FaCheckCircle className="text-warning" />;
  if (safeType.startsWith('INVOICE')) return <FaFileInvoice className="text-success" />;
  if (safeType.startsWith('SAFETY')) return <FaShieldAlt className="text-danger" />;
  return <FaBell className="text-muted" />;
};

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const navigate = useNavigate();

  const load = async () => {
    const [list, count] = await Promise.all([
      notificationService.getNotifications(0, 10),
      notificationService.getUnreadCount()
    ]);
    setNotifications(list);
    setUnreadCount(count.totalUnread);
    setCriticalCount(count.criticalCount);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await notificationService.markAsRead(id);
    await load();
  };

  const getBadgeColor = () => {
    if (criticalCount > 0) return 'danger';
    if (unreadCount > 10) return 'danger';
    if (unreadCount > 5) return 'warning';
    return 'primary';
  };

  return (
    <NavDropdown
      title={
        <div className="position-relative d-inline-block">
          <FaBell size={20} className={unreadCount > 0 ? 'text-primary' : 'text-muted'} />
          {unreadCount > 0 && (
            <Badge 
              pill 
              bg={getBadgeColor()} 
              className="position-absolute translate-middle-y start-100 top-0 border border-white"
              style={{ fontSize: '0.6rem', padding: '0.25em 0.5em', left: '12px' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      }
      id="notification-dropdown"
      align="end"
      className="no-caret mx-2"
    >
      <div style={{ width: '320px', maxHeight: '480px', overflowY: 'auto' }} className="py-2">
        <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0">Notifications</h6>
          {unreadCount > 0 && (
            <Button variant="link" size="sm" className="p-0 text-decoration-none small" onClick={async () => { await notificationService.markAllAsRead(); await load(); }}>
              Mark all read
            </Button>
          )}
        </div>
        
        <ListGroup variant="flush">
          {(!notifications || !Array.isArray(notifications) || notifications.length === 0) ? (
            <div className="p-4 text-center text-muted small">No notifications</div>
          ) : (
            notifications.map(n => (
              <ListGroup.Item 
                key={n.id} 
                action 
                className={`px-3 py-3 border-0 ${!n.read ? 'bg-light' : ''}`}
                onClick={() => { navigate('/notifications'); }}
              >
                <div className="d-flex gap-3 align-items-start">
                  <div className="mt-1">{getIcon(n.eventType, n.priority)}</div>
                  <div className="flex-grow-1 overflow-hidden">
                    <div className={`small mb-1 ${!n.read ? 'fw-bold text-dark' : 'text-muted'}`} style={{ lineHeight: '1.2' }}>
                      {n.message}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-1" style={{ fontSize: '0.7rem' }}>
                      <span className="text-muted">{(n.fromRole || 'SYSTEM').replace('_', ' ')}</span>
                      <span className="text-muted">Just now</span>
                    </div>
                  </div>
                  {!n.read && (
                    <div className="mt-1" onClick={(e) => handleRead(n.id, e)}>
                      <FaCircle className="text-primary" size={8} />
                    </div>
                  )}
                </div>
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
        
        <div className="px-3 pt-2 mt-2 border-top text-center">
          <Button variant="link" size="sm" className="text-decoration-none small fw-bold w-100" onClick={() => navigate('/notifications')}>
            View All Notifications
          </Button>
        </div>
      </div>
    </NavDropdown>
  );
};
