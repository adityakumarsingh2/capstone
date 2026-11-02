import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useOrders } from "@/hooks/useOrders";
import { User, Loader2, Scale, Package, ShoppingBag, MapPin, ChevronRight, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/formatCurrency";
import { format } from "date-fns";

const statusColor = (status: string) => {
  if (['DELIVERED'].includes(status)) return 'default';
  if (['CANCELLED', 'DELIVERY_FAILED'].includes(status)) return 'destructive';
  if (['ORDER_PLACED', 'PROCESSING'].includes(status)) return 'secondary';
  return 'outline';
};

const formatStatus = (status: string) =>
  status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

const ProfilePage = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { orders, isLoading: ordersLoading } = useOrders();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [weight, setWeight] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setWeight(profile.bodyMeasurements?.weight || "");
      setHeight(profile.bodyMeasurements?.height || "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    await updateProfile.mutateAsync({
      fullName,
      bodyMeasurements: {
        weight: weight === "" ? undefined : weight,
        height: height === "" ? undefined : height,
      }
    });
    setIsEditing(false);
  };

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

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 md:pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-medium">My Profile</h1>
                <p className="text-muted-foreground mt-1">Manage your account details</p>
              </div>
              <Button variant="outline" onClick={signOut}>Sign Out</Button>
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Personal Information</CardTitle>
                  <CardDescription>Update your personal details here</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!isEditing} placeholder="Enter your full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Account Role</Label>
                    <Badge variant="secondary">{user?.role === 'admin' ? 'Administrator' : 'Customer'}</Badge>
                  </div>
                  <div className="flex gap-3">
                    {isEditing ? (
                      <>
                        <Button variant="gold" onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                          {updateProfile.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                      </>
                    ) : (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Body Measurements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5" />Body Measurements</CardTitle>
                  <CardDescription>Used for size recommendations in virtual try-on</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : "")} disabled={!isEditing} placeholder="Enter your weight" min={20} max={250} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : "")} disabled={!isEditing} placeholder="Enter your height" min={100} max={250} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">These measurements help us provide accurate size recommendations when you use the virtual try-on feature.</p>
                </CardContent>
              </Card>

              {/* Addresses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Saved Addresses</CardTitle>
                  <CardDescription>Your saved shipping addresses</CardDescription>
                </CardHeader>
                <CardContent>
                  {user?.addresses && user.addresses.length > 0 ? (
                    <div className="space-y-3">
                      {user.addresses.map((addr) => (
                        <div key={addr._id} className="p-4 rounded-lg border border-border">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{addr.label || 'Address'} {addr.isDefault && <Badge variant="secondary" className="ml-2 text-xs">Default</Badge>}</p>
                              <p className="text-sm text-muted-foreground mt-1">{addr.fullName}</p>
                              <p className="text-sm text-muted-foreground">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                              <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.postalCode}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => navigate('/checkout')}>Manage addresses at checkout</Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No saved addresses. Add one at checkout.</p>
                  )}
                </CardContent>
              </Card>

              {/* Order History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Order History</CardTitle>
                  <CardDescription>View your past orders and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground mb-4">No orders yet</p>
                      <Button variant="outline" onClick={() => navigate('/shop')}>Start Shopping</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="border border-border rounded-lg p-4 space-y-3 hover:border-accent/50 transition-colors cursor-pointer" onClick={() => navigate(`/orders/${order._id}`)}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{order.orderNumber}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(order.createdAt), 'MMM dd, yyyy • h:mm a')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={statusColor(order.status)}>{formatStatus(order.status)}</Badge>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{item.productName} × {item.quantity} <span className="text-xs">(Size: {item.size}{item.color ? `, ${item.color}` : ''})</span></span>
                                <span>{formatPrice(item.price * item.quantity)}</span>
                              </div>
                            ))}
                            {order.items.length > 2 && <p className="text-xs text-muted-foreground">+{order.items.length - 2} more items</p>}
                          </div>
                          
                          <div className="border-t border-border pt-2 flex justify-between font-medium">
                            <span>Total</span>
                            <span>{formatPrice(order.totalAmount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default ProfilePage;
