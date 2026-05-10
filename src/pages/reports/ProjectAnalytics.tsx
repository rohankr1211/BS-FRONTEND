import React, { useState, useEffect } from 'react';
import { Row, Col, Card, ProgressBar, Badge, Modal, Table } from 'react-bootstrap';
import { FaBuilding, FaExclamationCircle } from 'react-icons/fa';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import mockService from '../../services/analyticsService';
import type { 
  ProjectSummaryRecord, BudgetAlertRecord, CashFlowRecord, ProjectHealthRecord 
} from '../../services/analyticsService';
import { ChartCard } from '../../components/common/ChartCard';

export const ProjectAnalytics: React.FC = () => {
  const [projects, setProjects] = useState<ProjectSummaryRecord[]>([]);
  const [healthData, setHealthData] = useState<ProjectHealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedProject, setSelectedProject] = useState<ProjectSummaryRecord | null>(null);
  const [alerts, setAlerts] = useState<BudgetAlertRecord[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowRecord[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const [projRes, healthRes] = await Promise.all([
          mockService.getProjectSummaries(),
          mockService.getAllProjectHealth()
        ]);
        setProjects(projRes);
        setHealthData(healthRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBaseData();
  }, []);

  const handleProjectClick = async (project: ProjectSummaryRecord) => {
    setSelectedProject(project);
    setModalLoading(true);
    try {
      const [alertRes, cashFlowRes] = await Promise.all([
        mockService.getProjectBudgetAlerts(project.projectId),
        mockService.getProjectCashFlow(project.projectId)
      ]);
      setAlerts(alertRes);
      setCashFlow(cashFlowRes);
    } catch (e) {
      console.error(e);
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'COMPLETED') return 'success';
    if (status === 'IN_PROGRESS' || status === 'ON_TRACK') return 'primary';
    if (status === 'DELAYED') return 'danger';
    return 'secondary';
  };

  const getSeverityBadge = (severity: string) => {
    const bg = severity === 'HIGH' ? 'danger' : severity === 'MEDIUM' ? 'warning text-dark' : 'info';
    return <Badge bg={bg}>{severity}</Badge>;
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Project Analytics</h3>
        <p className="text-muted mb-0">Monitor health, budget, and progress across all active sites.</p>
      </div>

      <Row className="g-4">
        {loading ? (
          <div className="text-center py-5 w-100 text-muted">Loading project data...</div>
        ) : (
          projects.map(proj => (
            <Col md={6} lg={4} key={proj.projectId}>
              <Card 
                className="border-0 shadow-sm rounded-4 h-100 group-hover" 
                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                onClick={() => handleProjectClick(proj)}
              >
                <Card.Body className="p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                      <FaBuilding size={20} />
                    </div>
                    <Badge bg={getStatusColor(proj.status)} className="bg-opacity-10 text-dark border border-secondary border-opacity-10">
                      {proj.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h5 className="fw-bold mb-1">{proj.projectName}</h5>
                  <p className="small text-muted font-monospace">{proj.projectId}</p>
                  
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small fw-semibold text-muted">Progress</span>
                      <span className="small fw-bold">{proj.progressPercent}%</span>
                    </div>
                    <ProgressBar variant={getStatusColor(proj.status)} now={proj.progressPercent} style={{ height: '6px' }} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Drill-down Modal */}
      <Modal show={!!selectedProject} onHide={() => setSelectedProject(null)} size="xl" centered>
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bold">
            {selectedProject?.projectName} <span className="text-muted fs-6 fw-normal ms-2">Analytics Drill-down</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 bg-light">
          {modalLoading ? (
            <div className="text-center py-5 text-muted">Loading detailed analytics...</div>
          ) : selectedProject ? (
            <Row className="g-4">
              {/* Health Summary */}
              <Col lg={4}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Body className="p-4">
                    <h6 className="fw-bold mb-4">Project Health Index</h6>
                    {(() => {
                      const health = healthData.find(h => h.projectId === selectedProject.projectId);
                      return health ? (
                        <div className="d-flex flex-column gap-3">
                          <div className="p-3 bg-light rounded-3 border">
                            <span className="d-block small text-muted text-uppercase mb-1">Cost Performance (CPI)</span>
                            <span className={`fs-4 fw-bold text-${health.costPerformanceIndex >= 1 ? 'success' : 'danger'}`}>
                              {health.costPerformanceIndex.toFixed(2)}
                            </span>
                          </div>
                          <div className="p-3 bg-light rounded-3 border">
                            <span className="d-block small text-muted text-uppercase mb-1">Schedule Variance</span>
                            <span className={`fs-4 fw-bold text-${health.scheduleVariance >= 0 ? 'success' : 'danger'}`}>
                              {health.scheduleVariance > 0 ? '+' : ''}{health.scheduleVariance} days
                            </span>
                          </div>
                          <div className="p-3 bg-light rounded-3 border">
                            <span className="d-block small text-muted text-uppercase mb-1">Budget Variance</span>
                            <span className={`fs-4 fw-bold text-${health.budgetVariance >= 0 ? 'success' : 'danger'}`}>
                              ${health.budgetVariance.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted">No health data.</div>
                      );
                    })()}
                  </Card.Body>
                </Card>
              </Col>

              {/* Cash Flow Combo Chart */}
              <Col lg={8}>
                <ChartCard title="Cash Flow (Invoices vs Payments)" height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={cashFlow} margin={{ top: 20, right: 20, bottom: 0, left: 20 }}>
                      <CartesianGrid stroke="#f5f5f5" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tickFormatter={(val) => `$${val/1000}k`} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(val: number) => `$${val.toLocaleString()}`}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="invoices" barSize={30} fill="var(--bs-primary)" name="Invoices" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="left" type="monotone" dataKey="payments" stroke="var(--bs-success)" strokeWidth={3} name="Payments" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Col>

              {/* Budget Alerts Table */}
              <Col lg={12}>
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Header className="bg-white border-bottom p-4">
                    <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                      <FaExclamationCircle className="text-warning" />
                      Budget Alerts
                    </h6>
                  </Card.Header>
                  <Table hover className="mb-0">
                    <thead className="bg-light text-muted small text-uppercase">
                      <tr>
                        <th className="py-3 px-4 border-bottom-0">Planned Amount</th>
                        <th className="py-3 px-4 border-bottom-0">Actual Amount</th>
                        <th className="py-3 px-4 border-bottom-0">Variance</th>
                        <th className="py-3 px-4 border-bottom-0">Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-4 text-muted">No active budget alerts.</td></tr>
                      ) : (
                        alerts.map((alert, idx) => (
                          <tr key={idx}>
                            <td className="py-3 px-4 font-monospace">${alert.plannedAmount.toLocaleString()}</td>
                            <td className="py-3 px-4 font-monospace">${alert.actualAmount.toLocaleString()}</td>
                            <td className="py-3 px-4 text-danger fw-bold">+{alert.variancePercent}%</td>
                            <td className="py-3 px-4">{getSeverityBadge(alert.severity)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </Card>
              </Col>
            </Row>
          ) : null}
        </Modal.Body>
      </Modal>
    </div>
  );
};
