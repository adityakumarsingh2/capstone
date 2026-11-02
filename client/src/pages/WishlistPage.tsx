import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { getImageUrl } from "@/lib/api";
import { Heart, Loader2, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/formatCurrency";

const WishlistPage = () => {
  const { items, isLoading, removeFromWishlist } = useWishlist();
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleAddToCart = (item: typeof items[0]) => {
    const productId = item.productId?._id;
    const size = selectedSizes[productId];
    if (!size) {
      toast.error("Please select a size");
      return;
    }
    addToCart.mutate({ productId, size });
  };

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 md:pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-medium">My Wishlist</h1>
            <span className="text-muted-foreground">{items.length} items</span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-medium mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">Save your favorite items to view them later</p>
              <Button variant="gold" onClick={() => navigate('/shop')}>Start Shopping</Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => {
                const product = item.productId;
                const productId = product?._id;
                return (
                  <div key={item._id} className="group bg-card rounded-2xl border border-border overflow-hidden hover-lift">
                    <div className="relative aspect-[3/4] bg-muted">
                      <img 
                        src={getImageUrl(product?.images?.[0]) || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500"} 
                        alt={product?.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <button
                        onClick={() => removeFromWishlist.mutate(productId)}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-lg"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">{product?.brand}</p>
                        <h3 className="font-medium">{product?.name}</h3>
                        <p className="font-semibold text-lg mt-1">{formatPrice(product?.price || 0)}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Select Size</p>
                        <div className="flex flex-wrap gap-1">
                          {product?.sizes?.map((size) => (
                            <button
                              key={size}
                              onClick={() => setSelectedSizes(prev => ({ ...prev, [productId]: size }))}
                              className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                                selectedSizes[productId] === size
                                  ? "border-accent bg-accent/10 text-accent"
                                  : "border-border hover:border-accent/50"
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button 
                        variant="gold" 
                        className="w-full" 
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default WishlistPage;
