import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useOrder } from "@/hooks/useOrders";
import api, { getImageUrl } from "@/lib/api";
import { formatPrice } from "@/lib/formatCurrency";
import {
  ORDER_STATUS_STEPS,
  VALID_ORDER_TRANSITIONS,
  formatOrderStatus,
  getOrderStatusBadgeClass,
} from "@/lib/orderStatus";
import { format } from "date-fns";
import {
  Loader2,
  ChevronLeft,
  Package,
  CheckCircle2,
  Truck,
  MapPin,
  XCircle,
  CreditCard,
  User as UserIcon,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const statusIcon = (status: string) => {
  if (status === "DELIVERED") return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  if (["CANCELLED", "DELIVERY_FAILED"].includes(status))
    return <XCircle className="h-5 w-5 text-destructive" />;
  if (["SHIPPED", "OUT_FOR_DELIVERY", "ARRIVED_NEAR_AREA"].includes(status))
    return <Truck className="h-5 w-5 text-accent" />;
  return <Package className="h-5 w-5 text-accent" />;
};

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: order, isLoading } = useOrder(id || "");
  const queryClient = useQueryClient();

  const [nextStatus, setNextStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (order) {
      const transitions = VALID_ORDER_TRANSITIONS[order.status] || [];
      setNextStatus(transitions[0] || "");
    }
  }, [order]);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await api.put(`/orders/${id}/cancel`);
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order cancelled successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleAdminStatusUpdate = async () => {
    if (!nextStatus) return;
    setIsUpdatingStatus(true);
    try {
      await api.put(`/orders/${id}/status`, {
        status: nextStatus,
        message: statusMessage.trim() || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setStatusMessage("");
      toast.success(`Order status updated to ${formatOrderStatus(nextStatus)}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update order status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading || isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center py-20">
          <h2 className="font-display text-2xl mb-4">Order not found</h2>
          <Button variant="gold" onClick={() => navigate("/profile?tab=orders")}>
            My Orders
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  const currentStepIndex = ORDER_STATUS_STEPS.indexOf(order.status as any);
  const isTerminalNegative = ["CANCELLED", "DELIVERY_FAILED", "RETURNED", "RETURN_REQUESTED"].includes(
    order.status
  );
  const canCancel = ["ORDER_PLACED", "CONFIRMED", "PROCESSING"].includes(order.status);
  const isAdmin = user?.role === "admin";
  const validTransitions = VALID_ORDER_TRANSITIONS[order.status] || [];
  const totalItemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 md:pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <button
            onClick={() => navigate(isAdmin ? "/admin" : "/profile?tab=orders")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {isAdmin ? "Back to Dashboard" : "Back to Order History"}
          </button>

          {/* Header */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-2xl md:text-3xl font-medium">
                    {order.orderNumber}
                  </h1>
                  <Badge
                    variant="outline"
                    className={`font-medium ${getOrderStatusBadgeClass(order.status)}`}
                  >
                    {formatOrderStatus(order.status)}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Placed {format(new Date(order.createdAt), "MMM dd, yyyy • h:mm a")}
                  </span>
                  <span>•</span>
                  <span>
                    {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {canCancel && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/40 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        Cancel Order
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Order <span className="font-mono font-medium">{order.orderNumber}</span> will
                          be cancelled and reserved stock will be released. This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Order</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancel}
                          disabled={isCancelling}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isCancelling ? "Cancelling..." : "Yes, Cancel Order"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </div>

          {/* Admin Status Management Panel */}
          {isAdmin && validTransitions.length > 0 && (
            <div className="bg-card rounded-2xl border border-accent/30 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <h2 className="font-medium">Admin Status Management</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Next Status</label>
                  <Select value={nextStatus} onValueChange={setNextStatus}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {validTransitions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {formatOrderStatus(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Tracking Note (Optional)
                  </label>
                  <div className="flex gap-2">
                    <Textarea
                      rows={1}
                      className="bg-background min-h-[40px]"
                      placeholder="Add shipment or status note..."
                      value={statusMessage}
                      onChange={(e) => setStatusMessage(e.target.value)}
                    />
                    <Button
                      variant="gold"
                      onClick={handleAdminStatusUpdate}
                      disabled={!nextStatus || isUpdatingStatus}
                      className="shrink-0"
                    >
                      {isUpdatingStatus ? "Updating..." : "Update Status"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tracking Timeline */}
          {!isTerminalNegative && (
            <div className="bg-card rounded-2xl border border-border p-6 mb-6 overflow-x-auto">
              <h2 className="font-medium mb-6">Order Progress</h2>
              <div className="relative min-w-[560px]">
                <div className="flex items-start justify-between gap-2">
                  {ORDER_STATUS_STEPS.map((step, i) => {
                    const completed = i <= currentStepIndex;
                    const current = i === currentStepIndex;
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center text-center relative">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
                            completed
                              ? "bg-accent border-accent text-accent-foreground"
                              : "border-border bg-background text-muted-foreground"
                          } ${current ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""}`}
                        >
                          {completed ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-xs">{i + 1}</span>
                          )}
                        </div>
                        <p
                          className={`text-xs mt-2 leading-tight ${
                            completed ? "text-foreground font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {formatOrderStatus(step)}
                        </p>
                        {i < ORDER_STATUS_STEPS.length - 1 && (
                          <div
                            className={`absolute top-4 left-1/2 w-full h-0.5 transition-colors ${
                              completed && i < currentStepIndex ? "bg-accent" : "bg-border"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Details Grid: Customer + Shipping + Payment */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Customer Info */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-medium mb-3 flex items-center gap-2 text-sm">
                <UserIcon className="h-4 w-4 text-accent" /> Customer
              </h2>
              <p className="font-medium text-sm">
                {order.userId?.fullName || order.shippingAddress?.fullName || "Customer"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{order.userId?.email || "—"}</p>
              {order.shippingAddress?.phone && (
                <p className="text-xs text-muted-foreground mt-1">{order.shippingAddress.phone}</p>
              )}
            </div>

            {/* Shipping Address */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-medium mb-3 flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-accent" /> Delivery Address
              </h2>
              {order.shippingAddress ? (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="text-foreground font-medium text-sm">
                    {order.shippingAddress.fullName}
                  </p>
                  <p>
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2
                      ? `, ${order.shippingAddress.addressLine2}`
                      : ""}
                  </p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No shipping address recorded</p>
              )}
            </div>

            {/* Payment Info */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-medium mb-3 flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-accent" /> Payment Summary
              </h2>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium">{order.paymentMethod || "DEMO"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary" className="text-xs">
                    {order.paymentStatus || "SIMULATED"}
                  </Badge>
                </div>
                <div className="flex justify-between pt-2 border-t border-border text-sm font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <h2 className="font-medium mb-4">Items Ordered</h2>
            <div className="divide-y divide-border">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <img
                    src={
                      getImageUrl(item.productImage) ||
                      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=100"
                    }
                    alt={item.productName}
                    className="w-16 h-20 object-cover rounded-lg border border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Size: {item.size || "Standard"}
                      {item.color ? ` • ${item.color}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-emerald-600 dark:text-emerald-400">Free</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Tracking History */}
          {order.trackingHistory && order.trackingHistory.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="font-medium mb-4">Activity & Tracking History</h2>
              <div className="space-y-4">
                {[...order.trackingHistory].reverse().map((entry, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-0.5">{statusIcon(entry.status)}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{formatOrderStatus(entry.status)}</p>
                      {entry.message && (
                        <p className="text-sm text-muted-foreground">{entry.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(entry.updatedAt), "MMM dd, yyyy • h:mm a")}
                        {entry.updatedBy?.fullName ? ` • Updated by ${entry.updatedBy.fullName}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default OrderDetailPage;
