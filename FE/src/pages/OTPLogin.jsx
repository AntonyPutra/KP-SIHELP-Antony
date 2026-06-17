import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestOTP, verifyOTP, resendOTP } from '../services/authService';
import { setToken, getRoleId } from '../utils/auth';
import BrandLogo from '../components/ui/BrandLogo';

const OTPLogin = () => {
  const [step, setStep]                     = useState(1);
  const [email, setEmail]                   = useState('');
  const [otp, setOtp]                       = useState('');
  const [otpSessionToken, setOtpSessionToken] = useState('');
  const [error, setError]                   = useState('');
  const [success, setSuccess]               = useState('');
  const [loading, setLoading]               = useState(false);
  const [countdown, setCountdown]           = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let t;
    if (countdown > 0) t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleRequestOTP = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await requestOTP(email, 'login');
      if (res.success && res.data.otp_session_token) {
        setOtpSessionToken(res.data.otp_session_token);
        setStep(2); setCountdown(60);
        let msg = 'Kode OTP telah dikirim ke email Anda.';
        if (res.data.mock_otp) msg += ` (DEMO: ${res.data.mock_otp})`;
        setSuccess(msg);
      }
    } catch (err) { setError(err.response?.data?.message || 'Gagal mengirim OTP. Pastikan email sudah terdaftar.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await verifyOTP(otpSessionToken, otp, 'login');
      if (res.success && res.data.token) {
        setToken(res.data.token);
        const userData = res.data.user || {};
        localStorage.setItem('user', JSON.stringify(userData));
        const roleId = getRoleId(userData);
        if (roleId === 1 || roleId === 4) {
          navigate('/');
        } else {
          navigate('/tickets');
        }
      }
    } catch (err) { setError(err.response?.data?.message || 'Kode OTP tidak valid atau sudah kadaluarsa.'); }
    finally { setLoading(false); }
  };

  const handleResendOTP = async () => {
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await resendOTP(otpSessionToken, 'login');
      if (res.success && res.data.otp_session_token) {
        setOtpSessionToken(res.data.otp_session_token);
        setCountdown(60);
        let msg = 'Kode OTP baru telah dikirim.';
        if (res.data.mock_otp) msg += ` (DEMO: ${res.data.mock_otp})`;
        setSuccess(msg);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim ulang OTP.');
      if (err.response?.data?.data?.retry_after_seconds) setCountdown(err.response.data.data.retry_after_seconds);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden font-sans items-center justify-center p-6">

      {/* ── Decorative orbs ── */}
      <div className="absolute pointer-events-none"
        style={{ top: '-20%', left: '-14%', width: '58%', height: '58%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.36) 0%, rgba(6,182,212,0.04) 65%)',
          filter: 'blur(100px)', opacity: 0.80 }} />
      <div className="absolute pointer-events-none"
        style={{ bottom: '-20%', right: '-14%', width: '58%', height: '58%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.30) 0%, rgba(37,99,235,0.03) 65%)',
          filter: 'blur(100px)', opacity: 0.75 }} />
      <div className="absolute pointer-events-none"
        style={{ top: '30%', left: '30%', width: '45%', height: '45%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 68%)',
          filter: 'blur(80px)', opacity: 0.65 }} />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <BrandLogo size="lg" className="mb-3" />
          <span className="text-xl font-bold text-slate-900">SIHELP</span>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-0.5">Helpdesk &amp; Ticketing System</span>
        </div>

        {/* ─── Frosted Glass Card ─── */}
        <div className="glass-panel-strong p-8 sm:p-10 animate-slide-up">
          <div className="mb-6 relative z-10">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {step === 1 ? 'Login dengan OTP' : 'Verifikasi Kode OTP'}
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
              {step === 1
                ? <>OTP hanya dikirim ke email pengguna yang telah <strong className="text-slate-600">terdaftar</strong> di sistem.</>
                : <>Masukkan kode 6 digit yang dikirim ke <strong className="text-slate-700">{email}</strong>.</>}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="relative z-10 flex items-start gap-2.5 mb-5 px-4 py-3 rounded-2xl text-sm font-medium text-red-700"
              style={{ background: 'rgba(254,226,226,0.75)', border: '1px solid rgba(252,165,165,0.50)', backdropFilter: 'blur(8px)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              {error}
            </div>
          )}
          {success && (
            <div className="relative z-10 flex items-start gap-2.5 mb-5 px-4 py-3 rounded-2xl text-sm font-medium text-emerald-700"
              style={{ background: 'rgba(209,250,229,0.75)', border: '1px solid rgba(110,231,183,0.50)', backdropFilter: 'blur(8px)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              {success}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-5 relative z-10" autoComplete="off">
              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-2">Alamat Email Terdaftar</label>
                <input id="otp-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="email@perusahaan.com"
                  className="glass-input w-full rounded-2xl px-4 py-3.5 text-sm text-slate-800"
                  style={{ fontFamily: 'inherit' }} />
              </div>
              <div className="pt-3 space-y-3">
                <button id="otp-send" type="submit" disabled={loading} className="glass-btn-primary w-full py-3.5 px-4 text-sm">
                  {loading ? <span className="flex items-center justify-center gap-2"><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Mengirim...</span> : 'Kirim Kode OTP'}
                </button>
                <button id="otp-back" type="button" onClick={() => navigate('/login')}
                  className="glass-btn-secondary w-full py-3.5 px-4 text-sm" style={{ color: '#475569' }}>
                  Kembali ke Login Password
                </button>
              </div>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5 relative z-10" autoComplete="off">
              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-2 text-center">Kode OTP (6 digit)</label>
                <input id="otp-code" type="text" inputMode="numeric"
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                  required maxLength={6} placeholder="• • • • • •"
                  className="glass-input w-full rounded-2xl px-4 py-5 text-slate-800 text-center font-black"
                  style={{ fontSize: '24px', letterSpacing: '0.65em', fontFamily: 'inherit' }} />
                <p className="text-xs text-slate-400 text-center mt-2.5 font-medium">
                  Kode berlaku 10 menit. Jangan bagikan kepada siapapun.
                </p>
              </div>
              <div className="pt-2 space-y-3">
                <button id="otp-verify" type="submit" disabled={loading || otp.length < 6}
                  className="glass-btn-primary w-full py-3.5 px-4 text-sm">
                  {loading ? <span className="flex items-center justify-center gap-2"><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Memverifikasi...</span> : 'Verifikasi & Masuk'}
                </button>
                <div className="flex items-center justify-between text-sm pt-1">
                  <button type="button" onClick={handleResendOTP} disabled={countdown > 0 || loading}
                    className="font-semibold transition-colors"
                    style={{ color: countdown > 0 ? 'rgba(100,116,139,0.5)' : '#2563EB', cursor: countdown > 0 ? 'not-allowed' : 'pointer' }}>
                    {countdown > 0 ? `Kirim ulang dalam ${countdown}s` : 'Kirim Ulang Kode'}
                  </button>
                  <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); setSuccess(''); }}
                    className="font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                    Ganti Email
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-xs font-medium" style={{ color: 'rgba(100,116,139,0.80)' }}>
          Belum punya akun? Hubungi administrator untuk pendaftaran.
        </p>
      </div>
    </div>
  );
};

export default OTPLogin;
