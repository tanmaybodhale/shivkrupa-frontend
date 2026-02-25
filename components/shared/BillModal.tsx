'use client';

import { Order } from '@/lib/types';
import { DELIVERY_CHARGE } from '@/lib/data';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, Printer, X, Receipt, MapPin } from 'lucide-react';

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
    // Updated HTML template with new Fonts and Orange/Yellow Theme
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Shivkrupa Emporium - Receipt</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@700;900&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Inter',sans-serif;background:#f9fafb;padding:24px;color:#111827;}
    .wrap{max-width:460px;margin:0 auto;background:#fff;border:1px solid #ffedd5;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(234,88,12,.05);}
    .hdr{background:linear-gradient(135deg, #f97316, #eab308);padding:32px 24px;text-align:center;color:#fff;}
    .hdr .ico{font-size:48px;margin-bottom:12px;text-shadow:0 4px 10px rgba(0,0,0,.1);}
    .hdr h2{font-family:'Outfit',sans-serif;font-size:2rem;font-weight:900;letter-spacing:-0.02em;margin-bottom:4px;}
    .hdr .sub{color:rgba(255,255,255,.9);font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;}
    .hdr .ph{background:rgba(255,255,255,.2);display:inline-block;padding:4px 12px;border-radius:100px;font-size:13px;font-weight:700;margin-top:12px;}
    .body{padding:28px 24px;}
    .meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;background:#fff7ed;border:1px solid #ffedd5;border-radius:16px;padding:16px;margin-bottom:24px;}
    .meta label{font-size:9px;color:#9a3412;font-weight:800;letter-spacing:1px;text-transform:uppercase;}
    .meta p{font-size:13px;font-weight:700;color:#111827;margin-top:4px;}
    .sec{font-size:10px;font-weight:800;color:#9a3412;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;}
    .row{display:flex;align-items:center;padding:12px 0;border-bottom:1px dashed #fed7aa;font-size:14px;}
    .row:last-child{border-bottom:none;}
    .row .nm{flex:1;font-weight:700;margin-left:12px;color:#374151;}
    .row .qty{color:#9a3412;font-weight:600;background:#ffedd5;padding:2px 8px;border-radius:6px;margin:0 12px;font-size:12px;}
    .row .amt{font-weight:800;color:#111827;}
    .totals{background:#fafaf9;border:1px solid #e5e7eb;border-radius:16px;padding:16px;margin:24px 0;}
    .trow{display:flex;justify-content:space-between;font-size:13px;color:#4b5563;margin-bottom:8px;font-weight:600;}
    .trow.grand{font-size:20px;font-weight:900;color:#f97316;border-top:2px dashed #e5e7eb;padding-top:12px;margin-top:8px;font-family:'Outfit',sans-serif;}
    .green{color:#16a34a;font-weight:800;}
    .ftr{text-align:center;padding-top:20px;border-top:2px dashed #ffedd5;}
    .ftr p{font-size:11px;font-weight:600;color:#6b7280;margin-bottom:4px;}
    .thanks{font-family:'Outfit',sans-serif;font-size:1.1rem;font-weight:700;color:#ea580c;margin-top:12px;}
    .actions{text-align:center;margin-top:24px;}
    .actions button{padding:14px 32px;font-size:15px;font-weight:700;border:none;border-radius:12px;cursor:pointer;margin:0 8px;transition:all .2s;}
    .btn-p{background:linear-gradient(135deg, #f97316, #eab308);color:#fff;box-shadow:0 4px 14px rgba(234,88,12,.3);}
    .btn-c{background:#f3f4f6;color:#374151;}
    @media print{.actions{display:none;}body{padding:0;background:#fff;}.wrap{box-shadow:none;border:none;}}
  </style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <div class="ico">✿</div>
    <h2>Shivkrupa</h2>
    <div class="sub">Official E-Receipt</div>
    <div class="ph">📞 9975636622</div>
  </div>
  <div class="body">
    <div class="meta">
      <div><label>Order ID</label><p>#${order.orderId}</p></div>
      <div><label>Customer</label><p>${order.name}</p></div>
      <div><label>Phone</label><p>${order.phone}</p></div>
      <div><label>Date & Time</label><p>${order.timeStr}</p></div>
    </div>
    <div class="sec">Items Ordered</div>
    <div style="border: 1px solid #ffedd5; padding: 0 16px; border-radius: 16px;">
      ${order.items.map(i => `
        <div class="row">
          <span style="font-size:20px">${i.emoji || '📦'}</span>
          <span class="nm">${i.name}</span>
          <span class="qty">x${i.qty}</span>
          <span class="amt">₹${i.price * i.qty}</span>
        </div>
      `).join('')}
    </div>
    <div class="totals">
      <div class="trow"><span>Subtotal</span><span>₹${order.subtotal}</span></div>
      <div class="trow"><span>Delivery</span><span class="${freeDelivery ? 'green' : ''}">${freeDelivery ? 'FREE 🎉' : '₹' + order.delivery}</span></div>
      ${freeDelivery ? `<div class="trow"><span>Delivery Discount</span><span class="green">-₹${DELIVERY_CHARGE}</span></div>` : ''}
      <div class="trow grand"><span>Grand Total</span><span>₹${order.total}</span></div>
    </div>
    <div class="ftr">
      <p>GST No: 27XXXXX1234X1Z5</p>
      <p>Pune, Maharashtra</p>
      <div class="thanks">Thank you for shopping with us! 🙏</div>
    </div>
  </div>
</div>
<div class="actions">
  <button class="btn-p" onclick="window.print()">🖨 Print Receipt</button>
  <button class="btn-c" onclick="window.close()">✕ Close</button>
</div>
<script>window.onload=function(){window.focus();window.print();};</script>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-5 transition-opacity"
    >
      <div
        className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300 flex flex-col max-h-[90vh]"
      >
        {/* Vibrant Celebration Header */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-center py-8 px-6 relative shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-black/10 text-white hover:bg-black/20 transition-colors"
          >
            <X size={18} strokeWidth={3} />
          </button>
          
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-900/20 text-orange-500">
            <CheckCircle2 size={36} strokeWidth={2.5} />
          </div>
          
          <h2 className="font-black text-2xl text-white tracking-tight drop-shadow-sm">
            Order Confirmed!
          </h2>
          <p className="text-orange-50 font-bold text-sm mt-1 uppercase tracking-widest">
            Official E-Receipt
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50">
          
          {/* Order Meta Data */}
          <div className="grid grid-cols-2 gap-3 bg-white rounded-2xl p-4 border border-orange-100 shadow-sm shadow-orange-100/50">
            {[
              ['Order ID', `#${order.orderId}`],
              ['Customer', order.name],
              ['Phone', order.phone],
              ['Date & Time', order.timeStr],
            ].map(([label, val]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <p className="text-[9px] uppercase tracking-wider font-black text-orange-400/80">{label}</p>
                <p className="text-xs font-bold text-gray-900 truncate">{val}</p>
              </div>
            ))}
          </div>

          {/* Items List */}
          <div>
            <h4 className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] font-black text-gray-400 mb-2 px-1">
              <Receipt size={14} /> Items Ordered
            </h4>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-50">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden shrink-0">
                      {item.image?.startsWith('http') ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">{item.emoji || '📦'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                      <p className="text-[11px] font-bold text-gray-400 mt-0.5">
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
          <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-200 border-dashed">
            <TRow label="Subtotal" value={`₹${order.subtotal}`} />
            <TRow label="Delivery Fee" value={freeDelivery ? 'FREE 🎉' : `₹${order.delivery}`} green={freeDelivery} />
            {freeDelivery && <TRow label="Delivery Discount" value={`-₹${DELIVERY_CHARGE}`} green />}
            
            <div className="flex justify-between items-center pt-3 mt-2 border-t border-orange-200">
              <span className="text-sm font-black text-gray-900">Grand Total</span>
              <span className="text-2xl font-black text-orange-600">₹{order.total}</span>
            </div>
          </div>

          {/* Location / Footer */}
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400">
            <MapPin size={14} className="text-orange-400" />
            Pune, Maharashtra
          </div>
        </div>

        {/* Action Buttons Sticky Footer */}
        <div className="p-4 border-t border-gray-100 bg-white shrink-0 flex gap-3">
          <button
            onClick={printBill}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
          >
            <Printer size={18} />
            Print
          </button>
          <button
            onClick={handleClose}
            className="flex-[2] py-3.5 rounded-xl font-black text-white text-base bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-lg shadow-orange-300/50 transition-all active:scale-95"
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
    <div className="flex justify-between text-xs font-bold mb-1.5">
      <span className="text-gray-500">{label}</span>
      <span className={green ? 'text-emerald-600' : 'text-gray-800'}>{value}</span>
    </div>
  );
}