import React, { useEffect, useState } from 'react';
import {
  Scissors,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Calendar,
  TrendingUp,
  Star,
  ArrowRight,
  RefreshCw,
  FileText,
  Download,
  Wallet,
  ChevronRight,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { formatCurrency, formatTime, formatDate } from '../utils/format';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-secondary-500">{title}</CardTitle>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-secondary-900">{value}</div>
      {subtitle && <div className="text-xs text-secondary-500 mt-1">{subtitle}</div>}
    </CardContent>
  </Card>
);

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

const BarberDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salarySlips, setSalarySlips] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchSalarySlips();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/barbers/dashboard');
      setData(response.data);
    } catch (error) {
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalarySlips = async () => {
    try {
      const response = await api.get('/my-salary-slips?per_page=6');
      setSalarySlips(response.data.data || []);
    } catch (error) {
      console.error('Error fetching salary slips:', error);
    }
  };

  const handleViewSlip = async (slipId) => {
    try {
      const response = await api.get(`/my-salary-slips/${slipId}`);
      setSelectedSlip(response.data);
      setShowSlipModal(true);
    } catch (error) {
      toast.error('Gagal memuat slip gaji');
    }
  };

  const handleStartService = async (queueId) => {
    try {
      await api.put(`/queues/${queueId}/status`, { status: 'in_progress' });
      toast.success('Pengerjaan dimulai');
      fetchDashboardData();
    } catch (error) {
      toast.error('Gagal memulai pengerjaan');
    }
  };

  const handleCompleteService = async (queueId) => {
    try {
      await api.put(`/queues/${queueId}/status`, { status: 'completed' });
      toast.success('Pengerjaan selesai');
      fetchDashboardData();
    } catch (error) {
      toast.error('Gagal menyelesaikan');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">
            Selamat Datang, {data?.barber?.name}
          </h2>
          <p className="text-secondary-500">
            Rate Komisi: <span className="text-primary-600 font-semibold">{data?.barber?.commission_rate}%</span>
          </p>
        </div>
        <Button variant="outline" onClick={fetchDashboardData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Antrian Hari Ini"
          value={data?.today_stats?.total_queues || 0}
          icon={Users}
          color="bg-blue-500"
          subtitle="Total pelanggan"
        />
        <StatCard
          title="Selesai"
          value={data?.today_stats?.completed || 0}
          icon={CheckCircle}
          color="bg-green-500"
          subtitle="Pekerjaan selesai"
        />
        <StatCard
          title="Komisi Hari Ini"
          value={formatCurrency(data?.today_stats?.commission_today || 0)}
          icon={DollarSign}
          color="bg-primary-500"
          subtitle="Dari total penjualan"
        />
        <StatCard
          title="Estimasi Gaji Bulan Ini"
          value={formatCurrency(data?.current_month_earnings?.estimated_total || 0)}
          icon={TrendingUp}
          color="bg-purple-500"
          subtitle={`Base ${formatCurrency(data?.current_month_earnings?.base_salary || 0)} + Komisi`}
        />
      </div>

      {/* Current & Next Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Sedang Dikerjakan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.current_queue ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {data.current_queue.queue_number}
                    </p>
                  </div>
                  <Button
                    variant="success"
                    onClick={() => handleCompleteService(data.current_queue.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Selesai
                  </Button>
                </div>
                {data.current_queue.started_at && (
                  <p className="text-sm text-secondary-500 text-center">
                    Mulai: {formatTime(data.current_queue.started_at)}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-secondary-500">
                <Scissors className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Tidak ada yang sedang dikerjakan</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-yellow-500" />
              Antrian Berikutnya
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.next_queue ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {data.next_queue.queue_number}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleStartService(data.next_queue.id)}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Mulai
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-secondary-500">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Tidak ada antrian berikutnya</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Earnings Summary - Using data from dashboard response */}
      {data?.current_month_earnings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Estimasi Penghasilan Bulan {new Date().toLocaleString('id-ID', { month: 'long' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-secondary-500">Gaji Pokok</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(data.current_month_earnings.base_salary)}
                </p>
              </div>
              <div className="p-4 bg-primary-50 rounded-lg">
                <p className="text-sm text-secondary-500">Komisi Bulan Ini</p>
                <p className="text-xl font-bold text-primary-600">
                  {formatCurrency(data.current_month_earnings.commission)}
                </p>
                <p className="text-xs text-secondary-400 mt-1">Rate: {data?.barber?.commission_rate}%</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-secondary-500">Estimasi Total</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(data.current_month_earnings.estimated_total)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Salary Slips */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-600" />
            Slip Gaji
          </CardTitle>
          <button 
            onClick={() => window.location.href = '/barber-salary'}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            Lihat Semua <ChevronRight className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent>
          {salarySlips.length > 0 ? (
            <div className="space-y-3">
              {salarySlips.slice(0, 3).map((slip) => (
                <div
                  key={slip.id}
                  onClick={() => handleViewSlip(slip.id)}
                  className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg cursor-pointer hover:bg-secondary-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">{slip.period_name}</p>
                      <p className="text-xs text-secondary-500">
                        {slip.total_customers} pelanggan • {slip.total_services} layanan
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-secondary-900">{formatCurrency(slip.net_salary)}</p>
                    {getStatusBadge(slip.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-secondary-500">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada slip gaji</p>
              <p className="text-xs mt-1">Slip gaji akan muncul setelah admin memprosesnya</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Pekerjaan Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recent_jobs?.length > 0 ? (
            <div className="space-y-2">
              {data.recent_jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                      {job.queue_number}
                    </span>
                    <div>
                      <p className="text-xs text-secondary-500">
                        {formatDate(job.completed_at)} • {formatTime(job.completed_at)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">Selesai</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-secondary-500 py-4">Belum ada pekerjaan</p>
          )}
        </CardContent>
      </Card>

      {/* Salary Slip Detail Modal */}
      {showSlipModal && selectedSlip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-secondary-900">Slip Gaji</h3>
                <p className="text-sm text-secondary-500">{selectedSlip.period_name}</p>
              </div>
              <button 
                onClick={() => setShowSlipModal(false)}
                className="p-2 hover:bg-secondary-100 rounded-lg"
              >
                <X className="h-5 w-5 text-secondary-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <span className="text-secondary-600">Status</span>
                {getStatusBadge(selectedSlip.status)}
              </div>

              {/* Income Details */}
              <div>
                <h4 className="text-sm font-semibold text-secondary-900 uppercase tracking-wider mb-3">
                  Rincian Pendapatan
                </h4>
                <div className="space-y-2">
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
                  {selectedSlip.overtime > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-secondary-600">Lembur</span>
                      <span className="font-medium text-green-600">+{formatCurrency(selectedSlip.overtime)}</span>
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
                  <h4 className="text-sm font-semibold text-secondary-900 uppercase tracking-wider mb-3">
                    Potongan
                  </h4>
                  <div className="space-y-2">
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
                  <span className="text-primary-800 font-medium">Gaji Bersih (Take Home)</span>
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
                  <p className="text-2xl font-bold text-secondary-900">{formatCurrency(selectedSlip.total_transaction_amount)}</p>
                  <p className="text-xs text-secondary-500">Total Penjualan</p>
                </div>
              </div>

              {/* Payment Info */}
              {selectedSlip.status === 'paid' && selectedSlip.paid_at && (
                <div className="text-center text-sm text-secondary-500">
                  <p>Dibayarkan pada {formatDate(selectedSlip.paid_at)}</p>
                  {selectedSlip.paid_by && <p>oleh {selectedSlip.paid_by}</p>}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.print()}
              >
                <Download className="h-4 w-4 mr-2" />
                Cetak / Simpan PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarberDashboard;
