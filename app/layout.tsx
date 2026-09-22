import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
  title: 'Shivkrupa Emporium — Jalna\'s Favourite Store',
  description:
    'Shivkrupa Emporium is Jalna\'s most loved neighbourhood store. Shop stationery, snacks, gifts, household essentials, and more — all under one roof. Fast delivery in Jalna.',
  keywords: [
    'Shivkrupa Emporium',
    'Jalna store',
    'Jalna favourite store',
    'stationery Jalna',
    'grocery Jalna',
    'gifts Jalna',
    'snacks Jalna',
    'household items Jalna',
    'online shopping Jalna',
  ],
  openGraph: {
    title: 'Shivkrupa Emporium — Jalna\'s Favourite Store',
    description:
      'Shivkrupa Emporium is Jalna\'s most loved neighbourhood store. Shop stationery, snacks, gifts, household essentials & more.',
    url: 'https://www.shivkrupaemporium.in',
    siteName: 'Shivkrupa Emporium',
    locale: 'en_IN',
    type: 'website',
  },
  icons: {
    icon: '/shivkrupalogo.jpeg',
    apple: '/shivkrupalogo.jpeg',
  },
  verification: {
    google: 'nq0GTzHEsyBvOzzZfGlW_TqhPYUrLZV5bpPKHjNFYms',
  },
};

// LocalBusiness structured data — this is what lets Google build a
// knowledge-panel-style result (logo, rating, links, map) for the brand.
// TODO: replace the streetAddress / postalCode placeholders below with
// the real values once you have them — everything else is filled in.
const businessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: 'Shivkrupa Emporium',
  alternateName: 'Shivkrupa Emporium — 15 Minute Delivery',
  description:
    "Quick-commerce retail store delivering everyday essentials — stationery, snacks, gifts, household items, cosmetics, jewellery and more — across Jalna city in 15 minutes.",
  image: 'https://www.shivkrupaemporium.in/shivkrupalogo.jpeg',
  logo: 'https://www.shivkrupaemporium.in/shivkrupalogo.jpeg',
  url: 'https://www.shivkrupaemporium.in',
  telephone: '+91-9975636622',
  priceRange: '₹₹',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Kanhaiyya Nagar,',
    addressLocality: 'Jalna',
    addressRegion: 'Maharashtra',
    postalCode: 'TODO: 431203',
    addressCountry: 'IN',
  },
  areaServed: {
    '@type': 'City',
    name: 'Jalna',
  },
  hasMap: 'https://maps.app.goo.gl/ccvCiBAaMTcAonP99',
  sameAs: [
    'https://www.instagram.com/shivkrupa_emporium',
    'https://youtube.com/@shivkrupa_emporium',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to speed up font handshake */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Non-blocking font load (display=swap prevents FOIT) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800;900&display=swap"
        />
        {/* Structured data for Google (knowledge panel / rich results) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <AppProvider>
              {children}
            </AppProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
