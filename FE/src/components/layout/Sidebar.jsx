import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Users', path: '/users' },
    { name: 'Categories', path: '/categories' },
    { name: 'Tickets', path: '/tickets' },
    { name: 'Reports', path: '/reports' },
    { name: 'Audit Logs', path: '/audit-logs' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-wider">SIHELP</h1>
        <p className="text-gray-400 text-xs mt-1">Helpdesk & Ticketing</p>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 text-xs text-gray-500 text-center">
        &copy; 2026 Kerja Praktik
      </div>
    </aside>
  );
};

export default Sidebar;
