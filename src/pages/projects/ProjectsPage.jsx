import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Form, InputGroup, ProgressBar, Modal } from 'react-bootstrap';
import { FaSearch, FaPlus, FaBuilding, FaCalendarAlt, FaDollarSign, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
import { getRandomProjectImage } from '../../utils/projectImages';
import { toast } from 'react-toastify';

const STATUS_CONFIG = {
  IN_PROGRESS: { bg: 'primary', text: 'text-primary', label: 'In Progress' },
  COMPLETED: { bg: 'success', text: 'text-success', label: 'Completed' },
  ON_HOLD: { bg: 'warning', text: 'text-warning', label: 'On Hold' },
  CANCELLED: { bg: 'danger', text: 'text-danger', label: 'Cancelled' },
  NOT_STARTED: { bg: 'secondary', text: 'text-secondary', label: 'Not Started' }
};

const CreateProjectModal = ({ show, onHide, onCreated }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [form, setForm] = useState({ templateId: '', projectName: '', description: '', startDate: '', endDate: '', budget: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        budget: Number(form.budget)
      };
      await projectService.createProject(payload);
      toast.success('Project created successfully');
      onCreated(); onHide();
      setForm({ templateId: '', projectName: '', description: '', startDate: '', endDate: '', budget: 0 });
      setSelectedTemplate(null);
    } catch (err) {
      console.error('Create project error:', err);
      setError('Failed to create project');
      toast.error('Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Create New Project</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">PROJECT NAME *</Form.Label>
                <Form.Control type="text" value={form.projectName} onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))} required className="rounded-3" placeholder="Enter project name" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">TEMPLATE</Form.Label>
                <Form.Select value={form.templateId} onChange={e => setForm(f => ({ ...f, templateId: e.target.value }))} className="rounded-3" required>
                  <option value="">Select template</option>
                  {templates.map(template => (
                    <option key={template.templateId} value={template.templateId}>{template.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">DESCRIPTION *</Form.Label>
                <Form.Control as="textarea" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required className="rounded-3" placeholder="Project description..." />
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
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">BUDGET *</Form.Label>
                <Form.Control type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} required className="rounded-3" placeholder="0.00" />
              </Form.Group>
            </Col>
          </Row>
          {error && (
            <div className="alert alert-danger mt-3">
              {error}
            </div>
          )}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="light" className="rounded-3" onClick={onHide}>Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-3 px-4" disabled={submitting}>{submitting ? 'Creating...' : 'Create Project'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await projectService.getProjects();
      setProjects(data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredProjects = projects.filter(project =>
    project.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setShowCreate(true);
  };

  const handleRefresh = async () => {
    setSyncing(true);
    try {
      await load();
      toast.success('Projects refreshed');
    } catch (err) {
      console.error('Failed to refresh projects:', err);
      toast.error('Failed to refresh projects');
    } finally {
      setSyncing(false);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Projects</h3>
          <p className="text-muted mb-0">Manage construction projects and track progress.</p>
        </div>
        <div className="d-flex gap-2">
          <InputGroup className="w-auto">
            <Form.Control
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="rounded-3"
            />
            <Button variant="outline-secondary" className="rounded-3">
              <FaSearch />
            </Button>
          </InputGroup>
          <Button variant="outline-secondary" className="rounded-3 d-flex align-items-center gap-2" onClick={handleRefresh} disabled={syncing}>
            <FaCalendarAlt className={syncing ? 'fa-spin' : ''} /> {syncing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="primary" className="rounded-3 d-flex align-items-center gap-2" onClick={openCreateModal}>
            <FaPlus /> Create Project
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4">
          <FaBuilding size={40} className="text-muted mb-3 opacity-25" />
          <p className="text-muted mb-0">No projects found. Use the button above to create one.</p>
        </div>
      ) : (
        <Row className="g-4">
          {filteredProjects.map(project => {
            const status = STATUS_CONFIG[project.status] || { bg: 'secondary', label: project.status };
            return (
              <Col md={6} lg={4} key={project.projectId}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Header className="bg-light border-0">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="fw-bold mb-1">{project.projectName}</h6>
                        <p className="text-muted mb-2">{project.description}</p>
                        <div className="d-flex align-items-center gap-2">
                          <Badge bg={status.bg} className="fs-6">{status.label}</Badge>
                          <small className="text-muted ms-2">{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</small>
                        </div>
                      </div>
                      <div className="text-end">
                        <Button variant="outline-primary" size="sm" className="rounded-3" onClick={() => navigate(`/projects/${project.projectId}`)}>
                          <FaEye /> View Details
                        </Button>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small text-muted">Budget</span>
                        <span className="fw-bold fs-5 text-primary">${project.budget?.toLocaleString()}</span>
                      </div>
                      <ProgressBar now={(project.totalMilestones / project.totalMilestones) * 100} className="flex-grow-1" />
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Progress</span>
                      <span className="fw-bold fs-5 text-success">{project.completedMilestones}/{project.totalMilestones}</span>
                      <span className="small text-muted ms-2">milestones completed</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Tasks</span>
                      <span className="fw-bold fs-5 text-info">{project.completedTasks}/{project.totalTasks}</span>
                      <span className="small text-muted ms-2">tasks completed</span>
                    </div>
                  </Card.Body>
                  <div className="text-center">
                    <img src={project.imageUrl || getRandomProjectImage()} alt={project.projectName} className="rounded-3 mb-3" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  </div>
                  <Card.Footer className="bg-light border-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </small>
                      <div className="d-flex gap-2">
                        <Button variant="outline-primary" size="sm" className="rounded-3" onClick={() => navigate(`/projects/${project.projectId}`)}>
                          <FaEye /> View Details
                        </Button>
                      </div>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <CreateProjectModal show={showCreate} onHide={() => setShowCreate(false)} onCreated={load} />
    </div>
  );
};
