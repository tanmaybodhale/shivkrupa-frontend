'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { Order } from '@/lib/types';
import OrderDetailModal from './OrderDetailModal';
import { Eye, PackageOpen, Activity } from 'lucide-react';

export default function OrdersTable() {
  const { orders } = useApp();
  const { isDark } = useTheme();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const sorted = [...orders].reverse();

  // Modernized status badge generator using Tailwind
  const getStatusStyle = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      <section className={`card overflow-hidden ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : ''}`}>

        {/* Section header - Now with the vibrant orange + yellow gradient! */}
        <div className={`p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b ${isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-700/50' : 'bg-gradient-to-r from-orange-500 to-yellow-500 border-orange-200/50'}`}>
          <div>
            <h3 className="font-black text-xl text-white drop-shadow-sm">Live Orders</h3>
            <p className={`text-sm font-medium mt-0.5 ${isDark ? 'text-gray-200' : 'text-orange-50'}`}>
              Monitor and manage incoming customer requests
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm border border-white/50">
            <Activity size={16} className="text-emerald-500" />
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
              Live Sync
            </span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-indigo-900/30' : 'bg-orange-50'}`}>
              <PackageOpen size={32} className="text-orange-300" />
            </div>
            <h4 className={`text-lg font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>No orders yet</h4>
            <p className={`text-sm mt-1 max-w-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Incoming customer orders will automatically appear here once they checkout.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className={`border-b ${isDark ? 'bg-[#13102a]/50 border-[#2d2450]' : 'bg-gray-50/80 border-gray-100'}`}>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Order ID</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Customer</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Items</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Amount</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Delivery</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Time</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-[#2d2450]' : 'divide-gray-100'}`}>
                {sorted.map((order) => (
                  <tr
                    key={order.orderId}
                    onClick={() => setSelectedOrder(order)}
                    className={`transition-colors cursor-pointer group ${isDark ? 'hover:bg-indigo-500/5' : 'hover:bg-orange-50/30'}`}
                  >
                    {/* Order ID */}
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${isDark ? 'bg-indigo-900/30 text-indigo-300 border-indigo-500/30' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {order.orderId}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className={`font-bold text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{order.name}</div>
                      <div className="text-xs font-semibold text-gray-400 mt-0.5 tracking-wide">
                        {order.phone}
                      </div>
                    </td>

                    {/* Items */}
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isDark ? 'bg-indigo-900/30 text-indigo-300' : 'bg-gray-100 text-gray-600'}`}>
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <span className={`text-sm font-black ${isDark ? 'text-indigo-400' : 'text-gray-900'}`}>
                        ₹{order.total}
                      </span>
                    </td>

                    {/* Delivery */}
                    <td className="px-6 py-4">
                      {order.delivery === 0 ? (
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                          FREE
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-gray-600">
                          ₹{order.delivery}
                        </span>
                      )}
                    </td>

                    {/* Time */}
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-bold text-gray-400">
                        {order.timeStr}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents double-firing
                          setSelectedOrder(order);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm"
                      >
                        <Eye size={14} strokeWidth={2.5} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdated={(updated) => setSelectedOrder(updated)}
        />
      )}
    </>
  );
}