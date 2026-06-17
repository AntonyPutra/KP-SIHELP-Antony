import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Folders, Ticket, FileBarChart, History } from 'lucide-react';
import BrandLogo from '../ui/BrandLogo';
import { getRoleId } from '../../utils/auth';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [role, setRole] = React.useState(3);
  React.useEffect(() => {
    try {
      const uStr = localStorage.getItem('user');
      if (uStr) {
        const u = JSON.parse(uStr);
        setRole(getRoleId(u));
      }
    } catch (e) {}
  }, []);

  let menuItems = [
    { name: 'Dashboard',   path: '/',           icon: LayoutDashboard },
    { name: 'Users',       path: '/users',      icon: Users },
    { name: 'Categories',  path: '/categories', icon: Folders },
    { name: 'Tickets',     path: '/tickets',    icon: Ticket },
    { name: 'Reports',     path: '/reports',    icon: FileBarChart },
    { name: 'Audit Logs',  path: '/audit-logs', icon: History },
  ];

  // Hide restricted menus for Petugas (2) and User (3)
  if (role !== 1 && role !== 4) {
    menuItems = menuItems.filter(item => 
      !['Dashboard', 'Users', 'Reports', 'Audit Logs'].includes(item.name)
    );
  }

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}
      style={{
        /* Dark glass — navy with backdrop blur */
        background: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Brand */}
      <div
        className="h-20 flex items-center px-6 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <BrandLogo size="sm" className="mr-3" />
        <div>
          <span className="text-white font-extrabold text-lg leading-none tracking-tight block">SIHELP</span>
          <span
            className="text-[10px] uppercase tracking-widest font-bold mt-0.5 block"
            style={{ color: '#38BDF8' }}
          >
            Helpdesk System
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setIsOpen?.(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-2xl transition-all duration-200 group relative
                 text-sm font-semibold overflow-hidden
                 animate-slide-down
                 ${isActive
                   ? 'text-white'
                   : 'text-slate-400 hover:text-slate-200'
                 }`
              }
              style={({ isActive }) => ({
                animationDelay: `${i * 45}ms`,
                background: isActive
                  ? 'linear-gradient(135deg, rgba(37,99,235,0.35) 0%, rgba(8,145,178,0.25) 100%)'
                  : undefined,
                border: isActive
                  ? '1px solid rgba(56,189,248,0.20)'
                  : '1px solid transparent',
                boxShadow: isActive
                  ? 'inset 0 1px 0 rgba(255,255,255,0.10), 0 4px 16px rgba(37,99,235,0.20)'
                  : 'none',
              })}
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator bar */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                      style={{ background: 'linear-gradient(180deg, #38BDF8, #2563EB)' }}
                    />
                  )}
                  {/* Glossy shine on active */}
                  {isActive && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
                        borderRadius: 'inherit',
                      }}
                    />
                  )}
                  <Icon
                    className="w-5 h-5 mr-3 flex-shrink-0 transition-colors"
                    style={{ color: isActive ? '#38BDF8' : undefined }}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-4 shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2.5 text-xs font-semibold" style={{ color: 'rgba(148,163,184,0.70)' }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Systems Online &nbsp;&mdash;&nbsp; v1.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
