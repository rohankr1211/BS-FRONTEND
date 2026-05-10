import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Table, Modal, Form, ProgressBar } from 'react-bootstrap';
import { FaPlus, FaFileUpload, FaFileAlt, FaCheckCircle, FaTrash, FaDownload, FaEye } from 'react-icons/fa';
import vendorService from '../../services/vendorService';
import type { DocumentResponse } from '../../services/vendorService';

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  DRAFT: { bg: 'secondary', label: 'Draft' },
  PENDING: { bg: 'warning', label: 'Pending' },
  APPROVED: { bg: 'success', label: 'Approved' },
  REJECTED: { bg: 'danger', label: 'Rejected' },
};

const DOC_TYPES = ['CONTRACT', 'INVOICE', 'DELIVERY_NOTE', 'CERTIFICATE', 'OTHER'];

const UploadDocumentModal: React.FC<{ show: boolean; onHide: () => void; onUploaded: () => void }> = ({ show, onHide, onUploaded }) => {
  const [form, setForm] = useState({ documentType: 'CERTIFICATE', description: '', documentName: '' });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(p => (p >= 90 ? p : p + 10));
    }, 100);

    await vendorService.uploadDocument({
      ...form,
      documentName: file.name,
      fileSize: file.size,
      contentType: file.type,
    });

    clearInterval(interval);
    setProgress(100);
    setTimeout(() => {
      onUploaded();
      onHide();
      setUploading(false);
      setProgress(0);
      setFile(null);
    }, 500);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">Upload Document</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleUpload}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">DOCUMENT TYPE *</Form.Label>
            <Form.Select value={form.documentType} onChange={e => setForm(f => ({ ...f, documentType: e.target.value }))} required className="rounded-3">
              {DOC_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">DESCRIPTION</Form.Label>
            <Form.Control as="textarea" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-3" placeholder="What is this document for?" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">FILE *</Form.Label>
            <div className={`border-2 border-dashed rounded-4 p-4 text-center ${file ? 'bg-light border-primary' : 'border-secondary'}`} 
                 style={{ borderStyle: 'dashed', cursor: 'pointer' }}
                 onClick={() => document.getElementById('fileInput')?.click()}>
              <input type="file" id="fileInput" hidden onChange={e => setFile(e.target.files?.[0] || null)} />
              {file ? (
                <div>
                  <FaFileAlt size={32} className="text-primary mb-2" />
                  <div className="fw-bold small">{file.name}</div>
                  <div className="text-muted small">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              ) : (
                <div>
                  <FaFileUpload size={32} className="text-muted mb-2" />
                  <div className="text-muted small">Click or drag file to upload</div>
                </div>
              )}
            </div>
          </Form.Group>

          {uploading && (
            <div className="mb-3">
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Uploading...</span>
                <span className="fw-bold">{progress}%</span>
              </div>
              <ProgressBar now={progress} variant="primary" className="rounded-pill" style={{ height: '8px' }} />
            </div>
          )}

          <div className="d-flex justify-content-end gap-2">
            <Button variant="light" className="rounded-3" onClick={onHide} disabled={uploading}>Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-3" disabled={!file || uploading}>
              {uploading ? 'Processing...' : 'Upload Now'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [activeType, setActiveType] = useState('ALL');
  const [submitting, setSubmitting] = useState('');

  const load = async () => {
    setLoading(true);
    setDocuments(await vendorService.getDocuments());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, action: 'SUBMIT' | 'DELETE') => {
    if (action === 'SUBMIT') {
      setSubmitting(id);
      await vendorService.submitDocument(id);
      await load();
      setSubmitting('');
    }
  };

  const filtered = activeType === 'ALL' ? documents : documents.filter(d => d.documentType === activeType);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Document Repository</h3>
          <p className="text-muted mb-0">{documents.length} files stored · {documents.filter(d => d.status === 'APPROVED').length} approved</p>
        </div>
        <Button variant="primary" className="rounded-3 d-flex align-items-center gap-2" onClick={() => setShowUpload(true)}>
          <FaFileUpload /> Upload Document
        </Button>
      </div>

      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['ALL', ...DOC_TYPES].map(t => (
          <button key={t} onClick={() => setActiveType(t)}
            className={`btn btn-sm rounded-3 px-3 ${activeType === t ? 'btn-primary' : 'btn-light'}`}>
            {t === 'ALL' ? 'All Files' : t.replace('_', ' ')}
            <Badge bg={activeType === t ? 'light' : 'secondary'} text="dark" pill className="ms-2">
              {t === 'ALL' ? documents.length : documents.filter(d => d.documentType === t).length}
            </Badge>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading repository...</div>
      ) : (
        <Row className="g-3">
          {filtered.length === 0 ? (
            <Col xs={12} className="text-center py-5 text-muted">No documents found in this category.</Col>
          ) : (
            filtered.map(doc => {
              const sta = STATUS_CONFIG[doc.status];
              return (
                <Col md={6} lg={4} key={doc.documentId}>
                  <Card className="border-0 shadow-sm rounded-4 h-100 position-relative">
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="bg-light p-3 rounded-4">
                          <FaFileAlt size={24} className="text-primary" />
                        </div>
                        <Badge bg={sta.bg}>{sta.label}</Badge>
                      </div>
                      <h6 className="fw-bold text-truncate mb-1" title={doc.documentName}>{doc.documentName}</h6>
                      <div className="small text-muted mb-3">
                        <div className="text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>{doc.documentType.replace('_', ' ')}</div>
                        <div>{(doc.fileSize / 1024).toFixed(0)} KB · {new Date(doc.uploadedAt).toLocaleDateString()}</div>
                      </div>
                      <div className="d-flex gap-2 mt-auto">
                        <Button variant="light" size="sm" className="rounded-3 flex-grow-1 d-flex align-items-center justify-content-center gap-1">
                          <FaEye size={12} /> View
                        </Button>
                        <Button variant="light" size="sm" className="rounded-3 flex-grow-1 d-flex align-items-center justify-content-center gap-1">
                          <FaDownload size={12} /> Get
                        </Button>
                        {doc.status === 'DRAFT' && (
                          <Button variant="success" size="sm" className="rounded-3 flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                                  onClick={() => handleAction(doc.documentId, 'SUBMIT')} disabled={submitting === doc.documentId}>
                            <FaCheckCircle size={12} /> {submitting === doc.documentId ? '...' : 'Submit'}
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })
          )}
        </Row>
      )}

      <UploadDocumentModal show={showUpload} onHide={() => setShowUpload(false)} onUploaded={load} />
    </div>
  );
};
