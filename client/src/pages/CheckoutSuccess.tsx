import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { CheckCircle, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatCurrency";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('order');

  useEffect(() => {
    if (!authLoading && !user) { navigate('/auth'); return; }
    if (orderId && user) {
      api.get(`/orders/${orderId}`).then(({ data }) => {
        setOrder(data.order);
      }).catch(() => {}).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId, user, authLoading, navigate]);

  if (authLoading || loading) {
    return (<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto text-center px-4">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 animate-in zoom-in">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="font-display text-3xl font-medium mb-2">Order Placed!</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for your order. Your order has been placed successfully.
        </p>
        {order && (
          <div className="bg-card rounded-xl border border-border p-6 text-left mb-6">
            <p className="text-sm text-muted-foreground">Order Number</p>
            <p className="font-semibold text-lg mb-3">{order.orderNumber}</p>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="font-semibold">{formatPrice(order.totalAmount)}</p>
            <p className="text-sm text-muted-foreground mt-3">Payment Status</p>
            <p className="text-sm font-medium text-orange-500">SIMULATED (Demo)</p>
            <p className="text-sm text-muted-foreground mt-3">Items</p>
            {order.items?.map((item: any, i: number) => (
              <p key={i} className="text-sm">{item.productName} × {item.quantity}</p>
            ))}
          </div>
        )}
        <div className="space-y-3">
          <Button variant="gold" className="w-full" onClick={() => navigate('/profile')}>
            <Package className="h-4 w-4 mr-2" />View Orders
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/shop')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
