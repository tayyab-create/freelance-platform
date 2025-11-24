import React from 'react';
import Sidebar from './Navbar'; // Importing from Navbar.jsx which now exports Sidebar

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex">
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