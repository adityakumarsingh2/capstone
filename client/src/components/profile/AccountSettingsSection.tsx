import { useEffect, useState } from "react";
import { Lock, Bell, Ruler, LogOut, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AccountSettingsSection = () => {
  const { signOut } = useAuth();
  const { profile, updateProfile } = useProfile();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);
  const [measurementUnit, setMeasurementUnit] = useState<"metric" | "imperial">("metric");

  useEffect(() => {
    if (profile?.preferences) {
      setEmailNotifications(profile.preferences.emailNotifications ?? true);
      setOrderUpdates(profile.preferences.orderUpdates ?? true);
      setPromotionalEmails(profile.preferences.promotionalEmails ?? false);
      setMeasurementUnit(profile.preferences.measurementUnit ?? "metric");
    }
  }, [profile]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      toast.error("New password must be at least 4 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.put("/auth/change-password", { currentPassword, newPassword });
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSavePreferences = async () => {
    await updateProfile.mutateAsync({
      preferences: {
        emailNotifications,
        orderUpdates,
        promotionalEmails,
        measurementUnit,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Password Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-accent" />
            Password & Security
          </CardTitle>
          <CardDescription>
            Update your password regularly to keep your FitKart account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 4 characters"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>
            <Button type="submit" variant="gold" disabled={isUpdatingPassword}>
              {isUpdatingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-accent" />
            Preferences & Notifications
          </CardTitle>
          <CardDescription>
            Customize how you receive order updates and view measurements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 py-2 border-b border-border">
              <div>
                <p className="font-medium text-sm">Order Status Updates</p>
                <p className="text-xs text-muted-foreground">
                  Receive notifications when your order is confirmed, shipped, or delivered.
                </p>
              </div>
              <Switch checked={orderUpdates} onCheckedChange={setOrderUpdates} />
            </div>

            <div className="flex items-center justify-between gap-4 py-2 border-b border-border">
              <div>
                <p className="font-medium text-sm">Account & Security Emails</p>
                <p className="text-xs text-muted-foreground">
                  Important alerts about your account activity and password changes.
                </p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>

            <div className="flex items-center justify-between gap-4 py-2 border-b border-border">
              <div>
                <p className="font-medium text-sm">Style Drops & Promotions</p>
                <p className="text-xs text-muted-foreground">
                  Curated new arrivals, seasonal lookbooks, and member offers.
                </p>
              </div>
              <Switch checked={promotionalEmails} onCheckedChange={setPromotionalEmails} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
              <div className="flex items-start gap-2.5">
                <Ruler className="h-4 w-4 text-accent mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Measurement Units</p>
                  <p className="text-xs text-muted-foreground">
                    Choose your preferred unit system for body measurements.
                  </p>
                </div>
              </div>
              <Select
                value={measurementUnit}
                onValueChange={(v) => setMeasurementUnit(v as "metric" | "imperial")}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (cm / kg)</SelectItem>
                  <SelectItem value="imperial">Imperial (in / lbs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleSavePreferences}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Session */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-accent" />
            Session
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Sign out of your FitKart account on this device.
          </p>
          <Button variant="destructive" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettingsSection;
