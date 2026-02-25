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
  changeQty: (productId: string, delta: number) => void;
  clearCart: () => void;
  cartSubtotal: () => number;
  deliveryCharge: () => number;
  cartTotal: () => number;
  setCartOpen: (open: boolean) => void;

  placeOrder: (paymentMethod?: string) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  refreshOrders: () => void;
  fetchOrders: () => Promise<void>;
  setOrders: (orders: Order[]) => void;
  setCurrentUser: (user: User | null) => void;

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
  const getProductId = (product: Product): string => {
    if (product._id) return product._id;
    if (product.id) return String(product.id);
    return '';
  };

  const addToCart = (product: Product) => {
    const prodId = getProductId(product);
    setCart(prev => {
      const existing = prev.find(c => getProductId(c) === prodId);
      if (existing) return prev.map(c => getProductId(c) === prodId ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const changeQty = (productId: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(c => {
        const cId = getProductId(c);
        if (cId === productId) {
          return { ...c, qty: c.qty + delta };
        }
        return c;
      });
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
  const placeOrder = async (paymentMethod: string = 'cod'): Promise<Order | null> => {
    if (!currentUser || cart.length === 0) return null;
    const subtotal = cartSubtotal();
    const delivery = deliveryCharge();
    const total = subtotal + delivery;

    const items = cart.map(item => ({
      productId: item._id || String(item.id || ''),
      name: item.name,
      price: item.price,
      qty: item.qty,
      image: item.image,
    }));

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: currentUser.uid,
          name: currentUser.name,
          phone: currentUser.phone,
          items,
          subtotal,
          delivery,
          total,
          paymentMethod,
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        const localOrder: Order = {
          ...data.order,
          items: cart,
        };
        const updated = [...orders, localOrder];
        setOrders(updated);
        ls.set('sk_orders', updated);
        return localOrder;
      }
      return null;
    } catch (error) {
      console.error('Failed to place order:', error);
      return null;
    }
  };

  const fetchOrders = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_URL}/orders/${currentUser.uid}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        ls.set('sk_orders', data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  }, [currentUser]);

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = orders.map(o => o.orderId === orderId ? { ...o, status } : o);
        setOrders(updated);
        ls.set('sk_orders', updated);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const refreshOrders = useCallback(() => setOrders(ls.get<Order[]>('sk_orders', [])), []);

  return (
    <AppContext.Provider value={{
      currentUser, cart, orders, toast, cartOpen,
      signup, login, logout,
      addToCart, changeQty, clearCart, cartSubtotal, deliveryCharge, cartTotal, setCartOpen,
      placeOrder, updateOrderStatus, refreshOrders, fetchOrders, setOrders, setCurrentUser,
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
