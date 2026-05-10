import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Table, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaFilter } from 'react-icons/fa';
import safetyService from '../../services/safetyService';
import type { InspectionResponse } from '../../services/safetyService';

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  SCHEDULED:   { bg: 'primary',   label: 'Scheduled' },
  IN_PROGRESS: { bg: 'warning',   label: 'In Progress' },
  COMPLETED:   { bg: 'success',   label: 'Completed' },
  CANCELLED:   { bg: 'secondary', label: 'Cancelled' }
};

const PROJECTS = [
  { id: 'PRJ-001', name: 'Metro Tower A' },
  { id: 'PRJ-002', name: 'Riverfront Marina' },
  { id: 'PRJ-003', name: 'Tech Hub Campus' }
];

const CreateInspectionModal: React.FC<{ show: boolean; onHide: () => void; onCreated: () => void }> = ({ show, onHide, onCreated }) => {
  const [types, setTypes] = useState<string[]>([]);
  const [form, setForm] = useState({ projectId: '', inspectionType: '', findings: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { safetyService.getInspectionTypes().then(setTypes); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId) { setError('Please select a project.'); return; }
    if (!form.inspectionType) { setError('Please select an inspection type.'); return; }
    setSubmitting(true);
    try {
      await safetyService.createInspection(form);
      onCreated();
      onHide();
      setForm({ projectId: '', inspectionType: '', findings: '' });
      setError('');
    } catch { setError('Failed to schedule inspection.'); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold text-primary">Schedule Inspection</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">PROJECT *</Form.Label>
            <Form.Select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} className="rounded-3" required>
              <option value="">Select project...</option>
              {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">INSPECTION TYPE *</Form.Label>
            <Form.Select value={form.inspectionType} onChange={e => setForm(f => ({ ...f, inspectionType: e.target.value }))} className="rounded-3" required>
              <option value="">Select type...</option>
              {types.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">INITIAL FINDINGS <span className="text-muted fw-normal">(optional)</span></Form.Label>
            <Form.Control as="textarea" rows={3} value={form.findings}
              onChange={e => setForm(f => ({ ...f, findings: e.target.value }))}
              placeholder="Describe initial findings or notes..." maxLength={200} className="rounded-3" />
            <Form.Text className="text-muted">{form.findings.length}/200</Form.Text>
          </Form.Group>
          {error && <div className="alert alert-danger py-2 small rounded-3">{error}</div>}
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="light" className="rounded-3" onClick={onHide}>Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-3" disabled={submitting}>
              {submitting ? 'Scheduling...' : 'Schedule Inspection'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const InspectionsPage: React.FC = () => {
  const [inspections, setInspections] = useState<InspectionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const load = async () => {
    setLoading(true);
    const data = await safetyService.getInspections({
      status: statusFilter !== 'ALL' ? statusFilter : undefined
    });
    setInspections(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  return (
    <div className="p-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Inspections</h3>
          <p className="text-muted mb-0">{inspections.length} inspections found</p>
        </div>
        <Button variant="primary" className="rounded-3 d-flex align-items-center gap-2" onClick={() => setShowCreate(true)}>
          <FaPlus /> Schedule Inspection
        </Button>
      </div>

      {/* Status Quick Tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {(['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`btn btn-sm rounded-3 px-3 ${statusFilter === s ? 'btn-primary' : 'btn-light'}`}>
            {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label || s}
            <Badge bg={statusFilter === s ? 'light' : 'secondary'} text="dark" pill className="ms-2">
              {s === 'ALL' ? inspections.length : inspections.filter(i => i.status === s).length}
            </Badge>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5 text-muted">Loading inspections...</div>
      ) : (
        <Card className="border-0 shadow-sm rounded-4">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="py-3 px-4 border-0">ID</th>
                <th className="py-3 px-4 border-0">Project</th>
                <th className="py-3 px-4 border-0">Date</th>
                <th className="py-3 px-4 border-0">Type</th>
                <th className="py-3 px-4 border-0">Officer</th>
                <th className="py-3 px-4 border-0">Findings</th>
                <th className="py-3 px-4 border-0">Status</th>
              </tr>
            </thead>
            <tbody>
              {inspections.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-5 text-muted">No inspections found.</td></tr>
              ) : inspections.map(ins => {
                const sta = STATUS_CONFIG[ins.status];
                return (
                  <tr key={ins.inspectionId}>
                    <td className="py-3 px-4 font-monospace small text-muted">{ins.inspectionId}</td>
                    <td className="py-3 px-4 small fw-semibold">{ins.projectName}</td>
                    <td className="py-3 px-4 small text-muted">{ins.date}</td>
                    <td className="py-3 px-4">
                      <Badge bg="light" text="dark" className="border small">{ins.inspectionType.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="py-3 px-4 small">{ins.officerName}</td>
                    <td className="py-3 px-4 small text-muted" style={{ maxWidth: 220, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {ins.findings || <span className="text-muted fst-italic">No findings yet</span>}
                    </td>
                    <td className="py-3 px-4">
                      <Badge bg={sta.bg} className={ins.status === 'IN_PROGRESS' ? 'text-dark' : ''}>{sta.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}

      <CreateInspectionModal show={showCreate} onHide={() => setShowCreate(false)} onCreated={load} />
    </div>
  );
};
