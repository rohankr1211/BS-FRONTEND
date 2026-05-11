import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, Modal, Form, Table } from 'react-bootstrap';
import { FaPlus, FaDownload, FaTrash, FaEye, FaSyncAlt, FaFileUpload } from 'react-icons/fa';
import vendorService from '../../services/vendorService';
import { toast } from 'react-toastify';

const DOCUMENT_TYPE_CONFIG = {
  CONTRACT: { label: 'Contract' },
  INVOICE: { label: 'Invoice' },
  DELIVERY_NOTE: { label: 'Delivery Note' },
  CERTIFICATE: { label: 'Certificate' },
  OTHER: { label: 'Other' }
};

const DOCUMENT_STATUS_CONFIG = {
  DRAFT: { bg: 'secondary', label: 'Draft' },
  PENDING: { bg: 'warning', label: 'Pending' },
  APPROVED: { bg: 'success', label: 'Approved' },
  REJECTED: { bg: 'danger', label: 'Rejected' }
};

const UploadDocumentModal = ({ show, onHide, onUploaded }) => {
  const [form, setForm] = useState({ documentType: 'CONTRACT', description: '', contractId: '', vendorId: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', form.documentType);
      formData.append('description', form.description);
      if (form.contractId) formData.append('contractId', form.contractId);
      if (form.vendorId) formData.append('vendorId', form.vendorId);
      
      await vendorService.uploadDocument(formData);
      toast.success('Document uploaded successfully');
      onUploaded(); onHide();
      setForm({ documentType: 'CONTRACT', description: '', contractId: '', vendorId: '' });
      setSelectedFile(null);
    } catch (e) {
      console.error('Failed to upload document:', e);
      toast.error('Failed to upload document');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">Upload Document</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">DOCUMENT TYPE *</Form.Label>
                <Form.Select value={form.documentType} onChange={e => setForm(f => ({ ...f, documentType: e.target.value }))} className="rounded-3">
                  {Object.entries(DOCUMENT_TYPE_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>{config.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">CONTRACT ID</Form.Label>
                <Form.Control type="text" value={form.contractId} onChange={e => setForm(f => ({ ...f, contractId: e.target.value }))} className="rounded-3" placeholder="CON-XXXXX" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">VENDOR ID</Form.Label>
                <Form.Control type="text" value={form.vendorId} onChange={e => setForm(f => ({ ...f, vendorId: e.target.value }))} className="rounded-3" placeholder="V-XXXXX" />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">DESCRIPTION</Form.Label>
                <Form.Control as="textarea" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-3" placeholder="Describe this document..." />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">SELECT FILE *</Form.Label>
                <Form.Control type="file" onChange={handleFileSelect} className="rounded-3" />
                {selectedFile && (
                  <div className="small text-muted mt-1">
                    <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="light" className="rounded-3" onClick={onHide}>Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-3 px-4" disabled={!selectedFile || submitting}>{submitting ? 'Uploading...' : 'Upload Document'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      let data = [];
      if (filterType) {
        data = await vendorService.getDocumentsByType(filterType);
      } else if (filterStatus) {
        data = await vendorService.getDocumentsByStatus(filterStatus);
      } else {
        const response = await vendorService.getDocuments();
        // Ensure we always get an array, even if response structure is unexpected
        data = Array.isArray(response) ? response : (response?.content || response?.data || []);
      }
      setDocuments(data);
    } catch (e) {
      console.error('Failed to load documents:', e);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterType, filterStatus]);

  const openDeleteModal = (document) => {
    setSelectedDocument(document);
    setShowDelete(true);
  };

  const openDetailModal = (document) => {
    setSelectedDocument(document);
    setShowDetail(true);
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;
    try {
      await vendorService.deleteDocument(selectedDocument.id);
      toast.success('Document deleted successfully');
      setShowDelete(false);
      setSelectedDocument(null);
      await load();
    } catch (e) {
      console.error('Failed to delete document:', e);
      toast.error('Failed to delete document');
    }
  };

  const handleDownload = async (document) => {
    try {
      const blob = await vendorService.downloadDocument(document.id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.documentName;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (e) {
      console.error('Failed to download document:', e);
      toast.error('Failed to download document');
    }
  };

  const handleRefresh = async () => {
    setSyncing(true);
    try {
      await load();
      toast.success('Documents refreshed');
    } catch (e) {
      console.error('Failed to refresh documents:', e);
      toast.error('Failed to refresh documents');
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDocument) return;
    setSubmitting(true);
    try {
      await vendorService.submitDocument(selectedDocument.id);
      toast.success('Document submitted for approval');
      setShowDetail(false);
      await load();
    } catch (e) {
      console.error('Failed to submit document:', e);
      toast.error('Failed to submit document');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Document Management</h3>
          <p className="text-muted mb-0">Manage contracts, invoices, and other documents.</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" className="rounded-3 d-flex align-items-center gap-2" onClick={handleRefresh} disabled={syncing}>
            <FaSyncAlt className={syncing ? 'fa-spin' : ''} /> {syncing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="primary" className="rounded-3 d-flex align-items-center gap-2" onClick={() => setShowUpload(true)}>
            <FaPlus /> Upload Document
          </Button>
        </div>
      </div>

      <div className="d-flex gap-3 mb-4">
        <Form.Select value={filterType} onChange={e => setFilterType(e.target.value)} className="rounded-3" style={{ maxWidth: '200px' }}>
          <option value="">All Types</option>
          {Object.entries(DOCUMENT_TYPE_CONFIG).map(([value, config]) => (
            <option key={value} value={value}>{config.label}</option>
          ))}
        </Form.Select>
        <Form.Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-3" style={{ maxWidth: '200px' }}>
          <option value="">All Statuses</option>
          {Object.entries(DOCUMENT_STATUS_CONFIG).map(([value, config]) => (
            <option key={value} value={value}>{config.label}</option>
          ))}
        </Form.Select>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading documents...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4">
          <FaFileUpload size={40} className="text-muted mb-3 opacity-25" />
          <p className="text-muted mb-0">No documents found. Use the button above to upload one.</p>
        </div>
      ) : (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Document ID</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Name</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Type</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Vendor</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Status</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Uploaded</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(document => {
                  const typeConfig = DOCUMENT_TYPE_CONFIG[document.documentType] || { label: document.documentType };
                  const statusConfig = DOCUMENT_STATUS_CONFIG[document.status] || { bg: 'secondary', label: document.status };
                  return (
                    <tr key={document.id}>
                      <td className="font-monospace small">{document.documentId}</td>
                      <td className="fw-semibold">{document.documentName}</td>
                      <td><Badge bg="info" className="small">{typeConfig.label}</Badge></td>
                      <td>{document.uploadedBy}</td>
                      <td><Badge bg={statusConfig.bg} className="small">{statusConfig.label}</Badge></td>
                      <td className="small">{new Date(document.uploadedAt).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button variant="outline-primary" size="sm" className="rounded-3" onClick={() => openDetailModal(document)}>
                            <FaEye />
                          </Button>
                          <Button variant="outline-info" size="sm" className="rounded-3" onClick={() => handleDownload(document)}>
                            <FaDownload />
                          </Button>
                          <Button variant="outline-danger" size="sm" className="rounded-3" onClick={() => openDeleteModal(document)}>
                            <FaTrash />
                          </Button>
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

      <UploadDocumentModal show={showUpload} onHide={() => setShowUpload(false)} onUploaded={load} />

      {/* Delete Confirmation Modal */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-danger"><FaTrash className="me-2" />Delete Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this document? This action cannot be undone.</p>
          {selectedDocument && (
            <div className="bg-light p-3 rounded-3">
              <div className="mb-1"><strong>Name:</strong> {selectedDocument.documentName}</div>
              <div className="mb-1"><strong>Type:</strong> {DOCUMENT_TYPE_CONFIG[selectedDocument.documentType]?.label}</div>
              <div className="mb-1"><strong>Status:</strong> <Badge bg={DOCUMENT_STATUS_CONFIG[selectedDocument.status]?.bg}>{DOCUMENT_STATUS_CONFIG[selectedDocument.status]?.label}</Badge></div>
              <div><strong>Uploaded:</strong> {new Date(selectedDocument.uploadedAt).toLocaleDateString()}</div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" className="rounded-3" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="danger" className="rounded-3" onClick={handleDelete}>Delete Document</Button>
        </Modal.Footer>
      </Modal>

      {/* Detail Modal */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered size="lg">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Document Details</Modal.Title>
        </Modal.Header>
        {selectedDocument && (
          <Modal.Body className="p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Badge bg={DOCUMENT_STATUS_CONFIG[selectedDocument.status]?.bg} className="fs-6">{DOCUMENT_STATUS_CONFIG[selectedDocument.status]?.label}</Badge>
              <Badge bg="info" className="fs-6">{DOCUMENT_TYPE_CONFIG[selectedDocument.documentType]?.label}</Badge>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="small text-muted">Document ID</div>
                <div className="fw-semibold font-monospace">{selectedDocument.documentId}</div>
              </div>
              <div className="col-md-6">
                <div className="small text-muted">File Name</div>
                <div className="fw-semibold">{selectedDocument.documentName}</div>
              </div>
              <div className="col-md-6">
                <div className="small text-muted">File Size</div>
                <div className="fw-semibold">{(selectedDocument.fileSize / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <div className="col-md-6">
                <div className="small text-muted">Content Type</div>
                <div className="fw-semibold">{selectedDocument.contentType}</div>
              </div>
            </div>
            <div className="mb-3">
              <div className="small text-muted fw-bold mb-1">Description</div>
              <div className="p-3 bg-light rounded-3">{selectedDocument.description}</div>
            </div>
            <div className="mb-3">
              <div className="small text-muted fw-bold mb-1">Uploaded By</div>
              <div className="fw-semibold">{selectedDocument.uploadedBy}</div>
            </div>
            <div className="mb-3">
              <div className="small text-muted fw-bold mb-1">Uploaded At</div>
              <div className="fw-semibold">{new Date(selectedDocument.uploadedAt).toLocaleDateString()}</div>
            </div>
            {selectedDocument.submittedAt && (
              <div className="mb-3">
                <div className="small text-muted fw-bold mb-1">Submitted At</div>
                <div className="fw-semibold">{new Date(selectedDocument.submittedAt).toLocaleDateString()}</div>
              </div>
            )}
          </Modal.Body>
        )}
        <Modal.Footer className="border-0">
          <div className="d-flex gap-2">
            <Button variant="light" className="rounded-3" onClick={() => setShowDetail(false)}>Close</Button>
            {selectedDocument.status === 'DRAFT' && (
              <Button variant="primary" className="rounded-3" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            )}
            {selectedDocument && (
              <Button variant="outline-info" className="rounded-3" onClick={() => handleDownload(selectedDocument)}>
                <FaDownload className="me-1" /> Download
              </Button>
            )}
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
