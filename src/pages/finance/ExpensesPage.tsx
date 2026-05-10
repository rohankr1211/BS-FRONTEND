import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, Table, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaReceipt, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { financeService } from '../../services/financeService';
import type { ExpenseResponse, BudgetResponse } from '../../services/financeService';

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  DRAFT: { bg: 'secondary', label: 'Draft' },
  SUBMITTED: { bg: 'warning', label: 'Submitted' },
  APPROVED: { bg: 'success', label: 'Approved' },
  REJECTED: { bg: 'danger', label: 'Rejected' },
};

const CreateExpenseModal: React.FC<{ budgets: BudgetResponse[]; show: boolean; onHide: () => void; onCreated: () => void }> = ({ budgets, show, onHide, onCreated }) => {
  const [form, setForm] = useState({ projectId: '', budgetId: '', expenseType: '', description: '', amount: 0, expenseDate: new Date().toISOString().slice(0, 16) });
  const [submitting, setSubmitting] = useState(false);
  const [budgetCheck, setBudgetCheck] = useState<{ approved: boolean; message: string } | null>(null);

  const handleCheck = async () => {
    if (!form.projectId || form.amount <= 0) return;
    const res = await financeService.checkBudget(form.projectId, form.amount);
    setBudgetCheck(res);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await financeService.createExpense(form);
    onCreated(); onHide();
    setForm({ projectId: '', budgetId: '', expenseType: '', description: '', amount: 0, expenseDate: new Date().toISOString().slice(0, 16) });
    setBudgetCheck(null);
    setSubmitting(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Record New Expense</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">PROJECT *</Form.Label>
                <Form.Select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} required className="rounded-3">
                  <option value="">Select Project...</option>
                  {Array.from(new Set(budgets.map(b => b.projectId))).map(id => {
                    const p = budgets.find(b => b.projectId === id);
                    return <option key={id} value={id}>{p?.projectName}</option>;
                  })}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">BUDGET ALLOCATION *</Form.Label>
                <Form.Select value={form.budgetId} onChange={e => setForm(f => ({ ...f, budgetId: e.target.value }))} required className="rounded-3" disabled={!form.projectId}>
                  <option value="">Select Budget...</option>
                  {budgets.filter(b => b.projectId === form.projectId && b.status === 'APPROVED').map(b => (
                    <option key={b.budgetId} value={b.budgetId}>{b.budgetCategory} (${(b.plannedAmount - b.actualAmount).toLocaleString()} remaining)</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group><Form.Label className="small fw-bold text-muted">EXPENSE TYPE *</Form.Label><Form.Control value={form.expenseType} onChange={e => setForm(f => ({ ...f, expenseType: e.target.value }))} required className="rounded-3" placeholder="e.g. Material Purchase" /></Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group><Form.Label className="small fw-bold text-muted">AMOUNT ($) *</Form.Label><Form.Control type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} onBlur={handleCheck} required min={1} className="rounded-3" /></Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group><Form.Label className="small fw-bold text-muted">DESCRIPTION</Form.Label><Form.Control as="textarea" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-3" /></Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group><Form.Label className="small fw-bold text-muted">EXPENSE DATE & TIME</Form.Label><Form.Control type="datetime-local" value={form.expenseDate} onChange={e => setForm(f => ({ ...f, expenseDate: e.target.value }))} className="rounded-3" /></Form.Group>
            </Col>
          </Row>

          {budgetCheck && (
            <div className={`mt-3 p-2 rounded-3 small border ${budgetCheck.approved ? 'bg-success bg-opacity-10 border-success text-success' : 'bg-danger bg-opacity-10 border-danger text-danger'}`}>
              <div className="d-flex align-items-center gap-2">
                {budgetCheck.approved ? <FaCheckCircle /> : <FaTrash />}
                <strong>{budgetCheck.approved ? 'Budget Check Passed' : 'Budget Check Failed'}</strong>
              </div>
              <div>{budgetCheck.message}</div>
            </div>
          )}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="light" className="rounded-3" onClick={onHide}>Cancel</Button>
            <Button variant="danger" type="submit" className="rounded-3" disabled={submitting || (budgetCheck && !budgetCheck.approved)}>{submitting ? 'Recording...' : 'Record Expense'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [budgets, setBudgets] = useState<BudgetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState('');

  const load = async () => {
    setLoading(true);
    const [e, b] = await Promise.all([financeService.getExpenses(), financeService.getBudgets()]);
    setExpenses(e); setBudgets(b); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSubmitAction = async (id: string) => {
    setSubmitting(id);
    await financeService.submitExpense(id);
    await load();
    setSubmitting('');
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h3 className="fw-bold mb-1">Expense Tracking</h3><p className="text-muted mb-0">{expenses.length} recorded expenditures.</p></div>
        <Button variant="danger" className="rounded-3 d-flex align-items-center gap-2" onClick={() => setShowCreate(true)}><FaPlus /> Record Expense</Button>
      </div>

      {loading ? <div className="text-center py-5 text-muted">Loading expenses...</div> : (
        <Card className="border-0 shadow-sm rounded-4">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="py-3 px-4 border-0">Expense ID</th>
                <th className="py-3 px-4 border-0">Type / Description</th>
                <th className="py-3 px-4 border-0">Amount</th>
                <th className="py-3 px-4 border-0">Date</th>
                <th className="py-3 px-4 border-0">Status</th>
                <th className="py-3 px-4 border-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => {
                const sta = STATUS_CONFIG[e.status];
                return (
                  <tr key={e.expenseId}>
                    <td className="py-3 px-4"><div className="fw-bold text-danger">{e.expenseId}</div><div className="small text-muted">{e.budgetId}</div></td>
                    <td className="py-3 px-4"><div className="fw-bold small">{e.expenseType}</div><div className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>{e.description}</div></td>
                    <td className="py-3 px-4 fw-bold text-danger">${e.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 small text-muted">{new Date(e.expenseDate).toLocaleString()}</td>
                    <td className="py-3 px-4"><Badge bg={sta.bg} className={e.status === 'SUBMITTED' ? 'text-dark' : ''}>{sta.label}</Badge></td>
                    <td className="py-3 px-4 text-end">
                      {e.status === 'DRAFT' && (
                        <Button variant="outline-danger" size="sm" className="rounded-3 px-3" disabled={submitting === e.expenseId} onClick={() => handleSubmitAction(e.expenseId)}>
                          {submitting === e.expenseId ? '...' : 'Submit'}
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
      <CreateExpenseModal budgets={budgets} show={showCreate} onHide={() => setShowCreate(false)} onCreated={load} />
    </div>
  );
};
