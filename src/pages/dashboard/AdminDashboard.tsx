import React, { useEffect, useState } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { StatWidget } from '../../components/dashboard/StatWidget';
import { userService } from '../../services/userService';
import { adminService } from '../../services/adminService';

export const AdminDashboard: React.FC = () => {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, pendingData] = await Promise.all([
          userService.getAllUsers(0, 1),
          adminService.getPendingUsers()
        ]);
        setTotalUsers(usersData?.totalElements || 0);
        setPendingCount(pendingData?.length || 0);
      } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        setTotalUsers(0);
        setPendingCount(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h3 className="mb-4 fw-bold">System Overview</h3>
      <Row className="g-4 mb-4">
        <Col md={4}>
          <StatWidget 
            title="Total Users" 
            value={isLoading ? <Spinner animation="border" size="sm" /> : totalUsers?.toLocaleString() || '0'} 
            icon="FaUsers" 
            subtitle={<><span className="text-success fw-bold">+0</span> this week</>}
            borderLeftColor="var(--bs-primary)"
          />
        </Col>
        <Col md={4}>
          <StatWidget 
            title="Pending Approvals" 
            value={isLoading ? <Spinner animation="border" size="sm" /> : pendingCount?.toString() || '0'} 
            icon="FaUserClock" 
            iconColor="text-warning"
            subtitle={<span className={pendingCount && pendingCount > 0 ? "text-warning" : "text-muted"}>
              {pendingCount && pendingCount > 0 ? "Action required" : "All caught up"}
            </span>}
            borderLeftColor="var(--bs-warning)"
          />
        </Col>
        <Col md={4}>
          <StatWidget 
            title="System Errors" 
            value="0" 
            icon="FaServer" 
            iconColor="text-success"
            subtitle={<><span className="text-success">●</span> All services operational</>}
            borderLeftColor="var(--bs-success)"
          />
        </Col>
      </Row>
      <div className="p-5 bg-white rounded-4 shadow-sm text-center">
        <p className="text-muted mb-0">Admin configuration panels will go here.</p>
      </div>
    </div>
  );
};
