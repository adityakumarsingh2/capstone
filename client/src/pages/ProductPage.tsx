import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewSection from "@/components/ReviewSection";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProduct } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useReviews } from "@/hooks/useReviews";
import { getImageUrl } from "@/lib/api";
import { 
  Heart, Minus, Plus, Star, Truck, Shield, RotateCcw, 
  ChevronLeft, ChevronRight, Loader2, Share2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatCurrency";

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { averageRating, reviewCount } = useReviews(id);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: product, isLoading } = useProduct(id || '');

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 text-center py-20">
          <h1 className="font-display text-2xl">Product not found</h1>
          <Button variant="gold" className="mt-4" onClick={() => navigate('/shop')}>
            Back to Shop
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  const images = product.images?.length ? product.images.map(img => getImageUrl(img)) : [
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800"
  ];

  const productId = product._id;

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
      productId,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
  };

  const handleWishlistClick = async () => {
    if (!user) {
      toast.error("Please sign in to add to wishlist");
      navigate('/auth');
      return;
    }
    await toggleWishlist(productId);
  };

  const inWishlist = isInWishlist(productId);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 md:pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm">
            <ol className="flex items-center gap-2 text-muted-foreground">
              <li><button onClick={() => navigate('/')} className="hover:text-foreground">Home</button></li>
              <li>/</li>
              <li><button onClick={() => navigate('/shop')} className="hover:text-foreground">Shop</button></li>
              <li>/</li>
              <li className="text-foreground">{product.name}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                <img 
                  src={images[currentImageIndex]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={() => setCurrentImageIndex(i => i === 0 ? images.length - 1 : i - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button 
                      onClick={() => setCurrentImageIndex(i => i === images.length - 1 ? 0 : i + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Stock badge */}
                {product.stockQuantity !== null && product.stockQuantity <= 0 && (
                  <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-medium">Out of Stock</div>
                )}
                {product.stockQuantity !== null && product.stockQuantity > 0 && product.stockQuantity <= 10 && (
                  <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">Only {product.stockQuantity} left</div>
                )}
              </div>
              
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={cn(
                        "w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all",
                        i === currentImageIndex ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">{product.brand}</p>
                <h1 className="font-display text-3xl md:text-4xl font-medium mb-3">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "h-5 w-5",
                          i < Math.floor(averageRating) 
                            ? "fill-accent text-accent" 
                            : "text-muted-foreground/30"
                        )} 
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground">
                    {averageRating.toFixed(1)} ({reviewCount} reviews)
                  </span>
                </div>

                <p className="font-display text-4xl font-semibold">{formatPrice(product.price)}</p>
              </div>

              {product.description && (
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              )}

              {/* Size Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-medium">Select Size</label>
                  <button className="text-sm text-accent hover:underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes?.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "px-6 py-3 rounded-xl border text-sm font-medium transition-all duration-200",
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
                  <label className="font-medium mb-3 block">Color: {selectedColor}</label>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "w-10 h-10 rounded-full border-2 transition-all duration-200",
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
                <label className="font-medium mb-3 block">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-4 hover:bg-muted transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-14 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="p-4 hover:bg-muted transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="gold" 
                  className="flex-1" 
                  size="xl"
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending || (product.stockQuantity !== null && product.stockQuantity <= 0)}
                >
                  {product.stockQuantity !== null && product.stockQuantity <= 0 ? "Out of Stock" : addToCart.isPending ? "Adding..." : "Add to Cart"}
                </Button>
                <Button 
                  variant="outline" 
                  size="xl"
                  onClick={handleWishlistClick}
                  className={cn(inWishlist && "border-accent text-accent")}
                >
                  <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
                </Button>
                <Button variant="outline" size="xl">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Virtual Try-On */}
              <Button 
                variant="hero-outline" 
                className="w-full" 
                size="lg"
                onClick={() => {
                  if (!user) {
                    toast.error("Please sign in to use virtual try-on");
                    navigate('/auth');
                    return;
                  }
                  navigate(`/try-on?product=${productId}`);
                }}
              >
                ✨ Try On Virtually
              </Button>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <Truck className="h-6 w-6 mx-auto mb-2 text-accent" />
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On orders over ₹5000</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <RotateCcw className="h-6 w-6 mx-auto mb-2 text-accent" />
                  <p className="text-sm font-medium">30-Day Returns</p>
                  <p className="text-xs text-muted-foreground">Easy returns</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-accent" />
                  <p className="text-sm font-medium">Secure Payment</p>
                  <p className="text-xs text-muted-foreground">100% protected</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0">
              <TabsTrigger 
                value="description" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6 py-4"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6 py-4"
              >
                Reviews ({reviewCount})
              </TabsTrigger>
              <TabsTrigger 
                value="shipping"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-6 py-4"
              >
                Shipping & Returns
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="pt-8">
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description || "Experience the perfect blend of style and comfort with this premium piece."}
                </p>
                <h3 className="font-display text-lg font-medium mt-6 mb-3">Features</h3>
                <ul className="text-muted-foreground space-y-2">
                  <li>Premium quality materials</li>
                  <li>Designed for comfort and style</li>
                  <li>Versatile for various occasions</li>
                  <li>Easy care instructions</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="pt-8">
              <ReviewSection productId={productId} />
            </TabsContent>
            
            <TabsContent value="shipping" className="pt-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-display text-lg font-medium mb-4">Shipping Information</h3>
                  <ul className="text-muted-foreground space-y-3">
                    <li className="flex items-start gap-3"><Truck className="h-5 w-5 text-accent mt-0.5" /><span>Free standard shipping on orders over ₹5000</span></li>
                    <li className="flex items-start gap-3"><Truck className="h-5 w-5 text-accent mt-0.5" /><span>Express shipping available (2-3 business days)</span></li>
                    <li className="flex items-start gap-3"><Truck className="h-5 w-5 text-accent mt-0.5" /><span>International shipping to select countries</span></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium mb-4">Return Policy</h3>
                  <ul className="text-muted-foreground space-y-3">
                    <li className="flex items-start gap-3"><RotateCcw className="h-5 w-5 text-accent mt-0.5" /><span>30-day return window for unworn items</span></li>
                    <li className="flex items-start gap-3"><RotateCcw className="h-5 w-5 text-accent mt-0.5" /><span>Free returns on all orders</span></li>
                    <li className="flex items-start gap-3"><RotateCcw className="h-5 w-5 text-accent mt-0.5" /><span>Full refund processed within 5-7 business days</span></li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default ProductPage;
