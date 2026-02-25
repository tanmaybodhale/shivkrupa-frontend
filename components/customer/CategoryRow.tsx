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
          setCategories(cats.filter(Boolean));
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-2 mb-6 no-scrollbar">
      <button
        onClick={() => setActiveCategory('all')}
        className={`cat-chip ${activeCategory === 'all' ? 'active' : ''}`}
      >
        <span className="text-2xl">🛍️</span>
        All Items
      </button>
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          className={`cat-chip ${activeCategory === cat ? 'active' : ''}`}
        >
          <span className="text-2xl">{CATEGORY_EMOJI[cat] || '📦'}</span>
          {cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
      ))}
    </div>
  );
}
