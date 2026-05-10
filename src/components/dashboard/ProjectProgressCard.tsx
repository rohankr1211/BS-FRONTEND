import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';

interface ProjectProgressCardProps {
  name: string;
  location: string;
  phase: string;
  completion: number;
  imageUrl: string;
  phaseColor?: string;
}

export const ProjectProgressCard: React.FC<ProjectProgressCardProps> = ({
  name,
  location,
  phase,
  completion,
  imageUrl,
  phaseColor = 'primary'
}) => {
  return (
    <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden group-hover">
      <div className="position-relative" style={{ height: '160px' }}>
        <Card.Img variant="top" src={imageUrl} className="h-100 object-fit-cover opacity-75" />
        <div className="position-absolute bottom-0 start-0 p-2">
          <span className={`badge bg-white text-${phaseColor} shadow-sm px-2 py-1`}>
            {phase}
          </span>
        </div>
      </div>
      <Card.Body className="p-4">
        <h5 className="fw-bold text-dark mb-1">{name}</h5>
        <p className="small text-muted mb-4">{location}</p>
        
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="small text-muted">Overall Completion</span>
          <span className="fw-bold">{completion}%</span>
        </div>
        <ProgressBar variant={phaseColor} now={completion} style={{ height: '8px' }} />
      </Card.Body>
    </Card>
  );
};
