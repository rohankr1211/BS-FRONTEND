import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Form, InputGroup, ProgressBar, Badge } from 'react-bootstrap';
import { FaSearch, FaCheckCircle, FaExclamationTriangle, FaHourglassHalf } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import mockService from '../../services/analyticsService';
import type { VendorPerformanceRecord, VendorComplianceRecord } from '../../services/analyticsService';
import { ChartCard } from '../../components/common/ChartCard';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';

export const VendorAnalytics: React.FC = () => {
  const { user } = useAuth();
  const isVendor = user?.role === Role.VENDOR;

  const [performance, setPerformance] = useState<VendorPerformanceRecord[]>([]);
  const [compliance, setCompliance] = useState<VendorComplianceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof VendorPerformanceRecord; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [perfRes, compRes] = await Promise.all([
          mockService.getVendorPerformance(),
          mockService.getVendorCompliance()
        ]);
        
        // Mock role filter logic
        if (isVendor) {
          setPerformance(perfRes.filter(p => p.vendorId === 'VND-001')); // simulate own data
        } else {
          setPerformance(perfRes);
        }
        setCompliance(compRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isVendor]);

  // Handle sorting and filtering
  const filteredAndSortedPerformance = useMemo(() => {
    let sortableItems = [...performance];
    
    if (search) {
      sortableItems = sortableItems.filter(item => 
        item.vendorName.toLowerCase().includes(search.toLowerCase()) || 
        item.vendorId.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [performance, search, sortConfig]);

  const handleSort = (key: keyof VendorPerformanceRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getQualityColor = (score: number) => {
    if (score >= 4.5) return 'success';
    if (score >= 4.0) return 'primary';
    if (score >= 3.0) return 'warning';
    return 'danger';
  };

  const donutData = compliance ? [
    { name: 'Compliant', value: compliance.compliantVendors, color: 'var(--bs-success)' },
    { name: 'Non-Compliant', value: compliance.nonCompliantVendors, color: 'var(--bs-danger)' },
    { name: 'Pending Review', value: compliance.pendingReviewVendors, color: 'var(--bs-warning)' }
  ] : [];

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Vendor Analytics</h3>
        <p className="text-muted mb-0">Evaluate supplier performance and compliance status.</p>
      </div>

      {!isVendor && compliance && (
        <Row className="g-4 mb-4">
          <Col lg={4}>
            <ChartCard title="Overall Compliance Status" loading={loading} height={250}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="d-flex justify-content-center gap-3 mt-2">
                <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25"><FaCheckCircle className="me-1"/> {compliance.compliantVendors}</Badge>
                <Badge bg="danger" className="bg-opacity-10 text-danger border border-danger border-opacity-25"><FaExclamationTriangle className="me-1"/> {compliance.nonCompliantVendors}</Badge>
                <Badge bg="warning" className="bg-opacity-10 text-dark border border-warning border-opacity-25"><FaHourglassHalf className="me-1"/> {compliance.pendingReviewVendors}</Badge>
              </div>
            </ChartCard>
          </Col>
          <Col lg={8}>
            <Row className="g-4 h-100">
              <Col sm={6}>
                <Card className="border-0 shadow-sm rounded-4 h-100 bg-primary text-white">
                  <Card.Body className="p-4 d-flex flex-column justify-content-center">
                    <p className="small text-white-50 text-uppercase fw-bold mb-1">Document Approval Rate</p>
                    <h1 className="fw-bold mb-0 display-4">{compliance.documentApprovalRate}%</h1>
                    <ProgressBar variant="light" now={compliance.documentApprovalRate} className="mt-3 opacity-50" style={{ height: '4px' }} />
                  </Card.Body>
                </Card>
              </Col>
              <Col sm={6}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Body className="p-4 d-flex flex-column justify-content-center">
                    <p className="small text-muted text-uppercase fw-bold mb-1">Total Active Vendors</p>
                    <h1 className="fw-bold text-dark mb-0 display-4">{compliance.totalVendors}</h1>
                    <p className="small text-success fw-bold mt-2 mb-0">+2 this month</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      )}

      {/* Performance Table */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Header className="bg-white border-bottom p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <h5 className="fw-bold mb-0">Vendor Performance Metrics</h5>
          {!isVendor && (
            <InputGroup style={{ maxWidth: '300px' }}>
              <InputGroup.Text className="bg-light border-end-0 text-muted"><FaSearch /></InputGroup.Text>
              <Form.Control 
                placeholder="Search vendor..." 
                className="bg-light border-start-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          )}
        </Card.Header>
        <Table hover className="mb-0 align-middle">
          <thead className="bg-light text-muted small text-uppercase">
            <tr>
              <th className="py-3 px-4 border-bottom-0" style={{ cursor: 'pointer' }} onClick={() => handleSort('vendorName')}>Vendor</th>
              <th className="py-3 px-4 border-bottom-0" style={{ cursor: 'pointer' }} onClick={() => handleSort('onTimeDeliveryRate')}>On-Time Delivery</th>
              <th className="py-3 px-4 border-bottom-0 text-center" style={{ cursor: 'pointer' }} onClick={() => handleSort('qualityScore')}>Quality Score</th>
              <th className="py-3 px-4 border-bottom-0 text-center" style={{ cursor: 'pointer' }} onClick={() => handleSort('totalOrders')}>Orders</th>
              <th className="py-3 px-4 border-bottom-0 text-center" style={{ cursor: 'pointer' }} onClick={() => handleSort('avgResponseTimeDays')}>Avg Response</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-4">Loading performance data...</td></tr>
            ) : filteredAndSortedPerformance.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4 text-muted">No vendors found.</td></tr>
            ) : (
              filteredAndSortedPerformance.map((vendor) => (
                <tr key={vendor.vendorId}>
                  <td className="py-3 px-4">
                    <div className="fw-bold text-dark">{vendor.vendorName}</div>
                    <div className="small text-muted font-monospace">{vendor.vendorId}</div>
                  </td>
                  <td className="py-3 px-4" style={{ minWidth: '200px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small fw-bold">{vendor.onTimeDeliveryRate}%</span>
                    </div>
                    <ProgressBar 
                      variant={vendor.onTimeDeliveryRate >= 90 ? 'success' : vendor.onTimeDeliveryRate >= 80 ? 'primary' : 'danger'} 
                      now={vendor.onTimeDeliveryRate} 
                      style={{ height: '6px' }} 
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge bg={getQualityColor(vendor.qualityScore)} className="bg-opacity-10 text-dark border border-secondary border-opacity-25 px-2 py-1 fs-6">
                      {vendor.qualityScore.toFixed(1)} / 5.0
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center fw-semibold">{vendor.totalOrders}</td>
                  <td className="py-3 px-4 text-center text-muted">{vendor.avgResponseTimeDays} days</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};
