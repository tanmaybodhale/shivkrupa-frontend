'use client';

import { useProductFilter } from './useProductFilter';

export default function FiltersRow() {
  const { sort, priceRange, search, setSort, setPriceRange, setSearch } = useProductFilter();

  const selectStyle = {
    padding: '9px 14px',
    borderRadius: 10,
    border: '2px solid #e0e0e0',
    background: '#fff',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--dark)',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color .2s',
  } as React.CSSProperties;

  return (
    <div className="flex gap-3 mb-6 flex-wrap items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg" style={{ color: 'var(--muted)' }}>
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products — pens, earrings, chocolates..."
          className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none"
          style={{
            border: '2px solid #e0e0e0',
            background: '#fff',
            fontSize: 14,
            transition: 'border-color .2s',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
          onBlur={e => (e.currentTarget.style.borderColor = '#e0e0e0')}
        />
      </div>

      <label className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Sort:</label>
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

      <label className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Price:</label>
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
