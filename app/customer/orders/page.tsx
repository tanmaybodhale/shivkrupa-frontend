'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
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
  Banknote,
  Truck,
  MapPin,
} from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Order progress config
const ORDER_STEPS = [
  { key: 'pending',    label: 'Placed',      percent: 25, icon: '📦' },
  { key: 'confirmed', label: 'Confirmed',    percent: 50, icon: '✅' },
  { key: 'dispatched', label: 'On the Way', percent: 75, icon: '🚚' },
  { key: 'delivered', label: 'Delivered',    percent: 100, icon: '🏠' },
];

function getProgress(status: string): number {
  if (status === 'cancelled') return 0;
  const step = ORDER_STEPS.find(s => s.key === status);
  return step ? step.percent : 25;
}

function OrderProgressBar({ status, isDark }: { status: string; isDark: boolean }) {
  const progress = getProgress(status);
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className={`mt-4 mb-1 px-1`}>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
          <XCircle size={16} className="text-red-500" />
          <span className="text-xs font-bold text-red-500">Order Cancelled</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 mb-1 px-1">
      {/* Progress bar track */}
      <div className={`relative h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#2d2450]' : 'bg-gray-100'}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${isDark ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gradient-to-r from-orange-400 to-yellow-400'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex justify-between mt-2">
        {ORDER_STEPS.map((step, idx) => {
          const stepPercent = step.percent;
          const isCompleted = progress >= stepPercent;
          const isActive = progress >= stepPercent && (idx === ORDER_STEPS.length - 1 || progress < ORDER_STEPS[idx + 1].percent);

          return (
            <div key={step.key} className="flex flex-col items-center gap-0.5 text-center" style={{ width: `${100 / ORDER_STEPS.length}%` }}>
              <span className={`text-base transition-all ${isCompleted ? 'opacity-100 scale-110' : 'opacity-30 scale-90'}`}>
                {step.icon}
              </span>
              <span className={`text-[9px] font-bold leading-tight ${
                isActive
                  ? (isDark ? 'text-indigo-400' : 'text-orange-600')
                  : isCompleted
                    ? (isDark ? 'text-gray-300' : 'text-gray-700')
                    : (isDark ? 'text-gray-600' : 'text-gray-400')
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Percentage badge */}
      <div className="flex justify-end mt-1">
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-100 text-orange-600'}`}>
          {progress}%
        </span>
      </div>
    </div>
  );
}

export default function CustomerOrdersPage() {
  const { currentUser, orders, fetchOrders, showToast } = useApp();
  const { isDark } = useTheme();
  const { t } = useLang();
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

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Clock size={16} /> };
      case 'confirmed':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: <Package size={16} /> };
      case 'dispatched':
        return { color: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: <Truck size={16} /> };
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
      <div className={`min-h-screen ${isDark ? 'bg-[#0f0d1a]' : 'bg-orange-50/30'}`}>
        <Navbar />
        <div className="max-w-screen-sm mx-auto px-4 py-8">
          <div className="animate-pulse flex flex-col gap-4">
            <div className={`h-10 w-48 rounded-xl mb-4 ${isDark ? 'bg-[#1a1535]' : 'bg-orange-100'}`}></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-40 rounded-3xl border ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0f0d1a]' : 'bg-slate-50/50'}`}>
      <Navbar />

      <div className="max-w-screen-md mx-auto px-4 pb-24 pt-6">

        {/* Header */}
        <div className={`flex items-center gap-4 mb-6 sticky top-[72px] backdrop-blur-md z-10 py-2 ${isDark ? 'bg-[#0f0d1a]/90' : 'bg-slate-50/90'}`}>
          <button
            onClick={() => router.push('/customer')}
            className={`flex items-center justify-center w-10 h-10 rounded-2xl border shadow-sm transition-colors active:scale-95 ${isDark ? 'bg-[#1a1535] border-[#2d2450] text-gray-400 hover:bg-indigo-500/10 hover:text-indigo-400' : 'bg-white border-orange-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {t('myOrders')}
            </h2>
            {orders.length > 0 && (
              <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {orders.length} order{orders.length !== 1 ? 's' : ''} total
              </p>
            )}
          </div>
        </div>

        {orders.length === 0 ? (
          /* Empty State */
          <div className={`flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border shadow-sm mt-10 ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-indigo-500/10' : 'bg-orange-50'}`}>
              <ShoppingBag size={48} className="text-orange-300" strokeWidth={1.5} />
            </div>
            <h4 className={`text-xl font-bold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{t('noOrders')}</h4>
            <p className={`text-sm mb-8 max-w-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Looks like you haven&apos;t placed any orders. Start filling up your basket!
            </p>
            <button
              onClick={() => router.push('/customer')}
              className={`px-8 py-3.5 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 ${isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-900/50' : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-orange-200'}`}
            >
              {t('startShopping')}
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
                  className={`rounded-[1.5rem] shadow-sm overflow-hidden border ${isDark ? 'bg-[#1a1535] border-[#2d2450] shadow-black/10' : 'bg-white border-orange-100/50 shadow-orange-900/5'}`}
                >
                  {/* Card Header */}
                  <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-[#2d2450] bg-[#13102a]/50' : 'border-gray-100 bg-orange-50/20'}`}>
                    <div>
                      <span className={`block font-black ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Order #{order.orderId}</span>
                      <span className={`block text-xs font-medium mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{order.timeStr}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${status.color}`}>
                      {status.icon}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className={`px-5 pt-3 pb-2 border-b ${isDark ? 'border-[#2d2450]' : 'border-gray-100'}`}>
                    <OrderProgressBar status={order.status} isDark={isDark} />
                  </div>

                  {/* Card Body (Items) */}
                  <div className="p-5">
                    <div className="space-y-4">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                          {/* Item Thumbnail */}
                          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center overflow-hidden shrink-0 ${isDark ? 'bg-[#13102a] border-[#2d2450]' : 'bg-gray-50 border-gray-100'}`}>
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package size={24} className="text-gray-300" />
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0 pt-1">
                            <h5 className={`text-sm font-bold truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{item.name}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${isDark ? 'text-gray-500 bg-[#13102a]' : 'text-gray-500 bg-gray-100'}`}>
                                Qty: {item.qty}
                              </span>
                              <span className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                ₹{item.price * item.qty}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {order.deliveryAddress && (order.deliveryAddress.street || order.deliveryAddress.area) && (
                    <div className={`px-5 py-3 border-t flex items-start gap-2 ${isDark ? 'border-[#2d2450]' : 'border-gray-100'}`}>
                      <MapPin size={14} className={`mt-0.5 shrink-0 ${isDark ? 'text-indigo-400' : 'text-orange-500'}`} />
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {[order.deliveryAddress.street, order.deliveryAddress.area, order.deliveryAddress.city].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className={`px-5 py-4 flex items-center justify-between border-t ${isDark ? 'bg-[#13102a]/50 border-[#2d2450]' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${isDark ? 'bg-[#1a1535] text-indigo-400' : 'bg-white text-orange-500'}`}>
                        {order.paymentMethod === 'cod' ? <Banknote size={16} /> : <CreditCard size={16} />}
                      </div>
                      <div>
                        <span className={`block text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>Payment</span>
                        <span className={`block text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {order.paymentMethod === 'cod' ? t('cashOnDelivery') : t('online')}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`block text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>Total Amount</span>
                      <span className={`block text-lg font-black ${isDark ? 'text-indigo-400' : 'text-orange-600'}`}>₹{order.total}</span>
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