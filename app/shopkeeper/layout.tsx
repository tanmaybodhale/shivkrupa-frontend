import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nosnippet: true,
  },
};

export default function ShopkeeperLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
