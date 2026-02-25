'use client';

import { useApp } from '@/context/AppContext';
import { FREE_DELIVERY_THRESHOLD } from '@/lib/data';

export default function DeliveryBar() {
  const { cartSubtotal } = useApp();
  const subtotal  = cartSubtotal();
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const pct       = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  const unlocked  = remaining === 0;

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-5 py-3 mb-6 text-sm font-semibold"
      style={{
        background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
        border: '1px solid #a5d6a7',
        color: 'var(--green)',
      }}
    >
      <span className="text-xl">🚚</span>
      <span
        dangerouslySetInnerHTML={{
          __html: unlocked
            ? '🎉 You\'ve unlocked <strong>FREE Delivery!</strong>'
            : `Add <strong>₹${remaining}</strong> more to unlock 🚚 <strong>FREE Delivery!</strong>`,
        }}
      />
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden ml-2 hidden sm:block"
        style={{ background: 'rgba(46,125,50,.2)' }}
      >
        <div
          className="h-full rounded-full delivery-fill"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(to right, #4caf50, #2e7d32)',
          }}
        />
      </div>
    </div>
  );
}
