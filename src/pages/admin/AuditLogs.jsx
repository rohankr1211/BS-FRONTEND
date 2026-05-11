import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Form, InputGroup, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import {
  FaFileDownload, FaSyncAlt, FaCalendarAlt, FaUser, FaFilter,
  FaSearch, FaShieldAlt, FaUserCog, FaCloudUploadAlt, FaCogs
} from 'react-icons/fa';
import { auditService } from '../../services/auditService';

// Map backend field names → display labels
const formatAction = (action) => action.replace(/_/g, ' ');

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
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
    } catch (err) {
      console.error('Audit fetch error:', err);
      setError('Failed to load audit logs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const getActionIcon = (action) => {
    const a = action.toLowerCase();
    if (a.includes('role') || a.includes('user')) return <FaUserCog />;
    if (a.includes('security') || a.includes('login') || a.includes('auth')) return <FaShieldAlt />;
    if (a.includes('upload') || a.includes('file')) return <FaCloudUploadAlt />;
    if (a.includes('config') || a.includes('system')) return <FaCogs />;
    return <FaShieldAlt />;
  };

  const isFailure = (action) => {
    const a = action.toLowerCase();
    return a.includes('fail') || a.includes('error') || a.includes('denied');
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Audit Logs</h3>
          <p className="text-muted mb-0">System activity and security logs.</p>
        </div>
        <Button variant="outline-secondary" className="rounded-3 d-flex align-items-center gap-2" onClick={loadLogs} disabled={isLoading}>
          <FaSyncAlt className={isLoading ? 'fa-spin' : ''} /> {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <div className="text-muted mt-3">Loading audit logs...</div>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4">
          <FaShieldAlt size={40} className="text-muted mb-3 opacity-25" />
          <p className="text-muted mb-0">No audit logs found.</p>
        </div>
      ) : (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Header className="bg-light border-0">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0">Audit Logs</h5>
                <div className="text-muted small">
                  Showing {logs.length} of {totalElements} total entries
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <InputGroup className="w-auto">
                  <Form.Control
                    type="text"
                    placeholder="Search audit logs..."
                    className="rounded-3"
                  />
                  <Button variant="outline-secondary" className="rounded-3">
                    <FaFilter />
                  </Button>
                </InputGroup>
              </div>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Timestamp</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">User</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Action</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">IP Address</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Status</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td className="font-monospace small">{new Date(log.timestamp).toLocaleString()}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <FaUser className="text-muted" />
                        <div>
                          <div className="fw-semibold">{log.userName}</div>
                          <div className="small text-muted">{log.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge bg={isFailure(log.action) ? 'danger' : 'info'} className="small">
                        {getActionIcon(log.action)} {formatAction(log.action)}
                      </Badge>
                    </td>
                    <td className="font-monospace small">{log.ipAddress}</td>
                    <td>
                      <Badge bg={isFailure(log.action) ? 'danger' : 'success'} className="small">
                        {log.status}
                      </Badge>
                    </td>
                    <td className="small text-muted" style={{ maxWidth: '200px' }}>
                      <div className="text-truncate" title={log.details}>
                        {log.details}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
          <Card.Footer className="border-0 bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                Showing {logs.length} of {totalElements} entries
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  className="rounded-3"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline-secondary"
                  className="rounded-3"
                  onClick={() => setPage(page + 1)}
                  disabled={logs.length < PAGE_SIZE}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card.Footer>
        </Card>
      )}
    </div>
  );
};
