import type { MetadataRoute } from 'next';

const SITE_URL = 'https://www.shivkrupaemporium.in';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Confirmed against app/ in shivkrupa-frontend:
        //   /admin      — shopkeeper admin dashboard, private
        //   /shopkeeper — shopkeeper-only tools, private
        //   /wishlist   — per-user personal data, private
        // /customer and /login are intentionally left crawlable.
        disallow: ['/admin', '/shopkeeper', '/wishlist'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
