import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, Table, Modal, Form, ProgressBar } from 'react-bootstrap';
import { FaPlus, FaWallet, FaCheckCircle, FaTrash, FaEdit } from 'react-icons/fa';
import { financeService } from '../../services/financeService';
import type { BudgetResponse } from '../../services/financeService';

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  DRAFT: { bg: 'secondary', label: 'Draft' },
  SUBMITTED: { bg: 'warning', label: 'Submitted' },
  APPROVED: { bg: 'success', label: 'Approved' },
  REJECTED: { bg: 'danger', label: 'Rejected' },
};

const CATEGORIES = ['LABOR', 'MATERIALS', 'EQUIPMENT', 'OVERHEAD', 'CONTINGENCY'];
const PROJECTS = [{ id: 'PRJ-001', name: 'Metro Tower A' }, { id: 'PRJ-002', name: 'Riverfront Marina' }];

const CreateBudgetModal: React.FC<{ show: boolean; onHide: () => void; onCreated: () => void }> = ({ show, onHide, onCreated }) => {
  const [form, setForm] = useState({ projectId: '', budgetCategory: 'MATERIALS' as any, plannedAmount: 0 });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await financeService.createBudget(form);
    onCreated(); onHide();
    setForm({ projectId: '', budgetCategory: 'MATERIALS', plannedAmount: 0 });
    setSubmitting(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Create New Budget</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">PROJECT *</Form.Label>
            <Form.Select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} required className="rounded-3">
              <option value="">Select Project...</option>
              {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">CATEGORY *</Form.Label>
            <Form.Select value={form.budgetCategory} onChange={e => setForm(f => ({ ...f, budgetCategory: e.target.value as any }))} required className="rounded-3">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold text-muted">PLANNED AMOUNT ($) *</Form.Label>
            <Form.Control type="number" value={form.plannedAmount} onChange={e => setForm(f => ({ ...f, plannedAmount: Number(e.target.value) }))} required min={1} className="rounded-3" />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="light" className="rounded-3" onClick={onHide}>Cancel</Button>
            <Button variant="dark" type="submit" className="rounded-3" style={{ backgroundColor: '#2c3e50' }} disabled={submitting}>{submitting ? 'Creating...' : 'Create Budget'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const BudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState('');

  const load = async () => { setLoading(true); setBudgets(await financeService.getBudgets()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleSubmitAction = async (id: string) => {
    setSubmitting(id);
    await financeService.submitBudget(id);
    await load();
    setSubmitting('');
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h3 className="fw-bold mb-1">Budget Management</h3><p className="text-muted mb-0">Track and allocate funds across construction projects.</p></div>
        <Button variant="dark" className="rounded-3 d-flex align-items-center gap-2" style={{ backgroundColor: '#2c3e50' }} onClick={() => setShowCreate(true)}><FaPlus /> Create Budget</Button>
      </div>

      {loading ? <div className="text-center py-5 text-muted">Loading budgets...</div> : (
        <Card className="border-0 shadow-sm rounded-4">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="py-3 px-4 border-0">Budget ID</th>
                <th className="py-3 px-4 border-0">Project / Category</th>
                <th className="py-3 px-4 border-0">Allocation</th>
                <th className="py-3 px-4 border-0">Utilization</th>
                <th className="py-3 px-4 border-0">Status</th>
                <th className="py-3 px-4 border-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map(b => {
                const sta = STATUS_CONFIG[b.status];
                const utilization = (b.actualAmount / b.plannedAmount) * 100;
                return (
                  <tr key={b.budgetId}>
                    <td className="py-3 px-4"><div className="fw-bold text-primary">{b.budgetId}</div><div className="small text-muted">{new Date(b.createdAt).toLocaleDateString()}</div></td>
                    <td className="py-3 px-4"><div><span className="fw-bold">{b.projectName}</span></div><Badge bg="light" text="dark" className="border">{b.budgetCategory}</Badge></td>
                    <td className="py-3 px-4">
                      <div className="small text-muted">Planned: <span className="fw-bold text-dark">${b.plannedAmount.toLocaleString()}</span></div>
                      <div className="small text-muted">Actual: <span className="fw-bold text-danger">${b.actualAmount.toLocaleString()}</span></div>
                    </td>
                    <td className="py-3 px-4" style={{ minWidth: '150px' }}>
                      <div className="d-flex justify-content-between small mb-1"><span>{utilization.toFixed(1)}%</span></div>
                      <ProgressBar now={utilization} variant={utilization > 90 ? 'danger' : utilization > 70 ? 'warning' : 'success'} style={{ height: '6px' }} className="rounded-pill" />
                    </td>
                    <td className="py-3 px-4"><Badge bg={sta.bg} className={b.status === 'SUBMITTED' ? 'text-dark' : ''}>{sta.label}</Badge></td>
                    <td className="py-3 px-4 text-end">
                      <div className="d-flex justify-content-end gap-1">
                        {b.status === 'DRAFT' && (
                          <>
                            <Button variant="outline-success" size="sm" className="rounded-3" disabled={submitting === b.budgetId} onClick={() => handleSubmitAction(b.budgetId)}>
                              {submitting === b.budgetId ? '...' : 'Submit'}
                            </Button>
                            <Button variant="light" size="sm" className="rounded-3"><FaEdit /></Button>
                          </>
                        )}
                        <Button variant="light" size="sm" className="rounded-3"><FaTrash className="text-danger" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}
      <CreateBudgetModal show={showCreate} onHide={() => setShowCreate(false)} onCreated={load} />
    </div>
  );
};
