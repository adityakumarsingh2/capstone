import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/useCart";
import { useAuth, Address } from "@/hooks/useAuth";
import { getImageUrl } from "@/lib/api";
import api from "@/lib/api";
import { formatPrice } from "@/lib/formatCurrency";
import { toast } from "sonner";
import { Loader2, MapPin, Plus, Check } from "lucide-react";

const CheckoutPage = () => {
  const { items, isLoading: cartLoading, cartTotal, clearCart } = useCart();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', label: 'Home' });

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.addresses?.length) {
      const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddressId(def._id);
    } else {
      setShowAddressForm(true);
    }
  }, [user]);

  const handleAddAddress = async () => {
    if (!addressForm.fullName || !addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.postalCode) {
      toast.error('Please fill all required address fields');
      return;
    }
    try {
      const { data } = await api.post('/profile/addresses', { ...addressForm, isDefault: true });
      await refreshUser();
      const newAddr = data.addresses[data.addresses.length - 1];
      setSelectedAddressId(newAddr._id);
      setShowAddressForm(false);
      toast.success('Address added');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    const selAddr = user?.addresses?.find(a => a._id === selectedAddressId);
    if (!selAddr && !showAddressForm) {
      toast.error('Please select or add a shipping address');
      return;
    }

    let shippingAddress = selAddr;
    if (showAddressForm && !selAddr) {
      // Use form values directly
      if (!addressForm.fullName || !addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.postalCode) {
        toast.error('Please fill all required address fields');
        return;
      }
      shippingAddress = addressForm as any;
    }

    setIsPlacingOrder(true);
    try {
      const { data } = await api.post('/orders', { shippingAddress });
      if (data.success) {
        toast.success('Order placed successfully!');
        navigate(`/checkout/success?order=${data.order._id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (authLoading || cartLoading) {
    return (<main className="min-h-screen"><Navbar /><div className="pt-24 flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div></main>);
  }

  if (!items.length) {
    return (<main className="min-h-screen"><Navbar /><div className="pt-24 text-center py-20"><h2 className="font-display text-2xl mb-4">Your cart is empty</h2><Button variant="gold" onClick={() => navigate('/shop')}>Continue Shopping</Button></div><Footer /></main>);
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 md:pt-28 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-medium mb-8">Checkout</h1>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-display text-xl font-medium mb-4 flex items-center gap-2"><MapPin className="h-5 w-5" />Shipping Address</h2>
                {user?.addresses && user.addresses.length > 0 && !showAddressForm && (
                  <div className="space-y-3">
                    {user.addresses.map((addr: Address) => (
                      <button key={addr._id} onClick={() => setSelectedAddressId(addr._id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedAddressId === addr._id ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{addr.label || 'Address'}</span>
                          {selectedAddressId === addr._id && <Check className="h-4 w-4 text-accent" />}
                        </div>
                        <p className="text-sm mt-1">{addr.fullName}</p>
                        <p className="text-sm text-muted-foreground">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                        <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.postalCode}</p>
                      </button>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setShowAddressForm(true)}><Plus className="h-4 w-4 mr-2" />Add New Address</Button>
                  </div>
                )}
                {showAddressForm && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Full Name *</Label><Input value={addressForm.fullName} onChange={e => setAddressForm(p => ({...p, fullName: e.target.value}))} /></div>
                      <div><Label>Phone</Label><Input value={addressForm.phone} onChange={e => setAddressForm(p => ({...p, phone: e.target.value}))} /></div>
                    </div>
                    <div><Label>Address Line 1 *</Label><Input value={addressForm.addressLine1} onChange={e => setAddressForm(p => ({...p, addressLine1: e.target.value}))} /></div>
                    <div><Label>Address Line 2</Label><Input value={addressForm.addressLine2} onChange={e => setAddressForm(p => ({...p, addressLine2: e.target.value}))} /></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div><Label>City *</Label><Input value={addressForm.city} onChange={e => setAddressForm(p => ({...p, city: e.target.value}))} /></div>
                      <div><Label>State *</Label><Input value={addressForm.state} onChange={e => setAddressForm(p => ({...p, state: e.target.value}))} /></div>
                      <div><Label>Postal Code *</Label><Input value={addressForm.postalCode} onChange={e => setAddressForm(p => ({...p, postalCode: e.target.value}))} /></div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="gold" onClick={handleAddAddress}>Save Address</Button>
                      {user?.addresses?.length ? <Button variant="outline" onClick={() => setShowAddressForm(false)}>Cancel</Button> : null}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-display text-xl font-medium mb-4">Order Items ({items.length})</h2>
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item._id} className="flex gap-3 py-3 border-b border-border last:border-0">
                      <img src={getImageUrl(item.productId?.images?.[0])} alt="" className="w-16 h-20 object-cover rounded-lg" />
                      <div className="flex-1">
                        <p className="font-medium">{item.productId?.name}</p>
                        <p className="text-sm text-muted-foreground">Size: {item.size}{item.color ? ` • ${item.color}` : ''} • Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatPrice((item.productId?.price || 0) * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-display text-xl font-medium mb-4">Payment Method</h2>
                <div className="p-4 rounded-lg border-2 border-accent bg-accent/5">
                  <p className="font-medium">Demo Payment</p>
                  <p className="text-sm text-muted-foreground">No real payment is processed. This is a simulated checkout.</p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="bg-card rounded-xl border border-border p-6 sticky top-28">
                <h2 className="font-display text-xl font-medium mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal ({items.length} items)</span><span>{formatPrice(cartTotal)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span>Free</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax (18% GST)</span><span>{formatPrice(cartTotal * 0.18)}</span></div>
                  <div className="border-t border-border pt-3"><div className="flex justify-between font-semibold text-lg"><span>Total</span><span>{formatPrice(cartTotal * 1.18)}</span></div></div>
                </div>
                <Button variant="gold" className="w-full" size="lg" onClick={handlePlaceOrder} disabled={isPlacingOrder || (!selectedAddressId && !showAddressForm)}>
                  {isPlacingOrder ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Placing Order...</> : 'Place Order'}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">By placing this order you agree to our Terms of Service</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default CheckoutPage;
