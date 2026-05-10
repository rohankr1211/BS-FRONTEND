import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Modal } from 'react-bootstrap';
import { FaLayerGroup, FaClock, FaDollarSign, FaFlag } from 'react-icons/fa';
import projectService from '../../services/projectService';
import type { TemplateResponse } from '../../services/projectService';

const TemplateDetailModal: React.FC<{ template: TemplateResponse | null; onHide: () => void }> = ({ template, onHide }) => (
  <Modal show={!!template} onHide={onHide} centered size="lg">
    <Modal.Header closeButton className="border-0">
      <Modal.Title className="fw-bold">{template?.templateName}</Modal.Title>
    </Modal.Header>
    {template && (
      <Modal.Body className="p-4 bg-light">
        <p className="text-muted mb-4">{template.description}</p>
        <Row className="g-3 mb-4">
          <Col xs={4}><Card className="border-0 rounded-4 text-center p-3"><FaClock className="text-primary mb-1" size={20} /><div className="small text-muted">Duration</div><div className="fw-bold">{template.estimatedDuration} months</div></Card></Col>
          <Col xs={4}><Card className="border-0 rounded-4 text-center p-3"><FaDollarSign className="text-success mb-1" size={20} /><div className="small text-muted">Default Budget</div><div className="fw-bold">${(template.defaultBudget / 1e6).toFixed(1)}M</div></Card></Col>
          <Col xs={4}><Card className="border-0 rounded-4 text-center p-3"><FaFlag className="text-warning mb-1" size={20} /><div className="small text-muted">Milestones</div><div className="fw-bold">{template.milestoneCount}</div></Card></Col>
        </Row>
        <h6 className="fw-bold mb-3">Milestone Breakdown</h6>
        <div className="d-flex flex-column gap-2">
          {template.milestones.map(m => (
            <div key={m.order} className="d-flex align-items-center gap-3 p-3 bg-white rounded-3 border">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: 32, height: 32, fontSize: 13 }}>
                {m.order}
              </div>
              <div className="flex-grow-1 fw-semibold">{m.name}</div>
              <Badge bg="light" text="dark" className="border">{m.durationWeeks} weeks</Badge>
            </div>
          ))}
        </div>
      </Modal.Body>
    )}
    <Modal.Footer className="border-0">
      <Button variant="light" className="rounded-3" onClick={onHide}>Close</Button>
    </Modal.Footer>
  </Modal>
);

export const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TemplateResponse | null>(null);

  useEffect(() => {
    projectService.getTemplates().then(data => { setTemplates(data); setLoading(false); });
  }, []);

  const COLORS = ['primary', 'success', 'warning', 'info', 'secondary'];

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Project Templates</h3>
        <p className="text-muted mb-0">Start a new project faster using a pre-configured template.</p>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading templates...</div>
      ) : (
        <Row className="g-4">
          {templates.map((t, idx) => (
            <Col md={6} lg={4} key={t.templateId}>
              <Card className="border-0 shadow-sm rounded-4 h-100" style={{ transition: 'transform 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = '')}>
                <Card.Body className="p-4 d-flex flex-column">
                  <div className={`bg-${COLORS[idx % COLORS.length]} bg-opacity-10 text-${COLORS[idx % COLORS.length]} p-3 rounded-circle d-inline-flex mb-3`} style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}>
                    <FaLayerGroup size={22} />
                  </div>
                  <h5 className="fw-bold mb-1">{t.templateName}</h5>
                  <p className="small text-muted flex-grow-1">{t.description}</p>
                  <div className="d-flex gap-3 small text-muted mb-4">
                    <span><FaClock className="me-1" />{t.estimatedDuration} months</span>
                    <span><FaDollarSign />${(t.defaultBudget / 1e6).toFixed(1)}M</span>
                    <span><FaFlag className="me-1" />{t.milestoneCount} milestones</span>
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="outline-secondary" size="sm" className="rounded-3 flex-grow-1" onClick={() => setSelected(t)}>
                      View Details
                    </Button>
                    <Button variant="primary" size="sm" className="rounded-3 flex-grow-1">
                      Use Template
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <TemplateDetailModal template={selected} onHide={() => setSelected(null)} />
    </div>
  );
};
