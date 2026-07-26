"use client";

import { useRouter } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name A–Z" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

function url(base, params, sort) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string" && v && k !== "sort" && k !== "page") q.set(k, v);
  }
  if (sort !== "newest") q.set("sort", sort);
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

export function SortSelect({ basePath, searchParams }) {
  const router = useRouter();
  const value = OPTIONS.some((o) => o.value === searchParams.sort) ? searchParams.sort : "newest";
  return (
    <Select value={value} onValueChange={(v) => router.push(url(basePath, searchParams, v))}>
      <SelectTrigger className="w-44" size="sm"><SelectValue /></SelectTrigger>
      <SelectContent>{OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
    </Select>
  );
}
