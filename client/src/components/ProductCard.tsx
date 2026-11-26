import { useState } from "react";
import { Heart, ShoppingBag, Star, Eye, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatCurrency";
import { getImageUrl } from "@/lib/api";

export interface ProductCardItem {
  _id: string;
  name: string;
  brand: string | null;
  price: number;
  images: string[] | null;
  category: string;
  sizes: string[];
  colors: string[] | null;
  description?: string | null;
  stockQuantity?: number | null;
  averageRating?: number;
  reviewCount?: number;
}

interface ProductCardProps {
  product: ProductCardItem;
  onQuickView?: (product: ProductCardItem) => void;
  onAddToCart?: (product: ProductCardItem, size: string, color?: string) => void;
  showRating?: boolean;
  rating?: number;
  reviewCount?: number;
}

const COLOR_MAP: Record<string, string> = {
  black: "#171717",
  white: "#f8fafc",
  navy: "#1e3a5f",
  gray: "#6b7280",
  beige: "#d6c7b2",
  brown: "#6b4423",
  cream: "#f3ead8",
  charcoal: "#374151",
  burgundy: "#6d1d34",
  olive: "#556b2f",
  camel: "#c19a6b",
  khaki: "#b5a676",
  emerald: "#166534",
  "light blue": "#93c5fd",
  pink: "#f472b6",
  "floral pink": "#ec4899",
  "floral blue": "#60a5fa",
  "light wash": "#7da1c4",
  "dark wash": "#1e3a5f",
  red: "#dc2626",
};

const getSwatchColor = (color: string): string => {
  return COLOR_MAP[color.toLowerCase()] || color.toLowerCase();
};

const ProductCard = ({
  product,
  onQuickView,
  onAddToCart,
  showRating = true,
  rating,
  reviewCount,
}: ProductCardProps) => {
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const defaultSize =
    product.sizes?.includes("M") ? "M" : product.sizes?.[0] || "Standard";
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [justAdded, setJustAdded] = useState(false);

  const inWishlist = isInWishlist(product._id);
  const effectiveRating = rating ?? product.averageRating ?? 0;
  const effectiveReviewCount = reviewCount ?? product.reviewCount ?? 0;
  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock =
    typeof product.stockQuantity === "number" &&
    product.stockQuantity > 0 &&
    product.stockQuantity <= 10;

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to add to wishlist");
      navigate("/auth");
      return;
    }
    await toggleWishlist(product._id);
  };

  const handleTryOn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to use virtual try-on");
      navigate("/auth");
      return;
    }
    navigate(`/try-on?product=${product._id}`);
  };

  const handleAddToCartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    if (!user) {
      toast.error("Please sign in to add items to cart");
      navigate("/auth");
      return;
    }

    const chosenColor = product.colors?.[0] || undefined;

    if (onAddToCart) {
      onAddToCart(product, selectedSize, chosenColor);
      return;
    }

    try {
      await addToCart.mutateAsync({
        productId: product._id,
        size: selectedSize,
        color: chosenColor,
        quantity: 1,
      });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1400);
    } catch {
      // error toast handled inside useCart
    }
  };

  const imageUrl =
    getImageUrl(product.images?.[0]) ||
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600";

  return (
    <div className="group relative bg-card rounded-2xl border border-border/50 overflow-hidden shadow-card hover:shadow-elegant hover:border-accent/35 transition-all duration-350 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted/40">
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
        />

        {/* Subtle Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350" />

        {/* Top-left Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <Badge
            variant="secondary"
            className="bg-background/88 backdrop-blur-sm text-foreground text-[10px] capitalize font-semibold border-0 shadow-sm uppercase tracking-wide px-2"
          >
            {product.category}
          </Badge>
          {isOutOfStock && (
            <Badge variant="destructive" className="text-[11px] shadow-sm">
              Out of Stock
            </Badge>
          )}
          {isLowStock && (
            <Badge className="bg-amber-500 text-white hover:bg-amber-500 text-[11px] shadow-sm">
              Only {product.stockQuantity} left
            </Badge>
          )}
        </div>

        {/* Top-right Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button
            onClick={handleWishlistClick}
            title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            className={cn(
              "w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200 shadow-md border",
              inWishlist
                ? "bg-accent text-accent-foreground border-accent/50"
                : "bg-background/88 hover:bg-background text-muted-foreground hover:text-foreground border-border/40"
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", inWishlist && "fill-current")} />
          </button>
          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              title="Quick View"
              className="w-8 h-8 rounded-full bg-background/88 backdrop-blur-sm border border-border/40 flex items-center justify-center hover:bg-background transition-all duration-200 shadow-md opacity-0 group-hover:opacity-100"
            >
              <Eye className="h-3.5 w-3.5 text-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Product Info + Actions */}
      <div className="p-3.5 md:p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-accent uppercase tracking-widest font-semibold truncate">
              {product.brand || "FitKart"}
            </p>
            {showRating && effectiveRating > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                <span className="text-xs font-medium">{effectiveRating.toFixed(1)}</span>
                <span className="text-[11px] text-muted-foreground">({effectiveReviewCount})</span>
              </div>
            )}
          </div>

          <h3 className="font-medium text-sm text-foreground group-hover:text-accent transition-colors line-clamp-1 leading-snug">
            {product.name}
          </h3>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="font-semibold text-base sm:text-lg">
              {formatPrice(product.price)}
            </span>
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-1">
                {product.colors.slice(0, 4).map((color, i) => (
                  <span
                    key={i}
                    title={color}
                    className="w-3.5 h-3.5 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: getSwatchColor(color) }}
                  />
                ))}
                {product.colors.length > 4 && (
                  <span className="text-[11px] text-muted-foreground">
                    +{product.colors.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quick Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div
              className="flex flex-wrap items-center gap-1 pt-1"
              onClick={(e) => e.stopPropagation()}
            >
              {product.sizes.slice(0, 5).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "px-2 py-0.5 text-[11px] font-medium rounded border transition-colors",
                    selectedSize === size
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/40"
                  )}
                >
                  {size}
                </button>
              ))}
              {product.sizes.length > 5 && (
                <span className="text-[11px] text-muted-foreground px-1">
                  +{product.sizes.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons: Add to Cart + AI Try-On */}
        <div className="grid grid-cols-2 gap-1.5 pt-2.5 border-t border-border/50">
          <Button
            size="sm"
            variant="default"
            disabled={isOutOfStock || addToCart.isPending}
            onClick={handleAddToCartClick}
            className="w-full text-xs font-semibold px-2 h-8 rounded-lg"
          >
            {justAdded ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Added!
              </>
            ) : (
              <>
                <ShoppingBag className="h-3 w-3 mr-1" />
                {isOutOfStock ? "Sold Out" : "Add to Cart"}
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="gold"
            onClick={handleTryOn}
            className="w-full text-xs font-semibold px-2 h-8 rounded-lg shadow-sm"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Try-On
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
