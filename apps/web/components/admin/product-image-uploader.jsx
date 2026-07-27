"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { Loader2, Trash2, UploadCloud } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Multi-image uploader for product media (spec §5.3 PDP image gallery).
 * Files go BROWSER → Vercel Blob directly (see media-upload/route.js) —
 * this component never handles raw bytes beyond the File object itself.
 *
 * Serialises the resulting `{url, alt}[]` into one hidden JSON field so the
 * surrounding native `<form action={...}>` Server Action reads it like any
 * other field — no client JS needs to run at submit time, and no dynamic
 * field-name/index bookkeeping is needed on the server side.
 */
export function ProductImageUploader({ name = "mediaJson", initialImages = [] }) {
  const [images, setImages] = useState(initialImages);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(fileList) {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;
    setPending(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of files) {
        const blob = await upload(`products/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/admin/products/media-upload",
        });
        uploaded.push({ url: blob.url, alt: "" });
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  function updateAlt(index, alt) {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, alt } : img)));
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(images)} />

      <label className="border-input hover:border-primary/50 has-disabled:pointer-events-none flex cursor-pointer flex-col items-center gap-2 border border-dashed p-6 text-center transition-colors">
        {pending ? (
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        ) : (
          <UploadCloud className="text-muted-foreground size-6" />
        )}
        <span className="text-sm font-medium">{pending ? "Uploading…" : "Click to add images"}</span>
        <span className="text-muted-foreground text-xs">JPEG, PNG, WebP or GIF — up to 8MB each</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          disabled={pending}
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {error ? (
        <p className="text-destructive text-xs" role="alert">
          {error}
        </p>
      ) : null}

      {images.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {images.map((img, i) => (
            <li key={img.url} className="border-border flex gap-3 border p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="bg-muted size-16 shrink-0 object-cover" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Label htmlFor={`media-alt-${i}`} className="text-xs">
                  Alt text
                </Label>
                <Input
                  id={`media-alt-${i}`}
                  value={img.alt}
                  onChange={(e) => updateAlt(i, e.target.value)}
                  placeholder="Describe the image (min 3 characters)"
                  required
                  minLength={3}
                  className="h-8 text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label="Remove image"
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
