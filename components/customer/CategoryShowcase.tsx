'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { Product } from '@/lib/types';
import { ChevronRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Thumb {
  label: string;
  image?: string;
  emoji?: string;
}

interface CategoryCard {
  category: string;
  thumbs: Thumb[];
}

export default function CategoryShowcase() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [cards, setCards] = useState<CategoryCard[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/catalog`);
        const data = await res.json();
        if (!data.success || !data.products) return;

        const products: Product[] = data.products;
        const byCategory: Record<string, Product[]> = {};
        products.forEach(p => {
          const cat = (p.category || '').trim().toLowerCase();
          if (!cat) return;
          if (!byCategory[cat]) byCategory[cat] = [];
          byCategory[cat].push(p);
        });

        const built: CategoryCard[] = Object.entries(byCategory).map(([cat, items]) => {
          // Group by sub-category, keep first product's image as thumbnail
          const bySub: Record<string, Product> = {};
          items.forEach(p => {
            const sub = (p.subCategory || '').trim().toLowerCase();
            if (sub && !bySub[sub]) bySub[sub] = p;
          });

          let thumbs: Thumb[] = Object.entries(bySub)
            .slice(0, 4)
            .map(([sub, product]) => ({
              label: sub.charAt(0).toUpperCase() + sub.slice(1),
              image: product.image,
              emoji: product.emoji,
            }));

          // Fallback: no sub-categories — show top 4 products instead
          if (thumbs.length === 0) {
            thumbs = items.slice(0, 4).map(p => ({
              label: p.name.split(' ').slice(0, 2).join(' '),
              image: p.image,
              emoji: p.emoji,
            }));
          }

          return { category: cat, thumbs };
        });

        setCards(built.filter(c => c.thumbs.length > 0));
      } catch (error) {
        console.error('Failed to load category showcase:', error);
      }
    };
    fetchData();
  }, []);

  if (cards.length === 0) return null;

  return (
       <div
      className={`flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full ${
        isDark ? '[&::-webkit-scrollbar-thumb]:bg-[#2d2450]' : '[&::-webkit-scrollbar-thumb]:bg-orange-200'
      }`}
      style={{ scrollbarWidth: 'thin' }}
    >
      {cards.map(card => {
        const label = card.category.charAt(0).toUpperCase() + card.category.slice(1);
        return (
          <div
            key={card.category}
            className={`shrink-0 w-64 rounded-2xl border p-4 ${
              isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'
            }`}
          >
            <button
              onClick={() => router.push(`/category/${card.category}`)}
              className="flex items-center justify-between w-full mb-3 text-left"
            >
              <h4 className={`text-sm font-black leading-tight pr-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {label}
              </h4>
              <ChevronRight size={18} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
            </button>

            <div className="grid grid-cols-2 gap-2">
              {card.thumbs.map((thumb, idx) => {
                const hasImage = thumb.image && thumb.image.startsWith('http');
                return (
                  <button
                    key={idx}
                    onClick={() => router.push(`/category/${card.category}`)}
                    className="flex flex-col gap-1 text-left"
                  >
                    <div
                      className={`w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center ${
                        isDark ? 'bg-[#13102a]' : 'bg-orange-50'
                      }`}
                    >
                      {hasImage ? (
                        <img src={thumb.image} alt={thumb.label} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <span className="text-2xl">{thumb.emoji || '📦'}</span>
                      )}
                    </div>
                    <span className={`text-[11px] font-semibold leading-tight truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {thumb.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
