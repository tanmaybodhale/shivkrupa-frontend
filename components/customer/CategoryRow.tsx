'use client';

import { useState, useEffect } from 'react';
import { useProductFilter } from './useProductFilter';
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
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/catalog`);
        const data = await res.json();
        if (data.success && data.products) {
          const cats = [...new Set(data.products.map((p: Product) => p.category))];
          setCategories(cats.filter(Boolean) as string[]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
      {/* Horizontal scrolling container. 
        Uses snap scrolling and hides the scrollbar for a native app feel. 
      */}
      <div className="flex gap-3 overflow-x-auto pb-4 pt-2 no-scrollbar snap-x snap-mandatory scroll-smooth touch-pan-x">
        
        {/* "All Items" Card */}
        <button
          onClick={() => setActiveCategory('all')}
          className={`relative flex flex-col items-center justify-center gap-1.5 min-w-[84px] h-[92px] rounded-[1.25rem] transition-all duration-300 snap-start shrink-0 ${
            activeCategory === 'all'
              ? 'bg-gradient-to-b from-orange-400 to-orange-500 shadow-lg shadow-orange-300/50 text-white scale-105 border-0'
              : 'bg-white border border-orange-100 text-amber-900/70 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 shadow-sm shadow-orange-900/5'
          }`}
        >
          <span className="text-3xl drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
            🛍️
          </span>
          <span className={`text-[11px] font-black tracking-wide text-center px-1 leading-tight ${activeCategory === 'all' ? 'text-white' : ''}`}>
            All Items
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
              className={`relative flex flex-col items-center justify-center gap-1.5 min-w-[84px] h-[92px] rounded-[1.25rem] transition-all duration-300 snap-start shrink-0 ${
                isActive
                  ? 'bg-gradient-to-b from-orange-400 to-orange-500 shadow-lg shadow-orange-300/50 text-white scale-105 border-0 z-10'
                  : 'bg-white border border-orange-100 text-amber-900/70 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 shadow-sm shadow-orange-900/5'
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
      
      {/* Optional: Right fade gradient to indicate more scrolling available on desktop */}
      <div className="hidden sm:block absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-orange-50/80 to-transparent pointer-events-none" />
    </div>
  );
}