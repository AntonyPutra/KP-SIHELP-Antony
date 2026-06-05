import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, Search } from 'lucide-react';
import { logout } from '../../services/authService';
import { removeToken } from '../../utils/auth';

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    } finally {
      removeToken();
      navigate('/login');
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/70 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="mr-4 lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col hidden sm:flex">
          <h2 className="text-slate-900 font-bold text-lg leading-tight tracking-tight">SIHELP Dashboard</h2>
          <span className="text-slate-500 text-xs font-medium">AntonyPutra Workspace</span>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-4 hidden md:flex items-center">
        <div className="relative w-full group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari tiket, user, atau data..." 
            className="w-full bg-slate-100/50 hover:bg-slate-100 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-700 transition-all outline-none"
            readOnly
          />
        </div>
      </div>
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="flex items-center text-sm font-semibold text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 transition-colors py-1.5 px-3.5 rounded-full cursor-default">
          <User className="w-4 h-4 mr-2 text-blue-600" />
          Admin
        </div>
        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
        <button
          onClick={handleLogout}
          className="flex items-center text-sm font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-3.5 py-2 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:block">Keluar</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
