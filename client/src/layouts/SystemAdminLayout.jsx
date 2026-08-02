import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';

export const SystemAdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-950 font-['Plus_Jakarta_Sans',sans-serif]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Platform System Admin Console" />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SystemAdminLayout;
