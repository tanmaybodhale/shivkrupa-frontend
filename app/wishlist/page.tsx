'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { Product } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Toast from '@/components/shared/Toast';
import CartSidebar from '@/components/customer/CartSidebar';
import BillModal from '@/components/shared/BillModal';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Share2 } from 'lucide-react';
import { Plus, Minus } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function WishlistPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { wishlist, toggleWishlist, addToCart, changeQty, cart, showToast, currentUser } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Fetch full product data for each wishlist ID
  useEffect(() => {
    if (!mounted) return;
    const fetchWishlistProducts = async () => {
      if (wishlist.length === 0) { setProducts([]); setLoading(false); return; }
      setLoading(true);
      try {
        const results = await Promise.all(
          wishlist.map(id =>
            fetch(`${API_URL}/catalog/${id}`)
              .then(r => r.json())
              .then(d => d.success ? d.product : null)
              .catch(() => null)
          )
        );
        setProducts(results.filter(Boolean) as Product[]);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistProducts();
  }, [wishlist, mounted]);

  const handleShare = async (product: Product) => {
    const pid = product._id || String(product.id || '');
    const url = `${window.location.origin}/product/${pid}`;
    if (navigator.share) {
      try { await navigator.share({ title: product.name, text: `Check out ${product.name} for ₹${product.price}!`, url }); }
      catch { navigator.clipboard.writeText(url).then(() => showToast('🔗 Link copied!')); }
    } else {
      navigator.clipboard.writeText(url).then(() => showToast('🔗 Link copied!'));
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    showToast(`✅ ${product.name.split(' ')[0]} added to cart!`);
  };

  if (!mounted) return null;

  return (
    <main className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0f0d1a]' : 'bg-[#fffbf5]'}`}>
      <Navbar />

      <div className="max-w-screen-lg mx-auto px-4 py-6 pb-32">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-xl border transition-colors ${isDark ? 'border-[#2d2450] text-gray-400 hover:text-indigo-300 hover:bg-indigo-500/10' : 'border-orange-100 text-gray-500 hover:text-orange-500 hover:bg-orange-50'}`}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className={`text-2xl font-black flex items-center gap-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              <Heart size={22} className="text-red-500" fill="currentColor" />
              My Wishlist
            </h1>
            <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              {wishlist.length} saved {wishlist.length === 1 ? 'item' : 'items'}
              {!currentUser && <span className="ml-2 text-amber-500">· Sign in to sync across devices</span>}
            </p>
          </div>
        </div>

        {/* Empty state */}
        {!loading && wishlist.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-[#1a1535]' : 'bg-red-50'}`}>
              <Heart size={40} className={isDark ? 'text-gray-700' : 'text-red-200'} />
            </div>
            <h2 className={`text-xl font-black mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Your wishlist is empty</h2>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              Tap the ❤ heart icon on any product to save it here
            </p>
            <button
              onClick={() => router.push('/customer')}
              className={`px-6 py-3 rounded-xl font-bold text-sm ${isDark ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-orange-500 text-white hover:bg-orange-400'}`}
            >
              Browse Products
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: Math.max(wishlist.length, 4) }).map((_, i) => (
              <div key={i} className={`rounded-2xl border animate-pulse h-64 ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-orange-50 border-orange-100'}`} />
            ))}
          </div>
        )}

        {/* Product grid */}
        {!loading && products.length > 0 && (
          <>
            {/* Quick actions */}
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={async () => {
                  for (const p of products) {
                    if (p.inStock) addToCart(p);
                  }
                  showToast(`🛒 Added all in-stock items to cart!`);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border transition-colors ${isDark ? 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500' : 'bg-orange-500 text-white border-orange-400 hover:bg-orange-400'}`}
              >
                <ShoppingBag size={15} />
                Add All to Cart
              </button>
              <button
                onClick={async () => {
                  for (const p of products) {
                    const pid = p._id || String(p.id || '');
                    await toggleWishlist(pid);
                  }
                  showToast('🗑️ Wishlist cleared');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border transition-colors ${isDark ? 'border-[#2d2450] text-gray-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10' : 'border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50'}`}
              >
                <Trash2 size={15} />
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(product => {
                const pid = product._id || String(product.id || '');
                const cartItemId = pid;
                const cartEntry = cart.find(c => (c._id || String(c.id)) === cartItemId);
                const inCart = !!cartEntry;
                const isOutOfStock = !product.inStock;
                const discountPct = product.mrp > product.price
                  ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
                const hasImage = product.image && product.image.startsWith('http');

                return (
                  <div
                    key={pid}
                    className={`group relative flex flex-col rounded-2xl border overflow-hidden transition-all hover:shadow-lg cursor-pointer ${isDark ? 'bg-[#1a1535] border-[#2d2450] hover:border-indigo-500/40' : 'bg-white border-orange-100 hover:border-orange-300'}`}
                    onClick={() => router.push(`/product/${pid}`)}
                  >
                    {/* Discount badge */}
                    {discountPct > 0 && (
                      <div className="absolute top-0 left-0 bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-br-xl z-10">
                        {discountPct}% OFF
                      </div>
                    )}

                    {/* Remove from wishlist */}
                    <button
                      onClick={async (e) => { e.stopPropagation(); await toggleWishlist(pid); showToast('💔 Removed from wishlist'); }}
                      className={`absolute top-1.5 right-1.5 z-10 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 ${isDark ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30' : 'bg-red-50 border border-red-200 text-red-500 hover:bg-red-100'}`}
                    >
                      <Heart size={13} fill="currentColor" />
                    </button>

                    {/* Image */}
                    <div
                      className={`w-full flex items-center justify-center text-5xl ${isDark ? 'bg-gradient-to-br from-[#131028] to-[#1a1535]' : 'bg-gradient-to-br from-[#fdf6e3] to-[#fff8e7]'}`}
                      style={{ height: 160 }}
                    >
                      {hasImage
                        ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        : (product.emoji || '📦')
                      }
                    </div>

                    {/* Info */}
                    <div className="p-3 flex flex-col flex-1">
                      <h3 className={`text-[12px] font-bold line-clamp-2 leading-snug mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {product.name}
                      </h3>
                      <p className={`text-[10px] capitalize mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                        {product.category}
                      </p>

                      <div className="mt-auto flex items-center justify-between gap-1.5">
                        {/* Price */}
                        <div>
                          {discountPct > 0 && (
                            <p className={`text-[9px] line-through leading-none ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>₹{product.mrp}</p>
                          )}
                          <p className={`text-[14px] font-black leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{product.price}</p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          {/* Share */}
                          <button
                            onClick={() => handleShare(product)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all active:scale-90 ${isDark ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400' : 'bg-orange-50 border-orange-200 text-orange-500'}`}
                          >
                            <Share2 size={11} />
                          </button>

                          {/* Cart */}
                          {isOutOfStock ? (
                            <span className={`text-[9px] font-bold px-2 py-1 rounded-lg ${isDark ? 'text-gray-600 bg-[#13102a] border border-[#2d2450]' : 'text-gray-400 bg-gray-100 border border-gray-200'}`}>OOS</span>
                          ) : inCart && cartEntry ? (
                            <div className={`flex items-center rounded-lg overflow-hidden text-white ${isDark ? 'bg-indigo-600' : 'bg-orange-500'}`}>
                              <button onClick={() => changeQty(cartItemId, -1)} className="px-1.5 py-1 hover:bg-black/10 active:scale-95"><Minus size={10} strokeWidth={3} /></button>
                              <span className="px-1 text-[10px] font-black">{cartEntry.qty}</span>
                              <button onClick={() => changeQty(cartItemId, 1)} className="px-1.5 py-1 hover:bg-black/10 active:scale-95"><Plus size={10} strokeWidth={3} /></button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(product)}
                              className={`h-7 px-2.5 rounded-lg text-[11px] font-black border transition-all active:scale-95 ${isDark ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20' : 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100'}`}
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <CartSidebar />
      <BillModal />
      <Toast />
      <div className={`fixed bottom-0 left-0 w-full h-1 z-50 ${isDark ? 'bg-indigo-500' : 'bg-yellow-400'}`} />
    </main>
  );
}
