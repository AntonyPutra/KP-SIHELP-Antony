import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Folders, Ticket, FileBarChart, History } from 'lucide-react';
import BrandLogo from '../ui/BrandLogo';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Categories', path: '/categories', icon: Folders },
    { name: 'Tickets', path: '/tickets', icon: Ticket },
    { name: 'Reports', path: '/reports', icon: FileBarChart },
    { name: 'Audit Logs', path: '/audit-logs', icon: History },
  ];

  return (
    <aside 
      className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-950 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}
    >
      <div className="h-16 flex items-center px-6 border-b border-slate-800/60 bg-slate-950">
        <BrandLogo size="sm" className="mr-3" />
        <div className="flex flex-col">
          <span className="text-white font-bold text-lg leading-none tracking-tight">AntonyPutra</span>
          <span className="text-blue-400 text-[10px] uppercase tracking-widest font-bold mt-1">Helpdesk & Ticketing</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen && setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-blue-600/15 text-blue-400 font-semibold' 
                    : 'text-slate-400 font-medium hover:bg-slate-800/40 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-500 rounded-r-md"></div>}
                  <Icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      
      {/* Branding Footer is handled in MainLayout */}
    </aside>
  );
};

export default Sidebar;
