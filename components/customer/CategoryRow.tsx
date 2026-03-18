'use client';

import { useState, useEffect } from 'react';
import { useProductFilter } from './useProductFilter';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LanguageContext';
import { Product } from '@/lib/types';

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
};

export default function CategoryRow() {
  const { activeCategory, setActiveCategory } = useProductFilter();
  const { isDark } = useTheme();
  const { t } = useLang();
  const [categories, setCategories] = useState<string[]>([]);

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
          )];
          setCategories(cats as string[]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  if (categories.length === 0) return null;

  const activeStyle = isDark
    ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-900/50 text-white scale-105 border-0'
    : 'bg-gradient-to-b from-orange-400 to-orange-500 shadow-lg shadow-orange-300/50 text-white scale-105 border-0';

  const inactiveStyle = isDark
    ? 'bg-[#1a1535] border border-[#2d2450] text-gray-400 hover:bg-[#251e40] hover:border-indigo-500/30 hover:text-indigo-400 shadow-sm shadow-black/10'
    : 'bg-white border border-orange-100 text-amber-900/70 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 shadow-sm shadow-orange-900/5';

  return (
    <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-3 overflow-x-auto pb-4 pt-2 no-scrollbar snap-x snap-mandatory scroll-smooth touch-pan-x">

        {/* "All Items" Card */}
        <button
          onClick={() => setActiveCategory('all')}
          className={`relative flex flex-col items-center justify-center gap-1.5 min-w-[84px] h-[92px] rounded-[1.25rem] transition-all duration-300 snap-start shrink-0 ${activeCategory === 'all' ? activeStyle : inactiveStyle
            }`}
        >
          <span className="text-3xl drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
            🛍️
          </span>
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
              className={`relative flex flex-col items-center justify-center gap-1.5 min-w-[84px] h-[92px] rounded-[1.25rem] transition-all duration-300 snap-start shrink-0 ${isActive ? activeStyle + ' z-10' : inactiveStyle
                }`}
            >
              <div className="relative">
                <span className="text-3xl drop-shadow-sm transition-transform duration-300">
                  {CATEGORY_EMOJI[cat.toLowerCase()] || '📦'}
                </span>
                {/* Subtle glow effect behind active emoji */}
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

      {/* Right fade gradient */}
      <div className={`hidden sm:block absolute top-0 right-0 h-full w-12 bg-gradient-to-l pointer-events-none ${isDark ? 'from-[#0f0d1a]/80 to-transparent' : 'from-orange-50/80 to-transparent'
        }`} />
    </div>
  );
}