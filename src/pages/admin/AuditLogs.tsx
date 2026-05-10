import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Form, InputGroup, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import {
  FaFileDownload, FaSyncAlt, FaCalendarAlt, FaUser, FaFilter,
  FaSearch, FaShieldAlt, FaUserCog,
  FaCloudUploadAlt, FaCogs
} from 'react-icons/fa';
import { auditService } from '../../services/auditService';
import type { AuditLog } from '../../services/auditService';

// Map backend field names → display labels
const formatAction = (action: string) => action.replace(/_/g, ' ');

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 15;

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await auditService.getLogs(page, PAGE_SIZE);
      setLogs(data?.content || []);
      setTotalElements(data?.totalElements || 0);
    } catch (err: any) {
      console.error('Audit fetch error:', err);
      setError('Failed to load audit logs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const getActionIcon = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes('role') || a.includes('user')) return <FaUserCog />;
    if (a.includes('security') || a.includes('login') || a.includes('auth')) return <FaShieldAlt />;
    if (a.includes('upload') || a.includes('file')) return <FaCloudUploadAlt />;
    if (a.includes('config') || a.includes('system')) return <FaCogs />;
    return <FaShieldAlt />;
  };

  const isFailure = (action: string) => action.toLowerCase().includes('fail') || action.toLowerCase().includes('error') || action.toLowerCase().includes('denied');

  const getInitials = (id: string) => {
    if (!id) return '??';
    return id.slice(0, 2).toUpperCase();
  };

  const totalPages = Math.ceil(totalElements / PAGE_SIZE);

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <FaSearch className="text-primary" />
            <span className="text-primary small fw-bold text-uppercase tracking-wider">Security & Compliance</span>
          </div>
          <h2 className="fw-bold mb-1">Administrative Audit Logs</h2>
          <p className="text-muted mb-0 small">Real-time monitoring of all system-level modifications and security events.</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" className="fw-semibold px-3 py-2 d-flex align-items-center gap-2 shadow-sm bg-white">
            <FaFileDownload /> Export CSV
          </Button>
          <Button 
            variant="primary" 
            className="fw-semibold px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
            onClick={() => loadLogs()}
            disabled={isLoading}
          >
            <FaSyncAlt className={isLoading ? 'fa-spin' : ''} /> Refresh
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" className="rounded-4 shadow-sm">{error}</Alert>}

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4">
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted text-uppercase mb-1">Date Range</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-light text-muted border-end-0"><FaCalendarAlt /></InputGroup.Text>
                  <Form.Control placeholder="Last 7 Days" className="bg-light border-start-0" />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted text-uppercase mb-1">Administrator</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-light text-muted border-end-0"><FaUser /></InputGroup.Text>
                  <Form.Select className="bg-light border-start-0">
                    <option>All Users</option>
                  </Form.Select>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted text-uppercase mb-1">Action Type</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-light text-muted border-end-0"><FaFilter /></InputGroup.Text>
                  <Form.Select className="bg-light border-start-0">
                    <option>All Actions</option>
                    <option>Role Updates</option>
                    <option>Auth Failures</option>
                  </Form.Select>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <InputGroup>
                <InputGroup.Text className="bg-light text-muted border-end-0"><FaSearch /></InputGroup.Text>
                <Form.Control placeholder="Search keywords..." className="bg-light border-start-0" />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-2 mb-0">Fetching logs...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light text-muted small text-uppercase">
                <tr>
                  <th className="py-3 px-4 fw-semibold border-bottom-0">Timestamp</th>
                  <th className="py-3 px-4 fw-semibold border-bottom-0">User Profile</th>
                  <th className="py-3 px-4 fw-semibold border-bottom-0">Action</th>
                  <th className="py-3 px-4 fw-semibold border-bottom-0">Resource</th>
                  <th className="py-3 px-4 fw-semibold border-bottom-0">IP Address</th>
                  <th className="py-3 px-4 fw-semibold border-bottom-0">Status</th>
                </tr>
              </thead>
              <tbody>
                {!Array.isArray(logs) || logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">No audit logs found.</td>
                  </tr>
                ) : (
                  logs.map((log, index) => {
                    const failed = isFailure(log.action);
                    return (
                      <tr key={log.auditId} className={index % 2 === 0 ? 'bg-light bg-opacity-50 border-bottom' : 'bg-white border-bottom'}>
                        <td className="py-3 px-4 font-monospace small text-muted">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className={`bg-${failed ? 'danger' : 'dark'} text-white fw-bold rounded d-flex align-items-center justify-content-center`}
                              style={{ width: '24px', height: '24px', fontSize: '10px' }}
                              title={log.userId}
                            >
                              {getInitials(log.userId)}
                            </div>
                            <span className="small fw-semibold font-monospace">{log.userId}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className={`d-flex align-items-center gap-2 small fw-bold text-${failed ? 'danger' : 'primary'}`}>
                            {getActionIcon(log.action)}
                            {formatAction(log.action)}
                          </div>
                        </td>
                        <td className="py-3 px-4 small text-muted">
                          <span className="fw-semibold">{log.entityType}</span>
                          {log.entityId && <span className="text-muted ms-1 font-monospace" style={{fontSize:'0.72rem'}}>#{log.entityId}</span>}
                        </td>
                        <td className="py-3 px-4 font-monospace small fw-bold text-muted">
                          <span className={failed ? 'text-danger' : ''}>{log.ipAddress}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge bg={failed ? 'danger' : 'success'} className={`px-2 py-1 bg-opacity-10 text-${failed ? 'danger' : 'success'} rounded`}>
                            {failed ? 'FAILED' : 'SUCCESS'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        )}
        <Card.Footer className="bg-light py-3 px-4 d-flex justify-content-between align-items-center border-top">
          <span className="text-muted small fw-semibold">
            Showing <span className="text-dark fw-bold">{logs.length > 0 ? page * PAGE_SIZE + 1 : 0} - {Math.min((page + 1) * PAGE_SIZE, totalElements)}</span> of {totalElements} events
          </span>
          <div className="d-flex gap-1 align-items-center">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >
              &lt;
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <Button 
                key={i} 
                variant={page === i ? 'primary' : 'outline-secondary'} 
                size="sm"
                onClick={() => setPage(i)}
              >
                {i + 1}
              </Button>
            ))}
            <Button 
              variant="outline-secondary" 
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >&gt;</Button>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};
