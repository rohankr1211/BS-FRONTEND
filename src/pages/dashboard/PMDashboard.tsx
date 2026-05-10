import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { StatWidget } from '../../components/dashboard/StatWidget';
import { BudgetWidget } from '../../components/dashboard/BudgetWidget';
import { ProjectProgressCard } from '../../components/dashboard/ProjectProgressCard';
import { RecentApprovalsList } from '../../components/dashboard/RecentApprovalsList';
import type { ApprovalItem } from '../../components/dashboard/RecentApprovalsList';
import { FaChartPie } from 'react-icons/fa';

const mockApprovals: ApprovalItem[] = [
  { id: '1', title: 'Material Quote: Rebar Supply', subtitle: 'Approved by Sarah Jenkins', time: '2h ago', icon: 'FaFileInvoice' },
  { id: '2', title: 'Subcontractor Invoice: Electrical', subtitle: 'Approved by David Chen', time: '5h ago', icon: 'FaMoneyCheckAlt' },
  { id: '3', title: 'Blueprints: Rev C - Floor 5', subtitle: 'Approved by Marcus Thorne', time: 'Yesterday', icon: 'FaDraftingCompass' },
];

export const PMDashboard: React.FC = () => {
  return (
    <div>
      <Row className="g-4 mb-4">
        <Col md={3}>
          <StatWidget 
            title="Active Projects" 
            value="12" 
            icon="FaBuilding" 
            subtitle={<><span className="text-success fw-bold">+2</span> from last month</>}
            borderLeftColor="var(--bs-primary)"
          />
        </Col>
        <Col md={3}>
          <StatWidget 
            title="Pending" 
            value="5" 
            icon="FaClipboardList" 
            subtitle={<span className="fst-italic">Awaiting signature</span>}
            borderLeftColor="var(--bs-warning)"
          />
        </Col>
        <Col md={3}>
          <StatWidget 
            title="Safety" 
            value="0" 
            icon="FaHardHat" 
            iconColor="text-success"
            subtitle={<><span className="text-success">●</span> All systems clear</>}
            borderLeftColor="var(--bs-success)"
          />
        </Col>
        <Col md={3}>
          <StatWidget 
            title="Overdue Tasks" 
            value="2" 
            icon="FaExclamationTriangle" 
            iconColor="text-danger"
            subtitle={<span className="text-danger fw-bold">Requires attention</span>}
            borderLeftColor="var(--bs-danger)"
          />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <BudgetWidget 
            title="Budget Performance"
            allocated="$5.0M"
            spent="$4.2M"
            percentage={84}
            statusText="On Track"
            remainingText="16% remaining"
          />
        </Col>
      </Row>

      <div className="mb-4 d-flex align-items-center gap-2">
        <FaChartPie className="text-secondary" size={20} />
        <h4 className="fw-bold mb-0 text-dark">Active Site Progress</h4>
      </div>

      <Row className="g-4 mb-4">
        <Col md={6}>
          <ProjectProgressCard 
            name="Skyline Residences"
            location="Downtown Metro District"
            phase="Phase 2: Foundation"
            completion={68}
            imageUrl="https://images.unsplash.com/photo-1541888086425-d81bb19240f5?auto=format&fit=crop&q=80"
            phaseColor="primary"
          />
        </Col>
        <Col md={6}>
          <ProjectProgressCard 
            name="Tech Hub Campus"
            location="Silicon Valley Extension"
            phase="Phase 4: Finishing"
            completion={92}
            imageUrl="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80"
            phaseColor="info"
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <RecentApprovalsList 
            items={mockApprovals}
            onViewAll={() => console.log('View all clicked')}
          />
        </Col>
      </Row>
    </div>
  );
};
