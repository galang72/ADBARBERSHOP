import React, { useEffect, useState } from 'react';
import { 
  Save, Store, Clock, CreditCard, Camera, ImageIcon, X, 
  Scissors, Sparkles, Star, Crown, Gem, Heart, Zap, Sun, Moon,
  User, Building2, Bell, Shield, Palette, Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';

// Available icons for sidebar
const SIDEBAR_ICONS = [
  { key: 'store', icon: Store, label: 'Toko' },
  { key: 'scissors', icon: Scissors, label: 'Gunting' },
  { key: 'sparkles', icon: Sparkles, label: 'Kilau' },
  { key: 'star', icon: Star, label: 'Bintang' },
  { key: 'crown', icon: Crown, label: 'Mahkota' },
  { key: 'gem', icon: Gem, label: 'Permata' },
  { key: 'heart', icon: Heart, label: 'Hati' },
  { key: 'zap', icon: Zap, label: 'Petir' },
  { key: 'sun', icon: Sun, label: 'Matahari' },
  { key: 'moon', icon: Moon, label: 'Bulan' },
];

const ALL_TABS = [
  { id: 'profile', label: 'Profil Saya', icon: User },
  { id: 'shop', label: 'Pengaturan Toko', icon: Building2 },
  { id: 'business', label: 'Operasional', icon: Clock },
];

const Settings = () => {
  const { user, updateProfile } = useAuthStore();
  
  // Filter tabs based on role - only admin can see all tabs
  const isAdmin = user?.role === 'admin';
  const TABS = isAdmin 
    ? ALL_TABS 
    : ALL_TABS.filter(tab => tab.id === 'profile');
  
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    avatar: '',
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Shop settings state
  const [settings, setSettings] = useState({
    shop_name: 'BarberShop',
    shop_address: '',
    shop_phone: '',
    shop_logo: '',
    sidebar_icon: 'store',
    queue_prefix: 'A',
    tax_rate: '0',
    enable_tax: false,
    opening_time: '09:00',
    closing_time: '21:00',
    appointment_interval: '30',
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    fetchSettings();
  }, []);

  // Sync previews
  useEffect(() => {
    if (settings.shop_logo && settings.sidebar_icon === 'custom') {
      let logoUrl = settings.shop_logo;
      if (!logoUrl.startsWith('http') && !logoUrl.startsWith('data:')) {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
        logoUrl = logoUrl.startsWith('/') ? `${baseUrl}${logoUrl}` : `${baseUrl}/${logoUrl}`;
      }
      setLogoPreview(logoUrl);
    } else {
      setLogoPreview(null);
    }
  }, [settings.shop_logo, settings.sidebar_icon]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/me');
      const userData = response.data;
      setProfile({
        name: userData.name || '',
        phone: userData.phone || '',
        avatar: userData.avatar || '',
      });
      if (userData.avatar) {
        setAvatarPreview(userData.avatar);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      const settingsData = {};
      
      // Handle different response formats
      const data = response.data;
      
      if (Array.isArray(data)) {
        // Format: [{key, value, type}, ...]
        data.forEach(setting => {
          settingsData[setting.key] = setting.type === 'boolean' ? setting.value === '1' : setting.value;
        });
      } else if (typeof data === 'object' && data !== null) {
        // Format: {shop_name: {value, type}, shop_address: {value, type}, ...}
        Object.entries(data).forEach(([key, setting]) => {
          if (setting && typeof setting === 'object' && 'value' in setting) {
            settingsData[key] = setting.type === 'boolean' ? setting.value === '1' : setting.value;
          } else {
            // Direct value format: {shop_name: "value"}
            settingsData[key] = setting;
          }
        });
      }
      
      if (settingsData.sidebar_icon && settingsData.sidebar_icon !== 'custom') {
        settingsData.shop_logo = '';
      }
      setSettings(prev => ({ ...prev, ...settingsData }));
    } catch (error) {
      toast.error('Gagal memuat pengaturan');
    }
  };

  // Profile handlers
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(prev => ({ ...prev, avatar: response.data.url }));
      toast.success('Foto profil diupload, klik Simpan untuk menerapkan');
    } catch (error) {
      toast.error('Gagal upload foto profil');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const removeAvatar = () => {
    setProfile(prev => ({ ...prev, avatar: '' }));
    setAvatarPreview(null);
    toast.success('Foto profil dihapus, klik Simpan untuk menerapkan');
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const success = await updateProfile({
        name: profile.name,
        phone: profile.phone,
        avatar: profile.avatar,
      });
      if (success) toast.success('Profil berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal menyimpan profil');
    } finally {
      setSavingProfile(false);
    }
  };

  // Shop handlers
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    setUploadingLogo(true);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSettings(prev => ({ ...prev, shop_logo: response.data.url, sidebar_icon: 'custom' }));
      toast.success('Logo diupload');
      window.dispatchEvent(new CustomEvent('settings-updated'));
    } catch (error) {
      toast.error('Gagal upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    setSettings(prev => ({ ...prev, shop_logo: '', sidebar_icon: 'store' }));
    setLogoPreview(null);
    toast.success('Logo dihapus');
  };

  const selectIcon = (iconKey) => {
    setSettings(prev => ({ ...prev, sidebar_icon: iconKey, shop_logo: '' }));
    setLogoPreview(null);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const settingsArray = [];
      Object.entries(settings).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        if (key === 'shop_logo') {
          if (value && value !== '') {
            settingsArray.push({ key, value: String(value) });
          }
          return;
        }
        if (key !== 'shop_name' && value === '') return;
        const finalValue = typeof value === 'boolean' 
          ? (value ? '1' : '0') 
          : String(value);
        settingsArray.push({ key, value: finalValue });
      });
      
      await api.post('/settings/batch', { settings: settingsArray });
      window.dispatchEvent(new CustomEvent('settings-updated'));
      toast.success('Pengaturan berhasil disimpan');
    } catch (error) {
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const SelectedIcon = SIDEBAR_ICONS.find(i => i.key === settings.sidebar_icon)?.icon || Store;

  // Render Profile Tab
  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary-600" />
            Informasi Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-secondary-50 rounded-xl">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-28 h-28 object-cover rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center border-4 border-secondary-200 shadow-lg">
                  <User className="h-14 w-14 text-secondary-400" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold text-secondary-900">Foto Profil</h3>
              <p className="text-sm text-secondary-500 mb-3">
                Upload foto terbaik Anda. Format JPG/PNG, maksimal 2MB.
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <label className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700 transition-colors shadow-sm">
                  <Camera className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {uploadingAvatar ? 'Mengupload...' : 'Upload Foto'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
                {avatarPreview && (
                  <button
                    onClick={removeAvatar}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span className="text-sm font-medium">Hapus</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Masukkan nama lengkap"
            />
            <Input
              label="Nomor Telepon"
              value={profile.phone}
              onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Contoh: 08123456789"
            />
          </div>

          <div className="pt-4 border-t border-secondary-100">
            <Button 
              onClick={handleSaveProfile} 
              loading={savingProfile}
              className="w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              Simpan Perubahan Profil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render Shop Tab
  const renderShopTab = () => (
    <div className="space-y-6">
      {/* Branding Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-primary-600" />
            Branding & Identitas Toko
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Shop Name */}
          <Input
            label="Nama Toko"
            value={settings.shop_name}
            onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })}
            placeholder="Nama bisnis Anda"
          />

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-3">
              Icon Sidebar
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {SIDEBAR_ICONS.map(({ key, icon: Icon, label }) => {
                const isSelected = settings.sidebar_icon === key;
                return (
                  <button
                    key={key}
                    onClick={() => selectIcon(key)}
                    className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all relative ${
                      isSelected
                        ? 'bg-primary-600 text-white shadow-md ring-2 ring-primary-300'
                        : 'bg-white border border-secondary-200 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                    title={label}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-secondary-500 mt-2">
              Icon yang dipilih: <span className="font-medium text-primary-600 capitalize">{settings.sidebar_icon}</span>
            </p>
          </div>

          {/* Logo Upload */}
          <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-secondary-900">Logo Custom</h4>
                <p className="text-xs text-secondary-500">Upload logo untuk mengganti icon</p>
              </div>
              {logoPreview && (
                <Badge variant="success" className="flex items-center gap-1">
                  <Check className="h-3 w-3" /> Aktif
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="w-20 h-20 object-cover rounded-xl border-2 border-white shadow-md"
                    />
                    <button
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center border-2 border-dashed border-secondary-300">
                    <ImageIcon className="h-8 w-8 text-secondary-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-primary-700 border border-primary-200 rounded-lg cursor-pointer hover:bg-primary-50 transition-colors shadow-sm">
                  <Camera className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {uploadingLogo ? 'Mengupload...' : logoPreview ? 'Ganti Logo' : 'Upload Logo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-secondary-500 mt-2">
                  Format: JPG, PNG, GIF. Maksimal 2MB.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary-600" />
            Informasi Kontak
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Alamat Toko</label>
            <textarea
              value={settings.shop_address}
              onChange={(e) => setSettings({ ...settings, shop_address: e.target.value })}
              className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              placeholder="Alamat lengkap toko"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Telepon Toko"
              value={settings.shop_phone}
              onChange={(e) => setSettings({ ...settings, shop_phone: e.target.value })}
              placeholder="021-1234567"
            />
            <Input
              label="Prefix Nomor Antrian"
              value={settings.queue_prefix}
              onChange={(e) => setSettings({ ...settings, queue_prefix: e.target.value })}
              placeholder="A"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} loading={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          Simpan Pengaturan Toko
        </Button>
      </div>
    </div>
  );

  // Render Business Tab
  const renderBusinessTab = () => (
    <div className="space-y-6">
      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary-600" />
            Jam Operasional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-secondary-50 rounded-xl">
              <label className="block text-sm font-medium text-secondary-700 mb-2">Jam Buka</label>
              <input
                type="time"
                value={settings.opening_time}
                onChange={(e) => setSettings({ ...settings, opening_time: e.target.value })}
                className="w-full text-2xl font-bold text-primary-600 bg-transparent border-0 focus:ring-0 p-0"
              />
              <p className="text-xs text-secondary-500">WIB</p>
            </div>
            <div className="p-4 bg-secondary-50 rounded-xl">
              <label className="block text-sm font-medium text-secondary-700 mb-2">Jam Tutup</label>
              <input
                type="time"
                value={settings.closing_time}
                onChange={(e) => setSettings({ ...settings, closing_time: e.target.value })}
                className="w-full text-2xl font-bold text-primary-600 bg-transparent border-0 focus:ring-0 p-0"
              />
              <p className="text-xs text-secondary-500">WIB</p>
            </div>
          </div>
          
          <Input
            label="Interval Booking (menit)"
            type="number"
            value={settings.appointment_interval}
            onChange={(e) => setSettings({ ...settings, appointment_interval: e.target.value })}
            placeholder="30"
          />
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-primary-600" />
            Pengaturan Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <CreditCard className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-secondary-900">Pajak</p>
                <p className="text-xs text-secondary-500">Aktifkan untuk menambahkan pajak</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_tax}
                onChange={(e) => setSettings({ ...settings, enable_tax: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          {settings.enable_tax && (
            <div className="pl-4 border-l-2 border-primary-200">
              <Input
                label="Persentase Pajak (%)"
                type="number"
                value={settings.tax_rate}
                onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })}
                placeholder="10"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} loading={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          Simpan Pengaturan
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Pengaturan</h1>
          <p className="text-secondary-500">Kelola profil dan pengaturan aplikasi</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-secondary-100 rounded-xl">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-200/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'shop' && isAdmin && renderShopTab()}
        {activeTab === 'business' && isAdmin && renderBusinessTab()}
      </div>
    </div>
  );
};

export default Settings;
