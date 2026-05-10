import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Table, Modal, Form, Spinner } from 'react-bootstrap';
import { FaPlus, FaFilter, FaTrash } from 'react-icons/fa';
import safetyService from '../../services/safetyService';
import projectService from '../../services/projectService';
import type { InspectionResponse } from '../../services/safetyService';
import type { ProjectResponse } from '../../services/projectService';

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  SCHEDULED:   { bg: 'primary',   label: 'Scheduled' },
  IN_PROGRESS: { bg: 'warning',   label: 'In Progress' },
  COMPLETED:   { bg: 'success',   label: 'Completed' },
  CANCELLED:   { bg: 'secondary', label: 'Cancelled' }
};

const CreateInspectionModal: React.FC<{ projects: ProjectResponse[]; show: boolean; onHide: () => void; onCreated: () => void }> = ({ projects, show, onHide, onCreated }) => {
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
      await safetyService.createInspection({
        projectId: form.projectId,
        inspectionType: form.inspectionType,
        findings: form.findings || "Initial inspection findings", // Ensure it's not empty if backend is strict
        assignedTaskId: "" // Added required field from schema
      });
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
            <Form.Label className="small fw-bold text-muted">PROJECT ID *</Form.Label>
            <Form.Control 
              type="text" 
              value={form.projectId} 
              onChange={e => setForm(f => ({ ...f, projectId: e.target.value.toUpperCase() }))} 
              placeholder="e.g. PRJ-001"
              className="rounded-3" 
              required 
            />
            <Form.Text className="text-muted small">Enter the unique ID of the project.</Form.Text>
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
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      // 1. Fetch Projects (Best effort, skip redirect on 401)
      const projData = await projectService.getProjects({ _skipRedirect: true }).catch(err => {
        console.error('Failed to load projects for inspections:', err);
        return [];
      });
      setProjects(projData);

      // 2. Fetch Inspections (With skipRedirect for debugging)
      const data = await safetyService.getInspections({
        status: statusFilter !== 'ALL' ? statusFilter : undefined
      });
      setInspections(Array.isArray(data) ? data : (data?.content || []));
    } catch (err) {
      console.error('Final Inspections Load Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await safetyService.updateInspectionStatus(id, status);
      await load();
    } catch (err) {
      console.error('Failed to update inspection status:', err);
    } finally {
      setUpdatingId('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this SCHEDULED inspection?')) return;
    setDeletingId(id);
    try {
      await safetyService.deleteInspection(id);
      await load();
    } catch (err) {
      console.error('Failed to delete inspection:', err);
      alert('Failed to delete inspection. Only SCHEDULED inspections can be deleted.');
    } finally {
      setDeletingId('');
    }
  };

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
                <th className="py-3 px-4 border-0">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inspections.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-5 text-muted">No inspections found.</td></tr>
              ) : inspections.map(ins => (
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
                      <select className="form-select form-select-sm rounded-3 w-auto"
                        value={ins.status}
                        disabled={updatingId === ins.inspectionId}
                        onChange={e => handleStatusChange(ins.inspectionId, e.target.value)}>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      {ins.status === 'SCHEDULED' && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="rounded-3"
                          disabled={deletingId === ins.inspectionId}
                          onClick={() => handleDelete(ins.id)}
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </td>
                  </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <CreateInspectionModal projects={projects} show={showCreate} onHide={() => setShowCreate(false)} onCreated={load} />
    </div>
  );
};
