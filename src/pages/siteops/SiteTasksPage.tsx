import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Modal, Form } from 'react-bootstrap';
import { FaSyncAlt, FaCheckCircle, FaClipboardList } from 'react-icons/fa';
import { siteOpsService } from '../../services/siteOpsService';
import type { SiteTaskResponse } from '../../services/siteOpsService';

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  PENDING: { bg: 'warning', label: 'Pending' },
  SUBMITTED: { bg: 'primary', label: 'Submitted' },
  COMPLETED: { bg: 'success', label: 'Completed' },
  REJECTED: { bg: 'danger', label: 'Rejected' }
};

export const SiteTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<SiteTaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitTask, setSubmitTask] = useState<SiteTaskResponse | null>(null);
  const [submitDesc, setSubmitDesc] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => { setLoading(true); setTasks(await siteOpsService.getTasks()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    await siteOpsService.syncTasks();
    setSyncing(false);
    await load();
  };

  const handleSubmit = async () => {
    if (!submitTask || !submitDesc.trim()) return;
    setSubmitting(true);
    await siteOpsService.submitTask(submitTask.assignedTaskId, submitDesc);
    setSubmitTask(null); setSubmitDesc('');
    await load();
    setSubmitting(false);
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h3 className="fw-bold mb-1">Assigned Tasks</h3><p className="text-muted mb-0">Tasks assigned to you by the Project Manager.</p></div>
        <Button variant="outline-dark" className="rounded-3 d-flex align-items-center gap-2" onClick={handleSync} disabled={syncing}><FaSyncAlt className={syncing ? 'fa-spin' : ''} /> {syncing ? 'Syncing...' : 'Sync Tasks'}</Button>
      </div>

      {loading ? <div className="text-center py-5 text-muted">Loading tasks...</div> : tasks.length === 0 ? (
        <div className="text-center py-5"><FaClipboardList size={48} className="text-muted opacity-25 mb-3" /><p className="text-muted">No tasks assigned.</p></div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {tasks.map(task => {
            const sta = STATUS_CONFIG[task.status];
            return (
              <Card key={task.assignedTaskId} className={`border-0 shadow-sm rounded-4 border-start border-4 border-${sta.bg}`}>
                <Card.Body className="p-4">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <h6 className="fw-bold mb-0">{task.taskDescription}</h6>
                        <Badge bg={sta.bg} className={task.status === 'PENDING' ? 'text-dark' : ''}>{sta.label}</Badge>
                      </div>
                      <div className="small text-muted mb-1"><span className="fw-semibold text-dark">{task.projectName}</span> · Assigned by {task.assignedByName} · {new Date(task.assignedAt).toLocaleDateString()}</div>
                      {task.submissionDescription && <div className="mt-2 p-2 bg-light rounded-3 small"><span className="text-muted fw-bold">My Submission: </span>{task.submissionDescription}</div>}
                    </div>
                    {task.status === 'PENDING' && <Button variant="primary" size="sm" className="rounded-3 px-4" onClick={() => setSubmitTask(task)}>Submit Work</Button>}
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}

      <Modal show={!!submitTask} onHide={() => setSubmitTask(null)} centered>
        <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold fs-6">Submit Task Completion</Modal.Title></Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">{submitTask?.taskDescription}</p>
          <Form.Group>
            <Form.Label className="small fw-bold text-muted">WORK DESCRIPTION *</Form.Label>
            <Form.Control as="textarea" rows={4} required value={submitDesc} onChange={e => setSubmitDesc(e.target.value)} placeholder="Describe the work you completed..." className="rounded-3" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" className="rounded-3" onClick={() => setSubmitTask(null)}>Cancel</Button>
          <Button variant="primary" className="rounded-3 px-4" disabled={!submitDesc.trim() || submitting} onClick={handleSubmit}>{submitting ? 'Submitting...' : 'Submit Now'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
