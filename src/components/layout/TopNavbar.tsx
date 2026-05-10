import React from 'react';
import { Navbar, Dropdown } from 'react-bootstrap';
import { FaBuilding, FaUserCircle, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NotificationBell } from './NotificationBell';

export const TopNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="white" expand="lg" fixed="top" className="shadow-sm border-bottom px-4" style={{ height: '64px', zIndex: 1030 }}>
      <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
        <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
          <FaBuilding size={20} />
        </div>
        <span className="fs-4 fw-bold text-primary d-none d-md-block">BuildSmart</span>
      </Navbar.Brand>
      
      <div className="ms-auto d-flex align-items-center gap-3">
        <NotificationBell />

        <Dropdown align="end">
          <Dropdown.Toggle variant="light" id="dropdown-basic" className="d-flex align-items-center gap-2 border-0 bg-transparent shadow-none">
            <FaUserCircle size={24} className="text-secondary" />
            <span className="d-none d-md-block fw-semibold text-dark">{user?.name}</span>
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow border-0 mt-2">
            <Dropdown.Header>{user?.role?.replace('_', ' ') || ''}</Dropdown.Header>
            <Dropdown.Item as={Link} to="/profile"><FaUser className="me-2" /> Profile</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout} className="text-danger"><FaSignOutAlt className="me-2" /> Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </Navbar>
  );
};
