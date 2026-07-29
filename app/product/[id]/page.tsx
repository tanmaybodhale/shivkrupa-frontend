'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';
import Toast from '@/components/shared/Toast';
import CartSidebar from '@/components/customer/CartSidebar';
import BillModal from '@/components/shared/BillModal';
import {
  ArrowLeft, Share2, ShoppingBag, Plus, Minus,
  ZoomIn, ZoomOut, RotateCcw, Tag, Package,
  CheckCircle, XCircle, AlertTriangle,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { cart, addToCart, changeQty, showToast } = useApp();
  const { isDark } = useTheme();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Zoom / pan
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!id) return;
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_URL}/catalog/${id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.product);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [id]);

  const resetZoom = () => { setScale(1); setPos({ x: 0, y: 0 }); posRef.current = { x: 0, y: 0 }; };
  const zoom = (delta: number) => setScale(s => Math.min(4, Math.max(1, parseFloat((s + delta).toFixed(1)))));

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale === 1) return;
    dragging.current = true;
    dragStart.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y };
  };
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    const nx = e.clientX - dragStart.current.x;
    const ny = e.clientY - dragStart.current.y;
    posRef.current = { x: nx, y: ny };
    setPos({ x: nx, y: ny });
  }, []);
  const handleMouseUp = useCallback(() => { dragging.current = false; }, []);
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [handleMouseMove, handleMouseUp]);
  useEffect(() => { if (scale === 1) { setPos({ x: 0, y: 0 }); posRef.current = { x: 0, y: 0 }; } }, [scale]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Check out ${product?.name} for ₹${product?.price} at Shivkrupa Store!`,
          url,
        });
      } catch { copyLink(url); }
    } else { copyLink(url); }
  };
  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => showToast('🔗 Link copied!')).catch(() => showToast('🔗 ' + url));
  };

  if (!mounted) return null;

  /* ── Loading ── */
  if (loading) {
    return (
      <main className={`min-h-screen ${isDark ? 'bg-[#0f0d1a]' : 'bg-[#fffbf5]'}`}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
          <div className={`w-12 h-12 rounded-full border-4 border-t-transparent animate-spin ${isDark ? 'border-indigo-500' : 'border-orange-400'}`} />
          <p className={`text-sm font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Loading product…</p>
        </div>
      </main>
    );
  }

  /* ── Not found ── */
  if (notFound || !product) {
    return (
      <main className={`min-h-screen ${isDark ? 'bg-[#0f0d1a]' : 'bg-[#fffbf5]'}`}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 px-6 text-center">
          <span className="text-7xl">🔍</span>
          <h1 className={`text-2xl font-black ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Product Not Found</h1>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>This product may have been removed or the link is invalid.</p>
          <button
            onClick={() => router.push('/customer')}
            className={`mt-2 px-6 py-3 rounded-xl font-bold text-sm ${isDark ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-orange-500 text-white hover:bg-orange-400'}`}
          >
            ← Browse all products
          </button>
        </div>
      </main>
    );
  }

  /* ── Helpers ── */
  const cartItemId = product._id || String(product.id || '');
  const cartItem = cart.find(c => (c._id || String(c.id)) === cartItemId);
  const inCart = !!cartItem;
  const isUnlimited = product.quantity === undefined || product.quantity === null;
  const isOutOfStock = !product.inStock || (!isUnlimited && (product.quantity || 0) <= 0);
  const isLowStock = !isUnlimited && (product.quantity || 0) <= 3 && (product.quantity || 0) > 0;
  const discountPct = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;
  const hasImage = product.image && product.image.startsWith('http');
  // Build gallery: primary + extras
  const gallery = [
    ...(hasImage ? [product.image] : []),
    ...((product.images || []).filter(img => img && img !== product.image)),
  ];
  const displayImage = selectedImage || (gallery[0] || null);

  /* ── Render ── */
  return (
    <main className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0f0d1a]' : 'bg-[#fffbf5]'}`}>
      <Navbar />

      <div className="max-w-screen-lg mx-auto px-4 py-6 pb-32">

        {/* Back + Share header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-colors ${
              isDark
                ? 'text-gray-400 hover:text-indigo-300 hover:bg-indigo-500/10'
                : 'text-amber-800/60 hover:text-orange-600 hover:bg-orange-100'
            }`}
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Back
          </button>
          <button
            onClick={handleShare}
            className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-colors ${
              isDark
                ? 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20'
                : 'text-orange-600 bg-orange-100 hover:bg-orange-200 border border-orange-200'
            }`}
          >
            <Share2 size={15} strokeWidth={2.5} />
            Share
          </button>
        </div>

        {/* Main card */}
        <div className={`rounded-3xl overflow-hidden border shadow-xl ${
          isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'
        }`}>
          <div className="grid md:grid-cols-2">

            {/* ── Image Slider Panel ── */}
            {(() => {
              const currentIdx = gallery.length > 0
                ? Math.max(0, gallery.indexOf(selectedImage || gallery[0]))
                : 0;
              const goTo = (idx: number) => {
                const clamped = Math.max(0, Math.min(gallery.length - 1, idx));
                setSelectedImage(gallery[clamped]);
                resetZoom();
              };

              // Touch swipe state stored via closure refs
              let touchStartX = 0;

              return (
                <div
                  className={`relative overflow-hidden select-none ${
                    isDark ? 'bg-gradient-to-br from-[#131028] to-[#1a1535]' : 'bg-gradient-to-br from-[#fdf6e3] to-[#fff8e7]'
                  }`}
                  style={{ minHeight: 380, height: 380 }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={(e) => { touchStartX = e.touches[0].clientX; }}
                  onTouchEnd={(e) => {
                    const dx = e.changedTouches[0].clientX - touchStartX;
                    if (Math.abs(dx) > 40) goTo(currentIdx + (dx < 0 ? 1 : -1));
                  }}
                >
                  {/* Main image */}
                  <div
                    className="absolute inset-0 flex items-center justify-center transition-transform duration-150 ease-out"
                    style={{ transform: `scale(${scale}) translate(${pos.x / scale}px, ${pos.y / scale}px)` }}
                  >
                    {gallery.length > 0 ? (
                      <img
                        src={selectedImage || gallery[0]}
                        alt={product.name}
                        className="w-full h-full object-contain p-8"
                        style={{ maxHeight: 380 }}
                        draggable={false}
                      />
                    ) : (
                      <span className="text-[9rem] leading-none select-none">{product.emoji || '📦'}</span>
                    )}
                  </div>

                  {/* Prev / Next arrows — only if multiple images */}
                  {gallery.length > 1 && (
                    <>
                      <button
                        onClick={() => goTo(currentIdx - 1)}
                        disabled={currentIdx === 0}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center disabled:opacity-20 hover:bg-black/50 transition-all"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M10 12L6 8l4-4"/></svg>
                      </button>
                      <button
                        onClick={() => goTo(currentIdx + 1)}
                        disabled={currentIdx === gallery.length - 1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center disabled:opacity-20 hover:bg-black/50 transition-all"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 12l4-4-4-4"/></svg>
                      </button>

                      {/* Dot indicators */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                        {gallery.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => goTo(idx)}
                            className={`rounded-full transition-all ${idx === currentIdx ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {discountPct > 0 && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg uppercase">
                        {discountPct}% Off
                      </span>
                    )}
                    {product.isNew && (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg uppercase">
                        New
                      </span>
                    )}
                    {product.hidden && (
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg uppercase">
                        Hidden
                      </span>
                    )}
                  </div>

                  {/* Zoom controls */}
                  <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-black/20 backdrop-blur-md p-1 rounded-xl">
                    <button onClick={() => zoom(-0.2)} disabled={scale <= 1} className="p-1.5 text-white disabled:opacity-30"><ZoomOut size={15} /></button>
                    <button onClick={resetZoom} className="p-1.5 text-white hover:text-blue-300 transition-colors"><RotateCcw size={13} /></button>
                    <button onClick={() => zoom(0.2)} disabled={scale >= 4} className="p-1.5 text-white disabled:opacity-30"><ZoomIn size={15} /></button>
                  </div>
                </div>
              );
            })()}

            {/* ── Info Panel ── */}
            <div className="p-6 sm:p-8 flex flex-col">

              {/* Category breadcrumb */}
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-indigo-400' : 'text-orange-500'}`}>
                {product.category}
                {product.subCategory ? ` › ${product.subCategory}` : ''}
                {product.weight ? ` · ${product.weight}` : ''}
              </p>

              <h1 className={`text-2xl sm:text-3xl font-black leading-tight mb-3 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {product.name}
              </h1>

              {product.brand && (
                <p className={`text-xs font-bold flex items-center gap-1.5 mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Tag size={11} /> {product.brand}
                </p>
              )}

              {product.description && (
                <p className={`text-sm leading-relaxed mb-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {product.description}
                </p>
              )}

              <div className={`h-px my-2 mb-5 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />

              {/* Price */}
              <div className="flex items-end gap-3 mb-6">
                <span className={`text-4xl font-black ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>₹{product.price}</span>
                {discountPct > 0 && (
                  <>
                    <span className={`text-base line-through font-medium ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>₹{product.mrp}</span>
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">{discountPct}% OFF</span>
                  </>
                )}
              </div>

              {/* Stock badge */}
              <div className="flex items-center gap-2 mb-6">
                {isOutOfStock ? (
                  <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${isDark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-500 border border-red-200'}`}>
                    <XCircle size={13} /> Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                    <AlertTriangle size={13} /> Only {product.quantity} left
                  </span>
                ) : (
                  <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                    <CheckCircle size={13} /> In Stock
                  </span>
                )}
                <span className={`flex items-center gap-1.5 text-xs font-medium ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  <Package size={12} /> {product.unit}
                </span>
              </div>

              {/* Action */}
              <div className="mt-auto">
                {isOutOfStock ? (
                  <button disabled className={`w-full py-4 rounded-2xl font-bold text-sm cursor-not-allowed ${isDark ? 'bg-[#1e1a3a] text-gray-600' : 'bg-gray-100 text-gray-400'}`}>
                    Currently Unavailable
                  </button>
                ) : inCart && cartItem ? (
                  <div className={`flex items-center justify-between rounded-2xl p-2 shadow-xl ${isDark ? 'bg-indigo-600 shadow-indigo-900/30' : 'bg-orange-500 shadow-orange-300/30'}`}>
                    <button onClick={() => changeQty(cartItemId, -1)} className="p-3 text-white hover:bg-white/10 rounded-xl transition-colors active:scale-95">
                      <Minus size={20} strokeWidth={3} />
                    </button>
                    <span className="text-white font-black text-xl">{cartItem.qty}</span>
                    <button onClick={() => changeQty(cartItemId, 1)} className="p-3 text-white hover:bg-white/10 rounded-xl transition-colors active:scale-95">
                      <Plus size={20} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { addToCart(product); showToast(`✅ Added to cart!`); }}
                    className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98] hover:-translate-y-0.5 ${
                      isDark
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'
                        : 'bg-orange-500 hover:bg-orange-400 text-white shadow-orange-300/30'
                    }`}
                  >
                    <ShoppingBag size={18} />
                    Add to Cart
                  </button>
                )}

                {/* Share below CTA */}
                <button
                  onClick={handleShare}
                  className={`w-full mt-3 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors border ${
                    isDark
                      ? 'text-gray-400 border-[#2d2450] hover:text-indigo-300 hover:border-indigo-500/30 hover:bg-indigo-500/5'
                      : 'text-gray-400 border-gray-200 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50'
                  }`}
                >
                  <Share2 size={15} />
                  Share this product
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CartSidebar />
      <BillModal />
      <Toast />
      <div className={`fixed bottom-0 left-0 w-full h-1 z-50 ${isDark ? 'bg-indigo-500' : 'bg-yellow-400'}`} />
    </main>
  );
}
