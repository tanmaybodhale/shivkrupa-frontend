// lib/xeroxPricing.ts
// Install once:  npm install pdf-lib
import { PDFDocument } from 'pdf-lib';

export type Pricing = Record<string, number>;

export interface XeroxOptions {
  sizes: string[];                         // e.g. ["A4", "A3"]
  typesBySize: Record<string, string[]>;   // e.g. { A4: ["B&W","Color"], A3: ["B&W"] }
}

/**
 * Builds the dropdown options from what the admin actually priced.
 * Only rates with a price above 0 are offered, so "A3 - Color" is hidden
 * if the admin never set it.
 */
export function getXeroxOptions(pricing?: Pricing | null): XeroxOptions {
  const typesBySize: Record<string, string[]> = {};
  for (const [label, price] of Object.entries(pricing ?? {})) {
    if (!(Number(price) > 0)) continue;
    const [size, type] = label.split(' - ').map(s => s.trim());
    if (!size || !type) continue;
    (typesBySize[size] ||= []).push(type);
  }
  return { sizes: Object.keys(typesBySize), typesBySize };
}

/** Price for ONE page, or 0 if that combination isn't set up. */
export function pricePerPage(pricing: Pricing | null | undefined, size: string, type: string): number {
  return Number(pricing?.[`${size} - ${type}`]) || 0;
}

/**
 * Total for one uploaded file:
 *   price per page  x  pages in the file  x  number of copies
 * Example: 2-page PDF, Rs 5/page, 3 copies  ->  5 x 2 x 3 = Rs 30
 */
export function lineTotal(
  pricing: Pricing | null | undefined,
  item: { size: string; type: string; pages: number; copies: number }
): number {
  return pricePerPage(pricing, item.size, item.type) * Math.max(1, item.pages) * Math.max(1, item.copies);
}

/**
 * Number of pages in an uploaded file.
 *  - PDF: read from the file itself, in the browser
 *  - Images: 1
 *  - DOC/DOCX: cannot be counted in the browser. Returns null so the UI can
 *    ask the customer to enter the page count (or you can count on the server).
 */
export async function countPages(file: File): Promise<number | null> {
  const name = file.name.toLowerCase();

  if (file.type.startsWith('image/')) return 1;

  if (file.type === 'application/pdf' || name.endsWith('.pdf')) {
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      return doc.getPageCount();
    } catch {
      return null; // corrupted / password protected: let the customer enter it
    }
  }

  return null; // .doc / .docx
}
