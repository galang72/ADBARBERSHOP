import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Wallet,
  Download,
  X,
  Calendar,
  TrendingUp,
  Users,
  Scissors,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Input from '../components/Input';
import Select from '../components/Select';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/format';

const SalarySlips = () => {
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barbers, setBarbers] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    barber_id: '',
    status: '',
  });
  const [stats, setStats] = useState({
    total_slips: 0,
    total_paid: 0,
    total_pending: 0,
  });

  // Form states
  const [generateForm, setGenerateForm] = useState({
    barber_id: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [editForm, setEditForm] = useState({
    base_salary: 0,
    bonus: 0,
    overtime: 0,
    deduction_late: 0,
    deduction_absence: 0,
    deduction_other: 0,
    deduction_note: '',
    note: '',
  });

  useEffect(() => {
    fetchBarbers();
    fetchYears();
    fetchSlips();
    fetchStats();
  }, [filters]);

  const fetchBarbers = async () => {
    try {
      const response = await api.get('/barbers');
      setBarbers(response.data);
    } catch (error) {
      console.error('Error fetching barbers:', error);
    }
  };

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
      if (filters.month) params.append('month', filters.month);
      if (filters.barber_id) params.append('barber_id', filters.barber_id);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/salary-slips?${params.toString()}`);
      setSlips(response.data.data || []);
    } catch (error) {
      toast.error('Gagal memuat slip gaji');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/salary-slips/statistics?year=${filters.year}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/salary-slips/generate', generateForm);
      toast.success('Slip gaji berhasil dibuat');
      setShowGenerateModal(false);
      fetchSlips();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuat slip gaji');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/salary-slips/${id}/approve`);
      toast.success('Slip gaji disetujui');
      fetchSlips();
    } catch (error) {
      toast.error('Gagal menyetujui slip gaji');
    }
  };

  const handlePay = async (id) => {
    try {
      await api.post(`/salary-slips/${id}/pay`);
      toast.success('Slip gaji ditandai sebagai dibayar');
      fetchSlips();
      fetchStats();
    } catch (error) {
      toast.error('Gagal memproses pembayaran');
    }
  };

  const handleViewDetail = async (slip) => {
    try {
      const response = await api.get(`/salary-slips/${slip.id}`);
      setSelectedSlip(response.data);
      setEditForm({
        base_salary: response.data.base_salary,
        bonus: response.data.bonus,
        overtime: response.data.overtime,
        deduction_late: response.data.deduction_late,
        deduction_absence: response.data.deduction_absence,
        deduction_other: response.data.deduction_other,
        deduction_note: response.data.deduction_note || '',
        note: response.data.note || '',
      });
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Gagal memuat detail slip gaji');
    }
  };

  const handleDownloadPdf = async (slipId) => {
    try {
      toast.loading('Mengunduh PDF...', { id: 'download-pdf' });
      
      const response = await api.get(`/salary-slips/${slipId}/pdf`, {
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/salary-slips/${selectedSlip.id}`, editForm);
      toast.success('Slip gaji berhasil diupdate');
      setShowEditModal(false);
      fetchSlips();
    } catch (error) {
      toast.error('Gagal mengupdate slip gaji');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus slip gaji ini?')) return;
    try {
      await api.delete(`/salary-slips/${id}`);
      toast.success('Slip gaji dihapus');
      fetchSlips();
      fetchStats();
    } catch (error) {
      toast.error('Gagal menghapus slip gaji');
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

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Manajemen Slip Gaji</h2>
          <p className="text-secondary-500">Kelola dan proses slip gaji barber</p>
        </div>
        <Button onClick={() => setShowGenerateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Buat Slip Gaji
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-500">Total Slip</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500">
              <FileTextIcon className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary-900">{stats.total_slips}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-500">Total Dibayar</CardTitle>
            <div className="p-2 rounded-lg bg-green-500">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary-900">{formatCurrency(stats.total_paid)}</div>
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
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Tahun"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              options={years.map(y => ({ value: y, label: y }))}
            />
            <Select
              label="Bulan"
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              options={monthNames.map((m, i) => ({ value: i + 1, label: m }))}
            />
            <Select
              label="Barber"
              value={filters.barber_id}
              onChange={(e) => setFilters({ ...filters, barber_id: e.target.value })}
              options={[{ value: '', label: 'Semua Barber' }, ...barbers.map(b => ({ value: b.id, label: b.name }))]}
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

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Periode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Barber</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-secondary-500 uppercase">Gaji Pokok</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-secondary-500 uppercase">Komisi</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-secondary-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-secondary-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-secondary-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-secondary-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : slips.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-secondary-500">
                      Tidak ada data slip gaji
                    </td>
                  </tr>
                ) : (
                  slips.map((slip) => (
                    <tr key={slip.id} className="hover:bg-secondary-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-secondary-900">{slip.period_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-secondary-900">{slip.barber?.name}</p>
                      </td>
                      <td className="px-4 py-3 text-right">{formatCurrency(slip.base_salary)}</td>
                      <td className="px-4 py-3 text-right text-primary-600">+{formatCurrency(slip.commission_total)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(slip.net_salary)}</td>
                      <td className="px-4 py-3 text-center">{getStatusBadge(slip.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(slip)}
                            className="p-2 hover:bg-secondary-100 rounded-lg text-secondary-600"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {slip.status === 'draft' && (
                            <button
                              onClick={() => handleApprove(slip.id)}
                              className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                              title="Setujui"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {slip.status !== 'paid' && (
                            <button
                              onClick={() => handlePay(slip.id)}
                              className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                              title="Tandai Dibayar"
                            >
                              <Wallet className="h-4 w-4" />
                            </button>
                          )}
                          {slip.status === 'draft' && (
                            <button
                              onClick={() => handleDelete(slip.id)}
                              className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                              title="Hapus"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-secondary-900">Buat Slip Gaji</h3>
              <button onClick={() => setShowGenerateModal(false)} className="p-2 hover:bg-secondary-100 rounded-lg">
                <X className="h-5 w-5 text-secondary-500" />
              </button>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <Select
                label="Barber"
                value={generateForm.barber_id}
                onChange={(e) => setGenerateForm({ ...generateForm, barber_id: e.target.value })}
                options={[{ value: '', label: 'Pilih Barber' }, ...barbers.map(b => ({ value: b.id, label: b.name }))]}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Tahun"
                  value={generateForm.year}
                  onChange={(e) => setGenerateForm({ ...generateForm, year: parseInt(e.target.value) })}
                  options={years.map(y => ({ value: y, label: y }))}
                  required
                />
                <Select
                  label="Bulan"
                  value={generateForm.month}
                  onChange={(e) => setGenerateForm({ ...generateForm, month: parseInt(e.target.value) })}
                  options={monthNames.map((m, i) => ({ value: i + 1, label: m }))}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowGenerateModal(false)}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1">
                  Buat Slip
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSlip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-secondary-900">Detail Slip Gaji</h3>
                <p className="text-sm text-secondary-500">{selectedSlip.period_name} • {selectedSlip.barber?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPdf(selectedSlip.id)}
                  className="px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </button>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-3 py-2 text-sm bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100"
                >
                  Edit
                </button>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-secondary-100 rounded-lg">
                  <X className="h-5 w-5 text-secondary-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <span className="text-secondary-600">Status</span>
                {getStatusBadge(selectedSlip.status)}
              </div>

              {/* Income Details */}
              <div>
                <h4 className="text-sm font-semibold text-secondary-900 uppercase tracking-wider mb-3">Rincian Pendapatan</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2">
                    <span className="text-secondary-600">Gaji Pokok</span>
                    <span className="font-medium">{formatCurrency(selectedSlip.base_salary)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-secondary-600">Komisi</span>
                    <span className="font-medium text-primary-600">+{formatCurrency(selectedSlip.commission_total)}</span>
                  </div>
                  {selectedSlip.bonus > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-secondary-600">Bonus</span>
                      <span className="font-medium text-green-600">+{formatCurrency(selectedSlip.bonus)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Pendapatan</span>
                    <span>{formatCurrency(selectedSlip.total_income)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              {selectedSlip.total_deduction > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-secondary-900 uppercase tracking-wider mb-3">Potongan</h4>
                  <div className="space-y-2 text-sm">
                    {selectedSlip.deduction_late > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-secondary-600">Keterlambatan</span>
                        <span className="font-medium text-red-600">-{formatCurrency(selectedSlip.deduction_late)}</span>
                      </div>
                    )}
                    {selectedSlip.deduction_note && (
                      <p className="text-xs text-secondary-500 italic">{selectedSlip.deduction_note}</p>
                    )}
                    <div className="border-t pt-2 flex justify-between font-semibold text-red-600">
                      <span>Total Potongan</span>
                      <span>-{formatCurrency(selectedSlip.total_deduction)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Net Salary */}
              <div className="bg-primary-50 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-primary-800 font-medium">Gaji Bersih</span>
                  <span className="text-2xl font-bold text-primary-700">{formatCurrency(selectedSlip.net_salary)}</span>
                </div>
              </div>

              {/* Performance */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-secondary-50 rounded-lg">
                  <p className="text-2xl font-bold text-secondary-900">{selectedSlip.total_customers}</p>
                  <p className="text-xs text-secondary-500">Pelanggan</p>
                </div>
                <div className="p-3 bg-secondary-50 rounded-lg">
                  <p className="text-2xl font-bold text-secondary-900">{selectedSlip.total_services}</p>
                  <p className="text-xs text-secondary-500">Layanan</p>
                </div>
                <div className="p-3 bg-secondary-50 rounded-lg">
                  <p className="text-xl font-bold text-secondary-900">{formatCurrency(selectedSlip.total_transaction_amount)}</p>
                  <p className="text-xs text-secondary-500">Penjualan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSlip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-secondary-900">Edit Slip Gaji</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-secondary-100 rounded-lg">
                <X className="h-5 w-5 text-secondary-500" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <Input
                label="Gaji Pokok"
                type="number"
                value={editForm.base_salary}
                onChange={(e) => setEditForm({ ...editForm, base_salary: parseFloat(e.target.value) })}
              />
              <Input
                label="Bonus"
                type="number"
                value={editForm.bonus}
                onChange={(e) => setEditForm({ ...editForm, bonus: parseFloat(e.target.value) })}
              />
              <Input
                label="Lembur"
                type="number"
                value={editForm.overtime}
                onChange={(e) => setEditForm({ ...editForm, overtime: parseFloat(e.target.value) })}
              />
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-secondary-900 mb-3">Potongan</h4>
                <Input
                  label="Keterlambatan"
                  type="number"
                  value={editForm.deduction_late}
                  onChange={(e) => setEditForm({ ...editForm, deduction_late: parseFloat(e.target.value) })}
                />
                <Input
                  label="Ketidakhadiran"
                  type="number"
                  value={editForm.deduction_absence}
                  onChange={(e) => setEditForm({ ...editForm, deduction_absence: parseFloat(e.target.value) })}
                />
                <Input
                  label="Lainnya"
                  type="number"
                  value={editForm.deduction_other}
                  onChange={(e) => setEditForm({ ...editForm, deduction_other: parseFloat(e.target.value) })}
                />
                <Input
                  label="Keterangan Potongan"
                  value={editForm.deduction_note}
                  onChange={(e) => setEditForm({ ...editForm, deduction_note: e.target.value })}
                />
              </div>
              <Input
                label="Catatan"
                value={editForm.note}
                onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
              />
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1">
                  Simpan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Icon helper
const FileTextIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default SalarySlips;
