import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Table, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaFileInvoiceDollar, FaCheckCircle, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import vendorService from '../../services/vendorService';
import type { InvoiceResponse, InvoiceLineItem } from '../../services/vendorService';

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  DRAFT:     { bg: 'secondary', label: 'Draft' },
  PENDING:   { bg: 'warning',   label: 'Pending' },
  SUBMITTED: { bg: 'warning',   label: 'Submitted' },
  APPROVED:  { bg: 'success',   label: 'Approved' },
  REJECTED:  { bg: 'danger',    label: 'Rejected' },
  PAID:      { bg: 'primary',   label: 'Paid' }
};

const CreateInvoiceModal: React.FC<{ show: boolean; onHide: () => void; onCreated: () => void }> = ({ show, onHide, onCreated }) => {
  const [form, setForm] = useState({ 
    contractId: '', 
    amount: 0, 
    date: '', 
    description: '', 
    taskId: '' 
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      console.log("Creating Invoice with Swagger-verified payload:", form);
      await vendorService.createInvoice(form);
      onCreated(); 
      onHide();
      setForm({ contractId: '', amount: 0, date: '', description: '', taskId: '' });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create invoice";
      setError(msg);
      console.error("Failed to create invoice", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">Create Invoice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <div className="alert alert-danger rounded-3 small d-flex align-items-center gap-2 mb-3">
            <FaExclamationTriangle /> {error}
          </div>
        )}
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">CONTRACT ID *</Form.Label>
                <Form.Control 
                  value={form.contractId} 
                  onChange={e => setForm(f => ({ ...f, contractId: e.target.value }))} 
                  required 
                  className="rounded-3" 
                  placeholder="e.g. CONBS001" 
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">TASK ID *</Form.Label>
                <Form.Control 
                  value={form.taskId} 
                  onChange={e => setForm(f => ({ ...f, taskId: e.target.value }))} 
                  required 
                  className="rounded-3" 
                  placeholder="e.g. VN003" 
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">AMOUNT (USD) *</Form.Label>
                <Form.Control 
                  type="number" 
                  value={form.amount} 
                  onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} 
                  required 
                  className="rounded-3" 
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">DATE *</Form.Label>
                <Form.Control 
                  type="date" 
                  value={form.date} 
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))} 
                  required 
                  className="rounded-3" 
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">DESCRIPTION *</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={2} 
                  value={form.description} 
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                  required 
                  className="rounded-3" 
                  placeholder="Billing details..." 
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="light" className="rounded-3" onClick={onHide}>Cancel</Button>
            <Button variant="success" type="submit" className="rounded-3" disabled={submitting}>{submitting ? 'Creating...' : 'Create Invoice'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState('');

  const load = async () => {
    setLoading(true);
    const [invRes, conRes] = await Promise.all([
      vendorService.getInvoices(), 
      vendorService.getContracts()
    ]);
    setInvoices(invRes?.content || []); 
    setContracts(conRes?.content || []); 
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (id: string) => {
    setSubmitting(id);
    await vendorService.submitInvoice(id);
    await load();
    setSubmitting('');
  };

  const totalApproved = invoices.filter(i => i.status === 'APPROVED').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Invoices</h3>
          <p className="text-muted mb-0">{invoices.length} invoices · <span className="text-success fw-bold">${totalApproved.toLocaleString()}</span> approved</p>
        </div>
        <Button variant="success" className="rounded-3 d-flex align-items-center gap-2" onClick={() => setShowCreate(true)}>
          <FaPlus /> Create Invoice
        </Button>
      </div>

      {loading ? <div className="text-center py-5 text-muted">Loading invoices...</div> : (
        <Card className="border-0 shadow-sm rounded-4">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="py-3 px-4 border-0">Invoice</th>
                <th className="py-3 px-4 border-0">Contract</th>
                <th className="py-3 px-4 border-0">Amount</th>
                <th className="py-3 px-4 border-0">Due Date</th>
                <th className="py-3 px-4 border-0">Status</th>
                <th className="py-3 px-4 border-0">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => {
                const sta = STATUS_CONFIG[inv.status] || { bg: 'secondary', label: inv.status };
                return (
                  <tr key={inv.invoiceId}>
                    <td className="py-3 px-4">
                      <div className="d-flex align-items-center gap-2">
                        <FaFileInvoiceDollar className="text-success" />
                        <div>
                          <div className="fw-bold small">{inv.invoiceNumber}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>{inv.invoiceId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 small">{inv.contractTitle}</td>
                    <td className="py-3 px-4 fw-bold text-success">${inv.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 small text-muted">{(inv as any).date || inv.dueDate}</td>
                    <td className="py-3 px-4">
                      <Badge bg={sta.bg} className={inv.status === 'SUBMITTED' ? 'text-dark' : ''}>{sta.label}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      {inv.status === 'DRAFT' && (
                        <Button variant="outline-success" size="sm" className="rounded-3 d-flex align-items-center gap-1"
                          disabled={submitting === inv.invoiceId}
                          onClick={() => handleSubmit(inv.invoiceId)}>
                          <FaCheckCircle size={12} /> {submitting === inv.invoiceId ? '...' : 'Submit'}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}
      <CreateInvoiceModal show={showCreate} onHide={() => setShowCreate(false)} onCreated={load} />
    </div>
  );
};
