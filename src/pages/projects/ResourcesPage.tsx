import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, Modal, Form, Spinner } from 'react-bootstrap';
import { FaPlus, FaTools, FaUsers, FaBoxOpen, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { resourceService } from '../../services/resourceService';
import projectService from '../../services/projectService';
import { financeService } from '../../services/financeService';
import type { Resource } from '../../services/resourceService';
import type { ProjectResponse } from '../../services/projectService';
import { toast } from 'react-toastify';

const STATUS_COLORS: Record<string, string> = {
  Available: 'success',
  Unavailable: 'danger',
  Maintenance: 'warning',
  BUDGET_APPROVED: 'success',
  BUDGET_PENDING: 'warning',
  BUDGET_REJECTED: 'danger',
  NONE: 'secondary'
};

const ResourceModal: React.FC<{ show: boolean; onHide: () => void; onCreated: () => void; projects: ProjectResponse[]; editingResource?: Resource | null }> = ({ show, onHide, onCreated, projects, editingResource }) => {
  const [form, setForm] = useState<Partial<Resource>>({ 
    type: 'LABOR', 
    availability: 'AVAILABLE', 
    costPerHour: 0, 
    totalHours: 0, 
    projectId: '', 
    purpose: '',
    numberOfLabors: 0,
    skillLevel: 'SKILLED',
    equipmentName: '',
    equipmentLevel: 'BASIC',
    issueId: '',
    siteId: '',
    siteEngineerUserId: '',
    budgetRejectionReason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingResource) {
      setForm(editingResource);
    } else {
      setForm({ 
        type: 'LABOR', 
        availability: 'AVAILABLE', 
        costPerHour: 0, 
        totalHours: 0, 
        projectId: '', 
        purpose: '',
        numberOfLabors: 0,
        skillLevel: 'SKILLED',
        equipmentName: '',
        equipmentLevel: 'BASIC',
        issueId: '',
        siteId: '',
        siteEngineerUserId: '',
        budgetRejectionReason: ''
      });
    }
  }, [editingResource, show]);

  const totalCost = (form.type === 'LABOR' ? (form.numberOfLabors || 0) : 1) * (form.costPerHour || 0) * (form.totalHours || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload: any = { 
      resourceId: form.resourceId || "",
      type: form.type,
      availability: form.availability,
      numberOfLabors: form.type === 'LABOR' ? form.numberOfLabors : 0,
      skillLevel: form.type === 'LABOR' ? form.skillLevel : "SKILLED",
      equipmentName: form.type === 'EQUIPMENT' ? form.equipmentName : "",
      equipmentLevel: form.type === 'EQUIPMENT' ? form.equipmentLevel : "BASIC",
      costPerHour: form.costPerHour || 0,
      totalCost: totalCost || 0,
      projectId: form.projectId || "",
      totalHours: form.totalHours || 0,
      issueId: form.issueId || "",
      siteId: form.siteId || "",
      siteEngineerUserId: form.siteEngineerUserId || "",
      purpose: form.purpose || "",
      budgetStatus: "NONE",
      budgetId: form.budgetId || "",
      budgetRejectionReason: ""
    };

    try {
      if (editingResource?.id) {
        await resourceService.updateResource(editingResource.id, payload);
        toast.success('Resource updated successfully');
      } else {
        await resourceService.addResource(payload);
        toast.success('Resource added successfully');
      }
      onCreated(); 
      onHide();
    } catch (err) {
      console.error('Failed to save resource:', err);
      toast.error('Failed to save resource');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">{editingResource ? 'Edit Resource' : 'Add New Resource'}</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group><Form.Label className="small fw-bold">RESOURCE TYPE</Form.Label>
                <Form.Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} className="rounded-3">
                  <option value="LABOR">Labor</option><option value="EQUIPMENT">Equipment</option><option value="MATERIAL">Material</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group><Form.Label className="small fw-bold">AVAILABILITY</Form.Label>
                <Form.Select value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value as any })} className="rounded-3">
                  <option value="AVAILABLE">Available</option><option value="UNAVAILABLE">Unavailable</option><option value="MAINTENANCE">Maintenance</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {form.type === 'LABOR' && (
              <>
                <Col md={6}><Form.Group><Form.Label className="small fw-bold">NUMBER OF LABORS</Form.Label><Form.Control type="number" value={form.numberOfLabors} onChange={e => setForm({ ...form, numberOfLabors: Number(e.target.value) })} className="rounded-3" /></Form.Group></Col>
                <Col md={6}><Form.Group><Form.Label className="small fw-bold">SKILL LEVEL</Form.Label>
                  <Form.Select value={form.skillLevel} onChange={e => setForm({ ...form, skillLevel: e.target.value as any })} className="rounded-3">
                    <option value="SKILLED">Skilled</option><option value="SEMI_SKILLED">Semi-Skilled</option><option value="UNSKILLED">Unskilled</option>
                  </Form.Select>
                </Form.Group></Col>
              </>
            )}

            {form.type === 'EQUIPMENT' && (
              <>
                <Col md={6}><Form.Group><Form.Label className="small fw-bold">EQUIPMENT NAME</Form.Label><Form.Control value={form.equipmentName} onChange={e => setForm({ ...form, equipmentName: e.target.value })} className="rounded-3" /></Form.Group></Col>
                <Col md={6}><Form.Group><Form.Label className="small fw-bold">EQUIPMENT LEVEL</Form.Label>
                  <Form.Select value={form.equipmentLevel} onChange={e => setForm({ ...form, equipmentLevel: e.target.value as any })} className="rounded-3">
                    <option value="BASIC">Basic</option><option value="ADVANCED">Advanced</option><option value="SPECIALIZED">Specialized</option>
                  </Form.Select>
                </Form.Group></Col>
              </>
            )}

            <Col md={4}><Form.Group><Form.Label className="small fw-bold">COST PER HOUR ($)</Form.Label><Form.Control type="number" value={form.costPerHour} onChange={e => setForm({ ...form, costPerHour: Number(e.target.value) })} className="rounded-3" /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label className="small fw-bold">TOTAL HOURS</Form.Label><Form.Control type="number" value={form.totalHours} onChange={e => setForm({ ...form, totalHours: Number(e.target.value) })} className="rounded-3" /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label className="small fw-bold">TOTAL ESTIMATED COST</Form.Label><div className="fs-4 fw-bold text-success">${totalCost.toLocaleString()}</div></Form.Group></Col>

            <Col md={12} className="mt-4"><div className="border-bottom pb-2 mb-3 fw-bold text-muted small text-uppercase letter-spacing-1">Assignment & Finance Mapping</div></Col>
            
            <Col md={6}>
              <Form.Group><Form.Label className="small fw-bold">PROJECT *</Form.Label>
                <Form.Select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} required className="rounded-3">
                  <option value="">Select Project...</option>
                  {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}><Form.Group><Form.Label className="small fw-bold">SITE ID</Form.Label><Form.Control value={form.siteId} onChange={e => setForm({ ...form, siteId: e.target.value })} className="rounded-3" placeholder="e.g. SITE-001" /></Form.Group></Col>
            
            <Col md={6}><Form.Group><Form.Label className="small fw-bold">SITE ENGINEER ID</Form.Label><Form.Control value={form.siteEngineerUserId} onChange={e => setForm({ ...form, siteEngineerUserId: e.target.value })} className="rounded-3" placeholder="e.g. ENG-45" /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label className="small fw-bold">BUDGET ID</Form.Label><Form.Control value={form.budgetId} onChange={e => setForm({ ...form, budgetId: e.target.value })} className="rounded-3" placeholder="e.g. BDG-2024-05" /></Form.Group></Col>
            
            <Col md={12}><Form.Group><Form.Label className="small fw-bold">RELATED ISSUE ID (OPTIONAL)</Form.Label><Form.Control value={form.issueId} onChange={e => setForm({ ...form, issueId: e.target.value })} className="rounded-3" placeholder="Link to a specific site issue..." /></Form.Group></Col>
            
            <Col md={12}><Form.Group><Form.Label className="small fw-bold">PURPOSE / TASK DESCRIPTION *</Form.Label><Form.Control as="textarea" rows={2} value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} required className="rounded-3" placeholder="Describe what this resource will be used for..." /></Form.Group></Col>
          </Row>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="light" className="rounded-3" onClick={onHide}>Cancel</Button>
            <Button variant="success" type="submit" className="rounded-3 px-4" disabled={submitting}>{submitting ? (editingResource ? 'Updating...' : 'Adding...') : (editingResource ? 'Update Resource' : 'Add Resource')}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);

  const load = async () => { 
    setLoading(true); 
    try {
      const [resData, projData] = await Promise.all([
        resourceService.getResources(),
        projectService.getProjects()
      ]);
      setResources(resData);
      setProjects(projData);
    } catch (err) {
      console.error('Failed to load resources/projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setShowModal(true);
  };

  const handleDeleteClick = (resource: Resource) => {
    setResourceToDelete(resource);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!resourceToDelete) return;
    try {
      await resourceService.deleteResource(resourceToDelete.id);
      toast.success('Resource deleted successfully');
      setShowDeleteModal(false);
      setResourceToDelete(null);
      load();
    } catch (err) {
      console.error('Failed to delete resource:', err);
      toast.error('Failed to delete resource');
    }
  };

  const getIcon = (type: string) => {
    if (type === 'LABOR') return <FaUsers className="text-primary" />;
    if (type === 'EQUIPMENT') return <FaTools className="text-warning" />;
    return <FaBoxOpen className="text-info" />;
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h3 className="fw-bold mb-1">Resource Management</h3><p className="text-muted mb-0">Track labor, equipment, and materials across projects.</p></div>
        <Button variant="success" className="rounded-3 d-flex align-items-center gap-2" onClick={() => { setEditingResource(null); setShowModal(true); }}><FaPlus /> Add Resource</Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="text-muted mt-2">Loading resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm">
          <FaBoxOpen size={48} className="text-muted mb-3 opacity-25" />
          <h5 className="text-muted">No resources found</h5>
          <p className="text-muted small">Start by adding labor, equipment or materials.</p>
        </div>
      ) : (
        <Row className="g-4">
          {resources.map(res => (
            <Col md={6} lg={4} key={res.resourceId || res.id}>
              <Card className="border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden">
                <div className={`position-absolute top-0 end-0 p-3 bg-${STATUS_COLORS[res.availability]} bg-opacity-10 text-${STATUS_COLORS[res.availability]} rounded-bottom-start small fw-bold`}>
                  {res.availability}
                </div>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="bg-light p-3 rounded-4">{getIcon(res.type)}</div>
                    <div>
                      <h6 className="fw-bold mb-0">{res.type === 'LABOR' ? `${res.numberOfLabors || 0}x ${res.skillLevel || 'General'} Labor` : res.equipmentName || 'Resource'}</h6>
                      <div className="small text-muted">{res.projectName || 'Unassigned'}</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="small text-muted mb-2 text-truncate-2" style={{ height: '40px' }}>{res.purpose || 'No purpose defined.'}</p>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small text-muted">Budget Status</span>
                      <Badge bg={STATUS_COLORS[res.budgetStatus || 'NONE']} className={(res.budgetStatus || 'NONE') === 'BUDGET_PENDING' ? 'text-dark' : ''}>
                        {(res.budgetStatus || 'NONE').replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="small text-muted">Total Cost</div>
                        <div className="fw-bold text-dark">${(res.totalCost || 0).toLocaleString()}</div>
                      </div>
                      <div className="d-flex gap-2">
                        {(res.budgetStatus === 'NONE' || res.budgetStatus === 'BUDGET_REJECTED') && (
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="rounded-3"
                            onClick={async () => {
                              try {
                                await financeService.requestResourceBudget({
                                  projectId: res.projectId,
                                  resourceId: res.resourceId,
                                  amount: res.totalCost,
                                  description: `Budget request for ${res.type}: ${res.resourceId}`
                                });
                                toast.success('Budget request raised successfully!');
                                load();
                              } catch (e) {
                                toast.error('Failed to raise budget request');
                              }
                            }}
                          >
                            Request Budget
                          </Button>
                        )}
                        <Button variant="outline-primary" size="sm" className="rounded-3" onClick={() => handleEdit(res)}>
                          <FaEdit />
                        </Button>
                        <Button variant="outline-danger" size="sm" className="rounded-3" onClick={() => handleDeleteClick(res)}>
                          <FaTrash />
                        </Button>
                      </div>
                    </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      <ResourceModal show={showModal} onHide={() => { setShowModal(false); setEditingResource(null); }} onCreated={load} projects={projects} editingResource={editingResource} />
      
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Delete Resource</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this resource?</p>
          {resourceToDelete && (
            <div className="bg-light p-3 rounded-3">
              <strong>Resource:</strong> {resourceToDelete.type === 'LABOR' ? `${resourceToDelete.numberOfLabors}x ${resourceToDelete.skillLevel} Labor` : resourceToDelete.equipmentName}
              <br />
              <strong>Project:</strong> {resourceToDelete.projectName || 'Unassigned'}
              <br />
              <strong>Cost:</strong> ${(resourceToDelete.totalCost || 0).toLocaleString()}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowDeleteModal(false)} className="rounded-3">Cancel</Button>
          <Button variant="danger" onClick={handleDeleteConfirm} className="rounded-3">Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
