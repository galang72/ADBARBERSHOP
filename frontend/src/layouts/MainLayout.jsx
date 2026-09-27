import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Scissors,
  Package,
  ListOrdered,
  CalendarDays,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Store,
  Shield,
  Calendar,
  Sparkles,
  Star,
  Crown,
  Gem,
  Heart,
  Zap,
  Sun,
  Moon,
  Wallet,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/Button';
import api from '../utils/axios';

// Icon mapping for sidebar
const ICON_MAP = {
  store: Store,
  scissors: Scissors,
  sparkles: Sparkles,
  star: Star,
  crown: Crown,
  gem: Gem,
  heart: Heart,
  zap: Zap,
  sun: Sun,
  moon: Moon,
};

// Menu for Admin
const adminMenuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/queue', icon: ListOrdered, label: 'Antrian' },
  { path: '/booking', icon: CalendarDays, label: 'Booking' },
  { path: '/transaction', icon: Receipt, label: 'Transaksi' },
  { path: '/services', icon: Scissors, label: 'Layanan' },
  { path: '/products', icon: Package, label: 'Produk' },
  { path: '/barbers', icon: User, label: 'Barber' },
  { path: '/users', icon: Shield, label: 'Pengguna' },
  { path: '/salary-slips', icon: Wallet, label: 'Slip Gaji' },
  { path: '/reports', icon: BarChart3, label: 'Laporan' },
  { path: '/settings', icon: Settings, label: 'Pengaturan' },
];

// Menu for Cashier
const cashierMenuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/queue', icon: ListOrdered, label: 'Antrian' },
  { path: '/booking', icon: CalendarDays, label: 'Booking' },
  { path: '/transaction', icon: Receipt, label: 'Transaksi' },
  { path: '/services', icon: Scissors, label: 'Layanan' },
  { path: '/products', icon: Package, label: 'Produk' },
  { path: '/settings', icon: Settings, label: 'Pengaturan' },
];

// Menu for Barber
const barberMenuItems = [
  { path: '/barber-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/barber-queues', icon: ListOrdered, label: 'Antrian Saya' },
  { path: '/barber-schedule', icon: Calendar, label: 'Jadwal Booking' },
  { path: '/barber-salary', icon: Wallet, label: 'Slip Gaji' },
  { path: '/settings', icon: Settings, label: 'Pengaturan' },
];

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shopName, setShopName] = useState('Tritama Barber');
  const [shopLogo, setShopLogo] = useState('/assets/logo.png');
  const [sidebarIcon, setSidebarIcon] = useState('custom');
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Fetch shop settings
  useEffect(() => {
    fetchShopSettings();
    
    const handleSettingsUpdate = () => {
      setTimeout(fetchShopSettings, 300);
    };
    window.addEventListener('settings-updated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate);
    };
  }, []);

  useEffect(() => {
    fetchShopSettings();
  }, [location.pathname]);

  const fetchShopSettings = async () => {
    try {
      const response = await api.get('/settings/public');
      const settings = response.data;
      
      // Get shop name (default: Tritama Barber)
      const name = settings.shop_name?.value || 'Tritama Barber';
      setShopName(name);
      
      // Get icon
      const icon = settings.sidebar_icon?.value || 'custom';
      setSidebarIcon(icon);
      
      // Get logo URL (default: Tritama Barber logo)
      const logoUrl = settings.shop_logo?.value || '/assets/logo.png';
      setShopLogo(logoUrl);
      setLogoError(false);
    } catch (error) {
      console.error('Error fetching shop settings:', error);
      // Use defaults if error
      setShopName('Tritama Barber');
      setShopLogo('/assets/logo.png');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get menu based on role
  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminMenuItems;
      case 'cashier':
        return cashierMenuItems;
      case 'barber':
        return barberMenuItems;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();
  
  // Get sidebar icon component
  const SidebarIcon = ICON_MAP[sidebarIcon] || Store;

  return (
    <div className="h-screen flex overflow-hidden bg-cream-50">
      {/* Sidebar - Fixed */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-secondary-100 flex flex-col transform transition-transform duration-200 ease-in-out lg:transform-none shadow-lg ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo & Shop Name */}
        <div className="flex items-center gap-3 h-20 px-4 border-b border-secondary-100 flex-shrink-0 bg-gradient-to-r from-cream-50 to-white">
          {/* Logo or Icon - Show logo only when explicitly set and no icon selected */}
          {shopLogo && !logoError && (!sidebarIcon || sidebarIcon === 'custom') ? (
            <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-xl">
              <img 
                src={shopLogo} 
                alt="Tritama Barber" 
                className="h-full w-full object-cover object-center transform scale-[1.5] drop-shadow-sm"
                onError={() => setLogoError(true)}
              />
            </div>
          ) : (
            <div className="h-12 w-12 bg-primary-800 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <SidebarIcon className="h-7 w-7 text-white" />
            </div>
          )}
          
          {/* Shop Name */}
          <span className="text-lg font-bold text-accent-900 truncate tracking-wide">
            {shopName}
          </span>
        </div>

        {/* Navigation - Scrollable if needed */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-800 text-white shadow-md'
                    : 'text-accent-600 hover:bg-primary-50 hover:text-primary-800'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="p-4 border-t border-secondary-100 bg-gradient-to-r from-cream-50 to-white">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                user?.role === 'barber' ? 'bg-secondary-100' : 'bg-primary-100'
              }`}
              style={{ display: user?.avatar ? 'none' : 'flex' }}
            >
              <User className={`h-5 w-5 ${
                user?.role === 'barber' ? 'text-secondary-700' : 'text-primary-800'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-accent-900 truncate">{user?.name}</p>
              <p className="text-xs text-accent-500 capitalize">{user?.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-accent-400 hover:text-primary-800 flex-shrink-0"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar - Fixed */}
        <header className="bg-white border-b border-secondary-200 flex-shrink-0">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-secondary-600 hover:bg-secondary-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-secondary-900">
                  {user?.role === 'barber' ? 'Dashboard Barber' : 'Dashboard'}
                </h1>
                {user?.role === 'barber' && (
                  <p className="text-sm text-primary-600">Selamat bekerja, {user?.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Current time display */}
              <div className="hidden md:block text-right">
                <p className="text-sm text-secondary-500">
                  {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
