import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, Search, ChevronDown, Shield, Key, X } from 'lucide-react';
import { logout, changePassword } from '../../services/authService';
import { removeToken } from '../../utils/auth';

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [user, setUser] = useState({ name: 'User', role: 'Staff' });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 8) {
      setPasswordError('Password baru minimal 8 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(oldPassword, newPassword, confirmPassword);
      setPasswordSuccess('Password berhasil diubah!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Optional: hide modal after 2 seconds
      // setTimeout(() => setShowProfileModal(false), 2000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user'));
      if (u) {
        setUser({
          name: u.name || 'User',
          role: u.role === 1 ? 'Administrator'
              : u.role === 2 ? 'Petugas'
              : u.role === 4 ? 'Pimpinan'
              : 'User',
        });
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try { await logout(); } catch (e) {}
    finally { removeToken(); localStorage.removeItem('user'); navigate('/login'); }
  };

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <header
      className="h-20 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40"
      style={{
        background: 'rgba(255,255,255,0.62)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderBottom: '1px solid rgba(255,255,255,0.60)',
        boxShadow: '0 4px 24px rgba(15,23,42,0.07), inset 0 -1px 0 rgba(148,163,184,0.18)',
      }}
    >
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2.5 rounded-xl transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.55)',
            border: '1px solid rgba(148,163,184,0.35)',
            color: '#475569',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.55)'; }}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <p className="text-slate-900 font-extrabold text-lg leading-tight tracking-tight">SIHELP</p>
          <p className="text-slate-400 text-xs font-semibold tracking-wide">Helpdesk &amp; Ticketing System</p>
        </div>
      </div>

      {/* Center: Search bar removed as requested */}
      <div className="flex-1 max-w-md mx-8 hidden md:block"></div>

      {/* Right: profile dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          id="profile-dropdown-button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 px-3 py-2 rounded-2xl transition-all duration-200"
          style={{
            background: dropdownOpen ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0.40)',
            border: '1px solid rgba(148,163,184,0.30)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.70)'; }}
          onMouseLeave={e => { if (!dropdownOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.40)'; }}
        >
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{
              background: 'linear-gradient(135deg, #2563EB, #0891B2)',
              boxShadow: '0 4px 14px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
            }}
          >
            {initial}
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-bold text-slate-800 leading-none">{user.name}</span>
            <span className="text-xs font-semibold text-slate-400 mt-0.5">{user.role}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown glass */}
        {dropdownOpen && (
          <div
            className="absolute right-0 mt-2 w-56 rounded-2xl p-2 animate-slide-down"
            style={{
              background: 'rgba(255,255,255,0.80)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.70)',
              boxShadow: '0 24px 60px rgba(15,23,42,0.16), inset 0 1px 0 rgba(255,255,255,0.90)',
            }}
          >
            <div className="px-3 py-3 border-b mb-2" style={{ borderColor: 'rgba(148,163,184,0.20)' }}>
              <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Shield className="w-3 h-3 text-blue-500" />
                <p className="text-xs text-slate-400 font-semibold">{user.role}</p>
              </div>
            </div>
            <button
              onClick={() => { setDropdownOpen(false); setShowProfileModal(true); }}
              id="btn-open-change-password"
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 rounded-xl transition-all duration-150"
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Key className="w-4 h-4" /> Ganti Kata Sandi
            </button>
            <div className="h-px my-2" style={{ background: 'rgba(148,163,184,0.20)' }} />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-600 rounded-xl transition-all duration-150"
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(254,226,226,0.65)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Ganti Kata Sandi</h3>
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setPasswordError('');
                  setPasswordSuccess('');
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {passwordError && (
                <div id="change-password-error" className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100">
                  <Shield className="w-4 h-4 shrink-0" />
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div id="change-password-success" className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-green-100">
                  <Shield className="w-4 h-4 shrink-0" />
                  {passwordSuccess}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Lama</label>
                  <input
                    type="password"
                    id="old-password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Baru</label>
                  <input
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    required
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    id="submit-change-password"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
