'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Product } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LanguageContext';
import { X, Plus, Minus, ZoomIn, ZoomOut, RotateCcw, ShoppingBag } from 'lucide-react';

interface Props {
    product: Product;
    onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: Props) {
    const { cart, addToCart, changeQty, showToast } = useApp();
    const { isDark } = useTheme();
    const { t } = useLang();

    // ── Logic Helpers ──
    const cartItemId = product._id || String(product.id || '');
    const cartItem = cart.find(c => (c._id || String(c.id)) === cartItemId);
    const inCart = !!cartItem;
    const isUnlimited = product.quantity === undefined || product.quantity === null;
    const isOutOfStock = !product.inStock || (!isUnlimited && (product.quantity || 0) <= 0);
    const isLowStock = !isUnlimited && (product.quantity || 0) <= 3 && (product.quantity || 0) > 0;
    const discountPct = product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    // ── Zoom/Pan State ──
    const [scale, setScale] = useState(1);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const dragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const posRef = useRef({ x: 0, y: 0 });

    const resetZoom = () => { setScale(1); setPos({ x: 0, y: 0 }); posRef.current = { x: 0, y: 0 }; };
    const zoom = (delta: number) => setScale(s => Math.min(4, Math.max(1, parseFloat((s + delta).toFixed(1)))));

    // ── Handlers ──
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) { // Prevent accidental zoom while scrolling
            e.preventDefault();
            zoom(e.deltaY < 0 ? 0.2 : -0.2);
        }
    };

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

    // ── Lifecycle (FIXED SYNTAX HERE) ──
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    useEffect(() => {
        if (scale === 1) { setPos({ x: 0, y: 0 }); posRef.current = { x: 0, y: 0 }; }
    }, [scale]);

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div
                className={`relative z-10 w-full max-w-lg overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 rounded-t-[2rem] sm:rounded-3xl ${isDark ? 'bg-[#12141c] border border-white/5' : 'bg-white border border-gray-100'
                    }`}
                style={{ maxHeight: '92dvh' }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/10 hover:bg-black/20 backdrop-blur-md transition-colors"
                >
                    <X size={20} className={isDark ? 'text-white' : 'text-gray-800'} />
                </button>

                <div className="overflow-y-auto" style={{ maxHeight: '92dvh' }}>
                    {/* Image Section */}
                    <div
                        className={`relative h-72 sm:h-80 flex items-center justify-center overflow-hidden ${isDark ? 'bg-gradient-to-b from-[#1a1d29] to-[#12141c]' : 'bg-gray-50'
                            }`}
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                    >
                        <div
                            className="transition-transform duration-150 ease-out flex items-center justify-center"
                            style={{ transform: `scale(${scale}) translate(${pos.x / scale}px, ${pos.y / scale}px)` }}
                        >
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-contain p-6" draggable={false} />
                            ) : (
                                <span className="text-8xl">{product.emoji || '📦'}</span>
                            )}
                        </div>

                        {/* Badges */}
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
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
                        </div>

                        {/* Zoom Controls */}
                        <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/20 backdrop-blur-md p-1 rounded-xl">
                            <button onClick={() => zoom(-0.2)} disabled={scale <= 1} className="p-1.5 text-white disabled:opacity-30"><ZoomOut size={16} /></button>
                            <button onClick={resetZoom} className="p-1.5 text-white hover:text-blue-400 transition-colors"><RotateCcw size={14} /></button>
                            <button onClick={() => zoom(0.2)} disabled={scale >= 4} className="p-1.5 text-white disabled:opacity-30"><ZoomIn size={16} /></button>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="p-6 sm:p-8">
                        <div className="flex justify-between items-start gap-4 mb-2">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500 mb-1">
                                    {product.cat || product.category} {product.weight && `• ${product.weight}`}
                                </p>
                                <h2 className={`text-2xl font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {product.name}
                                </h2>
                            </div>
                        </div>

                        {product.description && (
                            <p className={`text-sm mt-3 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {product.description}
                            </p>
                        )}

                        <div className={`my-6 h-px ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />

                        <div className="flex items-end justify-between mb-8">
                            <div>
                                {discountPct > 0 && (
                                    <p className="text-xs text-gray-500 line-through mb-1">MRP ₹{product.mrp}</p>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{product.price}</span>
                                    {discountPct > 0 && <span className="text-xs font-bold text-emerald-500">{discountPct}% savings</span>}
                                </div>
                            </div>

                            <div className="text-right">
                                {isOutOfStock ? (
                                    <span className="text-[10px] font-bold text-red-500 uppercase border border-red-500/20 px-2 py-1 rounded">Out of Stock</span>
                                ) : (
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase border border-emerald-500/20 px-2 py-1 rounded">In Stock</span>
                                )}
                            </div>
                        </div>

                        {/* Action Area */}
                        <div className="mt-auto">
                            {isOutOfStock ? (
                                <button disabled className="w-full py-4 rounded-2xl bg-gray-200 text-gray-400 font-bold cursor-not-allowed">
                                    Currently Unavailable
                                </button>
                            ) : inCart && cartItem ? (
                                <div className="flex items-center justify-between bg-blue-600 rounded-2xl p-1 shadow-xl shadow-blue-500/20">
                                    <button onClick={() => changeQty(cartItemId, -1)} className="p-3.5 text-white hover:bg-white/10 rounded-xl transition-colors">
                                        <Minus size={20} strokeWidth={3} />
                                    </button>
                                    <span className="text-white font-bold text-xl">{cartItem.qty}</span>
                                    <button onClick={() => changeQty(cartItemId, 1)} className="p-3.5 text-white hover:bg-white/10 rounded-xl transition-colors">
                                        <Plus size={20} strokeWidth={3} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        addToCart(product);
                                        showToast(`Added ${product.name.split(' ')[0]} to cart!`);
                                    }}
                                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25"
                                >
                                    <ShoppingBag size={18} />
                                    Add to Cart
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}