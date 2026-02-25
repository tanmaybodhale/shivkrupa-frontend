'use client';

import { create } from 'zustand';

interface FilterState {
  activeCategory: string;
  sort: string;
  priceRange: string;
  search: string;
  setActiveCategory: (c: string) => void;
  setSort: (s: string) => void;
  setPriceRange: (p: string) => void;
  setSearch: (s: string) => void;
}

// Lightweight zustand store — no provider needed
export const useProductFilter = create<FilterState>(set => ({
  activeCategory: 'all',
  sort: 'default',
  priceRange: '',
  search: '',
  setActiveCategory: c => set({ activeCategory: c }),
  setSort: s => set({ sort: s }),
  setPriceRange: p => set({ priceRange: p }),
  setSearch: s => set({ search: s }),
}));
