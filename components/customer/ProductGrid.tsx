'use client';

import { useMemo } from 'react';
import { PRODUCTS, CATEGORIES } from '@/lib/data';
import { useProductFilter } from './useProductFilter';
import ProductCard from './ProductCard';

export default function ProductGrid() {
  const { activeCategory, sort, priceRange, search } = useProductFilter();

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter(p => {
      const matchCat    = activeCategory === 'all' || p.cat === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.cat.includes(search.toLowerCase());
      let matchPrice = true;
      if (priceRange === '0-50')    matchPrice = p.price < 50;
      if (priceRange === '50-100')  matchPrice = p.price >= 50  && p.price <= 100;
      if (priceRange === '100-300') matchPrice = p.price > 100  && p.price <= 300;
      if (priceRange === '300+')    matchPrice = p.price > 300;
      return matchCat && matchSearch && matchPrice;
    });

    if (sort === 'price-asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'new')        list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));
    if (sort === 'name')       list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [activeCategory, sort, priceRange, search]);

  const catLabel = CATEGORIES.find(c => c.id === activeCategory)?.label || 'All Items';

  return (
    <section>
      <h3
        className="font-display text-2xl mb-4 flex items-center gap-3"
        style={{ color: 'var(--dark)' }}
      >
        {catLabel}
        <span
          className="text-xs font-sans font-bold px-3 py-1 rounded-full"
          style={{
            background: 'var(--gold-pale)',
            color: 'var(--brown)',
            border: '1px solid rgba(201,148,26,.3)',
          }}
        >
          {filtered.length} items
        </span>
      </h3>

      {filtered.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
          <div className="text-6xl mb-4">🔍</div>
          <h4 className="text-lg font-bold" style={{ color: 'var(--dark)' }}>No products found</h4>
          <p className="text-sm mt-1">Try a different search or category.</p>
        </div>
      ) : (
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}
        >
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  );
}
