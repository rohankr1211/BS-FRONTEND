import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Modal, Form } from 'react-bootstrap';
import { FaSyncAlt, FaCheckCircle, FaClipboardList } from 'react-icons/fa';
import vendorService from '../../services/vendorService';
import type { VendorTaskResponse } from '../../services/vendorService';

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  PENDING:   { bg: 'warning',   label: 'Pending' },
  SUBMITTED: { bg: 'primary',   label: 'Submitted' },
  COMPLETED: { bg: 'success',   label: 'Completed' },
  REJECTED:  { bg: 'danger',    label: 'Rejected' }
};

const TABS = ['ALL', 'PENDING', 'SUBMITTED', 'COMPLETED', 'REJECTED'] as const;

export const VendorTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<VendorTaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('ALL');
  const [submitTask, setSubmitTask] = useState<VendorTaskResponse | null>(null);
  const [submitDesc, setSubmitDesc] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => { setLoading(true); setTasks(await vendorService.getTasks()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    const r = await vendorService.syncTasks();
    setSyncMsg(r.message);
    setSyncing(false);
    await load();
    setTimeout(() => setSyncMsg(''), 4000);
  };

  const handleSubmit = async () => {
    if (!submitTask || !submitDesc.trim()) return;
    setSubmitting(true);
    await vendorService.submitTask(submitTask.assignedTaskId, submitDesc);
    setSubmitTask(null); setSubmitDesc('');
    await load();
    setSubmitting(false);
  };

  const filtered = activeTab === 'ALL' ? tasks : tasks.filter(t => t.status === activeTab);

  return (
    <div className="p-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">My Assigned Tasks</h3>
          <p className="text-muted mb-0">Tasks assigned by Project Manager.</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          {syncMsg && <div className="alert alert-success mb-0 py-2 px-3 rounded-3 small d-flex align-items-center gap-2"><FaCheckCircle />{syncMsg}</div>}
          <Button variant="outline-secondary" className="rounded-3 d-flex align-items-center gap-2" onClick={handleSync} disabled={syncing}>
            <FaSyncAlt className={syncing ? 'fa-spin' : ''} /> {syncing ? 'Syncing...' : 'Sync from PM'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {TABS.map(tab => {
          const count = tab === 'ALL' ? tasks.length : tasks.filter(t => t.status === tab).length;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`btn btn-sm rounded-3 px-3 ${activeTab === tab ? 'btn-primary' : 'btn-light'}`}>
              {tab === 'ALL' ? 'All' : STATUS_CONFIG[tab].label}
              <Badge bg={tab === 'PENDING' && count > 0 ? 'danger' : activeTab === tab ? 'light' : 'secondary'}
                text={activeTab === tab && tab !== 'PENDING' ? 'dark' : undefined} pill className="ms-2">{count}</Badge>
            </button>
          );
        })}
      </div>

      {/* Task Cards */}
      {loading ? (
        <div className="text-center py-5 text-muted">Loading tasks...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5"><FaClipboardList size={48} className="text-muted opacity-25 mb-3" /><p className="text-muted">No tasks found.</p></div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map(task => {
            const sta = STATUS_CONFIG[task.status];
            return (
              <Card key={task.assignedTaskId} className={`border-0 shadow-sm rounded-4 border-start border-4 border-${sta.bg}`}>
                <Card.Body className="p-4">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <h6 className="fw-bold mb-0">{task.taskDescription}</h6>
                        <Badge bg={sta.bg} className={task.status === 'PENDING' ? 'text-dark' : ''}>{sta.label}</Badge>
                      </div>
                      <div className="small text-muted mb-1">
                        <span className="fw-semibold text-dark">{task.projectName}</span>
                        {' · '}Assigned by {task.assignedByName}
                        {' · '}{new Date(task.assignedAt).toLocaleDateString()}
                      </div>
                      {task.submissionDescription && (
                        <div className="mt-2 p-2 bg-light rounded-3 small">
                          <span className="text-muted fw-bold">Submitted: </span>{task.submissionDescription}
                        </div>
                      )}
                      {task.status === 'REJECTED' && (
                        <div className="mt-2 p-2 bg-danger bg-opacity-10 rounded-3 small text-danger">
                          Task was rejected. Please revise and resubmit.
                        </div>
                      )}
                    </div>
                    {task.status === 'PENDING' && (
                      <Button variant="success" size="sm" className="rounded-3 d-flex align-items-center gap-2 flex-shrink-0 px-3"
                        onClick={() => setSubmitTask(task)}>
                        <FaCheckCircle /> Submit
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submit Modal */}
      <Modal show={!!submitTask} onHide={() => setSubmitTask(null)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold fs-6">Submit Task for Approval</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">{submitTask?.taskDescription}</p>
          <Form.Group>
            <Form.Label className="small fw-bold text-muted">SUBMISSION DESCRIPTION *</Form.Label>
            <Form.Control as="textarea" rows={4} required value={submitDesc}
              onChange={e => setSubmitDesc(e.target.value)}
              placeholder="Describe what was delivered or completed..." className="rounded-3" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" className="rounded-3" onClick={() => setSubmitTask(null)}>Cancel</Button>
          <Button variant="success" className="rounded-3 d-flex align-items-center gap-2" disabled={!submitDesc.trim() || submitting} onClick={handleSubmit}>
            <FaCheckCircle /> {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
