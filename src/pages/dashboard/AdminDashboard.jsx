import React, { useEffect, useState } from 'react';
import { Row, Col, Spinner, Card, Badge, Button, ProgressBar } from 'react-bootstrap';
import { FaUsers, FaUserPlus, FaChartLine, FaShieldAlt, FaArrowUp, FaArrowDown, FaCog, FaClipboardList, FaCalendarCheck, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import analyticsService from '../../services/analyticsService';
import type { UserAnalyticsRecord } from '../../services/analyticsService';

const ROLE_COLORS = {
  ADMIN: '#dc3545',
  PROJECT_MANAGER: '#0d6efd',
  SITE_ENGINEER: '#0dcaf0',
  SAFETY_OFFICER: '#ffc107',
  FINANCE_OFFICER: '#198754',
  VENDOR: '#6c757d'
};

const GREETING = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navigate = useNavigate();

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Admin Dashboard</h3>
          <p className="text-muted mb-0">System overview and analytics.</p>
        </div>
        <Button variant="outline-secondary" className="rounded-3" onClick={() => navigate('/admin/users')}>
          <FaUsers /> Manage Users
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <div className="text-muted mt-3">Loading dashboard data...</div>
        </div>
      ) : stats ? (
        <Row className="g-4">
          <Col lg={3} md={6}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Header className="bg-light border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">Total Users</h5>
                  <FaUsers className="text-primary" />
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="text-center">
                  <div className="display-4 fs-1 fw-bold text-primary">{stats.totalUsers}</div>
                  <div className="text-muted">Total registered users</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Header className="bg-light border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">Active Sessions</h5>
                  <FaChartLine className="text-primary" />
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Desktop', value: stats.desktopUsers, fill: ROLE_COLORS.ADMIN },
                        { name: 'Mobile', value: stats.mobileUsers, fill: ROLE_COLORS.PROJECT_MANAGER },
                        { name: 'Tablet', value: stats.tabletUsers, fill: ROLE_COLORS.SITE_ENGINEER }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ cx, cy }) => {
                        const fill = ROLE_COLORS[cx];
                        return (
                          <text x={cx} y={cy} fill={fill} textAnchor="middle">
                            {`${STAT_DATA[cx]?.name || cx}: ${STAT_DATA[cx]?.value || 0}`}
                          </text>
                        );
                      }}
                    >
                      <Tooltip content={`${STAT_DATA[cx]?.name || cx}: ${STAT_DATA[cx]?.value || 0}`} />
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Header className="bg-light border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">User Growth</h5>
                  <FaArrowUp className="text-success" />
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="text-center">
                  <div className="display-4 fs-1 fw-bold text-success">+{stats.userGrowthRate?.toFixed(1)}%</div>
                  <div className="text-muted">User growth rate (30 days)</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Header className="bg-light border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">System Health</h5>
                  <FaShieldAlt className="text-info" />
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">CPU Usage:</span>
                    <ProgressBar now={stats.systemHealth?.cpuUsage || 0} className="flex-grow-1" />
                    <span className="text-muted ms-2">{stats.systemHealth?.cpuUsage || 0}%</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Memory:</span>
                    <ProgressBar now={stats.systemHealth?.memoryUsage || 0} className="flex-grow-1" />
                    <span className="text-muted ms-2">{stats.systemHealth?.memoryUsage || 0}%</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Storage:</span>
                    <ProgressBar now={stats.systemHealth?.storageUsage || 0} className="flex-grow-1" />
                    <span className="text-muted ms-2">{stats.systemHealth?.storageUsage || 0}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <Badge bg={stats.systemHealth?.status === 'healthy' ? 'success' : 'warning'} className="fs-6">
                    {stats.systemHealth?.status === 'healthy' ? 'Healthy' : 'Needs Attention'}
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Header className="bg-light border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">Recent Activity</h5>
                  <FaClipboardList className="text-primary" />
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">New Users:</span>
                    <span className="fw-bold text-primary">{stats.newUsersToday}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Active Projects:</span>
                    <span className="fw-bold text-info">{stats.activeProjects}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Pending Tasks:</span>
                    <span className="fw-bold text-warning">{stats.pendingTasks}</span>
                  </div>
                </div>
                <Button variant="outline-primary" className="rounded-3 w-100 mt-3" onClick={() => navigate('/admin/audit-logs')}>
                  <FaCog /> View Audit Logs
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <div className="text-center py-5">
          <FaBell size={40} className="text-muted mb-3 opacity-25" />
          <p className="text-muted mb-0">No dashboard data available.</p>
        </div>
      )}
    </div>
  );
};
