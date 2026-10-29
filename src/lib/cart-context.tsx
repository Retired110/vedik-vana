'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem } from './types';

interface AppliedCoupon {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  discountPaise: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  taxPaise: number;
  totalPaise: number;
  freeShippingThresholdPaise: number;
  amountNeededForFreeShipping: number;
  freeShippingProgress: number;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const DEFAULT_FREE_SHIPPING_THRESHOLD = 99900; // ₹999
const DEFAULT_STANDARD_SHIPPING_FEE = 9900;    // ₹99
const DEFAULT_TAX_RATE = 0.05;                 // 5% GST

export function CartProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: any;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [settings, setSettings] = useState<any>(initialSettings || null);

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  const FREE_SHIPPING_THRESHOLD = settings?.freeShippingThresholdPaise ?? DEFAULT_FREE_SHIPPING_THRESHOLD;
  const STANDARD_SHIPPING_FEE = settings?.standardShippingFeePaise ?? DEFAULT_STANDARD_SHIPPING_FEE;
  const TAX_RATE = settings?.taxRatePercent ? settings.taxRatePercent / 100 : DEFAULT_TAX_RATE;

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('vv_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedCoupon = localStorage.getItem('vv_coupon');
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error('Failed to parse cart storage:', e);
    }
    setIsHydrated(true);
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('vv_cart', JSON.stringify(items));
        if (appliedCoupon) {
          localStorage.setItem('vv_coupon', JSON.stringify(appliedCoupon));
        } else {
          localStorage.removeItem('vv_coupon');
        }
      } catch (e) {
        console.error('Failed to save cart storage:', e);
      }
    }
  }, [items, appliedCoupon, isHydrated]);

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.productId === newItem.productId && item.variantId === newItem.variantId
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const currentQty = updated[existingIndex].quantity;
        const newQty = Math.min(currentQty + newItem.quantity, newItem.maxInventory || 99);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          maxInventory: newItem.maxInventory,
          pricePaise: newItem.pricePaise,
        };
        return updated;
      } else {
        return [...prevItems, { ...newItem, quantity: Math.min(newItem.quantity, newItem.maxInventory || 99) }];
      }
    });

    setIsCartOpen(true);
  };

  const removeItem = (productId: string, variantId?: string | null) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.productId === productId && (item.variantId || null) === (variantId || null))
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string | null) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.productId === productId && (item.variantId || null) === (variantId || null)) {
          const clampedQty = Math.min(quantity, item.maxInventory || 99);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalPaise = items.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0);

  // Calculate discount
  let discountPaise = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discountPaise = Math.round((subtotalPaise * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.discountPaise && discountPaise > appliedCoupon.discountPaise) {
        discountPaise = appliedCoupon.discountPaise; // Cap if max discount set
      }
    } else {
      discountPaise = Math.min(appliedCoupon.discountValue, subtotalPaise);
    }
  }

  const taxableAmount = Math.max(0, subtotalPaise - discountPaise);
  const shippingPaise = subtotalPaise >= FREE_SHIPPING_THRESHOLD || items.length === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const taxPaise = Math.round(taxableAmount * TAX_RATE);
  const totalPaise = taxableAmount + shippingPaise + taxPaise;

  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalPaise);
  const freeShippingProgress = Math.min(100, Math.round((subtotalPaise / FREE_SHIPPING_THRESHOLD) * 100));

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotalPaise }),
      });

      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({
          code: data.coupon.code,
          description: data.coupon.description,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
          discountPaise: data.discountPaise,
        });
        return { success: true, message: `Coupon ${data.coupon.code} applied successfully!` };
      } else {
        return { success: false, message: data.message || 'Invalid coupon code.' };
      }
    } catch {
      return { success: false, message: 'Failed to validate coupon. Please try again.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotalPaise,
        discountPaise,
        shippingPaise,
        taxPaise,
        totalPaise,
        freeShippingThresholdPaise: FREE_SHIPPING_THRESHOLD,
        amountNeededForFreeShipping,
        freeShippingProgress,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
