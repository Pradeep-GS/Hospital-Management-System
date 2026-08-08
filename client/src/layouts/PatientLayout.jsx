import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import MobileBottomNav from '../components/patient/MobileBottomNav';
import { App as CapApp } from '@capacitor/app';

export const PatientLayout = () => {
  const navigate = useNavigate();

  // Native Android hardware back-button listener
  useEffect(() => {
    let backListener = null;

    const setupBackButton = async () => {
      try {
        backListener = await CapApp.addListener('backButton', ({ canGoBack }) => {
          if (window.location.pathname === '/patient/dashboard') {
            CapApp.exitApp();
          } else if (canGoBack || window.history.length > 1) {
            window.history.back();
          } else {
            navigate('/patient/dashboard');
          }
        });
      } catch (err) {
        // Fallback gracefully on desktop browser where Capacitor native APIs are absent
      }
    };

    setupBackButton();

    return () => {
      if (backListener && typeof backListener.remove === 'function') {
        backListener.remove();
      }
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-[#F3F6FB] text-slate-900 font-['Inter',sans-serif]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Patient Health Portal" />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile-first bottom navigation for native Android experience */}
      <MobileBottomNav onOpenCopilot={() => window.dispatchEvent(new CustomEvent('open-hospital-copilot'))} />
    </div>
  );
};

export default PatientLayout;
