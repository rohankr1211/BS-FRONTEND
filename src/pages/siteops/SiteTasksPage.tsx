import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Modal, Form } from 'react-bootstrap';
import { FaSyncAlt, FaCheckCircle, FaClipboardList, FaEye, FaProjectDiagram, FaUser, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { siteOpsService } from '../../services/siteOpsService';
import type { SiteTaskResponse } from '../../services/siteOpsService';
import { toast } from 'react-toastify';

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
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const load = async () => { setLoading(true); setTasks(await siteOpsService.getTasks()); setLoading(false); };
  useEffect(() => { load(); }, []);


  const handleSubmit = async () => {
    if (!submitTask || !submitDesc.trim()) return;
    setSubmitting(true);
    try {
      const taskId = submitTask.assignedTaskId || (submitTask as any).id || (submitTask as any).taskId;
      await siteOpsService.submitTask(taskId, { submissionDescription: submitDesc });
      toast.success('Task submitted successfully');
      setSubmitTask(null); setSubmitDesc('');
      await load();
    } catch (err) {
      console.error('Failed to submit task:', err);
      toast.error('Failed to submit task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await siteOpsService.syncTasks();
      toast.success('Tasks synchronized successfully');
      await load();
    } catch (err) {
      console.error('Failed to sync tasks:', err);
      toast.error('Failed to sync tasks');
    } finally {
      setSyncing(false);
    }
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
              <Card key={task.assignedTaskId} className={`border-0 shadow-sm rounded-4 border-start border-4 border-${sta.bg} cursor-pointer`} onClick={() => toggleTaskExpansion(task.assignedTaskId)}>
                <Card.Body className="p-4">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <h6 className="fw-bold mb-0">{task.taskDescription}</h6>
                        <Badge bg={sta.bg} className={task.status === 'PENDING' ? 'text-dark' : ''}>{sta.label}</Badge>
                      </div>
                      <div className="small text-muted mb-1 d-flex align-items-center gap-3">
                        <span className="d-flex align-items-center gap-1">
                          <FaProjectDiagram className="text-primary" />
                          <span className="fw-semibold text-dark">{task.projectName}</span>
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <FaUser className="text-muted" />
                          {task.assignedByName}
                        </span>
                      </div>
                      {task.submissionDescription && (
                        <div className="mt-2 p-2 bg-light rounded-3 small">
                          <span className="text-muted fw-bold">My Submission: </span>{task.submissionDescription}
                        </div>
                      )}
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        className="rounded-3" 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskExpansion(task.assignedTaskId);
                        }}
                      >
                        {expandedTasks.has(task.assignedTaskId) ? <FaChevronUp /> : <FaChevronDown />}
                      </Button>
                      {task.status === 'PENDING' && (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="rounded-3 px-4" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSubmitTask(task);
                          }}
                        >
                          Submit Work
                        </Button>
                      )}
                      {task.status === 'REJECTED' && (
                        <Button 
                          variant="warning" 
                          size="sm" 
                          className="rounded-3 px-4" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSubmitTask(task);
                          }}
                        >
                          Resubmit
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {expandedTasks.has(task.assignedTaskId) && (
                    <div className="mt-3 pt-3 border-top">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="small text-muted fw-bold mb-1">Task ID</div>
                          <div className="font-monospace small">{task.assignedTaskId}</div>
                        </div>
                        <div className="col-md-6">
                          <div className="small text-muted fw-bold mb-1">Status</div>
                          <Badge bg={sta.bg} className={task.status === 'PENDING' ? 'text-dark' : ''}>{sta.label}</Badge>
                        </div>
                        <div className="col-md-6">
                          <div className="small text-muted fw-bold mb-1">Assigned By</div>
                          <div className="small">{task.assignedByName}</div>
                        </div>
                        <div className="col-md-6">
                          <div className="small text-muted fw-bold mb-1">Project</div>
                          <div className="small">{task.projectName}</div>
                        </div>
                        {task.submissionDescription && (
                          <div className="col-12">
                            <div className="small text-muted fw-bold mb-1">Submission Notes</div>
                            <div className="p-2 bg-light rounded-3 small">{task.submissionDescription}</div>
                          </div>
                        )}
                      </div>
                      
                      {task.status === 'COMPLETED' && (
                        <div className="mt-3 p-3 bg-success bg-opacity-10 rounded-3">
                          <div className="text-success fw-bold small d-flex align-items-center gap-2">
                            <FaCheckCircle /> Task Completed Successfully
                          </div>
                        </div>
                      )}
                      
                      {task.status === 'REJECTED' && (
                        <div className="mt-3 p-3 bg-danger bg-opacity-10 rounded-3">
                          <div className="text-danger fw-bold small">Task was rejected. Please review and resubmit.</div>
                        </div>
                      )}
                    </div>
                  )}
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
