'use client';

import React, {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from 'react';
import { User, CartItem, Order, Product, Address } from '@/lib/types';
import {
  FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE,
} from '@/lib/data';
import { authFetch, getToken, setToken, clearToken, UNAUTHORIZED_EVENT } from '@/lib/api';

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

// Parses a fetch Response as JSON safely. If the server didn't actually
// send JSON back (wrong API URL, CORS block, route not mounted, a 502
// from the host, etc.) this logs the real body instead of throwing an
// opaque "Unexpected token < in JSON" error that gets swallowed into a
// generic message.
async function parseJsonResponse(res: Response, context: string): Promise<{ success: boolean; message?: string; [key: string]: unknown }> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    console.error(`[${context}] Expected JSON but got "${contentType}" (status ${res.status}). Body:`, text.slice(0, 500));
    throw new Error(`Unexpected response from server (status ${res.status}). Check NEXT_PUBLIC_API_URL and CORS config.`);
  }
  return res.json();
}

const friendlyError = (error: unknown): string =>
  error instanceof Error && error.message.startsWith('Unexpected response')
    ? error.message
    : 'Server error. Please try again.';

// ─── types ──────────────────────────────────────────────────
interface AppState {
  currentUser: User | null;
  cart: CartItem[];
  orders: Order[];
  toast: { msg: string; visible: boolean };
  cartOpen: boolean;
  wishlist: string[];

  loginWithToken: (idToken: string) => Promise<string | null>;
  signupWithToken: (idToken: string, name: string, email: string) => Promise<string | null>;
  login: (id: string, pass: string, role: 'customer' | 'shopkeeper') => Promise<string | null>;
  logout: () => void;
  updateProfile: (name: string, address?: User['address']) => Promise<string | null>;
  updateAddress: (address: User['address']) => Promise<void>;
  saveAddress: (address: Address, index?: number) => Promise<string | null>;
  deleteAddress: (index: number) => Promise<string | null>;

  addToCart: (product: Product) => void;
  addPrintItemsToCart: (items: CartItem[]) => void;
  changeQty: (productId: string, delta: number) => void;
  clearCart: () => void;
  cartSubtotal: () => number;
  deliveryCharge: () => number;
  cartTotal: () => number;
  setCartOpen: (open: boolean) => void;

  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;

  placeOrder: (paymentMethod?: string, deliveryAddress?: User['address']) => Promise<Order | null>;
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
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);

  // Persist orders + cart + load on mount
  useEffect(() => {
    setOrders(ls.get<Order[]>('sk_orders', []));
    setCart(ls.get<CartItem[]>('sk_cart', []));
    setCartHydrated(true);

    // Restore session. A saved user without a token is an old password-era
    // session, so clear it and make them log in again with OTP.
    const u = ls.get<User | null>('sk_session', null);
    if (u && getToken()) {
      setCurrentUser(u);
      setWishlist(u.wishlist || ls.get<string[]>('sk_wishlist', []));
    } else {
      if (u) ls.set('sk_session', null);
      setWishlist(ls.get<string[]>('sk_wishlist', []));
    }
  }, []);

  // Keep localStorage in sync with cart state, so it survives a full page
  // reload (e.g. typing a URL directly, or navigating between /customer
  // and /xerox) instead of resetting to empty every time the app remounts.
  // Skipped until the initial hydration above has run, so this doesn't
  // immediately overwrite the saved cart with the empty initial state.
  useEffect(() => {
    if (!cartHydrated) return;
    ls.set('sk_cart', cart);
  }, [cart, cartHydrated]);

  const showToast = useCallback((msg: string) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800);
  }, []);

  // If the backend rejects our token (expired / invalid), end the session
  useEffect(() => {
    const onExpired = () => {
      clearToken();
      ls.set('sk_session', null);
      setCurrentUser(null);
      showToast('⚠️ Session expired. Please login again.');
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onExpired);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onExpired);
  }, [showToast]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // ── Auth ──────────────────────────────────────────────────
  const startSession = (user: User, token: string) => {
    setToken(token);
    setCurrentUser(user);
    ls.set('sk_session', user);
    const list = user.wishlist || [];
    setWishlist(list);
    ls.set('sk_wishlist', list);
  };

  // Customer login: `idToken` comes from Firebase after the OTP is confirmed
  const loginWithToken = async (idToken: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/auth/login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await parseJsonResponse(res, 'login-otp');
      if (!data.success) return data.message || 'Login failed. Please try again.';
      startSession(data.user as User, data.token as string);
      return null;
    } catch (error) {
      console.error('[login-otp] request failed:', error);
      return friendlyError(error);
    }
  };

  // Customer signup: creates the account and logs in immediately
  const signupWithToken = async (idToken: string, name: string, email: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/auth/signup-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, name, email }),
      });
      const data = await parseJsonResponse(res, 'signup-otp');
      if (!data.success) return data.message || 'Signup failed. Please try again.';
      startSession(data.user as User, data.token as string);
      return null;
    } catch (error) {
      console.error('[signup-otp] request failed:', error);
      return friendlyError(error);
    }
  };

  // Shopkeeper (password) login
  const login = async (id: string, pass: string, role: 'customer' | 'shopkeeper'): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password: pass, role }),
      });
      const data = await parseJsonResponse(res, 'login');
      if (!data.success) return data.message || 'Login failed. Please try again.';
      startSession(data.user as User, data.token as string);
      return null;
    } catch (error) {
      console.error('[login] request failed:', error);
      return friendlyError(error);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
    setWishlist([]);
    clearToken();
    ls.set('sk_session', null);
    ls.set('sk_wishlist', []);
    ls.set('sk_cart', []);
  };

  const updateProfile = async (name: string, address?: User['address']): Promise<string | null> => {
    if (!currentUser) return 'Please login first';
    try {
      const res = await authFetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        ls.set('sk_session', data.user);
        return null;
      }
      return data.message || 'Failed to update profile';
    } catch (error) {
      console.error('Failed to update profile:', error);
      return 'Server error. Please try again.';
    }
  };

  const updateAddress = async (address: User['address']) => {
    if (!currentUser) return;
    await updateProfile(currentUser.name, address);
  };

  const saveAddress = async (address: Address, index?: number): Promise<string | null> => {
    if (!currentUser) return 'Please login first';
    try {
      const res = await authFetch(`${API_URL}/auth/addresses`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, index }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        ls.set('sk_session', data.user);
        return null;
      }
      return data.message || 'Failed to save address';
    } catch {
      return 'Server error. Please try again.';
    }
  };

  const deleteAddress = async (index: number): Promise<string | null> => {
    if (!currentUser) return 'Please login first';
    try {
      const res = await authFetch(`${API_URL}/auth/addresses`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        ls.set('sk_session', data.user);
        return null;
      }
      return data.message || 'Failed to delete address';
    } catch {
      return 'Server error. Please try again.';
    }
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

  // Adds one or more pre-built cart items at once, each kept as its own
  // distinct line (no qty-merging with existing items). Used by the
  // Xerox/print uploader, where every uploaded file is its own cart line
  // carrying unique print metadata (orientation, page size, crop, etc.),
  // unlike addToCart's single-product qty-increment behaviour.
  const addPrintItemsToCart = useCallback((items: CartItem[]) => {
    setCart(prev => [...prev, ...items]);
  }, []);

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

  // ── Wishlist ─────────────────────────────────────────────
  const toggleWishlist = useCallback(async (productId: string) => {
    const alreadyIn = wishlist.includes(productId);
    const updated = alreadyIn
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];

    // Optimistic update
    setWishlist(updated);
    ls.set('sk_wishlist', updated);

    // Sync to backend if logged in
    if (currentUser && currentUser.role === 'customer') {
      try {
        await authFetch(`${API_URL}/auth/wishlist/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
      } catch {
        // silently fail — local state already updated
      }
    }
  }, [wishlist, currentUser, API_URL]);

  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const deliveryCharge = () => {
    if (cart.length === 0) return 0;
    return cartSubtotal() >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  };

  const cartTotal = () => cartSubtotal() + deliveryCharge();

  // ── Orders ────────────────────────────────────────────────
  const placeOrder = async (paymentMethod: string = 'cod', deliveryAddress?: User['address']): Promise<Order | null> => {
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
      // Carry print metadata through to the saved order, when this cart
      // line came from the Xerox/print uploader, so the admin can later
      // download the exact file the customer uploaded.
      ...(item.printFile ? { printDetails: item.printFile } : {}),
    }));

    try {
      const res = await authFetch(`${API_URL}/orders`, {
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
          deliveryAddress,
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
      const res = await authFetch(`${API_URL}/orders/${currentUser.uid}`);
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
      const res = await authFetch(`${API_URL}/orders/${orderId}/status`, {
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
      currentUser, cart, orders, toast, cartOpen, wishlist,
      loginWithToken, signupWithToken, login, logout, updateProfile, updateAddress, saveAddress, deleteAddress,
      addToCart, addPrintItemsToCart, changeQty, clearCart, cartSubtotal, deliveryCharge, cartTotal, setCartOpen,
      toggleWishlist, isInWishlist,
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
