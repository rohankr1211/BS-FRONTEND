import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaTruck, FaTrash } from 'react-icons/fa';
import vendorService from '../../services/vendorService';
import type { DeliveryResponse } from '../../services/vendorService';

const STATUS_CONFIG: Record<string, { bg: string; label: string; icon: string }> = {
  PENDING:    { bg: 'secondary', label: 'Pending',    icon: '⏳' },
  SHIPPED:    { bg: 'info',      label: 'Shipped',    icon: '📦' },
  IN_TRANSIT: { bg: 'warning',   label: 'In Transit', icon: '🚚' },
  DELIVERED:  { bg: 'success',   label: 'Delivered',  icon: '✅' }
};

const CreateDeliveryModal: React.FC<{ contracts: any[]; show: boolean; onHide: () => void; onCreated: () => void }> = ({ contracts, show, onHide, onCreated }) => {
  const [form, setForm] = useState({ contractId: '', deliveryDate: '', estimatedArrival: '', deliveryAddress: '', notes: '' });
  const [items, setItems] = useState([{ description: '', quantity: 1, unit: 'units' }]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const contract = contracts.find(c => c.contractId === form.contractId);
    await vendorService.createDelivery({ ...form, items, contractTitle: contract?.contractTitle || '' });
    onCreated(); onHide();
    setSubmitting(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">Create Delivery</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">CONTRACT *</Form.Label>
                <Form.Select value={form.contractId} onChange={e => setForm(f => ({ ...f, contractId: e.target.value }))} required className="rounded-3">
                  <option value="">Select contract...</option>
                  {contracts.map(c => <option key={c.contractId} value={c.contractId}>{c.contractTitle}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">DELIVERY DATE *</Form.Label>
                <Form.Control type="date" value={form.deliveryDate} onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))} required className="rounded-3" />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">EST. ARRIVAL</Form.Label>
                <Form.Control type="date" value={form.estimatedArrival} onChange={e => setForm(f => ({ ...f, estimatedArrival: e.target.value }))} className="rounded-3" />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">DELIVERY ADDRESS *</Form.Label>
                <Form.Control value={form.deliveryAddress} onChange={e => setForm(f => ({ ...f, deliveryAddress: e.target.value }))} required className="rounded-3" placeholder="Site address..." />
              </Form.Group>
            </Col>
          </Row>

          <h6 className="fw-bold text-muted text-uppercase mb-2">Items</h6>
          <div className="bg-light rounded-3 p-3 mb-3">
            {items.map((item, i) => (
              <Row key={i} className="g-2 mb-2 align-items-center">
                <Col md={6}><Form.Control size="sm" value={item.description} onChange={e => { const u = [...items]; u[i].description = e.target.value; setItems(u); }} placeholder="Item description" className="rounded-3" /></Col>
                <Col md={2}><Form.Control size="sm" type="number" value={item.quantity} onChange={e => { const u = [...items]; u[i].quantity = Number(e.target.value); setItems(u); }} className="rounded-3" /></Col>
                <Col md={3}><Form.Control size="sm" value={item.unit} onChange={e => { const u = [...items]; u[i].unit = e.target.value; setItems(u); }} placeholder="Unit" className="rounded-3" /></Col>
                <Col md={1}><Button variant="outline-danger" size="sm" className="rounded-3" onClick={() => setItems(items.filter((_, j) => j !== i))}><FaTrash /></Button></Col>
              </Row>
            ))}
            <Button variant="outline-secondary" size="sm" className="rounded-3 mt-1" onClick={() => setItems([...items, { description: '', quantity: 1, unit: 'units' }])}>
              <FaPlus className="me-1" /> Add Item
            </Button>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">NOTES</Form.Label>
            <Form.Control as="textarea" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="rounded-3" placeholder="Special instructions..." />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="light" className="rounded-3" onClick={onHide}>Cancel</Button>
            <Button variant="info" type="submit" className="rounded-3 text-white" disabled={submitting}>{submitting ? 'Creating...' : 'Create Delivery'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const DeliveriesPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliveryResponse[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    const [d, c] = await Promise.all([vendorService.getDeliveries(), vendorService.getContracts()]);
    setDeliveries(d); setContracts(c); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Deliveries</h3>
          <p className="text-muted mb-0">{deliveries.length} deliveries tracked</p>
        </div>
        <Button variant="info" className="rounded-3 d-flex align-items-center gap-2 text-white" onClick={() => setShowCreate(true)}>
          <FaPlus /> Create Delivery
        </Button>
      </div>

      {/* Status Summary */}
      <Row className="g-3 mb-4">
        {Object.entries(STATUS_CONFIG).map(([key, val]) => (
          <Col xs={6} md={3} key={key}>
            <Card className="border-0 shadow-sm rounded-4 text-center py-3">
              <div className="fs-4 mb-1">{val.icon}</div>
              <div className={`fs-5 fw-bold text-${val.bg}`}>{deliveries.filter(d => d.status === key).length}</div>
              <div className="small text-muted">{val.label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading deliveries...</div>
      ) : (
        <Row className="g-3">
          {deliveries.map(d => {
            const sta = STATUS_CONFIG[d.status];
            return (
              <Col md={6} lg={4} key={d.deliveryId}>
                <Card className="border-0 shadow-sm rounded-4 h-100"
                  style={{ borderLeft: `4px solid var(--bs-${sta.bg})`, paddingLeft: 0 }}>
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <div className="fw-bold">{d.deliveryId}</div>
                        <div className="small text-muted">{d.contractTitle}</div>
                      </div>
                      <Badge bg={sta.bg} className={d.status === 'IN_TRANSIT' ? 'text-dark' : ''}>{sta.icon} {sta.label}</Badge>
                    </div>
                    <div className="small text-muted mb-2">
                      <FaTruck className="me-1" />{d.deliveryAddress}
                    </div>
                    <div className="small mb-2">
                      <span className="text-muted">Dispatch: </span><strong>{d.deliveryDate}</strong>
                      {' → '}
                      <span className="text-muted">ETA: </span><strong>{d.estimatedArrival}</strong>
                      {d.actualArrival && <div className="text-success small">Arrived: {d.actualArrival}</div>}
                    </div>
                    <div className="bg-light rounded-3 p-2 small">
                      {d.items.map((item, i) => (
                        <div key={i} className="text-muted">{item.quantity} {item.unit} · {item.description}</div>
                      ))}
                    </div>
                    {d.notes && <div className="mt-2 small text-muted fst-italic">📝 {d.notes}</div>}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
      <CreateDeliveryModal contracts={contracts} show={showCreate} onHide={() => setShowCreate(false)} onCreated={load} />
    </div>
  );
};
