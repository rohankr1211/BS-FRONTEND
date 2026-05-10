import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { StatWidget } from '../../components/dashboard/StatWidget';

export const SEDashboard: React.FC = () => {
  return (
    <div>
      <h3 className="mb-4 fw-bold">Site Engineer Overview</h3>
      <Row className="g-4 mb-4">
        <Col md={4}>
          <StatWidget 
            title="My Active Tasks" 
            value="8" 
            icon="FaTasks" 
            subtitle={<><span className="text-warning fw-bold">3</span> due today</>}
            borderLeftColor="var(--bs-primary)"
          />
        </Col>
        <Col md={4}>
          <StatWidget 
            title="Daily Site Logs" 
            value="Pending" 
            icon="FaClipboardList" 
            iconColor="text-warning"
            subtitle={<span className="text-muted">Submit before EOD</span>}
            borderLeftColor="var(--bs-warning)"
          />
        </Col>
        <Col md={4}>
          <StatWidget 
            title="Material Requests" 
            value="2" 
            icon="FaBoxes" 
            iconColor="text-info"
            subtitle={<span className="text-muted">Awaiting PM approval</span>}
            borderLeftColor="var(--bs-info)"
          />
        </Col>
      </Row>
      <div className="p-5 bg-white rounded-4 shadow-sm text-center">
        <p className="text-muted mb-0">Daily logging tools and immediate task lists will go here.</p>
      </div>
    </div>
  );
};
