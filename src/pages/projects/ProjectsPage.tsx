import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Form, InputGroup, ProgressBar, Modal } from 'react-bootstrap';
import { FaSearch, FaPlus, FaBuilding, FaCalendarAlt, FaDollarSign, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
import type { ProjectResponse, CreateProjectPayload, TemplateResponse } from '../../services/projectService';
import { getRandomProjectImage } from '../../utils/projectImages';

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  IN_PROGRESS: { bg: 'primary', text: 'text-primary', label: 'In Progress' },
  COMPLETED:   { bg: 'success', text: 'text-success', label: 'Completed' },
  ON_HOLD:     { bg: 'warning', text: 'text-warning', label: 'On Hold' },
  CANCELLED:   { bg: 'danger',  text: 'text-danger',  label: 'Cancelled' },
  NOT_STARTED: { bg: 'secondary', text: 'text-secondary', label: 'Not Started' }
};

// ── Create Project Modal ───────────────────────

const CreateProjectModal: React.FC<{ show: boolean; onHide: () => void; onCreated: (p: ProjectResponse) => void }> = ({ show, onHide, onCreated }) => {
  const [templates, setTemplates] = useState<TemplateResponse[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateResponse | null>(null);
  const [form, setForm] = useState<CreateProjectPayload>({ templateId: '', projectName: '', description: '', startDate: '', endDate: '', budget: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setLoading(true);
      projectService.getTemplates()
        .then(setTemplates)
        .catch(() => setError('Could not load project templates.'))
        .finally(() => setLoading(false));
    }
  }, [show]);

  const selectTemplate = (t: TemplateResponse) => {
    setSelectedTemplate(t);
    setForm(f => ({ ...f, templateId: t.templateId, budget: t.defaultBudget }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.templateId) { setError('Please select a template.'); return; }
    if (new Date(form.endDate) <= new Date(form.startDate)) { setError('End date must be after start date.'); return; }
    setSubmitting(true);
    try {
      // Auto-assign a random image from the default collection
      const payload = {
        ...form,
        imageUrl: getRandomProjectImage()
      };
      const project = await projectService.createProject(payload);
      onCreated(project);
      onHide();
    } catch { setError('Failed to create project. Please try again.'); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">Create New Project</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 bg-light">
        <Form onSubmit={handleSubmit}>
          {/* Step 1: Template Selection */}
          <h6 className="fw-bold text-muted text-uppercase mb-3">Step 1 — Choose Template</h6>
          <Row className="g-3 mb-4">
            {loading ? (
              <Col xs={12} className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                <span className="text-muted">Loading templates...</span>
              </Col>
            ) : templates.length === 0 ? (
              <Col xs={12} className="text-center py-4 bg-white rounded-4 border border-dashed">
                <p className="text-muted mb-0">No templates found on the server.</p>
              </Col>
            ) : (
              templates.map(t => (
                <Col md={4} key={t.templateId}>
                  <Card
                    className={`border-2 rounded-4 h-100 cursor-pointer transition-all ${selectedTemplate?.templateId === t.templateId ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : 'border-light bg-white hover-shadow'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => selectTemplate(t)}
                  >
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold text-dark">{t.templateName}</span>
                        {selectedTemplate?.templateId === t.templateId && <Badge bg="primary">Selected</Badge>}
                      </div>
                      <p className="small text-muted mb-2 text-truncate-2">{t.description}</p>
                      <div className="d-flex flex-wrap gap-2 small text-muted">
                        <span>⏱ {t.estimatedDuration}m</span>
                        <span>📋 {t.milestoneCount} milestones</span>
                      </div>
                      <div className="mt-2 small fw-bold text-success">
                        ${(t.defaultBudget / 1e6).toFixed(1)}M default
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>

          {/* Step 2: Project Details */}
          <h6 className="fw-bold text-muted text-uppercase mb-3">Step 2 — Project Details</h6>
          <Row className="g-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">PROJECT NAME *</Form.Label>
                <Form.Control
                  value={form.projectName} onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))}
                  placeholder="e.g. Metro Tower Block B" required minLength={3} maxLength={200}
                  className="rounded-3 bg-white border"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">BUDGET (USD) *</Form.Label>
                <Form.Control
                  type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: Number(e.target.value) }))}
                  min={1} required className="rounded-3 bg-white border"
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">DESCRIPTION</Form.Label>
                <Form.Control
                  as="textarea" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of the project..." maxLength={1000}
                  className="rounded-3 bg-white border"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">START DATE *</Form.Label>
                <Form.Control type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required className="rounded-3" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">END DATE *</Form.Label>
                <Form.Control type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required className="rounded-3" />
              </Form.Group>
            </Col>
          </Row>

          {error && <div className="alert alert-danger mt-3 rounded-3">{error}</div>}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="light" onClick={onHide} className="rounded-3 px-4">Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting} className="rounded-3 px-4">
              {submitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

// ── Main Projects Page ─────────────────────────

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [filtered, setFiltered] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    projectService.getProjects().then(data => {
      setProjects(data);
      setFiltered(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = Array.isArray(projects) ? projects : [];
    if (statusFilter !== 'ALL') result = result.filter(p => p.status === statusFilter);
    if (search) result = result.filter(p => p.projectName.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, statusFilter, projects]);

  const handleCreated = (project: ProjectResponse) => setProjects(prev => [project, ...prev]);

  // Ensure all projects have an image
  const projectsWithImages = filtered.map(project => ({
    ...project,
    imageUrl: project.imageUrl || getRandomProjectImage()
  }));

  return (
    <div className="p-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Projects</h3>
          <p className="text-muted mb-0">{projects.length} total projects across all sites</p>
        </div>
        <Button variant="primary" className="rounded-3 d-flex align-items-center gap-2 px-4" onClick={() => setShowCreate(true)}>
          <FaPlus /> New Project
        </Button>
      </div>

      {/* Filters */}
      <Row className="g-3 mb-4">
        <Col md={5}>
          <InputGroup>
            <InputGroup.Text className="bg-white border-end-0 text-muted"><FaSearch /></InputGroup.Text>
            <Form.Control placeholder="Search projects..." className="border-start-0" value={search} onChange={e => setSearch(e.target.value)} />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="CANCELLED">Cancelled</option>
          </Form.Select>
        </Col>
        <Col md={4} className="text-muted d-flex align-items-center justify-content-md-end">
          <span className="small">{filtered.length} project{filtered.length !== 1 ? 's' : ''} shown</span>
        </Col>
      </Row>

      {/* Project Cards Grid */}
      {loading ? (
        <div className="text-center py-5 text-muted">Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5">
          <FaBuilding size={48} className="text-muted opacity-25 mb-3" />
          <p className="text-muted">No projects found. Try adjusting your filters.</p>
        </div>
      ) : (
        <Row className="g-4">
          {Array.isArray(projectsWithImages) && projectsWithImages.map(project => {
            const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.NOT_STARTED;
            const progress = project.totalMilestones > 0 ? Math.round((project.completedMilestones / project.totalMilestones) * 100) : 0;
            const taskProgress = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0;

            return (
              <Col md={6} lg={4} key={project.projectId}>
                <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                >
                  {project.imageUrl && (
                    <div className="position-relative" style={{ height: '160px', overflow: 'hidden' }}>
                      <img
                        src={project.imageUrl}
                        alt={project.projectName}
                        className="w-100 h-100 object-fit-cover"
                        style={{ objectPosition: 'center' }}
                      />
                      <div className="position-absolute top-3 end-3">
                        <Badge bg={statusCfg.bg} className="bg-opacity-90 border px-2 py-1" style={{ color: 'white', borderColor: 'white' }}>
                          {statusCfg.label}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <Card.Body className={`p-4 d-flex flex-column ${!project.imageUrl ? '' : 'pt-3'}`}>
                    {!project.imageUrl && (
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                          <FaBuilding size={18} />
                        </div>
                        <Badge bg={statusCfg.bg} className="bg-opacity-10 border px-2 py-1" style={{ color: `var(--bs-${statusCfg.bg})`, borderColor: `var(--bs-${statusCfg.bg})` }}>
                          {statusCfg.label}
                        </Badge>
                      </div>
                    )}

                    <h5 className="fw-bold text-dark mb-1">{project.projectName}</h5>
                    <p className="small text-muted mb-3" style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{project.description}</p>

                    <div className="d-flex align-items-center gap-2 mb-2 small text-muted">
                      <FaCalendarAlt className="text-primary opacity-50" />
                      <span>{project.startDate} → {project.endDate}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-3 small text-muted">
                      <FaDollarSign className="text-success opacity-50" />
                      <span className="fw-bold text-dark">${(project.budget / 1e6).toFixed(2)}M</span>
                    </div>

                    {/* Milestone Progress */}
                    <div className="mb-2">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="text-muted">Milestones</span>
                        <span className="fw-bold">{project.completedMilestones}/{project.totalMilestones}</span>
                      </div>
                      <ProgressBar variant={statusCfg.bg} now={progress} style={{ height: '6px' }} className="rounded-pill" />
                    </div>

                    {/* Task Progress */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="text-muted">Tasks</span>
                        <span className="fw-bold">{project.completedTasks}/{project.totalTasks}</span>
                      </div>
                      <ProgressBar variant="secondary" now={taskProgress} style={{ height: '4px' }} className="rounded-pill" />
                    </div>

                    {/* Actions */}
                    <div className="mt-auto d-flex gap-2">
                      <Button variant="primary" size="sm" className="flex-grow-1 rounded-3 d-flex align-items-center justify-content-center gap-2"
                        onClick={() => navigate(`/projects/${project.projectId}`)}>
                        <FaEye size={12} /> View
                      </Button>
                      <Button variant="outline-secondary" size="sm" className="rounded-3"><FaEdit size={12} /></Button>
                      <Button variant="outline-danger" size="sm" className="rounded-3"><FaTrash size={12} /></Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <CreateProjectModal show={showCreate} onHide={() => setShowCreate(false)} onCreated={handleCreated} />
    </div>
  );
};
