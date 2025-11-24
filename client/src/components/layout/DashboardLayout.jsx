import React from 'react';
import { useSelector } from 'react-redux';
import Sidebar from './Navbar'; // Importing from Navbar.jsx which now exports Sidebar

const DashboardLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  const getThemeClass = () => {
    if (user?.role === 'company') return 'theme-company';
    if (user?.role === 'admin') return 'theme-admin';
    return ''; // Default (Worker/Purple)
  };

  return (
    <div className={`min-h-screen flex ${getThemeClass()}`}>
      <Sidebar />
      {/* Main Content Area - shifts based on sidebar width */}
      <main className="flex-1 lg:ml-64 transition-all duration-300 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;