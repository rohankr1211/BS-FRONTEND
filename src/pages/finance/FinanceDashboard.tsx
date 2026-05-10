import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaWallet, FaReceipt, FaCreditCard, FaTasks, FaPlus, FaChartPie, FaMoneyBillWave } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from 'recharts';
import { financeService } from '../../services/financeService';
import type { FinanceKpi } from '../../services/financeService';

const budgetVsActual = [
  { name: 'Materials', planned: 500000, actual: 350000 },
  { name: 'Labor', planned: 200000, actual: 180000 },
  { name: 'Equipment', planned: 150000, actual: 120000 },
  { name: 'Overhead', planned: 50000, actual: 45000 },
];

const expenseTrend = [
  { month: 'Jan', amount: 45000 }, { month: 'Feb', amount: 52000 }, { month: 'Mar', amount: 48000 },
  { month: 'Apr', amount: 61000 }, { month: 'May', amount: 25000 }
];

export const FinanceDashboard: React.FC = () => {
  const [kpi, setKpi] = useState<FinanceKpi | null>(null);
  const navigate = useNavigate();

  useEffect(() => { financeService.getKpi().then(setKpi); }, []);

  const KpiCard = ({ label, value, icon: Icon, color, sub, onClick }: any) => (
    <Card className="border-0 shadow-sm rounded-4 h-100" style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <Card.Body className="p-4 d-flex align-items-center justify-content-between">
        <div>
          <p className="small text-muted text-uppercase fw-bold mb-1">{label}</p>
          <h2 className="fw-bold text-dark mb-0">{value ?? '...'}</h2>
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
          <h3 className="fw-bold text-dark mb-1">Finance Portal</h3>
          <p className="text-muted mb-0">Monitor budgets, track expenses, and process payments across projects.</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="dark" className="rounded-3 d-flex align-items-center gap-2" style={{ backgroundColor: '#2c3e50' }} onClick={() => navigate('/finance/budgets')}>
            <FaPlus /> New Budget
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <Row className="g-3 mb-4">
        <Col md={3}><KpiCard label="Total Budget" value={`$${(kpi?.totalBudget ?? 0).toLocaleString()}`} icon={FaWallet} color="primary" sub="Approved funds" /></Col>
        <Col md={3}><KpiCard label="Total Expenses" value={`$${(kpi?.totalExpenses ?? 0).toLocaleString()}`} icon={FaReceipt} color="danger" sub="Actual spending" /></Col>
        <Col md={3}>
          <KpiCard label="Utilization" value={`${(kpi?.budgetUtilization ?? 0).toFixed(1)}%`} icon={FaChartPie} color="warning" sub={
            <ProgressBar now={kpi?.budgetUtilization} variant={kpi?.budgetUtilization && kpi.budgetUtilization > 90 ? 'danger' : 'warning'} style={{ height: '4px' }} className="mt-2" />
          } />
        </Col>
        <Col md={3}><KpiCard label="Pending Items" value={kpi?.pendingApprovals} icon={FaTasks} color="info" sub="Awaiting approval" onClick={() => navigate('/finance/tasks')} /></Col>
      </Row>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4">
          <h6 className="fw-bold text-muted text-uppercase mb-3">Quick Actions</h6>
          <div className="d-flex flex-wrap gap-3">
            <Button variant="outline-primary" className="rounded-3 d-flex align-items-center gap-2" onClick={() => navigate('/finance/budgets')}><FaWallet /> Create Budget</Button>
            <Button variant="outline-danger" className="rounded-3 d-flex align-items-center gap-2" onClick={() => navigate('/finance/expenses')}><FaReceipt /> Record Expense</Button>
            <Button variant="outline-success" className="rounded-3 d-flex align-items-center gap-2" onClick={() => navigate('/finance/payments')}><FaCreditCard /> Process Payment</Button>
            <Button variant="outline-info" className="rounded-3 d-flex align-items-center gap-2" onClick={() => navigate('/finance/tasks')}><FaTasks /> Finance Tasks</Button>
          </div>
        </Card.Body>
      </Card>

      {/* Analytics Row */}
      <Row className="g-4">
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-4">Budget vs Actual by Category</h6>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={budgetVsActual} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: any) => `$${v.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="planned" fill="#2c3e50" radius={[4, 4, 0, 0]} name="Planned" />
                  <Bar dataKey="actual" fill="#e67e22" radius={[4, 4, 0, 0]} name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-4">Monthly Expense Trend</h6>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={expenseTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: any) => `$${v.toLocaleString()}`} />
                  <Line type="monotone" dataKey="amount" stroke="#e74c3c" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
