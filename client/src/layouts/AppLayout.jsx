import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Toast from '../components/Toast';
import ApplicationModal from '../components/ApplicationModal';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Dark Navy Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all">

        <Navbar
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          onOpenAddModal={() => setQuickAddOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openQuickAdd: () => setQuickAddOpen(true) }} />
        </main>
      </div>

      {/* Global Quick Add Application Modal */}
      {quickAddOpen && (
        <ApplicationModal
          isOpen={quickAddOpen}
          onClose={() => setQuickAddOpen(false)}
          onSuccess={() => {
            setQuickAddOpen(false);
            window.dispatchEvent(new Event('careertrack_application_updated'));
          }}
        />
      )}

      {/* Toast Alert System */}
      <Toast />
    </div>
  );
}
