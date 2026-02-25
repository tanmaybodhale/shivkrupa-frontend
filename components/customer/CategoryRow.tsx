'use client';

import { useProductFilter } from './useProductFilter';
import { CATEGORIES } from '@/lib/data';

export default function CategoryRow() {
  const { activeCategory, setActiveCategory } = useProductFilter();

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-2 mb-6 no-scrollbar">
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          onClick={() => setActiveCategory(cat.id)}
          className={`cat-chip ${activeCategory === cat.id ? 'active' : ''}`}
        >
          <span className="text-2xl">{cat.emoji}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
