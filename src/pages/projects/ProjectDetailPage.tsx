import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Badge, Button, Nav, Tab, ProgressBar, Table } from 'react-bootstrap';
import { FaArrowLeft, FaBuilding, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
import projectService from '../../services/projectService';
import type { ProjectResponse, MilestoneResponse, TaskResponse, ApprovalResponse, IssueResponse } from '../../services/projectService';
import safetyService from '../../services/safetyService';
import vendorService from '../../services/vendorService';
import { financeService } from '../../services/financeService';
import { siteOpsService } from '../../services/siteOpsService';
import { notificationService } from '../../services/notificationService';
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
  const [loading, setLoading] = useState(true);
  
  // Create Task Modal State
  const [showTaskModal, setShowTaskModal] = useState(false);
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
      projectService.getIssues(projectId)
    ]).then(([proj, ms, tasks, approvals, issues]) => {
      setProject(proj || null);
      setMilestones(ms);
      setTasks(tasks);
      setApprovals(approvals.filter(a => a.projectId === projectId));
      setIssues(issues);
      setLoading(false);
    });
  }, [projectId]);

  if (loading) return <div className="p-4 text-center text-muted">Loading project details...</div>;
  if (!project) return <div className="p-4 text-center text-danger">Project not found.</div>;

  const progress = project.totalMilestones > 0 ? Math.round((project.completedMilestones / project.totalMilestones) * 100) : 0;
  const statusVariant = STATUS_CONFIG[project.status] || 'secondary';

  const handleMilestoneStatusChange = async (milestoneId: string, status: string) => {
    await projectService.updateMilestoneStatus(milestoneId, status);
    setMilestones(prev => prev.map(m => m.milestoneId === milestoneId ? { ...m, status: status as any } : m));
  };

  const handleTaskStatusChange = async (taskId: string, status: string) => {
    await projectService.updateTaskStatus(taskId, status);
    setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: status as any } : t));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    try {
      const payload: CreateTaskPayload = {
        ...newTask,
        projectId,
        actualStart: newTask.plannedStart,
        actualEnd: newTask.plannedEnd
      };
      const created = await projectService.createTask(projectId, payload);
      setTasks(prev => [...prev, created]);
      
      // 2. Sync with Target Module and Send Notification
      try {
        // Multi-module synchronization logic with 403 protection
        const syncMap: Record<string, () => Promise<any>> = {
          'SAFETY_OFFICER': safetyService.syncTasks,
          'VENDOR_OFFICER': vendorService.syncTasks,
          'FINANCE_OFFICER': financeService.syncTasks,
          'SITE_ENGINEER': siteOpsService.syncTasks
        };

        const syncFn = syncMap[newTask.assignedDepartment];
        if (syncFn) {
          try {
            await syncFn();
          } catch (syncErr: any) {
            // Ignore 403/401 to prevent login redirect, but log other issues
            if (syncErr.response?.status !== 403 && syncErr.response?.status !== 401) {
              console.warn(`Sync failed for ${newTask.assignedDepartment}`, syncErr);
            }
          }
        }

        // Send Global Notification
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
        console.warn("Notification trigger failed", err);
      }

      setShowTaskModal(false);
      setNewTask({
        description: '',
        assignedDepartment: 'SITE_ENGINEER',
        assignedTo: '',
        plannedStart: new Date().toISOString().split('T')[0],
        plannedEnd: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]
      });
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
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

      {/* KPI Cards */}
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

      {/* Tabbed Content */}
      <Tab.Container defaultActiveKey="milestones">
        <Nav variant="pills" className="mb-4 bg-light rounded-4 p-1 gap-1">
          {['milestones', 'tasks', 'approvals', 'issues'].map(tab => (
            <Nav.Item key={tab}>
              <Nav.Link eventKey={tab} className="rounded-3 text-capitalize px-4">
                {tab}
                {tab === 'approvals' && approvals.filter(a => a.status === 'PENDING').length > 0 &&
                  <Badge bg="danger" pill className="ms-2">{approvals.filter(a => a.status === 'PENDING').length}</Badge>}
                {tab === 'issues' && issues.filter(i => i.status === 'OPEN').length > 0 &&
                  <Badge bg="danger" pill className="ms-2">{issues.filter(i => i.status === 'OPEN').length}</Badge>}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        <Tab.Content>
          {/* Milestones Tab */}
          <Tab.Pane eventKey="milestones">
            <div className="d-flex flex-column gap-3">
              {milestones.length === 0 ? <p className="text-muted">No milestones for this project.</p> : milestones.map(m => (
                <Card key={m.milestoneId} className="border-0 shadow-sm rounded-4">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <div className={`rounded-circle bg-${STATUS_CONFIG[m.status]} text-white d-flex align-items-center justify-content-center fw-bold`} style={{ width: 28, height: 28, fontSize: 12 }}>
                            {m.order}
                          </div>
                          <h6 className="fw-bold mb-0">{m.name}</h6>
                        </div>
                        <p className="small text-muted mb-0">{m.description}</p>
                      </div>
                      <select className="form-select form-select-sm rounded-3 w-auto"
                        value={m.status}
                        onChange={e => handleMilestoneStatusChange(m.milestoneId, e.target.value)}>
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                    {/* Gantt bar */}
                    <div className="d-flex gap-3 small text-muted">
                      <span>Planned: {m.plannedStartDate} → {m.plannedEndDate}</span>
                      {m.isOverdue && <Badge bg="danger">OVERDUE</Badge>}
                      {m.daysRemaining > 0 && <span className="text-primary">{m.daysRemaining} days left</span>}
                    </div>
                    <div className="mt-2" style={{ height: '8px', background: '#f1f3f5', borderRadius: '4px', overflow: 'hidden' }}>
                      <div className={`h-100 bg-${STATUS_CONFIG[m.status]}`}
                        style={{ width: m.status === 'COMPLETED' ? '100%' : m.status === 'IN_PROGRESS' ? '55%' : '0%', transition: 'width 0.5s ease' }} />
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Tab.Pane>

          {/* Tasks Tab */}
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

          {/* Approvals Tab */}
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
                        <option value="VENDOR_OFFICER">Vendor</option>
                        <option value="FINANCE_OFFICER">Finance</option>
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
