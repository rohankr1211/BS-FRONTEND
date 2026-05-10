import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Modal, Form } from 'react-bootstrap';
import { FaClipboardCheck, FaCheckCircle, FaTimesCircle, FaClock, FaListAlt } from 'react-icons/fa';
import projectService from '../../services/projectService';
import type { ApprovalResponse, ApprovalStats } from '../../services/projectService';

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger'
};

export const ApprovalsPage: React.FC = () => {
  const [approvals, setApprovals] = useState<ApprovalResponse[]>([]);
  const [stats, setStats] = useState<ApprovalStats | null>(null);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{ show: boolean; approvalId: string }>({ show: false, approvalId: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [acting, setActing] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [all, statsData] = await Promise.all([
      projectService.getApprovals(),
      projectService.getApprovalStats()
    ]);
    setApprovals(all);
    setStats(statsData);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = activeTab === 'ALL' ? approvals : approvals.filter(a => a.status === activeTab);

  const handleApprove = async (id: string) => {
    setActing(id);
    await projectService.approveRequest(id);
    await loadData();
    setActing('');
  };

  const handleReject = async () => {
    setActing(rejectModal.approvalId);
    await projectService.rejectRequest(rejectModal.approvalId, rejectReason);
    setRejectModal({ show: false, approvalId: '' });
    setRejectReason('');
    await loadData();
    setActing('');
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Approval Workflows</h3>
        <p className="text-muted mb-0">Review and act on pending approval requests.</p>
      </div>

      {/* Stats KPIs */}
      {stats && (
        <Row className="g-3 mb-4">
          {[
            { label: 'Pending', value: stats.pending, icon: FaClock, color: 'warning' },
            { label: 'Approved', value: stats.approved, icon: FaCheckCircle, color: 'success' },
            { label: 'Rejected', value: stats.rejected, icon: FaTimesCircle, color: 'danger' },
            { label: 'Total', value: stats.total, icon: FaListAlt, color: 'primary' }
          ].map(({ label, value, icon: Icon, color }) => (
            <Col md={3} key={label}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                  <div>
                    <p className="small text-muted text-uppercase fw-bold mb-1">{label}</p>
                    <h2 className={`fw-bold text-${color} mb-0`}>{value}</h2>
                  </div>
                  <div className={`bg-${color} bg-opacity-10 text-${color} p-3 rounded-circle`}>
                    <Icon size={22} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 bg-light p-1 rounded-4" style={{ width: 'fit-content' }}>
        {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn btn-sm rounded-3 px-4 ${activeTab === tab ? 'btn-primary' : 'btn-light'}`}
          >
            {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            {tab === 'PENDING' && stats && stats.pending > 0 &&
              <Badge bg="danger" pill className="ms-2">{stats.pending}</Badge>}
          </button>
        ))}
      </div>

      {/* Approval Cards */}
      {loading ? (
        <div className="text-center py-5 text-muted">Loading approvals...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5">
          <FaClipboardCheck size={48} className="text-muted opacity-25 mb-3" />
          <p className="text-muted">No {activeTab.toLowerCase()} approval requests.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map(approval => (
            <Card key={approval.approvalId} className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h6 className="fw-bold mb-0">{approval.taskDescription}</h6>
                      <Badge bg={STATUS_COLOR[approval.status]}>{approval.status}</Badge>
                    </div>
                    <div className="small text-muted mb-2">
                      Project: <span className="fw-semibold">{approval.projectName}</span>
                      &nbsp;·&nbsp; Requested by <span className="fw-semibold">{approval.requestedBy}</span>
                      &nbsp;·&nbsp; {new Date(approval.requestedAt).toLocaleString()}
                    </div>
                    <Badge bg="light" text="dark" className="border">{approval.requestType.replace(/_/g, ' ')}</Badge>
                    {approval.rejectionReason && (
                      <div className="mt-2 text-danger small">Reason: {approval.rejectionReason}</div>
                    )}
                  </div>

                  {approval.status === 'PENDING' && (
                    <div className="d-flex gap-2 flex-shrink-0">
                      <Button
                        variant="success" size="sm" className="rounded-3 d-flex align-items-center gap-2 px-3"
                        disabled={acting === approval.approvalId}
                        onClick={() => handleApprove(approval.approvalId)}
                      >
                        <FaCheckCircle /> {acting === approval.approvalId ? '...' : 'Approve'}
                      </Button>
                      <Button
                        variant="outline-danger" size="sm" className="rounded-3 d-flex align-items-center gap-2 px-3"
                        onClick={() => setRejectModal({ show: true, approvalId: approval.approvalId })}
                      >
                        <FaTimesCircle /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal show={rejectModal.show} onHide={() => setRejectModal({ show: false, approvalId: '' })} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Provide Rejection Reason</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="small fw-bold text-muted">REJECTION REASON *</Form.Label>
            <Form.Control
              as="textarea" rows={3}
              placeholder="Explain why this request is being rejected..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="rounded-3"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" className="rounded-3" onClick={() => setRejectModal({ show: false, approvalId: '' })}>Cancel</Button>
          <Button variant="danger" className="rounded-3" disabled={!rejectReason.trim()} onClick={handleReject}>
            Reject Request
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
