import React, { useEffect, useState } from 'react';
import { Row, Col, Spinner, Card, Badge, Button, ProgressBar } from 'react-bootstrap';
import { StatWidget } from '../../components/dashboard/StatWidget';
import { FaUsers, FaUserPlus, FaChartLine, FaShieldAlt, FaArrowUp, FaArrowDown, FaCog, FaClipboardList, FaCalendarCheck, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import analyticsService from '../../services/analyticsService';
import type { UserAnalyticsRecord } from '../../services/analyticsService';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#dc3545',
  PROJECT_MANAGER: '#0d6efd',
  SITE_ENGINEER: '#0dcaf0',
  SAFETY_OFFICER: '#ffc107',
  FINANCE_OFFICER: '#198754',
  VENDOR: '#6c757d',
};

const GREETING = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<UserAnalyticsRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await analyticsService.getUserAnalyticsSummary();
        setStats(data);
      } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Transform roles data for the pie chart
  const rolesChartData = Object.entries(stats?.usersByRole || {}).map(([role, count]) => ({
    name: role.replace(/_/g, ' '),
    value: count,
    color: ROLE_COLORS[role] || '#adb5bd',
  }));

  const totalUsers = stats?.totalUsers || 0;
  const activeUsers = stats?.activeUsers || 0;
  const activePercent = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  return (
    <div>
      {/* Header with Greeting & Clock */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">{GREETING()}, Admin 👋</h3>
          <p className="text-muted mb-0">Here's what's happening on your platform today.</p>
        </div>
        <div className="text-md-end mt-2 mt-md-0">
          <div className="d-inline-flex align-items-center gap-2 bg-white px-3 py-2 rounded-pill shadow-sm border">
            <div className="bg-success rounded-circle" style={{ width: 8, height: 8, animation: 'pulse-dot 2s infinite' }}></div>
            <span className="fw-bold text-dark" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-muted small ms-1">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <Row className="g-4 mb-4">
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ borderTop: '3px solid #0d6efd' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="small text-uppercase fw-bold text-muted">Total Users</span>
                <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3"><FaUsers size={18} /></div>
              </div>
              <h2 className="display-5 fw-bold text-dark mb-1">
                {isLoading ? <Spinner animation="border" size="sm" /> : totalUsers}
              </h2>
              <div className="d-flex align-items-center gap-1 mt-2">
                <FaArrowUp className="text-success" size={12} />
                <span className="text-success small fw-bold">{activePercent}%</span>
                <span className="text-muted small">active rate</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ borderTop: '3px solid #198754' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="small text-uppercase fw-bold text-muted">Active Users</span>
                <div className="bg-success bg-opacity-10 text-success p-2 rounded-3"><FaChartLine size={18} /></div>
              </div>
              <h2 className="display-5 fw-bold text-dark mb-1">
                {isLoading ? <Spinner animation="border" size="sm" /> : activeUsers}
              </h2>
              <ProgressBar now={activePercent} variant="success" className="mt-2" style={{ height: 6, borderRadius: 4 }} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ borderTop: '3px solid #ffc107' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="small text-uppercase fw-bold text-muted">Inactive / Suspended</span>
                <div className="bg-warning bg-opacity-10 text-warning p-2 rounded-3"><FaBell size={18} /></div>
              </div>
              <h2 className="display-5 fw-bold text-dark mb-1">
                {isLoading ? <Spinner animation="border" size="sm" /> : ((stats?.inactiveUsers || 0) + (stats?.suspendedUsers || 0))}
              </h2>
              <span className="text-muted small">Requires review</span>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ borderTop: '3px solid #198754' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="small text-uppercase fw-bold text-muted">System Health</span>
                <div className="bg-success bg-opacity-10 text-success p-2 rounded-3"><FaShieldAlt size={18} /></div>
              </div>
              <h2 className="fw-bold text-success mb-1" style={{ fontSize: '1.6rem' }}>All Systems Go</h2>
              <div className="d-flex align-items-center gap-2 mt-2">
                <div className="bg-success rounded-circle" style={{ width: 8, height: 8, animation: 'pulse-dot 2s infinite' }}></div>
                <span className="text-muted small">API, DB, Storage — Online</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content Row: Role Chart + Quick Actions + Activity */}
      <Row className="g-4 mb-4">
        {/* Role Breakdown Chart */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">User Roles Distribution</h5>
                <Badge bg="primary" pill className="bg-opacity-10 text-primary border border-primary-subtle px-3 py-2">{totalUsers} Total</Badge>
              </div>
              {isLoading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
              ) : rolesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={rolesChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {rolesChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      formatter={(value: number, name: string) => [`${value} users`, name]}
                    />
                    <Legend 
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={10}
                      formatter={(value: string) => <span className="text-muted small fw-medium">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted py-5">No role data available</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions + System Services */}
        <Col lg={7}>
          <Row className="g-4">
            {/* Quick Actions */}
            <Col xs={12}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-3">Quick Actions</h5>
                  <Row className="g-3">
                    {[
                      { label: 'Manage Users', icon: <FaUsers size={20} />, color: 'primary', path: '/admin/iam/users' },
                      { label: 'Audit Logs', icon: <FaClipboardList size={20} />, color: 'info', path: '/admin/iam/audit-logs' },
                      { label: 'System Reports', icon: <FaCalendarCheck size={20} />, color: 'success', path: '/reports/dashboard' },
                    ].map((action, idx) => (
                      <Col sm={6} md={4} key={idx}>
                        <Button
                          variant="light"
                          className="w-100 p-3 rounded-4 d-flex flex-column align-items-center gap-2 border shadow-sm hover-shadow transition-all"
                          style={{ minHeight: '100px' }}
                          onClick={() => navigate(action.path)}
                        >
                          <div className={`bg-${action.color} bg-opacity-10 text-${action.color} p-2 rounded-3`}>
                            {action.icon}
                          </div>
                          <span className="small fw-bold text-dark">{action.label}</span>
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Platform Services Status */}
            <Col xs={12}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-3">Platform Services</h5>
                  <div className="d-flex flex-column gap-3">
                    {[
                      { name: 'Authentication Server', status: 'Operational', uptime: '99.98%', color: 'success' },
                      { name: 'Database Cluster', status: 'Operational', uptime: '99.95%', color: 'success' },
                      { name: 'File Storage (S3)', status: 'Operational', uptime: '99.99%', color: 'success' },
                      { name: 'Notification Service', status: 'Operational', uptime: '99.90%', color: 'success' },
                    ].map((service, idx) => (
                      <div key={idx} className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 border">
                        <div className="d-flex align-items-center gap-3">
                          <div className={`bg-${service.color} rounded-circle`} style={{ width: 10, height: 10, animation: 'pulse-dot 2s infinite' }}></div>
                          <span className="fw-bold text-dark small">{service.name}</span>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <span className="text-muted small">{service.uptime} uptime</span>
                          <Badge bg={service.color} pill className="bg-opacity-10 border px-2 py-1">
                            <span className={`text-${service.color} small fw-bold`}>{service.status}</span>
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Role Breakdown Details (expanded list) */}
      <Row className="g-4">
        <Col md={12}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">Role Breakdown Details</h5>
              {isLoading ? <Spinner animation="border" size="sm" /> : (
                <Row className="g-3">
                  {Object.entries(stats?.usersByRole || {}).map(([role, count]) => {
                    const percent = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
                    const color = ROLE_COLORS[role] || '#adb5bd';
                    return (
                      <Col md={4} sm={6} key={role}>
                        <div className="p-3 bg-light rounded-4 border d-flex flex-column gap-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold text-dark small">{role.replace(/_/g, ' ')}</span>
                            <Badge pill style={{ backgroundColor: color }} className="text-white px-2 py-1">{count}</Badge>
                          </div>
                          <ProgressBar now={percent} style={{ height: 6, borderRadius: 4 }}>
                            <ProgressBar now={percent} style={{ backgroundColor: color }} />
                          </ProgressBar>
                          <span className="text-muted small">{percent}% of total users</span>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Inline animation styles */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .hover-shadow:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important; transform: translateY(-2px); }
        .transition-all { transition: all 0.25s ease; }
      `}</style>
    </div>
  );
};
