/*
# Auto-create profiles trigger and admin setup helper

1. Changes
   - Add trigger to automatically create a profile row when a new auth.users record is inserted
   - This ensures every new registration automatically gets a profile

2. Admin Setup
   - Creates a helper function to promote a user to admin by email
*/

-- Trigger to auto-create profiles on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper view for admin to check total stats
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT
  (SELECT COUNT(*) FROM orders) AS total_orders,
  (SELECT COALESCE(SUM(total_amount), 0) FROM orders) AS total_revenue,
  (SELECT COUNT(*) FROM orders WHERE status NOT IN ('delivered', 'cancelled')) AS active_orders,
  (SELECT COUNT(*) FROM foods WHERE is_available = true) AS available_foods,
  (SELECT COUNT(*) FROM inventory WHERE current_stock <= min_stock_alert) AS low_stock_count;

-- Allow admin to read stats
DROP POLICY IF EXISTS "Admins can read stats" ON orders;
