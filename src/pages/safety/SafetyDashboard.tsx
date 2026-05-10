import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  FaExclamationTriangle, FaClipboardCheck, FaTasks, FaSkullCrossbones,
  FaPlus, FaCalendarPlus, FaBell, FaSyncAlt,
  FaCheckCircle
} from 'react-icons/fa';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import safetyService from '../../services/safetyService';
import type { SafetyKpiSummary } from '../../services/safetyService';

const SEVERITY_COLORS = { LOW: '#27ae60', MEDIUM: '#f39c12', HIGH: '#e74c3c', CRITICAL: '#c0392b' };

const trendData = [
  { month: 'Jan', LOW: 2, MEDIUM: 1, HIGH: 0, CRITICAL: 0 },
  { month: 'Feb', LOW: 1, MEDIUM: 3, HIGH: 1, CRITICAL: 0 },
  { month: 'Mar', LOW: 3, MEDIUM: 2, HIGH: 2, CRITICAL: 1 },
  { month: 'Apr', LOW: 2, MEDIUM: 1, HIGH: 1, CRITICAL: 0 },
  { month: 'May', LOW: 1, MEDIUM: 2, HIGH: 2, CRITICAL: 1 },
];

const pieData = [
  { name: 'Low', value: 9, color: '#27ae60' },
  { name: 'Medium', value: 9, color: '#f39c12' },
  { name: 'High', value: 6, color: '#e74c3c' },
  { name: 'Critical', value: 2, color: '#c0392b' },
];

const complianceData = [
  { month: 'Jan', rate: 72 }, { month: 'Feb', rate: 78 }, { month: 'Mar', rate: 65 },
  { month: 'Apr', rate: 85 }, { month: 'May', rate: 91 }
];

export const SafetyDashboard: React.FC = () => {
  const [kpi, setKpi] = useState<SafetyKpiSummary | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => { safetyService.getKpiSummary().then(setKpi); }, []);

  const handleSync = async () => {
    setSyncing(true);
    const result = await safetyService.syncTasks();
    setSyncMsg(result.message);
    setSyncing(false);
    setTimeout(() => setSyncMsg(''), 4000);
  };

  const KpiCard = ({ label, value, icon: Icon, color, onClick }: any) => (
    <Card className="border-0 shadow-sm rounded-4 h-100" style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <Card.Body className="p-4 d-flex align-items-center justify-content-between">
        <div>
          <p className="small text-muted text-uppercase fw-bold mb-1">{label}</p>
          <h2 className={`fw-bold text-${color} mb-0`}>{value ?? '...'}</h2>
        </div>
        <div className={`bg-${color} bg-opacity-10 text-${color} p-3 rounded-circle`}>
          <Icon size={24} />
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="p-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Safety Overview</h3>
          <p className="text-muted mb-0">Monitor incidents, inspections, and task compliance across all sites.</p>
        </div>
        {syncMsg && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-0 py-2 px-3 rounded-3">
            <FaCheckCircle /> {syncMsg}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}><KpiCard label="Open Incidents" value={kpi?.openIncidents} icon={FaExclamationTriangle} color="danger" onClick={() => navigate('/safety/incidents')} /></Col>
        <Col md={3}><KpiCard label="Pending Inspections" value={kpi?.pendingInspections} icon={FaClipboardCheck} color="primary" onClick={() => navigate('/safety/inspections')} /></Col>
        <Col md={3}><KpiCard label="Assigned Tasks" value={kpi?.assignedTasks} icon={FaTasks} color="warning" onClick={() => navigate('/safety/tasks')} /></Col>
        <Col md={3}><KpiCard label="High Severity" value={kpi?.highSeverityIncidents} icon={FaSkullCrossbones} color="danger" /></Col>
      </Row>

      {/* Quick Actions */}
      <Row className="g-3 mb-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <h6 className="fw-bold text-muted text-uppercase mb-3">Quick Actions</h6>
              <div className="d-flex flex-wrap gap-3">
                <Button variant="danger" className="rounded-3 d-flex align-items-center gap-2" onClick={() => navigate('/safety/incidents')}>
                  <FaPlus /> Report Incident
                </Button>
                <Button variant="primary" className="rounded-3 d-flex align-items-center gap-2" onClick={() => navigate('/safety/inspections')}>
                  <FaCalendarPlus /> Schedule Inspection
                </Button>
                <Button variant="warning" className="rounded-3 d-flex align-items-center gap-2" onClick={() => navigate('/safety/tasks')}>
                  <FaTasks /> View My Tasks
                </Button>
                <Button variant="outline-secondary" className="rounded-3 d-flex align-items-center gap-2" onClick={handleSync} disabled={syncing}>
                  <FaSyncAlt className={syncing ? 'fa-spin' : ''} /> {syncing ? 'Syncing...' : 'Sync Tasks'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="g-4">
        {/* Incident Trends */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-4">Incident Trends by Severity</h6>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  {Object.entries(SEVERITY_COLORS).map(([key, color]) => (
                    <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Severity Distribution */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-4">Severity Distribution</h6>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="d-flex flex-wrap justify-content-center gap-3 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="d-flex align-items-center gap-1 small">
                    <div className="rounded-circle" style={{ width: 10, height: 10, background: d.color }} />
                    <span>{d.name}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Compliance Rate */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="fw-bold mb-0">Inspection Compliance Rate</h6>
                <div className="text-center">
                  <div className="fs-2 fw-bold text-success">91%</div>
                  <div className="small text-muted">This Month</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={complianceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="rate" fill="#27ae60" radius={[4, 4, 0, 0]} name="Compliance %" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Notification Bell */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0"><FaBell className="me-2 text-warning" />Recent Notifications</h6>
                <Button variant="link" size="sm" className="p-0 text-muted" onClick={() => safetyService.markAllRead()}>Mark all read</Button>
              </div>
              <NotificationsList />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const NotificationsList: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  useEffect(() => { safetyService.getNotifications().then(setNotifications); }, []);
  const TYPE_ICON: Record<string, string> = { TASK_ASSIGNED: '📋', INCIDENT_ASSIGNED: '⚠️', INSPECTION_REMINDER: '🔍', TASK_APPROVED: '✅' };
  return (
    <div className="d-flex flex-column gap-2">
      {notifications.slice(0, 4).map(n => (
        <div key={n.notificationId}
          className={`p-3 rounded-3 d-flex align-items-start gap-3 ${n.read ? 'bg-light' : 'bg-primary bg-opacity-10 border border-primary border-opacity-25'}`}
          style={{ cursor: 'pointer' }}
          onClick={() => safetyService.markRead(n.notificationId).then(() => setNotifications(prev => prev.map(x => x.notificationId === n.notificationId ? { ...x, read: true } : x)))}>
          <span style={{ fontSize: 18 }}>{TYPE_ICON[n.type] || '🔔'}</span>
          <div className="flex-grow-1">
            <p className={`mb-1 small ${n.read ? 'text-muted' : 'fw-semibold'}`}>{n.message}</p>
            <p className="mb-0 small text-muted" style={{ fontSize: '0.72rem' }}>{new Date(n.createdAt).toLocaleString()}</p>
          </div>
          {!n.read && <div className="bg-primary rounded-circle flex-shrink-0" style={{ width: 8, height: 8, marginTop: 6 }} />}
        </div>
      ))}
    </div>
  );
};
