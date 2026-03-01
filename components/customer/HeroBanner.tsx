'use client';

import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl mt-4 mb-8 p-8 sm:p-12 border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10 shadow-sm">
      
      {/* 1. Traditional Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/Traditional.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'right center', // Focuses the image on the right side
        }}
      />
      
      {/* 2. The Fix: Adjusted Gradient Overlay */}
      {/* Changed the left side to /95 (95% opacity) instead of solid. 
        This lets the texture faintly bleed through on the left while keeping text 100% readable!
      */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#fffbf5]/90 via-[#fffbf5]/80 to-[#fffbf5]/10" />
      
      {/* 3. Sharp Accent Line at the top */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-yellow-400 z-10" />

      {/* Left Content: Text */}
      <div className="relative z-10 flex-1 max-w-xl">
        {/* Crisp Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-orange-200 text-orange-600 text-[10px] font-bold uppercase tracking-[0.15em] mb-6 shadow-sm">
          <Sparkles size={12} strokeWidth={2.5} />
          Pune's Favourite Store
        </div>

        {/* High Contrast Typography - Deep rich brown */}
        <h2 className="text-[#3b2110] font-display font-extrabold text-4xl sm:text-[3.25rem] tracking-tight leading-[1.05] drop-shadow-sm">
          Everything You Need,
          <br />
          <span className="text-orange-600">One Place.</span>
        </h2>

        <p className="text-[#5a3622] font-semibold text-sm sm:text-base leading-relaxed mt-5 max-w-md">
          Stationery, snacks, gifts, jewellery, cutlery & more — delivered
          instantly or pick up. Shop fresh, shop local.
        </p>

        {/* Sharp Action Button */}
        <button
          onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
          className="mt-8 flex items-center gap-2 px-6 py-3 rounded-md text-sm font-bold text-white bg-orange-500 border border-transparent hover:bg-orange-600 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(249,115,22,0.25)] active:translate-y-0 active:shadow-none"
        >
          Start Shopping
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Right Content: Brutalist "Hard Shadow" Ticket */}
      <div className="relative z-10 hidden sm:flex shrink-0">
        <div className="bg-[#fffbf5] rounded-xl p-8 text-center border-2 border-orange-300 transform hover:-translate-y-1 transition-transform duration-300 shadow-[8px_8px_0px_0px_#fb923c] w-64">
          {/* Floating Icon Box */}
          <div className="mx-auto w-12 h-12 bg-orange-100/50 rounded-lg border border-orange-200 flex items-center justify-center mb-5">
            <span className="text-2xl drop-shadow-sm">🛵</span>
          </div>

          <p className="text-[#3b2110] font-black text-[10px] tracking-[0.2em] uppercase leading-tight mb-2">
            Free Delivery
            <br />
            Above
          </p>

          <div className="font-display font-black leading-none text-orange-500 text-[3.5rem] mb-4 tracking-tight">
            ₹99
          </div>

          {/* Limited Time Badge */}
          <div className="inline-block bg-white text-orange-600 border border-orange-200 text-[9px] font-bold px-3 py-1.5 rounded-md uppercase tracking-[0.1em] shadow-sm">
            Limited Time
          </div>
        </div>
      </div>
    </div>
  );
}