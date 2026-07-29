'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useProductFilter } from './useProductFilter';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import ProductCard from './ProductCard';
import { Product } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const ITEMS_PER_PAGE = 12;

export default function ProductGrid() {
  const { activeCategory, activeSubCategory, activeBrand, sort, priceRange, search } = useProductFilter();
  const { isDark } = useTheme();
  const { currentUser } = useApp();
  const isAdmin = currentUser?.role === 'shopkeeper';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      try {
        const url = isAdmin ? `${API_URL}/catalog?admin=true` : `${API_URL}/catalog`;
        const res = await fetch(url);
        const data = await res.json();
        if (!cancelled && data.success) setProducts(data.products);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducts();

    // Refetch when user comes back to the tab (tab was hidden then visible)
    const onVisible = () => { if (document.visibilityState === 'visible') fetchProducts(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { cancelled = true; document.removeEventListener('visibilitychange', onVisible); };
  }, [isAdmin]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [activeCategory, activeSubCategory, activeBrand, sort, priceRange, search]);

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const productCategory = (p.category || p.cat || '').trim().toLowerCase();
      const productSubCat = (p.subCategory || '').trim().toLowerCase();
      const productBrand = (p.brand || '').trim().toLowerCase();
      const activeCat = activeCategory.trim().toLowerCase();
      const matchCat = activeCategory === 'all' || productCategory === activeCat;
      const matchSubCat = activeSubCategory === 'all' || productSubCat === activeSubCategory.toLowerCase();
      const matchBrand = activeBrand === 'all' || productBrand === activeBrand.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        productCategory.includes(search.toLowerCase()) ||
        productBrand.includes(search.toLowerCase());
      let matchPrice = true;
      if (priceRange === '0-50') matchPrice = p.price < 50;
      if (priceRange === '50-100') matchPrice = p.price >= 50 && p.price <= 100;
      if (priceRange === '100-300') matchPrice = p.price > 100 && p.price <= 300;
      if (priceRange === '300+') matchPrice = p.price > 300;
      return matchCat && matchSubCat && matchBrand && matchSearch && matchPrice;
    });

    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'new') list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [products, activeCategory, activeSubCategory, activeBrand, sort, priceRange, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedProducts = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

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

  const scrollToGrid = () => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section ref={sectionRef}>
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
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
            {paginatedProducts.map(p => <ProductCard key={p._id || p.id} product={p} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
              {/* Prev */}
              <button
                onClick={() => { setPage(p => Math.max(1, p - 1)); scrollToGrid(); }}
                disabled={page === 1}
                className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation ${
                  isDark
                    ? 'bg-[#1a1535] border-[#2d2450] text-gray-300 hover:bg-[#251e40] hover:border-indigo-500/50'
                    : 'bg-white border-orange-200 text-amber-900 hover:bg-orange-50 hover:border-orange-400'
                }`}
              >
                <ChevronLeft size={15} strokeWidth={2.5} />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce<(number | '...')[]>((acc, n, idx, arr) => {
                  if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push('...');
                  acc.push(n);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === '...' ? (
                    <span key={`ellipsis-${idx}`} className={`px-1 text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => { setPage(item as number); scrollToGrid(); }}
                      className={`min-w-[34px] h-[34px] px-1 rounded-xl text-xs font-bold border transition-all active:scale-95 touch-manipulation ${
                        page === item
                          ? isDark
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                            : 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200'
                          : isDark
                            ? 'bg-[#1a1535] border-[#2d2450] text-gray-400 hover:bg-[#251e40] hover:text-gray-200'
                            : 'bg-white border-orange-100 text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              {/* Next */}
              <button
                onClick={() => { setPage(p => Math.min(totalPages, p + 1)); scrollToGrid(); }}
                disabled={page === totalPages}
                className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation ${
                  isDark
                    ? 'bg-[#1a1535] border-[#2d2450] text-gray-300 hover:bg-[#251e40] hover:border-indigo-500/50'
                    : 'bg-white border-orange-200 text-amber-900 hover:bg-orange-50 hover:border-orange-400'
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={15} strokeWidth={2.5} />
              </button>
            </div>
          )}

          {/* Page info */}
          {totalPages > 1 && (
            <p className={`text-center text-xs font-medium mt-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} products
            </p>
          )}
        </>
      )}
    </section>
  );
}
