import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatCurrency";

interface Product {
  _id: string;
  name: string;
  brand: string | null;
  price: number;
  images: string[] | null;
  category: string;
  sizes: string[];
  colors: string[] | null;
  description?: string | null;
}

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  showRating?: boolean;
  rating?: number;
  reviewCount?: number;
}

const ProductCard = ({ 
  product, 
  onQuickView, 
  onAddToCart,
  showRating = true,
  rating = 0,
  reviewCount = 0
}: ProductCardProps) => {
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const inWishlist = isInWishlist(product._id);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to add to wishlist");
      navigate('/auth');
      return;
    }
    await toggleWishlist(product._id);
  };

  const handleTryOn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to use virtual try-on");
      navigate('/auth');
      return;
    }
    navigate(`/try-on?product=${product._id}`);
  };

  return (
    <div className="group relative">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted mb-4">
        <img
          src={product.images?.[0] || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
          <button 
            onClick={handleWishlistClick}
            className={cn(
              "w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-lg",
              inWishlist 
                ? "bg-accent text-accent-foreground" 
                : "bg-background/80 hover:bg-background text-foreground"
            )}
          >
            <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
          </button>
          {onQuickView && (
            <button 
              onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
              className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center hover:bg-background transition-all duration-300 shadow-lg"
            >
              <Eye className="h-5 w-5 text-foreground" />
            </button>
          )}
          {onAddToCart && (
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
              className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center hover:bg-background transition-all duration-300 shadow-lg"
            >
              <ShoppingBag className="h-5 w-5 text-foreground" />
            </button>
          )}
        </div>

        {/* Try On Button */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          <Button 
            variant="gold" 
            className="w-full shadow-xl"
            onClick={handleTryOn}
          >
            Virtual Try-On
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          {product.brand}
        </p>
        <h3 className="font-medium text-foreground group-hover:text-accent transition-colors duration-300 line-clamp-1">
          {product.name}
        </h3>
        
        {/* Rating */}
        {showRating && rating > 0 && (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={cn(
                  "h-3.5 w-3.5",
                  i < Math.floor(rating) 
                    ? "fill-accent text-accent" 
                    : "text-muted-foreground/30"
                )} 
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">({reviewCount})</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg">{formatPrice(product.price)}</span>
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1">
              {product.colors.slice(0, 4).map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border-2 border-background shadow-sm"
                  style={{ backgroundColor: color.toLowerCase() }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-muted-foreground">+{product.colors.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
