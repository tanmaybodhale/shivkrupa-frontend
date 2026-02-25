'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Toast from '@/components/shared/Toast';
import { Order } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CustomerOrdersPage() {
  const { currentUser, orders, fetchOrders, showToast } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!currentUser) {
      router.replace('/');
      return;
    }
    if (currentUser.role === 'shopkeeper') {
      router.replace('/admin');
      return;
    }
    fetchOrders().finally(() => setLoading(false));
  }, [currentUser, router, fetchOrders, mounted]);

  useEffect(() => {
    if (!mounted || !currentUser || currentUser.role !== 'customer') return;
    
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentUser, fetchOrders, mounted]);

  if (!currentUser || currentUser.role !== 'customer') return null;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-screen-xl mx-auto px-4 py-10 text-center">
          <p>Loading orders...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-4 pb-20">
        <div className="flex items-center gap-4 mt-8 mb-6">
          <button
            onClick={() => router.push('/customer')}
            className="flex items-center justify-center w-10 h-10 rounded-lg"
            style={{ background: 'var(--gold-pale)', border: '1px solid rgba(201,148,26,.3)' }}
          >
            ←
          </button>
          <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--dark)' }}>
            📦 My Orders
          </h2>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
            <div className="text-6xl mb-4">🛍️</div>
            <h4 className="text-lg font-bold" style={{ color: 'var(--dark)' }}>No orders yet</h4>
            <p className="text-sm mt-1">Start shopping to see your orders here!</p>
            <button
              onClick={() => router.push('/customer')}
              className="btn-gold mt-4 px-6 py-3"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order.orderId}
                className="bg-white rounded-xl shadow-sm overflow-hidden border"
                style={{ border: '1px solid #e0e0e0' }}
              >
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b" style={{ borderColor: '#e0e0e0' }}>
                  <div>
                    <span className="font-bold text-sm" style={{ color: 'var(--dark)' }}>Order #{order.orderId}</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--muted)' }}>{order.timeStr}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100'}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <span className="text-xl">📦</span>
                        )}
                        <span className="flex-1">{item.name}</span>
                        <span style={{ color: 'var(--muted)' }}>×{item.qty}</span>
                        <span className="font-semibold">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: '#e0e0e0' }}>
                    <div>
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>Total</span>
                      <span className="ml-2 font-display font-bold text-lg" style={{ color: 'var(--dark)' }}>₹{order.total}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>Payment</span>
                      <span className="ml-2 text-sm font-medium">
                        {order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Toast />
    </>
  );
}
