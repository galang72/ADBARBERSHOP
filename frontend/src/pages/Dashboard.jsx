import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  Users,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Package,
  Scissors,
  User,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CreditCard,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import { formatCurrency, formatDate } from '../utils/format';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Collapsible Section Component
const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary-50/50 hover:bg-secondary-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-secondary-500" />}
          <span className="font-semibold text-secondary-900">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5 text-secondary-400" /> : <ChevronDown className="h-5 w-5 text-secondary-400" />}
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, subtitle, color }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-secondary-500 truncate">{title}</p>
          <p className="text-xl lg:text-2xl font-bold text-secondary-900 mt-1">{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              <span className="font-medium">{trend > 0 ? '+' : ''}{trend}%</span>
              <span className="text-secondary-400 ml-1">vs lalu</span>
            </div>
          )}
          {subtitle && <p className="text-xs text-secondary-400 mt-1 truncate">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg flex-shrink-0 ml-3 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const QuickRangeButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
      active
        ? 'bg-primary-100 text-primary-700 border border-primary-200'
        : 'text-secondary-600 hover:bg-secondary-100 border border-transparent'
    }`}
  >
    {label}
  </button>
);

const MiniList = ({ items, renderItem, emptyText }) => {
  if (!items || items.length === 0) {
    return <p className="text-center text-secondary-400 py-4 text-sm">{emptyText}</p>;
  }
  return (
    <div className="space-y-2">
      {items.slice(0, 5).map((item, idx) => renderItem(item, idx))}
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeRange, setActiveRange] = useState('today');

  useEffect(() => {
    fetchDashboardData();
  }, [startDate, endDate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/dashboard?start_date=${startDate}&end_date=${endDate}`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const setQuickRange = (range) => {
    const today = new Date();
    let start, end;
    
    switch (range) {
      case 'today':
        start = end = today;
        break;
      case 'yesterday':
        start = end = new Date(today);
        start.setDate(start.getDate() - 1);
        break;
      case 'last7':
        end = today;
        start = new Date(today);
        start.setDate(start.getDate() - 6);
        break;
      case 'last30':
        end = today;
        start = new Date(today);
        start.setDate(start.getDate() - 29);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = today;
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return;
    }
    
    setActiveRange(range);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const currentStats = data?.current_stats;
  const trends = data?.trends;
  const period = data?.period;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header Filter */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-secondary-900">Dashboard</h2>
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {/* Quick Range */}
        <div className="flex flex-wrap gap-2">
          <QuickRangeButton label="Hari Ini" active={activeRange === 'today'} onClick={() => setQuickRange('today')} />
          <QuickRangeButton label="Kemarin" active={activeRange === 'yesterday'} onClick={() => setQuickRange('yesterday')} />
          <QuickRangeButton label="7 Hari" active={activeRange === 'last7'} onClick={() => setQuickRange('last7')} />
          <QuickRangeButton label="30 Hari" active={activeRange === 'last30'} onClick={() => setQuickRange('last30')} />
        </div>
        
        {/* Custom Date */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Filter className="h-4 w-4 text-secondary-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setActiveRange('custom'); }}
            className="rounded-lg border border-secondary-300 px-2 py-1"
          />
          <span className="text-secondary-400">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setActiveRange('custom'); }}
            className="rounded-lg border border-secondary-300 px-2 py-1"
          />
          <span className="text-xs text-secondary-400 ml-2">
            {formatDate(startDate)} - {formatDate(endDate)}
            {period?.days > 1 && ` (${period.days} hari)`}
          </span>
        </div>
      </div>

      {/* Main Stats - 4 cols */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Penjualan"
          value={formatCurrency(currentStats?.sales || 0)}
          icon={DollarSign}
          trend={trends?.sales?.value}
          color="bg-green-500"
        />
        <StatCard
          title="Transaksi"
          value={currentStats?.transactions_count || 0}
          icon={ShoppingBag}
          trend={trends?.transactions?.value}
          color="bg-blue-500"
        />
        <StatCard
          title="Rata-rata"
          value={formatCurrency(currentStats?.average_transaction || 0)}
          icon={TrendingUp}
          trend={trends?.average_transaction?.value}
          color="bg-purple-500"
        />
        <StatCard
          title="Item Terjual"
          value={currentStats?.total_items || 0}
          icon={Package}
          color="bg-amber-500"
        />
      </div>

      {/* Charts Section */}
      <CollapsibleSection title="Grafik Penjualan" icon={BarChart3}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 30 Days Trend */}
          <div className="lg:col-span-2">
            <p className="text-sm font-medium text-secondary-700 mb-2">30 Hari Terakhir</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.thirty_days_sales || []}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tickFormatter={(d) => new Date(d).getDate()} stroke="#9ca3af" fontSize={10} />
                  <YAxis tickFormatter={(v) => `Rp${(v/1000000).toFixed(0)}M`} stroke="#9ca3af" fontSize={10} width={50} />
                  <Tooltip formatter={(v) => formatCurrency(v)} labelFormatter={(l) => formatDate(l)} />
                  <Area type="monotone" dataKey="sales" stroke="#10b981" fill="url(#colorSales)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <p className="text-sm font-medium text-secondary-700 mb-2">Metode Pembayaran</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.payment_methods || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="total"
                    nameKey="payment_method"
                  >
                    {(data?.payment_methods || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-2">
              {(data?.payment_methods || []).slice(0, 3).map((m, i) => (
                <div key={m.payment_method} className="flex justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="capitalize">{m.payment_method}</span>
                  </span>
                  <span className="font-medium">{formatCurrency(m.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Top Performers - 3 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Services */}
        <CollapsibleSection title="Layanan Terlaris" icon={Scissors}>
          <MiniList
            items={data?.top_services}
            emptyText="Tidak ada data"
            renderItem={(service, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-secondary-50 rounded-lg text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 flex items-center justify-center bg-white rounded-full text-xs font-bold text-secondary-500 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="truncate">{service.item_name}</span>
                </div>
                <span className="font-semibold text-green-600 flex-shrink-0 ml-2">{formatCurrency(service.total_revenue)}</span>
              </div>
            )}
          />
        </CollapsibleSection>

        {/* Top Products */}
        <CollapsibleSection title="Produk Terlaris" icon={Package}>
          <MiniList
            items={data?.top_products}
            emptyText="Tidak ada data"
            renderItem={(product, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-secondary-50 rounded-lg text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 flex items-center justify-center bg-white rounded-full text-xs font-bold text-secondary-500 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="truncate">{product.item_name}</span>
                </div>
                <span className="font-semibold text-blue-600 flex-shrink-0 ml-2">{formatCurrency(product.total_revenue)}</span>
              </div>
            )}
          />
        </CollapsibleSection>

        {/* Top Barbers */}
        <CollapsibleSection title="Performa Barber" icon={User}>
          <MiniList
            items={data?.top_barbers}
            emptyText="Tidak ada data"
            renderItem={(barber, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-secondary-50 rounded-lg text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                    idx === 0 ? 'bg-yellow-100 text-yellow-600' : idx === 1 ? 'bg-gray-100 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-white text-secondary-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="truncate">{barber.name}</span>
                </div>
                <span className="font-semibold text-purple-600 flex-shrink-0 ml-2">{formatCurrency(barber.total_sales)}</span>
              </div>
            )}
          />
        </CollapsibleSection>
      </div>

      {/* Bottom Section - Hourly + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hourly Distribution */}
        {data?.hourly_distribution?.length > 0 && (
          <CollapsibleSection title="Jam Sibuk" icon={Clock} defaultOpen={false}>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.hourly_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hour" tickFormatter={(h) => `${h}`} stroke="#9ca3af" fontSize={10} />
                  <YAxis stroke="#9ca3af" fontSize={10} />
                  <Tooltip labelFormatter={(h) => `Jam ${h}:00`} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CollapsibleSection>
        )}

        {/* Low Stock Alerts */}
        {data?.low_stock_products?.length > 0 && (
          <CollapsibleSection title={`Stok Menipis (${data.low_stock_products.length})`} icon={Package} defaultOpen={false}>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {data.low_stock_products.map((product) => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-amber-50 rounded-lg text-sm">
                  <span className="truncate">{product.name}</span>
                  <span className="font-bold text-amber-600 flex-shrink-0 ml-2">Stok: {product.stock}</span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
