import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Accordion } from 'react-bootstrap';
import { FaHardHat, FaCheckCircle, FaExclamationTriangle, FaCalendarAlt, FaImage } from 'react-icons/fa';
import mockService from '../../services/analyticsService';
import type { 
  SiteEngineerPerformanceRecord, SiteProgressSummaryRecord, SiteEngineerDailyLogRecord 
} from '../../services/analyticsService';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';

export const SiteEngineerAnalytics: React.FC = () => {
  const { user } = useAuth();
  const isSE = user?.role === Role.SITE_ENGINEER;

  const [performance, setPerformance] = useState<SiteEngineerPerformanceRecord[]>([]);
  const [summary, setSummary] = useState<SiteProgressSummaryRecord | null>(null);
  const [logs, setLogs] = useState<SiteEngineerDailyLogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [perfRes, sumRes, logsRes] = await Promise.all([
          mockService.getSiteEngineerPerformance(),
          mockService.getSiteProgressSummary(),
          mockService.getSiteEngineerDailyLogs()
        ]);
        
        // Mock role filter logic
        if (isSE) {
          setPerformance(perfRes.filter(p => p.engineerId === 'ENG-001'));
          setLogs(logsRes.filter(l => l.engineerId === 'ENG-001'));
        } else {
          setPerformance(perfRes);
          setLogs(logsRes);
        }
        setSummary(sumRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isSE]);

  // Generate a mock heatmap grid for the current month
  const renderHeatmap = () => {
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    return (
      <div className="d-flex flex-wrap gap-1 mt-3">
        {days.map(day => {
          // Mock density based on day
          const intensity = day % 7 === 0 || day % 7 === 6 ? 0 : Math.floor(Math.random() * 4);
          const bgColors = ['bg-light', 'bg-success bg-opacity-25', 'bg-success bg-opacity-50', 'bg-success'];
          return (
            <div 
              key={day} 
              className={`${bgColors[intensity]} rounded`} 
              style={{ width: '20px', height: '20px', border: '1px solid rgba(0,0,0,0.05)' }}
              title={`Day ${day}: ${intensity} logs`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Site Engineer Analytics</h3>
        <p className="text-muted mb-0">Track field execution, daily logs, and site progress.</p>
      </div>

      {!isSE && summary && (
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-primary text-white">
              <Card.Body className="p-4 d-flex flex-column justify-content-center">
                <p className="small text-white-50 text-uppercase fw-bold mb-1">Avg Task Completion</p>
                <h2 className="fw-bold mb-0">{summary.avgTaskCompletionRate}%</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4">
                <p className="small text-muted text-uppercase fw-bold mb-1">Active Sites</p>
                <h2 className="fw-bold text-dark mb-0">{summary.activeSites}</h2>
                <div className="small text-success mt-1"><FaCheckCircle className="me-1"/> {summary.onTrackProjects} on track</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4">
                <p className="small text-muted text-uppercase fw-bold mb-1">Delayed Tasks</p>
                <h2 className="fw-bold text-danger mb-0">{summary.delayedTasksCount}</h2>
                <div className="small text-muted mt-1">Across all engineers</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4">
                <p className="small text-muted text-uppercase fw-bold mb-1">Total Engineers</p>
                <h2 className="fw-bold text-dark mb-0">{summary.totalSiteEngineers}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="g-4 mb-4">
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Header className="bg-white border-bottom p-4">
              <h5 className="fw-bold mb-0">Engineer Performance</h5>
            </Card.Header>
            <Card.Body className="p-4">
              {loading ? (
                <div className="text-center py-4 text-muted">Loading performance...</div>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {performance.map(eng => (
                    <div key={eng.engineerId} className="p-3 border rounded-4 bg-light">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-circle">
                            <FaHardHat size={20} />
                          </div>
                          <div>
                            <h6 className="fw-bold mb-0">{eng.engineerName}</h6>
                            <small className="text-muted">{eng.assignedProject}</small>
                          </div>
                        </div>
                        <Badge bg={eng.qualityScore >= 4.5 ? 'success' : 'warning'} className="fs-6">
                          {eng.qualityScore.toFixed(1)} / 5.0 Q-Score
                        </Badge>
                      </div>
                      <Row className="g-3 text-center">
                        <Col xs={4}>
                          <div className="p-2 bg-white rounded-3 border border-light shadow-sm">
                            <span className="d-block small text-muted">Completed</span>
                            <span className="fw-bold text-success">{eng.tasksCompleted}</span>
                          </div>
                        </Col>
                        <Col xs={4}>
                          <div className="p-2 bg-white rounded-3 border border-light shadow-sm">
                            <span className="d-block small text-muted">Pending</span>
                            <span className="fw-bold text-warning">{eng.tasksPending}</span>
                          </div>
                        </Col>
                        <Col xs={4}>
                          <div className="p-2 bg-white rounded-3 border border-light shadow-sm">
                            <span className="d-block small text-muted">Avg Time</span>
                            <span className="fw-bold text-info">{eng.avgCompletionTimeHours}h</span>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-1 d-flex align-items-center gap-2">
                <FaCalendarAlt className="text-primary" /> Log Density (Last 30 Days)
              </h6>
              <p className="small text-muted mb-0">Frequency of daily log submissions.</p>
              {renderHeatmap()}
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white border-bottom p-4">
              <h6 className="fw-bold mb-0">Recent Daily Logs</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Accordion flush>
                {logs.map((log, idx) => (
                  <Accordion.Item eventKey={idx.toString()} key={log.logId}>
                    <Accordion.Header>
                      <div className="d-flex flex-column">
                        <span className="fw-bold text-dark">{log.siteLocation}</span>
                        <span className="small text-muted">{log.logDate} • {log.engineerName}</span>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body className="bg-light pt-4 pb-4">
                      <p className="mb-3">{log.workDescription}</p>
                      <div className="d-flex flex-wrap gap-3 mb-3">
                        <Badge bg="info" className="bg-opacity-10 text-dark border border-info border-opacity-25 px-2 py-1">
                          {log.hoursWorked} Hours
                        </Badge>
                        {log.issuesReported > 0 && (
                          <Badge bg="danger" className="bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1">
                            <FaExclamationTriangle className="me-1" /> {log.issuesReported} Issues
                          </Badge>
                        )}
                      </div>
                      {/* Mock Photo Gallery */}
                      {log.photosAttached > 0 && (
                        <div>
                          <p className="small fw-bold text-muted text-uppercase mb-2">Attached Photos ({log.photosAttached})</p>
                          <div className="d-flex gap-2">
                            {Array.from({ length: Math.min(log.photosAttached, 3) }).map((_, i) => (
                              <div key={i} className="bg-secondary bg-opacity-25 rounded d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                <FaImage className="text-secondary opacity-50" />
                              </div>
                            ))}
                            {log.photosAttached > 3 && (
                              <div className="bg-light border rounded d-flex align-items-center justify-content-center text-muted small fw-bold" style={{ width: '60px', height: '60px' }}>
                                +{log.photosAttached - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
