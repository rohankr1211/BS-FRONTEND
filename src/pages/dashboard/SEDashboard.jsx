import React, { useEffect, useState } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { StatWidget } from '../../components/dashboard/StatWidget';
import analyticsService from '../../services/analyticsService';

export const SEDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await analyticsService.getSiteProgressSummary();
      setStats(data);
    } catch (err) {
      console.error('Failed to load Site Engineer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h3 className="mb-4 fw-bold">Site Engineer Overview</h3>
      <Row className="g-4 mb-4">
        <Col md={4}>
          <StatWidget 
            title="Daily Logs"
            value={stats?.dailyLogs || 0}
            icon="📝"
            color="primary"
          />
        </Col>
        <Col md={4}>
          <StatWidget 
            title="Issues Resolved"
            value={stats?.issuesResolved || 0}
            icon="✅"
            color="success"
          />
        </Col>
        <Col md={4}>
          <StatWidget 
            title="Tasks Completed"
            value={stats?.tasksCompleted || 0}
            icon="📋"
            color="info"
          />
        </Col>
        <Col md={4}>
          <StatWidget 
            title="Safety Score"
            value={`${stats?.safetyScore || 0}%`}
            icon="🛡️"
            color="warning"
          />
        </Col>
        <Col md={4}>
          <StatWidget 
            title="Equipment Utilization"
            value={`${stats?.equipmentUtilization || 0}%`}
            icon="⚙️"
            color="secondary"
          />
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <div className="text-muted mt-3">Loading dashboard data...</div>
        </div>
      ) : stats ? (
        <Row className="g-4">
          <Col md={6}>
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h5 className="fw-bold mb-3">Recent Activity</h5>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Last Login:</span>
                  <span className="fw-bold">{new Date(stats.lastLogin).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Active Issues:</span>
                  <span className="fw-bold text-danger">{stats.activeIssues || 0}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Tasks Due:</span>
                  <span className="fw-bold text-warning">{stats.tasksDue || 0}</span>
                </div>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h5 className="fw-bold mb-3">Performance Metrics</h5>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Productivity:</span>
                  <div className="progress flex-grow-1">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${stats?.productivity || 0}%` }}
                    ></div>
                  </div>
                  <span className="fw-bold">{stats?.productivity || 0}%</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Quality Score:</span>
                  <span className="fw-bold text-success">{stats?.qualityScore || 0}%</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">On-Time Delivery:</span>
                  <span className="fw-bold text-info">{stats?.onTimeDelivery || 0}%</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      ) : (
        <div className="text-center py-5">
          <div className="text-muted">No dashboard data available.</div>
        </div>
      )}
    </div>
  );
};
