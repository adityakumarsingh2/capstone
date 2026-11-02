-- Create wishlist table
CREATE TABLE public.wishlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on wishlist
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for wishlist
CREATE POLICY "Users can view their own wishlist"
ON public.wishlist_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their wishlist"
ON public.wishlist_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their wishlist"
ON public.wishlist_items FOR DELETE
USING (auth.uid() = user_id);

-- Create product reviews table
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  verified_purchase BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for reviews
CREATE POLICY "Reviews are viewable by everyone"
ON public.product_reviews FOR SELECT
USING (true);

CREATE POLICY "Users can create their own reviews"
ON public.product_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.product_reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.product_reviews FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at on reviews
CREATE TRIGGER update_product_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();