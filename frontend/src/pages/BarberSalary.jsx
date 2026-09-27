import React, { useEffect, useState } from 'react';
import {
  Wallet,
  FileText,
  Download,
  ChevronRight,
  TrendingUp,
  Calendar,
  DollarSign,
  X,
  Eye,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/format';

const BarberSalary = () => {
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [years, setYears] = useState([]);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    status: '',
  });
  const [stats, setStats] = useState({
    total_slips: 0,
    total_paid: 0,
    total_pending: 0,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchYears();
    fetchSlips();
    fetchStats();
  }, [filters]);

  const fetchYears = async () => {
    try {
      const response = await api.get('/salary-slips/available-years');
      setYears(response.data);
    } catch (error) {
      console.error('Error fetching years:', error);
    }
  };

  const fetchSlips = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.year) params.append('year', filters.year);
      if (filters.status) params.append('status', filters.status);
      params.append('per_page', '50');

      const response = await api.get(`/my-salary-slips?${params.toString()}`);
      setSlips(response.data.data || []);
    } catch (error) {
      toast.error('Gagal memuat slip gaji');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/my-salary-statistics?year=${filters.year}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewDetail = async (slipId) => {
    try {
      const response = await api.get(`/my-salary-slips/${slipId}`);
      setSelectedSlip(response.data);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Gagal memuat detail slip gaji');
    }
  };

  const handleDownloadPdf = async (slipId) => {
    try {
      toast.loading('Mengunduh PDF...', { id: 'download-pdf' });
      
      const response = await api.get(`/my-salary-slips/${slipId}/pdf`, {
        responseType: 'blob',
      });
      
      // Create blob URL and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'slip-gaji.pdf';
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="(.+)"/);
        if (matches) {
          filename = matches[1];
        }
      }
      
      // Create temporary link and click
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF berhasil diunduh', { id: 'download-pdf' });
    } catch (error) {
      toast.error('Gagal mengunduh PDF', { id: 'download-pdf' });
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      approved: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
    };
    const labels = {
      draft: 'Draft',
      approved: 'Disetujui',
      paid: 'Dibayar',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Slip Gaji</h2>
          <p className="text-secondary-500">Lihat history dan detail slip gaji Anda</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-500">Total Slip</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary-900">{stats.total_slips}</div>
            <p className="text-xs text-secondary-500 mt-1">Tahun {stats.year}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-500">Total Diterima</CardTitle>
            <div className="p-2 rounded-lg bg-green-500">
              <Wallet className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary-900">{formatCurrency(stats.total_paid)}</div>
            <p className="text-xs text-secondary-500 mt-1">Status Dibayar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-500">Menunggu</CardTitle>
            <div className="p-2 rounded-lg bg-yellow-500">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary-900">{formatCurrency(stats.total_pending)}</div>
            <p className="text-xs text-secondary-500 mt-1">Draft & Disetujui</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tahun"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              options={years.length > 0 ? years.map(y => ({ value: y, label: y })) : [{ value: new Date().getFullYear(), label: new Date().getFullYear() }]}
            />
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[
                { value: '', label: 'Semua Status' },
                { value: 'draft', label: 'Draft' },
                { value: 'approved', label: 'Disetujui' },
                { value: 'paid', label: 'Dibayar' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Salary Slips List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            Riwayat Slip Gaji
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : slips.length === 0 ? (
            <div className="text-center py-12 text-secondary-500">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Belum ada slip gaji</p>
              <p className="text-sm mt-1">Slip gaji akan muncul setelah admin memprosesnya</p>
            </div>
          ) : (
            <div className="space-y-3">
              {slips.map((slip) => (
                <div
                  key={slip.id}
                  onClick={() => handleViewDetail(slip.id)}
                  className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg cursor-pointer hover:bg-secondary-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-secondary-900">{slip.period_name}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-secondary-500">
                        <span>{slip.total_customers} pelanggan</span>
                        <span>•</span>
                        <span>{slip.total_services} layanan</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-secondary-900">{formatCurrency(slip.net_salary)}</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      {getStatusBadge(slip.status)}
                      <ChevronRight className="h-4 w-4 text-secondary-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedSlip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-secondary-900">Slip Gaji</h3>
                <p className="text-sm text-secondary-500">{selectedSlip.period_name}</p>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-secondary-100 rounded-lg"
              >
                <X className="h-5 w-5 text-secondary-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <span className="text-secondary-600 font-medium">Status</span>
                {getStatusBadge(selectedSlip.status)}
              </div>

              {/* Income Details */}
              <div className="bg-white border rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-green-50 border-b">
                  <h4 className="font-semibold text-green-800 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Rincian Pendapatan
                  </h4>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between py-2">
                    <span className="text-secondary-600">Gaji Pokok</span>
                    <span className="font-medium">{formatCurrency(selectedSlip.base_salary)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-secondary-600">Komisi</span>
                    <span className="font-medium text-green-600">+{formatCurrency(selectedSlip.commission_total)}</span>
                  </div>
                  {selectedSlip.bonus > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-secondary-600">Bonus</span>
                      <span className="font-medium text-green-600">+{formatCurrency(selectedSlip.bonus)}</span>
                    </div>
                  )}
                  {selectedSlip.overtime > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-secondary-600">Lembur</span>
                      <span className="font-medium text-green-600">+{formatCurrency(selectedSlip.overtime)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                    <span>Total Pendapatan</span>
                    <span className="text-green-600">{formatCurrency(selectedSlip.total_income)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              {selectedSlip.total_deduction > 0 && (
                <div className="bg-white border rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-red-50 border-b">
                    <h4 className="font-semibold text-red-800">Potongan</h4>
                  </div>
                  <div className="p-4 space-y-3">
                    {selectedSlip.deduction_late > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-secondary-600">Keterlambatan</span>
                        <span className="font-medium text-red-600">-{formatCurrency(selectedSlip.deduction_late)}</span>
                      </div>
                    )}
                    {selectedSlip.deduction_absence > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-secondary-600">Ketidakhadiran</span>
                        <span className="font-medium text-red-600">-{formatCurrency(selectedSlip.deduction_absence)}</span>
                      </div>
                    )}
                    {selectedSlip.deduction_other > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-secondary-600">Lainnya</span>
                        <span className="font-medium text-red-600">-{formatCurrency(selectedSlip.deduction_other)}</span>
                      </div>
                    )}
                    {selectedSlip.deduction_note && (
                      <p className="text-sm text-secondary-500 italic bg-secondary-50 p-2 rounded">{selectedSlip.deduction_note}</p>
                    )}
                    <div className="border-t pt-3 flex justify-between font-semibold text-red-600">
                      <span>Total Potongan</span>
                      <span>-{formatCurrency(selectedSlip.total_deduction)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Net Salary */}
              <div className="bg-primary-50 border-2 border-primary-200 p-6 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-primary-700 font-medium">Gaji Bersih (Take Home)</p>
                    <p className="text-sm text-primary-500">Total yang diterima</p>
                  </div>
                  <span className="text-3xl font-bold text-primary-700">{formatCurrency(selectedSlip.net_salary)}</span>
                </div>
              </div>

              {/* Performance Stats */}
              <div>
                <h4 className="font-semibold text-secondary-900 mb-3">Performa Bulan Ini</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-secondary-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-secondary-900">{selectedSlip.total_customers}</p>
                    <p className="text-xs text-secondary-500">Pelanggan</p>
                  </div>
                  <div className="p-4 bg-secondary-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-secondary-900">{selectedSlip.total_services}</p>
                    <p className="text-xs text-secondary-500">Layanan</p>
                  </div>
                  <div className="p-4 bg-secondary-50 rounded-xl text-center">
                    <p className="text-lg font-bold text-secondary-900">{formatCurrency(selectedSlip.total_transaction_amount)}</p>
                    <p className="text-xs text-secondary-500">Penjualan</p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              {selectedSlip.status === 'paid' && selectedSlip.paid_at && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-green-700 font-medium">✓ Dibayarkan</p>
                  <p className="text-sm text-green-600">
                    {formatDate(selectedSlip.paid_at)}
                    {selectedSlip.paid_by && ` oleh ${selectedSlip.paid_by}`}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedSlip.note && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium mb-1">Catatan:</p>
                  <p className="text-sm text-yellow-700">{selectedSlip.note}</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleDownloadPdf(selectedSlip.id)}
              >
                <Download className="h-4 w-4 mr-2" />
                Unduh PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarberSalary;
