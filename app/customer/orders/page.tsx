'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Toast from '@/components/shared/Toast';
import { 
  Package, 
  ChevronLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShoppingBag,
  CreditCard,
  Banknote
} from 'lucide-react';

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

  // Enhanced status configurations for Blinkit-style badges
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Clock size={16} /> };
      case 'confirmed':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: <Package size={16} /> };
      case 'delivered':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle2 size={16} /> };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: <XCircle size={16} /> };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <Package size={16} /> };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50/30">
        <Navbar />
        <div className="max-w-screen-sm mx-auto px-4 py-8">
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-10 w-48 bg-orange-100 rounded-xl mb-4"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-white rounded-3xl border border-orange-100"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      
      {/* Container - constrained width for that app-like feel on desktop */}
      <div className="max-w-screen-md mx-auto px-4 pb-24 pt-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 sticky top-[72px] bg-slate-50/90 backdrop-blur-md z-10 py-2">
          <button
            onClick={() => router.push('/customer')}
            className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white border border-orange-100 shadow-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-black tracking-tight text-gray-900">
            My Orders
          </h2>
        </div>

        {orders.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-orange-100 shadow-sm mt-10">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={48} className="text-orange-300" strokeWidth={1.5} />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h4>
            <p className="text-gray-500 text-sm mb-8 max-w-xs">
              Looks like you haven't placed any orders. Start filling up your basket!
            </p>
            <button
              onClick={() => router.push('/customer')}
              className="px-8 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-lg shadow-orange-200 transition-all active:scale-95"
            >
              Browse Products
            </button>
          </div>
        ) : (
          /* Order List */
          <div className="space-y-5">
            {orders.map(order => {
              const status = getStatusConfig(order.status);
              
              return (
                <div
                  key={order.orderId}
                  className="bg-white rounded-[1.5rem] shadow-sm shadow-orange-900/5 overflow-hidden border border-orange-100/50"
                >
                  {/* Card Header */}
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-orange-50/20">
                    <div>
                      <span className="block font-black text-gray-900">Order #{order.orderId}</span>
                      <span className="block text-xs font-medium text-gray-500 mt-0.5">{order.timeStr}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${status.color}`}>
                      {status.icon}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </div>

                  {/* Card Body (Items) */}
                  <div className="p-5">
                    <div className="space-y-4">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                          {/* Item Thumbnail */}
                          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package size={24} className="text-gray-300" />
                            )}
                          </div>
                          
                          {/* Item Details */}
                          <div className="flex-1 min-w-0 pt-1">
                            <h5 className="text-sm font-bold text-gray-800 truncate">{item.name}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
                                Qty: {item.qty}
                              </span>
                              <span className="text-sm font-bold text-gray-900">
                                ₹{item.price * item.qty}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-orange-500">
                        {order.paymentMethod === 'cod' ? <Banknote size={16} /> : <CreditCard size={16} />}
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Payment</span>
                        <span className="block text-xs font-bold text-gray-700">
                          {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Paid'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Amount</span>
                      <span className="block text-lg font-black text-orange-600">₹{order.total}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Toast />
    </div>
  );
}