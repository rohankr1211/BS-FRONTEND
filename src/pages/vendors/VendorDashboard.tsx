import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaFileContract, FaFileUpload, FaFileInvoiceDollar, FaTasks, FaTruck, FaPlus, FaSyncAlt, FaCheckCircle } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import vendorService from '../../services/vendorService';
import type { VendorKpi } from '../../services/vendorService';

const invoiceTrend = [
  { month: 'Jan', amount: 42000 }, { month: 'Feb', amount: 65000 }, { month: 'Mar', amount: 38000 },
  { month: 'Apr', amount: 125000 }, { month: 'May', amount: 85000 }
];
const docStatus = [
  { name: 'Approved', value: 1, color: '#27ae60' }, { name: 'Pending', value: 1, color: '#f39c12' },
  { name: 'Rejected', value: 1, color: '#e74c3c' }, { name: 'Draft', value: 1, color: '#95a5a6' }
];
const perfData = [
  { subject: 'On-time Delivery', A: 92 }, { subject: 'Quality Score', A: 86 },
  { subject: 'Compliance', A: 88 }, { subject: 'Response Time', A: 78 }, { subject: 'Invoicing', A: 94 }
];

export const VendorDashboard: React.FC = () => {
  const [kpi, setKpi] = useState<VendorKpi | null>(null);
  const navigate = useNavigate();

  useEffect(() => { vendorService.getKpi().then(setKpi); }, []);

  const KpiCard = ({ label, value, icon: Icon, color, sub, onClick }: any) => (
    <Card className="border-0 shadow-sm rounded-4 h-100" style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <Card.Body className="p-4 d-flex align-items-center justify-content-between">
        <div>
          <p className="small text-muted text-uppercase fw-bold mb-1">{label}</p>
          <h2 className={`fw-bold text-${color} mb-0`}>{value ?? '...'}</h2>
          {sub && <div className="small text-muted mt-1">{sub}</div>}
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
          <h3 className="fw-bold text-dark mb-1">Vendor Portal</h3>
          <p className="text-muted mb-0">Manage your contracts, documents, invoices, and deliveries.</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="primary" className="rounded-3 d-flex align-items-center gap-2" onClick={() => navigate('/vendor/contracts')}>
            <FaPlus /> New Contract
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <Row className="g-3 mb-4">
        <Col md={3}><KpiCard label="Active Contracts" value={kpi?.activeContracts} icon={FaFileContract} color="primary" sub={kpi ? `$${(kpi.totalContractValue / 1000).toFixed(0)}K total value` : ''} onClick={() => navigate('/vendor/contracts')} /></Col>
        <Col md={3}><KpiCard label="Pending Documents" value={kpi?.pendingDocuments} icon={FaFileUpload} color="warning" onClick={() => navigate('/vendor/documents')} /></Col>
        <Col md={3}><KpiCard label="Submitted Invoices" value={kpi?.submittedInvoices} icon={FaFileInvoiceDollar} color="success" onClick={() => navigate('/vendor/invoices')} /></Col>
        <Col md={3}><KpiCard label="Assigned Tasks" value={kpi?.assignedTasks} icon={FaTasks} color="danger" onClick={() => navigate('/vendor/tasks')} /></Col>
      </Row>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4">
          <h6 className="fw-bold text-muted text-uppercase mb-3">Quick Actions</h6>
          <div className="d-flex flex-wrap gap-3">
            <Button variant="outline-primary" className="rounded-3 d-flex align-items-center gap-2" onClick={() => navigate('/vendor/contracts')}>
              <FaFileContract /> Create Contract
            </Button>
            <Button variant="outline-warning" className="rounded-3 d-flex align-items-center gap-2" onClick={() => navigate('/vendor/documents')}>
              <FaFileUpload /> Upload Document
            </Button>
            <Button variant="outline-success" className="rounded-3 d-flex align-items-center gap-2" onClick={() => navigate('/vendor/invoices')}>
              <FaFileInvoiceDollar /> Create Invoice
            </Button>
            <Button variant="outline-info" className="rounded-3 d-flex align-items-center gap-2" onClick={() => navigate('/vendor/deliveries')}>
              <FaTruck /> Track Delivery
            </Button>
            <Button variant="outline-danger" className="rounded-3 d-flex align-items-center gap-2" onClick={() => navigate('/vendor/tasks')}>
              <FaTasks /> View Tasks
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Charts Row */}
      <Row className="g-4">
        {/* Invoice Trend */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-4">Invoice Amounts Over Time</h6>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={invoiceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: any) => `$${v.toLocaleString()}`} />
                  <Line type="monotone" dataKey="amount" stroke="#3498db" strokeWidth={2} dot={{ r: 4 }} name="Invoice Amount" />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Document Status */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-4">Document Status</h6>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={docStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                    {docStatus.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="d-flex flex-wrap justify-content-center gap-3 mt-1">
                {docStatus.map(d => (
                  <div key={d.name} className="d-flex align-items-center gap-1 small">
                    <div className="rounded-circle" style={{ width: 10, height: 10, background: d.color }} />
                    <span>{d.name}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Performance Radar */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-4">Performance Metrics</h6>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={perfData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <Radar name="Score" dataKey="A" stroke="#3498db" fill="#3498db" fillOpacity={0.3} />
                  <Tooltip formatter={(v: any) => `${v}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-4">Recent Activity</h6>
              <div className="d-flex flex-column gap-3">
                {[
                  { icon: FaCheckCircle, color: 'success', text: 'Invoice INV-2026-001 approved by Project Manager', time: '2 hours ago' },
                  { icon: FaTruck, color: 'primary', text: 'Delivery DEL-002 is now IN_TRANSIT', time: '1 day ago' },
                  { icon: FaFileUpload, color: 'warning', text: 'Document DOC-002 pending approval', time: '2 days ago' },
                  { icon: FaTasks, color: 'danger', text: 'New task assigned: Supply steel for floor 5', time: '3 days ago' },
                ].map((item, i) => (
                  <div key={i} className="d-flex align-items-start gap-3">
                    <div className={`bg-${item.color} bg-opacity-10 text-${item.color} p-2 rounded-circle flex-shrink-0`}>
                      <item.icon size={14} />
                    </div>
                    <div>
                      <p className="mb-0 small fw-semibold">{item.text}</p>
                      <p className="mb-0 small text-muted">{item.time}</p>
                    </div>
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
