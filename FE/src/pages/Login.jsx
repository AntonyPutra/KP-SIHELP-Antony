import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { setToken, getRoleId } from '../utils/auth';
import BrandLogo from '../components/ui/BrandLogo';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login(email, password);
      if (response.success && response.data.token) {
        setToken(response.data.token);
        const userData = response.data.user || {};
        localStorage.setItem('user', JSON.stringify(userData));
        const roleId = getRoleId(userData);
        
        // Redirect based on role
        // 1: Admin, 4: Pimpinan -> / (Dashboard)
        // 2: Petugas, 3: User -> /tickets
        if (roleId === 1 || roleId === 4) {
          navigate('/');
        } else {
          navigate('/tickets');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau password salah. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden font-sans">

      {/* ── Decorative orbs ── */}
      {/* Cyan orb — top left */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-18%', left: '-12%',
          width: '60%', height: '60%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.38) 0%, rgba(6,182,212,0.05) 65%)',
          filter: 'blur(90px)',
          opacity: 0.85,
        }}
      />
      {/* Blue orb — bottom right */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-18%', right: '-12%',
          width: '60%', height: '60%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.32) 0%, rgba(37,99,235,0.03) 65%)',
          filter: 'blur(90px)',
          opacity: 0.80,
        }}
      />
      {/* White translucent orb — center-right */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '25%', left: '38%',
          width: '46%', height: '46%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.60) 0%, transparent 68%)',
          filter: 'blur(80px)',
          opacity: 0.70,
        }}
      />

      {/* ── Hero / Brand panel — LEFT (desktop) ── */}
      <div className="hidden lg:flex lg:w-[45%] relative z-10 flex-col justify-between p-14 xl:p-18">
        <div>
          {/* Brand */}
          <div className="flex items-center mb-14">
            <BrandLogo size="md" className="mr-3" />
            <div>
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none block">SIHELP</span>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-0.5 block">by AntonyPutra</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-5">
            Helpdesk &amp;<br/>
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #2563EB, #06B6D4)' }}>
              Ticketing System
            </span>
          </h1>
          <p className="text-base text-slate-500 max-w-sm font-medium leading-relaxed">
            Kelola tiket layanan, pengguna, dan laporan secara terpusat. Cepat, terstruktur, dan cerdas dengan dukungan AI.
          </p>

          {/* Floating glass feature chips */}
          <div className="mt-10 flex flex-wrap gap-3">
            {[
              { label: 'Multi-Provider AI', delay: '0s' },
              { label: 'Real-time Tracking', delay: '0.8s' },
              { label: 'Audit Log', delay: '1.6s' },
              { label: 'Role-based Access', delay: '2.4s' },
            ].map(f => (
              <div
                key={f.label}
                className="glass-panel animate-float"
                style={{
                  animationDelay: f.delay,
                  borderRadius: '14px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#1D4ED8',
                  overflow: 'visible',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0,
                }}
              >
                <span style={{ color: '#06B6D4' }}>✓</span> {f.label}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} SIHELP &mdash; Internal Helpdesk Platform
        </p>
      </div>

      {/* ── Login Form — RIGHT ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 relative z-10">
        <div className="w-full max-w-[420px]">

          {/* Mobile brand */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <BrandLogo size="lg" className="mb-3" />
            <span className="text-xl font-bold text-slate-900">SIHELP</span>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-0.5">Helpdesk &amp; Ticketing System</span>
          </div>

          {/* ─── Frosted Glass Card ─── */}
          <div className="glass-panel-strong p-8 sm:p-10 animate-slide-up">
            <div className="mb-7 relative z-10">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Masuk ke Akun Anda</h2>
              <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
                Gunakan kredensial yang diberikan oleh administrator sistem.
              </p>
            </div>

            {/* Error alert */}
            {error && (
              <div className="relative z-10 flex items-start gap-2.5 mb-5 px-4 py-3 rounded-2xl text-sm font-medium text-red-700"
                style={{ background: 'rgba(254,226,226,0.75)', border: '1px solid rgba(252,165,165,0.50)', backdropFilter: 'blur(8px)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5 relative z-10" autoComplete="off">
              {/* Email */}
              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-2">Alamat Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="email@perusahaan.com"
                  className="glass-input w-full rounded-2xl px-4 py-3.5 text-sm text-slate-800"
                  style={{ fontFamily: 'inherit' }}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-2">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="glass-input w-full rounded-2xl px-4 py-3.5 text-sm text-slate-800"
                  style={{ fontFamily: 'inherit' }}
                />
              </div>

              {/* Actions */}
              <div className="pt-3 space-y-3">
                {/* Submit */}
                <button
                  id="login-submit"
                  type="submit"
                  disabled={loading}
                  className="glass-btn-primary w-full py-3.5 px-4 text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2.5">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Masuk...
                    </span>
                  ) : 'Masuk Sekarang'}
                </button>

                {/* Divider */}
                <div className="flex items-center py-1">
                  <div className="flex-grow h-px" style={{ background: 'rgba(148,163,184,0.35)' }} />
                  <span className="flex-shrink-0 mx-4 text-[11px] text-slate-400 font-bold uppercase tracking-widest">atau</span>
                  <div className="flex-grow h-px" style={{ background: 'rgba(148,163,184,0.35)' }} />
                </div>

                {/* OTP button */}
                <button
                  id="login-otp"
                  type="button"
                  onClick={() => navigate('/login/otp')}
                  className="glass-btn-secondary w-full py-3.5 px-4 text-sm text-blue-700"
                  style={{ color: '#1D4ED8' }}
                >
                  Login dengan OTP Email
                </button>
              </div>
            </form>
          </div>

          {/* Footer note */}
          <p className="text-center mt-6 text-xs font-medium" style={{ color: 'rgba(100,116,139,0.80)' }}>
            Belum punya akun? Hubungi administrator untuk pendaftaran.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
