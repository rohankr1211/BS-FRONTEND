import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NAVIGATION_MENUS } from '../../utils/constants';
import * as Icons from 'react-icons/fa';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const menuItems = NAVIGATION_MENUS[user.role] || [];

  return (
    <div className="d-none d-md-flex flex-column bg-light border-end position-fixed h-100 shadow-sm" style={{ width: '256px', top: '64px', zIndex: 1020, paddingBottom: '64px' }}>
      <div className="p-4 mb-2">
        <h6 className="fw-bold text-primary mb-1">BuildSmart Pro</h6>
        <p className="text-muted small mb-0">{user?.role?.replace('_', ' ') || ''}</p>
      </div>

      <Nav className="flex-column flex-grow-1 px-3 gap-1">
        {menuItems.map((item, index) => {
          // Dynamic icon rendering
          const IconComponent = (Icons as any)[item.icon] || Icons.FaQuestionCircle;
          
          // Improved active check for nested routes
          const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.path);
          
          return (
            <Nav.Link 
              as={NavLink} 
              to={item.path} 
              key={index}
              className={`d-flex align-items-center gap-3 py-3 px-3 rounded-3 text-decoration-none fw-semibold ${isActive ? 'text-primary' : 'text-secondary'}`}
              style={{
                backgroundColor: isActive ? 'rgba(var(--bs-primary-rgb), 0.1)' : 'transparent',
                color: isActive ? 'var(--bs-primary)' : 'inherit',
                opacity: isActive ? 1 : 0.8,
              }}
            >
              <IconComponent size={20} className={isActive ? 'text-primary' : 'text-secondary'} />
              <span className={isActive ? 'text-primary' : ''}>{item.label}</span>
            </Nav.Link>
          );
        })}
      </Nav>

      <div className="p-3 border-top">
        <p className="text-muted small mb-0 opacity-50 text-center">V2.4.1</p>
      </div>
    </div>
  );
};
