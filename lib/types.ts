export interface User {
  uid: string;
  name: string;
  phone: string;
  email?: string;
  pass: string;
  role: 'customer' | 'shopkeeper';
  joinedAt: string;
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
}

export interface Product {
  id: number;
  name: string;
  cat: string;
  price: number;
  emoji: string;
  tag: string;
  isNew: boolean;
}

export interface CartItem extends Product {
  qty: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'delivered';

export interface Order {
  orderId: string;
  uid: string;
  name: string;
  phone: string;
  items: CartItem[];
  subtotal: number;
  delivery: number;
  total: number;
  time: string;
  timeStr: string;
  status: OrderStatus;
}
