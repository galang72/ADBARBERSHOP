import React, { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, CreditCard, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/format';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#dc2626', '#2563eb', '#16a34a', '#f59e0b', '#8b5cf6'];

// Validation constants
const MAX_DATE_RANGE_DAYS = 3650; // ~10 years
const MAX_FUTURE_DAYS = 0; // Cannot request future dates

const Reports = () => {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [validationWarning, setValidationWarning] = useState(null);

  // Validate dates whenever they change
  useEffect(() => {
    validateDates();
  }, [startDate, endDate]);

  const validateDates = () => {
    setValidationError(null);
    setValidationWarning(null);

    if (!startDate || !endDate) {
      setValidationError('Tanggal mulai dan tanggal akhir harus diisi');
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    // Check if start > end
    if (start > end) {
      setValidationError('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
      return false;
    }

    // Check if dates are in the future
    if (start > today) {
      setValidationError(`Tanggal mulai (${formatDate(startDate)}) belum dilewati. Tidak bisa melihat data masa depan.`);
      return false;
    }

    if (end > today) {
      setValidationError(`Tanggal akhir (${formatDate(endDate)}) belum dilewati. Tidak bisa melihat data masa depan.`);
      return false;
    }

    // Check date range
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays > MAX_DATE_RANGE_DAYS) {
      const years = Math.floor(diffDays / 365);
      setValidationError(
        `Rentang waktu terlalu lama (${diffDays} hari / ~${years} tahun). ` +
        `Maksimal ${MAX_DATE_RANGE_DAYS} hari (~10 tahun). Silakan perkecil rentang tanggal.`
      );
      return false;
    }

    // Warning for large date ranges (> 1 year)
    if (diffDays > 365) {
      setValidationWarning(
        `Rentang waktu cukup besar (${diffDays} hari). ` +
        `Proses mungkin memakan waktu lebih lama.`
      );
    }

    return true;
  };

  const fetchReport = async () => {
    if (!validateDates()) {
      return;
    }

    setLoading(true);
    setReport(null);
    try {
      const response = await api.get('/dashboard/sales-report', {
        params: { start_date: startDate, end_date: endDate },
      });
      setReport(response.data);
      
      const days = calculateDays();
      const totalTrans = response.data.summary?.total_transactions || 0;
      
      if (totalTrans === 0) {
        toast(`Tidak ada transaksi untuk periode ${days} hari ini`, { icon: 'ℹ️' });
      } else {
        toast.success(`Laporan berhasil dimuat (${days} hari, ${totalTrans} transaksi)`);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Gagal memuat laporan';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Quick date range buttons
  const setQuickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Filter */}
      <Card>
        <CardContent className="p-5">
          {/* Quick Range Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm text-secondary-500 self-center mr-2">Cepat:</span>
            <button
              onClick={() => setQuickRange(7)}
              className="px-3 py-1.5 text-sm bg-secondary-100 hover:bg-secondary-200 rounded-lg transition-colors"
            >
              7 Hari
            </button>
            <button
              onClick={() => setQuickRange(30)}
              className="px-3 py-1.5 text-sm bg-secondary-100 hover:bg-secondary-200 rounded-lg transition-colors"
            >
              30 Hari
            </button>
            <button
              onClick={() => setQuickRange(90)}
              className="px-3 py-1.5 text-sm bg-secondary-100 hover:bg-secondary-200 rounded-lg transition-colors"
            >
              3 Bulan
            </button>
            <button
              onClick={() => setQuickRange(365)}
              className="px-3 py-1.5 text-sm bg-secondary-100 hover:bg-secondary-200 rounded-lg transition-colors"
            >
              1 Tahun
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 ${
                  validationError ? 'border-red-300 focus:border-red-500' : 'border-secondary-300'
                }`}
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 ${
                  validationError ? 'border-red-300 focus:border-red-500' : 'border-secondary-300'
                }`}
              />
            </div>
            <Button 
              onClick={fetchReport} 
              loading={loading} 
              disabled={!!validationError || loading}
              className="w-full sm:w-auto"
            >
              Tampilkan
            </Button>
          </div>

          {/* Date Range Info */}
          {startDate && endDate && !validationError && (
            <div className="mt-3 text-sm text-secondary-500">
              Periode: <span className="font-medium">{formatDate(startDate)}</span> -{' '}
              <span className="font-medium">{formatDate(endDate)}</span>
              {' '}({calculateDays()} hari)
            </div>
          )}

          {/* Validation Error */}
          {validationError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Tidak dapat memuat laporan</p>
                <p className="text-sm text-red-600 mt-1">{validationError}</p>
              </div>
            </div>
          )}

          {/* Validation Warning */}
          {validationWarning && !validationError && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Perhatian</p>
                <p className="text-sm text-amber-600 mt-1">{validationWarning}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {report && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-secondary-500">Total Penjualan</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(report.summary?.total_sales || 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-secondary-500">Total Transaksi</p>
                <p className="text-2xl font-bold text-blue-600">
                  {report.summary?.total_transactions || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-secondary-500">Total Diskon</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(report.summary?.total_discounts || 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-secondary-500">Total Pajak</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(report.summary?.total_tax || 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          {report.daily_sales && report.daily_sales.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Penjualan Harian
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={report.daily_sales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(d) => new Date(d).getDate()}
                          tick={{fontSize: 12}}
                        />
                        <YAxis 
                          tickFormatter={(v) => v >= 1000000 ? `Rp${(v/1000000).toFixed(1)}M` : `Rp${(v/1000).toFixed(0)}K`}
                          tick={{fontSize: 12}}
                          width={60}
                        />
                        <Tooltip formatter={(v) => formatCurrency(v)} />
                        <Bar dataKey="sales" fill="#dc2626" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {report.payment_methods && report.payment_methods.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Metode Pembayaran
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={report.payment_methods}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ payment_method, percent }) => 
                              `${payment_method} ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="total"
                          >
                            {report.payment_methods.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => formatCurrency(v)} />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Daily Detail Table */}
          {report.daily_sales && report.daily_sales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Detail Harian</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-secondary-200">
                        <th className="text-left py-3 px-4">Tanggal</th>
                        <th className="text-right py-3 px-4">Transaksi</th>
                        <th className="text-right py-3 px-4">Subtotal</th>
                        <th className="text-right py-3 px-4">Diskon</th>
                        <th className="text-right py-3 px-4">Pajak</th>
                        <th className="text-right py-3 px-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.daily_sales.map((day) => (
                        <tr key={day.date} className="border-b border-secondary-100 hover:bg-secondary-50">
                          <td className="py-3 px-4">{formatDate(day.date)}</td>
                          <td className="text-right py-3 px-4">{day.transactions}</td>
                          <td className="text-right py-3 px-4">{formatCurrency(day.subtotal)}</td>
                          <td className="text-right py-3 px-4">{formatCurrency(day.discounts)}</td>
                          <td className="text-right py-3 px-4">{formatCurrency(day.tax)}</td>
                          <td className="text-right py-3 px-4 font-semibold">{formatCurrency(day.sales)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {(!report.daily_sales || report.daily_sales.length === 0) && (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-secondary-300" />
                <p className="text-secondary-500">Tidak ada data transaksi untuk periode ini</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
