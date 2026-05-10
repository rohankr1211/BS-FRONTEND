import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaFileSignature, FaExclamationTriangle, FaTasks, FaTruckLoading, FaPlus, FaSyncAlt, FaCheckCircle, FaChartLine } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { siteOpsService } from '../../services/siteOpsService';
import type { SiteOpsKpi } from '../../services/siteOpsService';

const progressData = [
  { day: 'Mon', progress: 1.2 }, { day: 'Tue', progress: 0.8 }, { day: 'Wed', progress: 2.5 },
  { day: 'Thu', progress: 1.5 }, { day: 'Fri', progress: 3.2 }, { day: 'Sat', progress: 0.5 }
];

const issueSeverityData = [
  { name: 'Low', value: 4, color: '#27ae60' }, { name: 'Medium', value: 3, color: '#f39c12' },
  { name: 'High', value: 2, color: '#e67e22' }, { name: 'Critical', value: 1, color: '#e74c3c' }
];

export const SiteOpsDashboard: React.FC = () => {
  const [kpi, setKpi] = useState<SiteOpsKpi | null>(null);
  const navigate = useNavigate();

  useEffect(() => { siteOpsService.getKpi().then(setKpi); }, []);

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
          <h3 className="fw-bold text-dark mb-1">Site Operations Portal</h3>
          <p className="text-muted mb-0">Manage daily logs, track site issues, and verify deliveries.</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="primary" className="rounded-3 d-flex align-items-center gap-2" style={{ backgroundColor: '#e67e22', borderColor: '#e67e22' }} onClick={() => navigate('/siteops/sitelogs')}>
            <FaPlus /> Daily Log
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <Row className="g-3 mb-4">
        <Col md={3}><KpiCard label="Today's Logs" value={kpi?.todaysLogs} icon={FaFileSignature} color="warning" onClick={() => navigate('/siteops/sitelogs')} /></Col>
        <Col md={3}><KpiCard label="Open Issues" value={kpi?.openIssues} icon={FaExclamationTriangle} color="danger" onClick={() => navigate('/siteops/issues')} /></Col>
        <Col md={3}><KpiCard label="Pending Tasks" value={kpi?.pendingTasks} icon={FaTasks} color="primary" onClick={() => navigate('/siteops/tasks')} /></Col>
        <Col md={3}><KpiCard label="Pending Deliveries" value={kpi?.pendingDeliveries} icon={FaTruckLoading} color="info" onClick={() => navigate('/siteops/deliveries')} /></Col>
      </Row>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4">
          <h6 className="fw-bold text-muted text-uppercase mb-3">Quick Actions</h6>
          <div className="d-flex flex-wrap gap-3">
            <Button variant="outline-warning" className="rounded-3 d-flex align-items-center gap-2" onClick={() => navigate('/siteops/sitelogs')}>
              <FaFileSignature /> Create Site Log
            </Button>
            <Button variant="outline-danger" className="rounded-3 d-flex align-items-center gap-2" onClick={() => navigate('/siteops/issues')}>
              <FaExclamationTriangle /> Report New Issue
            </Button>
            <Button variant="outline-primary" className="rounded-3 d-flex align-items-center gap-2" onClick={() => navigate('/siteops/tasks')}>
              <FaTasks /> View My Tasks
            </Button>
            <Button variant="outline-info" className="rounded-3 d-flex align-items-center gap-2" onClick={() => navigate('/siteops/deliveries')}>
              <FaTruckLoading /> Confirm Deliveries
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Charts Row */}
      <Row className="g-4">
        {/* Site Progress Trend */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-4">Weekly Progress Trend (%)</h6>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: any) => `${v}%`} />
                  <Line type="monotone" dataKey="progress" stroke="#e67e22" strokeWidth={3} dot={{ r: 5 }} name="Daily Progress" />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Issue Severity Distribution */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-4">Issue Severity Distribution</h6>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={issueSeverityData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {issueSeverityData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="d-flex flex-wrap justify-content-center gap-3 mt-3">
                {issueSeverityData.map(d => (
                  <div key={d.name} className="d-flex align-items-center gap-1 small">
                    <div className="rounded-circle" style={{ width: 10, height: 10, background: d.color }} />
                    <span>{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
