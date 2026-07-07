"use client";

import { useState } from "react";
import { Mail, Bell, MapPin, Lock } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";

export function SettingsTab({ user }) {
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    marketing: false,
  });

  return (
    <div className="space-y-6">
      {/* Contact Info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-black text-foreground">Contact Information</h3>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2" />
          </div>
          <Button>Update Contact Info</Button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-black text-foreground">Notification Preferences</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox id="email-notif" checked={notifications.email} onChange={(checked) => setNotifications({ ...notifications, email: checked })} />
            <label htmlFor="email-notif" className="flex-1 cursor-pointer">
              <p className="font-bold text-foreground">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Order updates, delivery tracking, promotions</p>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="sms-notif" checked={notifications.sms} onChange={(checked) => setNotifications({ ...notifications, sms: checked })} />
            <label htmlFor="sms-notif" className="flex-1 cursor-pointer">
              <p className="font-bold text-foreground">SMS Notifications</p>
              <p className="text-xs text-muted-foreground">Important order updates only</p>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="marketing" checked={notifications.marketing} onChange={(checked) => setNotifications({ ...notifications, marketing: checked })} />
            <label htmlFor="marketing" className="flex-1 cursor-pointer">
              <p className="font-bold text-foreground">Marketing Emails</p>
              <p className="text-xs text-muted-foreground">New products, deals, and exclusive offers</p>
            </label>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-foreground">Saved Addresses</h3>
          <Button size="sm" variant="outline">Add Address</Button>
        </div>
        <div className="mt-4 text-center">
          <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No saved addresses yet</p>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-black text-foreground">Security</h3>
        <Button className="mt-4" variant="outline">Change Password</Button>
      </div>
    </div>
  );
}
