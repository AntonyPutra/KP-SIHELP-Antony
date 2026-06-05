import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService';
import { removeToken } from '../../utils/auth';

const Navbar = () => {
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
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
      <div className="text-gray-800 font-medium">Sistem Informasi Helpdesk</div>
      <div>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
