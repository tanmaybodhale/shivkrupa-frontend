const fs = require('fs');

const originalReturn = `    return (
        <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
            aria-modal="true"
            role="dialog"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div
                className={\`relative z-10 w-full sm:max-w-lg sm:mx-4 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-slide-up sm:animate-fade-in \${isDark
                    ? 'bg-[#1a1535] border border-[#2d2450]'
                    : 'bg-white border border-orange-100'}\`}
                style={{ maxHeight: '92dvh' }}
            >
                {/* ─── Close Button ─── */}
                <button
                    onClick={onClose}
                    className={\`absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-colors \${isDark
                        ? 'bg-[#13102a] text-gray-400 hover:text-white'
                        : 'bg-orange-50 text-gray-500 hover:text-gray-800'}\`}
                >
                    <X size={18} strokeWidth={2.5} />
                </button>

                <div className="overflow-y-auto" style={{ maxHeight: '92dvh' }}>

                    {/* ─── Image Viewer ─── */}
                    <div
                        ref={imgContainerRef}
                        className="relative overflow-hidden select-none"
                        style={{
                            height: 280,
                            background: isDark
                                ? 'linear-gradient(135deg, #13102a, #1a1535)'
                                : 'linear-gradient(135deg, #fdf6e3, #fff8e7)',
                            cursor: scale > 1 ? 'grab' : 'default',
                        }}
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* Corner badges */}
                        {discountPct > 0 && (
                            <div className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] font-black tracking-wide px-2 py-1 rounded-br-xl z-10 shadow-sm">
                                {discountPct}% OFF
                            </div>
                        )}

                        {/* Image or emoji */}
                        <div
                            className="absolute inset-0 flex items-center justify-center transition-transform duration-150"
                            style={{ transform: \`scale(\${scale}) translate(\${pos.x / scale}px, \${pos.y / scale}px)\` }}
                        >
                            {hasImage ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    draggable={false}
                                    className="w-full h-full object-contain pointer-events-none"
                                />
                            ) : (
                                <span className="text-8xl pointer-events-none">{displayEmoji}</span>
                            )}
                        </div>

                        {/* Zoom controls */}
                        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
                            {scale > 1 && (
                                <button
                                    onClick={resetZoom}
                                    className={\`w-8 h-8 rounded-full flex items-center justify-center shadow-md text-xs font-bold transition-colors \${isDark
                                        ? 'bg-[#13102a]/90 text-gray-300 hover:text-white border border-[#2d2450]'
                                        : 'bg-white/90 text-gray-600 hover:text-gray-900 border border-orange-100'}\`}
                                    title="Reset zoom"
                                >
                                    <RotateCcw size={12} />
                                </button>
                            )}
                            <button
                                onClick={() => zoom(-0.3)}
                                disabled={scale <= 1}
                                className={\`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-30 \${isDark
                                    ? 'bg-[#13102a]/90 text-gray-300 hover:text-white border border-[#2d2450]'
                                    : 'bg-white/90 text-gray-600 hover:text-gray-900 border border-orange-100'}\`}
                            >
                                <ZoomOut size={14} />
                            </button>
                            <button
                                onClick={() => zoom(0.3)}
                                disabled={scale >= 4}
                                className={\`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-30 \${isDark
                                    ? 'bg-[#13102a]/90 text-gray-300 hover:text-white border border-[#2d2450]'
                                    : 'bg-white/90 text-gray-600 hover:text-gray-900 border border-orange-100'}\`}
                            >
                                <ZoomIn size={14} />
                            </button>
                            <span className={\`text-[10px] font-bold px-1.5 \${isDark ? 'text-gray-500' : 'text-gray-400'}\`}>
                                {Math.round(scale * 100)}%
                            </span>
                        </div>

                        {/* Scroll hint when zoomed */}
                        {scale === 1 && hasImage && (
                            <div className={\`absolute bottom-3 left-3 text-[10px] font-semibold px-2 py-1 rounded-md \${isDark ? 'text-gray-600' : 'text-gray-400'}\`}>
                                Scroll to zoom
                            </div>
                        )}
                    </div>

                    {/* ─── Product Info ─── */}
                    <div className="p-5 pb-6 flex flex-col gap-3">

                        {/* Name + badges */}
                        <div className="flex items-start justify-between gap-3">
                            <h2 className={\`text-xl font-black leading-snug flex-1 \${isDark ? 'text-gray-100' : 'text-gray-900'}\`}>
                                {product.name}
                            </h2>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                {product.isNew && (
                                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500 text-white">NEW</span>
                                )}
                                {product.tag && product.tag !== 'new' && (
                                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500 text-white">{product.tag.toUpperCase()}</span>
                                )}
                            </div>
                        </div>

                        {/* Category + weight */}
                        <p className={\`text-sm font-semibold capitalize \${isDark ? 'text-gray-500' : 'text-gray-500'}\`}>
                            {category}{product.weight ? \` · \${product.weight}\` : ''}{product.unit ? \` · \${product.unit}\` : ''}
                        </p>

                        {/* Description */}
                        {product.description && (
                            <p className={\`text-sm leading-relaxed \${isDark ? 'text-gray-400' : 'text-gray-600'}\`}>
                                {product.description}
                            </p>
                        )}

                        {/* Divider */}
                        <div className={\`h-px \${isDark ? 'bg-[#2d2450]' : 'bg-orange-100'}\`} />

                        {/* Price row */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col">
                                {discountPct > 0 && (
                                    <span className={\`text-xs line-through font-medium \${isDark ? 'text-gray-600' : 'text-gray-400'}\`}>MRP ₹{product.mrp}</span>
                                )}
                                <div className="flex items-baseline gap-2">
                                    <span className={\`text-3xl font-black \${isDark ? 'text-gray-100' : 'text-gray-900'}\`}>₹{product.price}</span>
                                    {discountPct > 0 && (
                                        <span className="text-sm font-bold text-blue-500">{discountPct}% off</span>
                                    )}
                                </div>
                            </div>

                            {/* Stock badge */}
                            <div>
                                {isOutOfStock ? (
                                    <span className={\`text-xs font-bold px-3 py-1.5 rounded-lg border \${isDark ? 'bg-[#13102a] text-gray-600 border-[#2d2450]' : 'bg-gray-100 text-gray-400 border-gray-200'}\`}>
                                        Out of Stock
                                    </span>
                                ) : isLowStock ? (
                                    <span className="text-xs font-bold text-red-500">
                                        Only {product.quantity} left!
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-emerald-500">In Stock ✓</span>
                                )}
                            </div>
                        </div>

                        {/* ─── Add to Cart ─── */}
                        <div className="mt-1">
                            {isOutOfStock ? (
                                <button disabled className={\`w-full py-3.5 rounded-xl text-sm font-bold cursor-not-allowed border \${isDark ? 'bg-[#13102a] text-gray-600 border-[#2d2450]' : 'bg-gray-100 text-gray-400 border-gray-200'}\`}>
                                    Out of Stock
                                </button>
                            ) : inCart && cartItem ? (
                                <div className={\`flex items-center justify-between rounded-xl overflow-hidden shadow-sm \${isDark ? 'bg-indigo-600' : 'bg-orange-500'}\`}>
                                    <button
                                        onClick={handleDecrease}
                                        className="flex-1 py-3.5 flex items-center justify-center text-white hover:bg-black/10 transition-colors text-lg font-black"
                                    >
                                        <Minus size={18} strokeWidth={3} />
                                    </button>
                                    <span className="text-white font-black text-lg w-12 text-center">{cartItem.qty}</span>
                                    <button
                                        onClick={handleIncrease}
                                        className="flex-1 py-3.5 flex items-center justify-center text-white hover:bg-black/10 transition-colors text-lg font-black"
                                    >
                                        <Plus size={18} strokeWidth={3} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleAdd}
                                    className={\`w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-wide border transition-all active:scale-[0.98] \${isDark
                                        ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20'
                                        : 'text-white bg-orange-500 border-transparent hover:bg-orange-600 shadow-[0_4px_12px_rgba(234,88,12,0.25)]'}\`}
                                >
                                    {t('add')} to Cart
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );`;

let content = fs.readFileSync('d:/Code_Here/shivkarupa/shivkrupa-frontend/components/customer/ProductDetailModal.tsx', 'utf8');

const prefix = content.split('    return (')[0];
fs.writeFileSync('d:/Code_Here/shivkarupa/shivkrupa-frontend/components/customer/ProductDetailModal.tsx', prefix + originalReturn + '\n}\n');
console.log('Reverted');
