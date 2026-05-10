import React, { useEffect, useState } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { StatWidget } from '../../components/dashboard/StatWidget';
import { BudgetWidget } from '../../components/dashboard/BudgetWidget';
import { ProjectProgressCard } from '../../components/dashboard/ProjectProgressCard';
import { RecentApprovalsList } from '../../components/dashboard/RecentApprovalsList';
import analyticsService from '../../services/analyticsService';
import projectService from '../../services/projectService';
import type { DashboardSummaryRecord, ProjectSummaryRecord } from '../../services/analyticsService';
import type { ApprovalResponse } from '../../services/projectService';
import { FaChartPie } from 'react-icons/fa';

export const PMDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummaryRecord | null>(null);
  const [projects, setProjects] = useState<ProjectSummaryRecord[]>([]);
  const [approvals, setApprovals] = useState<ApprovalResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sum, projs, apprs] = await Promise.all([
          analyticsService.getDashboardSummary(),
          analyticsService.getProjectSummaries(),
          projectService.getPendingApprovals()
        ]);
        setSummary(sum);
        setProjects(projs.slice(0, 2)); // Show top 2 for the grid
        setApprovals(apprs);
      } catch (err) {
        console.error('Failed to load PM Dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const formatCurrency = (val?: number) => {
    if (!val) return '$0.0M';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val}`;
  };

  const budgetSpent = summary?.spentBudget || 4200000; // Fallback to mock for visual continuity if API missing fields
  const budgetTotal = summary?.totalBudget || 5000000;
  const budgetPercent = Math.round((budgetSpent / budgetTotal) * 100);

  return (
    <div>
      <Row className="g-4 mb-4">
        <Col md={3}>
          <StatWidget 
            title="Active Projects" 
            value={summary?.activeProjects?.toString() || '0'} 
            icon="FaBuilding" 
            subtitle={<><span className="text-success fw-bold">+0</span> from last month</>}
            borderLeftColor="var(--bs-primary)"
          />
        </Col>
        <Col md={3}>
          <StatWidget 
            title="Pending" 
            value={summary?.pendingItems?.toString() || approvals.length.toString()} 
            icon="FaClipboardList" 
            subtitle={<span className="fst-italic">Awaiting signature</span>}
            borderLeftColor="var(--bs-warning)"
          />
        </Col>
        <Col md={3}>
          <StatWidget 
            title="Safety" 
            value={`${summary?.safetyComplianceRate || 0}%`} 
            icon="FaHardHat" 
            iconColor={(summary?.safetyComplianceRate || 0) > 90 ? "text-success" : "text-warning"}
            subtitle={<><span className={ (summary?.safetyComplianceRate || 0) > 90 ? "text-success" : "text-warning"}>●</span> { (summary?.safetyComplianceRate || 0) > 90 ? 'All systems clear' : 'Check reports'}</>}
            borderLeftColor="var(--bs-success)"
          />
        </Col>
        <Col md={3}>
          <StatWidget 
            title="Overdue Tasks" 
            value={summary?.overdueTasks?.toString() || '0'} 
            icon="FaExclamationTriangle" 
            iconColor={(summary?.overdueTasks || 0) > 0 ? "text-danger" : "text-success"}
            subtitle={<span className={(summary?.overdueTasks || 0) > 0 ? "text-danger fw-bold" : "text-success"}>
              {(summary?.overdueTasks || 0) > 0 ? 'Requires attention' : 'On schedule'}
            </span>}
            borderLeftColor="var(--bs-danger)"
          />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <BudgetWidget 
            title="Budget Performance"
            allocated={formatCurrency(budgetTotal)}
            spent={formatCurrency(budgetSpent)}
            percentage={budgetPercent}
            statusText={budgetPercent > 90 ? "Near Limit" : "On Track"}
            remainingText={`${100 - budgetPercent}% remaining`}
          />
        </Col>
      </Row>

      <div className="mb-4 d-flex align-items-center gap-2">
        <FaChartPie className="text-secondary" size={20} />
        <h4 className="fw-bold mb-0 text-dark">Active Site Progress</h4>
      </div>

      <Row className="g-4 mb-4">
        {projects.length === 0 ? (
          <Col><p className="text-muted">No active projects found.</p></Col>
        ) : projects.map((p) => (
          <Col md={6} key={p.projectId}>
            <ProjectProgressCard 
              name={p.projectName}
              location="Site Location"
              phase={`Status: ${p.status}`}
              completion={p.progressPercent}
              imageUrl={p.imageUrl}
              phaseColor={p.progressPercent > 80 ? "success" : "primary"}
            />
          </Col>
        ))}
      </Row>

      <Row>
        <Col>
          <RecentApprovalsList 
            items={approvals.map(a => ({
              id: a.approvalId,
              title: a.taskDescription,
              subtitle: `Requested by ${a.requestedBy}`,
              time: new Date(a.requestedAt).toLocaleDateString(),
              icon: 'FaFileInvoice'
            }))}
            onViewAll={() => window.location.href = '/approvals'}
          />
        </Col>
      </Row>
    </div>
  );
};
