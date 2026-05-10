import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Table, Nav, Spinner } from 'react-bootstrap';
import { FaFileExport, FaEye, FaSyncAlt } from 'react-icons/fa';
import mockService from '../../services/analyticsService';
import type { HistoricalReportRecord, ReportResponseRecord } from '../../services/analyticsService';
import { toast } from 'react-toastify'; // Ensure react-toastify is installed and imported in App if used, or use simple alert

export const ReportGeneration: React.FC = () => {
  const [scope, setScope] = useState('PROJECT');
  const [targetId, setTargetId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ReportResponseRecord | null>(null);

  const [historyScope, setHistoryScope] = useState('All');
  const [history, setHistory] = useState<HistoricalReportRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const scopes = ['PROJECT', 'RESOURCE', 'SAFETY', 'FINANCE', 'VENDOR', 'SITE_ENGINEER'];
  const historyTabs = ['All', ...scopes];

  const loadHistory = async (selectedScope: string) => {
    setIsLoadingHistory(true);
    try {
      const data = await mockService.getReportHistory(selectedScope);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory(historyScope);
  }, [historyScope]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedReport(null);
    try {
      const report = await mockService.generateReport(scope, scope === 'PROJECT' ? targetId : undefined);
      setGeneratedReport(report);
      // Refresh history if it matches the current tab
      if (historyScope === 'All' || historyScope === scope) {
        loadHistory(historyScope);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = (reportId: string) => {
    // Simulate export
    toast.info(`Export queued for ${reportId}`, {
      position: "bottom-right",
      autoClose: 3000,
    });
    setTimeout(() => {
      toast.success(`Export completed for ${reportId}`, {
        position: "bottom-right",
      });
    }, 2000);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Report Generation &amp; History</h3>
        <p className="text-muted mb-0">Generate custom data dumps and view historical reports.</p>
      </div>

      <Row className="g-4 mb-5">
        <Col md={5}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Header className="bg-white border-bottom p-4">
              <h5 className="fw-bold mb-0">Generate New Report</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleGenerate}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Report Scope</Form.Label>
                  <Form.Select value={scope} onChange={e => setScope(e.target.value)} className="bg-light">
                    {scopes.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </Form.Select>
                </Form.Group>
                
                {scope === 'PROJECT' && (
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-muted text-uppercase">Target Project ID (Optional)</Form.Label>
                    <Form.Control 
                      placeholder="e.g. PROJ-123" 
                      value={targetId} 
                      onChange={e => setTargetId(e.target.value)} 
                      className="bg-light"
                    />
                  </Form.Group>
                )}

                <Button variant="primary" type="submit" disabled={isGenerating} className="w-100 fw-bold py-2 mt-2">
                  {isGenerating ? <><Spinner size="sm" className="me-2"/> Generating...</> : 'Generate Report'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={7}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-dark text-white">
            <Card.Header className="border-bottom border-secondary p-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0 text-white">Generation Result</h5>
              {generatedReport && (
                <Button variant="outline-light" size="sm" onClick={() => handleExport(generatedReport.reportId)}>
                  <FaFileExport className="me-2" /> Download JSON
                </Button>
              )}
            </Card.Header>
            <Card.Body className="p-4 overflow-auto" style={{ maxHeight: '400px' }}>
              {isGenerating ? (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-white-50">
                  <Spinner animation="border" variant="light" className="mb-3" />
                  <p>Aggregating data from microservices...</p>
                </div>
              ) : generatedReport ? (
                <div>
                  <div className="d-flex gap-4 mb-3 pb-3 border-bottom border-secondary">
                    <div>
                      <span className="small text-white-50 d-block text-uppercase">Report ID</span>
                      <span className="fw-bold font-monospace">{generatedReport.reportId}</span>
                    </div>
                    <div>
                      <span className="small text-white-50 d-block text-uppercase">Timestamp</span>
                      <span>{new Date(generatedReport.generatedDate).toLocaleString()}</span>
                    </div>
                  </div>
                  <pre className="text-success font-monospace small mb-0">
                    {generatedReport.metrics}
                  </pre>
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-white-50">
                  Select parameters and generate a report to view results here.
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* History Section */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Header className="bg-white border-bottom p-0">
          <div className="p-4 pb-0">
            <h5 className="fw-bold mb-3">Report History</h5>
          </div>
          <Nav variant="tabs" className="px-4 border-bottom-0">
            {historyTabs.map(tab => (
              <Nav.Item key={tab}>
                <Nav.Link 
                  className={`border-0 border-bottom border-3 fw-semibold pb-3 px-3 ${historyScope === tab ? 'border-primary text-primary bg-primary bg-opacity-10' : 'border-transparent text-secondary'}`}
                  active={historyScope === tab}
                  onClick={() => setHistoryScope(tab)}
                  style={{ cursor: 'pointer' }}
                >
                  {tab.replace('_', ' ')}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Card.Header>
        <Card.Body className="p-0">
          {isLoadingHistory ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="secondary" />
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="bg-light text-muted small text-uppercase">
                  <tr>
                    <th className="py-3 px-4 border-bottom-0">Report ID</th>
                    <th className="py-3 px-4 border-bottom-0">Scope</th>
                    <th className="py-3 px-4 border-bottom-0">Generated Date</th>
                    <th className="py-3 px-4 border-bottom-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-5 text-muted">No historical reports found for this scope.</td>
                    </tr>
                  ) : (
                    history.map(record => (
                      <tr key={record.reportId}>
                        <td className="py-3 px-4 font-monospace fw-bold">{record.reportId}</td>
                        <td className="py-3 px-4">
                          <span className="badge bg-secondary bg-opacity-10 text-dark border border-secondary border-opacity-25">
                            {record.scope}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted small">{new Date(record.generatedDate).toLocaleString()}</td>
                        <td className="py-3 px-4 text-end">
                          <Button variant="link" size="sm" className="text-primary text-decoration-none p-0 me-3">
                            <FaEye className="me-1" /> View
                          </Button>
                          <Button variant="link" size="sm" className="text-secondary text-decoration-none p-0" onClick={() => handleExport(record.reportId)}>
                            <FaFileExport className="me-1" /> Export
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};
