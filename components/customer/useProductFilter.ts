'use client';

import { create } from 'zustand';

interface FilterState {
  activeCategory: string;
  activeSubCategory: string;
  activeBrand: string;
  sort: string;
  priceRange: string;
  search: string;
  setActiveCategory: (c: string) => void;
  setActiveSubCategory: (c: string) => void;
  setActiveBrand: (b: string) => void;
  setSort: (s: string) => void;
  setPriceRange: (p: string) => void;
  setSearch: (s: string) => void;
}

// Lightweight zustand store — no provider needed
export const useProductFilter = create<FilterState>(set => ({
  activeCategory: 'all',
  activeSubCategory: 'all',
  activeBrand: 'all',
  sort: 'default',
  priceRange: '',
  search: '',
  setActiveCategory: c => set({ activeCategory: c, activeSubCategory: 'all' }),
  setActiveSubCategory: c => set({ activeSubCategory: c }),
  setActiveBrand: b => set({ activeBrand: b }),
  setSort: s => set({ sort: s }),
  setPriceRange: p => set({ priceRange: p }),
  setSearch: s => set({ search: s }),
}));
