import type { Metadata } from 'next';
import ProductClient from './ProductClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SITE_URL = 'https://www.shivkrupaemporium.in';
const FALLBACK_IMAGE = `${SITE_URL}/shivkrupalogo.jpeg`;

interface Props {
  params: Promise<{ id: string }>;
}

// Fetch product server-side for OG metadata generation
async function getProduct(id: string) {
  try {
    const res = await fetch(`${API_URL}/catalog/${id}`, {
      // Revalidate every 60 seconds so edits are reflected quickly
      next: { revalidate: 60 },
    });
    const data = await res.json();
    if (data.success) return data.product;
  } catch {
    // Ignore — will fall back to site defaults
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product | Shivkrupa Emporium',
      description: 'Shop at Shivkrupa Emporium — Jalna\'s favourite store.',
    };
  }

  const title = `${product.name} — ₹${product.price} | Shivkrupa Emporium`;
  const description =
    product.description
      ? `${product.description} — Available at Shivkrupa Emporium, Jalna.`
      : `Check out ${product.name} for ₹${product.price} at Shivkrupa Emporium — Jalna's favourite store!`;

  // Use the product's image if it is a valid absolute URL; else fall back to logo
  const ogImage =
    product.image && product.image.startsWith('http')
      ? product.image
      : FALLBACK_IMAGE;

  const productUrl = `${SITE_URL}/product/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: productUrl,
      siteName: 'Shivkrupa Emporium',
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function ProductPage() {
  return <ProductClient />;
}
