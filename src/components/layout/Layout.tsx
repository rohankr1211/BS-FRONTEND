import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavbar } from './TopNavbar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export const Layout: React.FC = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <TopNavbar />
      
      <div className="d-flex flex-grow-1 position-relative" style={{ paddingTop: '64px' }}>
        {/* Sidebar for Desktop */}
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-grow-1 p-3 p-md-4 pb-5 pb-md-4 w-100" style={{ marginLeft: '0' }}>
          {/* We use a CSS class to add margin-left on md+ screens to account for the sidebar */}
          <div className="main-content-wrapper mx-auto" style={{ maxWidth: '1400px' }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Nav for Mobile */}
      <BottomNav />
      
      <style>
        {`
          @media (min-width: 768px) {
            main {
              margin-left: 256px !important;
            }
          }
          /* Custom scrollbar for a cleaner look */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}
      </style>
    </div>
  );
};
