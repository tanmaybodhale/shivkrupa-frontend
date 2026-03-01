export interface User {
  uid: string;
  name: string;
  phone: string;
  email?: string;
  pass?: string;
  role: 'customer' | 'shopkeeper';
  joinedAt?: string;
  address?: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    location?: {
      lat: number;
      lng: number;
    };
  };
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
}

export interface Product {
  _id?: string;
  id?: number;
  name: string;
  cat?: string;
  category: string;
  price: number;
  mrp: number;
  description?: string;
  image: string;
  emoji?: string;
  unit: string;
  inStock: boolean;
  isNew?: boolean;
  tag?: string;
  quantity?: number | null;
}

export interface CartItem extends Product {
  qty: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export interface Order {
  orderId: string;
  uid: string;
  name: string;
  phone: string;
  items: {
    productId?: string;
    name: string;
    price: number;
    qty: number;
    image?: string;
  }[];
  subtotal: number;
  delivery: number;
  total: number;
  paymentMethod?: string;
  time: string;
  timeStr: string;
  status: OrderStatus;
  deliveryAddress?: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    location?: {
      lat: number;
      lng: number;
    };
  };
}
