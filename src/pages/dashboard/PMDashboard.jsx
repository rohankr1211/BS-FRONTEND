import React, { useEffect, useState } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { StatWidget } from '../../components/dashboard/StatWidget';
import { BudgetWidget } from '../../components/dashboard/BudgetWidget';
import { ProjectProgressCard } from '../../components/dashboard/ProjectProgressCard';
import { RecentApprovalsList } from '../../components/dashboard/RecentApprovalsList';
import analyticsService from '../../services/analyticsService';
import projectService from '../../services/projectService';
import { FaChartPie } from 'react-icons/fa';

export const PMDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [sum, projs, apprs] = await Promise.all([
          analyticsService.getDashboardSummary(),
          analyticsService.getProjectSummaries(),
          projectService.getPendingApprovals()
        ]);
        setSummary(sum);
        setProjects(projs.slice(0, 2)); // Show top 2 for grid
        setApprovals(apprs);
      } catch (err) {
        console.error('Dashboard data load error:', err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <div className="text-muted mt-3">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Project Manager Dashboard</h3>
          <p className="text-muted mb-0">Project overview and management.</p>
        </div>
      </div>

      {summary && (
        <Row className="g-4 mb-4">
          <Col lg={3} md={6}>
            <StatWidget
              title="Active Projects"
              value={summary.activeProjects}
              icon="🏗️"
              color="primary"
            />
          </Col>
          <Col lg={3} md={6}>
            <StatWidget
              title="Total Budget"
              value={`$${summary.totalBudget?.toLocaleString() || '0'}`}
              icon="💰"
              color="success"
            />
          </Col>
          <Col lg={3} md={6}>
            <StatWidget
              title="Pending Approvals"
              value={summary.pendingApprovals}
              icon="📋"
              color="warning"
            />
          </Col>
          <Col lg={3} md={6}>
            <StatWidget
              title="Team Members"
              value={summary.teamMembers}
              icon="👥"
              color="info"
            />
          </Col>
        </Row>
      )}

      <Row className="g-4">
        <Col lg={8}>
          <Row className="g-4">
            {projects.map(project => (
              <Col lg={12} key={project.projectId}>
                <ProjectProgressCard project={project} />
              </Col>
            ))}
          </Row>
        </Col>
        <Col lg={4}>
          <BudgetWidget summary={summary} />
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={12}>
          <RecentApprovalsList approvals={approvals} />
        </Col>
      </Row>
    </div>
  );
};
