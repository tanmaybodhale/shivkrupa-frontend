'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LanguageContext';

export default function HeroBanner() {
  const { isDark } = useTheme();
  const { t } = useLang();

  return (
    <div className={`relative overflow-hidden rounded-3xl mt-4 mb-8 p-8 sm:p-12 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10 shadow-sm transition-colors duration-300 ${isDark ? 'border-[#2d2450]' : 'border-orange-200'
      }`}>

      {/* 1. Traditional Background Image (hidden in dark mode) */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-500 ${isDark ? 'opacity-0' : 'opacity-100'}`}
        style={{
          backgroundImage: 'url(/Traditional.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
        }}
      />

      {/* Dark mode: gradient mesh + subtle pattern */}
      {isDark && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0f0d1a]" />
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(ellipse at 80% 50%, #4f46e5 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, #7c3aed 0%, transparent 40%), radial-gradient(ellipse at 60% 10%, #6366f1 0%, transparent 35%)',
          }} />
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
      )}

      {/* 2. Gradient Overlay */}
      <div className={`absolute inset-0 z-0 ${isDark
        ? 'bg-gradient-to-r from-[#0f0d1a]/40 via-transparent to-[#0f0d1a]/40'
        : 'bg-gradient-to-r from-[#fffbf5]/90 via-[#fffbf5]/80 to-[#fffbf5]/10'
        }`} />

      {/* 3. Sharp Accent Line at the top */}
      <div className={`absolute top-0 left-0 w-full h-1.5 z-10 ${isDark ? 'bg-indigo-500' : 'bg-yellow-400'}`} />

      {/* Left Content: Text */}
      <div className="relative z-10 flex-1 max-w-xl">
        {/* Crisp Top Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-[0.15em] mb-6 shadow-sm border ${isDark
          ? 'bg-[#1a1535] border-[#2d2450] text-indigo-400'
          : 'bg-white border-orange-200 text-orange-600'
          }`}>
          <Sparkles size={12} strokeWidth={2.5} />
          {t('heroTagline')}
        </div>

        {/* High Contrast Typography */}
        <h2 className={`font-display font-extrabold text-4xl sm:text-[3.25rem] tracking-tight leading-[1.05] drop-shadow-sm ${isDark ? 'text-gray-100' : 'text-[#3b2110]'
          }`}>
          {t('heroTitle1')}
          <br />
          <span className={isDark ? 'text-indigo-400' : 'text-orange-600'}>{t('heroTitle2')}</span>
        </h2>

        <p className={`font-semibold text-sm sm:text-base leading-relaxed mt-5 max-w-md ${isDark ? 'text-gray-400' : 'text-[#5a3622]'
          }`}>
          {t('heroDesc')}
        </p>

        {/* Sharp Action Button */}
        <button
          onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
          className={`mt-8 flex items-center gap-2 px-6 py-3 rounded-md text-sm font-bold text-white border border-transparent transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 active:shadow-none ${isDark
            ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,80,180,0.25)]'
            : 'bg-orange-500 hover:bg-orange-600 hover:shadow-[0_4px_12px_rgba(249,115,22,0.25)]'
            }`}
        >
          {t('startShopping')}
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Right Content: Ticket */}
      <div className="relative z-10 hidden sm:flex shrink-0">
        <div className={`rounded-xl p-8 text-center border-2 transform hover:-translate-y-1 transition-transform duration-300 w-64 ${isDark
          ? 'bg-[#13102a] border-[#2d2450] shadow-[8px_8px_0px_0px_#6366f1]'
          : 'bg-[#fffbf5] border-orange-300 shadow-[8px_8px_0px_0px_#fb923c]'
          }`}>
          {/* Floating Icon Box */}
          <div className={`mx-auto w-12 h-12 rounded-lg border flex items-center justify-center mb-5 ${isDark ? 'bg-indigo-500/10 border-[#2d2450]' : 'bg-orange-100/50 border-orange-200'
            }`}>
            <span className="text-2xl drop-shadow-sm">🛵</span>
          </div>

          <p className={`font-black text-[10px] tracking-[0.2em] uppercase leading-tight mb-2 ${isDark ? 'text-gray-300' : 'text-[#3b2110]'
            }`}>
            {t('freeDeliveryAbove')}
          </p>

          <div className={`font-display font-black leading-none text-[3.5rem] mb-4 tracking-tight ${isDark ? 'text-indigo-400' : 'text-orange-500'
            }`}>
            ₹99
          </div>

          {/* Limited Time Badge */}
          <div className={`inline-block text-[9px] font-bold px-3 py-1.5 rounded-md uppercase tracking-[0.1em] shadow-sm border ${isDark
            ? 'bg-[#1a1535] text-indigo-400 border-[#2d2450]'
            : 'bg-white text-orange-600 border-orange-200'
            }`}>
            {t('limitedTime')}
          </div>
        </div>
      </div>
    </div>
  );
}