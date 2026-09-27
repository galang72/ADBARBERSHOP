import React, { useEffect, useState } from 'react';
import { Plus, Receipt, Trash2, User, CreditCard, Calendar, History, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate, formatDateTime } from '../utils/format';
import InputCurrency from '../components/InputCurrency';

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'history'
  const [cart, setCart] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      let url = '/transactions';
      if (activeTab === 'today') {
        url = '/transactions?date=today';
      } else if (startDate && endDate) {
        url = `/transactions?start_date=${startDate}&end_date=${endDate}`;
      }
      
      if (selectedUser) {
        url += url.includes('?') ? `&user_id=${selectedUser}` : `?user_id=${selectedUser}`;
      }

      const [transRes, servicesRes, productsRes, barbersRes] = await Promise.all([
        api.get(url),
        api.get('/services/active'),
        api.get('/products/active'),
        api.get('/barbers/active'),
      ]);
      setTransactions(transRes.data.data || transRes.data);
      setServices(servicesRes.data);
      setProducts(productsRes.data);
      setBarbers(barbersRes.data);
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Only get admin & cashier (who can transact), not barber
      const res = await api.get('/users/cashiers');
      setUsers(res.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const addToCart = (item, type) => {
    const existingItem = cart.find(i => i.item_id === item.id && i.item_type === type);
    if (existingItem) {
      setCart(cart.map(i => 
        i.item_id === item.id && i.item_type === type
          ? { ...i, quantity: i.quantity + 1, total_price: (i.quantity + 1) * i.unit_price }
          : i
      ));
    } else {
      setCart([...cart, {
        item_id: item.id,
        item_type: type,
        item_name: item.name,
        quantity: 1,
        unit_price: item.price,
        total_price: item.price,
      }]);
    }
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);
  const change = parseFloat(paidAmount || 0) - subtotal;

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang masih kosong');
      return;
    }
    if (!paidAmount || parseFloat(paidAmount) < subtotal) {
      toast.error('Jumlah bayar kurang');
      return;
    }

    try {
      await api.post('/transactions', {
        items: cart,
        barber_id: selectedBarber || null,
        payment_method: paymentMethod,
        paid_amount: parseFloat(paidAmount),
        discount_amount: 0,
      });
      toast.success('Transaksi berhasil');
      setIsModalOpen(false);
      setCart([]);
      setPaidAmount('');
      fetchData();
    } catch (error) {
      toast.error('Gagal membuat transaksi');
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header dengan Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-secondary-900">Transaksi</h2>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Transaksi Baru
          </Button>
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
            <Calendar className="h-4 w-4" />
            Hari Ini
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
            Riwayat Lengkap
          </button>
        </div>

        {/* Filter untuk Riwayat */}
        {activeTab === 'history' && (
          <div className="bg-white p-4 rounded-lg border border-secondary-200 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-secondary-700">
              <Filter className="h-4 w-4" />
              Filter Riwayat
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-secondary-500 mb-1">Dari Tanggal</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-secondary-500 mb-1">Sampai Tanggal</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-secondary-500 mb-1">Kasir</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2"
                >
                  <option value="">Semua Kasir</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} {user.deleted_at ? '(Dihapus)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setSelectedUser('');
                  fetchData();
                }}
              >
                Reset
              </Button>
              <Button size="sm" onClick={fetchData}>
                <Search className="h-4 w-4 mr-1" />
                Cari
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {transactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-secondary-400" />
                    <span className="text-sm text-secondary-500">{transaction.invoice_number}</span>
                  </div>
                  <p className="text-xs text-secondary-400 mt-1">
                    {formatDateTime(transaction.created_at)}
                  </p>
                  
                  {/* Info User/Kasir */}
                  {transaction.user && (
                    <div className="flex items-center gap-1 mt-2">
                      <User className="h-3 w-3 text-secondary-400" />
                      <span className={`text-xs ${transaction.user.deleted_at ? 'text-amber-600' : 'text-secondary-600'}`}>
                        Kasir: {transaction.user.name}
                        {transaction.user.deleted_at && ' (Dihapus)'}
                      </span>
                    </div>
                  )}
                  
                  {transaction.barber && (
                    <p className="text-xs text-secondary-500 mt-1">
                      Barber: {transaction.barber.name}
                    </p>
                  )}
                </div>
                <Badge variant={transaction.status === 'completed' ? 'success' : 'warning'}>
                  {transaction.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                </Badge>
              </div>
              
              <div className="mt-3 space-y-1">
                {transaction.items?.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-secondary-600">{item.item_name} x{item.quantity}</span>
                    <span className="text-secondary-900">{formatCurrency(item.total_price)}</span>
                  </div>
                ))}
                {transaction.items?.length > 3 && (
                  <p className="text-xs text-secondary-400">+{transaction.items.length - 3} item lainnya</p>
                )}
              </div>
              
              <div className="mt-3 pt-3 border-t border-secondary-100">
                <div className="flex justify-between items-center">
                  <span className="text-secondary-600">Total</span>
                  <span className="text-xl font-bold text-primary-600">{formatCurrency(transaction.total_amount)}</span>
                </div>
                <div className="flex justify-between text-sm text-secondary-500 mt-1">
                  <span>Bayar: {formatCurrency(transaction.paid_amount)}</span>
                  <span>Kembali: {formatCurrency(transaction.change_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {transactions.length === 0 && (
          <div className="col-span-2 text-center py-12 text-secondary-500">
            <Receipt className="h-12 w-12 mx-auto mb-3 text-secondary-300" />
            <p>{activeTab === 'today' ? 'Tidak ada transaksi hari ini' : 'Tidak ada data transaksi'}</p>
          </div>
        )}
      </div>

      {/* New Transaction Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Transaksi Baru" size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Menu */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Pilih Barber</label>
              <select
                value={selectedBarber}
                onChange={(e) => setSelectedBarber(e.target.value)}
                className="w-full rounded-lg border border-secondary-300 px-3 py-2"
              >
                <option value="">Tanpa Barber</option>
                {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Layanan</label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {services.map(service => (
                  <button
                    key={service.id}
                    onClick={() => addToCart(service, 'service')}
                    className="flex justify-between items-center p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 text-left"
                  >
                    <span className="font-medium">{service.name}</span>
                    <span className="text-primary-600 font-semibold">{formatCurrency(service.price)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Produk</label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {products.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product, 'product')}
                    disabled={product.stock <= 0}
                    className="flex justify-between items-center p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 text-left disabled:opacity-50"
                  >
                    <div>
                      <span className="font-medium">{product.name}</span>
                      <span className="text-xs text-secondary-500 block">Stok: {product.stock}</span>
                    </div>
                    <span className="text-primary-600 font-semibold">{formatCurrency(product.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="space-y-4">
            <div className="bg-secondary-50 rounded-lg p-4 min-h-[200px]">
              <h3 className="font-medium text-secondary-900 mb-3">Keranjang</h3>
              {cart.length === 0 ? (
                <p className="text-secondary-500 text-center py-8">Keranjang kosong</p>
              ) : (
                <div className="space-y-2">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg">
                      <div>
                        <p className="font-medium">{item.item_name}</p>
                        <p className="text-sm text-secondary-500">{item.quantity} x {formatCurrency(item.unit_price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatCurrency(item.total_price)}</span>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span className="font-medium">Total</span>
                <span className="font-bold text-primary-600">{formatCurrency(subtotal)}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Metode Pembayaran</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2"
                >
                  <option value="cash">Tunai</option>
                  <option value="debit">Debit</option>
                  <option value="credit">Kredit</option>
                  <option value="qris">QRIS</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>

              <InputCurrency
                label="Jumlah Bayar"
                value={paidAmount}
                onChange={(value) => setPaidAmount(value)}
              />

              {paidAmount && (
                <div className={`flex justify-between text-lg font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span>Kembali</span>
                  <span>{formatCurrency(Math.max(0, change))}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">Batal</Button>
                <Button onClick={handleSubmit} disabled={cart.length === 0} className="flex-1">Bayar</Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Transaction;
