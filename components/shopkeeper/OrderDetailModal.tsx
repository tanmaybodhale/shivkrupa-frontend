'use client';

import { Order } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { X, User, Phone, Clock, Package, CheckCircle2, XCircle, Timer, ClipboardCheck, MapPin, Navigation } from 'lucide-react';

interface Props {
  order: Order;
  onClose: () => void;
  onUpdated: (order: Order) => void;
}

export default function OrderDetailModal({ order, onClose, onUpdated }: Props) {
  const { updateOrderStatus, showToast } = useApp();
  const { isDark } = useTheme();

  const handleStatus = (status: Order['status']) => {
    updateOrderStatus(order.orderId, status);
    const updated: Order = { ...order, status };
    onUpdated(updated);
    showToast(`✅ Order ${order.orderId} marked as ${status}`);
  };

  const freeDelivery = order.delivery === 0;

  const getStatusConfig = (s: Order['status'], isActive: boolean) => {
    switch (s) {
      case 'pending':
        return {
          icon: <Timer size={16} />,
          style: isActive
            ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-200'
            : (isDark ? 'bg-[#1a1535] text-amber-400 border-amber-700/50 hover:bg-amber-900/20' : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50')
        };
      case 'confirmed':
        return {
          icon: <ClipboardCheck size={16} />,
          style: isActive
            ? 'bg-blue-500 text-white border-blue-600 shadow-md shadow-blue-200'
            : (isDark ? 'bg-[#1a1535] text-blue-400 border-blue-700/50 hover:bg-blue-900/20' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50')
        };
      case 'delivered':
        return {
          icon: <CheckCircle2 size={16} />,
          style: isActive
            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-200'
            : (isDark ? 'bg-[#1a1535] text-emerald-400 border-emerald-700/50 hover:bg-emerald-900/20' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50')
        };
      case 'cancelled':
        return {
          icon: <XCircle size={16} />,
          style: isActive
            ? 'bg-red-500 text-white border-red-600 shadow-md shadow-red-200'
            : (isDark ? 'bg-[#1a1535] text-red-400 border-red-700/50 hover:bg-red-900/20' : 'bg-white text-red-700 border-red-200 hover:bg-red-50')
        };
      default:
        return { icon: <Package size={16} />, style: '' };
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[400] flex items-end sm:items-center justify-center backdrop-blur-sm p-0 sm:p-5 transition-opacity ${isDark ? 'bg-black/50' : 'bg-slate-900/40'}`}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300 flex flex-col max-h-[90vh] ${isDark ? 'bg-[#13102a]' : 'bg-white'}`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
          <div>
            <h3 className={`font-black text-xl tracking-tight ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Order Details
            </h3>
            <p className={`text-xs font-bold mt-0.5 tracking-wider uppercase ${isDark ? 'text-indigo-400' : 'text-orange-500'}`}>
              #{order.orderId}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border active:scale-95 ${isDark ? 'bg-[#1a1535] border-[#2d2450] text-gray-500 hover:bg-indigo-500/10 hover:text-indigo-400' : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-orange-50 hover:text-orange-600'}`}
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">

          {/* Customer Info Card */}
          <div>
            <p className={`text-[10px] uppercase tracking-[0.15em] font-black mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Customer Info
            </p>
            <div className={`grid grid-cols-2 gap-3 rounded-2xl p-4 border ${isDark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-orange-50/50 border-orange-100/50'}`}>
              <div className="flex flex-col gap-1">
                <div className={`flex items-center gap-1.5 ${isDark ? 'text-indigo-400' : 'text-orange-400'}`}>
                  <User size={14} />
                  <span className="text-[10px] uppercase tracking-wider font-bold">Name</span>
                </div>
                <p className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{order.name}</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className={`flex items-center gap-1.5 ${isDark ? 'text-indigo-400' : 'text-orange-400'}`}>
                  <Phone size={14} />
                  <span className="text-[10px] uppercase tracking-wider font-bold">Phone</span>
                </div>
                <p className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{order.phone}</p>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <div className={`flex items-center gap-1.5 ${isDark ? 'text-indigo-400' : 'text-orange-400'}`}>
                  <Clock size={14} />
                  <span className="text-[10px] uppercase tracking-wider font-bold">Time</span>
                </div>
                <p className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{order.timeStr}</p>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <div className={`flex items-center gap-1.5 ${isDark ? 'text-indigo-400' : 'text-orange-400'}`}>
                  <Package size={14} />
                  <span className="text-[10px] uppercase tracking-wider font-bold">Status</span>
                </div>
                <p className={`text-sm font-black capitalize ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{order.status}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {(order.deliveryAddress?.street || order.deliveryAddress?.area || order.deliveryAddress?.location) && (
            <div>
              <p className={`text-[10px] uppercase tracking-[0.15em] font-black mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Delivery Address
              </p>
              <div className={`rounded-2xl p-4 border space-y-2 ${isDark ? 'bg-emerald-900/10 border-emerald-900/20' : 'bg-emerald-50/50 border-emerald-100/50'}`}>
                {order.deliveryAddress?.street && (
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{order.deliveryAddress.street}</p>
                  </div>
                )}
                {order.deliveryAddress?.area && (
                  <p className={`text-sm pl-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{order.deliveryAddress.area}</p>
                )}
                {(order.deliveryAddress?.city || order.deliveryAddress?.state || order.deliveryAddress?.pincode) && (
                  <p className={`text-sm pl-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {[order.deliveryAddress.city, order.deliveryAddress.state, order.deliveryAddress.pincode].filter(Boolean).join(', ')}
                  </p>
                )}
                {order.deliveryAddress?.location && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryAddress.location.lat},${order.deliveryAddress.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-2 pl-6"
                  >
                    <Navigation size={14} />
                    Get Directions
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Items Ordered */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-[10px] uppercase tracking-[0.15em] font-black ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Items Ordered
              </p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isDark ? 'text-indigo-300 bg-indigo-900/30' : 'text-gray-500 bg-gray-100'}`}>
                {order.items.length} items
              </span>
            </div>
            <div className={`rounded-2xl border overflow-hidden shadow-sm ${isDark ? 'bg-[#1a1535] border-[#2d2450] shadow-black/10' : 'bg-white border-gray-100 shadow-gray-200/20'}`}>
              <div className={`divide-y ${isDark ? 'divide-[#2d2450]' : 'divide-gray-50'}`}>
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center overflow-hidden shrink-0 ${isDark ? 'bg-[#13102a] border-[#2d2450]' : 'bg-gray-50 border-gray-100'}`}>
                      {item.image?.startsWith('http') ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{(item as any).emoji || '📦'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{item.name}</p>
                      <p className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        Qty: {item.qty} × ₹{item.price}
                      </p>
                    </div>
                    <span className={`font-black shrink-0 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      ₹{item.price * item.qty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Totals Box */}
          <div className={`rounded-2xl p-4 border space-y-2 ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-slate-50 border-gray-100'}`}>
            <TRow label="Subtotal" value={`₹${order.subtotal}`} isDark={isDark} />
            <TRow
              label="Delivery Fee"
              value={freeDelivery ? 'FREE 🎉' : `₹${order.delivery}`}
              green={freeDelivery}
              isDark={isDark}
            />
            <div className={`flex justify-between items-center pt-3 mt-1 border-t ${isDark ? 'border-[#2d2450]' : 'border-gray-200/60'}`}>
              <span className={`text-sm font-black ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Grand Total</span>
              <span className={`text-xl font-black ${isDark ? 'text-indigo-400' : 'text-orange-600'}`}>₹{order.total}</span>
            </div>
          </div>

          {/* Status Updater */}
          <div>
            <p className={`text-[10px] uppercase tracking-[0.15em] font-black mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Update Order Status
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {(['pending', 'confirmed', 'delivered', 'cancelled'] as Order['status'][]).map(s => {
                const isActive = order.status === s;
                const config = getStatusConfig(s, isActive);

                return (
                  <button
                    key={s}
                    onClick={() => handleStatus(s)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${config.style} active:scale-95 capitalize`}
                  >
                    {config.icon}
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Sticky Footer */}
        <div className={`p-4 sm:p-5 border-t shrink-0 ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-gray-100'}`}>
          <button
            onClick={onClose}
            className={`w-full py-3.5 rounded-xl font-black text-white text-base transition-all active:scale-95 shadow-md ${isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-900 hover:bg-black'}`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function TRow({ label, value, green, isDark }: { label: string; value: string; green?: boolean; isDark?: boolean }) {
  return (
    <div className="flex justify-between text-xs font-bold">
      <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>{label}</span>
      <span className={green ? 'text-emerald-600' : (isDark ? 'text-gray-300' : 'text-gray-800')}>{value}</span>
    </div>
  );
}