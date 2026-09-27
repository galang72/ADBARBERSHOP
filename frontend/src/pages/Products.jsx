import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Package, Search, Upload, Image as ImageIcon, X } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Badge from '../components/Badge';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';
import IconPicker, { iconMap } from '../components/IconPicker';
import InputCurrency from '../components/InputCurrency';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageTab, setImageTab] = useState('photo'); // 'photo' | 'icon'
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    photo: '',
    icon: '',
    price: '',
    cost_price: '',
    stock: '0',
    min_stock: '5',
    category: 'pomade',
    unit: 'pcs',
    status: 'active',
  });

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      const params = search ? { search } : {};
      const response = await api.get('/products', { params });
      setProducts(response.data.data || response.data);
    } catch (error) {
      toast.error('Gagal memuat data produk');
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
    formDataUpload.append('folder', 'products');

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
        cost_price: parseFloat(formData.cost_price) || 0,
        stock: parseInt(formData.stock),
        min_stock: parseInt(formData.min_stock),
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, data);
        toast.success('Produk berhasil diupdate');
      } else {
        await api.post('/products', data);
        toast.success('Produk berhasil ditambahkan');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error('Gagal menyimpan produk');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Produk berhasil dihapus');
      fetchProducts();
    } catch (error) {
      toast.error('Gagal menghapus produk');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    const hasPhoto = product.photo && product.photo !== '';
    const hasIcon = product.icon && product.icon !== '';
    setImageTab(hasPhoto || (!hasPhoto && !hasIcon) ? 'photo' : 'icon');
    setFormData({
      name: product.name,
      sku: product.sku || '',
      description: product.description || '',
      photo: product.photo || '',
      icon: product.icon || '',
      price: product.price.toString(),
      cost_price: product.cost_price?.toString() || '',
      stock: product.stock.toString(),
      min_stock: product.min_stock.toString(),
      category: product.category,
      unit: product.unit,
      status: product.status,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setImageTab('photo');
    setFormData({
      name: '',
      sku: '',
      description: '',
      photo: '',
      icon: '',
      price: '',
      cost_price: '',
      stock: '0',
      min_stock: '5',
      category: 'pomade',
      unit: 'pcs',
      status: 'active',
    });
  };

  const categories = {
    pomade: 'Pomade',
    shampoo: 'Shampoo',
    conditioner: 'Conditioner',
    tools: 'Alat',
    other: 'Lainnya',
  };

  const getStockStatus = (stock, minStock) => {
    if (stock <= 0) return { label: 'Habis', variant: 'danger' };
    if (stock <= minStock) return { label: 'Stok Rendah', variant: 'warning' };
    return { label: 'Tersedia', variant: 'success' };
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold text-secondary-900">Daftar Produk</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-secondary-300 rounded-lg w-full sm:w-64"
            />
          </div>
          <Button onClick={() => { resetForm(); setEditingProduct(null); setIsModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const stockStatus = getStockStatus(product.stock, product.min_stock);
          const ProductIcon = product.icon && iconMap[product.icon] ? iconMap[product.icon].Icon : Package;
          return (
            <Card key={product.id} className={product.status === 'inactive' ? 'opacity-60' : ''}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {product.photo ? (
                      <img 
                        src={product.photo} 
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : product.icon && iconMap[product.icon] ? (
                      <div className="p-3 bg-primary-100 rounded-lg">
                        <ProductIcon className="h-5 w-5 text-primary-600" />
                      </div>
                    ) : (
                      <div className="p-3 bg-primary-100 rounded-lg">
                        <Package className="h-5 w-5 text-primary-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-secondary-900">{product.name}</h3>
                      <p className="text-sm text-secondary-500">{categories[product.category] || product.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-secondary-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-primary-600">
                      {formatCurrency(product.price)}
                    </span>
                    <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                  </div>
                  <div className="flex justify-between text-sm text-secondary-500">
                    <span>Stok: {product.stock} {product.unit}</span>
                    <span>Min: {product.min_stock}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Produk' : 'Tambah Produk'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Produk"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="SKU"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          />
          
          {/* Pilihan: Foto atau Icon */}
          <div className="bg-secondary-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-secondary-700">Gambar Produk</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, photo: '', icon: '' })}
                className="text-xs text-secondary-500 hover:text-secondary-700"
              >
                Reset
              </button>
            </div>
            
            {/* Tabs */}
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

            {/* Upload Photo */}
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

            {/* Icon Picker */}
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
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Kategori</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-lg border border-secondary-300 px-3 py-2"
            >
              <option value="pomade">Pomade</option>
              <option value="shampoo">Shampoo</option>
              <option value="conditioner">Conditioner</option>
              <option value="tools">Alat</option>
              <option value="other">Lainnya</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputCurrency
              label="Harga Jual"
              value={formData.price}
              onChange={(value) => setFormData({ ...formData, price: value })}
              required
            />
            <InputCurrency
              label="Harga Modal"
              value={formData.cost_price}
              onChange={(value) => setFormData({ ...formData, cost_price: value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Stok"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
            <Input
              label="Stok Min"
              type="number"
              value={formData.min_stock}
              onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Satuan</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full rounded-lg border border-secondary-300 px-3 py-2"
              >
                <option value="pcs">Pcs</option>
                <option value="botol">Botol</option>
                <option value="tube">Tube</option>
              </select>
            </div>
          </div>
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
              {editingProduct ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
