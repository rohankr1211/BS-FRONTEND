import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FaBuilding, FaMoneyBillWave, FaShieldAlt, FaUsersCog, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import mockService from '../../services/analyticsService';
import type { 
  DashboardSummaryRecord, ProjectTrendRecord, 
  ProjectHealthRecord, SafetyComplianceRecord 
} from '../../services/analyticsService';
import { ChartCard } from '../../components/common/ChartCard';

export const DashboardOverview: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummaryRecord | null>(null);
  const [trends, setTrends] = useState<ProjectTrendRecord[]>([]);
  const [health, setHealth] = useState<ProjectHealthRecord[]>([]);
  const [safety, setSafety] = useState<SafetyComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumData, trendData, healthData, safetyData] = await Promise.all([
          mockService.getDashboardSummary(),
          mockService.getProjectProgressTrends(),
          mockService.getAllProjectHealth(),
          mockService.getSafetyComplianceBreakdown()
        ]);
        setSummary(sumData);
        setTrends(trendData);
        setHealth(healthData);
        setSafety(safetyData);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderKpiCard = (title: string, value: any, icon: any, colorClass: string, subtext?: React.ReactNode) => (
    <Card className="border-0 shadow-sm rounded-4 h-100">
      <Card.Body className="p-4 d-flex align-items-center justify-content-between">
        <div>
          <p className="text-muted small fw-bold text-uppercase tracking-wider mb-1">{title}</p>
          <h2 className="fw-bold mb-0 text-dark">{value}</h2>
          {subtext && <div className="mt-2 small">{subtext}</div>}
        </div>
        <div className={`p-3 rounded-circle bg-${colorClass} bg-opacity-10 text-${colorClass}`}>
          {icon}
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Overview Dashboard</h3>
          <p className="text-muted mb-0">High-level aggregations across all connected modules.</p>
        </div>
      </div>

      {/* KPI Row */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          {renderKpiCard(
            "Active Projects", 
            loading ? '-' : summary?.activeProjects, 
            <FaBuilding size={24} />, 
            "primary"
          )}
        </Col>
        <Col md={3}>
          {renderKpiCard(
            "Avg Budget Variance", 
            loading ? '-' : `${summary?.averageBudgetVariance}%`, 
            <FaMoneyBillWave size={24} />, 
            (summary?.averageBudgetVariance || 0) < 0 ? "danger" : "success",
            <span className={`fw-bold text-${(summary?.averageBudgetVariance || 0) < 0 ? 'danger' : 'success'}`}>
              {(summary?.averageBudgetVariance || 0) < 0 ? <FaArrowDown className="me-1" /> : <FaArrowUp className="me-1" />}
              vs target
            </span>
          )}
        </Col>
        <Col md={3}>
          {renderKpiCard(
            "Safety Compliance", 
            loading ? '-' : `${summary?.safetyComplianceRate}%`, 
            <FaShieldAlt size={24} />, 
            (summary?.safetyComplianceRate || 0) >= 90 ? "success" : "warning"
          )}
        </Col>
        <Col md={3}>
          {renderKpiCard(
            "Resource Utilization", 
            loading ? '-' : `${((summary?.resourceUtilization || 0) * 100).toFixed(0)}%`, 
            <FaUsersCog size={24} />, 
            "info",
            <div className="progress mt-2" style={{ height: '6px' }}>
              <div 
                className="progress-bar bg-info" 
                style={{ width: `${(summary?.resourceUtilization || 0) * 100}%` }}
              />
            </div>
          )}
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="g-4 mb-4">
        <Col lg={8}>
          <ChartCard title="Overall Project Progress Over Time" loading={loading} height={350}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${value}%`, 'Completion']}
                />
                <Line 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="var(--bs-primary)" 
                  strokeWidth={4} 
                  dot={{ r: 4, strokeWidth: 2 }} 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Col>

        <Col lg={4}>
          <ChartCard title="Safety Compliance Breakdown" loading={loading} height={350}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={safety}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="category"
                  stroke="none"
                >
                  {safety.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${value}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="d-flex flex-wrap justify-content-center gap-3 mt-3">
              {safety.map((item, idx) => (
                <div key={idx} className="d-flex align-items-center gap-2 small">
                  <div style={{ width: '12px', height: '12px', backgroundColor: item.color, borderRadius: '2px' }}></div>
                  <span className="text-muted">{item.category}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </Col>

        <Col lg={12}>
          <ChartCard title="Budget Variance by Project (USD)" loading={loading} height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={health} margin={{ top: 20, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="projectName" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${(val/1000)}k`} />
                <Tooltip 
                  cursor={{ fill: '#f8f9fa' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Variance']}
                />
                <Bar dataKey="budgetVariance" radius={[4, 4, 0, 0]}>
                  {health.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.budgetVariance < 0 ? 'var(--bs-danger)' : 'var(--bs-success)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Col>
      </Row>
    </div>
  );
};
