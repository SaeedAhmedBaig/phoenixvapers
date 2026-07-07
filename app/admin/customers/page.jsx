"use client";

import { useState } from "react";
import { Search, Mail, Phone, ShieldCheck } from "lucide-react";
import { useRequireStaff } from "../lib/admin-auth";
import { AdminLayout } from "../components/admin-layout";
import { Button } from "../../components/ui/button";

const MOCK_CUSTOMERS = [
  { id: 1, name: "Sarah Mitchell", email: "sarah@example.com", phone: "+44 7911 123456", orders: 12, total: "£487.50", verified: true, joined: "2024-01-01" },
  { id: 2, name: "James Powell", email: "james@example.com", phone: "+44 7922 654321", orders: 5, total: "£142.30", verified: true, joined: "2024-01-05" },
  { id: 3, name: "Emma Davis", email: "emma@example.com", phone: "+44 7933 789012", orders: 8, total: "£298.75", verified: true, joined: "2024-01-08" },
  { id: 4, name: "Michael Chen", email: "michael@example.com", phone: "+44 7944 345678", orders: 3, total: "£89.99", verified: false, joined: "2024-01-12" },
];

export default function CustomersPage() {
  const { ready } = useRequireStaff();
  const [search, setSearch] = useState("");

  if (!ready) return null;

  const filtered = MOCK_CUSTOMERS.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Customers</h1>
            <p className="mt-1 text-sm text-muted-foreground">View and manage customer accounts</p>
          </div>
          <Button>Export Customers</Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm font-bold placeholder-muted-foreground outline-none"
          />
        </div>

        {/* Customers Table */}
        <div className="rounded-xl border border-border overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-muted-foreground">Name</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-muted-foreground">Email</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-muted-foreground">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-muted-foreground">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-secondary/50 transition">
                  <td className="px-6 py-4">
                    <strong className="text-sm font-black text-foreground">{customer.name}</strong>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      {customer.email}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-foreground">{customer.orders}</span>
                  </td>
                  <td className="px-6 py-4">
                    <strong className="text-sm font-black text-foreground">{customer.total}</strong>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-lg ${customer.verified ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                      <ShieldCheck className="h-3 w-3" />
                      {customer.verified ? "Verified" : "Unverified"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{customer.joined}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No customers found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
