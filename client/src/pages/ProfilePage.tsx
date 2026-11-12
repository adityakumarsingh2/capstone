import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddressBookSection from "@/components/profile/AddressBookSection";
import AccountSettingsSection from "@/components/profile/AccountSettingsSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useOrders } from "@/hooks/useOrders";
import api, { getImageUrl } from "@/lib/api";
import { formatPrice } from "@/lib/formatCurrency";
import { formatOrderStatus, getOrderStatusBadgeClass } from "@/lib/orderStatus";
import { getRecommendedSize } from "@/lib/sizeRecommendation";
import {
  User,
  Loader2,
  Scale,
  Package,
  ShoppingBag,
  MapPin,
  ChevronRight,
  Settings,
  Camera,
  Search,
  Sparkles,
  LogOut,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type ProfileTab = "personal" | "orders" | "measurements" | "addresses" | "settings";

interface ProfilePageProps {
  defaultTab?: ProfileTab;
}

const VALID_TABS: ProfileTab[] = ["personal", "orders", "measurements", "addresses", "settings"];

const ProfilePage = ({ defaultTab = "personal" }: ProfilePageProps) => {
  const { user, loading: authLoading, signOut, refreshUser } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { orders, isLoading: ordersLoading } = useOrders();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialTab = (() => {
    const param = searchParams.get("tab") as ProfileTab | null;
    return param && VALID_TABS.includes(param) ? param : defaultTab;
  })();

  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);

  // Personal Info state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Body Measurements state
  const [weight, setWeight] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">("");
  const [chest, setChest] = useState<number | "">("");
  const [waist, setWaist] = useState<number | "">("");
  const [hips, setHips] = useState<number | "">("");
  const [shoulders, setShoulders] = useState<number | "">("");
  const [inseam, setInseam] = useState<number | "">("");
  const [fitPreference, setFitPreference] = useState<"slim" | "regular" | "relaxed" | "oversized">("regular");
  const [isEditingMeasurements, setIsEditingMeasurements] = useState(false);

  // Order History filter state
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");

  useEffect(() => {
    const param = searchParams.get("tab") as ProfileTab | null;
    if (param && VALID_TABS.includes(param)) {
      setActiveTab(param);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setPhone(profile.phone || "");
      setAvatarUrl(profile.avatarUrl || "");
      setWeight(profile.bodyMeasurements?.weight ?? "");
      setHeight(profile.bodyMeasurements?.height ?? "");
      setChest(profile.bodyMeasurements?.chest ?? "");
      setWaist(profile.bodyMeasurements?.waist ?? "");
      setHips(profile.bodyMeasurements?.hips ?? "");
      setShoulders(profile.bodyMeasurements?.shoulders ?? "");
      setInseam(profile.bodyMeasurements?.inseam ?? "");
      setFitPreference(profile.bodyMeasurements?.fitPreference || "regular");
    }
  }, [profile]);

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    setIsUploadingAvatar(true);
    try {
      const { data } = await api.post("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatarUrl(data.avatarUrl);
      await refreshUser();
      toast.success("Profile picture updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload profile picture");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSavePersonal = async () => {
    await updateProfile.mutateAsync({
      fullName: fullName.trim(),
      phone: phone.trim(),
      avatarUrl: avatarUrl.trim(),
    });
    setIsEditingPersonal(false);
  };

  const handleSaveMeasurements = async () => {
    await updateProfile.mutateAsync({
      bodyMeasurements: {
        weight: weight === "" ? undefined : Number(weight),
        height: height === "" ? undefined : Number(height),
        chest: chest === "" ? undefined : Number(chest),
        waist: waist === "" ? undefined : Number(waist),
        hips: hips === "" ? undefined : Number(hips),
        shoulders: shoulders === "" ? undefined : Number(shoulders),
        inseam: inseam === "" ? undefined : Number(inseam),
        fitPreference,
      },
    });
    setIsEditingMeasurements(false);
  };

  const sizeRecommendation = useMemo(() => {
    if (typeof weight === "number" && typeof height === "number" && weight >= 30 && height >= 100) {
      return getRecommendedSize({ weight, height });
    }
    return null;
  }, [weight, height]);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      if (orderStatusFilter !== "ALL" && order.status !== orderStatusFilter) return false;
      if (!q) return true;
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchItem = order.items.some((i) => i.productName.toLowerCase().includes(q));
      return matchNum || matchItem;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const orderStats = useMemo(() => {
    const active = orders.filter(
      (o) => !["DELIVERED", "CANCELLED", "RETURNED", "DELIVERY_FAILED"].includes(o.status)
    ).length;
    const delivered = orders.filter((o) => o.status === "DELIVERED").length;
    return { total: orders.length, active, delivered };
  }, [orders]);

  if (authLoading || profileLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </main>
    );
  }

  const navItems: { key: ProfileTab; label: string; icon: any; badge?: number }[] = [
    { key: "personal", label: "Personal Information", icon: User },
    { key: "orders", label: "Order History", icon: Package, badge: orders.length },
    { key: "measurements", label: "Body Measurements", icon: Scale },
    { key: "addresses", label: "Saved Addresses", icon: MapPin, badge: user?.addresses?.length },
    { key: "settings", label: "Account Settings", icon: Settings },
  ];

  const initials = (profile?.fullName || user?.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 md:pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-medium">My Account</h1>
            <p className="text-muted-foreground mt-1">
              Manage your personal profile, orders, body measurements, addresses, and preferences.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Navigation (Desktop) & Horizontal Tabs (Mobile) */}
            <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
              {/* User Summary Card */}
              <Card className="overflow-hidden">
                <CardContent className="p-5 flex items-center gap-4">
                  <Avatar className="h-14 w-14 border border-border">
                    <AvatarImage src={getImageUrl(avatarUrl)} alt={profile?.fullName || "User"} />
                    <AvatarFallback className="bg-accent/15 text-accent font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{profile?.fullName || "FitKart Member"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    <Badge variant="secondary" className="mt-1.5 text-[11px]">
                      {user?.role === "admin" ? "Administrator" : "Customer"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Menu */}
              <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 bg-card border border-border rounded-xl p-2">
                {navItems.map(({ key, label, icon: Icon, badge }) => {
                  const active = activeTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleTabChange(key)}
                      className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        active
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </span>
                      {typeof badge === "number" && badge > 0 && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            active ? "bg-background/20 text-accent-foreground" : "bg-muted text-foreground"
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <Button
                variant="outline"
                className="hidden lg:flex w-full justify-start text-muted-foreground hover:text-destructive"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </aside>

            {/* Main Content Area */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
              {/* 1. PERSONAL INFORMATION */}
              {activeTab === "personal" && (
                <Card>
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-accent" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>
                        Keep your profile photo, name, and contact details up to date.
                      </CardDescription>
                    </div>
                    {!isEditingPersonal && (
                      <Button variant="outline" size="sm" onClick={() => setIsEditingPersonal(true)}>
                        Edit Profile
                      </Button>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Profile Picture Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-xl bg-muted/40 border border-border">
                      <Avatar className="h-20 w-20 border-2 border-border">
                        <AvatarImage src={getImageUrl(avatarUrl)} alt={fullName || "User"} />
                        <AvatarFallback className="bg-accent/15 text-accent text-xl font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2 flex-1">
                        <p className="font-medium text-sm">Profile Picture</p>
                        <p className="text-xs text-muted-foreground">
                          Upload a JPG, PNG, or WEBP image (max 5 MB).
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUploadingAvatar}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {isUploadingAvatar ? (
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            ) : (
                              <Camera className="h-3.5 w-3.5 mr-1.5" />
                            )}
                            Upload Photo
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={!isEditingPersonal}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone Number
                        </Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={!isEditingPersonal}
                          placeholder="+91 98765 43210"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email Address
                        </Label>
                        <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground">
                          Email is used for sign-in and cannot be changed.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Account Details
                        </Label>
                        <div className="h-10 px-3 rounded-md border border-border bg-muted/40 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Joined{" "}
                            {profile?.createdAt
                              ? format(new Date(profile.createdAt), "MMM dd, yyyy")
                              : "—"}
                          </span>
                          <Badge variant="secondary">
                            {user?.role === "admin" ? "Administrator" : "Customer"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {isEditingPersonal && (
                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="gold"
                          onClick={handleSavePersonal}
                          disabled={updateProfile.isPending}
                        >
                          {updateProfile.isPending && (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          )}
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingPersonal(false);
                            setFullName(profile?.fullName || "");
                            setPhone(profile?.phone || "");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 2. ORDER HISTORY */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  {/* Stats Strip */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-xl p-4">
                      <p className="text-xs text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-semibold mt-1">{orderStats.total}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                      <p className="text-xs text-muted-foreground">In Progress</p>
                      <p className="text-2xl font-semibold text-accent mt-1">{orderStats.active}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                      <p className="text-xs text-muted-foreground">Delivered</p>
                      <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                        {orderStats.delivered}
                      </p>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-accent" />
                        Order History
                      </CardTitle>
                      <CardDescription>
                        Track current shipments, view payment details, and inspect past orders.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Search & Filter */}
                      {orders.length > 0 && (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              className="pl-9"
                              placeholder="Search by order ID or product name..."
                              value={orderSearch}
                              onChange={(e) => setOrderSearch(e.target.value)}
                            />
                          </div>
                          <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[190px]">
                              <SelectValue placeholder="Filter status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL">All Statuses</SelectItem>
                              <SelectItem value="ORDER_PLACED">Order Placed</SelectItem>
                              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                              <SelectItem value="PROCESSING">Processing</SelectItem>
                              <SelectItem value="SHIPPED">Shipped</SelectItem>
                              <SelectItem value="OUT_FOR_DELIVERY">Out For Delivery</SelectItem>
                              <SelectItem value="DELIVERED">Delivered</SelectItem>
                              <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {ordersLoading ? (
                        <div className="flex justify-center py-10">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <p className="font-medium mb-1">No orders yet</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Once you place an order, you can track every step right here.
                          </p>
                          <Button variant="gold" onClick={() => navigate("/shop")}>
                            Explore Collection
                          </Button>
                        </div>
                      ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-10 text-sm text-muted-foreground">
                          No orders match your current filter.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredOrders.map((order) => (
                            <div
                              key={order._id}
                              onClick={() => navigate(`/orders/${order._id}`)}
                              className="border border-border rounded-xl p-4 space-y-3 hover:border-accent/50 transition-colors cursor-pointer bg-background"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <p className="font-mono font-semibold text-sm">
                                    {order.orderNumber}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(order.createdAt), "MMM dd, yyyy • h:mm a")}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={getOrderStatusBadgeClass(order.status)}
                                  >
                                    {formatOrderStatus(order.status)}
                                  </Badge>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </div>

                              <div className="space-y-2">
                                {order.items.slice(0, 2).map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-sm gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      {item.productImage && (
                                        <img
                                          src={getImageUrl(item.productImage)}
                                          alt={item.productName}
                                          className="w-9 h-11 object-cover rounded border border-border shrink-0"
                                        />
                                      )}
                                      <div className="min-w-0">
                                        <p className="truncate font-medium text-xs sm:text-sm">
                                          {item.productName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          Qty: {item.quantity} • Size: {item.size}
                                          {item.color ? ` • ${item.color}` : ""}
                                        </p>
                                      </div>
                                    </div>
                                    <span className="font-medium shrink-0">
                                      {formatPrice(item.price * item.quantity)}
                                    </span>
                                  </div>
                                ))}
                                {order.items.length > 2 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{order.items.length - 2} more item(s)
                                  </p>
                                )}
                              </div>

                              <div className="border-t border-border pt-2.5 flex flex-wrap items-center justify-between gap-2 text-sm">
                                <span className="text-xs text-muted-foreground">
                                  Payment: {order.paymentMethod || "DEMO"} ({order.paymentStatus || "SIMULATED"})
                                </span>
                                <span className="font-semibold">
                                  Total: {formatPrice(order.totalAmount)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* 3. BODY MEASUREMENTS */}
              {activeTab === "measurements" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Scale className="h-5 w-5 text-accent" />
                          Body Measurements
                        </CardTitle>
                        <CardDescription>
                          Save your measurements for accurate size recommendations and virtual try-on.
                        </CardDescription>
                      </div>
                      {!isEditingMeasurements && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingMeasurements(true)}
                        >
                          Edit Measurements
                        </Button>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="m-height">Height (cm)</Label>
                          <Input
                            id="m-height"
                            type="number"
                            min={100}
                            max={250}
                            disabled={!isEditingMeasurements}
                            value={height}
                            onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : "")}
                            placeholder="e.g. 175"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="m-weight">Weight (kg)</Label>
                          <Input
                            id="m-weight"
                            type="number"
                            min={20}
                            max={250}
                            disabled={!isEditingMeasurements}
                            value={weight}
                            onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : "")}
                            placeholder="e.g. 70"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="m-chest">Chest (cm)</Label>
                          <Input
                            id="m-chest"
                            type="number"
                            min={50}
                            max={200}
                            disabled={!isEditingMeasurements}
                            value={chest}
                            onChange={(e) => setChest(e.target.value ? Number(e.target.value) : "")}
                            placeholder="e.g. 96"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="m-waist">Waist (cm)</Label>
                          <Input
                            id="m-waist"
                            type="number"
                            min={40}
                            max={200}
                            disabled={!isEditingMeasurements}
                            value={waist}
                            onChange={(e) => setWaist(e.target.value ? Number(e.target.value) : "")}
                            placeholder="e.g. 80"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="m-hips">Hips (cm)</Label>
                          <Input
                            id="m-hips"
                            type="number"
                            min={50}
                            max={200}
                            disabled={!isEditingMeasurements}
                            value={hips}
                            onChange={(e) => setHips(e.target.value ? Number(e.target.value) : "")}
                            placeholder="e.g. 95"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="m-shoulders">Shoulders (cm)</Label>
                          <Input
                            id="m-shoulders"
                            type="number"
                            min={30}
                            max={80}
                            disabled={!isEditingMeasurements}
                            value={shoulders}
                            onChange={(e) =>
                              setShoulders(e.target.value ? Number(e.target.value) : "")
                            }
                            placeholder="e.g. 45"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="m-inseam">Inseam (cm)</Label>
                          <Input
                            id="m-inseam"
                            type="number"
                            min={40}
                            max={120}
                            disabled={!isEditingMeasurements}
                            value={inseam}
                            onChange={(e) => setInseam(e.target.value ? Number(e.target.value) : "")}
                            placeholder="e.g. 78"
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="m-fit">Preferred Fit</Label>
                          <Select
                            value={fitPreference}
                            onValueChange={(v) => setFitPreference(v as any)}
                            disabled={!isEditingMeasurements}
                          >
                            <SelectTrigger id="m-fit">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="slim">Slim Fit (Tailored & Close)</SelectItem>
                              <SelectItem value="regular">Regular Fit (Classic Everyday)</SelectItem>
                              <SelectItem value="relaxed">Relaxed Fit (Easy & Roomy)</SelectItem>
                              <SelectItem value="oversized">Oversized (Statement Drape)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {isEditingMeasurements && (
                        <div className="flex gap-3 pt-2">
                          <Button
                            variant="gold"
                            onClick={handleSaveMeasurements}
                            disabled={updateProfile.isPending}
                          >
                            {updateProfile.isPending && (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Save Measurements
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditingMeasurements(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Live Fit Recommendation Card */}
                  {sizeRecommendation && (
                    <Card className="border-accent/30 bg-accent/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-accent" />
                          Your Personalized Fit Profile
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="px-4 py-2 rounded-lg bg-background border border-border">
                            <p className="text-xs text-muted-foreground">Recommended Size</p>
                            <p className="text-xl font-display font-semibold text-accent">
                              {sizeRecommendation.size}
                            </p>
                          </div>
                          <div className="px-4 py-2 rounded-lg bg-background border border-border">
                            <p className="text-xs text-muted-foreground">Body Frame</p>
                            <p className="text-sm font-medium capitalize">
                              {sizeRecommendation.bodyFrame}
                            </p>
                          </div>
                          <div className="px-4 py-2 rounded-lg bg-background border border-border">
                            <p className="text-xs text-muted-foreground">Suggested Cut</p>
                            <p className="text-sm font-medium capitalize">
                              {sizeRecommendation.fitType}
                            </p>
                          </div>
                        </div>
                        {sizeRecommendation.fittingTips.length > 0 && (
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                            {sizeRecommendation.fittingTips.slice(0, 3).map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* 4. SAVED ADDRESSES */}
              {activeTab === "addresses" && <AddressBookSection />}

              {/* 5. ACCOUNT SETTINGS */}
              {activeTab === "settings" && <AccountSettingsSection />}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default ProfilePage;
