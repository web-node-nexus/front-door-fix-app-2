import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Service } from '../api/client';
import {
  isAluminiumGlassService,
  lineAmount,
  MeasureUnit,
} from '../utils/measureUnits';

export type CartItem = {
  service: Service;
  quantity: number;
  /** Aluminium & Glass only */
  measureUnit?: MeasureUnit;
  measure?: number;
};

type AddItemOptions = {
  measureUnit?: MeasureUnit;
  measure?: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  addItem: (service: Service, options?: AddItemOptions) => void;
  removeItem: (serviceId: number) => void;
  updateQuantity: (serviceId: number, quantity: number) => void;
  updateMeasure: (serviceId: number, measure: number, measureUnit?: MeasureUnit) => void;
  isInCart: (serviceId: number) => boolean;
  getQuantity: (serviceId: number) => number;
  getItem: (serviceId: number) => CartItem | undefined;
  clearCart: () => void;
};

const CART_KEY = '@fd_cart_v2';

const CartContext = createContext<CartContextValue | null>(null);

function itemLineTotal(item: CartItem): number {
  if (isAluminiumGlassService(item.service) && item.measureUnit) {
    return lineAmount(Number(item.service.price), item.measure ?? 1, item.quantity);
  }
  return Number(item.service.price) * item.quantity;
}

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
    const totalAmount = items.reduce((sum, i) => sum + itemLineTotal(i), 0);

    return {
      items,
      itemCount,
      totalAmount,
      addItem(service: Service, options?: AddItemOptions) {
        const alum = isAluminiumGlassService(service);
        const measureUnit = alum ? options?.measureUnit : undefined;
        const measure = alum ? Math.max(0.1, Number(options?.measure) || 1) : undefined;

        if (alum && !measureUnit) {
          return;
        }

        const existing = items.find((i) => i.service.id === service.id);

        if (existing) {
          persist(
            items.map((i) => {
              if (i.service.id !== service.id) return i;
              if (alum) {
                // Same unit → add measures; different unit → replace selection.
                if (i.measureUnit === measureUnit) {
                  return {
                    ...i,
                    measure: (i.measure ?? 1) + (measure ?? 1),
                    measureUnit,
                  };
                }
                return { ...i, measure, measureUnit, quantity: 1 };
              }
              return { ...i, quantity: i.quantity + 1 };
            }),
          );
          return;
        }

        persist([
          ...items,
          {
            service,
            quantity: 1,
            ...(alum ? { measureUnit, measure } : {}),
          },
        ]);
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
      updateMeasure(serviceId: number, measure: number, measureUnit?: MeasureUnit) {
        persist(
          items.map((i) => {
            if (i.service.id !== serviceId) return i;
            return {
              ...i,
              measure: Math.max(0.1, measure),
              measureUnit: measureUnit ?? i.measureUnit,
            };
          }),
        );
      },
      isInCart(serviceId: number) {
        return items.some((i) => i.service.id === serviceId);
      },
      getQuantity(serviceId: number) {
        return items.find((i) => i.service.id === serviceId)?.quantity ?? 0;
      },
      getItem(serviceId: number) {
        return items.find((i) => i.service.id === serviceId);
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
