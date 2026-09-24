import type { MetadataRoute } from 'next';

const SITE_URL = 'https://www.shivkrupaemporium.in';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /admin, /shopkeeper, /wishlist are intentionally NOT disallowed
        // here — they use `noindex` meta tags instead (see their layout
        // files), since a page blocked here can't have Google read its
        // noindex tag, which is the more reliable way to keep a page out
        // of search results. This also avoids Google showing a blank
        // "no information available" listing for a URL it can't crawl
        // but still knows exists.
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
