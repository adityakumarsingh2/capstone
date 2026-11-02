import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { formatPrice } from "@/lib/formatCurrency";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard, Package, Users, ShoppingCart, Star, ArrowLeft, Loader2,
  TrendingUp, AlertTriangle, CheckCircle, XCircle, Search, ToggleLeft, ToggleRight, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

type Tab = 'overview' | 'orders' | 'products' | 'customers' | 'inventory';

const formatStatus = (s: string) => s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
const statusBadge = (s: string) => {
  if (s === 'DELIVERED') return 'default';
  if (['CANCELLED', 'DELIVERY_FAILED'].includes(s)) return 'destructive';
  return 'secondary';
};

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orderStatusUpdate, setOrderStatusUpdate] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      toast.error('Admin access required');
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const load = async () => {
      setIsLoading(true);
      try {
        if (tab === 'overview') {
          const { data } = await api.get('/admin/stats');
          setStats(data.stats);
        } else if (tab === 'orders') {
          const { data } = await api.get('/orders', { params: { limit: 50 } });
          setOrders(data.orders);
        } else if (tab === 'customers') {
          const { data } = await api.get('/admin/customers', { params: { limit: 50 } });
          setCustomers(data.customers);
        } else if (tab === 'products' || tab === 'inventory') {
          const { data } = await api.get('/admin/inventory');
          setProducts(data.products);
          setInventory(data.movements);
        }
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    load();
  }, [tab, user]);

  const handleUpdateStatus = async (orderId: string) => {
    const newStatus = orderStatusUpdate[orderId];
    if (!newStatus) return;
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      const { data } = await api.get('/orders', { params: { limit: 50 } });
      setOrders(data.orders);
      toast.success('Order status updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleToggleBlock = async (customerId: string) => {
    try {
      const { data } = await api.put(`/admin/customers/${customerId}/block`);
      setCustomers(prev => prev.map(c => c._id === customerId ? { ...c, isBlocked: data.isBlocked } : c));
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update customer');
    }
  };

  const ORDER_STATUSES = ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'ARRIVED_NEAR_AREA', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'DELIVERY_FAILED', 'RETURN_REQUESTED', 'RETURNED'];

  if (loading || (!user && !loading)) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const navItems: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'orders', label: 'Orders', icon: ShoppingCart },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'customers', label: 'Customers', icon: Users },
    { key: 'inventory', label: 'Inventory', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-border">
          <p className="font-display text-lg font-semibold">Fitkart <span className="text-accent">Admin</span></p>
          <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Store
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === 'overview' && stats && (
              <div className="space-y-6">
                <h1 className="font-display text-2xl font-semibold">Dashboard Overview</h1>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: TrendingUp, color: 'text-green-500' },
                    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-500' },
                    { label: 'Total Customers', value: stats.totalUsers, icon: Users, color: 'text-purple-500' },
                    { label: 'Active Products', value: stats.activeProducts, icon: Package, color: 'text-accent' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-card border border-border rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <Icon className={`h-5 w-5 ${color}`} />
                      </div>
                      <p className="text-2xl font-bold">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Delivered', value: stats.deliveredOrders, icon: CheckCircle, color: 'text-green-500' },
                    { label: 'Pending', value: stats.pendingOrders, icon: AlertTriangle, color: 'text-orange-500' },
                    { label: 'Cancelled', value: stats.cancelledOrders, icon: XCircle, color: 'text-destructive' },
                    { label: 'Low Stock', value: stats.lowStockProducts, icon: AlertTriangle, color: 'text-orange-500' },
                    { label: 'Out of Stock', value: stats.outOfStockProducts, icon: XCircle, color: 'text-destructive' },
                    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-accent' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                      <Icon className={`h-6 w-6 ${color}`} />
                      <div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
                    </div>
                  ))}
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-medium mb-4">Recent Orders</h3>
                    <div className="space-y-3">
                      {stats.recentOrders?.map((o: any) => (
                        <div key={o._id} className="flex items-center justify-between text-sm">
                          <div><p className="font-medium">{o.orderNumber}</p><p className="text-xs text-muted-foreground">{o.userId?.email}</p></div>
                          <div className="text-right"><p className="font-medium">{formatPrice(o.totalAmount)}</p><Badge variant={statusBadge(o.status)} className="text-xs">{formatStatus(o.status)}</Badge></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-medium mb-4">Top Products</h3>
                    <div className="space-y-3">
                      {stats.topProducts?.map((p: any) => (
                        <div key={p._id} className="flex items-center justify-between text-sm">
                          <p className="font-medium">{p.name}</p>
                          <div className="text-right"><p className="text-xs text-muted-foreground">{p.salesCount} sold</p><p className="font-medium">{formatPrice(p.price)}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ORDERS */}
            {tab === 'orders' && (
              <div className="space-y-4">
                <h1 className="font-display text-2xl font-semibold">All Orders</h1>
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search by order number..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-muted/50">{['Order #', 'Customer', 'Total', 'Status', 'Date', 'Update Status'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                    <tbody>
                      {orders.filter(o => !search || o.orderNumber.toLowerCase().includes(search.toLowerCase())).map(order => (
                        <tr key={order._id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                          <td className="px-4 py-3 text-muted-foreground">{order.userId?.email || 'N/A'}</td>
                          <td className="px-4 py-3">{formatPrice(order.totalAmount)}</td>
                          <td className="px-4 py-3"><Badge variant={statusBadge(order.status)}>{formatStatus(order.status)}</Badge></td>
                          <td className="px-4 py-3 text-muted-foreground">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <select className="text-xs border border-border rounded px-2 py-1 bg-background" value={orderStatusUpdate[order._id] || ''} onChange={e => setOrderStatusUpdate(prev => ({...prev, [order._id]: e.target.value}))}>
                                <option value="">Select status</option>
                                {ORDER_STATUSES.map(s => <option key={s} value={s}>{formatStatus(s)}</option>)}
                              </select>
                              <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(order._id)}>Update</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PRODUCTS */}
            {tab === 'products' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h1 className="font-display text-2xl font-semibold">Products</h1>
                  <Button variant="gold" size="sm" onClick={() => navigate('/shop')}>View Store</Button>
                </div>
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-muted/50">{['Product', 'Category', 'Price', 'Stock', 'Status'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p._id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-12 object-cover rounded" />}
                              <span className="font-medium">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 capitalize text-muted-foreground">{p.category}</td>
                          <td className="px-4 py-3">{formatPrice(p.price)}</td>
                          <td className="px-4 py-3">
                            <span className={`font-medium ${p.stockQuantity === 0 ? 'text-destructive' : p.stockQuantity <= 10 ? 'text-orange-500' : 'text-green-500'}`}>{p.stockQuantity}</span>
                          </td>
                          <td className="px-4 py-3"><Badge variant={p.isActive ? 'default' : 'secondary'}>{p.isActive ? 'Active' : 'Inactive'}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CUSTOMERS */}
            {tab === 'customers' && (
              <div className="space-y-4">
                <h1 className="font-display text-2xl font-semibold">Customers</h1>
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-muted/50">{['Name', 'Email', 'Joined', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                    <tbody>
                      {customers.filter(c => !search || c.email.includes(search) || c.fullName?.includes(search)).map(c => (
                        <tr key={c._id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{c.fullName || '—'}</td>
                          <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                          <td className="px-4 py-3 text-muted-foreground">{format(new Date(c.createdAt), 'MMM dd, yyyy')}</td>
                          <td className="px-4 py-3"><Badge variant={c.isBlocked ? 'destructive' : 'default'}>{c.isBlocked ? 'Blocked' : 'Active'}</Badge></td>
                          <td className="px-4 py-3">
                            <Button size="sm" variant={c.isBlocked ? 'outline' : 'destructive'} onClick={() => handleToggleBlock(c._id)}>
                              {c.isBlocked ? 'Unblock' : 'Block'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* INVENTORY */}
            {tab === 'inventory' && (
              <div className="space-y-4">
                <h1 className="font-display text-2xl font-semibold">Inventory</h1>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: 'Total Products', value: products.length, color: 'text-foreground' },
                    { label: 'Low Stock (≤10)', value: products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10).length, color: 'text-orange-500' },
                    { label: 'Out of Stock', value: products.filter(p => p.stockQuantity === 0).length, color: 'text-destructive' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-card border border-border rounded-xl p-4">
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-sm text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-medium mb-4">Recent Inventory Changes</h3>
                  <div className="space-y-2">
                    {inventory.map((m: any) => (
                      <div key={m._id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                        <div>
                          <p className="font-medium">{m.productId?.name || 'Unknown Product'}</p>
                          <p className="text-xs text-muted-foreground capitalize">{m.type} • {m.reason}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${m.type === 'deduction' ? 'text-destructive' : 'text-green-500'}`}>
                            {m.type === 'deduction' ? '-' : '+'}{m.quantity}
                          </p>
                          <p className="text-xs text-muted-foreground">{m.previousStock} → {m.newStock}</p>
                        </div>
                      </div>
                    ))}
                    {inventory.length === 0 && <p className="text-muted-foreground text-sm">No inventory movements yet</p>}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
