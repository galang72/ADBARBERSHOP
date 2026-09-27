import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Scissors, Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../utils/axios';
import toast from 'react-hot-toast';

// Password strength indicator
const PasswordStrength = ({ password }) => {
  const getStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);
  const levels = [
    { label: 'Lemah', color: 'bg-red-500', width: '25%' },
    { label: 'Sedang', color: 'bg-yellow-500', width: '50%' },
    { label: 'Kuat', color: 'bg-blue-500', width: '75%' },
    { label: 'Sangat Kuat', color: 'bg-green-500', width: '100%' },
  ];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${levels[strength - 1]?.color || 'bg-gray-300'} transition-all duration-300`}
          style={{ width: levels[strength - 1]?.width || '0%' }}
        />
      </div>
      <p className={`text-xs mt-1 ${strength >= 3 ? 'text-green-600' : strength >= 2 ? 'text-blue-600' : strength >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
        {levels[strength - 1]?.label || 'Terlalu pendek'} {password.length < 6 && '(min 6 karakter)'}
      </p>
    </div>
  );
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setIsValidToken(false);
      toast.error('Link reset password tidak valid');
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setIsSuccess(true);
      toast.success(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal reset password';
      toast.error(message);
      if (error.response?.status === 400) {
        setIsValidToken(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Link Tidak Valid
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Link reset password sudah kadaluarsa atau tidak valid.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-base rounded-lg transition-all shadow-md border border-amber-600 text-center"
            >
              <span className="font-bold tracking-wide">MINTA LINK BARU</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Password Berhasil Direset!
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Password Anda telah berhasil diubah. Silakan login dengan password baru.
            </p>
            <Link
              to="/login"
              className="inline-block w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold text-base rounded-lg transition-all shadow-md border border-green-700 text-center"
            >
              <span className="font-bold tracking-wide">LOGIN SEKARANG</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center mb-4">
              <Scissors className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
              Reset Password
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Buat password baru untuk {email}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password Baru"
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border-0 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:bg-white transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Konfirmasi Password"
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border-0 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:bg-white transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md border border-indigo-700"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <span className="font-semibold">Menyimpan...</span>
                </span>
              ) : (
                <span className="font-bold tracking-wide">RESET PASSWORD</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} BarberShop POS
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
