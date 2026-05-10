import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, Modal, Form, Table } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSyncAlt, FaDollarSign } from 'react-icons/fa';
import vendorService from '../../services/vendorService';
import type { InvoiceResponse } from '../../services/vendorService';
import { toast } from 'react-toastify';

const INVOICE_STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  DRAFT: { bg: 'secondary', label: 'Draft' },
  SUBMITTED: { bg: 'warning', label: 'Submitted' },
  APPROVED: { bg: 'success', label: 'Approved' },
  REJECTED: { bg: 'danger', label: 'Rejected' },
  PAID: { bg: 'info', label: 'Paid' }
};

const CreateInvoiceModal: React.FC<{ show: boolean; onHide: () => void; onCreated: () => void }> = ({ show, onHide, onCreated }) => {
  const [form, setForm] = useState({ 
    contractId: '', 
    invoiceNumber: '', 
    amount: 0, 
    dueDate: new Date().toISOString().split('T')[0], 
    description: '',
    lineItems: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }]
  });
  const [submitting, setSubmitting] = useState(false);

  const addLineItem = () => {
    setForm(f => ({
      ...f,
      lineItems: [...f.lineItems, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    const newItems = [...form.lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate total
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setForm(f => ({ ...f, lineItems: newItems }));
  };

  const removeLineItem = (index: number) => {
    setForm(f => ({
      ...f,
      lineItems: f.lineItems.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return form.lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        amount: calculateTotal()
      };
      await vendorService.createInvoice(payload);
      toast.success('Invoice created successfully');
      onCreated(); onHide();
      setForm({ 
        contractId: '', 
        invoiceNumber: '', 
        amount: 0, 
        dueDate: new Date().toISOString().split('T')[0], 
        description: '',
        lineItems: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }]
      });
    } catch (e) {
      console.error('Failed to create invoice:', e);
      toast.error('Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Create New Invoice</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3 mb-3">
            <Col md={6}><Form.Group><Form.Label className="small fw-bold text-muted">CONTRACT ID *</Form.Label><Form.Control type="text" value={form.contractId} onChange={e => setForm(f => ({ ...f, contractId: e.target.value }))} required className="rounded-3" placeholder="CON-XXXXX" /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label className="small fw-bold text-muted">INVOICE NUMBER *</Form.Label><Form.Control type="text" value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} required className="rounded-3" placeholder="INV-XXXXX" /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label className="small fw-bold text-muted">AMOUNT</Form.Label><Form.Control type="number" value={calculateTotal()} readOnly className="rounded-3" placeholder="0.00" /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label className="small fw-bold text-muted">DUE DATE *</Form.Label><Form.Control type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required className="rounded-3" /></Form.Group></Col>
            <Col md={12}><Form.Group><Form.Label className="small fw-bold text-muted">DESCRIPTION</Form.Label><Form.Control as="textarea" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-3" placeholder="Invoice description..." /></Form.Group></Col>
          </Row>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold mb-0">Line Items</h6>
              <Button variant="outline-primary" size="sm" className="rounded-3" onClick={addLineItem}>
                <FaPlus className="me-1" /> Add Item
              </Button>
            </div>
            
            {form.lineItems.map((item, index) => (
              <Card key={index} className="mb-2 border-0 shadow-sm">
                <Card.Body className="p-3">
                  <Row className="g-2 align-items-center">
                    <Col md={5}>
                      <Form.Group>
                        <Form.Label className="small fw-bold text-muted">Description</Form.Label>
                        <Form.Control
                          type="text"
                          value={item.description}
                          onChange={e => updateLineItem(index, 'description', e.target.value)}
                          className="rounded-3"
                          placeholder="Item description"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label className="small fw-bold text-muted">Quantity</Form.Label>
                        <Form.Control
                          type="number"
                          value={item.quantity}
                          onChange={e => updateLineItem(index, 'quantity', Number(e.target.value))}
                          className="rounded-3"
                          min="1"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label className="small fw-bold text-muted">Unit Price</Form.Label>
                        <Form.Control
                          type="number"
                          value={item.unitPrice}
                          onChange={e => updateLineItem(index, 'unitPrice', Number(e.target.value))}
                          className="rounded-3"
                          min="0"
                          step="0.01"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label className="small fw-bold text-muted">Total</Form.Label>
                        <Form.Control
                          type="number"
                          value={item.total}
                          readOnly
                          className="rounded-3"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={1}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="rounded-3 mt-4"
                        onClick={() => removeLineItem(index)}
                        disabled={form.lineItems.length === 1}
                      >
                        <FaTrash />
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>

          <div className="d-flex justify-content-end">
            <div className="text-end">
              <div className="small text-muted">TOTAL AMOUNT</div>
              <div className="fs-4 fw-bold text-primary">${calculateTotal().toFixed(2)}</div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="light" className="rounded-3" onClick={onHide}>Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-3 px-4" disabled={submitting}>{submitting ? 'Creating...' : 'Create Invoice'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponse | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      let data: InvoiceResponse[] = [];
      if (filterStatus) {
        data = await vendorService.getInvoicesByStatus(filterStatus);
      } else {
        const response = await vendorService.getInvoices();
        data = response.content || response;
      }
      setInvoices(data || []);
    } catch (e) {
      console.error('Failed to load invoices:', e);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterStatus]);

  const openEditModal = (invoice: InvoiceResponse) => {
    setSelectedInvoice(invoice);
    setEditForm(invoice);
    setShowEdit(true);
  };

  const openDeleteModal = (invoice: InvoiceResponse) => {
    setSelectedInvoice(invoice);
    setShowDelete(true);
  };

  const openDetailModal = (invoice: InvoiceResponse) => {
    setSelectedInvoice(invoice);
    setShowDetail(true);
  };

  
  const handleEdit = async () => {
    if (!selectedInvoice) return;
    setSubmitting(true);
    try {
      await vendorService.updateInvoice(selectedInvoice.id, editForm);
      toast.success('Invoice updated successfully');
      setShowEdit(false);
      setSelectedInvoice(null);
      await load();
    } catch (e) {
      console.error('Failed to update invoice:', e);
      toast.error('Failed to update invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedInvoice) return;
    try {
      await vendorService.deleteInvoice(selectedInvoice.id);
      toast.success('Invoice deleted successfully');
      setShowDelete(false);
      setSelectedInvoice(null);
      await load();
    } catch (e) {
      console.error('Failed to delete invoice:', e);
      toast.error('Failed to delete invoice');
    }
  };

  const handleSubmit = async () => {
    if (!selectedInvoice) return;
    setSubmitting(true);
    try {
      await vendorService.submitInvoice(selectedInvoice.id);
      toast.success('Invoice submitted for approval');
      setShowDetail(false);
      await load();
    } catch (e) {
      console.error('Failed to submit invoice:', e);
      toast.error('Failed to submit invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    setSyncing(true);
    try {
      await load();
      toast.success('Invoices refreshed');
    } catch (e) {
      console.error('Failed to refresh invoices:', e);
      toast.error('Failed to refresh invoices');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Invoice Management</h3>
          <p className="text-muted mb-0">Create, submit, and track invoices.</p>
        </div>
        <div className="d-flex gap-2">
          <Form.Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-3" style={{ maxWidth: '200px' }}>
            <option value="">All Statuses</option>
            {Object.entries(INVOICE_STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>{config.label}</option>
            ))}
          </Form.Select>
          <Button variant="outline-secondary" className="rounded-3 d-flex align-items-center gap-2" onClick={handleRefresh} disabled={syncing}>
            <FaSyncAlt className={syncing ? 'fa-spin' : ''} /> {syncing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="primary" className="rounded-3 d-flex align-items-center gap-2" onClick={() => setShowCreate(true)}>
            <FaPlus /> Create Invoice
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4">
          <FaDollarSign size={40} className="text-muted mb-3 opacity-25" />
          <p className="text-muted mb-0">No invoices found. Use the button above to create one.</p>
        </div>
      ) : (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Invoice ID</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Contract</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Amount</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Due Date</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Status</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => {
                  const status = INVOICE_STATUS_CONFIG[invoice.status] || { bg: 'secondary', label: invoice.status };
                  return (
                    <tr key={invoice.id}>
                      <td className="font-monospace small">{invoice.invoiceId}</td>
                      <td>{invoice.contractTitle}</td>
                      <td className="fw-semibold">${invoice.amount.toFixed(2)}</td>
                      <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      <td><Badge bg={status.bg} className="small">{status.label}</Badge></td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button variant="outline-primary" size="sm" className="rounded-3" onClick={() => openDetailModal(invoice)}>
                            <FaEye />
                          </Button>
                          {invoice.status === 'DRAFT' && (
                            <Button variant="outline-warning" size="sm" className="rounded-3" onClick={() => openEditModal(invoice)}>
                              <FaEdit />
                            </Button>
                          )}
                          {invoice.status === 'DRAFT' && (
                            <Button variant="outline-danger" size="sm" className="rounded-3" onClick={() => openDeleteModal(invoice)}>
                              <FaTrash />
                            </Button>
                          )}
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

      <CreateInvoiceModal show={showCreate} onHide={() => setShowCreate(false)} onCreated={load} />

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered size="lg">
        <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Edit Invoice</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => { e.preventDefault(); handleEdit(); }}>
            <Row className="g-3">
              <Col md={6}><Form.Group><Form.Label className="small fw-bold text-muted">INVOICE NUMBER *</Form.Label><Form.Control type="text" value={editForm.invoiceNumber} onChange={e => setEditForm(f => ({ ...f, invoiceNumber: e.target.value }))} required className="rounded-3" /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="small fw-bold text-muted">AMOUNT *</Form.Label><Form.Control type="number" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: Number(e.target.value) }))} required className="rounded-3" /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="small fw-bold text-muted">DUE DATE *</Form.Label><Form.Control type="date" value={editForm.dueDate} onChange={e => setEditForm(f => ({ ...f, dueDate: e.target.value }))} required className="rounded-3" /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="small fw-bold text-muted">STATUS *</Form.Label>
                <Form.Select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="rounded-3">
                  {Object.entries(INVOICE_STATUS_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>{config.label}</option>
                  ))}
                </Form.Select>
              </Form.Group></Col>
              <Col md={12}><Form.Group><Form.Label className="small fw-bold text-muted">DESCRIPTION</Form.Label><Form.Control as="textarea" rows={2} value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} className="rounded-3" /></Form.Group></Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="light" className="rounded-3" onClick={() => setShowEdit(false)}>Cancel</Button>
              <Button variant="primary" type="submit" className="rounded-3 px-4" disabled={submitting}>{submitting ? 'Updating...' : 'Update Invoice'}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-danger"><FaTrash className="me-2" />Delete Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this invoice? This action cannot be undone.</p>
          {selectedInvoice && (
            <div className="bg-light p-3 rounded-3">
              <div className="mb-1"><strong>Invoice:</strong> {selectedInvoice.invoiceId}</div>
              <div className="mb-1"><strong>Contract:</strong> {selectedInvoice.contractTitle}</div>
              <div className="mb-1"><strong>Amount:</strong> ${selectedInvoice.amount.toFixed(2)}</div>
              <div><strong>Status:</strong> <Badge bg={INVOICE_STATUS_CONFIG[selectedInvoice.status]?.bg}>{INVOICE_STATUS_CONFIG[selectedInvoice.status]?.label}</Badge></div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" className="rounded-3" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="danger" className="rounded-3" onClick={handleDelete}>Delete Invoice</Button>
        </Modal.Footer>
      </Modal>

      {/* Detail Modal */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered size="lg">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Invoice Details</Modal.Title>
        </Modal.Header>
        {selectedInvoice && (
          <Modal.Body className="p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Badge bg={INVOICE_STATUS_CONFIG[selectedInvoice.status]?.bg} className="fs-6">{INVOICE_STATUS_CONFIG[selectedInvoice.status]?.label}</Badge>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="small text-muted">Invoice ID</div>
                <div className="fw-semibold font-monospace">{selectedInvoice.invoiceId}</div>
              </div>
              <div className="col-md-6">
                <div className="small text-muted">Contract</div>
                <div className="fw-semibold">{selectedInvoice.contractTitle}</div>
              </div>
              <div className="col-md-6">
                <div className="small text-muted">Amount</div>
                <div className="fw-semibold fs-5 text-primary">${selectedInvoice.amount.toFixed(2)}</div>
              </div>
              <div className="col-md-6">
                <div className="small text-muted">Due Date</div>
                <div className="fw-semibold">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</div>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="small text-muted fw-bold mb-2">Line Items</div>
              <div className="border rounded-3 p-3">
                {selectedInvoice.lineItems.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between py-2 border-bottom">
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{item.description}</div>
                      <div className="small text-muted">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</div>
                    </div>
                    <div className="fw-bold">${item.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedInvoice.description && (
              <div className="mb-3">
                <div className="small text-muted fw-bold mb-1">Description</div>
                <div className="p-3 bg-light rounded-3">{selectedInvoice.description}</div>
              </div>
            )}
            
            {selectedInvoice.submittedAt && (
              <div className="mb-3">
                <div className="small text-muted fw-bold mb-1">Submitted At</div>
                <div className="fw-semibold">{new Date(selectedInvoice.submittedAt).toLocaleDateString()}</div>
              </div>
            )}
          </Modal.Body>
        )}
        <Modal.Footer className="border-0">
          <div className="d-flex gap-2">
            <Button variant="light" className="rounded-3" onClick={() => setShowDetail(false)}>Close</Button>
            {selectedInvoice?.status === 'DRAFT' && (
              <Button variant="primary" className="rounded-3" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            )}
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
