import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, Table, Modal, Form, ProgressBar } from 'react-bootstrap';
import { FaPlus, FaLink, FaCalendarAlt, FaChartBar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { resourceService } from '../../services/resourceService';
import type { Allocation, Resource, AllocationCost } from '../../services/resourceService';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'success',
  COMPLETED: 'primary',
  PENDING: 'warning',
  CANCELLED: 'danger',
};

const CreateAllocationModal: React.FC<{ resources: Resource[]; show: boolean; onHide: () => void; onCreated: () => void }> = ({ resources, show, onHide, onCreated }) => {
  const [form, setForm] = useState<Partial<Allocation>>({ projectId: 'PRJ-001', resourceId: '', assignedDate: new Date().toISOString().split('T')[0] });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await resourceService.createAllocation(form);
    onCreated(); onHide();
    setSubmitting(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Create Resource Allocation</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">SELECT RESOURCE *</Form.Label>
            <Form.Select value={form.resourceId} onChange={e => setForm({ ...form, resourceId: e.target.value })} required className="rounded-3">
              <option value="">Choose available resource...</option>
              {resources.filter(r => r.availability === 'AVAILABLE' && r.budgetStatus === 'BUDGET_APPROVED').map(r => (
                <option key={r.resourceId} value={r.resourceId}>
                  {r.resourceId} - {r.type === 'LABOR' ? `${r.numberOfLabors}x Labor` : r.equipmentName} (${r.costPerHour}/hr)
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">ASSIGNED DATE *</Form.Label>
            <Form.Control type="date" value={form.assignedDate} onChange={e => setForm({ ...form, assignedDate: e.target.value })} required className="rounded-3" />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold">SITE / LOCATION ID</Form.Label>
            <Form.Control placeholder="e.g. SITE-001" value={form.siteId} onChange={e => setForm({ ...form, siteId: e.target.value })} className="rounded-3" />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="light" className="rounded-3" onClick={onHide}>Cancel</Button>
            <Button variant="success" type="submit" className="rounded-3 px-4" disabled={submitting}>Allocate Resource</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const AllocationsPage: React.FC = () => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAlloc, setSelectedAlloc] = useState<AllocationCost | null>(null);

  const load = async () => {
    setLoading(true);
    const [a, r] = await Promise.all([resourceService.getAllocations(), resourceService.getResources()]);
    setAllocations(a); setResources(r); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const viewCost = async (id: string) => {
    const cost = await resourceService.getCostAnalysis(id);
    setSelectedAlloc(cost);
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h3 className="fw-bold mb-1">Resource Allocations</h3><p className="text-muted mb-0">Manage active assignments and track utilization costs.</p></div>
        <Button variant="success" className="rounded-3 d-flex align-items-center gap-2" onClick={() => setShowModal(true)}><FaLink /> New Allocation</Button>
      </div>

      {loading ? <div className="text-center py-5 text-muted">Loading allocations...</div> : (
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="py-3 px-4 border-0">Allocation ID</th>
                <th className="py-3 px-4 border-0">Resource</th>
                <th className="py-3 px-4 border-0">Assigned</th>
                <th className="py-3 px-4 border-0">Status</th>
                <th className="py-3 px-4 border-0">Site / Issue</th>
                <th className="py-3 px-4 border-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map(alloc => (
                <tr key={alloc.allocationId}>
                  <td className="py-3 px-4 fw-bold text-primary">{alloc.allocationId}</td>
                  <td className="py-3 px-4">
                    <div className="fw-bold">{alloc.resourceName}</div>
                    <div className="small text-muted font-monospace">{alloc.resourceId}</div>
                  </td>
                  <td className="py-3 px-4 small text-muted"><FaCalendarAlt className="me-1" /> {alloc.assignedDate}</td>
                  <td className="py-3 px-4"><Badge bg={STATUS_COLORS[alloc.status]}>{alloc.status}</Badge></td>
                  <td className="py-3 px-4 small text-muted">
                    {alloc.siteId && <div>Site: <span className="text-dark fw-bold">{alloc.siteId}</span></div>}
                  </td>
                  <td className="py-3 px-4 text-end">
                    <Button variant="light" size="sm" className="rounded-3" onClick={() => viewCost(alloc.allocationId)}><FaChartBar className="me-1" /> Cost</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {selectedAlloc && (
        <Modal show={true} onHide={() => setSelectedAlloc(null)} centered>
          <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Cost Analysis</Modal.Title></Modal.Header>
          <Modal.Body className="p-4">
            <div className="text-center mb-4">
              <h1 className="fw-bold text-success mb-0">${selectedAlloc.actualCost.toLocaleString()}</h1>
              <p className="text-muted small text-uppercase fw-bold">Actual Cost to Date</p>
            </div>
            <div className="mb-4">
              <div className="d-flex justify-content-between small fw-bold mb-1">
                <span>Budget Utilization</span>
                <span>{selectedAlloc.utilizationPercentage}%</span>
              </div>
              <ProgressBar now={selectedAlloc.utilizationPercentage} variant="success" className="rounded-pill" style={{ height: '8px' }} />
            </div>
            <Row className="g-3 text-center">
              <Col xs={6}>
                <div className="p-3 bg-light rounded-4">
                  <div className="small text-muted mb-1">Remaining</div>
                  <div className="fw-bold">${selectedAlloc.remainingCost.toLocaleString()}</div>
                </div>
              </Col>
              <Col xs={6}>
                <div className="p-3 bg-light rounded-4">
                  <div className="small text-muted mb-1">Total Allocated</div>
                  <div className="fw-bold">${selectedAlloc.totalCost.toLocaleString()}</div>
                </div>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
      )}

      <CreateAllocationModal resources={resources} show={showModal} onHide={() => setShowModal(false)} onCreated={load} />
    </div>
  );
};
