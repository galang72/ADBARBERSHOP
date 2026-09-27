import React, { useState } from 'react';

import { Scissors, Mail, Loader2, CheckCircle } from 'lucide-react';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Masukkan email Anda');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/forgot-password', { email });
      setIsSent(true);
      toast.success(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengirim email reset';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Email Terkirim!
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Link reset password telah dikirim ke <strong>{email}</strong>. 
              Silakan cek inbox Anda.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-green-500/30"
            >
              Kembali ke Login
            </button>
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
              Lupa Password
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Masukkan email untuk reset password
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:bg-white transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md border border-indigo-700"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <span className="font-semibold">Mengirim...</span>
                </span>
              ) : (
                <span className="font-bold tracking-wide">KIRIM LINK RESET</span>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => window.location.href = '/login'}
              className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-lg transition-all border border-gray-300"
            >
              ← Kembali ke Login
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} BarberShop POS
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
