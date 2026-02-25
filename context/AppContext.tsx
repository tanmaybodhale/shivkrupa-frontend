'use client';

import React, {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from 'react';
import { User, CartItem, Order, Product } from '@/lib/types';
import {
  FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE, SHOPKEEPER_PASS,
} from '@/lib/data';

// ─── helpers ────────────────────────────────────────────────
const ls = {
  get: <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; }
    catch { return fallback; }
  },
  set: (key: string, val: unknown) => {
    if (typeof window !== 'undefined')
      localStorage.setItem(key, JSON.stringify(val));
  },
};

// ─── types ──────────────────────────────────────────────────
interface AppState {
  currentUser: User | null;
  cart: CartItem[];
  orders: Order[];
  toast: { msg: string; visible: boolean };
  cartOpen: boolean;

  signup: (name: string, phone: string, email: string, pass: string) => Promise<string | null>;
  login: (id: string, pass: string, role: 'customer' | 'shopkeeper') => Promise<string | null>;
  logout: () => void;

  addToCart: (product: Product) => void;
  changeQty: (productId: number, delta: number) => void;
  clearCart: () => void;
  cartSubtotal: () => number;
  deliveryCharge: () => number;
  cartTotal: () => number;
  setCartOpen: (open: boolean) => void;

  placeOrder: () => Order | null;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  refreshOrders: () => void;

  showToast: (msg: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [toast, setToast] = useState({ msg: '', visible: false });
  const [cartOpen, setCartOpen] = useState(false);

  // Persist orders + load on mount
  useEffect(() => {
    setOrders(ls.get<Order[]>('sk_orders', []));
    // Restore session
    const u = ls.get<User | null>('sk_session', null);
    if (u) setCurrentUser(u);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800);
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // ── Auth ──────────────────────────────────────────────────
  const signup = async (name: string, phone: string, email: string, pass: string): Promise<string | null> => {
    if (!name || !phone || !pass) return 'Please fill all required fields';
    if (!/^\d{10}$/.test(phone)) return 'Enter a valid 10-digit phone number';
    
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password: pass, role: 'customer' }),
      });
      const data = await res.json();
      if (!data.success) return data.message;
      return null;
    } catch {
      return 'Server error. Please try again.';
    }
  };

  const login = async (id: string, pass: string, role: 'customer' | 'shopkeeper'): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password: pass, role }),
      });
      const data = await res.json();
      if (!data.success) return data.message;
      setCurrentUser(data.user);
      ls.set('sk_session', data.user);
      return null;
    } catch {
      return 'Server error. Please try again.';
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
    ls.set('sk_session', null);
  };

  // ── Cart ─────────────────────────────────────────────────
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === product.id);
      if (existing) return prev.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const changeQty = (productId: number, delta: number) => {
    setCart(prev => {
      const updated = prev.map(c => c.id === productId ? { ...c, qty: c.qty + delta } : c);
      return updated.filter(c => c.qty > 0);
    });
  };

  const clearCart = () => setCart([]);

  const cartSubtotal = () => cart.reduce((s, i) => s + i.price * i.qty, 0);

  const deliveryCharge = () => {
    if (cart.length === 0) return 0;
    return cartSubtotal() >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  };

  const cartTotal = () => cartSubtotal() + deliveryCharge();

  // ── Orders ────────────────────────────────────────────────
  const placeOrder = (): Order | null => {
    if (!currentUser || cart.length === 0) return null;
    const subtotal = cartSubtotal();
    const delivery = deliveryCharge();
    const total = subtotal + delivery;
    const orderId = 'SKE' + Date.now().toString().slice(-7);
    const now = new Date();
    const order: Order = {
      orderId,
      uid: currentUser.uid,
      name: currentUser.name,
      phone: currentUser.phone || '—',
      items: [...cart],
      subtotal,
      delivery,
      total,
      time: now.toISOString(),
      timeStr: now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      status: 'pending',
    };
    const updated = [...orders, order];
    setOrders(updated);
    ls.set('sk_orders', updated);
    return order;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updated = orders.map(o => o.orderId === orderId ? { ...o, status } : o);
    setOrders(updated);
    ls.set('sk_orders', updated);
  };

  const refreshOrders = () => setOrders(ls.get<Order[]>('sk_orders', []));

  return (
    <AppContext.Provider value={{
      currentUser, cart, orders, toast, cartOpen,
      signup, login, logout,
      addToCart, changeQty, clearCart, cartSubtotal, deliveryCharge, cartTotal, setCartOpen,
      placeOrder, updateOrderStatus, refreshOrders,
      showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
