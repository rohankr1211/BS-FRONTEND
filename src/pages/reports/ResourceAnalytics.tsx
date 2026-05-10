import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, ProgressBar } from 'react-bootstrap';
import { FaBoxes, FaUsers, FaTools, FaClock } from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import mockService from '../../services/analyticsService';
import type { 
  ResourceUtilizationRecord, LaborAllocationRecord 
} from '../../services/analyticsService';
import { ChartCard } from '../../components/common/ChartCard';

export const ResourceAnalytics: React.FC = () => {
  const [utilization, setUtilization] = useState<ResourceUtilizationRecord | null>(null);
  const [allocation, setAllocation] = useState<LaborAllocationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [utilRes, allocRes] = await Promise.all([
          mockService.getResourceUtilization(),
          mockService.getLaborAllocation()
        ]);
        setUtilization(utilRes);
        setAllocation(allocRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGaugeColor = (rate: number) => {
    if (rate >= 0.8) return 'var(--bs-success)';
    if (rate >= 0.5) return 'var(--bs-warning)';
    return 'var(--bs-danger)';
  };

  const getProgressVariant = (rate: number) => {
    if (rate >= 0.8) return 'success';
    if (rate >= 0.5) return 'warning';
    return 'danger';
  };

  const gaugeData = utilization ? [
    { name: 'Used', value: utilization.utilizationRate },
    { name: 'Idle', value: 1 - utilization.utilizationRate }
  ] : [];

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Resource &amp; Workforce Analytics</h3>
        <p className="text-muted mb-0">Track labor allocation, equipment uptime, and overall utilization.</p>
      </div>

      {utilization && (
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-light">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-circle">
                    <FaClock size={20} />
                  </div>
                  <span className="small text-muted fw-bold text-uppercase">Used Hours</span>
                </div>
                <h2 className="fw-bold text-dark mb-0">{utilization.usedHours.toLocaleString()}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-light">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="bg-secondary bg-opacity-10 text-secondary p-2 rounded-circle">
                    <FaClock size={20} />
                  </div>
                  <span className="small text-muted fw-bold text-uppercase">Idle Hours</span>
                </div>
                <h2 className="fw-bold text-muted mb-0">{utilization.idleHours.toLocaleString()}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-light">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="bg-info bg-opacity-10 text-info p-2 rounded-circle">
                    <FaUsers size={20} />
                  </div>
                  <span className="small text-muted fw-bold text-uppercase">Total Labor</span>
                </div>
                <h2 className="fw-bold text-dark mb-0">{utilization.totalLabors} <span className="fs-6 fw-normal text-muted">personnel</span></h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-light border-start border-success border-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="bg-success bg-opacity-10 text-success p-2 rounded-circle">
                    <FaTools size={20} />
                  </div>
                  <span className="small text-muted fw-bold text-uppercase">Eqp Uptime</span>
                </div>
                <h2 className="fw-bold text-success mb-0">{utilization.equipmentUptimePercent}%</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="g-4 mb-4">
        <Col lg={4}>
          <ChartCard title="Overall Labor Utilization" loading={loading} height={350}>
            {utilization && (
              <div className="position-relative w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={gaugeData}
                      cx="50%"
                      cy="100%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill={getGaugeColor(utilization.utilizationRate)} />
                      <Cell fill="#f1f3f5" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="position-absolute" style={{ bottom: '20%', textAlign: 'center' }}>
                  <h1 className="display-4 fw-bold mb-0" style={{ color: getGaugeColor(utilization.utilizationRate) }}>
                    {(utilization.utilizationRate * 100).toFixed(0)}%
                  </h1>
                  <span className="text-muted small fw-bold text-uppercase">Utilization Rate</span>
                </div>
              </div>
            )}
          </ChartCard>
        </Col>

        <Col lg={8}>
          <ChartCard title="Labor Allocation vs Available by Site" loading={loading} height={350}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allocation} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="site" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                />
                <Legend />
                <Bar dataKey="allocatedHours" name="Allocated Hours" fill="var(--bs-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="availableHours" name="Available Hours" fill="#ced4da" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-4">
        <Card.Header className="bg-white border-bottom p-4">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <FaBoxes className="text-primary" />
            Allocation Breakdown Table
          </h5>
        </Card.Header>
        <Table hover className="mb-0 align-middle">
          <thead className="bg-light text-muted small text-uppercase">
            <tr>
              <th className="py-3 px-4 border-bottom-0">Site / Project</th>
              <th className="py-3 px-4 border-bottom-0 text-center">Allocated Hours</th>
              <th className="py-3 px-4 border-bottom-0 text-center">Available Hours</th>
              <th className="py-3 px-4 border-bottom-0" style={{ minWidth: '150px' }}>Utilization %</th>
              <th className="py-3 px-4 border-bottom-0 text-center">Headcount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-4 text-muted">Loading allocation data...</td></tr>
            ) : allocation.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4 text-muted">No allocation data available.</td></tr>
            ) : (
              allocation.map((item, idx) => {
                const utilPercent = item.availableHours ? (item.allocatedHours / item.availableHours) * 100 : 0;
                return (
                  <tr key={idx}>
                    <td className="py-3 px-4 fw-bold text-dark">{item.site}</td>
                    <td className="py-3 px-4 text-center font-monospace">{item.allocatedHours}</td>
                    <td className="py-3 px-4 text-center font-monospace text-muted">{item.availableHours}</td>
                    <td className="py-3 px-4">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small fw-bold">{utilPercent.toFixed(1)}%</span>
                      </div>
                      <ProgressBar 
                        variant={getProgressVariant(utilPercent / 100)} 
                        now={utilPercent} 
                        style={{ height: '6px' }} 
                      />
                    </td>
                    <td className="py-3 px-4 text-center fw-semibold">
                      <span className="badge bg-secondary bg-opacity-10 text-dark border border-secondary border-opacity-25 px-2 py-1">
                        <FaUsers className="me-1 opacity-50" /> {item.numberOfLabors}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};
