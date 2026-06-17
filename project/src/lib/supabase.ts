import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          state: string | null;
          city: string | null;
          role: 'user' | 'admin' | 'delivery';
          loyalty_points: number;
          wallet_balance: number;
          preferred_language: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      foods: {
        Row: {
          id: string;
          name: string;
          name_te: string | null;
          name_ta: string | null;
          name_hi: string | null;
          description: string | null;
          category_id: string | null;
          image_url: string | null;
          price_per_kg: number | null;
          price_per_person: number | null;
          min_weight_grams: number | null;
          max_weight_kg: number | null;
          min_persons: number | null;
          max_persons: number | null;
          is_veg: boolean;
          spice_level: 'mild' | 'medium' | 'hot' | 'extra_hot';
          ingredients: string[] | null;
          native_regions: string[] | null;
          tags: string[] | null;
          is_available: boolean;
          is_today_special: boolean;
          avg_rating: number | null;
          total_reviews: number | null;
          total_orders: number | null;
          created_at: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string | null;
          image_url: string | null;
          sort_order: number | null;
          is_active: boolean;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          delivery_address: Record<string, unknown>;
          status: string;
          payment_method: string;
          payment_status: string;
          subtotal: number;
          delivery_charge: number;
          gst_amount: number;
          discount_amount: number;
          total_amount: number;
          coupon_code: string | null;
          created_at: string;
        };
      };
    };
  };
};
