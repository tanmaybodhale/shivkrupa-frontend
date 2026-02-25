export default function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] mt-4 mb-8 p-8 sm:p-12 shadow-sm border border-orange-100/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 bg-gray-900">
      
      {/* 1. Background Image - Now clearly visible! */}
      <div
        className="absolute inset-0 z-0 opacity-50 transition-transform duration-1000 hover:scale-105"
        style={{
          background: 'url(https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&q=80) center/cover no-repeat',
        }}
      />
      
      {/* 2. Dark Gradient Overlay - Fades from left to right so text is readable */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/90 via-black/60 to-orange-900/40" />

      {/* 3. Subtle Orange Glow - Just enough to keep the theme alive */}
      <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-orange-600/40 blur-[80px] rounded-full pointer-events-none z-0" />

      {/* Left Content: Text */}
      <div className="relative z-10 flex-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-orange-300 text-[10px] font-black uppercase tracking-[0.15em] mb-5 shadow-sm">
          <span>🌟</span> Pune's Favourite Store
        </div>
        
        <h2 className="text-white font-black text-4xl sm:text-5xl tracking-tight leading-[1.1] drop-shadow-md">
          Everything You Need,
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
            One Place.
          </span>
        </h2>
        
        <p className="text-gray-300 font-medium text-sm sm:text-base leading-relaxed max-w-md mt-4 drop-shadow-sm">
          Stationery, snacks, gifts, jewellery, cutlery & more — delivered instantly or pick up. Shop fresh, shop local.
        </p>
      </div>

      {/* Right Content: Free Delivery Badge */}
      <div className="relative z-10 hidden sm:flex shrink-0">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 text-center shadow-2xl shadow-orange-900/50 transform rotate-3 hover:rotate-0 transition-transform duration-300 border-[3px] border-orange-100">
          <p className="text-gray-500 font-black text-[10px] tracking-[0.2em] uppercase leading-tight mb-1">
            Free Delivery
            <br />
            Above
          </p>
          <div className="font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-yellow-500 text-[2.75rem]">
            ₹99
          </div>
          <div className="mt-2 inline-block bg-orange-50 text-orange-600 border border-orange-200 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
            Limited Time
          </div>
        </div>
      </div>
    </div>
  );
}