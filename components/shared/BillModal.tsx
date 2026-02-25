'use client';

import { Order } from '@/lib/types';
import { DELIVERY_CHARGE } from '@/lib/data';
import { useApp } from '@/context/AppContext';

interface Props {
  order?: Order | null;    // explicit order (from CartSidebar)
  onClose?: () => void;
}

export default function BillModal({ order, onClose }: Props) {
  const { showToast } = useApp();
  if (!order) return null;

  const freeDelivery = order.delivery === 0;

  const handleClose = () => {
    onClose?.();
    showToast('🎉 Order placed! Thank you for shopping with us!');
  };

  const printBill = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Shivkrupa Emporium - Receipt</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Plus Jakarta Sans',sans-serif;background:#fff;padding:24px;color:#1a1208;}
    .wrap{max-width:460px;margin:0 auto;border:1px solid #ddd;border-radius:16px;overflow:hidden;}
    .hdr{background:linear-gradient(135deg,#1a1208,#3a2008);padding:28px;text-align:center;}
    .hdr .ico{font-size:40px;margin-bottom:8px;}
    .hdr h2{font-family:'Playfair Display',serif;color:#f0c040;font-size:1.6rem;margin-bottom:4px;}
    .hdr .sub{color:rgba(255,255,255,.45);font-size:11px;letter-spacing:3px;text-transform:uppercase;}
    .hdr .ph{color:#f0c040;font-size:13px;font-weight:600;margin-top:8px;}
    .body{padding:24px;}
    .meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;background:#f5f5f5;border-radius:10px;padding:14px;margin-bottom:20px;}
    .meta label{font-size:9px;color:#8d6e4a;font-weight:700;letter-spacing:1px;text-transform:uppercase;}
    .meta p{font-size:13px;font-weight:700;color:#1a1208;margin-top:2px;}
    .sec{font-size:10px;font-weight:700;color:#8d6e4a;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;}
    .row{display:flex;align-items:center;padding:9px 0;border-bottom:1px dashed #e0e0e0;font-size:13px;}
    .row:last-child{border-bottom:none;}
    .row .nm{flex:1;font-weight:600;margin-left:8px;}
    .row .qty{color:#8d6e4a;margin:0 10px;}
    .row .amt{font-weight:700;}
    .totals{background:#fdf6e3;border:1px solid rgba(201,148,26,.3);border-radius:10px;padding:14px;margin:16px 0;}
    .trow{display:flex;justify-content:space-between;font-size:13px;color:#8d6e4a;margin-bottom:5px;}
    .trow.grand{font-size:17px;font-weight:800;color:#1a1208;border-top:2px solid rgba(201,148,26,.3);padding-top:10px;margin-top:6px;font-family:'Playfair Display',serif;}
    .green{color:#2e7d32;font-weight:700;}
    .ftr{text-align:center;padding-top:14px;border-top:1px dashed #e0e0e0;}
    .ftr p{font-size:11px;color:#8d6e4a;margin-bottom:3px;}
    .thanks{font-family:'Playfair Display',serif;font-size:1rem;color:#6b3a1f;font-style:italic;}
    .actions{text-align:center;margin-top:24px;}
    .actions button{padding:12px 28px;font-size:14px;font-weight:700;border:none;border-radius:8px;cursor:pointer;margin:0 6px;}
    .btn-p{background:#c9941a;color:#fff;}
    .btn-c{background:#333;color:#fff;}
    @media print{.actions{display:none;}body{padding:0;}}
  </style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <div class="ico">✿</div>
    <h2>Shivkrupa Emporium</h2>
    <div class="sub">Official E-Receipt</div>
    <div class="ph">📞 9975636622</div>
  </div>
  <div class="body">
    <div class="meta">
      <div><label>Order ID</label><p>${order.orderId}</p></div>
      <div><label>Customer</label><p>${order.name}</p></div>
      <div><label>Phone</label><p>${order.phone}</p></div>
      <div><label>Date & Time</label><p>${order.timeStr}</p></div>
    </div>
    <div class="sec">Items Ordered</div>
    <div>
      ${order.items.map(i => `
        <div class="row">
          <span>${i.emoji}</span>
          <span class="nm">${i.name}</span>
          <span class="qty">x${i.qty}</span>
          <span class="amt">₹${i.price * i.qty}</span>
        </div>
      `).join('')}
    </div>
    <div class="totals">
      <div class="trow"><span>Subtotal</span><span>₹${order.subtotal}</span></div>
      <div class="trow"><span>Delivery</span><span class="${freeDelivery ? 'green' : ''}">${freeDelivery ? 'FREE 🎉' : '₹' + order.delivery}</span></div>
      ${freeDelivery ? `<div class="trow"><span>Delivery Saved</span><span class="green">-₹${DELIVERY_CHARGE}</span></div>` : ''}
      <div class="trow grand"><span>Grand Total</span><span>₹${order.total}</span></div>
    </div>
    <div class="ftr">
      <p>GST No: 27XXXXX1234X1Z5 | Pune, Maharashtra</p>
      <div class="thanks">Thank you for shopping with us! 🙏</div>
    </div>
  </div>
</div>
<div class="actions">
  <button class="btn-p" onclick="window.print()">🖨 Print</button>
  <button class="btn-c" onclick="window.close()">✕ Close</button>
</div>
<script>window.onload=function(){window.focus();window.print();};<\/script>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-5"
      style={{ background: 'rgba(0,0,0,.7)' }}
    >
      <div
        className="bg-white rounded-3xl w-full overflow-y-auto fade-up"
        style={{ maxWidth: 500, maxHeight: '90vh', boxShadow: '0 24px 80px rgba(0,0,0,.4)' }}
      >
        {/* Header */}
        <div
          className="text-center py-7 px-6 rounded-t-3xl"
          style={{ background: 'linear-gradient(135deg, #1a1208, #3a2008)' }}
        >
          <div className="text-5xl mb-2">✿</div>
          <h2 className="font-display text-3xl" style={{ color: 'var(--gold-light)' }}>
            Shivkrupa Emporium
          </h2>
          <p className="text-xs tracking-widest uppercase mt-1" style={{ color: 'rgba(255,255,255,.45)' }}>
            Official E-Receipt
          </p>
          <p className="text-sm font-semibold mt-2" style={{ color: 'var(--gold-light)' }}>
            📞 9975636622
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Meta */}
          <div
            className="grid grid-cols-2 gap-3 rounded-xl p-4 mb-6"
            style={{ background: '#f5f5f5' }}
          >
            {[
              ['Order ID', order.orderId],
              ['Customer', order.name],
              ['Phone', order.phone],
              ['Date & Time', order.timeStr],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--muted)' }}>{label}</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--dark)' }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Items */}
          <h4 className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--muted)' }}>
            Items Ordered
          </h4>
          <div className="mb-5">
            {order.items.map((item, i) => (
              <div
                key={i}
                className="flex items-center py-2.5 text-sm"
                style={{ borderBottom: i < order.items.length - 1 ? '1px dashed #e0e0e0' : 'none' }}
              >
                <span className="mr-2">{item.emoji}</span>
                <span className="flex-1 font-semibold">{item.name}</span>
                <span className="mx-3 text-xs" style={{ color: 'var(--muted)' }}>×{item.qty}</span>
                <span className="font-bold">₹{item.price * item.qty}</span>
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
            {freeDelivery && <TRow label="You Saved" value={`-₹${DELIVERY_CHARGE}`} green />}
            <div
              className="flex justify-between items-center pt-3 mt-2"
              style={{ borderTop: '2px solid rgba(201,148,26,.3)' }}
            >
              <span className="font-display text-lg font-bold" style={{ color: 'var(--dark)' }}>Grand Total</span>
              <span className="font-display text-xl font-bold" style={{ color: 'var(--dark)' }}>₹{order.total}</span>
            </div>
          </div>

          {/* Footer */}
          <div
            className="text-center pt-4"
            style={{ borderTop: '1px dashed #e0e0e0' }}
          >
            <p className="text-xs" style={{ color: 'var(--muted)' }}>GST No: 27XXXXX1234X1Z5 | Pune, Maharashtra</p>
            <p className="font-display italic mt-1" style={{ color: 'var(--brown)', fontSize: '1.05rem' }}>
              Thank you for shopping with us! 🙏
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={printBill}
              className="btn-dark flex-1 py-3.5 text-sm"
            >
              🖨 Print / Download
            </button>
            <button
              onClick={handleClose}
              className="btn-gold flex-1 py-3.5 text-sm"
            >
              ✓ Done
            </button>
          </div>
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
