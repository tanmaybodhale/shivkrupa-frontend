'use client';

import { useState, useEffect, useMemo } from 'react';
import { useProductFilter } from './useProductFilter';
import { useTheme } from '@/context/ThemeContext';
import ProductCard from './ProductCard';
import { Product } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProductGrid() {
  const { activeCategory, sort, priceRange, search } = useProductFilter();
  const { isDark } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/catalog`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();

    const interval = setInterval(fetchProducts, 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const productCategory = (p.category || p.cat || '').trim().toLowerCase();
      const activeCat = activeCategory.trim().toLowerCase();
      const matchCat = activeCategory === 'all' || productCategory === activeCat;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        productCategory.includes(search.toLowerCase());
      let matchPrice = true;
      if (priceRange === '0-50') matchPrice = p.price < 50;
      if (priceRange === '50-100') matchPrice = p.price >= 50 && p.price <= 100;
      if (priceRange === '100-300') matchPrice = p.price > 100 && p.price <= 300;
      if (priceRange === '300+') matchPrice = p.price > 300;
      return matchCat && matchSearch && matchPrice;
    });

    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'new') list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [products, activeCategory, sort, priceRange, search]);

  const catLabel = activeCategory === 'all' ? 'All Items' : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1);

  if (loading) {
    return (
      <section>
        <div className="text-center py-20">
          <div className="text-4xl mb-4">📦</div>
          <p style={{ color: 'var(--muted)' }}>Loading products...</p>
        </div>
      </section>
    );
  }

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
            background: isDark ? '#1a1535' : 'var(--gold-pale)',
            color: isDark ? '#a5b4fc' : 'var(--brown)',
            border: isDark ? '1px solid #2d2450' : '1px solid rgba(201,148,26,.3)',
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
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
          {filtered.map(p => <ProductCard key={p._id || p.id} product={p} />)}
        </div>
      )}
    </section>
  );
}
