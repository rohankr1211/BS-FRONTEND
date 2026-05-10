import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Badge, Button, Nav, Tab, ProgressBar, Table } from 'react-bootstrap';
import { FaArrowLeft, FaCalendarAlt, FaExclamationTriangle, FaTools, FaExternalLinkAlt } from 'react-icons/fa';
import projectService from '../../services/projectService';
import type { ProjectResponse, MilestoneResponse, TaskResponse, ApprovalResponse, IssueResponse, CreateTaskPayload } from '../../services/projectService';
import safetyService from '../../services/safetyService';
import vendorService from '../../services/vendorService';
import { financeService } from '../../services/financeService';
import { siteOpsService } from '../../services/siteOpsService';
import { notificationService } from '../../services/notificationService';
import { resourceService } from '../../services/resourceService';
import type { Allocation } from '../../services/resourceService';
import { useAuth } from '../../hooks/useAuth';

const STATUS_CONFIG: Record<string, string> = {
  IN_PROGRESS: 'primary', COMPLETED: 'success', ON_HOLD: 'warning',
  CANCELLED: 'danger', NOT_STARTED: 'secondary', PENDING: 'warning',
  APPROVED: 'success', REJECTED: 'danger', OPEN: 'danger',
  RESOLVED: 'success', HIGH: 'danger', MEDIUM: 'warning', LOW: 'success'
};

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [milestones, setMilestones] = useState<MilestoneResponse[]>([]);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [approvals, setApprovals] = useState<ApprovalResponse[]>([]);
  const [issues, setIssues] = useState<IssueResponse[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Task Modal State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    description: '',
    assignedDepartment: 'SITE_ENGINEER',
    assignedTo: '',
    plannedStart: new Date().toISOString().split('T')[0],
    plannedEnd: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      projectService.getProject(projectId),
      projectService.getMilestones(projectId),
      projectService.getTasks(projectId),
      projectService.getApprovals(),
      projectService.getIssues(projectId),
      resourceService.getAllocationsByProject(projectId)
    ]).then(([proj, ms, tasks, approvals, issues, res]) => {
      setProject(proj || null);
      setMilestones(ms);
      setTasks(tasks);
      setApprovals(approvals.filter(a => a.projectId === projectId));
      setIssues(issues);
      setAllocations(res);
      setLoading(false);
    });
  }, [projectId]);

  if (loading) return <div className="p-4 text-center text-muted">Loading project details...</div>;
  if (!project) return <div className="p-4 text-center text-danger">Project not found.</div>;

  const progress = project.totalMilestones > 0 ? Math.round((project.completedMilestones / project.totalMilestones) * 100) : 0;
  const statusVariant = STATUS_CONFIG[project.status] || 'secondary';

  const handleTaskStatusChange = async (taskId: string, status: string) => {
    await projectService.updateTaskStatus(taskId, status);
    setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: status as any } : t));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    setTaskError(null);
    try {
      const payload: CreateTaskPayload = {
        description: newTask.description,
        assignedDepartment: newTask.assignedDepartment,
        assignedTo: newTask.assignedTo || 'ADMIN',
        plannedStart: newTask.plannedStart,
        plannedEnd: newTask.plannedEnd,
        actualStart: newTask.plannedStart,
        actualEnd: newTask.plannedEnd
      };
      const created = await projectService.createTask(projectId, payload);
      setTasks(prev => [...prev, created]);
      
      try {
        const syncMap: Record<string, () => Promise<any>> = {
          'SAFETY_OFFICER': safetyService.syncTasks,
          'VENDOR': vendorService.syncTasks,
          'FINANCE': financeService.syncTasks,
          'SITE_ENGINEER': siteOpsService.syncTasks
        };

        const syncFn = syncMap[newTask.assignedDepartment];
        if (syncFn) {
          await syncFn();
        }

        await notificationService.createNotification({
          eventType: 'TASK_ASSIGNED',
          message: `New task assigned to ${newTask.assignedDepartment}: ${newTask.description}`,
          fromService: 'PROJECT_MANAGER',
          fromRole: currentUser?.role || 'PROJECT_MANAGER',
          referenceId: created.taskId,
          priority: 'MEDIUM',
          toUser: newTask.assignedTo
        });
      } catch (err) {
        console.warn("Post-creation sync/notification failed", err);
      }

      setShowTaskModal(false);
      setNewTask({
        description: '',
        assignedDepartment: 'SITE_ENGINEER',
        assignedTo: '',
        plannedStart: new Date().toISOString().split('T')[0],
        plannedEnd: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create task";
      setTaskError(msg);
    }
  };

  return (
    <div className="p-4">
      {project.imageUrl && (
        <div className="position-relative mb-4 rounded-4 overflow-hidden" style={{ height: '250px' }}>
          <img
            src={project.imageUrl}
            alt={project.projectName}
            className="w-100 h-100 object-fit-cover"
            style={{ objectPosition: 'center' }}
          />
          <div className="position-absolute top-0 left-0 w-100 h-100 bg-dark bg-opacity-30" />
          <div className="position-absolute top-3 left-3">
            <Button variant="light" className="rounded-circle p-2" onClick={() => navigate('/projects')}>
              <FaArrowLeft />
            </Button>
          </div>
          <div className="position-absolute bottom-3 left-3 right-3">
            <div className="d-flex align-items-center gap-2 mb-1">
              <h3 className="fw-bold mb-0 text-white">{project.projectName}</h3>
              <Badge bg={statusVariant}>{project.status.replace('_', ' ')}</Badge>
            </div>
            <p className="text-white small mb-0 opacity-90">{project.description}</p>
          </div>
        </div>
      )}
      {!project.imageUrl && (
        <div className="d-flex align-items-center gap-3 mb-4">
          <Button variant="light" className="rounded-circle p-2" onClick={() => navigate('/projects')}>
            <FaArrowLeft />
          </Button>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-1">
              <h3 className="fw-bold mb-0">{project.projectName}</h3>
              <Badge bg={statusVariant}>{project.status.replace('_', ' ')}</Badge>
            </div>
            <p className="text-muted small mb-0">{project.description}</p>
          </div>
        </div>
      )}

      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 bg-primary text-white">
            <Card.Body className="p-3">
              <div className="small text-white-50 text-uppercase mb-1">Budget</div>
              <div className="fs-5 fw-bold">${(project.budget / 1e6).toFixed(2)}M</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-3">
              <div className="small text-muted text-uppercase mb-1">Timeline</div>
              <div className="small fw-bold"><FaCalendarAlt className="me-1 text-primary" />{project.startDate} → {project.endDate}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-3">
              <div className="small text-muted text-uppercase mb-1">Milestones</div>
              <div className="fs-5 fw-bold">{project.completedMilestones}/{project.totalMilestones}</div>
              <ProgressBar variant="success" now={progress} style={{ height: '4px' }} className="mt-1" />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-3">
              <div className="small text-muted text-uppercase mb-1">Tasks</div>
              <div className="fs-5 fw-bold">{project.completedTasks}/{project.totalTasks}</div>
              <ProgressBar variant="primary" now={project.totalTasks > 0 ? (project.completedTasks / project.totalTasks) * 100 : 0} style={{ height: '4px' }} className="mt-1" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Tab.Container defaultActiveKey="milestones">
        <Nav variant="pills" className="mb-4 bg-light rounded-4 p-1 gap-1">
          {['milestones', 'tasks', 'resources', 'approvals', 'issues'].map(tab => (
            <Nav.Item key={tab}>
              <Nav.Link eventKey={tab} className="rounded-3 text-capitalize px-4">
                {tab}
                {tab === 'resources' && allocations.length > 0 &&
                  <Badge bg="primary" pill className="ms-2">{allocations.length}</Badge>}
                {tab === 'approvals' && approvals.filter(a => a.status === 'PENDING').length > 0 &&
                  <Badge bg="danger" pill className="ms-2">{approvals.filter(a => a.status === 'PENDING').length}</Badge>}
                {tab === 'issues' && issues.filter(i => i.status === 'OPEN').length > 0 &&
                  <Badge bg="danger" pill className="ms-2">{issues.filter(i => i.status === 'OPEN').length}</Badge>}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="milestones">
            <div className="milestone-timeline position-relative ps-4 py-2">
              {milestones.length === 0 ? (
                <p className="text-muted">No milestones for this project.</p>
              ) : (
                milestones.map((m, index) => {
                  const isLast = index === milestones.length - 1;
                  const statusColor = STATUS_CONFIG[m.status];
                  
                  return (
                    <div key={m.milestoneId} className="timeline-item position-relative mb-5">
                      {!isLast && (
                        <div className="timeline-connector position-absolute" 
                          style={{ 
                            left: '-26px', 
                            top: '32px', 
                            bottom: '-48px', 
                            width: '4px', 
                            backgroundColor: m.status === 'COMPLETED' ? `var(--bs-success)` : '#e9ecef',
                            zIndex: 1
                          }}>
                          {m.status === 'IN_PROGRESS' && (
                            <div className="bg-primary" style={{ width: '100%', height: '60%', transition: 'height 1s ease' }} />
                          )}
                        </div>
                      )}
                      
                      <div className={`timeline-dot position-absolute rounded-circle shadow-sm d-flex align-items-center justify-content-center fw-bold border border-4 border-white text-white bg-${statusColor}`}
                        style={{ 
                          left: '-40px', 
                          top: '0', 
                          width: '32px', 
                          height: '32px', 
                          zIndex: 2,
                          transition: 'all 0.3s ease'
                        }}>
                        {m.status === 'COMPLETED' ? '✓' : m.order}
                      </div>

                      <Card className="border-0 shadow-sm rounded-4 overflow-hidden translate-hover">
                        <Card.Body className="p-4">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h5 className="fw-bold mb-1">{m.name}</h5>
                              <p className="small text-muted mb-0">{m.description}</p>
                            </div>
                            <div className="text-end">
                              <Badge bg={statusColor} className="rounded-pill px-3 py-2 text-uppercase letter-spacing-1">
                                {m.status.replace('_', ' ')}
                              </Badge>
                              <div className="mt-2 text-muted small font-monospace" style={{ fontSize: '0.7rem' }}>
                                {m.status === 'COMPLETED' ? 'Finalized' : m.status === 'IN_PROGRESS' ? 'Active' : 'Queued'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="d-flex flex-wrap gap-4 small text-muted mb-3">
                            <div className="d-flex align-items-center gap-2">
                              <span className="opacity-50">Timeline:</span>
                              <span className="fw-medium">{m.plannedStartDate} → {m.plannedEndDate}</span>
                            </div>
                            {m.isOverdue && <Badge bg="danger" className="shake-animation">OVERDUE</Badge>}
                            {m.daysRemaining > 0 && (
                              <div className="d-flex align-items-center gap-2">
                                <span className="opacity-50">Remaining:</span>
                                <span className="text-primary fw-bold">{m.daysRemaining} days</span>
                              </div>
                            )}
                          </div>

                          <div className="position-relative mt-4">
                            <div className="progress rounded-pill bg-light" style={{ height: '10px' }}>
                              <div className={`progress-bar progress-bar-striped progress-bar-animated bg-${statusColor}`}
                                style={{ 
                                  width: m.status === 'COMPLETED' ? '100%' : m.status === 'IN_PROGRESS' ? '65%' : '0%', 
                                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' 
                                }} />
                            </div>
                            {m.status === 'IN_PROGRESS' && (
                              <div className="position-absolute bg-white border border-primary border-3 rounded-circle shadow-sm"
                                style={{ 
                                  left: '65%', 
                                  top: '-4px', 
                                  width: '18px', 
                                  height: '18px',
                                  transform: 'translateX(-50%)',
                                  zIndex: 3
                                }} />
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  );
                })
              )}
            </div>
          </Tab.Pane>

          <Tab.Pane eventKey="tasks">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Project Tasks</h5>
              <Button variant="primary" size="sm" className="rounded-3" onClick={() => setShowTaskModal(true)}>
                + Assign New Task
              </Button>
            </div>
            <Card className="border-0 shadow-sm rounded-4">
              <Table hover className="mb-0 align-middle">
                <thead className="bg-light text-muted small text-uppercase">
                  <tr>
                    <th className="py-3 px-4 border-0">Task</th>
                    <th className="py-3 px-4 border-0">Assigned To</th>
                    <th className="py-3 px-4 border-0">Dept.</th>
                    <th className="py-3 px-4 border-0">Due</th>
                    <th className="py-3 px-4 border-0">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4 text-muted">No tasks for this project.</td></tr>
                  ) : tasks.map(task => (
                    <tr key={task.taskId}>
                      <td className="py-3 px-4">
                        <div className="fw-semibold text-dark">{task.description}</div>
                        <div className="small text-muted font-monospace">{task.taskId}</div>
                        {task.rejectionReason && <div className="small text-danger mt-1">⚠ {task.rejectionReason}</div>}
                      </td>
                      <td className="py-3 px-4 small">{task.assignedTo}</td>
                      <td className="py-3 px-4">
                        <Badge bg="light" text="dark" className="border small">{task.assignedDepartment.replace('_', ' ')}</Badge>
                      </td>
                      <td className="py-3 px-4 small text-muted">{task.plannedEnd}</td>
                      <td className="py-3 px-4">
                        <select className="form-select form-select-sm rounded-3 w-auto"
                          value={task.status}
                          onChange={e => handleTaskStatusChange(task.taskId, e.target.value)}>
                          <option value="NOT_STARTED">Not Started</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </Tab.Pane>

          <Tab.Pane eventKey="resources">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold mb-0">Resource Allocations</h5>
                <p className="text-muted small mb-0">Total cost committed: <strong>${allocations.reduce((s, a) => s + (a.resource?.totalCost || 0), 0).toLocaleString()}</strong></p>
              </div>
              <Button variant="outline-primary" size="sm" className="rounded-3 d-flex align-items-center gap-2" onClick={() => navigate('/allocations')}>
                <FaExternalLinkAlt size={12} /> Manage Allocations
              </Button>
            </div>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
              <Table hover responsive className="mb-0 align-middle">
                <thead className="bg-light text-muted small text-uppercase">
                  <tr>
                    <th className="py-3 px-4 border-0">Resource</th>
                    <th className="py-3 px-4 border-0">Type</th>
                    <th className="py-3 px-4 border-0">Cost Summary</th>
                    <th className="py-3 px-4 border-0">Period</th>
                    <th className="py-3 px-4 border-0">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-5 text-muted">No resources allocated to this project yet.</td></tr>
                  ) : allocations.map(a => (
                    <tr key={a.id}>
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3">
                            <FaTools />
                          </div>
                          <div>
                            <div className="fw-bold">{a.resource?.equipmentName || `Labors (${a.resource?.numberOfLabors})`}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{a.resource?.resourceId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge bg="light" text="dark" className="border">{a.resource?.type}</Badge>
                        <div className="small text-muted mt-1">{a.resource?.purpose}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="fw-bold text-success">${a.resource?.totalCost?.toLocaleString()}</div>
                        <div className="small text-muted">${a.resource?.costPerHour}/hr · {a.resource?.totalHours}h</div>
                      </td>
                      <td className="py-3 px-4 small">
                        <div>{a.assignedDate}</div>
                        <div className="text-muted">to {a.releasedDate || 'Present'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge bg={a.status === 'Active' ? 'success' : a.status === 'Released' ? 'secondary' : 'warning'}>
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </Tab.Pane>

          <Tab.Pane eventKey="approvals">
            <div className="d-flex flex-column gap-3">
              {approvals.length === 0 ? <p className="text-muted">No approvals for this project.</p> : approvals.map(a => (
                <Card key={a.approvalId} className="border-0 shadow-sm rounded-4">
                  <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold mb-1">{a.taskDescription}</div>
                      <div className="small text-muted">Requested by {a.requestedBy} · {new Date(a.requestedAt).toLocaleString()}</div>
                      <Badge bg="light" text="dark" className="border mt-1">{a.requestType.replace('_', ' ')}</Badge>
                    </div>
                    <Badge bg={STATUS_CONFIG[a.status]}>{a.status}</Badge>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Tab.Pane>

          {/* Issues Tab */}
          <Tab.Pane eventKey="issues">
            <div className="d-flex flex-column gap-3">
              {issues.length === 0 ? <p className="text-muted">No issues reported for this project.</p> : issues.map(issue => (
                <Card key={issue.issueId} className={`border-0 shadow-sm rounded-4 border-start border-4 border-${STATUS_CONFIG[issue.severity]}`}>
                  <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold mb-1">{issue.title}</div>
                      <p className="small text-muted mb-1">{issue.description}</p>
                      <div className="d-flex gap-2">
                        <Badge bg={STATUS_CONFIG[issue.severity]}>{issue.severity}</Badge>
                        <Badge bg={STATUS_CONFIG[issue.status]}>{issue.status}</Badge>
                      </div>
                    </div>
                    <div className="text-end small text-muted">
                      <div>Reported by {issue.reportedBy}</div>
                      <div>{new Date(issue.reportedAt).toLocaleDateString()}</div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Assign New Task</h5>
                <button type="button" className="btn-close" onClick={() => setShowTaskModal(false)}></button>
              </div>
              <form onSubmit={handleCreateTask}>
                <div className="modal-body">
                  {taskError && (
                    <div className="alert alert-danger rounded-3 small py-2 d-flex align-items-center gap-2 mb-3">
                      <FaExclamationTriangle /> {taskError}
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Task Description</label>
                    <input 
                      type="text" 
                      className="form-control rounded-3" 
                      required
                      value={newTask.description}
                      onChange={e => setNewTask({...newTask, description: e.target.value})}
                      placeholder="Enter task details..."
                    />
                  </div>
                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <label className="form-label small fw-bold">Department</label>
                      <select 
                        className="form-select rounded-3"
                        value={newTask.assignedDepartment}
                        onChange={e => setNewTask({...newTask, assignedDepartment: e.target.value})}
                      >
                        <option value="SITE_ENGINEER">Site Operations</option>
                        <option value="SAFETY_OFFICER">Safety</option>
                        <option value="VENDOR">Vendor</option>
                        <option value="FINANCE">Finance</option>
                      </select>
                    </Col>
                    <Col md={6}>
                      <label className="form-label small fw-bold">Assign To (User ID)</label>
                      <input 
                        type="text" 
                        className="form-control rounded-3" 
                        required
                        value={newTask.assignedTo}
                        onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}
                        placeholder="e.g. BSV001"
                      />
                    </Col>
                  </Row>
                  <Row className="g-3">
                    <Col md={6}>
                      <label className="form-label small fw-bold">Start Date</label>
                      <input 
                        type="date" 
                        className="form-control rounded-3" 
                        required
                        value={newTask.plannedStart}
                        onChange={e => setNewTask({...newTask, plannedStart: e.target.value})}
                      />
                    </Col>
                    <Col md={6}>
                      <label className="form-label small fw-bold">End Date</label>
                      <input 
                        type="date" 
                        className="form-control rounded-3" 
                        required
                        value={newTask.plannedEnd}
                        onChange={e => setNewTask({...newTask, plannedEnd: e.target.value})}
                      />
                    </Col>
                  </Row>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <Button variant="light" className="rounded-3" onClick={() => setShowTaskModal(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" className="rounded-3 px-4">Assign Task</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
