import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';

export const ReceptionLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#F3F6FB] text-slate-900 font-['Inter',sans-serif]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="OPD Reception Desk" />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ReceptionLayout;
