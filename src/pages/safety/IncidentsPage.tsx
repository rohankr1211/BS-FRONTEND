import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Table, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaExclamationTriangle, FaFilter } from 'react-icons/fa';
import safetyService from '../../services/safetyService';
import type { IncidentResponse } from '../../services/safetyService';

const SEVERITY_CONFIG: Record<string, { bg: string; label: string }> = {
  LOW:      { bg: 'success', label: 'Low' },
  MEDIUM:   { bg: 'warning', label: 'Medium' },
  HIGH:     { bg: 'danger',  label: 'High' },
  CRITICAL: { bg: 'danger',  label: 'Critical' }
};
const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  OPEN:          { bg: 'danger',    label: 'Open' },
  INVESTIGATING: { bg: 'primary',   label: 'Investigating' },
  RESOLVED:      { bg: 'success',   label: 'Resolved' },
  CLOSED:        { bg: 'secondary', label: 'Closed' }
};

const PROJECTS = ['PRJ-001', 'PRJ-002', 'PRJ-003'];

// ── Create Incident Modal ──────────────────────
const CreateIncidentModal: React.FC<{ show: boolean; onHide: () => void; onCreated: () => void }> = ({ show, onHide, onCreated }) => {
  const [form, setForm] = useState({ projectId: '', description: '', severity: 'MEDIUM' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId) { setError('Please select a project.'); return; }
    if (form.description.length < 10) { setError('Description must be at least 10 characters.'); return; }
    setSubmitting(true);
    try {
      await safetyService.createIncident(form);
      onCreated();
      onHide();
      setForm({ projectId: '', description: '', severity: 'MEDIUM' });
    } catch { setError('Failed to create incident.'); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold text-danger"><FaExclamationTriangle className="me-2" />Report New Incident</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">PROJECT *</Form.Label>
            <Form.Select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} className="rounded-3" required>
              <option value="">Select project...</option>
              {PROJECTS.map(p => <option key={p} value={p}>{p === 'PRJ-001' ? 'Metro Tower A' : p === 'PRJ-002' ? 'Riverfront Marina' : 'Tech Hub Campus'}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">SEVERITY *</Form.Label>
            <Form.Select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className="rounded-3">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">DESCRIPTION *</Form.Label>
            <Form.Control as="textarea" rows={4} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe the incident in detail..." maxLength={5000} className="rounded-3" required />
            <Form.Text className="text-muted">{form.description.length}/5000</Form.Text>
          </Form.Group>
          {error && <div className="alert alert-danger py-2 small rounded-3">{error}</div>}
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="light" className="rounded-3" onClick={onHide}>Cancel</Button>
            <Button variant="danger" type="submit" className="rounded-3" disabled={submitting}>
              {submitting ? 'Reporting...' : 'Report Incident'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

// ── Main Incidents Page ────────────────────────
export const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await safetyService.getIncidents({
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      severity: severityFilter !== 'ALL' ? severityFilter : undefined
    });
    setIncidents(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter, severityFilter]);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    await safetyService.updateIncidentStatus(id, status);
    await load();
    setUpdatingId('');
  };

  return (
    <div className="p-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Incident Management</h3>
          <p className="text-muted mb-0">{incidents.length} incidents found</p>
        </div>
        <Button variant="danger" className="rounded-3 d-flex align-items-center gap-2" onClick={() => setShowCreate(true)}>
          <FaPlus /> Report Incident
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-3">
          <div className="d-flex flex-wrap gap-3 align-items-center">
            <FaFilter className="text-muted" />
            <Form.Select size="sm" className="rounded-3 w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </Form.Select>
            <Form.Select size="sm" className="rounded-3 w-auto" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </Form.Select>
          </div>
        </Card.Body>
      </Card>

      {/* Incident Stats Row */}
      <Row className="g-3 mb-4">
        {(['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'] as const).map(s => (
          <Col xs={6} md={3} key={s}>
            <Card className="border-0 shadow-sm rounded-4 text-center py-3" style={{ cursor: 'pointer' }}
              onClick={() => setStatusFilter(statusFilter === s ? 'ALL' : s)}>
              <div className={`fs-4 fw-bold text-${STATUS_CONFIG[s].bg}`}>{incidents.filter(i => i.status === s).length}</div>
              <div className="small text-muted">{STATUS_CONFIG[s].label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Incidents Table */}
      {loading ? (
        <div className="text-center py-5 text-muted">Loading incidents...</div>
      ) : (
        <Card className="border-0 shadow-sm rounded-4">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="py-3 px-4 border-0">ID</th>
                <th className="py-3 px-4 border-0">Project</th>
                <th className="py-3 px-4 border-0">Date</th>
                <th className="py-3 px-4 border-0">Severity</th>
                <th className="py-3 px-4 border-0">Description</th>
                <th className="py-3 px-4 border-0">Reported By</th>
                <th className="py-3 px-4 border-0">Status</th>
              </tr>
            </thead>
            <tbody>
              {incidents.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-5 text-muted">No incidents found.</td></tr>
              ) : incidents.map(inc => {
                const sev = SEVERITY_CONFIG[inc.severity];
                const sta = STATUS_CONFIG[inc.status];
                return (
                  <tr key={inc.incidentId}>
                    <td className="py-3 px-4 font-monospace small text-muted">{inc.incidentId}</td>
                    <td className="py-3 px-4 small fw-semibold">{inc.projectName}</td>
                    <td className="py-3 px-4 small text-muted">{inc.date}</td>
                    <td className="py-3 px-4">
                      <Badge bg={sev.bg} className={inc.severity === 'MEDIUM' ? 'text-dark' : ''}>{sev.label}</Badge>
                    </td>
                    <td className="py-3 px-4 small" style={{ maxWidth: 260, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {inc.description}
                    </td>
                    <td className="py-3 px-4 small">{inc.reportedByName}</td>
                    <td className="py-3 px-4">
                      <select className="form-select form-select-sm rounded-3 w-auto"
                        value={inc.status}
                        disabled={updatingId === inc.incidentId}
                        onChange={e => handleStatusChange(inc.incidentId, e.target.value)}>
                        <option value="OPEN">Open</option>
                        <option value="INVESTIGATING">Investigating</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}

      <CreateIncidentModal show={showCreate} onHide={() => setShowCreate(false)} onCreated={load} />
    </div>
  );
};
