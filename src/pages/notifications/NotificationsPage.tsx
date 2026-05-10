import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, ListGroup, Form } from 'react-bootstrap';
import { FaBell, FaCheckCircle, FaTrash, FaFilter, FaTasks, FaShieldAlt, FaFileInvoice, FaExclamationTriangle } from 'react-icons/fa';
import { notificationService } from '../../services/notificationService';
import type { NotificationResponse } from '../../services/notificationService';

const PRIORITY_CONFIG: Record<string, { bg: string; label: string }> = {
  LOW: { bg: 'secondary', label: 'Low' },
  MEDIUM: { bg: 'info', label: 'Medium' },
  HIGH: { bg: 'warning', label: 'High' },
  CRITICAL: { bg: 'danger', label: 'Critical' },
};

const getEventIcon = (type?: string) => {
  const safeType = type || '';
  if (safeType.startsWith('TASK')) return <FaTasks className="text-primary" />;
  if (safeType.startsWith('APPROVAL')) return <FaCheckCircle className="text-success" />;
  if (safeType.startsWith('INVOICE')) return <FaFileInvoice className="text-info" />;
  if (safeType.startsWith('SAFETY')) return <FaShieldAlt className="text-danger" />;
  return <FaBell className="text-muted" />;
};

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const load = async () => {
    setLoading(true);
    setNotifications(await notificationService.getNotifications());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRead = async (id: string) => {
    await notificationService.markAsRead(id);
    await load();
  };

  const handleDelete = async (id: string) => {
    await notificationService.deleteNotification(id);
    await load();
  };

  const filtered = activeFilter === 'ALL' ? notifications :
                  activeFilter === 'UNREAD' ? notifications.filter(n => !n.read) :
                  notifications.filter(n => n.priority === activeFilter);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Notification Center</h3>
          <p className="text-muted mb-0">{notifications.filter(n => !n.read).length} unread notifications across all modules.</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm" className="rounded-3" onClick={async () => { await notificationService.markAllAsRead(); await load(); }}>
            Mark All as Read
          </Button>
        </div>
      </div>

      <Row className="g-4">
        {/* Sidebar Filters */}
        <Col lg={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-3">
              <h6 className="fw-bold text-muted small text-uppercase mb-3 px-2">Filters</h6>
              <ListGroup variant="flush">
                <ListGroup.Item action active={activeFilter === 'ALL'} className="rounded-3 border-0 py-2 mb-1" onClick={() => setActiveFilter('ALL')}>All Notifications</ListGroup.Item>
                <ListGroup.Item action active={activeFilter === 'UNREAD'} className="rounded-3 border-0 py-2 mb-1" onClick={() => setActiveFilter('UNREAD')}>Unread Only</ListGroup.Item>
                <div className="border-top my-2 mx-2"></div>
                <ListGroup.Item action active={activeFilter === 'CRITICAL'} className="rounded-3 border-0 py-2 mb-1 text-danger fw-bold" onClick={() => setActiveFilter('CRITICAL')}>Critical Alerts</ListGroup.Item>
                <ListGroup.Item action active={activeFilter === 'HIGH'} className="rounded-3 border-0 py-2 mb-1" onClick={() => setActiveFilter('HIGH')}>High Priority</ListGroup.Item>
                <ListGroup.Item action active={activeFilter === 'MEDIUM'} className="rounded-3 border-0 py-2 mb-1" onClick={() => setActiveFilter('MEDIUM')}>Medium Priority</ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Notification List */}
        <Col lg={9}>
          {loading ? <div className="text-center py-5 text-muted">Loading notifications...</div> : (
            <div className="d-flex flex-column gap-3">
              {filtered.length === 0 ? (
                <Card className="border-0 shadow-sm rounded-4 text-center py-5">
                  <div className="text-muted opacity-25 mb-2"><FaBell size={48} /></div>
                  <p className="text-muted mb-0">No notifications found.</p>
                </Card>
              ) : filtered.map(n => {
                const pri = PRIORITY_CONFIG[n.priority] || PRIORITY_CONFIG.MEDIUM;
                return (
                  <Card key={n.id} className={`border-0 shadow-sm rounded-4 overflow-hidden ${!n.read ? 'border-start border-4 border-primary' : ''}`}>
                    <Card.Body className="p-4">
                      <div className="d-flex gap-4 align-items-start">
                        <div className="bg-light p-3 rounded-4 flex-shrink-0">
                          {getEventIcon(n.eventType)}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <Badge bg={pri.bg} className="mb-2">{pri.label} Priority</Badge>
                              <h6 className={`mb-1 ${!n.read ? 'fw-bold' : 'text-dark'}`}>{n.message}</h6>
                                <div className="small text-muted">
                                  {(n.fromRole || 'SYSTEM').replace('_', ' ')} · {new Date(n.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                              {!n.read && (
                                <Button variant="light" size="sm" className="rounded-3" onClick={() => handleRead(n.id)}>Mark Read</Button>
                              )}
                              <Button variant="light" size="sm" className="rounded-3 text-danger" onClick={() => handleDelete(n.id)}><FaTrash /></Button>
                            </div>
                          </div>
                          {n.priority === 'CRITICAL' && (
                            <div className="mt-3 p-3 bg-danger bg-opacity-10 rounded-4 text-danger d-flex align-items-center gap-3">
                              <FaExclamationTriangle size={24} />
                              <div>
                                <div className="fw-bold">Immediate Action Required</div>
                                <div className="small opacity-75">This is a high-priority system alert that requires your urgent attention.</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};
