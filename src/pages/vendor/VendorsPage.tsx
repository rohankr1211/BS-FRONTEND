import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, Modal, Form, Table } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSyncAlt } from 'react-icons/fa';
import vendorService from '../../services/vendorService';
import { toast } from 'react-toastify';

const VENDOR_STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  ACTIVE: { bg: 'success', label: 'Active' },
  INACTIVE: { bg: 'secondary', label: 'Inactive' },
  PENDING: { bg: 'warning', label: 'Pending' }
};

const CreateVendorModal: React.FC<{ show: boolean; onHide: () => void; onCreated: () => void }> = ({ show, onHide, onCreated }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', status: 'ACTIVE' as const });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await vendorService.createVendor(form);
      toast.success('Vendor created successfully');
      onCreated(); onHide();
      setForm({ name: '', email: '', phone: '', address: '', status: 'ACTIVE' });
    } catch (e) {
      console.error('Failed to create vendor:', e);
      toast.error('Failed to create vendor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Create New Vendor</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={12}><Form.Group><Form.Label className="small fw-bold text-muted">VENDOR NAME *</Form.Label><Form.Control type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="rounded-3" placeholder="Enter vendor name" /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label className="small fw-bold text-muted">EMAIL *</Form.Label><Form.Control type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required className="rounded-3" placeholder="vendor@example.com" /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label className="small fw-bold text-muted">PHONE *</Form.Label><Form.Control type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required className="rounded-3" placeholder="+1 234 567 8900" /></Form.Group></Col>
            <Col md={12}><Form.Group><Form.Label className="small fw-bold text-muted">ADDRESS *</Form.Label><Form.Control as="textarea" rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required className="rounded-3" placeholder="123 Business St, City, State" /></Form.Group></Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">STATUS *</Form.Label>
                <Form.Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} className="rounded-3">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="PENDING">Pending</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="light" className="rounded-3" onClick={onHide}>Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-3 px-4" disabled={submitting}>{submitting ? 'Creating...' : 'Create Vendor'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const VendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await vendorService.getVendors();
      setVendors(data || []);
    } catch (e) {
      console.error('Failed to load vendors:', e);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openEditModal = (vendor: any) => {
    setSelectedVendor(vendor);
    setEditForm(vendor);
    setShowEdit(true);
  };

  const openDeleteModal = (vendor: any) => {
    setSelectedVendor(vendor);
    setShowDelete(true);
  };

  const openDetailModal = (vendor: any) => {
    setSelectedVendor(vendor);
    setShowDetail(true);
  };

  const handleEdit = async () => {
    if (!selectedVendor) return;
    setSubmitting(true);
    try {
      await vendorService.updateVendor(selectedVendor.id, editForm);
      toast.success('Vendor updated successfully');
      setShowEdit(false);
      setSelectedVendor(null);
      await load();
    } catch (e) {
      console.error('Failed to update vendor:', e);
      toast.error('Failed to update vendor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVendor) return;
    try {
      await vendorService.deleteVendor(selectedVendor.id);
      toast.success('Vendor deleted successfully');
      setShowDelete(false);
      setSelectedVendor(null);
      await load();
    } catch (e) {
      console.error('Failed to delete vendor:', e);
      toast.error('Failed to delete vendor');
    }
  };

  const handleRefresh = async () => {
    setSyncing(true);
    try {
      await load();
      toast.success('Vendors refreshed');
    } catch (e) {
      console.error('Failed to refresh vendors:', e);
      toast.error('Failed to refresh vendors');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Vendor Management</h3>
          <p className="text-muted mb-0">Manage vendors and their contracts.</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" className="rounded-3 d-flex align-items-center gap-2" onClick={handleRefresh} disabled={syncing}>
            <FaSyncAlt className={syncing ? 'fa-spin' : ''} /> {syncing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="primary" className="rounded-3 d-flex align-items-center gap-2" onClick={() => setShowCreate(true)}>
            <FaPlus /> Add Vendor
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading vendors...</div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4">
          <p className="text-muted mb-0">No vendors found. Use the button above to add one.</p>
        </div>
      ) : (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Vendor ID</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Name</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Email</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Phone</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Status</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map(vendor => {
                  const status = VENDOR_STATUS_CONFIG[vendor.status] || { bg: 'secondary', label: vendor.status };
                  return (
                    <tr key={vendor.id}>
                      <td className="font-monospace small">{vendor.id}</td>
                      <td className="fw-semibold">{vendor.name}</td>
                      <td>{vendor.email}</td>
                      <td>{vendor.phone}</td>
                      <td><Badge bg={status.bg} className="small">{status.label}</Badge></td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button variant="outline-primary" size="sm" className="rounded-3" onClick={() => openDetailModal(vendor)}>
                            <FaEye />
                          </Button>
                          <Button variant="outline-warning" size="sm" className="rounded-3" onClick={() => openEditModal(vendor)}>
                            <FaEdit />
                          </Button>
                          <Button variant="outline-danger" size="sm" className="rounded-3" onClick={() => openDeleteModal(vendor)}>
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <CreateVendorModal show={showCreate} onHide={() => setShowCreate(false)} onCreated={load} />

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Edit Vendor</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => { e.preventDefault(); handleEdit(); }}>
            <Row className="g-3">
              <Col md={12}><Form.Group><Form.Label className="small fw-bold text-muted">VENDOR NAME *</Form.Label><Form.Control type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required className="rounded-3" /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="small fw-bold text-muted">EMAIL *</Form.Label><Form.Control type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} required className="rounded-3" /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="small fw-bold text-muted">PHONE *</Form.Label><Form.Control type="tel" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} required className="rounded-3" /></Form.Group></Col>
              <Col md={12}><Form.Group><Form.Label className="small fw-bold text-muted">ADDRESS *</Form.Label><Form.Control as="textarea" rows={2} value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} required className="rounded-3" /></Form.Group></Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">STATUS *</Form.Label>
                  <Form.Select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="rounded-3">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="PENDING">Pending</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="light" className="rounded-3" onClick={() => setShowEdit(false)}>Cancel</Button>
              <Button variant="primary" type="submit" className="rounded-3 px-4" disabled={submitting}>{submitting ? 'Updating...' : 'Update Vendor'}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-danger"><FaTrash className="me-2" />Delete Vendor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this vendor? This action cannot be undone.</p>
          {selectedVendor && (
            <div className="bg-light p-3 rounded-3">
              <div className="mb-1"><strong>Name:</strong> {selectedVendor.name}</div>
              <div className="mb-1"><strong>Email:</strong> {selectedVendor.email}</div>
              <div className="mb-1"><strong>Phone:</strong> {selectedVendor.phone}</div>
              <div><strong>Status:</strong> <Badge bg={VENDOR_STATUS_CONFIG[selectedVendor.status]?.bg}>{VENDOR_STATUS_CONFIG[selectedVendor.status]?.label}</Badge></div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" className="rounded-3" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="danger" className="rounded-3" onClick={handleDelete}>Delete Vendor</Button>
        </Modal.Footer>
      </Modal>

      {/* Detail Modal */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered size="lg">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Vendor Details</Modal.Title>
        </Modal.Header>
        {selectedVendor && (
          <Modal.Body className="p-4">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="small text-muted">Vendor ID</div>
                <div className="fw-semibold font-monospace">{selectedVendor.id}</div>
              </div>
              <div className="col-md-6">
                <div className="small text-muted">Status</div>
                <Badge bg={VENDOR_STATUS_CONFIG[selectedVendor.status]?.bg} className="fs-6">{VENDOR_STATUS_CONFIG[selectedVendor.status]?.label}</Badge>
              </div>
              <div className="col-md-6">
                <div className="small text-muted">Name</div>
                <div className="fw-semibold">{selectedVendor.name}</div>
              </div>
              <div className="col-md-6">
                <div className="small text-muted">Email</div>
                <div className="fw-semibold">{selectedVendor.email}</div>
              </div>
              <div className="col-md-6">
                <div className="small text-muted">Phone</div>
                <div className="fw-semibold">{selectedVendor.phone}</div>
              </div>
              <div className="col-12">
                <div className="small text-muted">Address</div>
                <div className="fw-semibold">{selectedVendor.address}</div>
              </div>
            </div>
          </Modal.Body>
        )}
        <Modal.Footer className="border-0">
          <Button variant="light" className="rounded-3" onClick={() => setShowDetail(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
