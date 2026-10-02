'use client';

import Link from 'next/link';
import { Printer, ArrowRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function XeroxShortcutCard() {
  const { isDark } = useTheme();

  return (
    <Link
      href="/xerox"
      className={`flex items-center gap-4 rounded-3xl border p-4 sm:p-5 transition-all hover:scale-[1.01] ${
        isDark
          ? 'bg-[#1a1535] border-[#2d2450] hover:border-indigo-500/50'
          : 'bg-white border-orange-100 hover:border-orange-300'
      }`}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${
          isDark ? 'from-indigo-600 to-purple-600' : 'from-orange-500 to-yellow-500'
        }`}
      >
        <Printer size={22} className="text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-black text-sm sm:text-base ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          Xerox / Printing Service
        </p>
        <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          Upload photos or documents to print — set copies, crop & page size
        </p>
      </div>

      <ArrowRight size={18} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
    </Link>
  );
}
