'use client';

import { useEffect, useState } from 'react';
import { Layers, Save, Loader2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type PriceMap = Record<string, number>;

/**
 * Admin > Services: set the page threshold and the lower per-page price
 * that applies once an order reaches it. Customers see the new line on the
 * Xerox page and the new rate in their cart straight away.
 *
 * Normal prices are still edited in the existing Xerox pricing editor;
 * this panel only adds the bulk side (threshold + bulk price per row).
 */
export default function XeroxBulkPricingEditor({ showToast }: { showToast: (msg: string) => void }) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [missing, setMissing] = useState(false);
  const [pricing, setPricing] = useState<PriceMap>({});
  const [threshold, setThreshold] = useState('20');
  const [bulk, setBulk] = useState<Record<string, string>>({});

  const applyService = (service: any) => {
    const base: PriceMap = service?.pricing && typeof service.pricing === 'object' ? service.pricing : {};
    const saved: PriceMap = service?.bulkPricing && typeof service.bulkPricing === 'object' ? service.bulkPricing : {};
    setPricing(base);
    setThreshold(String(service?.bulkThreshold ?? 20));
    const next: Record<string, string> = {};
    Object.entries(base).forEach(([label, price]) => {
      if (Number(price) > 0) next[label] = Number(saved[label]) > 0 ? String(saved[label]) : '';
    });
    setBulk(next);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/services/xerox`);
        const data = await res.json();
        if (data.success && data.service) {
          applyService(data.service);
        } else {
          setMissing(true);
        }
      } catch (error) {
        console.error('Failed to load Xerox service:', error);
        setMissing(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rows = Object.entries(pricing).filter(([, price]) => Number(price) > 0);

  const handleSave = async () => {
    const t = Math.floor(Number(threshold));
    if (!Number.isFinite(t) || t < 0) {
      showToast('❌ Enter a valid page threshold (0 or more)');
      return;
    }

    const out: PriceMap = {};
    for (const [label, value] of Object.entries(bulk)) {
      if (value.trim() === '') continue;
      const n = Number(value);
      if (!Number.isFinite(n) || n < 0) {
        showToast(`❌ Invalid bulk price for ${label}`);
        return;
      }
      if (n > 0) out[label] = n;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/services/xerox`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulkThreshold: t, bulkPricing: out }),
      });
      const data = await res.json();
      if (data.success) {
        applyService(data.service);
        showToast('✅ Bulk pricing saved!');
      } else {
        showToast(`❌ ${data.message || 'Failed to save bulk pricing'}`);
      }
    } catch (error) {
      console.error('Save bulk pricing error:', error);
      showToast('❌ Failed to save bulk pricing');
    } finally {
      setSaving(false);
    }
  };

  const card = `rounded-[2rem] border shadow-sm overflow-hidden ${
    isDark ? 'bg-[#1a1535] border-[#2d2450] shadow-black/10' : 'bg-white border-orange-100/50 shadow-orange-900/5'
  }`;
  const strong = isDark ? 'text-gray-100' : 'text-gray-900';
  const muted = isDark ? 'text-gray-500' : 'text-gray-500';
  const input = `rounded-xl border px-3 py-2 text-sm font-bold outline-none transition-all focus:ring-2 ${
    isDark
      ? 'bg-[#13102a] border-[#2d2450] text-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500'
      : 'bg-orange-50/30 border-orange-200 text-gray-800 focus:bg-white focus:ring-orange-500/20 focus:border-orange-500'
  }`;

  if (loading) {
    return (
      <div className={`${card} flex items-center justify-center gap-3 py-10`}>
        <Loader2 size={18} className="animate-spin text-gray-400" />
        <span className={`text-sm font-bold ${muted}`}>Loading bulk pricing…</span>
      </div>
    );
  }

  if (missing) {
    return (
      <div className={`${card} p-6`}>
        <p className={`text-sm font-bold ${strong}`}>Bulk pricing</p>
        <p className={`text-xs mt-1 ${muted}`}>
          The Xerox service wasn&apos;t found. Set up the Xerox prices above first, then come back here.
        </p>
      </div>
    );
  }

  return (
    <div className={card}>
      <div className={`p-5 sm:p-6 border-b flex items-start gap-3 ${isDark ? 'border-[#2d2450] bg-[#13102a]/50' : 'border-gray-100 bg-orange-50/30'}`}>
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-100 text-orange-600'}`}>
          <Layers size={18} />
        </div>
        <div>
          <h3 className={`font-black text-lg ${strong}`}>Xerox bulk pricing</h3>
          <p className={`text-xs font-medium mt-0.5 ${muted}`}>
            When an order reaches the page threshold, the bulk price per page below is used instead of the normal price.
            Leave a bulk price empty to keep the normal price for that row. Set the threshold to 0 to switch bulk pricing off.
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <label className={`block text-sm font-black mb-1.5 ${strong}`}>Bulk rate applies from (total pages)</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              value={threshold}
              onChange={e => setThreshold(e.target.value)}
              className={`w-28 text-center ${input}`}
            />
            <span className={`text-xs font-semibold ${muted}`}>
              Below {Number(threshold) || 0} pages: normal price. {Number(threshold) || 0} pages or more: bulk price. Pages are
              counted across all files and copies in one order.
            </span>
          </div>
        </div>

        <div>
          <p className={`text-sm font-black mb-2 ${strong}`}>Price per page</p>
          {rows.length === 0 ? (
            <p className={`text-xs ${muted}`}>No normal prices are set yet, so there is nothing to discount.</p>
          ) : (
            <div className="space-y-2">
              {rows.map(([label, price]) => {
                const value = bulk[label] ?? '';
                const notLower = value.trim() !== '' && Number(value) >= Number(price);
                return (
                  <div
                    key={label}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${
                      isDark ? 'border-[#2d2450]' : 'border-gray-100'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className={`text-sm font-black ${strong}`}>{label}</p>
                      <p className={`text-[11px] font-semibold ${muted}`}>Normal: ₹{price}/page</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${muted}`}>Bulk ₹</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        inputMode="decimal"
                        placeholder="—"
                        value={value}
                        onChange={e => setBulk(prev => ({ ...prev, [label]: e.target.value }))}
                        className={`w-24 text-center ${input}`}
                      />
                    </div>
                    {notLower && (
                      <p className="basis-full text-[11px] font-bold text-amber-600">
                        This isn&apos;t lower than the normal price, so customers won&apos;t see any saving.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-60 ${
            isDark
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-900/30'
              : 'bg-gradient-to-r from-orange-500 to-yellow-500 shadow-orange-200'
          }`}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save bulk pricing'}
        </button>
      </div>
    </div>
  );
}
