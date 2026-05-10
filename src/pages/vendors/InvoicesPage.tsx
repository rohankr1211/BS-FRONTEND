import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Table, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaFileInvoiceDollar, FaCheckCircle, FaTrash } from 'react-icons/fa';
import vendorService from '../../services/vendorService';
import type { InvoiceResponse, InvoiceLineItem } from '../../services/vendorService';

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  DRAFT:     { bg: 'secondary', label: 'Draft' },
  SUBMITTED: { bg: 'warning',   label: 'Submitted' },
  APPROVED:  { bg: 'success',   label: 'Approved' },
  REJECTED:  { bg: 'danger',    label: 'Rejected' },
  PAID:      { bg: 'primary',   label: 'Paid' }
};

const CreateInvoiceModal: React.FC<{ contracts: any[]; show: boolean; onHide: () => void; onCreated: () => void }> = ({ contracts, show, onHide, onCreated }) => {
  const [form, setForm] = useState({ contractId: '', invoiceNumber: `INV-${Date.now()}`, amount: 0, dueDate: '', description: '' });
  const [lines, setLines] = useState<InvoiceLineItem[]>([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  const [submitting, setSubmitting] = useState(false);

  const updateLine = (i: number, field: string, val: string | number) => {
    setLines(prev => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: val };
      if (field === 'quantity' || field === 'unitPrice') {
        updated[i].total = updated[i].quantity * updated[i].unitPrice;
      }
      const total = updated.reduce((s, l) => s + l.total, 0);
      setForm(f => ({ ...f, amount: total }));
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const contract = contracts.find(c => c.contractId === form.contractId);
    await vendorService.createInvoice({ ...form, lineItems: lines, contractTitle: contract?.contractTitle || '' });
    onCreated(); onHide();
    setSubmitting(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="xl">
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">Create Invoice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3 mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">CONTRACT *</Form.Label>
                <Form.Select value={form.contractId} onChange={e => setForm(f => ({ ...f, contractId: e.target.value }))} required className="rounded-3">
                  <option value="">Select contract...</option>
                  {contracts.filter(c => c.status === 'ACTIVE').map(c => <option key={c.contractId} value={c.contractId}>{c.contractTitle}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">INVOICE NUMBER</Form.Label>
                <Form.Control value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} className="rounded-3" />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">DUE DATE *</Form.Label>
                <Form.Control type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required className="rounded-3" />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">DESCRIPTION</Form.Label>
                <Form.Control value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-3" placeholder="Invoice description..." />
              </Form.Group>
            </Col>
          </Row>

          <h6 className="fw-bold text-muted text-uppercase mb-2">Line Items</h6>
          <div className="bg-light rounded-3 p-3 mb-3">
            {lines.map((line, i) => (
              <Row key={i} className="g-2 mb-2 align-items-center">
                <Col md={5}><Form.Control size="sm" value={line.description} onChange={e => updateLine(i, 'description', e.target.value)} placeholder="Item description" className="rounded-3" /></Col>
                <Col md={2}><Form.Control size="sm" type="number" value={line.quantity} onChange={e => updateLine(i, 'quantity', Number(e.target.value))} placeholder="Qty" className="rounded-3" /></Col>
                <Col md={2}><Form.Control size="sm" type="number" value={line.unitPrice} onChange={e => updateLine(i, 'unitPrice', Number(e.target.value))} placeholder="Unit price" className="rounded-3" /></Col>
                <Col md={2}><div className="fw-bold text-end small">${line.total.toLocaleString()}</div></Col>
                <Col md={1}><Button variant="outline-danger" size="sm" className="rounded-3" onClick={() => setLines(prev => prev.filter((_, j) => j !== i))}><FaTrash /></Button></Col>
              </Row>
            ))}
            <Button variant="outline-secondary" size="sm" className="rounded-3 mt-1" onClick={() => setLines(prev => [...prev, { description: '', quantity: 1, unitPrice: 0, total: 0 }])}>
              <FaPlus className="me-1" /> Add Line
            </Button>
            <div className="text-end fw-bold mt-2 border-top pt-2">Total: <span className="text-success fs-5">${form.amount.toLocaleString()}</span></div>
          </div>

          <div className="d-flex justify-content-end gap-2">
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
    const [inv, con] = await Promise.all([vendorService.getInvoices(), vendorService.getContracts()]);
    setInvoices(inv); setContracts(con); setLoading(false);
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
                const sta = STATUS_CONFIG[inv.status];
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
                    <td className="py-3 px-4 small text-muted">{inv.dueDate}</td>
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
      <CreateInvoiceModal contracts={contracts} show={showCreate} onHide={() => setShowCreate(false)} onCreated={load} />
    </div>
  );
};
