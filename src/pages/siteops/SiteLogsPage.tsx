import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, Modal, Form, ProgressBar, Table } from 'react-bootstrap';
import { FaPlus, FaFileSignature, FaFileUpload, FaCheckCircle, FaChevronRight } from 'react-icons/fa';
import { siteOpsService } from '../../services/siteOpsService';
import type { SiteLogResponse } from '../../services/siteOpsService';

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  DRAFT: { bg: 'secondary', label: 'Draft' },
  SUBMITTED: { bg: 'warning', label: 'Submitted' },
  APPROVED: { bg: 'success', label: 'Approved' },
  REJECTED: { bg: 'danger', label: 'Rejected' },
};

const PROJECTS = [{ id: 'PRJ-001', name: 'Metro Tower A' }, { id: 'PRJ-002', name: 'Riverfront Marina' }];

const CreateSiteLogModal: React.FC<{ show: boolean; onHide: () => void; onCreated: () => void }> = ({ show, onHide, onCreated }) => {
  const [form, setForm] = useState({ projectId: '', logDate: new Date().toISOString().split('T')[0], activities: '', issuesSummary: '', progressPercent: 0 });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await siteOpsService.createSiteLog(form);
    onCreated(); onHide();
    setForm({ projectId: '', logDate: new Date().toISOString().split('T')[0], activities: '', issuesSummary: '', progressPercent: 0 });
    setSubmitting(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Create Daily Site Log</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">PROJECT *</Form.Label>
                <Form.Select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} required className="rounded-3">
                  <option value="">Select Project...</option>
                  {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group><Form.Label className="small fw-bold text-muted">DATE *</Form.Label><Form.Control type="date" value={form.logDate} onChange={e => setForm(f => ({ ...f, logDate: e.target.value }))} required className="rounded-3" /></Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">ACTIVITIES (WORK DONE) *</Form.Label>
                <Form.Control as="textarea" rows={3} value={form.activities} onChange={e => setForm(f => ({ ...f, activities: e.target.value }))} required className="rounded-3" placeholder="Describe the main activities conducted today..." />
                <div className="text-end small text-muted mt-1">{form.activities.length} characters</div>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group><Form.Label className="small fw-bold text-muted">ISSUES & CONSTRAINTS</Form.Label><Form.Control as="textarea" rows={2} value={form.issuesSummary} onChange={e => setForm(f => ({ ...f, issuesSummary: e.target.value }))} className="rounded-3" placeholder="Any delays, resource shortages, or technical problems..." /></Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <div className="d-flex justify-content-between">
                  <Form.Label className="small fw-bold text-muted">ESTIMATED PROGRESS (%)</Form.Label>
                  <span className="fw-bold text-primary">{form.progressPercent}%</span>
                </div>
                <Form.Range value={form.progressPercent} onChange={e => setForm(f => ({ ...f, progressPercent: Number(e.target.value) }))} className="mt-1" />
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="light" className="rounded-3" onClick={onHide}>Cancel</Button>
            <Button variant="warning" type="submit" className="rounded-3 text-white" disabled={submitting}>{submitting ? 'Saving...' : 'Save Site Log'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const SiteLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<SiteLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState('');

  const load = async () => { setLoading(true); setLogs(await siteOpsService.getSiteLogs()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (id: string) => {
    setSubmitting(id);
    await siteOpsService.submitSiteLog(id);
    await load();
    setSubmitting('');
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h3 className="fw-bold mb-1">Daily Site Logs</h3><p className="text-muted mb-0">{logs.length} logs recorded in total.</p></div>
        <Button variant="warning" className="rounded-3 d-flex align-items-center gap-2 text-white" onClick={() => setShowCreate(true)}><FaPlus /> Create New Log</Button>
      </div>

      {loading ? <div className="text-center py-5 text-muted">Loading logs...</div> : (
        <Row className="g-3">
          {logs.map(log => {
            const sta = STATUS_CONFIG[log.reviewStatus];
            return (
              <Col md={12} key={log.logId}>
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                  <Card.Body className="p-0">
                    <div className="d-flex flex-column flex-md-row">
                      <div className="bg-light p-4 d-flex flex-column align-items-center justify-content-center border-end" style={{ minWidth: '120px' }}>
                        <div className="small fw-bold text-muted text-uppercase">{new Date(log.logDate).toLocaleDateString('en-US', { month: 'short' })}</div>
                        <div className="fs-2 fw-bold text-dark">{new Date(log.logDate).getDate()}</div>
                        <div className="small text-muted">{new Date(log.logDate).getFullYear()}</div>
                      </div>
                      <div className="p-4 flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h5 className="fw-bold mb-0">{log.projectName}</h5>
                            <div className="small text-muted font-monospace">{log.logId}</div>
                          </div>
                          <Badge bg={sta.bg} className={log.reviewStatus === 'SUBMITTED' ? 'text-dark' : ''}>{sta.label}</Badge>
                        </div>
                        <p className="text-muted small mb-3 text-truncate-2" style={{ maxHeight: '40px', overflow: 'hidden' }}>{log.activities}</p>
                        <div className="d-flex align-items-center gap-3">
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between small mb-1"><span className="text-muted">Progress</span><span className="fw-bold">{log.progressPercent}%</span></div>
                            <ProgressBar now={log.progressPercent} variant="warning" className="rounded-pill" style={{ height: '6px' }} />
                          </div>
                          <div className="d-flex gap-2">
                            {log.reviewStatus === 'DRAFT' && (
                              <Button variant="outline-warning" size="sm" className="rounded-3 px-3" disabled={submitting === log.logId} onClick={() => handleSubmit(log.logId)}>
                                {submitting === log.logId ? '...' : 'Submit Approval'}
                              </Button>
                            )}
                            <Button variant="light" size="sm" className="rounded-3"><FaChevronRight /></Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
      <CreateSiteLogModal show={showCreate} onHide={() => setShowCreate(false)} onCreated={load} />
    </div>
  );
};
