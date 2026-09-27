import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import api from '../utils/axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !email) {
        setStatus('error');
        setMessage('Link verifikasi tidak valid atau sudah kadaluarsa.');
        return;
      }

      try {
        const response = await api.post('/verify-email', { token, email });
        // Sukses - baik baru diverifikasi maupun sudah diverifikasi sebelumnya
        setStatus('success');
        if (response.data.already_verified) {
          setMessage('Email Anda sudah terverifikasi sebelumnya. Silakan login.');
        } else {
          setMessage(response.data.message || 'Email berhasil diverifikasi!');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Gagal memverifikasi email.');
      }
    };

    verifyEmail();
  }, [token, email]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center py-8">
            <Loader2 className="h-16 w-16 text-primary-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">
              Memverifikasi Email...
            </h2>
            <p className="text-secondary-600">
              Mohon tunggu sebentar, kami sedang memverifikasi email Anda.
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">
              Verifikasi Berhasil!
            </h2>
            <p className="text-secondary-600 mb-6">{message}</p>
            <p className="text-sm text-secondary-500 mb-6">
              Email Anda telah berhasil diverifikasi. Sekarang Anda dapat login ke aplikasi.
            </p>
            <Button onClick={() => navigate('/login')}>
              Login Sekarang
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">
              Verifikasi Gagal
            </h2>
            <p className="text-secondary-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/login')}>
                Ke Halaman Login
              </Button>
              <div>
                <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700">
                  Sudah punya akun? Login disini
                </Link>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-900">BarberShop POS</h1>
          <p className="text-secondary-500">Verifikasi Email</p>
        </div>

        <Card>
          <CardContent className="p-6">
            {renderContent()}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-secondary-400 mt-8">
          © {new Date().getFullYear()} BarberShop POS. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
