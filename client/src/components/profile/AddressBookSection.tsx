import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Address, useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface AddressFormState {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const emptyForm: AddressFormState = {
  label: "Home",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

const AddressBookSection = () => {
  const { user, refreshUser } = useAuth();
  const addresses = user?.addresses || [];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openAddDialog = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      isDefault: addresses.length === 0,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (addr: Address) => {
    setEditingId(addr._id);
    setForm({
      label: addr.label || "Home",
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "India",
      isDefault: !!addr.isDefault,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.addressLine1.trim() || !form.city.trim() || !form.state.trim() || !form.postalCode.trim()) {
      toast.error("Please fill in all required address fields");
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await api.put(`/profile/addresses/${editingId}`, form);
        toast.success("Address updated");
      } else {
        await api.post("/profile/addresses", form);
        toast.success("Address added");
      }
      await refreshUser();
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save address");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await api.put(`/profile/addresses/${addressId}`, { isDefault: true });
      await refreshUser();
      toast.success("Default address updated");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update default address");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/profile/addresses/${deleteId}`);
      await refreshUser();
      toast.success("Address deleted");
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete address");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent" />
            Saved Addresses
          </CardTitle>
          <CardDescription>
            Manage your delivery addresses and choose a default for faster checkout.
          </CardDescription>
        </div>
        <Button variant="gold" size="sm" onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Address
        </Button>
      </CardHeader>

      <CardContent>
        {addresses.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No saved addresses yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Add a shipping address to speed up your future orders.
            </p>
            <Button variant="outline" size="sm" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Your First Address
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className={`rounded-xl border p-5 flex flex-col justify-between transition-colors ${
                  addr.isDefault ? "border-accent/60 bg-accent/5" : "border-border bg-background"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{addr.label || "Address"}</span>
                      {addr.isDefault && (
                        <Badge variant="default" className="text-xs bg-accent text-accent-foreground">
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="font-medium text-sm">{addr.fullName}</p>
                  {addr.phone && <p className="text-xs text-muted-foreground mt-0.5">{addr.phone}</p>}
                  <p className="text-sm text-muted-foreground mt-2">
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                  {addr.country && <p className="text-xs text-muted-foreground mt-0.5">{addr.country}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-border">
                  {!addr.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs"
                      onClick={() => handleSetDefault(addr._id)}
                    >
                      <Star className="h-3.5 w-3.5 mr-1" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs"
                    onClick={() => openEditDialog(addr)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                    onClick={() => setDeleteId(addr._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Address" : "Add New Address"}</DialogTitle>
            <DialogDescription>
              Enter your delivery details below. Required fields are marked with *.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="addr-label">Address Label</Label>
                <Input
                  id="addr-label"
                  placeholder="Home, Work, etc."
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="addr-phone">Phone Number</Label>
                <Input
                  id="addr-phone"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="addr-fullName">Recipient Full Name *</Label>
              <Input
                id="addr-fullName"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="addr-line1">Address Line 1 *</Label>
              <Input
                id="addr-line1"
                required
                placeholder="House / Flat No., Building, Street"
                value={form.addressLine1}
                onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="addr-line2">Address Line 2</Label>
              <Input
                id="addr-line2"
                placeholder="Landmark, Area (optional)"
                value={form.addressLine2}
                onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="addr-city">City *</Label>
                <Input
                  id="addr-city"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="addr-state">State *</Label>
                <Input
                  id="addr-state"
                  required
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="addr-postal">Postal Code *</Label>
                <Input
                  id="addr-postal"
                  required
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="addr-country">Country</Label>
                <Input
                  id="addr-country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="addr-default"
                checked={form.isDefault}
                onCheckedChange={(checked) => setForm({ ...form, isDefault: !!checked })}
              />
              <Label htmlFor="addr-default" className="text-sm font-normal cursor-pointer">
                Set as my default delivery address
              </Label>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingId ? "Save Changes" : "Add Address"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete address?</AlertDialogTitle>
            <AlertDialogDescription>
              This delivery address will be permanently removed from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AddressBookSection;
