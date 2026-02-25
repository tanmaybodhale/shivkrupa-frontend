'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import StatsGrid from '@/components/shopkeeper/StatsGrid';
import OrdersTable from '@/components/shopkeeper/OrdersTable';
import Toast from '@/components/shared/Toast';
import { Product, Order } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminPage() {
  const { currentUser, refreshOrders, showToast, setOrders } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'catalog'>('orders');
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
    <>
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mt-8 mb-6 gap-4 flex-wrap">
          <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--dark)' }}>
            🛠️ Admin Dashboard —{' '}
            <span style={{ color: 'var(--gold)' }}>Shivkrupa</span>
          </h2>
          <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
            📞 9975636622 &nbsp;|&nbsp; Admin View
          </span>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className="px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              background: activeTab === 'orders' ? 'var(--gold)' : 'rgba(0,0,0,0.05)',
              color: activeTab === 'orders' ? 'var(--dark)' : 'var(--muted)',
            }}
          >
            📋 Orders
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className="px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              background: activeTab === 'catalog' ? 'var(--gold)' : 'rgba(0,0,0,0.05)',
              color: activeTab === 'catalog' ? 'var(--dark)' : 'var(--muted)',
            }}
          >
            🛍️ Catalog
          </button>
        </div>

        {activeTab === 'orders' && (
          <>
            <StatsGrid />
            <OrdersTable />
          </>
        )}

        {activeTab === 'catalog' && (
          <CatalogManager showToast={showToast} />
        )}
      </div>
      <Toast />
    </>
  );
}

function CatalogManager({ showToast }: { showToast: (msg: string) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [loading, setLoading] = useState(true);

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
    if (!confirm('Delete this product?')) return;
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

  if (loading) {
    return <div className="text-center py-10">Loading products...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-bold text-lg">Product Catalog ({products.length} items)</h3>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
        >
          + Add Product
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Image</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">MRP</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Qty</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id} className="border-t hover:bg-gray-50">
                {editingId === product._id ? (
                  <>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editForm.image || ''}
                        onChange={e => setEditForm({ ...editForm, image: e.target.value })}
                        className="w-16 h-16 object-cover rounded border px-1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        className="border rounded px-2 py-1 w-32"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editForm.category || ''}
                        onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                        className="border rounded px-2 py-1 w-24"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={editForm.price || 0}
                        onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                        className="border rounded px-2 py-1 w-20"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={editForm.mrp || 0}
                        onChange={e => setEditForm({ ...editForm, mrp: Number(e.target.value) })}
                        className="border rounded px-2 py-1 w-20"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={editForm.quantity === undefined || editForm.quantity === null ? '' : editForm.quantity}
                        onChange={e => {
                          const val = e.target.value;
                          setEditForm({ ...editForm, quantity: val === '' ? null : Number(val) });
                        }}
                        className="border rounded px-2 py-1 w-16"
                        placeholder="∞"
                        min="1"
                      />
                      <span className="text-xs text-gray-400 ml-1">∞</span>
                    </td>
                    <td className="px-4 py-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editForm.inStock || false}
                          onChange={e => setEditForm({ ...editForm, inStock: e.target.checked })}
                          className="mr-1"
                        />
                        In Stock
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={handleSave} className="text-green-600 font-medium mr-2">Save</button>
                      <button onClick={handleCancel} className="text-gray-500">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3">
                      <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                    </td>
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--gold-dark)' }}>₹{product.price}</td>
                    <td className="px-4 py-3 text-gray-400 line-through">₹{product.mrp}</td>
                    <td className="px-4 py-3 text-sm">{product.quantity === undefined || product.quantity === null ? '∞' : product.quantity}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleEdit(product)} className="text-blue-600 hover:underline mr-3">Edit</button>
                      <button onClick={() => product._id && handleDelete(product._id)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No products in catalog. Click "Add Product" to get started.
        </div>
      )}
    </div>
  );
}
