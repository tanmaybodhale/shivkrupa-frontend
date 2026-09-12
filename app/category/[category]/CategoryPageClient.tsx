'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { useTheme } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/customer/ProductCard';
import CartSidebar from '@/components/customer/CartSidebar';
import MiniCartBar from '@/components/customer/MiniCartBar';
import BillModal from '@/components/shared/BillModal';
import Toast from '@/components/shared/Toast';
import { ArrowLeft } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface SubGroup {
  label: string;
  key: string;
  products: Product[];
}

export default function CategoryPageClient() {
  const params = useParams();
  const router = useRouter();
  const category = decodeURIComponent(params.category as string);

  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<SubGroup[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!category) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/catalog`);
        const data = await res.json();
        if (!data.success || !data.products) { setLoading(false); return; }

        const products: Product[] = data.products.filter(
          (p: Product) => (p.category || '').trim().toLowerCase() === category.toLowerCase()
        );

        const bySub: Record<string, Product[]> = {};
        const noSub: Product[] = [];

        products.forEach(p => {
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

        setGroups(built);
      } catch (error) {
        console.error('Failed to load category page:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [category]);

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

        <h1 className={`text-2xl sm:text-3xl font-black mb-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          {displayName}
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className={`w-10 h-10 rounded-full border-4 border-t-transparent animate-spin ${isDark ? 'border-indigo-500' : 'border-orange-400'}`} />
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className={`text-sm font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              No products found in this category yet.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map(group => (
              <section key={group.key}>
                <h3 className={`text-lg font-black mb-3 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {group.label}
                </h3>
                <div
                  className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
