'use client';

import { Order } from '@/lib/types';
import { useApp } from '@/context/AppContext';

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

  const statusColor = (s: Order['status']) =>
    s === 'pending' ? '#ffc107' : s === 'confirmed' ? '#28a745' : '#007bff';

  const statusEmoji = (s: Order['status']) =>
    s === 'pending' ? '⏳' : s === 'confirmed' ? '✅' : '📦';

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-5"
      style={{ background: 'rgba(0,0,0,.72)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-3xl w-full overflow-y-auto fade-up"
        style={{ maxWidth: 500, maxHeight: '90vh', boxShadow: '0 24px 80px rgba(0,0,0,.4)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 rounded-t-3xl"
          style={{ background: 'linear-gradient(135deg, #1a1208, #3a2008)' }}
        >
          <div>
            <h3 className="font-display text-xl" style={{ color: 'var(--gold-light)' }}>
              📋 Order Details
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'rgba(255,255,255,.4)', fontFamily: 'monospace' }}
            >
              {order.orderId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-lg"
            style={{ background: 'rgba(255,255,255,.12)' }}
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Customer info */}
          <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--muted)' }}>
            Customer Info
          </p>
          <div
            className="grid grid-cols-2 gap-3 rounded-xl p-4 mb-5"
            style={{ background: '#f5f5f5' }}
          >
            {[
              ['Name',      order.name],
              ['Phone',     `📞 ${order.phone}`],
              ['Time',      order.timeStr],
              ['Status',    order.status.toUpperCase()],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--muted)' }}>{label}</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--dark)' }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Items */}
          <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--muted)' }}>
            Items Ordered
          </p>
          <div
            className="rounded-xl overflow-hidden mb-5"
            style={{ border: '1px solid #e0e0e0' }}
          >
            {order.items.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  borderBottom: i < order.items.length - 1 ? '1px solid #e0e0e0' : 'none',
                  background: i % 2 === 0 ? '#fff' : '#fafafa',
                }}
              >
                <span className="text-3xl">{item.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: 'var(--dark)' }}>{item.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                    Qty: {item.qty} × ₹{item.price}
                  </p>
                </div>
                <span className="font-display font-bold" style={{ color: 'var(--dark)' }}>
                  ₹{item.price * item.qty}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div
            className="rounded-xl p-4 mb-5"
            style={{ background: 'var(--gold-pale)', border: '1px solid rgba(201,148,26,.3)' }}
          >
            <TRow label="Subtotal" value={`₹${order.subtotal}`} />
            <TRow label="Delivery" value={freeDelivery ? 'FREE 🎉' : `₹${order.delivery}`} green={freeDelivery} />
            <div
              className="flex justify-between items-center pt-3 mt-2"
              style={{ borderTop: '2px solid rgba(201,148,26,.3)' }}
            >
              <span className="font-display text-lg font-bold" style={{ color: 'var(--dark)' }}>Grand Total</span>
              <span className="font-display text-xl font-bold" style={{ color: 'var(--dark)' }}>₹{order.total}</span>
            </div>
          </div>

          {/* Status update */}
          <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--muted)' }}>
            Update Order Status
          </p>
          <div className="flex gap-2 flex-wrap mb-5">
            {(['pending','confirmed','delivered'] as Order['status'][]).map(s => (
              <button
                key={s}
                onClick={() => handleStatus(s)}
                className="px-5 py-2.5 rounded-full text-sm font-bold transition-all capitalize"
                style={{
                  border: `2px solid ${statusColor(s)}`,
                  background: order.status === s ? statusColor(s) : 'transparent',
                  color: order.status === s
                    ? (s === 'pending' ? 'var(--dark)' : '#fff')
                    : statusColor(s),
                }}
              >
                {statusEmoji(s)} {s}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="btn-gold w-full py-3.5 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function TRow({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex justify-between text-sm mb-1.5" style={{ color: 'var(--muted)' }}>
      <span>{label}</span>
      <span style={green ? { color: 'var(--green)', fontWeight: 700 } : {}}>{value}</span>
    </div>
  );
}
