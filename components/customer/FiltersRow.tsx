'use client';

import { useProductFilter } from './useProductFilter';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LanguageContext';

export default function FiltersRow() {
  const { sort, priceRange, search, setSort, setPriceRange, setSearch } = useProductFilter();
  const { isDark } = useTheme();
  const { t } = useLang();

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
    <div className="flex gap-3 mb-6 flex-wrap items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg ${isDark ? 'text-gray-500' : ''}`} style={{ color: isDark ? undefined : 'var(--muted)' }}>
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('search')}
          className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${isDark ? 'text-gray-200 placeholder-gray-600' : ''
            }`}
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

      <label className={`text-sm font-semibold ${isDark ? 'text-gray-400' : ''}`} style={{ color: isDark ? undefined : 'var(--muted)' }}>{t('sortBy')}:</label>
      <select
        value={sort}
        onChange={e => setSort(e.target.value)}
        style={selectStyle}
      >
        <option value="default">Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="new">Newest First</option>
        <option value="name">Name A–Z</option>
      </select>

      <label className={`text-sm font-semibold ${isDark ? 'text-gray-400' : ''}`} style={{ color: isDark ? undefined : 'var(--muted)' }}>{t('priceRange')}:</label>
      <select
        value={priceRange}
        onChange={e => setPriceRange(e.target.value)}
        style={selectStyle}
      >
        <option value="">All Prices</option>
        <option value="0-50">Under ₹50</option>
        <option value="50-100">₹50 – ₹100</option>
        <option value="100-300">₹100 – ₹300</option>
        <option value="300+">Above ₹300</option>
      </select>
    </div>
  );
}
