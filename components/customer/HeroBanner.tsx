'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SLIDE_DURATION = 3000;

interface Banner {
  _id: string;
  image: string;
  link?: string;
  title?: string;
  order: number;
  active: boolean;
}

export default function HeroBanner() {
  const { isDark } = useTheme();
  const { t } = useLang();
  const router = useRouter();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API_URL}/banners`);
        const data = await res.json();
        if (data.success) setBanners(data.banners);
      } catch (error) {
        console.error('Failed to load banners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Auto-advance, unless paused or there's nothing to rotate through
  useEffect(() => {
    if (paused || banners.length <= 1) return;
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % banners.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [paused, banners.length]);

  const goTo = (i: number) => setIndex(((i % banners.length) + banners.length) % banners.length);

  const handleSlideClick = () => setPaused(p => !p);

  const handleCtaClick = (e: React.MouseEvent, link?: string) => {
    e.stopPropagation();
    if (link) router.push(link);
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      goTo(index + (dx < 0 ? 1 : -1));
      setPaused(true);
    }
  };

  /* ── Slideshow (banners configured by admin) ── */
  if (!loading && banners.length > 0) {
    const current = banners[index];

    return (
      <div
        className={`relative overflow-hidden rounded-3xl mt-4 mb-8 border shadow-sm select-none ${isDark ? 'border-[#2d2450]' : 'border-orange-200'
          }`}
        style={{ aspectRatio: '21 / 9' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Accent line */}
        <div className={`absolute top-0 left-0 w-full h-1.5 z-20 ${isDark ? 'bg-indigo-500' : 'bg-yellow-400'}`} />

        {/* Slide image */}
        <div className="absolute inset-0 cursor-pointer" onClick={handleSlideClick}>
          <img
            src={current.image}
            alt={current.title || 'Banner'}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        </div>

        {/* Pause indicator */}
        {paused && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider pointer-events-none">
            <Pause size={11} /> Paused — tap to resume
          </div>
        )}

        {/* Shop-now CTA, only if this banner has a link */}
        {current.link && (
          <button
            onClick={(e) => handleCtaClick(e, current.link)}
            className={`absolute bottom-5 right-5 z-20 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 ${isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-orange-500 hover:bg-orange-600'
              }`}
          >
            {t('startShopping')}
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        )}

        {/* Prev/Next arrows — desktop only, appear on hover */}
        {banners.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goTo(index - 1); setPaused(true); }}
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white items-center justify-center transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
              style={{ opacity: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goTo(index + 1); setPaused(true); }}
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white items-center justify-center transition-all"
              style={{ opacity: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); goTo(i); setPaused(true); }}
                className={`rounded-full transition-all ${i === index ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Fallback: original static hero, shown until the admin adds banners ── */
  return (
    <div className={`relative overflow-hidden rounded-3xl mt-4 mb-8 p-8 sm:p-12 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10 shadow-sm transition-colors duration-300 ${isDark ? 'border-[#2d2450]' : 'border-orange-200'
      }`}>

      <div
        className={`absolute inset-0 z-0 transition-opacity duration-500 ${isDark ? 'opacity-0' : 'opacity-100'}`}
        style={{
          backgroundImage: 'url(/Traditional.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
        }}
      />

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

      <div className={`absolute inset-0 z-0 ${isDark
        ? 'bg-gradient-to-r from-[#0f0d1a]/40 via-transparent to-[#0f0d1a]/40'
        : 'bg-gradient-to-r from-[#fffbf5]/90 via-[#fffbf5]/80 to-[#fffbf5]/10'
        }`} />

      <div className={`absolute top-0 left-0 w-full h-1.5 z-10 ${isDark ? 'bg-indigo-500' : 'bg-yellow-400'}`} />

      <div className="relative z-10 flex-1 max-w-xl">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-[0.15em] mb-6 shadow-sm border ${isDark
          ? 'bg-[#1a1535] border-[#2d2450] text-indigo-400'
          : 'bg-white border-orange-200 text-orange-600'
          }`}>
          <Sparkles size={12} strokeWidth={2.5} />
          {t('heroTagline')}
        </div>

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

      <div className="relative z-10 flex shrink-0 w-full sm:w-auto justify-center mt-8 sm:mt-0">
        <div className={`rounded-xl p-8 text-center border-2 transform hover:-translate-y-1 transition-transform duration-300 w-full max-w-[280px] sm:w-64 ${isDark
          ? 'bg-[#13102a] border-[#2d2450] shadow-[8px_8px_0px_0px_#6366f1]'
          : 'bg-[#fffbf5] border-orange-300 shadow-[8px_8px_0px_0px_#fb923c]'
          }`}>
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
