import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  const goToForgotPassword = (e) => {
    e.preventDefault();
    window.location.href = '/forgot-password';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-100 via-white to-primary-50 px-4">
      <div className="w-full max-w-sm">
        {/* Card dengan tema Tritama */}
        <div className="bg-white rounded-2xl shadow-xl border border-secondary-200 p-8 relative overflow-hidden">
          {/* Decorative accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-800 via-secondary-600 to-primary-800"></div>
          
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            {!logoError ? (
              <div className="w-32 h-32 flex items-center justify-center mb-4 overflow-hidden">
                <img 
                  src="/assets/logo.png" 
                  alt="Tritama Barber"
                  className="w-full h-full object-cover object-center transform scale-[1.8] drop-shadow-2xl"
                  onError={() => setLogoError(true)}
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-primary-800 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <span className="text-white font-bold text-3xl">TB</span>
              </div>
            )}
            <h1 className="text-2xl font-bold text-accent-900 tracking-wide">
              TRITAMA BARBER
            </h1>
            <p className="text-sm text-accent-500 mt-1.5">Sistem Manajemen Barbershop</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-accent-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-10 pr-4 py-3 bg-cream-50 border border-secondary-200 rounded-xl text-accent-900 placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-primary-800/20 focus:border-primary-800 transition-all"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-accent-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 bg-cream-50 border border-secondary-200 rounded-xl text-accent-900 placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-primary-800/20 focus:border-primary-800 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-400 hover:text-primary-800 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-primary-800 to-primary-900 hover:from-primary-900 hover:to-primary-950 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-800/25 hover:shadow-xl hover:shadow-primary-800/30 active:scale-[0.98]"
            >
              {isLoading ? 'Loading...' : 'Masuk'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={goToForgotPassword}
                className="text-sm text-primary-800 hover:text-primary-900 font-semibold bg-transparent border-0 cursor-pointer hover:underline"
              >
                Lupa Password?
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-accent-400 mt-6">
          &copy; {new Date().getFullYear()} Tritama Barber. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
