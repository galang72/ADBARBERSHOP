import React, { useEffect, useState } from 'react';
import { Plus, Calendar, Clock, CheckCircle, XCircle, Bell, History, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Badge from '../components/Badge';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { formatDate, formatTime, formatCurrency } from '../utils/format';
import { useAuthStore } from '../stores/authStore';

const Booking = () => {
  const { user } = useAuthStore();
  const isBarber = user?.role === 'barber';
  
  const [appointments, setAppointments] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    customer_name: '',
    appointment_date: '',
    appointment_time: '',
    barber_id: '',
    services: [],
    notes: '',
    reminder_minutes: 10,
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab, selectedDate]);

  useEffect(() => {
    if (activeTab === 'upcoming' && !isBarber && user) {
      fetchReminders();
      const interval = setInterval(() => {
        fetchReminders();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [activeTab, isBarber, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url;
      
      if (isBarber) {
        // Barber endpoint - selalu filter by date
        url = `/barbers/my-schedule?date=${selectedDate}`;
        const [aptRes, servicesRes] = await Promise.all([
          api.get(url),
          api.get('/services/active'),
        ]);
        setAppointments(aptRes.data || []);
        setServices(servicesRes.data);
      } else {
        // Admin/Cashier endpoint
        if (activeTab === 'history') {
          // Riwayat: filter by selected date
          url = `/appointments?date=${selectedDate}`;
        } else {
          // Mendatang: ambil semua, nanti difilter di frontend
          url = '/appointments?upcoming=true';
        }
        
        const [aptRes, servicesRes, barbersRes] = await Promise.all([
          api.get(url),
          api.get('/services/active'),
          api.get('/barbers/active'),
        ]);
        
        // Handle both paginated and non-paginated responses
        const aptData = aptRes.data.data || aptRes.data;
        setAppointments(aptData || []);
        setServices(servicesRes.data);
        setBarbers(barbersRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMsg = error.response?.data?.message || 'Gagal memuat data';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchReminders = async () => {
    try {
      const res = await api.get('/appointments/reminders');
      setReminders(res.data);
      res.data.forEach(apt => {
        toast(
          <div className="flex flex-col gap-1">
            <span className="font-bold">⏰ Reminder Booking!</span>
            <span>{formatTime(apt.appointment_time)}</span>
            <span className="text-xs">{apt.reminder_minutes} menit lagi</span>
          </div>,
          { duration: 10000, icon: '🔔' }
        );
        api.post(`/appointments/${apt.id}/remind`);
      });
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointments', {
        ...formData,
        services: formData.services.map(s => parseInt(s)),
      });
      toast.success('Booking berhasil ditambahkan');
      setIsModalOpen(false);
      setFormData({
        customer_name: '',
        appointment_date: '',
        appointment_time: '',
        barber_id: '',
        services: [],
        notes: '',
        reminder_minutes: 10,
      });
      fetchData();
    } catch (error) {
      toast.error('Gagal menambahkan booking');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success('Status booking diupdate');
      fetchData();
    } catch (error) {
      toast.error('Gagal update status');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'info',
      completed: 'success',
      cancelled: 'danger',
      no_show: 'secondary',
    };
    const labels = {
      pending: 'Menunggu',
      confirmed: 'Dikonfirmasi',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
      no_show: 'No Show',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  // Filter booking mendatang
  const upcomingAppointments = appointments.filter(apt => {
    const isUpcomingStatus = ['pending', 'confirmed'].includes(apt.status);
    const aptDate = new Date(apt.appointment_date);
    const today = new Date();
    today.setHours(0,0,0,0);
    const isTodayOrFuture = aptDate >= today;
    return isUpcomingStatus && isTodayOrFuture;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-secondary-900">
            {isBarber ? 'Jadwal Booking Saya' : 'Jadwal Booking'}
          </h2>
          {!isBarber && activeTab === 'upcoming' && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Booking Baru
            </Button>
          )}
        </div>
        
        {/* Tabs - Hide for barber, show only history-like view */}
        {!isBarber && (
          <div className="flex bg-secondary-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Mendatang
              {upcomingAppointments.length > 0 && (
                <span className="bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full text-xs">
                  {upcomingAppointments.length}
                </span>
              )}
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
        )}

        {/* Date Filter - Only for History tab or Barber */}
        {(isBarber || activeTab === 'history') && (
          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-secondary-200 w-fit">
            <Filter className="h-4 w-4 text-secondary-400" />
            <div className="flex items-center gap-2">
              <label className="text-sm text-secondary-500">Tanggal:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-secondary-300 rounded-lg px-3 py-1.5 text-sm"
              />
            </div>
            <span className="text-xs text-secondary-400">
              {isBarber ? 'Menampilkan jadwal untuk tanggal ini' : 'Filter riwayat berdasarkan tanggal'}
            </span>
          </div>
        )}
        
        {/* Info for Upcoming tab */}
        {!isBarber && activeTab === 'upcoming' && (
          <div className="flex items-center gap-2 text-sm text-secondary-500 bg-blue-50 p-3 rounded-lg w-fit">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span>Menampilkan semua booking mendatang dari hari ini</span>
          </div>
        )}
      </div>

      {/* Reminder Banner - Admin/Cashier only */}
      {!isBarber && activeTab === 'upcoming' && reminders.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-amber-800">Pengingat ({reminders.length})</h3>
          </div>
          <div className="space-y-2">
            {reminders.map(apt => (
              <div key={apt.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-amber-100">
                <div>
                  <span className="font-medium text-secondary-900">{apt.customer_name}</span>
                  <span className="text-sm text-secondary-500 ml-2">
                    {formatTime(apt.appointment_time)} - {apt.reminder_minutes} menit lagi
                  </span>
                </div>
                <Button size="sm" variant="primary" onClick={() => api.post(`/appointments/${apt.id}/remind`)}>
                  OK
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(isBarber ? appointments : (activeTab === 'upcoming' ? upcomingAppointments : appointments
          .filter(apt => statusFilter === 'all' || apt.status === statusFilter)
        )).map((apt) => (
          <Card key={apt.id}>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-secondary-900">{apt.customer_name || 'Pelanggan'}</h3>
                  <p className="text-xs text-secondary-400">Booking #{apt.id}</p>
                </div>
                {getStatusBadge(apt.status)}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-secondary-600 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {formatDate(apt.appointment_date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {formatTime(apt.appointment_time)}
                </span>
              </div>

              {apt.barber && !isBarber && (
                <p className="text-sm text-secondary-600 mb-2">
                  <User className="h-4 w-4 inline mr-1" /> {apt.barber.name}
                </p>
              )}

              {apt.reminder_minutes > 0 && !isBarber && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <Bell className="h-3 w-3" /> Reminder {apt.reminder_minutes} menit sebelumnya
                </p>
              )}

              {/* Action buttons - only for admin/cashier */}
              {!isBarber && activeTab === 'upcoming' && apt.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="success" onClick={() => updateStatus(apt.id, 'confirmed')}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Konfirmasi
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => updateStatus(apt.id, 'cancelled')}>
                    <XCircle className="h-4 w-4 mr-1" /> Batal
                  </Button>
                </div>
              )}
              {!isBarber && activeTab === 'upcoming' && apt.status === 'confirmed' && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="success" onClick={() => updateStatus(apt.id, 'completed')}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Selesai
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => updateStatus(apt.id, 'cancelled')}>
                    <XCircle className="h-4 w-4 mr-1" /> Batal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {appointments.length === 0 && (
          <div className="col-span-2 text-center py-12 text-secondary-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-secondary-300" />
            <p>
              {isBarber 
                ? 'Tidak ada jadwal untuk tanggal ini' 
                : activeTab === 'upcoming' 
                  ? 'Tidak ada booking mendatang' 
                  : 'Tidak ada data untuk filter ini'
              }
            </p>
          </div>
        )}
      </div>

      {/* Form Modal - Admin/Cashier only */}
      {!isBarber && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Booking Baru">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Pelanggan"
              type="text"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              placeholder="Masukkan nama pelanggan"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tanggal"
                type="date"
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Waktu (WIB)</label>
                <input
                  type="time"
                  value={formData.appointment_time}
                  onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                  required
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Barber</label>
              <select
                value={formData.barber_id}
                onChange={(e) => setFormData({ ...formData, barber_id: e.target.value })}
                className="w-full rounded-lg border border-secondary-300 px-3 py-2"
              >
                <option value="">Pilih Barber</option>
                {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Layanan</label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-secondary-200 rounded-lg p-2">
                {services.map(service => (
                  <label key={service.id} className="flex items-center gap-2 p-2 hover:bg-secondary-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      value={service.id}
                      checked={formData.services.includes(service.id.toString())}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, services: [...formData.services, e.target.value] });
                        } else {
                          setFormData({ ...formData, services: formData.services.filter(s => s !== e.target.value) });
                        }
                      }}
                      className="rounded border-secondary-300"
                    />
                    <span className="text-sm">{service.name} - {formatCurrency(service.price)}</span>
                  </label>
                ))}
              </div>
            </div>
            <Input
              label="Catatan"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Reminder (menit sebelum)</label>
              <select
                value={formData.reminder_minutes}
                onChange={(e) => setFormData({ ...formData, reminder_minutes: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-secondary-300 px-3 py-2"
              >
                <option value={5}>5 menit</option>
                <option value={10}>10 menit</option>
                <option value={15}>15 menit</option>
                <option value={30}>30 menit</option>
                <option value={60}>1 jam</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                Batal
              </Button>
              <Button type="submit" className="flex-1">
                Simpan
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Booking;
