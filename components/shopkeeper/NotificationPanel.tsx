'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, ShoppingBag, Check, CheckCheck } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AdminNotification } from '@/lib/types';
import { useApp } from '@/context/AppContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const STORAGE_KEY = 'admin_notifications';
const SEEN_KEY = 'admin_seen_order_ids';

// Simple beep using Web Audio API (no file needed)
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
    // Second beep
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.setValueAtTime(660, ctx.currentTime + 0.2);
    osc2.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.35);
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.start(ctx.currentTime + 0.2);
    osc2.stop(ctx.currentTime + 0.6);
  } catch {
    // Audio not supported, silent fail
  }
}

function getSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function saveSeenIds(ids: Set<string>) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...ids])); } catch {}
}

export default function NotificationPanel() {
  const { isDark } = useTheme();
  const { orders } = useApp();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());

  // Load notifications from localStorage on mount
  useEffect(() => {
    seenIdsRef.current = getSeenIds();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setNotifications(JSON.parse(raw));
    } catch {}
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications)); } catch {}
  }, [notifications]);

  // Poll orders and detect new ones
  useEffect(() => {
    if (!orders || orders.length === 0) return;
    const currentOrderIds = new Set(orders.map(o => o.orderId));
    const newOrders = orders.filter(o => !seenIdsRef.current.has(o.orderId));

    if (newOrders.length > 0) {
      // Play sound for new orders
      playNotificationSound();

      // Create notifications for new orders
      const newNotifs: AdminNotification[] = newOrders.map(o => ({
        id: o.orderId + '_notif_' + Date.now(),
        orderId: o.orderId,
        customerName: o.name,
        total: o.total,
        time: o.timeStr || new Date(o.time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
        read: false,
      }));

      setNotifications(prev => {
        // Avoid duplicates
        const existingOrderIds = new Set(prev.map(n => n.orderId));
        const toAdd = newNotifs.filter(n => !existingOrderIds.has(n.orderId));
        return [...toAdd, ...prev].slice(0, 50); // Keep max 50
      });

      // Mark as seen
      newOrders.forEach(o => seenIdsRef.current.add(o.orderId));
      saveSeenIds(seenIdsRef.current);
    }
  }, [orders]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(prev => !prev); if (!open) markAllRead(); }}
        className={`relative flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-200 active:scale-90 ${
          isDark
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-400/50'
            : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 hover:border-amber-300'
        } ${unreadCount > 0 ? 'animate-pulse-once' : ''}`}
        title="Notifications"
        id="admin-notification-btn"
      >
        <Bell size={16} strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-0.5 rounded-full flex items-center justify-center bg-red-500 text-white text-[9px] font-black border-2 border-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className={`absolute right-0 top-full mt-2 z-[999] rounded-2xl border shadow-2xl overflow-hidden w-80 sm:w-96 ${
            isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'
          }`}
          style={{ maxHeight: '70vh' }}
        >
          {/* Header */}
          <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? 'bg-[#13102a] border-[#2d2450]' : 'bg-orange-50 border-orange-100'}`}>
            <div className="flex items-center gap-2">
              <Bell size={15} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
              <span className={`text-sm font-black ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                Order Notifications
              </span>
              {notifications.length > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isDark ? 'bg-[#2d2450] text-gray-400' : 'bg-orange-100 text-orange-600'}`}>
                  {notifications.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllRead}
                    className={`p-1.5 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1 ${isDark ? 'text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'}`}
                    title="Mark all read"
                  >
                    <CheckCheck size={13} />
                  </button>
                  <button
                    onClick={clearAll}
                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                    title="Clear all"
                  >
                    <X size={13} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 56px)' }}>
            {notifications.length === 0 ? (
              <div className={`py-10 px-4 flex flex-col items-center justify-center gap-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                <Bell size={32} className="opacity-30" />
                <p className="text-sm font-semibold text-center">No notifications yet.<br />New orders will appear here.</p>
              </div>
            ) : (
              <div className={`divide-y ${isDark ? 'divide-[#2d2450]' : 'divide-orange-50'}`}>
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 flex items-start gap-3 transition-colors group/item ${
                      !notif.read
                        ? isDark ? 'bg-amber-500/10 hover:bg-amber-500/15' : 'bg-amber-50/60 hover:bg-amber-50'
                        : isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                      <ShoppingBag size={14} className={isDark ? 'text-orange-400' : 'text-orange-600'} />
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => markRead(notif.id)}>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs font-black truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                          New Order #{notif.orderId}
                        </p>
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />}
                      </div>
                      <p className={`text-[11px] font-medium mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {notif.customerName} — <span className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>₹{notif.total}</span>
                      </p>
                      <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{notif.time}</p>
                    </div>
                    {/* Individual delete */}
                    <button
                      onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                      className={`shrink-0 p-1 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all ${isDark ? 'text-gray-600 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}`}
                      title="Dismiss"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
