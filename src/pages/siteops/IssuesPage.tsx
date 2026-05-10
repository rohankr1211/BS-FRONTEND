import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, Table, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaExclamationTriangle, FaFilter } from 'react-icons/fa';
import { siteOpsService } from '../../services/siteOpsService';
import type { IssueResponse } from '../../services/siteOpsService';

const SEVERITY_CONFIG: Record<string, { bg: string; label: string }> = {
  LOW: { bg: 'success', label: 'Low' },
  MEDIUM: { bg: 'warning', label: 'Medium' },
  HIGH: { bg: 'orange', label: 'High' },
  CRITICAL: { bg: 'danger', label: 'Critical' },
};

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  OPEN: { color: 'danger', label: 'Open' },
  IN_PROGRESS: { color: 'primary', label: 'In Progress' },
  RESOLVED: { color: 'success', label: 'Resolved' },
  CLOSED: { color: 'secondary', label: 'Closed' },
};

const PROJECTS = [{ id: 'PRJ-001', name: 'Metro Tower A' }, { id: 'PRJ-002', name: 'Riverfront Marina' }];

const ReportIssueModal: React.FC<{ show: boolean; onHide: () => void; onCreated: () => void }> = ({ show, onHide, onCreated }) => {
  const [form, setForm] = useState({ projectId: '', title: '', description: '', severity: 'MEDIUM' as const });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await siteOpsService.reportIssue(form);
    onCreated(); onHide();
    setForm({ projectId: '', title: '', description: '', severity: 'MEDIUM' });
    setSubmitting(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Report Site Issue</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">PROJECT *</Form.Label>
            <Form.Select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} required className="rounded-3">
              <option value="">Select Project...</option>
              {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3"><Form.Label className="small fw-bold text-muted">TITLE *</Form.Label><Form.Control value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="rounded-3" placeholder="Brief summary of the issue" /></Form.Group>
          <Form.Group className="mb-3"><Form.Label className="small fw-bold text-muted">DESCRIPTION</Form.Label><Form.Control as="textarea" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-3" placeholder="Provide more details..." /></Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold text-muted">SEVERITY *</Form.Label>
            <div className="d-flex gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map(s => (
                <Button key={s} variant={form.severity === s ? SEVERITY_CONFIG[s].bg : 'light'} className={`rounded-3 flex-grow-1 small py-2 ${form.severity === s && (s === 'MEDIUM' || s === 'HIGH') ? 'text-dark' : ''}`} onClick={() => setForm(f => ({ ...f, severity: s }))}>
                  {SEVERITY_CONFIG[s].label}
                </Button>
              ))}
            </div>
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="light" className="rounded-3" onClick={onHide}>Cancel</Button>
            <Button variant="danger" type="submit" className="rounded-3" disabled={submitting}>{submitting ? 'Reporting...' : 'Report Issue'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const IssuesPage: React.FC = () => {
  const [issues, setIssues] = useState<IssueResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const load = async () => { setLoading(true); setIssues(await siteOpsService.getIssues()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const filtered = filterStatus === 'ALL' ? issues : issues.filter(i => i.status === filterStatus);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h3 className="fw-bold mb-1">Issue Management</h3><p className="text-muted mb-0">{issues.filter(i => i.status === 'OPEN').length} open issues requiring attention.</p></div>
        <Button variant="danger" className="rounded-3 d-flex align-items-center gap-2" onClick={() => setShowReport(true)}><FaPlus /> Report Issue</Button>
      </div>

      <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`btn btn-sm rounded-3 px-3 white-space-nowrap ${filterStatus === s ? 'btn-dark' : 'btn-light'}`}>
            {s === 'ALL' ? 'All Issues' : s.replace('_', ' ')}
            <Badge bg={filterStatus === s ? 'light' : 'secondary'} text="dark" pill className="ms-2">
              {s === 'ALL' ? issues.length : issues.filter(i => i.status === s).length}
            </Badge>
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-5 text-muted">Loading issues...</div> : (
        <Card className="border-0 shadow-sm rounded-4">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="py-3 px-4 border-0">Issue</th>
                <th className="py-3 px-4 border-0">Severity</th>
                <th className="py-3 px-4 border-0">Status</th>
                <th className="py-3 px-4 border-0">Reported By</th>
                <th className="py-3 px-4 border-0">Date</th>
                <th className="py-3 px-4 border-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(issue => {
                const sev = SEVERITY_CONFIG[issue.severity];
                const sta = STATUS_CONFIG[issue.status];
                return (
                  <tr key={issue.issueId}>
                    <td className="py-3 px-4">
                      <div className="fw-bold">{issue.title}</div>
                      <div className="small text-muted font-monospace">{issue.issueId} · {issue.projectName}</div>
                    </td>
                    <td className="py-3 px-4"><Badge style={{ backgroundColor: `var(--bs-${sev.bg})` }}>{sev.label}</Badge></td>
                    <td className="py-3 px-4"><div className={`d-flex align-items-center gap-1 small fw-bold text-${sta.color}`}><div className={`bg-${sta.color} rounded-circle`} style={{ width: 8, height: 8 }} />{sta.label}</div></td>
                    <td className="py-3 px-4 small">{issue.reportedByName}</td>
                    <td className="py-3 px-4 small text-muted">{new Date(issue.reportedAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-end"><Button variant="light" size="sm" className="rounded-3">View</Button></td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}
      <ReportIssueModal show={showReport} onHide={() => setShowReport(false)} onCreated={load} />
    </div>
  );
};
