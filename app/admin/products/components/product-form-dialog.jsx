"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { adminCreateProduct, adminUpdateProduct, adminUploadMedia, mediaUrl } from "../../../lib/api";

const REQUIRED_FIELDS = ["name", "brandSlug", "categorySlug", "collection", "format", "strength", "description"];
const MAX_IMAGE_MB = 8;

export function ProductFormDialog({ product, brands, categories, accessToken, onClose, onSaved }) {
  const isEdit = Boolean(product);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: product?.name || "",
    brandSlug: product?.brandSlug || "",
    categorySlug: product?.categorySlug || "",
    collection: product?.collectionTag || "",
    format: product?.format || "",
    flavour: product?.flavour || "",
    strength: product?.strength || "",
    price: product ? ((product.priceMinor || 0) / 100).toFixed(2) : "",
    compareAt: product?.compareAtMinor ? (product.compareAtMinor / 100).toFixed(2) : "",
    badge: product?.badge || "",
    description: product?.description || "",
  });
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, or WebP)");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_IMAGE_MB}MB`);
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const altText = form.name.trim() || file.name.replace(/\.[^.]+$/, "");
      const asset = await adminUploadMedia(file, altText, accessToken);
      setImageUrl(asset.url);
    } catch (err) {
      console.error("Image upload failed:", err);
      setError(err?.message || "Image upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const missing = REQUIRED_FIELDS.filter((f) => !form[f]?.trim());
    if (missing.length) {
      setError(`Please fill in: ${missing.join(", ")}`);
      return;
    }
    const priceMinor = Math.round(parseFloat(form.price) * 100);
    if (!Number.isFinite(priceMinor) || priceMinor < 0) {
      setError("Please enter a valid price (e.g. 4.99)");
      return;
    }

    const dto = {
      name: form.name.trim(),
      brandSlug: form.brandSlug,
      categorySlug: form.categorySlug,
      collection: form.collection.trim(),
      format: form.format.trim(),
      strength: form.strength.trim(),
      priceMinor,
      description: form.description.trim(),
      imageUrl, // empty string clears a previously set photo

      ...(form.flavour.trim() ? { flavour: form.flavour.trim() } : {}),
      ...(form.badge.trim() ? { badge: form.badge.trim() } : {}),
    };
    const compareAtMinor = form.compareAt ? Math.round(parseFloat(form.compareAt) * 100) : null;
    if (compareAtMinor && Number.isFinite(compareAtMinor)) dto.compareAtMinor = compareAtMinor;

    setSaving(true);
    try {
      if (isEdit) {
        await adminUpdateProduct(product.slug, dto, accessToken);
      } else {
        await adminCreateProduct(dto, accessToken);
      }
      onSaved();
    } catch (err) {
      console.error("Product save failed:", err);
      setError(err?.message || "Failed to save product");
      setSaving(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold placeholder-muted-foreground outline-none focus:border-primary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <h2 className="text-xl font-black text-foreground">
            {isEdit ? `Edit ${product.name}` : "Add Product"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Product photo */}
          <div>
            <span className="text-xs font-black uppercase text-muted-foreground">Product Photo</span>
            <div className="mt-1 flex items-center gap-4">
              <div className="relative grid h-28 w-28 flex-shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-secondary/40">
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : imageUrl ? (
                  <img
                    src={mediaUrl(imageUrl)}
                    alt="Product preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImagePlus className="h-7 w-7 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="p-image-input"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-4 w-4" />
                  {imageUrl ? "Replace Photo" : "Upload Photo"}
                </Button>
                {imageUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={uploading}
                    onClick={() => setImageUrl("")}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                    Remove
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, or WebP up to {MAX_IMAGE_MB}MB. Converted to WebP automatically.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase text-muted-foreground" htmlFor="p-name">
              Product Name *
            </label>
            <input id="p-name" type="text" value={form.name} onChange={set("name")} className={inputClass} placeholder="e.g. Bar Wars Blue Razz 10ml" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-black uppercase text-muted-foreground" htmlFor="p-brand">
                Brand *
              </label>
              <select id="p-brand" value={form.brandSlug} onChange={set("brandSlug")} className={inputClass}>
                <option value="">Select brand…</option>
                {brands.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-black uppercase text-muted-foreground" htmlFor="p-category">
                Category *
              </label>
              <select id="p-category" value={form.categorySlug} onChange={set("categorySlug")} className={inputClass}>
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-black uppercase text-muted-foreground" htmlFor="p-collection">
                Collection *
              </label>
              <input id="p-collection" type="text" value={form.collection} onChange={set("collection")} className={inputClass} placeholder="e.g. e-liquids" />
            </div>
            <div>
              <label className="text-xs font-black uppercase text-muted-foreground" htmlFor="p-format">
                Format *
              </label>
              <input id="p-format" type="text" value={form.format} onChange={set("format")} className={inputClass} placeholder="e.g. 10ml Nic Salt" />
            </div>
            <div>
              <label className="text-xs font-black uppercase text-muted-foreground" htmlFor="p-strength">
                Strength *
              </label>
              <input id="p-strength" type="text" value={form.strength} onChange={set("strength")} className={inputClass} placeholder="e.g. 20mg" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-black uppercase text-muted-foreground" htmlFor="p-price">
                Price (£) *
              </label>
              <input id="p-price" type="number" step="0.01" min="0" value={form.price} onChange={set("price")} className={inputClass} placeholder="4.99" />
            </div>
            <div>
              <label className="text-xs font-black uppercase text-muted-foreground" htmlFor="p-compare">
                Compare At (£)
              </label>
              <input id="p-compare" type="number" step="0.01" min="0" value={form.compareAt} onChange={set("compareAt")} className={inputClass} placeholder="Optional" />
            </div>
            <div>
              <label className="text-xs font-black uppercase text-muted-foreground" htmlFor="p-flavour">
                Flavour
              </label>
              <input id="p-flavour" type="text" value={form.flavour} onChange={set("flavour")} className={inputClass} placeholder="Optional" />
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase text-muted-foreground" htmlFor="p-description">
              Description *
            </label>
            <textarea id="p-description" rows={4} value={form.description} onChange={set("description")} className={inputClass} placeholder="Product description shown on the storefront…" />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
