'use client';

import { useState, useEffect, useMemo } from 'react';
import { useProductFilter } from './useProductFilter';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LanguageContext';
import { Product } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function FiltersRow() {
  const { sort, priceRange, search, activeCategory, activeBrand, setSort, setPriceRange, setSearch, setActiveBrand } = useProductFilter();
  const { isDark } = useTheme();
  const { t } = useLang();
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/catalog`);
        const data = await res.json();
        if (data.success && data.products) {
          setAllProducts(data.products);
        }
      } catch {
        // silently fail
      }
    };
    fetchProducts();
  }, []);

  // Brands scoped to the active category
  const brands = useMemo(() => {
    const source = activeCategory === 'all'
      ? allProducts
      : allProducts.filter(p => (p.category || '').trim().toLowerCase() === activeCategory.toLowerCase());

    return [...new Set(
      source.map(p => (p.brand || '').trim()).filter(Boolean)
    )] as string[];
  }, [allProducts, activeCategory]);

  // When category changes, reset brand if current brand is not in new list
  useEffect(() => {
    if (activeBrand !== 'all' && !brands.map(b => b.toLowerCase()).includes(activeBrand)) {
      setActiveBrand('all');
    }
  }, [brands, activeBrand, setActiveBrand]);

  const selectStyle = {
    padding: '9px 14px',
    borderRadius: 10,
    border: isDark ? '2px solid #2d2450' : '2px solid #e0e0e0',
    background: isDark ? '#1a1535' : '#fff',
    fontSize: 13,
    fontWeight: 600,
    color: isDark ? '#e8e0f0' : 'var(--dark)',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color .2s, background .2s',
  } as React.CSSProperties;

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6 w-full items-stretch md:items-center">
      {/* Search */}
      <div className="relative flex-1 w-full md:min-w-[200px]">
        <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg ${isDark ? 'text-gray-500' : ''}`} style={{ color: isDark ? undefined : 'var(--muted)' }}>
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('search')}
          className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${isDark ? 'text-gray-200 placeholder-gray-600' : ''}`}
          style={{
            border: isDark ? '2px solid #2d2450' : '2px solid #e0e0e0',
            background: isDark ? '#1a1535' : '#fff',
            fontSize: 14,
            transition: 'border-color .2s',
            color: isDark ? '#e8e0f0' : undefined,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = isDark ? '#6366f1' : 'var(--gold)')}
          onBlur={e => (e.currentTarget.style.borderColor = isDark ? '#2d2450' : '#e0e0e0')}
        />
      </div>

      <div className="flex gap-2 items-center flex-1 w-full flex-wrap sm:flex-nowrap">
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={selectStyle}
          className="flex-1 min-w-[120px]"
        >
          <option value="default">{t('sortBy')}...</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="new">Newest First</option>
          <option value="name">Name A–Z</option>
        </select>

        <select
          value={priceRange}
          onChange={e => setPriceRange(e.target.value)}
          style={selectStyle}
          className="flex-1 min-w-[120px]"
        >
          <option value="">{t('priceRange')}...</option>
          <option value="0-50">Under ₹50</option>
          <option value="50-100">₹50 – ₹100</option>
          <option value="100-300">₹100 – ₹300</option>
          <option value="300+">Above ₹300</option>
        </select>

        {/* Brand filter — only shown when brands exist for the active category */}
        {brands.length > 0 && (
          <select
            value={activeBrand}
            onChange={e => setActiveBrand(e.target.value)}
            style={selectStyle}
            className="flex-1 min-w-[120px]"
          >
            <option value="all">
              {activeCategory === 'all' ? 'All Brands' : `All ${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Brands`}
            </option>
            {brands.map(b => (
              <option key={b} value={b.toLowerCase()}>{b}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
