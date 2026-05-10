import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, Modal, Form } from 'react-bootstrap';
import { FaTruckLoading, FaCheckCircle, FaTimesCircle, FaSyncAlt, FaFileUpload } from 'react-icons/fa';
import { siteOpsService } from '../../services/siteOpsService';
import type { InboundDelivery } from '../../services/siteOpsService';
import vendorService from '../../services/vendorService';
import { toast } from 'react-toastify';

const VENDOR_STATUS_CONFIG: Record<string, { bg: string }> = {
  PENDING: { bg: 'secondary' },
  SHIPPED: { bg: 'info' },
  DELIVERED: { bg: 'success' },
};

const CreateDeliveryModal: React.FC<{ show: boolean; onHide: () => void; onCreated: () => void }> = ({ show, onHide, onCreated }) => {
  const [form, setForm] = useState({ deliveryId: '', contractId: '', item: '', quantity: 0, date: new Date().toISOString().split('T')[0], status: 'SHIPPED' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await siteOpsService.createDelivery(form);
      toast.success('Delivery created successfully');
      onCreated(); onHide();
      setForm({ deliveryId: '', contractId: '', item: '', quantity: 0, date: new Date().toISOString().split('T')[0], status: 'SHIPPED' });
    } catch (e) {
      console.error("Failed to create delivery", e);
      toast.error('Failed to create delivery');
    } finally { setSubmitting(false); }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold fs-6">Register New Delivery</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={12}><Form.Group><Form.Label className="small fw-bold text-muted">DELIVERY ID *</Form.Label><Form.Control type="text" value={form.deliveryId} onChange={e => setForm(f => ({ ...f, deliveryId: e.target.value.toUpperCase() }))} required className="rounded-3" placeholder="DEL-XXXXX" /></Form.Group></Col>
            <Col md={12}><Form.Group><Form.Label className="small fw-bold text-muted">CONTRACT/PO ID *</Form.Label><Form.Control type="text" value={form.contractId} onChange={e => setForm(f => ({ ...f, contractId: e.target.value.toUpperCase() }))} required className="rounded-3" placeholder="PO-XXXXX" /></Form.Group></Col>
            <Col md={12}><Form.Group><Form.Label className="small fw-bold text-muted">ITEM DESCRIPTION *</Form.Label><Form.Control type="text" value={form.item} onChange={e => setForm(f => ({ ...f, item: e.target.value }))} required className="rounded-3" placeholder="e.g. TMT Steel Bars" /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label className="small fw-bold text-muted">QUANTITY *</Form.Label><Form.Control type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} required className="rounded-3" /></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label className="small fw-bold text-muted">DATE *</Form.Label><Form.Control type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required className="rounded-3" /></Form.Group></Col>
          </Row>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="light" className="rounded-3" onClick={onHide}>Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-3 px-4" disabled={submitting}>{submitting ? 'Registering...' : 'Register Delivery'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const DeliveriesPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<InboundDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelivery, setConfirmDelivery] = useState<InboundDelivery | null>(null);
  const [remarks, setRemarks] = useState('');
  const [confirmStatus, setConfirmStatus] = useState<'RECEIVED' | 'NOT_RECEIVED'>('RECEIVED');
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingDelivery, setUploadingDelivery] = useState<InboundDelivery | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('DELIVERY_NOTE');
  const [documentDescription, setDocumentDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const handleRefresh = async () => {
    setSyncing(true);
    try {
      await load();
      toast.success('Deliveries refreshed');
    } catch (e) {
      console.error("Failed to refresh deliveries", e);
      toast.error('Failed to refresh deliveries');
    } finally {
      setSyncing(false);
    }
  };

  const openUploadModal = (delivery: InboundDelivery) => {
    setUploadingDelivery(delivery);
    setSelectedFile(null);
    setDocumentDescription('');
    setDocumentType('DELIVERY_NOTE');
    setShowUploadModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDocumentUpload = async () => {
    if (!selectedFile || !uploadingDelivery) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', documentType);
      formData.append('description', documentDescription);
      formData.append('contractId', uploadingDelivery.contractId);
      formData.append('vendorId', uploadingDelivery.contractId || '');
      
      await vendorService.uploadDocument(formData);
      toast.success('Document uploaded successfully');
      setShowUploadModal(false);
      setSelectedFile(null);
      setDocumentDescription('');
      setUploadingDelivery(null);
      await load();
    } catch (err) {
      console.error('Failed to upload document:', err);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  
  const load = async () => { 
    setLoading(true); 
    try {
      const data = await siteOpsService.getInboundDeliveries();
      setDeliveries(data || []);
    } catch (e) {
      console.error("Failed to load deliveries", e);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, []);

  const handleConfirm = async () => {
    if (!confirmDelivery) return;
    setSubmitting(true);
    try {
      await siteOpsService.confirmDelivery(confirmDelivery.deliveryId, confirmStatus, remarks);
      toast.success(`Delivery confirmed as ${confirmStatus}`);
      setConfirmDelivery(null); setRemarks('');
      await load();
    } catch (e) {
      console.error("Failed to confirm delivery", e);
      toast.error('Failed to confirm delivery');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Inbound Deliveries</h3>
          <p className="text-muted mb-0">Track and confirm incoming materials from vendors.</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" className="rounded-3 d-flex align-items-center gap-2" onClick={handleRefresh} disabled={syncing}>
            <FaSyncAlt className={syncing ? 'fa-spin' : ''} /> {syncing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="primary" className="rounded-3 d-flex align-items-center gap-2" onClick={() => setShowCreate(true)}>
            <FaTruckLoading /> Register Delivery
          </Button>
        </div>
      </div>

      {loading ? <div className="text-center py-5 text-muted">Loading deliveries...</div> : (
        <>
          {deliveries.length === 0 ? (
            <div className="text-center py-5 bg-light rounded-4">
              <FaTruckLoading size={40} className="text-muted mb-3 opacity-25" />
              <p className="text-muted mb-0">No deliveries found. Use the button above to register one.</p>
            </div>
          ) : (
            <Row className="g-3">
              {deliveries.map(d => {
                const vSta = VENDOR_STATUS_CONFIG[d.vendorStatus] || { bg: 'secondary' };
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
                        
                        <div className="mt-3">
                          <div className="d-flex gap-2 mb-2">
                            <Button variant="outline-info" size="sm" className="rounded-3 flex-fill" onClick={() => openUploadModal(d)}>
                              <FaFileUpload className="me-1" /> Upload Document
                            </Button>
                          </div>
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
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </>
      )}

      <CreateDeliveryModal show={showCreate} onHide={() => setShowCreate(false)} onCreated={load} />

      {/* Document Upload Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold"><FaFileUpload className="me-2" />Upload Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {uploadingDelivery && (
            <div className="mb-3">
              <div className="small text-muted fw-bold mb-1">Delivery</div>
              <div className="p-2 bg-light rounded-3">
                <div className="fw-bold">{uploadingDelivery.deliveryId}</div>
                <div className="small">{uploadingDelivery.item}</div>
                <div className="small">{uploadingDelivery.quantity} units</div>
              </div>
            </div>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">DOCUMENT TYPE *</Form.Label>
            <Form.Select value={documentType} onChange={e => setDocumentType(e.target.value)} className="rounded-3">
              <option value="DELIVERY_NOTE">Delivery Note</option>
              <option value="CERTIFICATE">Certificate</option>
              <option value="INVOICE">Invoice</option>
              <option value="OTHER">Other</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">DESCRIPTION</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={documentDescription}
              onChange={e => setDocumentDescription(e.target.value)}
              placeholder="Describe this document..."
              className="rounded-3"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">SELECT FILE *</Form.Label>
            <Form.Control
              type="file"
              onChange={handleFileSelect}
              className="rounded-3"
            />
            {selectedFile && (
              <div className="small text-muted mt-1">
                <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" className="rounded-3" onClick={() => setShowUploadModal(false)}>Cancel</Button>
          <Button 
            variant="primary" 
            className="rounded-3" 
            onClick={handleDocumentUpload} 
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </Modal.Footer>
      </Modal>

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
