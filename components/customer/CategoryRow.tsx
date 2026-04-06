'use client';

import { useState, useEffect, useRef } from 'react';
import { useProductFilter } from './useProductFilter';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LanguageContext';
import { Product } from '@/lib/types';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

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
  const [subCategoryMap, setSubCategoryMap] = useState<Record<string, string[]>>({});
  const subCategories = activeCategory !== 'all' ? (subCategoryMap[activeCategory] || []) : [];

  // scroll state for main categories
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/catalog`);
        const data = await res.json();
        if (data.success && data.products) {
          const cats = [...new Set(
            data.products
              .map((p: Product) => (p.category || '').trim().toLowerCase())
              .filter(Boolean)
          )] as string[];
          setCategories(cats);

          // Build sub-category map upfront so we can display counts
          const map: Record<string, string[]> = {};
          cats.forEach(cat => {
            const subs = [...new Set(
              data.products
                .filter((p: Product) => (p.category || '').trim().toLowerCase() === cat)
                .map((p: Product) => (p.subCategory || '').trim().toLowerCase())
                .filter(Boolean)
            )] as string[];
            if (subs.length > 0) map[cat] = subs;
          });
          setSubCategoryMap(map);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

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
    el.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  if (categories.length === 0) return null;

  /* ── Styles ── */
  const catActive = isDark
    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border-indigo-500'
    : 'bg-orange-500 text-white shadow-md shadow-orange-300/50 border-orange-400';

  const catInactive = isDark
    ? 'bg-[#1a1535] border-[#2d2450] text-gray-400 hover:border-indigo-500/40 hover:text-indigo-300 hover:bg-[#211c3c]'
    : 'bg-white border-orange-100 text-amber-900/60 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600';

  const subActive = isDark
    ? 'bg-indigo-500/25 border-indigo-400/60 text-indigo-300 font-bold'
    : 'bg-orange-100 border-orange-300 text-orange-700 font-bold';

  const subInactive = isDark
    ? 'bg-[#17142e] border-[#2d2450] text-gray-500 hover:text-indigo-300 hover:border-indigo-500/30 hover:bg-indigo-500/10'
    : 'bg-orange-50/60 border-orange-100 text-amber-700/60 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50';

  const arrowBtn = `absolute top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full flex items-center justify-center shadow-md border transition-all duration-200 active:scale-90 ${
    isDark
      ? 'bg-[#1a1535] border-[#2d2450] text-indigo-400 hover:bg-indigo-500/20'
      : 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50'
  }`;

  const hasSubCats = subCategories.length > 0;

  return (
    <div className="space-y-3">
      {/* ── Main category scrollable row ── */}
      <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">

        {canScrollLeft && (
          <button onClick={() => scroll('left')} className={`${arrowBtn} left-0 sm:-left-3`} aria-label="Scroll left">
            <ChevronLeft size={15} strokeWidth={2.5} />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-3 pt-1 scroll-smooth touch-pan-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* All Items pill */}
          <button
            onClick={() => { setActiveCategory('all'); setActiveSubCategory('all'); }}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border text-[12px] font-bold transition-all duration-200 whitespace-nowrap ${
              activeCategory === 'all' ? catActive : catInactive
            }`}
          >
            <span className="text-base leading-none">🛍️</span>
            <span>{t('allItems')}</span>
          </button>

          {/* Category pills */}
          {categories.map(cat => {
            const isActive = activeCategory === cat;
            const label = cat.charAt(0).toUpperCase() + cat.slice(1);
            const hasSubs = !!(subCategoryMap[cat]?.length);

            return (
              <button
                key={cat}
                onClick={() => {
                  if (isActive) {
                    // Toggle off — go back to all
                    setActiveCategory('all');
                    setActiveSubCategory('all');
                  } else {
                    setActiveCategory(cat);
                    setActiveSubCategory('all');
                  }
                }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border text-[12px] font-bold transition-all duration-200 whitespace-nowrap ${
                  isActive ? catActive : catInactive
                }`}
              >
                <span className="text-base leading-none">{CATEGORY_EMOJI[cat.toLowerCase()] || '📦'}</span>
                <span>{label}</span>
                {hasSubs && (
                  <ChevronDown
                    size={12}
                    strokeWidth={3}
                    className={`transition-transform duration-200 ${isActive ? 'rotate-180' : 'rotate-0'} ${isActive ? 'text-white/80' : ''}`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {canScrollRight && (
          <button onClick={() => scroll('right')} className={`${arrowBtn} right-0 sm:-right-3`} aria-label="Scroll right">
            <ChevronRight size={15} strokeWidth={2.5} />
          </button>
        )}

        {/* Fade gradients */}
        <div className={`hidden sm:block absolute top-0 right-0 h-full w-12 bg-gradient-to-l pointer-events-none ${
          isDark ? 'from-[#0f0d1a]/80 to-transparent' : 'from-[#fffbf5]/80 to-transparent'
        }`} />
        <div className={`hidden sm:block absolute top-0 left-0 h-full w-12 bg-gradient-to-r pointer-events-none ${
          isDark ? 'from-[#0f0d1a]/80 to-transparent' : 'from-[#fffbf5]/80 to-transparent'
        }`} />
      </div>

      {/* ── Sub-category chips (only when a category with subs is active) ── */}
      {hasSubCats && (
        <div
          className={`rounded-2xl p-3 border transition-all duration-300 ${
            isDark ? 'bg-[#131028]/70 border-[#2d2450]' : 'bg-orange-50/80 border-orange-100'
          }`}
        >
          <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-gray-600' : 'text-amber-900/40'}`}>
            {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} › Sub-categories
          </p>
          <div className="flex flex-wrap gap-2">
            {/* "All" chip */}
            <button
              onClick={() => setActiveSubCategory('all')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all duration-200 ${
                activeSubCategory === 'all' ? subActive : subInactive
              }`}
            >
              All
            </button>
            {subCategories.map(sub => (
              <button
                key={sub}
                onClick={() => setActiveSubCategory(sub)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border capitalize transition-all duration-200 ${
                  activeSubCategory === sub ? subActive : subInactive
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}