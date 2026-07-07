"use client";

import { useState } from "react";
import { useRequireStaff } from "../../lib/admin-auth";
import { AdminLayout } from "../../components/admin-layout";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

export default function MerchantSettingsPage() {
  const { ready } = useRequireStaff();
  const [settings, setSettings] = useState({
    brandName: "Brand Co",
    email: "contact@brandco.com",
    phone: "+44 123 456 7890",
    website: "https://brandco.com",
    description: "Premium UK e-liquid manufacturer",
  });

  if (!ready) return null;

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // API call would go here
    console.log("Saving settings:", settings);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Brand Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your brand information and preferences</p>
        </div>

        {/* Brand Information */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-2xl">
          <h2 className="text-lg font-black tracking-tight text-foreground">Brand Information</h2>

          <div className="mt-6 space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                value={settings.brandName}
                onChange={(e) => handleChange("brandName", e.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={settings.website}
                onChange={(e) => handleChange("website", e.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="description">Brand Description</Label>
              <textarea
                id="description"
                value={settings.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="min-h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm font-bold text-foreground placeholder-muted-foreground outline-none"
              />
            </div>
          </div>

          <Button className="mt-6" onClick={handleSave}>
            Save Changes
          </Button>
        </div>

        {/* Payment Settings */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-2xl">
          <h2 className="text-lg font-black tracking-tight text-foreground">Payment Settings</h2>

          <div className="mt-6 space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="bankAccount">Bank Account</Label>
              <Input
                id="bankAccount"
                disabled
                value="••••••••••••1234"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="payoutFrequency">Payout Frequency</Label>
              <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-bold">
                <option>Weekly</option>
                <option>Bi-weekly</option>
                <option>Monthly</option>
              </select>
            </div>

            <p className="text-xs text-muted-foreground">
              To update payment information, please contact support@phoenixvapers.com
            </p>
          </div>
        </div>

        {/* API Settings */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-2xl">
          <h2 className="text-lg font-black tracking-tight text-foreground">API Settings</h2>

          <div className="mt-6 space-y-4">
            <div className="grid gap-1.5">
              <Label>API Key</Label>
              <div className="flex items-center gap-2">
                <Input disabled value="pk_live_••••••••••••••••••••" />
                <Button variant="outline" size="sm">
                  Regenerate
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Use this API key to integrate your systems with Phoenix Vapers.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
