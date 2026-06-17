import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  food_id: string;
  food_name: string;
  food_image_url: string | null;
  order_type: 'weight' | 'persons';
  quantity_grams: number | null;
  persons_count: number | null;
  unit_price: number;
  total_price: number;
  is_veg: boolean;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  loading: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<CartItem>) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('cart_items')
      .select('*, foods(name, image_url, is_veg)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (data) {
      setItems(data.map(item => ({
        id: item.id,
        food_id: item.food_id,
        food_name: (item.foods as Record<string, unknown>)?.name as string ?? '',
        food_image_url: (item.foods as Record<string, unknown>)?.image_url as string | null ?? null,
        is_veg: (item.foods as Record<string, unknown>)?.is_veg as boolean ?? true,
        order_type: item.order_type as 'weight' | 'persons',
        quantity_grams: item.quantity_grams,
        persons_count: item.persons_count,
        unit_price: item.unit_price,
        total_price: item.unit_price,
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (item: Omit<CartItem, 'id'>) => {
    if (!user) return;
    await supabase.from('cart_items').insert({
      user_id: user.id,
      food_id: item.food_id,
      order_type: item.order_type,
      quantity_grams: item.quantity_grams,
      persons_count: item.persons_count,
      unit_price: item.unit_price,
    });
    await refreshCart();
  };

  const removeItem = async (id: string) => {
    await supabase.from('cart_items').delete().eq('id', id);
    await refreshCart();
  };

  const updateItem = async (id: string, updates: Partial<CartItem>) => {
    await supabase.from('cart_items').update({
      quantity_grams: updates.quantity_grams,
      persons_count: updates.persons_count,
      unit_price: updates.unit_price,
    }).eq('id', id);
    await refreshCart();
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.unit_price, 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider value={{ items, itemCount, subtotal, loading, addItem, removeItem, updateItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
