-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('customer', 'seller');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own role"
ON public.user_roles
FOR UPDATE
USING (auth.uid() = user_id);

-- Function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Function to check if user is seller
CREATE OR REPLACE FUNCTION public.is_seller(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'seller'
  )
$$;

-- Add seller_id to products table
ALTER TABLE public.products ADD COLUMN seller_id UUID REFERENCES auth.users(id);

-- Add policy for sellers to insert products
CREATE POLICY "Sellers can insert their own products"
ON public.products
FOR INSERT
WITH CHECK (
  public.is_seller(auth.uid()) AND auth.uid() = seller_id
);

-- Add policy for sellers to update their own products
CREATE POLICY "Sellers can update their own products"
ON public.products
FOR UPDATE
USING (auth.uid() = seller_id);

-- Add policy for sellers to delete their own products
CREATE POLICY "Sellers can delete their own products"
ON public.products
FOR DELETE
USING (auth.uid() = seller_id);

-- Trigger to create default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'customer');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage policies for product images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Sellers can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND public.is_seller(auth.uid())
);

CREATE POLICY "Sellers can update their product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND public.is_seller(auth.uid())
);

CREATE POLICY "Sellers can delete their product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND public.is_seller(auth.uid())
);