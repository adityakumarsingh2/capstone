import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  MapPin,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import api, { getImageUrl } from "@/lib/api";
import { formatPrice } from "@/lib/formatCurrency";
import {
  ORDER_CATEGORIES,
  OrderCategory,
  VALID_ORDER_TRANSITIONS,
  formatOrderStatus,
  getOrderStatusBadgeClass,
} from "@/lib/orderStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderManagementProps {
  orders: any[];
  onRefresh: () => Promise<void>;
}

type SortOption = "newest" | "oldest" | "amount_desc" | "amount_asc";

const OrderManagement = ({ orders, onRefresh }: OrderManagementProps) => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<OrderCategory>("ALL");
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Status update modal state
  const [statusModalOrder, setStatusModalOrder] = useState<any | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const categoryCounts = useMemo(() => {
    const counts: Record<OrderCategory, number> = {
      ALL: orders.length,
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    for (const order of orders) {
      for (const cat of ORDER_CATEGORIES) {
        if (cat.key !== "ALL" && cat.statuses.includes(order.status)) {
          counts[cat.key]++;
        }
      }
    }
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const activeCat = ORDER_CATEGORIES.find((c) => c.key === category);
    const q = search.trim().toLowerCase();

    const result = orders.filter((order) => {
      if (activeCat && activeCat.statuses.length > 0 && !activeCat.statuses.includes(order.status)) {
        return false;
      }
      if (paymentFilter !== "ALL" && (order.paymentStatus || "").toUpperCase() !== paymentFilter) {
        return false;
      }
      if (!q) return true;
      const matchOrderNum = order.orderNumber?.toLowerCase().includes(q);
      const matchCustomerName = (order.userId?.fullName || order.shippingAddress?.fullName || "")
        .toLowerCase()
        .includes(q);
      const matchCustomerEmail = (order.userId?.email || "").toLowerCase().includes(q);
      const matchItems = order.items?.some((item: any) =>
        item.productName?.toLowerCase().includes(q)
      );
      return matchOrderNum || matchCustomerName || matchCustomerEmail || matchItems;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "amount_desc") return (b.totalAmount || 0) - (a.totalAmount || 0);
      if (sortBy === "amount_asc") return (a.totalAmount || 0) - (b.totalAmount || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [orders, category, search, paymentFilter, sortBy]);

  const paymentStatuses = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.paymentStatus) set.add(o.paymentStatus.toUpperCase());
    });
    return Array.from(set);
  }, [orders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast.success("Orders refreshed");
    } finally {
      setIsRefreshing(false);
    }
  };

  const openStatusModal = (order: any, preselectedStatus?: string) => {
    const transitions = VALID_ORDER_TRANSITIONS[order.status] || [];
    setStatusModalOrder(order);
    setSelectedStatus(preselectedStatus || transitions[0] || "");
    setStatusNote("");
  };

  const handleConfirmStatusUpdate = async () => {
    if (!statusModalOrder || !selectedStatus) return;
    setIsUpdating(true);
    try {
      await api.put(`/orders/${statusModalOrder._id}/status`, {
        status: selectedStatus,
        message: statusNote.trim() || undefined,
      });
      await onRefresh();
      toast.success(`Order ${statusModalOrder.orderNumber} updated to ${formatOrderStatus(selectedStatus)}`);
      setStatusModalOrder(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "DELIVERED") return <CheckCircle2 className="h-3.5 w-3.5" />;
    if (["CANCELLED", "DELIVERY_FAILED"].includes(status)) return <XCircle className="h-3.5 w-3.5" />;
    if (["SHIPPED", "ARRIVED_NEAR_AREA", "OUT_FOR_DELIVERY"].includes(status))
      return <Truck className="h-3.5 w-3.5" />;
    if (["PROCESSING", "CONFIRMED"].includes(status)) return <Package className="h-3.5 w-3.5" />;
    return <Clock className="h-3.5 w-3.5" />;
  };

  const validNextStatuses = statusModalOrder
    ? VALID_ORDER_TRANSITIONS[statusModalOrder.status] || []
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Order Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track, filter, and manage customer orders across every fulfillment stage.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {ORDER_CATEGORIES.map((cat) => {
          const active = category === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${
                active
                  ? "bg-accent text-accent-foreground border-accent shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  active ? "bg-background/20 text-accent-foreground" : "bg-muted text-foreground"
                }`}
              >
                {categoryCounts[cat.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 bg-background"
            placeholder="Search by Order ID, customer name, email, or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full sm:w-[170px] bg-background">
              <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Payments</SelectItem>
              {paymentStatuses.map((ps) => (
                <SelectItem key={ps} value={ps}>
                  {ps}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="amount_desc">Highest Amount</SelectItem>
              <SelectItem value="amount_asc">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No matching orders found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your category tab, search query, or payment filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const transitions = VALID_ORDER_TRANSITIONS[order.status] || [];
            const primaryNext = transitions.find((s) => s !== "CANCELLED");
            const canCancel = transitions.includes("CANCELLED");
            const totalQty = order.items?.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0) || 0;
            const customerName = order.userId?.fullName || order.shippingAddress?.fullName || "Customer";
            const customerEmail = order.userId?.email || "—";

            return (
              <div
                key={order._id}
                className="bg-card border border-border rounded-xl p-5 hover:border-accent/40 transition-colors"
              >
                {/* Top Row: Order ID, Timestamp, Status, Amount */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-border">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="font-mono font-semibold text-sm hover:text-accent transition-colors"
                    >
                      {order.orderNumber}
                    </button>
                    <Badge
                      variant="outline"
                      className={`gap-1.5 font-medium ${getOrderStatusBadgeClass(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {formatOrderStatus(order.status)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {order.paymentMethod || "DEMO"} • {order.paymentStatus || "SIMULATED"}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {format(new Date(order.createdAt), "MMM dd, yyyy • h:mm a")}
                    </span>
                    <span className="font-semibold text-base">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>

                {/* Middle Row: Customer, Products, Delivery Address */}
                <div className="grid md:grid-cols-3 gap-5 py-4">
                  {/* Customer Info */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Customer
                    </p>
                    <p className="font-medium text-sm">{customerName}</p>
                    <p className="text-xs text-muted-foreground">{customerEmail}</p>
                    {(order.shippingAddress?.phone || order.userId?.phone) && (
                      <p className="text-xs text-muted-foreground">
                        {order.shippingAddress?.phone || order.userId?.phone}
                      </p>
                    )}
                  </div>

                  {/* Products Summary */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Items ({totalQty})
                    </p>
                    <div className="space-y-1.5">
                      {order.items?.slice(0, 2).map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2.5 text-sm">
                          {item.productImage ? (
                            <img
                              src={getImageUrl(item.productImage)}
                              alt={item.productName}
                              className="w-8 h-10 object-cover rounded border border-border flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-xs truncate">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity}
                              {item.size ? ` • Size ${item.size}` : ""}
                              {item.color ? ` • ${item.color}` : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{order.items.length - 2} more item(s)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Delivery Address
                    </p>
                    {order.shippingAddress ? (
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p className="text-foreground font-medium">{order.shippingAddress.fullName}</p>
                        <p>
                          {order.shippingAddress.addressLine1}
                          {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
                        </p>
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                          {order.shippingAddress.postalCode}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No address recorded</p>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Last updated: {format(new Date(order.updatedAt || order.createdAt), "MMM dd, yyyy • h:mm a")}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      View Details
                    </Button>

                    {primaryNext && (
                      <Button
                        size="sm"
                        variant="gold"
                        onClick={() => openStatusModal(order, primaryNext)}
                      >
                        Mark as {formatOrderStatus(primaryNext)}
                      </Button>
                    )}

                    {transitions.length > 0 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openStatusModal(order)}
                      >
                        Update Status
                      </Button>
                    )}

                    {canCancel && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => openStatusModal(order, "CANCELLED")}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Update Status Dialog */}
      <Dialog open={!!statusModalOrder} onOpenChange={(open) => !open && setStatusModalOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Order <span className="font-mono font-semibold">{statusModalOrder?.orderNumber}</span> •
              Current status:{" "}
              <span className="font-medium">
                {statusModalOrder ? formatOrderStatus(statusModalOrder.status) : ""}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select next status" />
                </SelectTrigger>
                <SelectContent>
                  {validNextStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {formatOrderStatus(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tracking Note (Optional)</label>
              <Textarea
                placeholder="Add a custom update message for the customer timeline..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={3}
              />
            </div>

            {selectedStatus === "CANCELLED" && (
              <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg">
                Cancelling this order will automatically restore product stock to inventory.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusModalOrder(null)} disabled={isUpdating}>
              Close
            </Button>
            <Button
              variant={selectedStatus === "CANCELLED" ? "destructive" : "gold"}
              onClick={handleConfirmStatusUpdate}
              disabled={!selectedStatus || isUpdating}
            >
              {isUpdating ? "Updating..." : "Confirm Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;
