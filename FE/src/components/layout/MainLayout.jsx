import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen relative overflow-hidden">

      {/* Floating orbs behind everything — reinforce liquid glass depth */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Cyan orb — top-left anchor */}
        <div style={{
          position: 'absolute', top: '-8%', left: '-6%',
          width: '45%', height: '45%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.20) 0%, rgba(6,182,212,0.02) 65%)',
          filter: 'blur(80px)',
        }} />
        {/* Blue orb — bottom-right anchor */}
        <div style={{
          position: 'absolute', bottom: '-8%', right: '-6%',
          width: '45%', height: '45%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0.02) 65%)',
          filter: 'blur(80px)',
        }} />
        {/* Soft white orb — center depth */}
        <div style={{
          position: 'absolute', top: '30%', left: '35%',
          width: '35%', height: '35%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, transparent 65%)',
          filter: 'blur(70px)',
        }} />
      </div>

      {/* Sidebar backdrop (mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden transition-all duration-300"
          style={{ background: 'rgba(15,23,42,0.30)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-200px)]">
            <Outlet />
          </div>

          {/* Footer — glass strip */}
          <footer className="mt-12 w-full">
            <div className="max-w-7xl mx-auto pt-6 pb-2">
              <div
                className="glass-panel px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-300"
              >
                {/* Left Section - Branding */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 tracking-tight">SIHELP <span className="font-medium text-slate-400">v1.0</span></p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 uppercase tracking-wider">Internal Helpdesk</p>
                  </div>
                </div>

                {/* Center Section - Quick Links */}
                <div className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-500">
                  <a href="https://github.com/AntonyPutra" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">GitHub Developer</a>
                  <a href="mailto:antonyputra@sihelp.local" className="hover:text-blue-600 transition-colors">Hubungi Tim IT</a>
                  <Link to="/audit-logs" className="hover:text-blue-600 transition-colors">Log Sistem</Link>
                </div>

                {/* Right Section - Status & Copyright */}
                <div className="flex items-center gap-6 text-xs font-semibold text-slate-500 bg-white/40 px-4 py-2 rounded-xl border border-white/50">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-emerald-700">All Systems Operational</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <span>&copy; {new Date().getFullYear()} SIHELP</span>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
