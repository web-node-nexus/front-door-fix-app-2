import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Service } from '../api/client';
import {
  defaultMeasureUnit,
  lineAmount,
  MeasureUnit,
  unitPrice,
} from '../utils/measureUnits';

export type CartItem = {
  service: Service;
  quantity: number;
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

const CART_KEY = '@fd_cart_v3';

const CartContext = createContext<CartContextValue | null>(null);

function itemLineTotal(item: CartItem): number {
  const unit = item.measureUnit ?? defaultMeasureUnit(item.service);
  const measure = item.measure ?? 0;
  if (measure > 0) {
    return lineAmount(unitPrice(item.service, unit), measure, item.quantity || 1);
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
        const measureUnit = options?.measureUnit ?? defaultMeasureUnit(service);
        const measure = Math.max(0, Number(options?.measure) || 0);

        if (!(measure > 0)) {
          return;
        }

        const existing = items.find((i) => i.service.id === service.id);

        if (existing) {
          persist(
            items.map((i) => {
              if (i.service.id !== service.id) return i;
              if (i.measureUnit === measureUnit) {
                return {
                  ...i,
                  measure: (i.measure ?? 0) + measure,
                  measureUnit,
                  quantity: 1,
                };
              }
              return { ...i, measure, measureUnit, quantity: 1 };
            }),
          );
          return;
        }

        persist([
          ...items,
          {
            service,
            quantity: 1,
            measureUnit,
            measure,
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
          items.map((i) => {
            if (i.service.id !== serviceId) return i;
            if (i.measure && i.measure > 0) {
              return { ...i, measure: quantity, quantity: 1 };
            }
            return { ...i, quantity };
          }),
        );
      },
      updateMeasure(serviceId: number, measure: number, measureUnit?: MeasureUnit) {
        if (measure <= 0) {
          persist(items.filter((i) => i.service.id !== serviceId));
          return;
        }
        persist(
          items.map((i) => {
            if (i.service.id !== serviceId) return i;
            return {
              ...i,
              measure,
              measureUnit: measureUnit ?? i.measureUnit ?? defaultMeasureUnit(i.service),
              quantity: 1,
            };
          }),
        );
      },
      isInCart(serviceId: number) {
        return items.some((i) => i.service.id === serviceId);
      },
      getQuantity(serviceId: number) {
        const item = items.find((i) => i.service.id === serviceId);
        if (!item) return 0;
        if (item.measure && item.measure > 0) return item.measure;
        return item.quantity;
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
