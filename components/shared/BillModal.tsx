'use client';

import { Order } from '@/lib/types';
import { DELIVERY_CHARGE } from '@/lib/data';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { printReceipt } from '@/components/shopkeeper/utils/printReceipt';
import { CheckCircle2, Printer, X, Receipt, MapPin } from 'lucide-react';

interface Props {
  order?: Order | null;
  onClose?: () => void;
}

export default function BillModal({ order, onClose }: Props) {
  const { showToast } = useApp();
  const { isDark } = useTheme();
  if (!order) return null;

  const freeDelivery = order.delivery === 0;

  const handleClose = () => {
    onClose?.();
    showToast('🎉 Order placed! Thank you for shopping with us!');
  };

  // Uses the same shared generator as My Orders > Download Invoice,
  // so the receipt always matches (including saved Xerox rates).
  const printBill = () => printReceipt(order as any);

  return (
    <div
      className={`fixed inset-0 z-[500] flex items-end sm:items-center justify-center backdrop-blur-sm p-0 sm:p-5 transition-opacity ${isDark ? 'bg-black/50' : 'bg-slate-900/40'}`}
    >
      <div
        className={`w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300 flex flex-col max-h-[90vh] ${isDark ? 'bg-[#13102a]' : 'bg-white'}`}
      >
        {/* Vibrant Celebration Header */}
        <div className={`text-center py-8 px-6 relative shrink-0 ${isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-orange-500 to-yellow-500'}`}>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-black/10 text-white hover:bg-black/20 transition-colors"
          >
            <X size={18} strokeWidth={3} />
          </button>

          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ${isDark ? 'bg-[#13102a] shadow-indigo-900/30 text-indigo-400' : 'bg-white shadow-orange-900/20 text-orange-500'}`}>
            <CheckCircle2 size={36} strokeWidth={2.5} />
          </div>

          <h2 className="font-black text-2xl text-white tracking-tight drop-shadow-sm">
            Order Confirmed!
          </h2>
          <p className="text-white/80 font-bold text-sm mt-1 uppercase tracking-widest">
            Official E-Receipt
          </p>
        </div>

        {/* Scrollable Body */}
        <div className={`p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 ${isDark ? 'bg-[#13102a]' : 'bg-slate-50'}`}>

          {/* Order Meta Data */}
          <div className={`grid grid-cols-2 gap-3 rounded-2xl p-4 border shadow-sm ${isDark ? 'bg-[#1a1535] border-[#2d2450] shadow-black/10' : 'bg-white border-orange-100 shadow-orange-100/50'}`}>
            {[
              ['Order ID', `#${order.orderId}`],
              ['Customer', order.name],
              ['Phone', order.phone],
              ['Date & Time', order.timeStr],
            ].map(([label, val]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <p className={`text-[9px] uppercase tracking-wider font-black ${isDark ? 'text-indigo-400/80' : 'text-orange-400/80'}`}>{label}</p>
                <p className={`text-xs font-bold truncate ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{val}</p>
              </div>
            ))}
          </div>

          {/* Items List */}
          <div>
            <h4 className={`flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] font-black mb-2 px-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <Receipt size={14} /> Items Ordered
            </h4>
            <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-[#1a1535] border-[#2d2450] shadow-black/10' : 'bg-white border-gray-100'}`}>
              <div className={`divide-y ${isDark ? 'divide-[#2d2450]' : 'divide-gray-50'}`}>
                {order.items.map((item, i) => {
                  const pf = (item as any).printDetails ?? (item as any).printFile;
                  const pages = pf?.pages ?? 0;
                  const rate = pf?.pricePerPage ?? (pages > 0 ? item.price / pages : 0);
                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center overflow-hidden shrink-0 ${isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-orange-50 border-orange-100'}`}>
                        {item.image?.startsWith('http') ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">{(item as any).emoji || '📦'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{item.name}</p>
                        <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                          Qty: {item.qty} × ₹{item.price}
                        </p>
                        {pf && (
                          <p className="text-[10px] font-semibold text-gray-400 mt-0.5 leading-snug">
                            {pf.pageSize} · {pf.colorMode === 'color' ? 'Colour' : 'B&W'} · {pf.orientation}
                            <br />
                            ₹{rate}/page × {pages} {pages === 1 ? 'page' : 'pages'} × {item.qty} {item.qty === 1 ? 'copy' : 'copies'}
                          </p>
                        )}
                      </div>
                      <span className={`font-black shrink-0 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        ₹{item.price * item.qty}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Totals Box */}
          <div className={`rounded-2xl p-4 border border-dashed ${isDark ? 'bg-indigo-500/5 border-indigo-500/30' : 'bg-orange-50/50 border-orange-200'}`}>
            <TRow label="Subtotal" value={`₹${order.subtotal}`} isDark={isDark} />
            <TRow label="Delivery Fee" value={freeDelivery ? 'FREE 🎉' : `₹${order.delivery}`} green={freeDelivery} isDark={isDark} />
            {freeDelivery && <TRow label="Delivery Discount" value={`-₹${DELIVERY_CHARGE}`} green isDark={isDark} />}

            <div className={`flex justify-between items-center pt-3 mt-2 border-t ${isDark ? 'border-indigo-500/30' : 'border-orange-200'}`}>
              <span className={`text-sm font-black ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Grand Total</span>
              <span className={`text-2xl font-black ${isDark ? 'text-indigo-400' : 'text-orange-600'}`}>₹{order.total}</span>
            </div>
          </div>

          {/* Location / Footer */}
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400">
            <MapPin size={14} className={isDark ? 'text-indigo-400' : 'text-orange-400'} />
            Jalna, Maharashtra
          </div>
        </div>

        {/* Action Buttons Sticky Footer */}
        <div className={`p-4 border-t shrink-0 flex gap-3 ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-gray-100'}`}>
          <button
            onClick={printBill}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-colors active:scale-95 ${isDark ? 'text-gray-300 bg-[#13102a] hover:bg-[#1a1535]' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
          >
            <Printer size={18} />
            Print
          </button>
          <button
            onClick={handleClose}
            className={`flex-[2] py-3.5 rounded-xl font-black text-white text-base shadow-lg transition-all active:scale-95 ${isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-900/50' : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-orange-300/50'}`}
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
    <div className="flex justify-between text-xs font-bold mb-1.5">
      <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>{label}</span>
      <span className={green ? 'text-emerald-600' : (isDark ? 'text-gray-300' : 'text-gray-800')}>{value}</span>
    </div>
  );
}
