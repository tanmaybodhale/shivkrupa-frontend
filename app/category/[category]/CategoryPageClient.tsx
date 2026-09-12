'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { useTheme } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/customer/ProductCard';
import CartSidebar from '@/components/customer/CartSidebar';
import MiniCartBar from '@/components/customer/MiniCartBar';
import BillModal from '@/components/shared/BillModal';
import Toast from '@/components/shared/Toast';
import { ArrowLeft, Search, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface SubGroup {
  label: string;
  key: string;
  products: Product[];
}

const scrollbarClass = (isDark: boolean) =>
  `[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full ${
    isDark ? '[&::-webkit-scrollbar-thumb]:bg-[#2d2450]' : '[&::-webkit-scrollbar-thumb]:bg-orange-200'
  }`;

export default function CategoryPageClient() {
  const params = useParams();
  const router = useRouter();
  const category = decodeURIComponent(params.category as string);

  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/catalog`);
        const data = await res.json();
        if (data.success && data.products) setAllProducts(data.products);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Products in this specific category, grouped by sub-category
  const groups: SubGroup[] = useMemo(() => {
    const categoryProducts = allProducts.filter(
      p => (p.category || '').trim().toLowerCase() === category.toLowerCase()
    );

    const bySub: Record<string, Product[]> = {};
    const noSub: Product[] = [];

    categoryProducts.forEach(p => {
      const sub = (p.subCategory || '').trim().toLowerCase();
      if (!sub) { noSub.push(p); return; }
      if (!bySub[sub]) bySub[sub] = [];
      bySub[sub].push(p);
    });

    const built: SubGroup[] = Object.entries(bySub).map(([key, items]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      products: items,
    }));

    if (noSub.length > 0) {
      built.push({ key: 'general', label: 'More in this category', products: noSub });
    }

    return built;
  }, [allProducts, category]);

  // Site-wide search — matches against every product, any category
  const searchResults: Product[] = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return allProducts.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.subCategory || '').toLowerCase().includes(q)
    );
  }, [allProducts, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  const scrollToGroup = (key: string) => {
    const el = document.getElementById(`group-${key}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!mounted) return null;

  const displayName = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <main className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0f0d1a]' : 'bg-[#fffbf5]'}`}>
      <Navbar />

      <div className="max-w-screen-xl mx-auto px-4 py-6 pb-32">

        <button
          onClick={() => router.push('/customer')}
          className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl mb-4 transition-colors ${
            isDark
              ? 'text-gray-400 hover:text-indigo-300 hover:bg-indigo-500/10'
              : 'text-amber-800/60 hover:text-orange-600 hover:bg-orange-100'
          }`}
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back
        </button>

        {/* Site-wide search bar */}
        <div className="relative mb-5">
          <Search
            size={18}
            className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search any product on the site..."
            className={`w-full pl-11 pr-10 py-3 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-4 transition-all ${
              isDark
                ? 'bg-[#1a1535] border-[#2d2450] text-gray-200 placeholder-gray-600 focus:border-indigo-500 focus:ring-indigo-500/10'
                : 'bg-white border-orange-100 text-gray-800 placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400/10'
            }`}
          />
          {isSearching && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center ${
                isDark ? 'bg-[#2d2450] text-gray-400' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {!isSearching && (
          <h1 className={`text-2xl sm:text-3xl font-black mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            {displayName}
          </h1>
        )}

        {/* Subcategory quick-jump pills — hidden while searching */}
        {!isSearching && groups.length > 1 && (
          <div
            className={`flex gap-2 overflow-x-auto pb-3 mb-2 -mx-4 px-4 sm:mx-0 sm:px-0 ${scrollbarClass(isDark)}`}
            style={{ scrollbarWidth: 'thin' }}
          >
            {groups.map(group => (
              <button
                key={group.key}
                onClick={() => scrollToGroup(group.key)}
                className={`shrink-0 px-3.5 py-2 rounded-full border text-[12px] font-bold whitespace-nowrap transition-colors ${
                  isDark
                    ? 'bg-[#1a1535] border-[#2d2450] text-gray-400 hover:text-indigo-300 hover:border-indigo-500/40'
                    : 'bg-white border-orange-100 text-amber-900/60 hover:text-orange-600 hover:border-orange-300'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className={`w-10 h-10 rounded-full border-4 border-t-transparent animate-spin ${isDark ? 'border-indigo-500' : 'border-orange-400'}`} />
          </div>
        ) : isSearching ? (
          searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className={`text-sm font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                No products found for "{searchQuery}".
              </p>
            </div>
          ) : (
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {searchResults.map(product => {
                  const key = product._id || String(product.id || '');
                  return <ProductCard key={key} product={product} />;
                })}
              </div>
            </div>
          )
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className={`text-sm font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              No products found in this category yet.
            </p>
          </div>
        ) : (
          <div className="space-y-8 mt-4">
            {groups.map(group => (
              <section key={group.key} id={`group-${group.key}`} style={{ scrollMarginTop: '90px' }}>
                <h3 className={`text-lg font-black mb-3 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {group.label}
                </h3>
                <div
                  className={`flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 ${scrollbarClass(isDark)}`}
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {group.products.map(product => {
                    const key = product._id || String(product.id || '');
                    return (
                      <div key={key} className="shrink-0 w-40">
                        <ProductCard product={product} />
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <CartSidebar />
      <MiniCartBar />
      <BillModal />
      <Toast />
      <div className={`fixed bottom-0 left-0 w-full h-1 z-50 ${isDark ? 'bg-indigo-500' : 'bg-yellow-400'}`} />
    </main>
  );
}
