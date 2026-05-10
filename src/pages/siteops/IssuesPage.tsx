import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, Table, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaExclamationTriangle, FaTrash, FaEye, FaEdit, FaCheckCircle } from 'react-icons/fa';
import { siteOpsService } from '../../services/siteOpsService';
import type { IssueResponse } from '../../services/siteOpsService';
import { toast } from 'react-toastify';

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

// Site Engineers enter projectId manually

const ReportIssueModal: React.FC<{ show: boolean; onHide: () => void; onCreated: () => void }> = ({ show, onHide, onCreated }) => {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ 
    projectId: '', 
    logId: '',
    title: '', 
    description: '', 
    severity: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    resourceType: 'LABOR',
    resourceDescription: '',
    resourceFromDate: today,
    resourceToDate: today
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Map title + description into the final backend payload
      const payload = {
        ...form,
        description: `${form.title}: ${form.description}`.trim()
      };
      await siteOpsService.reportIssue(payload);
      onCreated(); onHide();
      setForm({ 
        projectId: '', logId: '', title: '', description: '', severity: 'MEDIUM',
        resourceType: 'LABOR', resourceDescription: '', resourceFromDate: today, resourceToDate: today
      });
    } catch (error: any) {
      console.error('❌ Failed to report issue:', error);
      if (error.response?.data) {
        console.log('📋 Server Error Data:', JSON.stringify(error.response.data, null, 2));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Report Site Issue</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">PROJECT *</Form.Label>
                <Form.Select 
                  value={form.projectId} 
                  onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} 
                  required 
                  className="rounded-3"
                >
                  <option value="">Select Project...</option>
                  <option value="CHEBS26001">CHEBS26001 - Project A</option>
                  <option value="CHEBS26002">CHEBS26002 - Project B</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">SITE LOG ID *</Form.Label>
                <Form.Control type="text" value={form.logId} onChange={e => setForm(f => ({ ...f, logId: e.target.value.toUpperCase() }))} required className="rounded-3" placeholder="LOGBS00x" />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group><Form.Label className="small fw-bold text-muted">TITLE *</Form.Label><Form.Control value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="rounded-3" placeholder="Brief summary of the issue" /></Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group><Form.Label className="small fw-bold text-muted">DESCRIPTION</Form.Label><Form.Control as="textarea" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-3" placeholder="Provide more details..." /></Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">SEVERITY *</Form.Label>
                <div className="d-flex gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map(s => (
                    <Button key={s} variant={form.severity === s ? SEVERITY_CONFIG[s].bg : 'light'} className={`rounded-3 flex-grow-1 small py-2 ${form.severity === s && (s === 'MEDIUM' || s === 'HIGH') ? 'text-dark' : ''}`} onClick={() => setForm(f => ({ ...f, severity: s }))}>
                      {SEVERITY_CONFIG[s].label}
                    </Button>
                  ))}
                </div>
              </Form.Group>
            </Col>

            <Col md={12} className="mt-4"><hr /><h6 className="fw-bold mb-3">Resource Request Details</h6></Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">RESOURCE TYPE *</Form.Label>
                <Form.Select value={form.resourceType} onChange={e => setForm(f => ({ ...f, resourceType: e.target.value }))} className="rounded-3">
                  <option value="LABOR">Labor</option>
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="MATERIAL">Material</option>
                  <option value="OTHER">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group><Form.Label className="small fw-bold text-muted">RESOURCE DESCRIPTION *</Form.Label><Form.Control value={form.resourceDescription} onChange={e => setForm(f => ({ ...f, resourceDescription: e.target.value }))} required className="rounded-3" placeholder="e.g. Crane Operator, 10 Bags Cement" /></Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group><Form.Label className="small fw-bold text-muted">FROM DATE *</Form.Label><Form.Control type="date" value={form.resourceFromDate} onChange={e => setForm(f => ({ ...f, resourceFromDate: e.target.value }))} required className="rounded-3" /></Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group><Form.Label className="small fw-bold text-muted">TO DATE *</Form.Label><Form.Control type="date" value={form.resourceToDate} onChange={e => setForm(f => ({ ...f, resourceToDate: e.target.value }))} required className="rounded-3" /></Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2 mt-4">
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
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterProjectId, setFilterProjectId] = useState('CHEBS26002');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<IssueResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<IssueResponse | null>(null);
  const [updatingId, setUpdatingId] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const load = async (pId?: string) => { 
    const targetId = pId || filterProjectId;
    if (!targetId) return;

    setLoading(true); 
    try {
      const data = await siteOpsService.getIssues({ projectId: targetId });
      setIssues(data || []);
    } catch (e) {
      console.error("Failed to load issues", e);
      setIssues([]);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreated = () => {
    load();
    toast.success('Issue reported successfully');
  };

  const openDeleteModal = (issue: IssueResponse) => {
    setIssueToDelete(issue);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!issueToDelete) return;
    setDeletingId(issueToDelete.id);
    try {
      await siteOpsService.deleteIssue(issueToDelete.id);
      toast.success('Issue deleted successfully');
      setShowDeleteModal(false);
      setIssueToDelete(null);
      await load();
    } catch (err) {
      console.error('Failed to delete issue:', err);
      toast.error('Failed to delete issue');
    } finally {
      setDeletingId('');
    }
  };

  const openDetailModal = (issue: IssueResponse) => {
    setSelectedIssue(issue);
    setShowDetailModal(true);
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    setUpdatingId(issueId);
    try {
      await siteOpsService.updateIssue(issueId, { status: newStatus });
      toast.success(`Issue status updated to ${newStatus}`);
      await load();
    } catch (err) {
      console.error('Failed to update issue status:', err);
      toast.error('Failed to update issue status');
    } finally {
      setUpdatingId('');
    }
  };

  const filtered = filterStatus === 'ALL' ? issues : issues.filter(i => i.status === filterStatus);

  return (
    <div className="p-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Issue Management</h3>
          <p className="text-muted mb-0">{issues.filter(i => i.status === 'OPEN').length} open issues for project {filterProjectId}.</p>
        </div>
        <div className="d-flex gap-2">
          <Form.Control 
            placeholder="Filter by Project ID..." 
            value={filterProjectId}
            onChange={(e) => setFilterProjectId(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            className="rounded-3"
            style={{ maxWidth: '200px' }}
          />
          <Button variant="dark" onClick={() => load()} className="rounded-3">Load</Button>
          <Button variant="danger" className="rounded-3 d-flex align-items-center gap-2" onClick={() => setShowReport(true)}>
            <FaPlus /> Report Issue
          </Button>
        </div>
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
                    <td className="py-3 px-4 text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <Button variant="outline-primary" size="sm" className="rounded-3" onClick={() => openDetailModal(issue)}>
                          <FaEye />
                        </Button>
                        <Button variant="outline-warning" size="sm" className="rounded-3" onClick={() => handleStatusChange(issue.id, issue.status === 'OPEN' ? 'IN_PROGRESS' : 'OPEN')} disabled={updatingId === issue.id}>
                          {issue.status === 'OPEN' ? <FaCheckCircle /> : <FaEdit />}
                        </Button>
                        <Button variant="outline-danger" size="sm" className="rounded-3" onClick={() => openDeleteModal(issue)} disabled={deletingId === issue.id}>
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}
      <ReportIssueModal show={showReport} onHide={() => setShowReport(false)} onCreated={handleCreated} />

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-danger"><FaExclamationTriangle className="me-2" />Delete Issue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this issue? This action cannot be undone.</p>
          {issueToDelete && (
            <div className="bg-light p-3 rounded-3">
              <div className="mb-1"><strong>ID:</strong> {issueToDelete.issueId}</div>
              <div className="mb-1"><strong>Project:</strong> {issueToDelete.projectName}</div>
              <div className="mb-1"><strong>Severity:</strong> <Badge bg={SEVERITY_CONFIG[issueToDelete.severity].bg}>{SEVERITY_CONFIG[issueToDelete.severity].label}</Badge></div>
              <div className="mb-1"><strong>Status:</strong> <Badge bg={STATUS_CONFIG[issueToDelete.status].color}>{STATUS_CONFIG[issueToDelete.status].label}</Badge></div>
              <div><strong>Description:</strong> {issueToDelete.title}</div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" className="rounded-3" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" className="rounded-3" onClick={handleDeleteConfirm} disabled={deletingId === issueToDelete?.id}>
            {deletingId === issueToDelete?.id ? 'Deleting...' : 'Delete Issue'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Detail View Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Issue Details</Modal.Title>
        </Modal.Header>
        {selectedIssue && (
          <Modal.Body className="p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Badge bg={SEVERITY_CONFIG[selectedIssue.severity].bg} className="fs-6">{SEVERITY_CONFIG[selectedIssue.severity].label}</Badge>
              <Badge bg={STATUS_CONFIG[selectedIssue.status].color} className="fs-6">{STATUS_CONFIG[selectedIssue.status].label}</Badge>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="small text-muted">Issue ID</div>
                <div className="fw-semibold font-monospace">{selectedIssue.issueId}</div>
              </div>
              <div className="col-md-6">
                <div className="small text-muted">Date</div>
                <div className="fw-semibold">{formatDate(selectedIssue.reportedAt)}</div>
              </div>
              <div className="col-md-6">
                <div className="small text-muted">Project</div>
                <div className="fw-semibold">{selectedIssue.projectName}</div>
              </div>
              <div className="col-md-6">
                <div className="small text-muted">Reported By</div>
                <div className="fw-semibold">{selectedIssue.reportedByName}</div>
              </div>
            </div>
            <div className="mb-3">
              <div className="small text-muted fw-bold mb-1">Title</div>
              <div className="p-3 bg-light rounded-3">{selectedIssue.title}</div>
            </div>
            <div className="mb-3">
              <div className="small text-muted fw-bold mb-1">Description</div>
              <div className="p-3 bg-light rounded-3">{selectedIssue.description}</div>
            </div>
          </Modal.Body>
        )}
        <Modal.Footer className="border-0">
          <Button variant="light" className="rounded-3" onClick={() => setShowDetailModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
