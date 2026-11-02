import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useOrder } from "@/hooks/useOrders";
import { getImageUrl } from "@/lib/api";
import api from "@/lib/api";
import { formatPrice } from "@/lib/formatCurrency";
import { format } from "date-fns";
import { Loader2, ChevronLeft, Package, CheckCircle2, Truck, MapPin, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const STATUS_STEPS = [
  'ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'ARRIVED_NEAR_AREA', 'OUT_FOR_DELIVERY', 'DELIVERED'
];

const statusIcon = (status: string) => {
  if (status === 'DELIVERED') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  if (['CANCELLED', 'DELIVERY_FAILED'].includes(status)) return <XCircle className="h-5 w-5 text-destructive" />;
  if (['SHIPPED', 'OUT_FOR_DELIVERY', 'ARRIVED_NEAR_AREA'].includes(status)) return <Truck className="h-5 w-5 text-accent" />;
  return <Package className="h-5 w-5 text-accent" />;
};

const formatStatus = (s: string) => s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: order, isLoading } = useOrder(id || '');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.put(`/orders/${id}/cancel`);
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order cancelled successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (loading || isLoading) {
    return (<main className="min-h-screen"><Navbar /><div className="pt-24 flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div></main>);
  }

  if (!order) {
    return (<main className="min-h-screen"><Navbar /><div className="pt-24 text-center py-20"><h2 className="font-display text-2xl mb-4">Order not found</h2><Button variant="gold" onClick={() => navigate('/profile')}>My Orders</Button></div><Footer /></main>);
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = ['CANCELLED', 'DELIVERY_FAILED', 'RETURNED'].includes(order.status);
  const canCancel = ['ORDER_PLACED', 'PROCESSING'].includes(order.status);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 md:pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ChevronLeft className="h-4 w-4" />Back to Profile
          </button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-medium">{order.orderNumber}</h1>
              <p className="text-muted-foreground text-sm">{format(new Date(order.createdAt), 'MMMM dd, yyyy • h:mm a')}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isCancelled ? 'destructive' : order.status === 'DELIVERED' ? 'default' : 'secondary'}>
                {formatStatus(order.status)}
              </Badge>
              {canCancel && (
                <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive hover:text-destructive-foreground" onClick={handleCancel}>
                  Cancel Order
                </Button>
              )}
            </div>
          </div>

          {/* Tracking Timeline */}
          {!isCancelled && (
            <div className="bg-card rounded-xl border border-border p-6 mb-6">
              <h2 className="font-medium mb-6">Order Tracking</h2>
              <div className="relative">
                <div className="flex items-start justify-between gap-2">
                  {STATUS_STEPS.map((step, i) => {
                    const completed = i <= currentStepIndex;
                    const current = i === currentStepIndex;
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${completed ? 'bg-accent border-accent' : 'border-border bg-background'} ${current ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''}`}>
                          {completed ? <CheckCircle2 className="h-4 w-4 text-accent-foreground" /> : <span className="text-xs text-muted-foreground">{i + 1}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 leading-tight">{formatStatus(step)}</p>
                        {i < STATUS_STEPS.length - 1 && (
                          <div className={`absolute top-4 h-0.5 transition-colors ${completed && i < currentStepIndex ? 'bg-accent' : 'bg-border'}`}
                            style={{ left: `calc(${(i + 0.5) * (100 / STATUS_STEPS.length)}%)`, width: `calc(${100 / STATUS_STEPS.length}%)` }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tracking History */}
          {order.trackingHistory && order.trackingHistory.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-6 mb-6">
              <h2 className="font-medium mb-4">Tracking History</h2>
              <div className="space-y-4">
                {[...order.trackingHistory].reverse().map((entry, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-0.5">{statusIcon(entry.status)}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{formatStatus(entry.status)}</p>
                      {entry.message && <p className="text-sm text-muted-foreground">{entry.message}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{format(new Date(entry.updatedAt), 'MMM dd, yyyy • h:mm a')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <h2 className="font-medium mb-4">Items Ordered</h2>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <img src={getImageUrl(item.productImage) || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=100"} alt={item.productName} className="w-16 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">Size: {item.size}{item.color ? ` • ${item.color}` : ''}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(order.totalAmount)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Payment</span><span className="text-orange-500">{order.paymentStatus} (Demo)</span></div>
              <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>{formatPrice(order.totalAmount)}</span></div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-medium mb-3 flex items-center gap-2"><MapPin className="h-4 w-4" />Shipping Address</h2>
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-muted-foreground">{order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}</p>
              <p className="text-sm text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default OrderDetailPage;
