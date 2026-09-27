import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Mail, Shield, UserCheck, Scissors, Loader2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Badge from '../components/Badge';
import ConfirmModal from '../components/ConfirmModal';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';

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
        {levels[strength - 1]?.label || 'Terlalu pendek'} {password.length < 8 && '(min 8 karakter)'}
      </p>
    </div>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, user: null });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'cashier',
    password: '',
    specialties: [],
    bio: '',
    commission_rate: '30',
    salary: '2500000',
  });

  const specialtiesList = ['Potong Rambut', 'Cuci Blow', 'Shaving', 'Hair Tattoo', 'Coloring', 'Smoothing', 'Creambath', 'Perm', 'Facial'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data || response.data);
    } catch (error) {
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({}); // Clear previous errors
    
    try {
      const data = {
        ...formData,
        commission_rate: formData.role === 'barber' ? parseFloat(formData.commission_rate) : null,
        salary: formData.role === 'barber' ? parseFloat(formData.salary) : null,
      };

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, data);
        toast.success('Pengguna berhasil diupdate');
        setIsModalOpen(false);
        setEditingUser(null);
        resetForm();
      } else {
        const response = await api.post('/users', data);
        toast.success(response.data.message || 'Pengguna berhasil dibuat');
        setIsModalOpen(false);
        resetForm();
      }
      fetchUsers();
    } catch (error) {
      if (error.response?.status === 422) {
        // Validation error
        const errors = error.response.data.errors;
        setFormErrors(errors);
        
        // Show toast for first error
        const firstError = Object.values(errors)[0]?.[0];
        if (firstError) {
          toast.error(firstError);
        }
      } else {
        toast.error(error.response?.data?.message || 'Gagal menyimpan pengguna');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const user = deleteConfirm.user;
    if (!user) return;
    
    try {
      await api.delete(`/users/${user.id}`);
      toast.success('Pengguna berhasil dihapus');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus pengguna');
    } finally {
      setDeleteConfirm({ isOpen: false, user: null });
    }
  };

  const openDeleteConfirm = (user) => {
    setDeleteConfirm({ isOpen: true, user });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormErrors({}); // Clear errors when opening edit
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: '',
      specialties: user.barber?.specialties || [],
      bio: user.barber?.bio || '',
      commission_rate: user.barber?.commission_rate?.toString() || '30',
      salary: user.barber?.salary?.toString() || '2500000',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'cashier',
      password: '',
      specialties: [],
      bio: '',
      commission_rate: '30',
      salary: '2500000',
    });
    setFormErrors({});
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: { variant: 'danger', label: 'Admin', icon: Shield },
      cashier: { variant: 'primary', label: 'Kasir', icon: UserCheck },
      barber: { variant: 'success', label: 'Barber', icon: Scissors },
    };
    const config = variants[role] || variants.cashier;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const isBarber = formData.role === 'barber';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-secondary-900">Manajemen Pengguna</h2>
          <p className="text-sm text-secondary-500">Tambah, edit, dan hapus pengguna (Admin, Kasir, Barber)</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingUser(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pengguna
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id} className={user.status === 'inactive' ? 'opacity-60' : ''}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    user.role === 'admin' ? 'bg-red-100' : 
                    user.role === 'cashier' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {user.role === 'admin' ? <Shield className="h-5 w-5 text-red-600" /> :
                     user.role === 'cashier' ? <UserCheck className="h-5 w-5 text-blue-600" /> :
                     <Scissors className="h-5 w-5 text-green-600" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900">{user.name}</h3>
                    {getRoleBadge(user.role)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(user)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => openDeleteConfirm(user)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-secondary-100 space-y-2">
                <div className="flex items-center gap-2 text-sm text-secondary-600">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {user.email_verified_at ? (
                    <Badge variant="success" className="text-xs">Email Terverifikasi</Badge>
                  ) : (
                    <Badge variant="warning" className="text-xs">Email Belum Terverifikasi</Badge>
                  )}
                </div>

                {user.phone && (
                  <div className="text-sm text-secondary-600">
                    <span className="text-secondary-400">Telp:</span> {user.phone}
                  </div>
                )}
                
                {user.role === 'barber' && user.barber && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">
                        <span className="font-medium">Komisi:</span> {user.barber.commission_rate}%
                      </span>
                      <span className="text-green-700">
                        <span className="font-medium">Gaji:</span> {formatCurrency(user.barber.salary)}
                      </span>
                    </div>
                    
                    {user.barber.specialties?.length > 0 && (
                      <div className="pt-2 border-t border-green-200">
                        <p className="text-xs text-green-600 mb-1">Spesialisasi:</p>
                        <div className="flex flex-wrap gap-1">
                          {user.barber.specialties.map((spec, idx) => (
                            <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} 
             title={editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Nama Lengkap"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isSubmitting}
              />
              {formErrors.name && (
                <p className="text-sm text-red-600 mt-1">{formErrors.name[0]}</p>
              )}
            </div>
            <div>
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={!!editingUser || isSubmitting}
              />
              {formErrors.email && (
                <p className="text-sm text-red-600 mt-1">{formErrors.email[0]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nomor Telepon"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={isSubmitting}
            />
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={!!editingUser || isSubmitting}
                className="w-full rounded-lg border border-secondary-300 px-3 py-2 disabled:bg-secondary-100"
              >
                <option value="admin">Admin</option>
                <option value="cashier">Kasir</option>
                <option value="barber">Barber</option>
              </select>
              {formErrors.role && (
                <p className="text-sm text-red-600 mt-1">{formErrors.role[0]}</p>
              )}
              {editingUser && (
                <p className="text-xs text-secondary-400 mt-1">Role tidak bisa diubah</p>
              )}
            </div>
          </div>

          {!editingUser && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isSubmitting}
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <PasswordStrength password={formData.password} />
              {formErrors.password && (
                <p className="text-sm text-red-600 mt-1">{formErrors.password[0]}</p>
              )}
            </div>
          )}

          {isBarber && (
            <div className="border-t border-secondary-200 pt-4 mt-4">
              <h4 className="font-medium text-secondary-900 mb-3 flex items-center gap-2">
                <Scissors className="h-4 w-4 text-green-600" />
                Informasi Barber
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Input
                    label="Rate Komisi (%)"
                    type="number"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                    required={isBarber}
                    disabled={isSubmitting}
                  />
                  {formErrors.commission_rate && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.commission_rate[0]}</p>
                  )}
                </div>
                <div>
                  <Input
                    label="Gaji Pokok (Rp)"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    required={isBarber}
                    disabled={isSubmitting}
                  />
                  {formErrors.salary && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.salary[0]}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary-700 mb-2">Spesialisasi</label>
                <div className="flex flex-wrap gap-2">
                  {specialtiesList.map(spec => (
                    <label key={spec} className={`flex items-center gap-1 text-sm bg-secondary-50 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-secondary-100 ${isSubmitting ? 'opacity-50' : ''}`}>
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(spec)}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            specialties: e.target.checked
                              ? [...prev.specialties, spec]
                              : prev.specialties.filter(s => s !== spec)
                          }));
                        }}
                        disabled={isSubmitting}
                        className="rounded text-primary-600"
                      />
                      {spec}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Bio / Deskripsi</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2"
                  rows={3}
                  placeholder="Deskripsi singkat tentang barber..."
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsModalOpen(false)} 
              className="flex-1"
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                editingUser ? 'Update' : 'Simpan'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, user: null })}
        onConfirm={handleDelete}
        title="Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus pengguna "${deleteConfirm.user?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        type="danger"
      />
    </div>
  );
};

export default Users;
