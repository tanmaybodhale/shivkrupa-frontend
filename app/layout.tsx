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
    url: 'https://shivkrupaemporium.com',
    siteName: 'Shivkrupa Emporium',
    locale: 'en_IN',
    type: 'website',
  },
  icons: {
    icon: '/shivkrupalogo.png',
    apple: '/shivkrupalogo.png',
  },
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
