'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { Order } from '@/lib/types';
import OrderDetailModal from './OrderDetailModal';
import { Eye, PackageOpen, Activity, CalendarDays, X as XIcon, Clock, TrendingUp, IndianRupee, ArrowUpDown } from 'lucide-react';

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateLabel(key: string) {
  return new Date(key + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

type SortField = 'newest' | 'oldest' | 'amount-high' | 'amount-low' | 'status' | 'customer';

export default function OrdersTable() {
  const { orders } = useApp();
  const { isDark } = useTheme();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortField>('newest');

  const todayKey = dateKey(new Date());
  const yesterdayKey = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return dateKey(d); })();

  // Sort + filter
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    // Date filter
    if (selectedDate) {
      list = list.filter(order => dateKey(new Date(order.time)) === selectedDate);
    }

    // Sort
    switch (sortBy) {
      case 'newest': list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()); break;
      case 'oldest': list.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()); break;
      case 'amount-high': list.sort((a, b) => b.total - a.total); break;
      case 'amount-low': list.sort((a, b) => a.total - b.total); break;
      case 'status': list.sort((a, b) => a.status.localeCompare(b.status)); break;
      case 'customer': list.sort((a, b) => a.name.localeCompare(b.name)); break;
    }

    return list;
  }, [orders, selectedDate, sortBy]);

  const filteredStats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((s, o) => s + o.total, 0);
    return { count: filteredOrders.length, revenue: totalRevenue };
  }, [filteredOrders]);

  const handleDateInput = (val: string) => {
    setSelectedDate(val || '');
  };

  const handleQuickSelect = (key: string) => {
    setSelectedDate(prev => prev === key ? '' : key);
  };

  const isActive = (key: string) => selectedDate === key;

  const getStatusStyle = (status: Order['status']) => {
    switch (status) {
      case 'pending': return isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed': return isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200';
      case 'dispatched': return isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'delivered': return isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return isDark ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200';
      default: return isDark ? 'bg-gray-500/10 text-gray-400 border-gray-500/30' : 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const chipBase = (active: boolean) => active
    ? (isDark ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm' : 'bg-orange-500 text-white border-orange-500 shadow-sm')
    : (isDark ? 'bg-transparent border-[#2d2450] text-gray-400 hover:text-white hover:border-indigo-500/50' : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300');

  return (
    <>
      <section className={`card overflow-hidden ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : ''}`}>
        {/* Header */}
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
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600">Live</span>
          </div>
        </div>

        {/* Filter + Sort Bar */}
        <div className={`px-5 py-3.5 border-b flex flex-col gap-3 ${isDark ? 'bg-[#13102a] border-[#2d2450]' : 'bg-gray-50/80 border-gray-100'}`}>
          {/* Row 1: Date filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-widest mr-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Filter:</span>

            <button onClick={() => setSelectedDate('')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${chipBase(!selectedDate)}`}>All</button>
            <button onClick={() => handleQuickSelect(todayKey)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${chipBase(isActive(todayKey))}`}>
              <Clock size={12} /> Today
            </button>
            <button onClick={() => handleQuickSelect(yesterdayKey)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${chipBase(isActive(yesterdayKey))}`}>Yesterday</button>

            <div className={`w-px h-5 mx-1 hidden sm:block ${isDark ? 'bg-[#2d2450]' : 'bg-gray-200'}`} />

            <input
              type="date"
              value={selectedDate}
              onChange={e => handleDateInput(e.target.value)}
              className={`h-8 pl-3 pr-2 rounded-lg text-xs font-bold border transition-all outline-none cursor-pointer ${isDark
                ? 'bg-[#1a1535] border-[#2d2450] text-gray-300 focus:border-indigo-500 hover:border-indigo-500/50 [color-scheme:dark]'
                : 'bg-white border-gray-200 text-gray-700 focus:border-orange-500 hover:border-orange-300'
                }`}
            />

            {selectedDate && (
              <button onClick={() => setSelectedDate('')}
                className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                title="Clear filter">
                <XIcon size={14} strokeWidth={3} />
              </button>
            )}

            {/* Summary */}
            {selectedDate && (
              <div className={`flex items-center gap-3 ml-auto text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-orange-50 text-orange-600'}`}>
                  <CalendarDays size={13} />
                  {formatDateLabel(selectedDate)}
                </span>
                <span className="flex items-center gap-1"><TrendingUp size={13} />{filteredStats.count} order{filteredStats.count !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1"><IndianRupee size={13} />₹{filteredStats.revenue}</span>
              </div>
            )}
          </div>

          {/* Row 2: Sort */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-widest mr-1 flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <ArrowUpDown size={11} /> Sort:
            </span>
            {([
              { key: 'newest', label: 'Newest First' },
              { key: 'oldest', label: 'Oldest First' },
              { key: 'amount-high', label: 'Amount ↑' },
              { key: 'amount-low', label: 'Amount ↓' },
              { key: 'customer', label: 'Customer' },
              { key: 'status', label: 'Status' },
            ] as { key: SortField; label: string }[]).map(s => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${sortBy === s.key
                  ? (isDark ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' : 'bg-orange-50 text-orange-600 border-orange-200')
                  : (isDark ? 'bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:border-[#2d2450]' : 'bg-transparent border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200')
                  }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Content */}
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
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-indigo-900/30' : 'bg-orange-50'}`}>
              <CalendarDays size={32} className={isDark ? 'text-indigo-400/50' : 'text-orange-300'} />
            </div>
            <h4 className={`text-lg font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>No orders on this day</h4>
            <p className={`text-sm mt-1 max-w-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No orders were placed on {formatDateLabel(selectedDate)}. Try selecting a different date.
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
                {filteredOrders.map((order) => (
                  <tr key={order.orderId} onClick={() => setSelectedOrder(order)}
                    className={`transition-colors cursor-pointer group ${isDark ? 'hover:bg-indigo-500/5' : 'hover:bg-orange-50/30'}`}>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${isDark ? 'bg-indigo-900/30 text-indigo-300 border-indigo-500/30' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {order.orderId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-bold text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{order.name}</div>
                      <div className="text-xs font-semibold text-gray-400 mt-0.5">{order.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isDark ? 'bg-indigo-900/30 text-indigo-300' : 'bg-gray-100 text-gray-600'}`}>
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-black ${isDark ? 'text-indigo-400' : 'text-gray-900'}`}>₹{order.total}</span>
                    </td>
                    <td className="px-6 py-4">
                      {order.delivery === 0 ? (
                        <span className={`text-xs font-black px-2 py-1 rounded-md ${isDark ? 'text-emerald-400 bg-emerald-500/10' : 'text-emerald-600 bg-emerald-50'}`}>FREE</span>
                      ) : (
                        <span className="text-xs font-bold text-gray-600">₹{order.delivery}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-bold text-gray-400">{order.timeStr}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${isDark
                          ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white'
                          : 'text-orange-600 bg-orange-50 border border-orange-200 group-hover:bg-orange-500 group-hover:text-white'
                          }`}
                      >
                        <Eye size={14} strokeWidth={2.5} /> View
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