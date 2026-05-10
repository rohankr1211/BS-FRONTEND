import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import { FaPlus, FaFileContract } from 'react-icons/fa';
import vendorService from '../../services/vendorService';
import type { ContractResponse } from '../../services/vendorService';

const STATUS_CONFIG: Record<string, { bg: string }> = {
  ACTIVE:     { bg: 'success' },
  EXPIRED:    { bg: 'danger' },
  TERMINATED: { bg: 'secondary' },
  DRAFT:      { bg: 'warning' }
};

const PROJECTS = [
  { id: 'PRJ-001', name: 'Metro Tower A' },
  { id: 'PRJ-002', name: 'Riverfront Marina' },
  { id: 'PRJ-003', name: 'Tech Hub Campus' }
];

const CreateContractModal: React.FC<{ show: boolean; onHide: () => void; onCreated: () => void }> = ({ show, onHide, onCreated }) => {
  const [form, setForm] = useState({ contractTitle: '', description: '', startDate: '', endDate: '', value: 0, terms: '', projectId: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await vendorService.createContract(form);
    onCreated(); onHide();
    setForm({ contractTitle: '', description: '', startDate: '', endDate: '', value: 0, terms: '', projectId: '' });
    setSubmitting(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">Create New Contract</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">CONTRACT TITLE *</Form.Label>
                <Form.Control value={form.contractTitle} onChange={e => setForm(f => ({ ...f, contractTitle: e.target.value }))} required className="rounded-3" placeholder="e.g. Steel Supply Agreement" />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">PROJECT</Form.Label>
                <Form.Select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} className="rounded-3">
                  <option value="">Select project...</option>
                  {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">DESCRIPTION</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-3" />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">VALUE (USD) *</Form.Label>
                <Form.Control type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} required min={1} className="rounded-3" />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">START DATE *</Form.Label>
                <Form.Control type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required className="rounded-3" />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">END DATE *</Form.Label>
                <Form.Control type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required className="rounded-3" />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">PAYMENT TERMS</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.terms} onChange={e => setForm(f => ({ ...f, terms: e.target.value }))} className="rounded-3" placeholder="e.g. Payment due 30 days net..." />
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="light" className="rounded-3" onClick={onHide}>Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-3" disabled={submitting}>{submitting ? 'Creating...' : 'Create Contract'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const ContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const load = async () => { setLoading(true); setContracts(await vendorService.getContracts()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const filtered = statusFilter === 'ALL' ? contracts : contracts.filter(c => c.status === statusFilter);
  const totalValue = filtered.reduce((s, c) => s + c.value, 0);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Contracts</h3>
          <p className="text-muted mb-0">{filtered.length} contracts · Total value: <strong>${totalValue.toLocaleString()}</strong></p>
        </div>
        <Button variant="primary" className="rounded-3 d-flex align-items-center gap-2" onClick={() => setShowCreate(true)}>
          <FaPlus /> New Contract
        </Button>
      </div>

      <div className="d-flex gap-2 mb-4 flex-wrap">
        {(['ALL', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'DRAFT'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`btn btn-sm rounded-3 px-3 ${statusFilter === s ? 'btn-primary' : 'btn-light'}`}>
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            <Badge bg={statusFilter === s ? 'light' : 'secondary'} text="dark" pill className="ms-2">
              {s === 'ALL' ? contracts.length : contracts.filter(c => c.status === s).length}
            </Badge>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading contracts...</div>
      ) : (
        <Card className="border-0 shadow-sm rounded-4">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="py-3 px-4 border-0">Contract</th>
                <th className="py-3 px-4 border-0">Project</th>
                <th className="py-3 px-4 border-0">Value</th>
                <th className="py-3 px-4 border-0">Period</th>
                <th className="py-3 px-4 border-0">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-5 text-muted">No contracts found.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.contractId}>
                  <td className="py-3 px-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3"><FaFileContract /></div>
                      <div>
                        <div className="fw-bold">{c.contractTitle}</div>
                        <div className="small text-muted font-monospace">{c.contractId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 small">{c.projectName || '—'}</td>
                  <td className="py-3 px-4 fw-bold">${c.value.toLocaleString()}</td>
                  <td className="py-3 px-4 small text-muted">{c.startDate} → {c.endDate}</td>
                  <td className="py-3 px-4">
                    <Badge bg={STATUS_CONFIG[c.status]?.bg || 'secondary'}>{c.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
      <CreateContractModal show={showCreate} onHide={() => setShowCreate(false)} onCreated={load} />
    </div>
  );
};
