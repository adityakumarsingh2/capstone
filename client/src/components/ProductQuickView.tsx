import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Minus, Plus, Star, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useReviews } from "@/hooks/useReviews";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatCurrency";

interface Product {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  images: string[] | null;
  category: string;
  sizes: string[];
  colors: string[] | null;
  description?: string | null;
}

interface ProductQuickViewProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductQuickView = ({ product, open, onOpenChange }: ProductQuickViewProps) => {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { averageRating, reviewCount } = useReviews(product?.id);
  const navigate = useNavigate();

  if (!product) return null;

  const images = product.images?.length ? product.images : [
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800"
  ];

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please sign in to add items to cart");
      navigate('/auth');
      return;
    }
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addToCart.mutate({
      productId: product.id,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    onOpenChange(false);
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
  };

  const handleWishlistClick = async () => {
    if (!user) {
      toast.error("Please sign in to add to wishlist");
      navigate('/auth');
      return;
    }
    await toggleWishlist(product.id);
  };

  const inWishlist = isInWishlist(product.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Image Gallery */}
          <div className="relative bg-muted aspect-square md:aspect-auto">
            <img 
              src={images[currentImageIndex]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentImageIndex(i => i === 0 ? images.length - 1 : i - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setCurrentImageIndex(i => i === images.length - 1 ? 0 : i + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        i === currentImageIndex ? "bg-accent w-6" : "bg-background/60"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">{product.brand}</p>
              <h2 className="font-display text-2xl md:text-3xl font-medium mb-2">{product.name}</h2>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "h-4 w-4",
                        i < Math.floor(averageRating) 
                          ? "fill-accent text-accent" 
                          : "text-muted-foreground/30"
                      )} 
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {averageRating.toFixed(1)} ({reviewCount} reviews)
                </span>
              </div>

              <p className="font-display text-3xl font-semibold">{formatPrice(product.price)}</p>
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Select Size</label>
                <button className="text-sm text-accent hover:underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200",
                      selectedSize === size
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border hover:border-accent/50"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-3 block">Color: {selectedColor}</label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all duration-200",
                        selectedColor === color
                          ? "border-accent ring-2 ring-accent ring-offset-2 ring-offset-background"
                          : "border-border hover:border-accent/50"
                      )}
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium mb-3 block">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-3 hover:bg-muted transition-colors rounded-l-lg"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-3 hover:bg-muted transition-colors rounded-r-lg"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="gold" 
                className="flex-1" 
                size="lg"
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
              >
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleWishlistClick}
                className={cn(inWishlist && "border-accent text-accent")}
              >
                <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <Truck className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Free Shipping</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">30-Day Returns</p>
              </div>
              <div className="text-center">
                <Shield className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Secure Payment</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;
