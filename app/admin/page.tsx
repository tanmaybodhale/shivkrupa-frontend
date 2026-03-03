'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';
import StatsGrid from '@/components/shopkeeper/StatsGrid';
import OrdersTable from '@/components/shopkeeper/OrdersTable';
import UsersMap from '@/components/shopkeeper/UsersMap';
import Toast from '@/components/shared/Toast';
import { Product, Order } from '@/lib/types';
import { Plus, Pencil, Trash2, Check, X, Package, ClipboardList, Infinity as InfinityIcon, Map, Upload, ImageIcon, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminPage() {
  const { currentUser, refreshOrders, showToast, setOrders } = useApp();
  const { isDark } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'catalog' | 'map'>('orders');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!currentUser) {
      router.replace('/admin/login');
      return;
    }
    if (currentUser.role !== 'shopkeeper') {
      router.replace('/');
      return;
    }
  }, [currentUser, router, mounted]);

  useEffect(() => {
    if (mounted && currentUser?.role === 'shopkeeper') {
      fetchOrders();
    }
  }, [mounted, currentUser]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders/all`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  if (!currentUser || currentUser.role !== 'shopkeeper') return null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0f0d1a]' : 'bg-slate-50/50'}`}>
      <Navbar />

      <div className="max-w-screen-xl mx-auto px-4 pb-20 pt-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className={`text-3xl font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              <span className={`text-transparent bg-clip-text ${isDark ? 'bg-gradient-to-r from-indigo-400 to-purple-400' : 'bg-gradient-to-r from-orange-500 to-yellow-500'}`}>
                Admin Dashboard
              </span>
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-100 text-orange-700'}`}>
                Admin View
              </span>
              <span className={`text-sm font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                📞 9975636622
              </span>
            </div>
          </div>

          {/* Blinkit-Style Segmented Tabs */}
          <div className={`inline-flex p-1.5 border rounded-2xl shadow-sm ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'orders'
                ? (isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-900/30' : 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md shadow-orange-200')
                : (isDark ? 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50')
                }`}
            >
              <ClipboardList size={18} />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'catalog'
                ? (isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-900/30' : 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md shadow-orange-200')
                : (isDark ? 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50')
                }`}
            >
              <Package size={18} />
              Catalog
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'map'
                ? (isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-900/30' : 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md shadow-orange-200')
                : (isDark ? 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50')
                }`}
            >
              <Map size={18} />
              Map
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <StatsGrid />
              <OrdersTable />
            </div>
          )}

          {activeTab === 'catalog' && (
            <CatalogManager showToast={showToast} />
          )}

          {activeTab === 'map' && (
            <UsersMap />
          )}
        </div>

      </div>
      <Toast />
    </div>
  );
}

function CatalogManager({ showToast }: { showToast: (msg: string) => void }) {
  const { isDark } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/catalog`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product._id || null);
    setEditForm({ ...product });
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`${API_URL}/catalog/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.map(p => p._id === editingId ? data.product : p));
        setEditingId(null);
        setEditForm({});
        showToast('✅ Product updated!');
      }
    } catch (error) {
      showToast('❌ Failed to update product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_URL}/catalog/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter(p => p._id !== id));
        showToast('✅ Product deleted!');
      }
    } catch (error) {
      showToast('❌ Failed to delete product');
    }
  };

  const handleAddNew = async () => {
    const newProduct = {
      name: 'New Product',
      category: 'General',
      price: 0,
      mrp: 0,
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300',
      unit: 'piece',
      inStock: true,
      isNew: true,
      tag: '',
    };
    try {
      const res = await fetch(`${API_URL}/catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (data.success) {
        setProducts([data.product, ...products]);
        handleEdit(data.product);
        showToast('✅ Product created! Edit details below.');
      }
    } catch (error) {
      showToast('❌ Failed to create product');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const uploadImage = async (file: File) => {
    if (!file) return;

    // Validate on frontend too
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      showToast(`❌ Invalid file type: ${file.type}. Only JPEG, PNG, WebP, and GIF are allowed.`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('❌ File too large. Maximum size is 5 MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        showToast(`❌ Upload failed: ${data.message}`);
        return;
      }

      setEditForm(prev => ({ ...prev, image: data.url }));
      showToast('✅ Image uploaded!');
    } catch (error: any) {
      console.error('Upload error:', error);
      showToast(`❌ Upload failed: ${error.message || 'Network error. Is the backend running?'}`);
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 rounded-3xl border shadow-sm ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
        <div className={`w-8 h-8 border-4 rounded-full animate-spin mb-4 ${isDark ? 'border-indigo-900 border-t-indigo-500' : 'border-orange-200 border-t-orange-500'}`} />
        <p className="font-bold text-gray-500">Loading catalog...</p>
      </div>
    );
  }

  return (
    <div className={`rounded-[2rem] shadow-sm overflow-hidden border ${isDark ? 'bg-[#1a1535] border-[#2d2450] shadow-black/10' : 'bg-white border-orange-100/50 shadow-orange-900/5'}`}>

      {/* Table Header / Action Bar */}
      <div className={`p-5 sm:p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDark ? 'border-[#2d2450] bg-[#13102a]/50' : 'border-gray-100 bg-orange-50/30'}`}>
        <div>
          <h3 className={`font-black text-xl ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Product Catalog</h3>
          <p className="text-sm font-medium text-gray-500 mt-0.5">
            Manage your {products.length} store items
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 ${isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-900/30' : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-orange-200'}`}
        >
          <Plus size={18} strokeWidth={3} />
          Add Product
        </button>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className={`border-b ${isDark ? 'bg-[#13102a]/50 border-[#2d2450]' : 'bg-gray-50/80 border-gray-100'}`}>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Image</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Name</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Category</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Price / MRP</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Qty</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#2d2450]' : 'divide-gray-100'}`}>
            {products.map(product => (
              <tr key={product._id} className={`transition-colors group ${isDark ? 'hover:bg-indigo-500/5' : 'hover:bg-orange-50/30'}`}>

                {editingId === product._id ? (
                  /* --- EDIT MODE ROW --- */
                  <>
                    <td className="px-6 py-3">
                      <div className="relative group/img">
                        {/* Hidden file input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) uploadImage(file);
                          }}
                        />
                        {/* Clickable image preview / upload button */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all cursor-pointer ${isDark
                              ? 'border-[#2d2450] bg-[#13102a] hover:border-indigo-500 hover:bg-indigo-500/10'
                              : 'border-orange-200 bg-orange-50/30 hover:border-orange-400 hover:bg-orange-50'
                            } ${uploading ? 'opacity-60 cursor-wait' : ''}`}
                          title={uploading ? 'Uploading...' : 'Click to upload image'}
                        >
                          {uploading ? (
                            <Loader2 size={20} className="animate-spin text-gray-400" />
                          ) : editForm.image?.startsWith('http') ? (
                            <img src={editForm.image} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center gap-0.5">
                              <Upload size={16} className={isDark ? 'text-indigo-400' : 'text-orange-400'} />
                              <span className="text-[8px] font-bold text-gray-400">Upload</span>
                            </div>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full min-w-[140px] px-3 py-2 rounded-xl border border-orange-200 bg-orange-50/30 text-sm font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="text"
                        value={editForm.category || ''}
                        onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                        className="w-28 px-3 py-2 rounded-xl border border-orange-200 bg-orange-50/30 text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all capitalize"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400">₹</span>
                          <input
                            type="number"
                            value={editForm.price || 0}
                            onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                            className="w-20 px-2 py-1.5 rounded-lg border border-orange-200 bg-orange-50/30 text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                            title="Selling Price"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 line-through">₹</span>
                          <input
                            type="number"
                            value={editForm.mrp || 0}
                            onChange={e => setEditForm({ ...editForm, mrp: Number(e.target.value) })}
                            className="w-20 px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 focus:bg-white focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 outline-none transition-all"
                            title="MRP"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editForm.quantity === undefined || editForm.quantity === null ? '' : editForm.quantity}
                          onChange={e => {
                            const val = e.target.value;
                            setEditForm({ ...editForm, quantity: val === '' ? null : Number(val) });
                          }}
                          className="w-16 px-2 py-2 rounded-xl border border-orange-200 bg-orange-50/30 text-sm font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-center"
                          placeholder="∞"
                          min="1"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <label className="flex items-center gap-2 cursor-pointer group/check">
                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${editForm.inStock ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300 group-hover/check:border-gray-400'
                          }`}>
                          <Check size={14} className={`text-white transition-opacity ${editForm.inStock ? 'opacity-100' : 'opacity-0'}`} />
                        </div>
                        <input
                          type="checkbox"
                          checked={editForm.inStock || false}
                          onChange={e => setEditForm({ ...editForm, inStock: e.target.checked })}
                          className="hidden"
                        />
                        <span className="text-sm font-bold text-gray-700">In Stock</span>
                      </label>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={handleSave}
                          className="p-2 bg-green-100 text-green-700 hover:bg-green-500 hover:text-white rounded-xl transition-colors shadow-sm"
                          title="Save Changes"
                        >
                          <Check size={18} strokeWidth={3} />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-xl transition-colors shadow-sm"
                          title="Cancel"
                        >
                          <X size={18} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  /* --- VIEW MODE ROW --- */
                  <>
                    <td className="px-6 py-4">
                      <div className="w-14 h-14 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden">
                        {product.image?.startsWith('http') ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">{product.emoji || '📦'}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-sm">{product.name}</div>
                      {product.tag && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-wider rounded-md">
                          {product.tag}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 text-sm">₹{product.price}</span>
                        {product.mrp > product.price && (
                          <span className="text-[11px] font-semibold text-gray-400 line-through">₹{product.mrp}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.quantity === undefined || product.quantity === null ? (
                        <div className="flex items-center text-gray-400" title="Unlimited Stock">
                          <InfinityIcon size={20} />
                        </div>
                      ) : (
                        <span className={`font-bold text-sm ${product.quantity <= 3 ? 'text-red-500' : 'text-gray-700'}`}>
                          {product.quantity}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${product.inStock
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-orange-500 bg-orange-50 hover:bg-orange-500 hover:text-white rounded-xl transition-colors"
                          title="Edit Product"
                        >
                          <Pencil size={16} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => product._id && handleDelete(product._id)}
                          className="p-2 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
            <Package size={32} className="text-orange-300" />
          </div>
          <h4 className="text-lg font-bold text-gray-900">Your catalog is empty</h4>
          <p className="text-gray-500 text-sm mt-1 max-w-sm">
            You haven't added any products yet. Click the "Add Product" button to start building your store.
          </p>
        </div>
      )}
    </div>
  );
}