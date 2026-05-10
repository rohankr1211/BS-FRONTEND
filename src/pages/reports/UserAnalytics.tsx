import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Form, InputGroup } from 'react-bootstrap';
import { FaUsers, FaUserCheck, FaUserTimes, FaUserSlash, FaSearch } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import mockService from '../../services/analyticsService';
import type { 
  UserAnalyticsRecord, UserMockRecord 
} from '../../services/analyticsService';
import { ChartCard } from '../../components/common/ChartCard';
import { useAuth } from '../../hooks/useAuth';

export const UserAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<UserAnalyticsRecord | null>(null);
  const [users, setUsers] = useState<UserMockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await mockService.getAllUsersList(user?.role) || [];
        
        // Derive real stats from the users list
        const realStats: UserAnalyticsRecord = {
          totalUsers: usersRes.length,
          activeUsers: usersRes.filter(u => u && u.status === 'ACTIVE').length,
          inactiveUsers: usersRes.filter(u => u && u.status === 'INACTIVE').length,
          suspendedUsers: usersRes.filter(u => u && u.status === 'SUSPENDED').length,
          usersByRole: usersRes.reduce((acc, u) => {
            if (u && u.role) {
              acc[u.role] = (acc[u.role] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>)
        };
        
        setSummary(realStats);
        setUsers(usersRes);
      } catch (e) {
        console.error("UserAnalytics Fetch Error:", e);
        setSummary({
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          suspendedUsers: 0,
          usersByRole: {}
        });
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25">Active</Badge>;
      case 'INACTIVE': return <Badge bg="secondary" className="bg-opacity-10 text-secondary border border-secondary border-opacity-25">Inactive</Badge>;
      case 'SUSPENDED': return <Badge bg="danger" className="bg-opacity-10 text-danger border border-danger border-opacity-25">Suspended</Badge>;
      default: return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };

  // Convert Record<string, number> to Array for Recharts
  const roleData = summary ? Object.entries(summary.usersByRole).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value
  })) : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">User Analytics</h3>
        <p className="text-muted mb-0">Overview of system access, role distribution, and user status.</p>
      </div>

      {summary && (
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="small text-muted text-uppercase fw-bold mb-1">Total Users</p>
                  <h2 className="fw-bold text-dark mb-0">{summary.totalUsers}</h2>
                </div>
                <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                  <FaUsers size={24} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="small text-muted text-uppercase fw-bold mb-1">Active</p>
                  <h2 className="fw-bold text-success mb-0">{summary.activeUsers}</h2>
                </div>
                <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                  <FaUserCheck size={24} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="small text-muted text-uppercase fw-bold mb-1">Inactive</p>
                  <h2 className="fw-bold text-secondary mb-0">{summary.inactiveUsers}</h2>
                </div>
                <div className="bg-secondary bg-opacity-10 text-secondary p-3 rounded-circle">
                  <FaUserTimes size={24} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="small text-muted text-uppercase fw-bold mb-1">Suspended</p>
                  <h2 className="fw-bold text-danger mb-0">{summary.suspendedUsers}</h2>
                </div>
                <div className="bg-danger bg-opacity-10 text-danger p-3 rounded-circle">
                  <FaUserSlash size={24} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="g-4 mb-4">
        <Col lg={4}>
          <ChartCard title="Role Distribution" loading={loading} height={350}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Header className="bg-white border-bottom p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <h5 className="fw-bold mb-0">System Users List</h5>
              <InputGroup style={{ maxWidth: '300px' }}>
                <InputGroup.Text className="bg-light border-end-0 text-muted"><FaSearch /></InputGroup.Text>
                <Form.Control 
                  placeholder="Search users..." 
                  className="bg-light border-start-0"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Card.Header>
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="bg-light text-muted small text-uppercase">
                  <tr>
                    <th className="py-3 px-4 border-bottom-0">Name / Email</th>
                    <th className="py-3 px-4 border-bottom-0">Role</th>
                    <th className="py-3 px-4 border-bottom-0">Status</th>
                    <th className="py-3 px-4 border-bottom-0">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="text-center py-4 text-muted">Loading users...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-muted">
                        {users.length === 0 ? (
                          <div className="text-danger">
                            <p className="mb-0 fw-bold">Failed to load user data.</p>
                            <small>The backend might be unavailable or returned an error.</small>
                          </div>
                        ) : `No users found matching "${search}".`}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id || user.userId}>
                        <td className="py-3 px-4">
                          <div className="fw-bold text-dark">{user.name || 'Unknown User'}</div>
                          <div className="small text-muted">{user.email || 'No email'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge bg="light" text="dark" className="border text-uppercase">
                            {user.role ? user.role.replace('_', ' ') : 'USER'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(user.status || 'ACTIVE')}
                        </td>
                        <td className="py-3 px-4 text-muted small">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
