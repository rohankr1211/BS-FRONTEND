import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, Table, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaCreditCard, FaCheckCircle, FaTrash, FaUniversity } from 'react-icons/fa';
import { financeService } from '../../services/financeService';
import type { PaymentResponse, ExpenseResponse } from '../../services/financeService';

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  PENDING: { bg: 'warning', label: 'Pending' },
  PROCESSED: { bg: 'success', label: 'Processed' },
  FAILED: { bg: 'danger', label: 'Failed' },
  CANCELLED: { bg: 'secondary', label: 'Cancelled' },
};

const CreatePaymentModal: React.FC<{ expenses: ExpenseResponse[]; show: boolean; onHide: () => void; onCreated: () => void }> = ({ expenses, show, onHide, onCreated }) => {
  const [form, setForm] = useState({ expenseId: '', paymentMethod: 'BANK_TRANSFER' as any, amount: 0, dueDate: '', vendorName: '', referenceNumber: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const e = expenses.find(x => x.expenseId === form.expenseId);
    if (e) setForm(f => ({ ...f, amount: e.amount }));
  }, [form.expenseId, expenses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await financeService.createPayment({ ...form, vendorId: 'VND-' + Date.now().toString().slice(-3) });
    onCreated(); onHide();
    setForm({ expenseId: '', paymentMethod: 'BANK_TRANSFER', amount: 0, dueDate: '', vendorName: '', referenceNumber: '' });
    setSubmitting(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Create Payment Request</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">EXPENSE REFERENCE *</Form.Label>
            <Form.Select value={form.expenseId} onChange={e => setForm(f => ({ ...f, expenseId: e.target.value }))} required className="rounded-3">
              <option value="">Select Approved Expense...</option>
              {expenses.filter(e => e.status === 'APPROVED').map(e => <option key={e.expenseId} value={e.expenseId}>{e.expenseId} - {e.expenseType} (${e.amount})</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3"><Form.Label className="small fw-bold text-muted">VENDOR NAME *</Form.Label><Form.Control value={form.vendorName} onChange={e => setForm(f => ({ ...f, vendorName: e.target.value }))} required className="rounded-3" /></Form.Group>
          <Row className="g-2 mb-3">
            <Col md={6}><Form.Group><Form.Label className="small fw-bold text-muted">METHOD</Form.Label><Form.Select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value as any }))} className="rounded-3"><option value="BANK_TRANSFER">Bank Transfer</option><option value="CHECK">Check</option><option value="ONLINE">Online</option><option value="CASH">Cash</option></Form.Select></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label className="small fw-bold text-muted">DUE DATE *</Form.Label><Form.Control type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required className="rounded-3" /></Form.Group></Col>
          </Row>
          <Form.Group className="mb-4"><Form.Label className="small fw-bold text-muted">REFERENCE NUMBER</Form.Label><Form.Control value={form.referenceNumber} onChange={e => setForm(f => ({ ...f, referenceNumber: e.target.value }))} className="rounded-3" placeholder="e.g. INV-102" /></Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="light" className="rounded-3" onClick={onHide}>Cancel</Button>
            <Button variant="success" type="submit" className="rounded-3" disabled={submitting}>Create Payment Request</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [processing, setProcessing] = useState('');

  const load = async () => {
    setLoading(true);
    const [p, e] = await Promise.all([financeService.getPayments(), financeService.getExpenses()]);
    setPayments(p); setExpenses(e); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleProcess = async (id: string) => {
    const txn = prompt('Enter Transaction ID for Bank Transfer:');
    if (!txn) return;
    setProcessing(id);
    await financeService.processPayment(id, txn);
    await load();
    setProcessing('');
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h3 className="fw-bold mb-1">Payments</h3><p className="text-muted mb-0">{payments.filter(p => p.status === 'PENDING').length} pending payments requiring processing.</p></div>
        <Button variant="success" className="rounded-3 d-flex align-items-center gap-2" onClick={() => setShowCreate(true)}><FaPlus /> Create Payment</Button>
      </div>

      {loading ? <div className="text-center py-5 text-muted">Loading payments...</div> : (
        <Card className="border-0 shadow-sm rounded-4">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="py-3 px-4 border-0">Payment ID</th>
                <th className="py-3 px-4 border-0">Vendor / Method</th>
                <th className="py-3 px-4 border-0">Amount</th>
                <th className="py-3 px-4 border-0">Due Date</th>
                <th className="py-3 px-4 border-0">Status</th>
                <th className="py-3 px-4 border-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => {
                const sta = STATUS_CONFIG[p.status];
                const isOverdue = new Date(p.dueDate) < new Date() && p.status === 'PENDING';
                return (
                  <tr key={p.paymentId}>
                    <td className="py-3 px-4"><div className="fw-bold text-success">{p.paymentId}</div><div className="small text-muted">{p.expenseId}</div></td>
                    <td className="py-3 px-4"><div><span className="fw-bold small">{p.vendorName}</span></div><div className="small text-muted"><FaUniversity size={10} className="me-1" />{p.paymentMethod.replace('_', ' ')}</div></td>
                    <td className="py-3 px-4 fw-bold text-success">${p.amount.toLocaleString()}</td>
                    <td className="py-3 px-4"><span className={isOverdue ? 'text-danger fw-bold' : 'small text-muted'}>{p.dueDate} {isOverdue && '⚠️'}</span></td>
                    <td className="py-3 px-4"><Badge bg={sta.bg} className={p.status === 'PENDING' ? 'text-dark' : ''}>{sta.label}</Badge></td>
                    <td className="py-3 px-4 text-end">
                      {p.status === 'PENDING' && (
                        <Button variant="outline-success" size="sm" className="rounded-3 px-3" disabled={processing === p.paymentId} onClick={() => handleProcess(p.paymentId)}>
                          {processing === p.paymentId ? '...' : 'Process'}
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
      <CreatePaymentModal expenses={expenses} show={showCreate} onHide={() => setShowCreate(false)} onCreated={load} />
    </div>
  );
};
