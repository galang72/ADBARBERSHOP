import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Scissors, Upload, Image as ImageIcon, X } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';
import IconPicker, { iconMap } from '../components/IconPicker';
import InputCurrency from '../components/InputCurrency';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageTab, setImageTab] = useState('photo'); // 'photo' | 'icon'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo: '',
    icon: '',
    price: '',
    duration_minutes: '30',
    category: 'haircut',
    status: 'active',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      toast.error('Gagal memuat data layanan');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('folder', 'services');

    try {
      const response = await api.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData({ ...formData, photo: response.data.url });
      toast.success('Foto berhasil diupload');
    } catch (error) {
      toast.error('Gagal upload foto');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes),
      };

      if (editingService) {
        await api.put(`/services/${editingService.id}`, data);
        toast.success('Layanan berhasil diupdate');
      } else {
        await api.post('/services', data);
        toast.success('Layanan berhasil ditambahkan');
      }
      setIsModalOpen(false);
      setEditingService(null);
      resetForm();
      fetchServices();
    } catch (error) {
      toast.error('Gagal menyimpan layanan');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus layanan ini?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Layanan berhasil dihapus');
      fetchServices();
    } catch (error) {
      toast.error('Gagal menghapus layanan');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    const hasPhoto = service.photo && service.photo !== '';
    const hasIcon = service.icon && service.icon !== '';
    setImageTab(hasPhoto || (!hasPhoto && !hasIcon) ? 'photo' : 'icon');
    setFormData({
      name: service.name,
      description: service.description || '',
      photo: service.photo || '',
      icon: service.icon || '',
      price: service.price.toString(),
      duration_minutes: service.duration_minutes.toString(),
      category: service.category,
      status: service.status,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setImageTab('photo');
    setFormData({
      name: '',
      description: '',
      photo: '',
      icon: '',
      price: '',
      duration_minutes: '30',
      category: 'haircut',
      status: 'active',
    });
  };

  const categories = {
    haircut: 'Potong Rambut',
    shaving: 'Cukur',
    treatment: 'Perawatan',
    premium: 'Premium',
  };

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
        <h2 className="text-lg font-semibold text-secondary-900">Daftar Layanan</h2>
        <Button onClick={() => { resetForm(); setEditingService(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Layanan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => {
          const ServiceIcon = service.icon && iconMap[service.icon] ? iconMap[service.icon].Icon : Scissors;
          return (
            <Card key={service.id} className={service.status === 'inactive' ? 'opacity-60' : ''}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {service.photo ? (
                      <img 
                        src={service.photo} 
                        alt={service.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : service.icon && iconMap[service.icon] ? (
                      <div className="p-3 bg-primary-100 rounded-lg">
                        <ServiceIcon className="h-5 w-5 text-primary-600" />
                      </div>
                    ) : (
                      <div className="p-3 bg-primary-100 rounded-lg">
                        <Scissors className="h-5 w-5 text-primary-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-secondary-900">{service.name}</h3>
                      <p className="text-sm text-secondary-500">{categories[service.category] || service.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-secondary-100">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary-600">
                      {formatCurrency(service.price)}
                    </span>
                    <span className="text-sm text-secondary-500">
                      {service.duration_minutes} menit
                    </span>
                  </div>
                  {service.description && (
                    <p className="text-sm text-secondary-500 mt-2">{service.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Edit Layanan' : 'Tambah Layanan'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Layanan"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Kategori</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-lg border border-secondary-300 px-3 py-2"
            >
              <option value="haircut">Potong Rambut</option>
              <option value="shaving">Cukur</option>
              <option value="treatment">Perawatan</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          
          <div className="bg-secondary-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-secondary-700">Gambar Layanan</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, photo: '', icon: '' })}
                className="text-xs text-secondary-500 hover:text-secondary-700"
              >
                Reset
              </button>
            </div>
            
            {/* Tab Selection */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setImageTab('photo');
                  setFormData({ ...formData, icon: '' });
                }}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  imageTab === 'photo' ? 'bg-primary-600 text-white' : 'bg-white text-secondary-600'
                }`}
              >
                Upload Foto
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageTab('icon');
                  setFormData({ ...formData, photo: '' });
                }}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  imageTab === 'icon' ? 'bg-primary-600 text-white' : 'bg-white text-secondary-600'
                }`}
              >
                Pilih Icon
              </button>
            </div>

            {/* Upload Photo Section */}
            {imageTab === 'photo' && (
              <div className="flex items-center gap-3">
                {formData.photo ? (
                  <div className="relative">
                    <img 
                      src={formData.photo} 
                      alt="Preview" 
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photo: '' })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-secondary-400" />
                  </div>
                )}
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-secondary-300 rounded-lg hover:bg-secondary-50 ${uploading ? 'opacity-50' : ''}`}>
                    <Upload className="h-4 w-4 text-secondary-500" />
                    <span className="text-sm text-secondary-600">
                      {uploading ? 'Mengupload...' : 'Upload Foto'}
                    </span>
                  </div>
                </label>
              </div>
            )}

            {/* Icon Picker Section */}
            {imageTab === 'icon' && (
              <IconPicker
                value={formData.icon}
                onChange={(icon) => setFormData({ ...formData, icon: icon || '' })}
                label="Pilih Icon"
              />
            )}
          </div>

          <Input
            label="Deskripsi"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <InputCurrency
            label="Harga"
            value={formData.price}
            onChange={(value) => setFormData({ ...formData, price: value })}
            required
          />
          <Input
            label="Durasi (menit)"
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full rounded-lg border border-secondary-300 px-3 py-2"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1">
              {editingService ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Services;
