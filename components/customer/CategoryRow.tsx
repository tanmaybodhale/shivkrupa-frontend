'use client';

import { useState, useEffect, useRef } from 'react';
import { useProductFilter } from './useProductFilter';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LanguageContext';
import { Product } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const CATEGORY_EMOJI: Record<string, string> = {
  stationery: '✏️',
  snacks: '🍫',
  gifts: '🎁',
  jewellery: '💍',
  cutlery: '🍴',
  xerox: '🖨️',
  cosmetics: '💄',
  bags: '👜',
  toys: '🧸',
  household: '🏠',
  general: '🛒',
};

export default function CategoryRow() {
  const { activeCategory, setActiveCategory, activeSubCategory, setActiveSubCategory } = useProductFilter();
  const { isDark } = useTheme();
  const { t } = useLang();
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // scroll state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/catalog`);
        const data = await res.json();
        if (data.success && data.products) {
          setAllProducts(data.products);
          const cats = [...new Set(
            data.products
              .map((p: Product) => (p.category || '').trim().toLowerCase())
              .filter(Boolean)
          )];
          setCategories(cats as string[]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Update subcategories when active category changes
  useEffect(() => {
    if (activeCategory === 'all') {
      setSubCategories([]);
      return;
    }
    const subs = [...new Set(
      allProducts
        .filter(p => (p.category || '').trim().toLowerCase() === activeCategory)
        .map(p => (p.subCategory || '').trim().toLowerCase())
        .filter(Boolean)
    )];
    setSubCategories(subs as string[]);
  }, [activeCategory, allProducts]);

  // Check scroll position and update arrow visibility
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [categories]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -260 : 260, behavior: 'smooth' });
  };

  if (categories.length === 0) return null;

  const activeStyle = isDark
    ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-900/50 text-white scale-105 border-0'
    : 'bg-gradient-to-b from-orange-400 to-orange-500 shadow-lg shadow-orange-300/50 text-white scale-105 border-0';

  const inactiveStyle = isDark
    ? 'bg-[#1a1535] border border-[#2d2450] text-gray-400 hover:bg-[#251e40] hover:border-indigo-500/30 hover:text-indigo-400 shadow-sm shadow-black/10'
    : 'bg-white border border-orange-100 text-amber-900/70 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 shadow-sm shadow-orange-900/5';

  const subActiveStyle = isDark
    ? 'bg-indigo-500/30 border border-indigo-500/60 text-indigo-300 font-bold'
    : 'bg-orange-100 border border-orange-300 text-orange-700 font-bold';

  const subInactiveStyle = isDark
    ? 'bg-[#1a1535] border border-[#2d2450] text-gray-400 hover:text-indigo-400 hover:border-indigo-500/30'
    : 'bg-white border border-orange-100 text-amber-800/60 hover:text-orange-600 hover:border-orange-200';

  const arrowBtn = `absolute top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-md border transition-all duration-200 active:scale-90 ${
    isDark
      ? 'bg-[#1a1535] border-[#2d2450] text-indigo-400 hover:bg-indigo-500/20'
      : 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50'
  }`;

  return (
    <div className="space-y-3">
      {/* Main Categories */}
      <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">

        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className={`${arrowBtn} left-0 sm:-left-4`}
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
        )}

        {/* Scrollable track */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-4 pt-2 scroll-smooth touch-pan-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Hide webkit scrollbar via inline style — avoids needing Tailwind plugin */}
          <style>{`.cat-scroll::-webkit-scrollbar{display:none}`}</style>

          {/* "All Items" Card */}
          <button
            onClick={() => setActiveCategory('all')}
            className={`relative flex flex-col items-center justify-center gap-1.5 min-w-[84px] h-[92px] rounded-[1.25rem] transition-all duration-300 snap-start shrink-0 ${
              activeCategory === 'all' ? activeStyle : inactiveStyle
            }`}
          >
            <span className="text-3xl drop-shadow-sm">🛍️</span>
            <span className={`text-[11px] font-black tracking-wide text-center px-1 leading-tight ${activeCategory === 'all' ? 'text-white' : ''}`}>
              {t('allItems')}
            </span>
          </button>

          {/* Dynamic Category Cards */}
          {categories.map(cat => {
            const isActive = activeCategory === cat;
            const label = cat.charAt(0).toUpperCase() + cat.slice(1);

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative flex flex-col items-center justify-center gap-1.5 min-w-[84px] h-[92px] rounded-[1.25rem] transition-all duration-300 shrink-0 ${
                  isActive ? activeStyle + ' z-10' : inactiveStyle
                }`}
              >
                <div className="relative">
                  <span className="text-3xl drop-shadow-sm">{CATEGORY_EMOJI[cat.toLowerCase()] || '📦'}</span>
                  {isActive && (
                    <div className="absolute inset-0 bg-white/20 blur-md rounded-full -z-10" />
                  )}
                </div>
                <span className={`text-[11px] font-black tracking-wide text-center px-1 leading-tight line-clamp-2 ${isActive ? 'text-white' : ''}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className={`${arrowBtn} right-0 sm:-right-4`}
            aria-label="Scroll right"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        )}

        {/* Right fade gradient (desktop only, behind arrow) */}
        <div className={`hidden sm:block absolute top-0 right-0 h-full w-16 bg-gradient-to-l pointer-events-none ${
          isDark ? 'from-[#0f0d1a]/80 to-transparent' : 'from-[#fffbf5]/80 to-transparent'
        }`} />
        {/* Left fade gradient */}
        <div className={`hidden sm:block absolute top-0 left-0 h-full w-16 bg-gradient-to-r pointer-events-none ${
          isDark ? 'from-[#0f0d1a]/80 to-transparent' : 'from-[#fffbf5]/80 to-transparent'
        }`} />
      </div>

      {/* Sub-categories row */}
      {subCategories.length > 0 && activeCategory !== 'all' && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button
            onClick={() => setActiveSubCategory('all')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${activeSubCategory === 'all' ? subActiveStyle : subInactiveStyle}`}
          >
            All
          </button>
          {subCategories.map(sub => (
            <button
              key={sub}
              onClick={() => setActiveSubCategory(sub)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all capitalize ${activeSubCategory === sub ? subActiveStyle : subInactiveStyle}`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}