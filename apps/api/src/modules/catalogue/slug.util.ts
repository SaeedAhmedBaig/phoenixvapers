/**
 * URL slug from a product name: lowercase, ascii-folded, hyphen-separated.
 * Deterministic and side-effect free; uniqueness is enforced by the
 * database index, with a numeric suffix added on collision by the service.
 */
export function slugify(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
