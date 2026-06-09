import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestOTP, verifyOTP, resendOTP } from '../services/authService';
import { setToken } from '../utils/auth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import BrandLogo from '../components/ui/BrandLogo';

const OTPLogin = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSessionToken, setOtpSessionToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await requestOTP(email, 'login');
      if (res.success && res.data.otp_session_token) {
        setOtpSessionToken(res.data.otp_session_token);
        setStep(2);
        setCountdown(60);
        setSuccess('OTP telah dikirim ke email Anda.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await verifyOTP(otpSessionToken, otp, 'login');
      if (res.success && res.data.token) {
        setToken(res.data.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP tidak valid');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await resendOTP(otpSessionToken, 'login');
      if (res.success && res.data.otp_session_token) {
        setOtpSessionToken(res.data.otp_session_token);
        setCountdown(60);
        setSuccess('OTP baru telah dikirim ke email Anda.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim ulang OTP');
      if (err.response?.data?.data?.retry_after_seconds) {
        setCountdown(err.response.data.data.retry_after_seconds);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 relative overflow-hidden font-sans">
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 relative">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-10">
            <BrandLogo size="lg" className="mb-4 shadow-md" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SIHELP by AntonyPutra</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/70 p-8 sm:p-10 relative overflow-hidden backdrop-blur">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Login dengan OTP</h2>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                {step === 1 ? 'Masukkan email Anda untuk menerima kode OTP.' : 'Masukkan 6 digit kode OTP yang dikirim ke email Anda.'}
              </p>
            </div>
            
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center">
                <span className="mr-2">⚠️</span> {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center">
                <span className="mr-2">✅</span> {success}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleRequestOTP} className="space-y-5" autoComplete="off">
                <Input 
                  label="Alamat Email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="Masukkan email Anda"
                />
                
                <div className="pt-4 space-y-4">
                  <Button type="submit" size="lg" className="w-full text-base font-semibold shadow-sm hover:shadow-md transition-all duration-200" disabled={loading}>
                    {loading ? 'Mengirim...' : 'Kirim OTP'}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                    >
                      Kembali ke Login Password
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-5" autoComplete="off">
                <Input 
                  label="Kode OTP" 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  required 
                  placeholder="Masukkan 6 digit OTP"
                  maxLength={6}
                />
                
                <div className="pt-4 space-y-4">
                  <Button type="submit" size="lg" className="w-full text-base font-semibold shadow-sm hover:shadow-md transition-all duration-200" disabled={loading}>
                    {loading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
                  </Button>
                  
                  <div className="text-center mt-4 flex flex-col items-center space-y-2">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={countdown > 0 || loading}
                      className={`text-sm font-medium transition-colors ${
                        countdown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      {countdown > 0 ? `Kirim ulang dalam ${countdown}s` : 'Kirim Ulang OTP'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setOtp('');
                        setError('');
                        setSuccess('');
                      }}
                      className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors mt-2"
                    >
                      Ganti Email
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
          
          <div className="text-center mt-8 text-sm text-slate-500">
            &copy; 2026 Antony Putra
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPLogin;
