import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Modal, Form, Collapse } from 'react-bootstrap';
import { FaSyncAlt, FaCheckCircle, FaClipboardList, FaChevronDown, FaChevronUp, FaUser, FaCalendarAlt, FaProjectDiagram } from 'react-icons/fa';
import safetyService from '../../services/safetyService';
import type { SafetyTaskResponse } from '../../services/safetyService';

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  PENDING:   { bg: 'warning',   label: 'Pending' },
  SUBMITTED: { bg: 'primary',   label: 'Submitted' },
  COMPLETED: { bg: 'success',   label: 'Completed' },
  REJECTED:  { bg: 'danger',    label: 'Rejected' }
};

const TABS = ['ALL', 'PENDING', 'SUBMITTED', 'COMPLETED', 'REJECTED'] as const;

const SubmitModal: React.FC<{ task: SafetyTaskResponse | null; onHide: () => void; onSubmitted: () => void }> = ({ task, onHide, onSubmitted }) => {
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !description.trim()) return;
    setSubmitting(true);
    const taskId = task.assignedTaskId || (task as any).id || (task as any).taskId;
    if (!taskId) {
      console.error('❌ Could not find a valid ID for task:', task);
      return;
    }
    await safetyService.submitTask(taskId, { description: description });
    setDescription('');
    onSubmitted();
    onHide();
    setSubmitting(false);
  };

  return (
    <Modal show={!!task} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">Submit Task for Approval</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted small mb-3">{task?.taskDescription}</p>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label className="small fw-bold text-muted">SUBMISSION DESCRIPTION *</Form.Label>
            <Form.Control as="textarea" rows={4} required value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what was done, findings, and any notes for the Project Manager..."
              className="rounded-3" />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="light" className="rounded-3" onClick={onHide}>Cancel</Button>
            <Button variant="success" type="submit" className="rounded-3 d-flex align-items-center gap-2" disabled={submitting}>
              <FaCheckCircle /> {submitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const SafetyTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<SafetyTaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('ALL');
  const [submitTask, setSubmitTask] = useState<SafetyTaskResponse | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await safetyService.getTasks();
      console.log('📋 Safety Tasks Data:', data);
      setTasks(Array.isArray(data) ? data : (data?.content || []));
    } catch (err) {
      console.error('Failed to load safety tasks:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    const result = await safetyService.syncTasks();
    setSyncMsg(result.message);
    setSyncing(false);
    await load();
    setTimeout(() => setSyncMsg(''), 4000);
  };

  const filtered = activeTab === 'ALL' ? tasks : tasks.filter(t => t.status === activeTab);

  return (
    <div className="p-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">My Assigned Tasks</h3>
          <p className="text-muted mb-0">Tasks assigned by Project Manager for your action.</p>
        </div>
        <div className="d-flex flex-column flex-sm-row gap-2 align-items-start">
          {syncMsg && <div className="alert alert-success mb-0 py-2 px-3 rounded-3 small d-flex align-items-center gap-2"><FaCheckCircle />{syncMsg}</div>}
          <Button variant="outline-secondary" className="rounded-3 d-flex align-items-center gap-2" onClick={handleSync} disabled={syncing}>
            <FaSyncAlt className={syncing ? 'fa-spin' : ''} /> {syncing ? 'Syncing...' : 'Sync from PM'}
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {TABS.map(tab => {
          const count = tab === 'ALL' ? tasks.length : tasks.filter(t => t.status === tab).length;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`btn btn-sm rounded-3 px-3 ${activeTab === tab ? 'btn-primary' : 'btn-light'}`}>
              {tab === 'ALL' ? 'All' : STATUS_CONFIG[tab].label}
              {tab === 'PENDING' && count > 0
                ? <Badge bg="danger" pill className="ms-2">{count}</Badge>
                : <Badge bg={activeTab === tab ? 'light' : 'secondary'} text="dark" pill className="ms-2">{count}</Badge>}
            </button>
          );
        })}
      </div>

      {/* Task Cards */}
      {loading ? (
        <div className="text-center py-5 text-muted">Loading tasks...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5">
          <FaClipboardList size={48} className="text-muted opacity-25 mb-3" />
          <p className="text-muted">No {activeTab.toLowerCase()} tasks found.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map(task => {
            const sta = STATUS_CONFIG[task.status];
            const isExpanded = expandedTaskId === task.assignedTaskId;
            return (
              <Card key={task.assignedTaskId} 
                className={`border-0 shadow-sm rounded-4 border-start border-4 border-${sta.bg} task-card-hover`}
                style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                onClick={() => toggleExpand(task.assignedTaskId)}>
                <Card.Body className="p-4">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <h6 className="fw-bold mb-0">{task.taskDescription}</h6>
                        <Badge bg={sta.bg} className={task.status === 'PENDING' ? 'text-dark' : ''}>{sta.label}</Badge>
                      </div>
                      <div className="d-flex flex-wrap gap-3 small text-muted mb-2">
                        <span className="d-flex align-items-center gap-1">
                          <FaProjectDiagram className="text-primary" /> {task.projectName}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <FaUser className="text-secondary" /> {task.assignedByName}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <FaCalendarAlt className="text-info" /> {formatDate(task.assignedAt)}
                        </span>
                        {task.submittedAt && (
                          <span className="d-flex align-items-center gap-1">
                            <FaCheckCircle className="text-success" /> Submitted: {formatDate(task.submittedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                      {task.status === 'PENDING' && (
                        <Button variant="success" size="sm" className="rounded-3 d-flex align-items-center gap-2 px-3"
                          onClick={(e) => { e.stopPropagation(); setSubmitTask(task); }}>
                          <FaCheckCircle /> Submit
                        </Button>
                      )}
                      {task.status === 'REJECTED' && (
                        <Button variant="warning" size="sm" className="rounded-3 d-flex align-items-center gap-2 px-3"
                          onClick={(e) => { e.stopPropagation(); setSubmitTask(task); }}>
                          <FaCheckCircle /> Resubmit
                        </Button>
                      )}
                      <Button variant="light" size="sm" className="rounded-circle p-2"
                        onClick={(e) => { e.stopPropagation(); toggleExpand(task.assignedTaskId); }}>
                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                      </Button>
                    </div>
                  </div>

                  <Collapse in={isExpanded}>
                    <div>
                      <div className="mt-3 pt-3 border-top">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="small text-muted mb-1">Project ID</div>
                            <div className="fw-semibold">{task.projectId}</div>
                          </div>
                          <div className="col-md-6">
                            <div className="small text-muted mb-1">Task ID</div>
                            <div className="fw-semibold font-monospace">{task.taskId}</div>
                          </div>
                          {task.submissionDescription && (
                            <div className="col-12">
                              <div className="p-3 bg-light rounded-3">
                                <div className="small text-muted fw-bold mb-1">Submission Notes</div>
                                <div className="small">{task.submissionDescription}</div>
                              </div>
                            </div>
                          )}
                          {task.status === 'REJECTED' && (
                            <div className="col-12">
                              <div className="p-3 bg-danger bg-opacity-10 rounded-3">
                                <div className="small text-danger fw-bold mb-1">Rejection Reason</div>
                                <div className="small text-danger">Task was rejected by the Project Manager. Please review the feedback and resubmit with updated information.</div>
                              </div>
                            </div>
                          )}
                          {task.status === 'COMPLETED' && (
                            <div className="col-12">
                              <div className="p-3 bg-success bg-opacity-10 rounded-3">
                                <div className="small text-success fw-bold mb-1">Approval Status</div>
                                <div className="small text-success">This task has been reviewed and approved by the Project Manager.</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Collapse>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}

      <SubmitModal task={submitTask} onHide={() => setSubmitTask(null)} onSubmitted={load} />
    </div>
  );
};
