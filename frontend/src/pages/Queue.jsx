import React, { useEffect, useState } from 'react';
import { Plus, Clock, CheckCircle, XCircle, Play, Calendar, History, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Input from '../components/Input';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { formatTime, formatDate } from '../utils/format';
import { useAuthStore } from '../stores/authStore';

const QueueStatusBadge = ({ status }) => {
  const variants = {
    waiting: { variant: 'warning', label: 'Menunggu' },
    in_progress: { variant: 'info', label: 'Sedang Dikerjakan' },
    completed: { variant: 'success', label: 'Selesai' },
    cancelled: { variant: 'danger', label: 'Dibatalkan' },
  };
  const config = variants[status] || variants.waiting;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const Queue = () => {
  const { user } = useAuthStore();
  const isBarber = user?.role === 'barber';
  
  const [queues, setQueues] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'history'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    customer_name: '',
    barber_id: '',
    services: [],
    notes: '',
  });

  useEffect(() => {
    fetchData();
    let interval;
    if (activeTab === 'today') {
      interval = setInterval(fetchData, 30000); // Refresh every 30 seconds for today
    }
    return () => clearInterval(interval);
  }, [activeTab, selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const dateParam = activeTab === 'today' ? 'today' : selectedDate;
      const [queuesRes, barbersRes, servicesRes] = await Promise.all([
        api.get(`/queues?date=${dateParam}`),
        api.get('/barbers/active'),
        api.get('/services/active'),
      ]);
      setQueues(queuesRes.data.data || queuesRes.data);
      setBarbers(barbersRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/queues', {
        ...formData,
        services: formData.services.map(s => parseInt(s)),
      });
      toast.success('Antrian berhasil ditambahkan');
      setIsModalOpen(false);
      setFormData({
        customer_name: '',
        barber_id: '',
        services: [],
        notes: '',
      });
      fetchData();
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menambahkan antrian';
      const errors = error.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0]?.[0];
        if (firstError) {
          toast.error(firstError);
          return;
        }
      }
      toast.error(message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/queues/${id}/status`, { status });
      toast.success('Status antrian diupdate');
      fetchData();
    } catch (error) {
      toast.error('Gagal update status');
    }
  };

  const callQueue = async (id) => {
    try {
      await api.post(`/queues/${id}/call`);
      toast.success('Antrian dipanggil');
      fetchData();
    } catch (error) {
      toast.error('Gagal memanggil antrian');
    }
  };

  const waitingQueues = queues.filter(q => q.status === 'waiting');
  const inProgressQueues = queues.filter(q => q.status === 'in_progress');
  const completedQueues = queues.filter(q => ['completed', 'cancelled'].includes(q.status));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header dengan Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-secondary-900">
            {isBarber ? 'Antrian Saya' : 'Manajemen Antrian'}
          </h2>
          {activeTab === 'today' && !isBarber && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Antrian
            </Button>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex bg-secondary-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'today'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            <Clock className="h-4 w-4" />
            Antrian Hari Ini
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            <History className="h-4 w-4" />
            Riwayat
          </button>
        </div>

        {/* Filter Tanggal untuk Riwayat */}
        {activeTab === 'history' && (
          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-secondary-200">
            <Calendar className="h-5 w-5 text-secondary-400" />
            <div>
              <label className="block text-xs text-secondary-500">Pilih Tanggal</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border-0 p-0 text-secondary-900 font-medium focus:ring-0"
              />
            </div>
            <div className="ml-auto text-sm text-secondary-500">
              {formatDate(selectedDate)}
            </div>
          </div>
        )}

        {/* Stats untuk Hari Ini */}
        {activeTab === 'today' && (
          <div className="flex gap-4">
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
              <span className="font-bold text-2xl">{waitingQueues.length}</span>
              <span className="text-sm ml-2">Menunggu</span>
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
              <span className="font-bold text-2xl">{inProgressQueues.length}</span>
              <span className="text-sm ml-2">Dikerjakan</span>
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
              <span className="font-bold text-2xl">{completedQueues.length}</span>
              <span className="text-sm ml-2">Selesai</span>
            </div>
          </div>
        )}

        {/* Stats untuk Riwayat */}
        {activeTab === 'history' && queues.length > 0 && (
          <div className="flex gap-4">
            <div className="bg-secondary-100 text-secondary-800 px-4 py-2 rounded-lg">
              <span className="font-bold text-2xl">{queues.length}</span>
              <span className="text-sm ml-2">Total Antrian</span>
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
              <span className="font-bold text-2xl">{queues.filter(q => q.status === 'completed').length}</span>
              <span className="text-sm ml-2">Selesai</span>
            </div>
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg">
              <span className="font-bold text-2xl">{queues.filter(q => q.status === 'cancelled').length}</span>
              <span className="text-sm ml-2">Dibatalkan</span>
            </div>
          </div>
        )}
      </div>

      {/* Queue Grid - Hari Ini */}
      {activeTab === 'today' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Waiting Queue */}
          <Card>
            <CardHeader className="bg-yellow-50">
              <CardTitle className="text-yellow-800 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Menunggu ({waitingQueues.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {waitingQueues.map((queue) => (
                <div key={queue.id} className="bg-white border border-secondary-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl font-bold text-primary-600">
                      {queue.queue_number}
                    </span>
                    <QueueStatusBadge status={queue.status} />
                  </div>
                  <p className="font-medium text-secondary-900">{queue.customer_name || 'Pelanggan'}</p>
                  <p className="text-xs text-secondary-400">Antrian #{queue.id}</p>
                  {queue.barber && (
                    <p className="text-sm text-secondary-500">Barber: {queue.barber.name}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      className="flex-1"
                      onClick={() => callQueue(queue.id)}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Panggil
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      className="flex-1"
                      onClick={() => updateStatus(queue.id, 'in_progress')}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Mulai
                    </Button>
                  </div>
                </div>
              ))}
              {waitingQueues.length === 0 && (
                <p className="text-center text-secondary-500 py-8">Tidak ada antrian menunggu</p>
              )}
            </CardContent>
          </Card>

          {/* In Progress */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Play className="h-5 w-5" />
                Sedang Dikerjakan ({inProgressQueues.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {inProgressQueues.map((queue) => (
                <div key={queue.id} className="bg-white border border-secondary-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl font-bold text-primary-600">
                      {queue.queue_number}
                    </span>
                    <QueueStatusBadge status={queue.status} />
                  </div>
                  <p className="font-medium text-secondary-900">{queue.customer_name || 'Pelanggan'}</p>
                  <p className="text-xs text-secondary-400">Antrian #{queue.id}</p>
                  {queue.barber && (
                    <p className="text-sm text-secondary-500">Barber: {queue.barber.name}</p>
                  )}
                  {queue.started_at && (
                    <p className="text-xs text-secondary-400 mt-1">
                      Mulai: {formatTime(queue.started_at)}
                    </p>
                  )}
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="success"
                      className="w-full"
                      onClick={() => updateStatus(queue.id, 'completed')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Selesai
                    </Button>
                  </div>
                </div>
              ))}
              {inProgressQueues.length === 0 && (
                <p className="text-center text-secondary-500 py-8">Tidak ada yang dikerjakan</p>
              )}
            </CardContent>
          </Card>

          {/* Completed */}
          <Card>
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Selesai ({completedQueues.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {completedQueues.map((queue) => (
                <div key={queue.id} className="bg-white border border-secondary-200 rounded-lg p-4 opacity-75">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl font-bold text-secondary-600">
                      {queue.queue_number}
                    </span>
                    <QueueStatusBadge status={queue.status} />
                  </div>
                  <p className="font-medium text-secondary-900">{queue.customer_name || 'Pelanggan'}</p>
                  <p className="text-xs text-secondary-400">Antrian #{queue.id}</p>
                  {queue.barber && (
                    <p className="text-sm text-secondary-500">Barber: {queue.barber.name}</p>
                  )}
                  {queue.completed_at && (
                    <p className="text-xs text-secondary-400 mt-1">
                      Selesai: {formatTime(queue.completed_at)}
                    </p>
                  )}
                </div>
              ))}
              {completedQueues.length === 0 && (
                <p className="text-center text-secondary-500 py-8">Belum ada yang selesai</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Queue List - Riwayat */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader className="bg-secondary-50">
            <CardTitle className="text-secondary-800 flex items-center gap-2">
              <History className="h-5 w-5" />
              Riwayat Antrian {formatDate(selectedDate)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {queues.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
                <p className="text-secondary-500">Tidak ada data antrian untuk tanggal ini</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {queues.map((queue) => (
                  <div key={queue.id} className="bg-white border border-secondary-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xl font-bold text-secondary-600">
                        {queue.queue_number}
                      </span>
                      <QueueStatusBadge status={queue.status} />
                    </div>
                    <p className="font-medium text-secondary-900">{queue.customer_name || 'Pelanggan'}</p>
                    <p className="text-xs text-secondary-400">Antrian #{queue.id}</p>
                    {queue.barber && (
                      <p className="text-sm text-secondary-500">Barber: {queue.barber.name}</p>
                    )}
                    <div className="mt-2 text-xs text-secondary-400 space-y-1">
                      <p>Dibuat: {formatTime(queue.created_at)}</p>
                      {queue.started_at && <p>Mulai: {formatTime(queue.started_at)}</p>}
                      {queue.completed_at && <p>Selesai: {formatTime(queue.completed_at)}</p>}
                      {queue.cancelled_at && <p>Dibatalkan: {formatTime(queue.cancelled_at)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Antrian" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Nama Pelanggan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className="w-full rounded-lg border border-secondary-300 px-3 py-2"
              placeholder="Masukkan nama pelanggan"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Pilih Barber (Opsional)</label>
            <select
              value={formData.barber_id}
              onChange={(e) => setFormData({ ...formData, barber_id: e.target.value })}
              className="w-full rounded-lg border border-secondary-300 px-3 py-2"
            >
              <option value="">- Pilih Barber -</option>
              {barbers.map(barber => (
                <option key={barber.id} value={barber.id}>{barber.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Layanan</label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-secondary-200 rounded-lg p-3">
              {services.map(service => (
                <label key={service.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={service.id}
                    checked={formData.services.includes(service.id.toString())}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        services: e.target.checked
                          ? [...prev.services, value]
                          : prev.services.filter(s => s !== value)
                      }));
                    }}
                    className="rounded text-primary-600"
                  />
                  <span>{service.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Catatan</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-lg border border-secondary-300 px-3 py-2"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Batal
            </Button>
            <Button type="submit" className="flex-1">
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Queue;
