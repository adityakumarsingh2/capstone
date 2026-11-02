-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  body_measurements JSONB,
  style_preferences TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  sizes TEXT[] NOT NULL,
  colors TEXT[],
  images TEXT[],
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);

-- Create cart_items table
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to their cart" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their cart" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete from cart" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSONB,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create try_on_sessions table
CREATE TABLE public.try_on_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  original_photo_url TEXT NOT NULL,
  result_photo_url TEXT,
  body_analysis JSONB,
  recommended_size TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.try_on_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own try-on sessions" ON public.try_on_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create try-on sessions" ON public.try_on_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their try-on sessions" ON public.try_on_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for user photos
INSERT INTO storage.buckets (id, name, public) VALUES ('user-photos', 'user-photos', true);

CREATE POLICY "Users can upload their own photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own photos" ON storage.objects FOR SELECT USING (bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Public can view photos" ON storage.objects FOR SELECT USING (bucket_id = 'user-photos');

-- Insert sample products
INSERT INTO public.products (name, description, price, category, brand, sizes, colors, images) VALUES
('Classic Linen Blazer', 'Elegant linen blazer perfect for summer occasions', 189.00, 'blazers', 'Outfit AI Collection', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Navy', 'Beige', 'White'], ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500']),
('Silk Evening Dress', 'Stunning silk dress for special occasions', 299.00, 'dresses', 'Outfit AI Collection', ARRAY['XS', 'S', 'M', 'L'], ARRAY['Black', 'Burgundy', 'Emerald'], ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500']),
('Tailored Wool Trousers', 'Premium wool trousers with a perfect fit', 149.00, 'trousers', 'Outfit AI Collection', ARRAY['28', '30', '32', '34', '36'], ARRAY['Charcoal', 'Navy', 'Black'], ARRAY['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500']),
('Cotton Casual Shirt', 'Comfortable cotton shirt for everyday wear', 79.00, 'shirts', 'Outfit AI Collection', ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['White', 'Light Blue', 'Pink'], ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500']),
('Cashmere Sweater', 'Luxurious cashmere sweater for cooler days', 229.00, 'sweaters', 'Outfit AI Collection', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Cream', 'Gray', 'Camel'], ARRAY['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500']),
('Denim Jacket', 'Classic denim jacket with modern fit', 129.00, 'jackets', 'Outfit AI Collection', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Light Wash', 'Dark Wash', 'Black'], ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500']);