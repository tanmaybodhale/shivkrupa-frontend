'use client';

import { useEffect, useState } from 'react';
import { Tag } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import type { XeroxService } from '@/lib/xeroxPricing';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const fmt = (n: number) => '₹' + (Number.isInteger(n) ? String(n) : n.toFixed(2));

/**
 * Shows the Xerox price list on the customer page. Everything here comes
 * from the admin's Services > Xerox settings, so when the admin changes a
 * price or the page threshold, customers see the new line on their next
 * visit (it also refreshes when they come back to the tab).
 */
export default function XeroxPriceInfo() {
  const { isDark } = useTheme();
  const [service, setService] = useState<XeroxService | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/services/xerox`);
        const data = await res.json();
        if (!cancelled && data.success) setService(data.service);
      } catch (error) {
        console.error('Failed to load Xerox prices:', error);
      }
    };
    load();
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  if (!service) return null;

  const pricing = service.pricing ?? {};
  const bulk = service.bulkPricing ?? {};
  const threshold = Number(service.bulkThreshold) || 0;

  const sizes: string[] = [];
  const types: string[] = [];
  const cells: Record<string, { std: number; bulk: number }> = {};

  for (const [label, price] of Object.entries(pricing)) {
    if (!(Number(price) > 0)) continue;
    const [size, type] = label.split(' - ').map(s => s.trim());
    if (!size || !type) continue;
    if (!sizes.includes(size)) sizes.push(size);
    if (!types.includes(type)) types.push(type);
    const b = Number(bulk[label]);
    cells[label] = { std: Number(price), bulk: b > 0 && b !== Number(price) ? b : 0 };
  }

  if (sizes.length === 0) return null;

  const showBulk = threshold > 0 && Object.values(cells).some(c => c.bulk > 0);

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 mb-5 ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
      <div className="flex items-center gap-2 mb-3">
        <Tag size={16} className={isDark ? 'text-indigo-400' : 'text-orange-500'} />
        <h2 className={`text-sm font-black ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          Printing rates (per page)
        </h2>
      </div>

      {showBulk && (
        <p className={`text-[13px] font-bold leading-snug rounded-xl px-3 py-2 mb-3 ${isDark ? 'bg-indigo-500/10 text-indigo-300' : 'bg-orange-50 text-orange-700'}`}>
          🎉 Print fewer than {threshold} pages: standard rate. Print {threshold} or more pages in one order: lower rate, shown in green below.
          <span className="block text-[11px] font-semibold opacity-80 mt-0.5">
            Pages are counted across all your files and copies together.
          </span>
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className={`py-2 pr-3 text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Size</th>
              {types.map(t => (
                <th key={t} className={`py-2 px-3 text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#2d2450]' : 'divide-orange-100'}`}>
            {sizes.map(size => (
              <tr key={size}>
                <td className={`py-2.5 pr-3 text-sm font-black ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{size}</td>
                {types.map(type => {
                  const c = cells[`${size} - ${type}`];
                  return (
                    <td key={type} className="py-2.5 px-3 align-top">
                      {c ? (
                        <>
                          <span className={`block text-sm font-black ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{fmt(c.std)}</span>
                          {showBulk && c.bulk > 0 && (
                            <span className="block text-[11px] font-bold text-green-600 whitespace-nowrap">
                              {fmt(c.bulk)} at {threshold}+ pages
                            </span>
                          )}
                        </>
                      ) : (
                        <span className={isDark ? 'text-gray-600' : 'text-gray-300'}>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
