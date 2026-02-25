'use client';

import { useApp } from '@/context/AppContext';

export default function StatsGrid() {
  const { orders, } = useApp();

  const totalRevenue  = orders.reduce((s, o) => s + o.total, 0);
  const todayOrders   = orders.filter(o =>
    new Date(o.time).toDateString() === new Date().toDateString()
  );
  const uniqueClients = new Set(orders.map(o => o.uid)).size;

  const stats = [
    { icon: '📦', value: orders.length, label: 'Total Orders',    bg: 'linear-gradient(135deg,#fdf6e3,#fff3cd)' },
    { icon: '₹',  value: `₹${totalRevenue}`, label: 'Total Revenue', bg: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)' },
    { icon: '👥', value: uniqueClients, label: 'Customers',       bg: 'linear-gradient(135deg,#e3f2fd,#bbdefb)' },
    { icon: '🕐', value: todayOrders.length, label: "Today's Orders", bg: 'linear-gradient(135deg,#ffebee,#ffcdd2)' },
  ];

  return (
    <div
      className="grid gap-4 mb-8"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
    >
      {stats.map(s => (
        <div
          key={s.label}
          className="card flex items-center gap-4 p-5"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: s.bg }}
          >
            {s.icon}
          </div>
          <div>
            <p className="text-2xl font-black leading-none" style={{ color: 'var(--dark)' }}>
              {s.value}
            </p>
            <p
              className="text-xs font-bold uppercase tracking-wide mt-0.5"
              style={{ color: 'var(--muted)' }}
            >
              {s.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
