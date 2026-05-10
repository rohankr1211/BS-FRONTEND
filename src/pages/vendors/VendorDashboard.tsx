import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaFileContract, FaFileUpload, FaFileInvoiceDollar, FaTasks, FaTruck, FaPlus, FaSyncAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import vendorService from '../../services/vendorService';
import type { VendorKpi } from '../../services/vendorService';

// Dynamic chart data will be calculated from service responses

export const VendorDashboard: React.FC = () => {
  const [kpi, setKpi] = useState<VendorKpi | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [docStats, setDocStats] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Silent auto-sync on mount
        await vendorService.syncFromPm().catch(e => console.warn("Auto-sync skipped", e));

        const kRes = await vendorService.getKpi().catch(() => ({ activeContracts: 0, totalContractValue: 0, pendingDocuments: 0, submittedInvoices: 0, assignedTasks: 0 }));
        setKpi(kRes);

        const iRes = await vendorService.getInvoices().catch(() => ({ content: [] }));
        const invs = iRes?.content || (Array.isArray(iRes) ? iRes : []);
        const monthly = invs.reduce((acc: any, inv: any) => {
          const m = new Date(inv.date || inv.dueDate || Date.now()).toLocaleString('default', { month: 'short' });
          acc[m] = (acc[m] || 0) + (inv.amount || 0);
          return acc;
        }, {});
        setTrends(Object.entries(monthly).map(([month, amount]) => ({ month, amount })));

        const dRes = await vendorService.getDocuments().catch(() => ({ content: [] }));
        const docs = dRes?.content || (Array.isArray(dRes) ? dRes : []);
        const stats = [
          { name: 'Approved', value: docs.filter((d: any) => d?.status === 'APPROVED').length, color: '#27ae60' },
          { name: 'Pending', value: docs.filter((d: any) => d?.status === 'PENDING').length, color: '#f39c12' },
          { name: 'Rejected', value: docs.filter((d: any) => d?.status === 'REJECTED').length, color: '#e74c3c' },
          { name: 'Draft', value: docs.filter((d: any) => d?.status === 'DRAFT').length, color: '#95a5a6' }
        ].filter(s => s.value > 0);
        setDocStats(stats.length ? stats : [{ name: 'No Docs', value: 1, color: '#eee' }]);

        const nRes = await vendorService.getNotifications().catch(() => []);
        const acts = (Array.isArray(nRes) ? nRes : (nRes?.content || [])).slice(0, 4).map((n: any) => ({
          icon: n?.type === 'INVOICE' ? FaFileInvoiceDollar : FaTruck,
          color: n?.type === 'INVOICE' ? 'success' : 'primary',
          text: n?.message || 'Activity update',
          time: n?.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Just now'
        }));
        setActivities(acts.length ? acts : [
          { icon: FaCheckCircle, color: 'success', text: 'Welcome to the Vendor Portal!', time: 'Just now' }
        ]);
      } catch (err: any) {
        console.error("Dashboard data load failed", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-5 text-center text-muted">Loading your dashboard...</div>;
  if (error) return (
    <div className="p-5">
      <div className="alert alert-danger rounded-4 d-flex align-items-center gap-3">
        <FaExclamationTriangle size={24} />
        <div>
          <h5 className="fw-bold mb-1">Oops! Something went wrong</h5>
          <p className="mb-0">{error}</p>
        </div>
      </div>
      <Button variant="outline-primary" className="rounded-3 mt-3" onClick={() => window.location.reload()}>
        <FaSyncAlt className="me-2" /> Reload Page
      </Button>
    </div>
  );

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
              {trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: any) => `$${v.toLocaleString()}`} />
                    <Line type="monotone" dataKey="amount" stroke="#3498db" strokeWidth={2} dot={{ r: 4 }} name="Invoice Amount" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="bg-light rounded-4 d-flex align-items-center justify-content-center" style={{ height: 200 }}>
                  <span className="text-muted small">No invoice history available</span>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Document Status */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-4">Document Status</h6>
              {docStats.some(s => s.name !== 'No Docs') ? (
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={docStats} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                      {docStats.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="bg-light rounded-4 d-flex align-items-center justify-content-center" style={{ height: 170 }}>
                  <span className="text-muted small">No documents uploaded yet</span>
                </div>
              )}
              <div className="d-flex flex-wrap justify-content-center gap-3 mt-1">
                {docStats.map(d => (
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
                <RadarChart data={[
                  { subject: 'On-time Delivery', A: 90 }, { subject: 'Quality', A: 85 },
                  { subject: 'Compliance', A: 95 }, { subject: 'Response', A: 80 }
                ]}>
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
                {activities.map((item, i) => (
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
