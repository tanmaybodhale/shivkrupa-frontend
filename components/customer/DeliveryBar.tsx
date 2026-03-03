'use client';

import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { FREE_DELIVERY_THRESHOLD } from '@/lib/data';
import { Truck, Sparkles } from 'lucide-react';

export default function DeliveryBar() {
  const { cartSubtotal } = useApp();
  const { isDark } = useTheme();
  const subtotal = cartSubtotal();
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  const unlocked = remaining === 0;

  return (
    <div
      className={`relative overflow-hidden flex items-center gap-4 rounded-2xl px-5 py-4 border shadow-sm transition-colors duration-500 ${unlocked
          ? (isDark ? 'bg-emerald-900/20 border-emerald-800/50 shadow-emerald-900/10' : 'bg-emerald-50 border-emerald-200 shadow-emerald-900/5')
          : (isDark ? 'bg-[#1a1535] border-[#2d2450] shadow-black/10' : 'bg-orange-50 border-orange-200 shadow-orange-900/5')
        }`}
    >
      {/* Icon Container */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${unlocked
            ? (isDark ? 'bg-emerald-800/50 text-emerald-400' : 'bg-emerald-100 text-emerald-600')
            : (isDark
              ? 'bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-inner shadow-indigo-800'
              : 'bg-gradient-to-tr from-orange-400 to-yellow-400 text-white shadow-inner shadow-orange-200')
          }`}
      >
        {unlocked ? <Sparkles size={20} className="animate-pulse" /> : <Truck size={20} />}
      </div>

      {/* Text & Progress Container */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm sm:text-[15px] font-black tracking-tight truncate ${unlocked
            ? (isDark ? 'text-emerald-400' : 'text-emerald-800')
            : (isDark ? 'text-gray-200' : 'text-amber-950')
          }`}>
          {unlocked ? (
            '🎉 YAY! Free Delivery Unlocked!'
          ) : (
            <>
              Add <span className={isDark ? 'text-indigo-400' : 'text-orange-600'}>₹{remaining}</span> more to unlock Free Delivery
            </>
          )}
        </p>

        {/* Progress Bar */}
        <div
          className={`mt-2.5 h-1.5 w-full rounded-full overflow-hidden transition-colors duration-500 ${unlocked
              ? (isDark ? 'bg-emerald-800/30' : 'bg-emerald-200/50')
              : (isDark ? 'bg-[#2d2450]/50' : 'bg-orange-200/50')
            }`}
        >
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${unlocked
                ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                : (isDark
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-400'
                  : 'bg-gradient-to-r from-orange-500 to-yellow-400')
              }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Decorative background glow for unlocked state */}
      {unlocked && (
        <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 blur-2xl rounded-full pointer-events-none ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-400/20'
          }`} />
      )}
    </div>
  );
}