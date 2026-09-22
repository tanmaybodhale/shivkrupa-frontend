import type { MetadataRoute } from 'next';

const SITE_URL = 'https://www.shivkrupaemporium.in';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Static routes confirmed against app/ in shivkrupa-frontend:
//   /            — landing page
//   /customer    — main storefront (public, high priority)
//   /login       — public, low priority/change-frequency
// admin, shopkeeper, wishlist are private and deliberately left out —
// see robots.ts, which also disallows crawling them.
const staticRoutes: {
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
}[] = [
  { path: '', priority: 1.0, changeFrequency: 'daily' },
  { path: '/customer', priority: 0.9, changeFrequency: 'daily' },
  { path: '/login', priority: 0.2, changeFrequency: 'yearly' },
];

interface CatalogProduct {
  _id?: string;
  id?: number | string;
  category?: string;
  hidden?: boolean;
  inStock?: boolean;
  // Not in the shared Product type, but Mongoose adds this automatically
  // when the schema has `timestamps: true` (the API sorts by createdAt,
  // so timestamps are almost certainly on). Read defensively.
  updatedAt?: string;
}

async function getProducts(): Promise<CatalogProduct[]> {
  try {
    // No ?admin=true — confirmed server-side (routes/catalog.ts) that the
    // default GET / already excludes { hidden: true } products, so this
    // request can never leak a hidden product's URL in the first place.
    const res = await fetch(`${API_URL}/catalog`, {
      // Sitemap doesn't need to be real-time — refresh hourly instead of
      // hitting the API on every crawl.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (data?.success && Array.isArray(data.products)) return data.products;
    return [];
  } catch {
    // Never let a backend hiccup break the sitemap — fall back to static
    // routes only rather than a 500.
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  // /catalog already excludes hidden products server-side; filtering again
  // here is belt-and-suspenders so the sitemap stays safe even if that
  // server-side behavior ever changes.
  const visibleProducts = products.filter((p) => !p.hidden);

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const productEntries: MetadataRoute.Sitemap = visibleProducts
    .map((p) => {
      const id = p._id || String(p.id ?? '');
      return {
        url: `${SITE_URL}/product/${id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        // Slightly deprioritize out-of-stock items so crawlers focus
        // budget on what's actually purchasable right now.
        priority: p.inStock === false ? 0.3 : 0.7,
      };
    })
    // Guard against malformed/empty ids producing a garbage URL.
    .filter((entry) => entry.url !== `${SITE_URL}/product/`);

  // Categories aren't a fixed list anywhere in the codebase — CategoryPageClient
  // derives them at runtime from whatever `product.category` values exist.
  // Mirror that here: build /category/[slug] entries from the same distinct
  // set, rather than maintaining a second, easily-stale list of categories.
  const categorySlugs = Array.from(
    new Set(
      visibleProducts
        .map((p) => (p.category || '').trim())
        .filter((c) => c.length > 0)
    )
  );

  const categoryEntries: MetadataRoute.Sitemap = categorySlugs.map((cat) => ({
    url: `${SITE_URL}/category/${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
