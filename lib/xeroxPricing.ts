// lib/xeroxPricing.ts
// Install once:  npm install pdf-lib
import { PDFDocument } from 'pdf-lib';

export type Pricing = Record<string, number>;

/** Shape of the Xerox service document returned by GET /services/xerox */
export interface XeroxService {
  pricing?: Pricing | null;
  bulkPricing?: Pricing | null;     // per-page rates once the threshold is reached
  bulkThreshold?: number | null;    // total printed pages at which bulkPricing applies (0 = off)
}

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

/* ───────────── Bulk (threshold) pricing ───────────── */

export const DEFAULT_BULK_THRESHOLD = 20;

/**
 * Total pages that will actually be printed across every file in the order
 * (pages in each file x copies of it). This is the number compared with the
 * admin's threshold.
 */
export function totalPrintedPages(items: { pages: number; copies: number }[]): number {
  return items.reduce((sum, i) => sum + Math.max(1, i.pages) * Math.max(1, i.copies), 0);
}

/** True when the admin has set a threshold and at least one bulk rate. */
export function hasBulkRates(service?: XeroxService | null): boolean {
  const t = Number(service?.bulkThreshold);
  if (!(t > 0)) return false;
  return Object.values(service?.bulkPricing ?? {}).some(p => Number(p) > 0);
}

/** True once totalPages reaches the threshold (and bulk rates exist). */
export function isBulk(service: XeroxService | null | undefined, totalPages: number): boolean {
  return hasBulkRates(service) && totalPages >= Number(service?.bulkThreshold);
}

/**
 * The price list to use for this order. Below the threshold it is the normal
 * pricing. At or above it, any label with a bulk price above 0 is replaced by
 * that bulk price; every other label keeps its normal price.
 *
 * Pass the result into getXeroxOptions / pricePerPage / lineTotal exactly like
 * the plain pricing map.
 */
export function effectivePricing(service: XeroxService | null | undefined, totalPages: number): Pricing {
  const base: Pricing = { ...(service?.pricing ?? {}) };
  if (!isBulk(service, totalPages)) return base;
  for (const [label, price] of Object.entries(service?.bulkPricing ?? {})) {
    if (Number(price) > 0 && Number(base[label]) > 0) base[label] = Number(price);
  }
  return base;
}

/** Pages still needed to unlock the bulk rate (0 if already unlocked or no bulk rates). */
export function pagesToBulk(service: XeroxService | null | undefined, totalPages: number): number {
  if (!hasBulkRates(service)) return 0;
  return Math.max(0, Number(service?.bulkThreshold) - totalPages);
}
