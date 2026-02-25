'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Order } from '@/lib/types';
import OrderDetailModal from './OrderDetailModal';

export default function OrdersTable() {
  const { orders } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const sorted = [...orders].reverse();

  const statusClass = (s: Order['status']) =>
    s === 'pending' ? 'status-pending' : s === 'confirmed' ? 'status-confirmed' : 'status-delivered';

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid #e0e0e0', boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}
      >
        {/* Section header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ background: 'linear-gradient(135deg, #1a1208, #3a2008)' }}
        >
          <h3 className="font-display text-xl" style={{ color: 'var(--gold-light)' }}>
            Customer Orders &amp; Requests
          </h3>
          <span
            className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(76,175,80,.2)', border: '1px solid #4caf50', color: '#4caf50' }}
          >
            <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
            Live
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--muted)' }}>
            <div className="text-5xl mb-3">📭</div>
            <h4 className="font-bold text-base" style={{ color: 'var(--dark)' }}>No orders yet</h4>
            <p className="text-sm mt-1">Orders will appear here when customers checkout.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  {['Order ID','Customer','Items','Amount','Delivery','Time','Status','Action'].map(h => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--muted)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((order, i) => (
                  <tr
                    key={order.orderId}
                    className="transition-colors cursor-pointer"
                    style={{ borderBottom: i < sorted.length - 1 ? '1px solid #f0f0f0' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--gold-pale)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-md"
                        style={{ background: 'var(--gold-pale)', color: 'var(--brown)', border: '1px solid rgba(201,148,26,.2)', fontFamily: 'monospace' }}
                      >
                        {order.orderId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-sm" style={{ color: 'var(--dark)' }}>{order.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>📞 {order.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: 'var(--dark)' }}>
                      ₹{order.total}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {order.delivery === 0
                        ? <span style={{ color: 'var(--green)', fontWeight: 700 }}>FREE</span>
                        : `₹${order.delivery}`}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>
                      {order.timeStr}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full ${statusClass(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs font-bold px-3 py-2 rounded-lg transition-all"
                        style={{
                          background: 'var(--gold-pale)',
                          color: 'var(--brown)',
                          border: '1px solid rgba(201,148,26,.3)',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)';
                          (e.currentTarget as HTMLButtonElement).style.color = 'var(--dark)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-pale)';
                          (e.currentTarget as HTMLButtonElement).style.color = 'var(--brown)';
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdated={updated => setSelectedOrder(updated)}
        />
      )}
    </>
  );
}
