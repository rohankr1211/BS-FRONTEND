import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, Modal, Form } from 'react-bootstrap';
import { FaTruckLoading, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import { siteOpsService } from '../../services/siteOpsService';
import type { InboundDelivery } from '../../services/siteOpsService';

const VENDOR_STATUS_CONFIG: Record<string, { bg: string }> = {
  PENDING: { bg: 'secondary' },
  SHIPPED: { bg: 'info' },
  DELIVERED: { bg: 'success' },
};

export const DeliveriesPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<InboundDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelivery, setConfirmDelivery] = useState<InboundDelivery | null>(null);
  const [remarks, setRemarks] = useState('');
  const [confirmStatus, setConfirmStatus] = useState<'RECEIVED' | 'NOT_RECEIVED'>('RECEIVED');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => { setLoading(true); setDeliveries(await siteOpsService.getInboundDeliveries()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleConfirm = async () => {
    if (!confirmDelivery) return;
    setSubmitting(true);
    await siteOpsService.confirmDelivery(confirmDelivery.deliveryId, confirmStatus, remarks);
    setConfirmDelivery(null); setRemarks('');
    await load();
    setSubmitting(false);
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h3 className="fw-bold mb-1">Inbound Deliveries</h3><p className="text-muted mb-0">Track and confirm incoming materials from vendors.</p></div>
      </div>

      {loading ? <div className="text-center py-5 text-muted">Loading deliveries...</div> : (
        <Row className="g-3">
          {deliveries.map(d => {
            const vSta = VENDOR_STATUS_CONFIG[d.vendorStatus];
            return (
              <Col md={6} lg={4} key={d.deliveryId}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <div className="fw-bold text-primary">{d.deliveryId}</div>
                        <div className="small text-muted">{d.contractId}</div>
                      </div>
                      <Badge bg={vSta.bg} className="small">Vendor: {d.vendorStatus}</Badge>
                    </div>
                    <div className="mb-3">
                      <h6 className="fw-bold mb-1">{d.item}</h6>
                      <div className="fs-4 fw-bold">{d.quantity} <span className="small text-muted fw-normal">units</span></div>
                    </div>
                    <div className="small text-muted mb-3"><FaTruckLoading className="me-1" /> Expected: {d.deliveryDate}</div>
                    
                    {d.siteStatus ? (
                      <div className={`mt-auto p-3 rounded-3 bg-${d.siteStatus === 'RECEIVED' ? 'success' : 'danger'} bg-opacity-10 text-${d.siteStatus === 'RECEIVED' ? 'success' : 'danger'}`}>
                        <div className="fw-bold small d-flex align-items-center gap-2">
                          {d.siteStatus === 'RECEIVED' ? <FaCheckCircle /> : <FaTimesCircle />} 
                          {d.siteStatus}
                        </div>
                        {d.siteRemarks && <div className="small mt-1 opacity-75">{d.siteRemarks}</div>}
                        <div className="text-end mt-1" style={{ fontSize: '0.65rem' }}>{new Date(d.receivedAt!).toLocaleString()}</div>
                      </div>
                    ) : (
                      <Button variant="outline-primary" className="rounded-3 w-100 mt-auto py-2" onClick={() => setConfirmDelivery(d)}>Confirm Receipt</Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <Modal show={!!confirmDelivery} onHide={() => setConfirmDelivery(null)} centered>
        <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold fs-6">Confirm Delivery Receipt</Modal.Title></Modal.Header>
        <Modal.Body>
          <div className="bg-light p-3 rounded-3 mb-3">
            <div className="small text-muted mb-1">{confirmDelivery?.deliveryId}</div>
            <h6 className="fw-bold mb-0">{confirmDelivery?.quantity} units of {confirmDelivery?.item}</h6>
          </div>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">RECEIPT STATUS *</Form.Label>
            <div className="d-flex gap-3">
              <Form.Check type="radio" label="Received" name="status" checked={confirmStatus === 'RECEIVED'} onChange={() => setConfirmStatus('RECEIVED')} />
              <Form.Check type="radio" label="Not Received" name="status" checked={confirmStatus === 'NOT_RECEIVED'} onChange={() => setConfirmStatus('NOT_RECEIVED')} />
            </div>
          </Form.Group>
          <Form.Group>
            <Form.Label className="small fw-bold text-muted">REMARKS</Form.Label>
            <Form.Control as="textarea" rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Condition of items, quantity verified..." className="rounded-3" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" className="rounded-3" onClick={() => setConfirmDelivery(null)}>Cancel</Button>
          <Button variant="primary" className="rounded-3 px-4" disabled={submitting} onClick={handleConfirm}>{submitting ? 'Updating...' : 'Confirm'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
