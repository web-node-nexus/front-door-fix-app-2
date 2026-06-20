import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Service } from '../api/client';

export type CartItem = {
  service: Service;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  addItem: (service: Service) => void;
  removeItem: (serviceId: number) => void;
  updateQuantity: (serviceId: number, quantity: number) => void;
  isInCart: (serviceId: number) => boolean;
  getQuantity: (serviceId: number) => number;
  clearCart: () => void;
};

const CART_KEY = '@fd_cart';

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(CART_KEY).then((raw) => {
      if (raw) {
        try {
          setItems(JSON.parse(raw));
        } catch {
          setItems([]);
        }
      }
    });
  }, []);

  const persist = (next: CartItem[]) => {
    setItems(next);
    AsyncStorage.setItem(CART_KEY, JSON.stringify(next));
  };

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalAmount = items.reduce(
      (sum, i) => sum + Number(i.service.price) * i.quantity,
      0,
    );

    return {
      items,
      itemCount,
      totalAmount,
      addItem(service: Service) {
        const existing = items.find((i) => i.service.id === service.id);
        if (existing) {
          persist(
            items.map((i) =>
              i.service.id === service.id ? { ...i, quantity: i.quantity + 1 } : i,
            ),
          );
        } else {
          persist([...items, { service, quantity: 1 }]);
        }
      },
      removeItem(serviceId: number) {
        persist(items.filter((i) => i.service.id !== serviceId));
      },
      updateQuantity(serviceId: number, quantity: number) {
        if (quantity <= 0) {
          persist(items.filter((i) => i.service.id !== serviceId));
          return;
        }
        persist(
          items.map((i) => (i.service.id === serviceId ? { ...i, quantity } : i)),
        );
      },
      isInCart(serviceId: number) {
        return items.some((i) => i.service.id === serviceId);
      },
      getQuantity(serviceId: number) {
        return items.find((i) => i.service.id === serviceId)?.quantity ?? 0;
      },
      clearCart() {
        persist([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
