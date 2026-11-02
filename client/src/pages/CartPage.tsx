import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { getImageUrl } from "@/lib/api";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/formatCurrency";
import { useEffect } from "react";

const CartPage = () => {
  const { items, isLoading, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

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
    <main className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 md:pt-28 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-medium mb-8">
            Shopping Cart
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-medium mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added any items yet.
              </p>
              <Button variant="gold" onClick={() => navigate('/shop')}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div 
                    key={item._id} 
                    className="flex gap-4 p-4 bg-card rounded-xl border border-border"
                  >
                    <img 
                      src={getImageUrl(item.productId?.images?.[0]) || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200"} 
                      alt={item.productId?.name}
                      className="w-24 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{item.productId?.brand}</p>
                          <h3 className="font-medium">{item.productId?.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Size: {item.size} {item.color && `• ${item.color}`}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart.mutate(item._id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity.mutate({ 
                              itemId: item._id, 
                              quantity: item.quantity - 1 
                            })}
                            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity.mutate({ 
                              itemId: item._id, 
                              quantity: item.quantity + 1 
                            })}
                            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="font-semibold">
                          {formatPrice((item.productId?.price || 0) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl border border-border p-6 sticky top-28">
                  <h2 className="font-display text-xl font-medium mb-6">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (18% GST)</span>
                      <span>{formatPrice(cartTotal * 0.18)}</span>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(cartTotal * 1.18)}</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="gold" 
                    className="w-full" 
                    size="lg"
                    onClick={() => navigate('/checkout')}
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Free shipping on orders over ₹5000
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default CartPage;
