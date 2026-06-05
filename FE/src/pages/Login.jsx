import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { setToken } from '../utils/auth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import BrandLogo from '../components/ui/BrandLogo';
import { CheckCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success && res.data.token) {
        setToken(res.data.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 relative overflow-hidden font-sans">
      
      {/* Left Column - Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col w-1/2 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-slate-900 z-0"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl z-0"></div>
        <div className="absolute top-1/4 -right-32 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl z-0"></div>
        
        <div className="relative z-10 flex flex-col justify-between h-full p-16">
          <div className="flex items-center space-x-3">
            <BrandLogo size="lg" />
            <div className="flex flex-col">
              <span className="text-white font-bold text-2xl leading-none tracking-tight">AntonyPutra</span>
              <span className="text-blue-400 text-xs uppercase tracking-widest font-bold mt-1">Workspace</span>
            </div>
          </div>

          <div className="my-auto max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Sistem Informasi Helpdesk & Ticketing Layanan
            </h1>
            <p className="text-slate-400 text-lg mb-12">
              Kelola dan pantau tiket layanan secara terpusat dengan antarmuka yang modern, cepat, dan terstruktur.
            </p>

            <div className="space-y-4">
              <div className="flex items-center text-slate-300">
                <CheckCircle className="w-5 h-5 text-blue-400 mr-3 shrink-0" />
                <span>Pelacakan tiket secara real-time</span>
              </div>
              <div className="flex items-center text-slate-300">
                <CheckCircle className="w-5 h-5 text-blue-400 mr-3 shrink-0" />
                <span>Manajemen pengguna dan hak akses</span>
              </div>
              <div className="flex items-center text-slate-300">
                <CheckCircle className="w-5 h-5 text-blue-400 mr-3 shrink-0" />
                <span>Laporan dan metrik komprehensif</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-500">
            &copy; 2026 Antony Putra. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 relative">
        <div className="w-full max-w-md">
          {/* Mobile Logo Header */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <BrandLogo size="lg" className="mb-4 shadow-md" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SIHELP by AntonyPutra</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/70 p-8 sm:p-10 relative overflow-hidden backdrop-blur">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Masuk ke Akun</h2>
              <p className="text-sm text-slate-500 mt-2 font-medium">Silakan login untuk mengakses dashboard.</p>
            </div>
            
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center">
                <span className="mr-2">⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
              <Input 
                label="Alamat Email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="Masukkan email Anda"
                autoComplete="off"
              />
              <Input 
                label="Password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="Masukkan password Anda"
                autoComplete="new-password"
              />
              
              <div className="pt-4">
                <Button type="submit" size="lg" className="w-full text-base font-semibold shadow-sm hover:shadow-md transition-all duration-200" disabled={loading}>
                  {loading ? 'Memproses...' : 'Masuk Sekarang'}
                </Button>
              </div>
            </form>
          </div>
          
          <div className="lg:hidden text-center mt-8 text-sm text-slate-500">
            &copy; 2026 Antony Putra
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
