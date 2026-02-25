'use client';

import { Order } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { X, User, Phone, Clock, Package, CheckCircle2, XCircle, Timer, ClipboardCheck } from 'lucide-react';

interface Props {
  order: Order;
  onClose: () => void;
  onUpdated: (order: Order) => void;
}

export default function OrderDetailModal({ order, onClose, onUpdated }: Props) {
  const { updateOrderStatus, showToast } = useApp();

  const handleStatus = (status: Order['status']) => {
    updateOrderStatus(order.orderId, status);
    const updated: Order = { ...order, status };
    onUpdated(updated);
    showToast(`✅ Order ${order.orderId} marked as ${status}`);
  };

  const freeDelivery = order.delivery === 0;

  // Modernized status configurations
  const getStatusConfig = (s: Order['status'], isActive: boolean) => {
    switch (s) {
      case 'pending':
        return {
          icon: <Timer size={16} />,
          style: isActive 
            ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-200' 
            : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
        };
      case 'confirmed':
        return {
          icon: <ClipboardCheck size={16} />,
          style: isActive 
            ? 'bg-blue-500 text-white border-blue-600 shadow-md shadow-blue-200' 
            : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
        };
      case 'delivered':
        return {
          icon: <CheckCircle2 size={16} />,
          style: isActive 
            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-200' 
            : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
        };
      case 'cancelled':
        return {
          icon: <XCircle size={16} />,
          style: isActive 
            ? 'bg-red-500 text-white border-red-600 shadow-md shadow-red-200' 
            : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
        };
      default:
        return { icon: <Package size={16} />, style: '' };
    }
  };

  return (
    <div
      className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-5 transition-opacity"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h3 className="font-black text-xl text-gray-900 tracking-tight">
              Order Details
            </h3>
            <p className="text-xs font-bold text-orange-500 mt-0.5 tracking-wider uppercase">
              #{order.orderId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-orange-50 hover:text-orange-600 transition-colors border border-gray-100 active:scale-95"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Customer Info Card */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] font-black text-gray-400 mb-2">
              Customer Info
            </p>
            <div className="grid grid-cols-2 gap-3 bg-orange-50/50 rounded-2xl p-4 border border-orange-100/50">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-orange-400">
                  <User size={14} />
                  <span className="text-[10px] uppercase tracking-wider font-bold">Name</span>
                </div>
                <p className="text-sm font-bold text-gray-900">{order.name}</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-orange-400">
                  <Phone size={14} />
                  <span className="text-[10px] uppercase tracking-wider font-bold">Phone</span>
                </div>
                <p className="text-sm font-bold text-gray-900">{order.phone}</p>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center gap-1.5 text-orange-400">
                  <Clock size={14} />
                  <span className="text-[10px] uppercase tracking-wider font-bold">Time</span>
                </div>
                <p className="text-sm font-bold text-gray-900">{order.timeStr}</p>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center gap-1.5 text-orange-400">
                  <Package size={14} />
                  <span className="text-[10px] uppercase tracking-wider font-bold">Status</span>
                </div>
                <p className="text-sm font-black text-gray-900 capitalize">{order.status}</p>
              </div>
            </div>
          </div>

          {/* Items Ordered */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-[0.15em] font-black text-gray-400">
                Items Ordered
              </p>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                {order.items.length} items
              </span>
            </div>
            <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm shadow-gray-200/20">
              <div className="divide-y divide-gray-50">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                      {item.image?.startsWith('http') ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{item.emoji || '📦'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs font-semibold text-gray-500 mt-0.5">
                        Qty: {item.qty} × ₹{item.price}
                      </p>
                    </div>
                    <span className="font-black text-gray-900 shrink-0">
                      ₹{item.price * item.qty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Totals Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-gray-100 space-y-2">
            <TRow label="Subtotal" value={`₹${order.subtotal}`} />
            <TRow 
              label="Delivery Fee" 
              value={freeDelivery ? 'FREE 🎉' : `₹${order.delivery}`} 
              green={freeDelivery} 
            />
            <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-200/60">
              <span className="text-sm font-black text-gray-900">Grand Total</span>
              <span className="text-xl font-black text-orange-600">₹{order.total}</span>
            </div>
          </div>

          {/* Status Updater */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] font-black text-gray-400 mb-2">
              Update Order Status
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {(['pending','confirmed','delivered','cancelled'] as Order['status'][]).map(s => {
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
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-white shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl font-black text-white text-base bg-gray-900 hover:bg-black transition-all active:scale-95 shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function TRow({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex justify-between text-xs font-bold">
      <span className="text-gray-500">{label}</span>
      <span className={green ? 'text-emerald-600' : 'text-gray-800'}>{value}</span>
    </div>
  );
}