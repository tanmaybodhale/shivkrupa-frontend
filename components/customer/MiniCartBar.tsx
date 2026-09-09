'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LanguageContext';
import { ChevronRight } from 'lucide-react';
import Confetti from './Confetti';

const MAX_THUMBS = 3;

export default function MiniCartBar() {
  const { cart, cartOpen, setCartOpen, deliveryCharge, cartTotal } = useApp();
  const { isDark } = useTheme();
  const { t } = useLang();

  const [showConfetti, setShowConfetti] = useState(false);
  const [visible, setVisible] = useState(false);
  const wasFreeDelivery = useRef(false);
  const prevCartLength = useRef(0);

  const delivery = deliveryCharge();
  const total = cartTotal();
  const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
  const freeDelivery = delivery === 0 && cart.length > 0;

  // Most recently added items — assumes new items are appended to the end of `cart`.
  // Shows up to MAX_THUMBS thumbnails, most recent first.
  const recentItems = [...cart].slice(-MAX_THUMBS).reverse();
  const overflowCount = Math.max(0, cart.length - MAX_THUMBS);

  // Slide up ONLY on the empty -> non-empty transition. Stays static after that,
  // content updates in place without re-animating on every add.
  useEffect(() => {
    if (prevCartLength.current === 0 && cart.length > 0) {
      setVisible(true);
    }
    if (cart.length === 0) {
      setVisible(false);
    }
    prevCartLength.current = cart.length;
  }, [cart.length]);

  // Fire confetti exactly once, on the transition into "free delivery unlocked".
  useEffect(() => {
    if (freeDelivery && !wasFreeDelivery.current) {
      setShowConfetti(true);
    }
    wasFreeDelivery.current = freeDelivery;
  }, [freeDelivery]);

  if (cart.length === 0 || cartOpen || !visible) return null;

  return (
    <>
      <Confetti fire={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="fixed bottom-0 left-0 right-0 z-[150] px-3 pb-3 sm:px-4 sm:pb-4 pointer-events-none">
        <div
          onClick={() => setCartOpen(true)}
          className={`animate-slide-up-once pointer-events-auto mx-auto max-w-xl rounded-2xl shadow-2xl border flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-transform active:scale-[0.98] ${
            isDark
              ? 'bg-[#1a1535] border-[#2d2450] shadow-black/40'
              : 'bg-white border-orange-100 shadow-orange-900/10'
          }`}
        >
          {/* Stacked thumbnails of recently added items */}
          <div className="flex items-center shrink-0" style={{ width: 44 + (recentItems.length - 1) * 18 }}>
            {recentItems.map((item, idx) => {
              const hasImage = item.image && item.image.startsWith('http');
              return (
                <div
                  key={item._id || item.id || idx}
                  className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center overflow-hidden shrink-0 ${
                    isDark ? 'bg-[#13102a] border-[#1a1535]' : 'bg-slate-50 border-white'
                  }`}
                  style={{
                    marginLeft: idx === 0 ? 0 : -18,
                    zIndex: MAX_THUMBS - idx,
                  }}
                >
                  {hasImage ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">{item.emoji || '🛍️'}</span>
                  )}
                </div>
              );
            })}
            {overflowCount > 0 && (
              <div
                className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center shrink-0 text-xs font-black ${
                  isDark
                    ? 'bg-indigo-500/20 border-[#1a1535] text-indigo-300'
                    : 'bg-orange-100 border-white text-orange-700'
                }`}
                style={{ marginLeft: -18, zIndex: 0 }}
              >
                +{overflowCount}
              </div>
            )}
          </div>

          {/* Qty/price summary */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {totalQty} {totalQty === 1 ? 'item' : 'items'} added
            </p>
            <p className={`text-xs font-semibold ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              ₹{total} total
            </p>
          </div>

          {/* Checkout CTA */}
          <div
            className={`flex items-center gap-1 px-4 py-2.5 rounded-xl font-black text-sm text-white shrink-0 ${
              isDark
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                : 'bg-gradient-to-r from-orange-500 to-yellow-500'
            }`}
          >
            {t('yourCart') || 'View Cart'}
            <ChevronRight size={16} strokeWidth={3} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up-once {
          from {
            transform: translateY(120%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up-once {
          animation: slide-up-once 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </>
  );
}
