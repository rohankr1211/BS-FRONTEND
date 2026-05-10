import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FaShieldAlt, FaCalendarCheck, FaClipboardList, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import mockService from '../../services/analyticsService';
import type { 
  SafetyTrendRecord, SafetyInspectionSummaryRecord 
} from '../../services/analyticsService';
import { ChartCard } from '../../components/common/ChartCard';

export const SafetyAnalytics: React.FC = () => {
  const [trends, setTrends] = useState<SafetyTrendRecord[]>([]);
  const [summary, setSummary] = useState<SafetyInspectionSummaryRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendRes, sumRes] = await Promise.all([
          mockService.getSafetyTrends(),
          mockService.getSafetyInspectionSummary()
        ]);
        setTrends(trendRes);
        setSummary(sumRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Format data for Recharts (pivot by severity)
  const chartData = trends.reduce((acc, curr) => {
    const existing = acc.find(item => item.date === curr.date);
    if (existing) {
      existing[curr.severityCategory] = curr.incidentCount;
    } else {
      acc.push({ 
        date: curr.date, 
        LOW: curr.severityCategory === 'LOW' ? curr.incidentCount : 0,
        MEDIUM: curr.severityCategory === 'MEDIUM' ? curr.incidentCount : 0,
        HIGH: curr.severityCategory === 'HIGH' ? curr.incidentCount : 0
      });
    }
    return acc;
  }, [] as any[]);

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Safety &amp; Compliance</h3>
        <p className="text-muted mb-0">Monitor site safety incidents and inspection statuses.</p>
      </div>

      {summary && (
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-light">
              <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="small text-muted text-uppercase fw-bold mb-1">Scheduled</p>
                  <h2 className="fw-bold text-dark mb-0">{summary.scheduled}</h2>
                </div>
                <FaCalendarCheck size={32} className="text-secondary opacity-25" />
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-light border-start border-warning border-4">
              <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="small text-muted text-uppercase fw-bold mb-1">In Progress</p>
                  <h2 className="fw-bold text-dark mb-0">{summary.inProgress}</h2>
                </div>
                <FaClipboardList size={32} className="text-warning opacity-50" />
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-light border-start border-success border-4">
              <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="small text-muted text-uppercase fw-bold mb-1">Completed</p>
                  <h2 className="fw-bold text-dark mb-0">{summary.completed}</h2>
                </div>
                <FaCheckCircle size={32} className="text-success opacity-50" />
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-light border-start border-danger border-4">
              <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="small text-muted text-uppercase fw-bold mb-1">Overdue</p>
                  <h2 className="fw-bold text-danger mb-0">{summary.overdue}</h2>
                </div>
                <FaExclamationCircle size={32} className="text-danger opacity-50" />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="g-4 mb-4">
        <Col lg={8}>
          <ChartCard title="Incident Trends by Severity" loading={loading} height={350}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="LOW" stroke="var(--bs-info)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="MEDIUM" stroke="var(--bs-warning)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="HIGH" stroke="var(--bs-danger)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-dark text-white">
            <Card.Body className="p-4 d-flex flex-column align-items-center justify-content-center text-center">
              <FaShieldAlt size={48} className={`mb-3 ${summary && summary.complianceRate >= 90 ? 'text-success' : 'text-warning'}`} />
              <h6 className="fw-bold text-uppercase text-white-50 letter-spacing-1 mb-2">Overall Compliance Rate</h6>
              
              {loading || !summary ? (
                <div className="fs-1 fw-bold">--%</div>
              ) : (
                <>
                  <div className="fs-1 fw-bold mb-4">{summary.complianceRate}%</div>
                  
                  {/* Thermometer visualization */}
                  <div className="w-100 position-relative mt-4" style={{ height: '30px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '15px' }}>
                    <div 
                      className={`h-100 rounded-pill ${summary.complianceRate >= 90 ? 'bg-success' : summary.complianceRate >= 70 ? 'bg-warning' : 'bg-danger'}`}
                      style={{ 
                        width: `${summary.complianceRate}%`, 
                        transition: 'width 1s ease-in-out',
                        boxShadow: '0 0 10px rgba(0,0,0,0.5) inset'
                      }}
                    />
                    {/* Thermometer Bulb */}
                    <div 
                      className={`position-absolute ${summary.complianceRate >= 90 ? 'bg-success' : summary.complianceRate >= 70 ? 'bg-warning' : 'bg-danger'}`}
                      style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        left: '-15px', top: '-5px',
                        boxShadow: '0 0 10px rgba(0,0,0,0.5) inset'
                      }}
                    />
                  </div>
                  <div className="w-100 d-flex justify-content-between mt-2 small text-white-50 px-3">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
