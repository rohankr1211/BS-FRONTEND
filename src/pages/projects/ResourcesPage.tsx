import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, Table, Modal, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaPlus, FaTools, FaUsers, FaBoxOpen, FaCheckCircle, FaExclamationTriangle, FaHourglassHalf, FaInfoCircle } from 'react-icons/fa';
import { resourceService } from '../../services/resourceService';
import type { Resource } from '../../services/resourceService';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'success',
  UNAVAILABLE: 'danger',
  MAINTENANCE: 'warning',
  BUDGET_APPROVED: 'success',
  BUDGET_PENDING: 'warning',
  BUDGET_REJECTED: 'danger',
  NONE: 'secondary'
};

const PROJECTS = [{ id: 'PRJ-001', name: 'Metro Tower A' }, { id: 'PRJ-002', name: 'Riverfront Marina' }];

const ResourceModal: React.FC<{ show: boolean; onHide: () => void; onCreated: () => void }> = ({ show, onHide, onCreated }) => {
  const [form, setForm] = useState<Partial<Resource>>({ type: 'LABOR', availability: 'AVAILABLE', costPerHour: 0, totalHours: 0, projectId: '', purpose: '' });
  const [submitting, setSubmitting] = useState(false);

  const totalCost = (form.costPerHour || 0) * (form.totalHours || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await resourceService.addResource({ ...form, totalCost });
    onCreated(); onHide();
    setSubmitting(false);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Add New Resource</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group><Form.Label className="small fw-bold">RESOURCE TYPE</Form.Label>
                <Form.Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} className="rounded-3">
                  <option value="LABOR">Labor</option><option value="EQUIPMENT">Equipment</option><option value="MATERIAL">Material</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group><Form.Label className="small fw-bold">AVAILABILITY</Form.Label>
                <Form.Select value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value as any })} className="rounded-3">
                  <option value="AVAILABLE">Available</option><option value="UNAVAILABLE">Unavailable</option><option value="MAINTENANCE">Maintenance</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {form.type === 'LABOR' && (
              <>
                <Col md={6}><Form.Group><Form.Label className="small fw-bold">NUMBER OF LABORS</Form.Label><Form.Control type="number" onChange={e => setForm({ ...form, numberOfLabors: Number(e.target.value) })} className="rounded-3" /></Form.Group></Col>
                <Col md={6}><Form.Group><Form.Label className="small fw-bold">SKILL LEVEL</Form.Label>
                  <Form.Select onChange={e => setForm({ ...form, skillLevel: e.target.value as any })} className="rounded-3">
                    <option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="EXPERT">Expert</option>
                  </Form.Select>
                </Form.Group></Col>
              </>
            )}

            {form.type === 'EQUIPMENT' && (
              <>
                <Col md={6}><Form.Group><Form.Label className="small fw-bold">EQUIPMENT NAME</Form.Label><Form.Control onChange={e => setForm({ ...form, equipmentName: e.target.value })} className="rounded-3" /></Form.Group></Col>
                <Col md={6}><Form.Group><Form.Label className="small fw-bold">EQUIPMENT LEVEL</Form.Label>
                  <Form.Select onChange={e => setForm({ ...form, equipmentLevel: e.target.value as any })} className="rounded-3">
                    <option value="BASIC">Basic</option><option value="ADVANCED">Advanced</option><option value="SPECIALIZED">Specialized</option>
                  </Form.Select>
                </Form.Group></Col>
              </>
            )}

            <Col md={4}><Form.Group><Form.Label className="small fw-bold">COST PER HOUR ($)</Form.Label><Form.Control type="number" value={form.costPerHour} onChange={e => setForm({ ...form, costPerHour: Number(e.target.value) })} className="rounded-3" /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label className="small fw-bold">TOTAL HOURS</Form.Label><Form.Control type="number" value={form.totalHours} onChange={e => setForm({ ...form, totalHours: Number(e.target.value) })} className="rounded-3" /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label className="small fw-bold">TOTAL ESTIMATED COST</Form.Label><div className="fs-4 fw-bold text-success">${totalCost.toLocaleString()}</div></Form.Group></Col>

            <Col md={6}>
              <Form.Group><Form.Label className="small fw-bold">ASSIGN TO PROJECT</Form.Label>
                <Form.Select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} required className="rounded-3">
                  <option value="">Select Project...</option>
                  {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={12}><Form.Group><Form.Label className="small fw-bold">PURPOSE</Form.Label><Form.Control as="textarea" rows={2} value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} className="rounded-3" /></Form.Group></Col>
          </Row>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="light" className="rounded-3" onClick={onHide}>Cancel</Button>
            <Button variant="success" type="submit" className="rounded-3 px-4" disabled={submitting}>{submitting ? 'Adding...' : 'Add Resource'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = async () => { setLoading(true); setResources(await resourceService.getResources()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const getIcon = (type: string) => {
    if (type === 'LABOR') return <FaUsers className="text-primary" />;
    if (type === 'EQUIPMENT') return <FaTools className="text-warning" />;
    return <FaBoxOpen className="text-info" />;
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h3 className="fw-bold mb-1">Resource Management</h3><p className="text-muted mb-0">Track labor, equipment, and materials across projects.</p></div>
        <Button variant="success" className="rounded-3 d-flex align-items-center gap-2" onClick={() => setShowModal(true)}><FaPlus /> Add Resource</Button>
      </div>

      {loading ? <div className="text-center py-5 text-muted">Loading resources...</div> : (
        <Row className="g-4">
          {resources.map(res => (
            <Col md={6} lg={4} key={res.resourceId}>
              <Card className="border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden">
                <div className={`position-absolute top-0 end-0 p-3 bg-${STATUS_COLORS[res.availability]} bg-opacity-10 text-${STATUS_COLORS[res.availability]} rounded-bottom-start small fw-bold`}>
                  {res.availability}
                </div>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="bg-light p-3 rounded-4">{getIcon(res.type)}</div>
                    <div>
                      <h6 className="fw-bold mb-0">{res.type === 'LABOR' ? `${res.numberOfLabors}x ${res.skillLevel} Labor` : res.equipmentName || 'Resource'}</h6>
                      <div className="small text-muted">{res.projectName}</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="small text-muted mb-2 text-truncate-2" style={{ height: '40px' }}>{res.purpose}</p>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small text-muted">Budget Status</span>
                      <Badge bg={STATUS_COLORS[res.budgetStatus]} className={res.budgetStatus === 'BUDGET_PENDING' ? 'text-dark' : ''}>
                        {res.budgetStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="border-top pt-3 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="small text-muted">Total Cost</div>
                      <div className="fw-bold text-dark">${res.totalCost.toLocaleString()}</div>
                    </div>
                    <Button variant="light" size="sm" className="rounded-3">View Details</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      <ResourceModal show={showModal} onHide={() => setShowModal(false)} onCreated={load} />
    </div>
  );
};
