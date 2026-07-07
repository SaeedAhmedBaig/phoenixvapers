"use client";

import { useState } from "react";
import { Plus, Search, Trash2, Edit2, Shield, User } from "lucide-react";
import { useRequireStaff } from "../../lib/admin-auth";
import { AdminLayout } from "../../components/admin-layout";
import { Button } from "../../../components/ui/button";

const MOCK_STAFF = [
  { id: 1, name: "Alex Johnson", email: "alex@phoenixvapers.com", role: "super-admin", status: "Active", joined: "2023-01-15" },
  { id: 2, name: "Sarah Smith", email: "sarah@phoenixvapers.com", role: "staff", status: "Active", joined: "2023-06-20" },
  { id: 3, name: "Mike Wilson", email: "mike@phoenixvapers.com", role: "staff", status: "Active", joined: "2023-09-10" },
  { id: 4, name: "Brand Co", email: "contact@brandco.com", role: "brand-partner", status: "Active", joined: "2024-01-01" },
];

export default function SuperAdminStaffPage() {
  const { ready } = useRequireStaff();
  const [search, setSearch] = useState("");

  if (!ready) return null;

  const filtered = MOCK_STAFF.filter(
    (staff) =>
      staff.name.toLowerCase().includes(search.toLowerCase()) ||
      staff.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Staff Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage staff members and brand partners</p>
          </div>
          <Button>
            <Plus className="h-4 w-4" />
            Add Staff Member
          </Button>
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

        {/* Staff Table */}
        <div className="rounded-xl border border-border overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-muted-foreground">Name</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-muted-foreground">Email</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-muted-foreground">Role</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-muted-foreground">Joined</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((staff) => (
                <tr key={staff.id} className="hover:bg-secondary/50 transition">
                  <td className="px-6 py-4">
                    <strong className="text-sm font-black text-foreground">{staff.name}</strong>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{staff.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-lg bg-primary/10 text-primary">
                      {staff.role === "super-admin" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {staff.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-lg px-3 py-1 text-xs font-black bg-success/10 text-success">
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{staff.joined}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No staff members found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
