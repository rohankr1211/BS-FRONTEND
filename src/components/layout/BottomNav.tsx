import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NAVIGATION_MENUS } from '../../utils/constants';
import * as Icons from 'react-icons/fa';

export const BottomNav: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Take up to 4 items for the bottom nav to avoid crowding
  const menuItems = (NAVIGATION_MENUS[user.role] || []).slice(0, 4);

  return (
    <div className="d-md-none fixed-bottom bg-white border-top shadow-lg" style={{ zIndex: 1030 }}>
      <Nav className="w-100 d-flex justify-content-around py-2">
        {menuItems.map((item, index) => {
          const IconComponent = (Icons as any)[item.icon] || Icons.FaQuestionCircle;
          const isActive = window.location.pathname === item.path;
          
          return (
            <Nav.Link 
              as={NavLink} 
              to={item.path} 
              key={index}
              className="d-flex flex-column align-items-center p-2 text-decoration-none"
              style={{
                color: isActive ? 'var(--bs-primary)' : 'var(--bs-secondary)',
              }}
            >
              <div className={`p-2 rounded-circle ${isActive ? 'bg-primary bg-opacity-10' : ''}`}>
                <IconComponent size={20} className={isActive ? 'text-primary' : 'text-secondary'} />
              </div>
              <span className="small mt-1" style={{ fontSize: '10px', fontWeight: isActive ? 'bold' : 'normal' }}>
                {item.label}
              </span>
            </Nav.Link>
          );
        })}
      </Nav>
    </div>
  );
};
