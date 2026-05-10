import React, { useEffect, useState } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { StatWidget } from '../../components/dashboard/StatWidget';
import analyticsService from '../../services/analyticsService';
import type { SiteProgressSummaryRecord } from '../../services/analyticsService';

export const SEDashboard: React.FC = () => {
  const [stats, setStats] = useState<SiteProgressSummaryRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    load();
  }, []);

  return (
    <div>
      <h3 className="mb-4 fw-bold">Site Engineer Overview</h3>
      <Row className="g-4 mb-4">
        <Col md={4}>
          <StatWidget 
            title="Active Sites" 
            value={loading ? <Spinner animation="border" size="sm" /> : stats?.activeSites?.toString() || '0'} 
            icon="FaBuilding" 
            subtitle={<><span className="text-success fw-bold">{stats?.onTrackProjects || 0}</span> projects on track</>}
            borderLeftColor="var(--bs-primary)"
          />
        </Col>
        <Col md={4}>
          <StatWidget 
            title="Daily Site Logs" 
            value={loading ? '-' : (stats?.avgTaskCompletionRate ? `${(stats.avgTaskCompletionRate * 100).toFixed(0)}%` : 'Pending')} 
            icon="FaClipboardList" 
            iconColor="text-warning"
            subtitle={<span className="text-muted">Avg Completion Rate</span>}
            borderLeftColor="var(--bs-warning)"
          />
        </Col>
        <Col md={4}>
          <StatWidget 
            title="Delayed Tasks" 
            value={loading ? '-' : stats?.delayedTasksCount?.toString() || '0'} 
            icon="FaExclamationTriangle" 
            iconColor="text-danger"
            subtitle={<span className="text-danger fw-bold">Action required</span>}
            borderLeftColor="var(--bs-danger)"
          />
        </Col>
      </Row>
      <div className="p-5 bg-white rounded-4 shadow-sm text-center">
        <p className="text-muted mb-0">Daily logging tools and immediate task lists will appear here once connected.</p>
      </div>
    </div>
  );
};
