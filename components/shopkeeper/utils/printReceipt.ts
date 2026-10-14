// utils/printReceipt.ts
// Shared receipt / invoice generator (80mm till-style, also saves cleanly as PDF).
//
// IMPORTANT: Xerox rates are variable (set in Admin > Services > Xerox). The rate is
// snapshotted onto each order item (printFile.pricePerPage + item.price) when the order
// is placed, and this receipt ONLY reads those saved values. It never looks up current
// admin rates, so old invoices never change when admin changes prices later.

interface PrintFileInfo {
  fileName?: string;
  orientation?: string;
  pageSize?: string;
  colorMode?: string; // 'bw' | 'color'
  pages?: number;
  pricePerPage?: number; // rate at the time the order was placed
}

interface OrderItem {
  name: string;
  qty: number;
  price: number; // for print items: cost of ONE copy of the whole file at order time
  printDetails?: PrintFileInfo; // name used when saved on the server
  printFile?: PrintFileInfo;    // name used on a freshly placed (local) order
}

export interface ReceiptOrder {
  orderId: string;
  name?: string;
  phone?: string;
  timeStr?: string;
  time?: string | Date;
  status?: string;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  paymentMethod?: string;
  deliveryAddress?: {
    street?: string;
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Whole rupees show without decimals, fractional rates (e.g. 1.5/page) keep them.
const inr = (n: number) => {
  const v = Number(n) || 0;
  return '₹' + (Number.isInteger(v) ? v.toFixed(0) : v.toFixed(2));
};

function formatAddress(addr: ReceiptOrder['deliveryAddress']): string {
  if (!addr) return '';
  return [addr.street, addr.area, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
}

function xeroxDetailHtml(item: OrderItem): string {
  const pf = item.printDetails ?? item.printFile;
  if (!pf) return '';
  const mode = pf.colorMode === 'color' ? 'Colour' : 'B&W';
  const orient = pf.orientation ? pf.orientation.charAt(0).toUpperCase() + pf.orientation.slice(1) : '';
  const pages = pf.pages ?? 0;
  const copies = item.qty;
  // Cost of one copy is the saved item price; rate is the saved per-page rate
  // (derived from the saved price if an older order has no pricePerPage).
  const perCopy = item.price || 0;
  const rate = pf.pricePerPage ?? (pages > 0 ? perCopy / pages : 0);

  return `
    <tr>
      <td colspan="3" class="xerox">
        ${pf.fileName ? `File: ${esc(pf.fileName)}<br/>` : ''}
        Size: ${esc(pf.pageSize || '-')} | ${mode}${orient ? ' | ' + esc(orient) : ''}<br/>
        Rate: ${inr(rate)}/page x ${pages} ${pages === 1 ? 'page' : 'pages'} = ${inr(perCopy)} per copy<br/>
        ${inr(perCopy)} x ${copies} ${copies === 1 ? 'copy' : 'copies'} = <b>${inr(perCopy * copies)}</b>
      </td>
    </tr>`;
}

export function printReceipt(order: ReceiptOrder) {
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="text-align:left; padding:3px 0 1px;">${esc(item.name)}</td>
        <td style="text-align:center; padding:3px 0 1px;">${item.qty}</td>
        <td style="text-align:right; padding:3px 0 1px;">${inr((item.price || 0) * item.qty)}</td>
      </tr>
      ${xeroxDetailHtml(item)}`
    )
    .join('');

  const addr = formatAddress(order.deliveryAddress);
  const freeDelivery = order.delivery === 0;

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Invoice ${esc(order.orderId)}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  body { width: 80mm; margin: 0; padding: 8px; font-family: 'Courier New', monospace; font-size: 12px; color: #000; }
  .center { text-align: center; }
  .shop-name { font-size: 16px; font-weight: bold; }
  .tagline { font-size: 10px; font-style: italic; margin: 2px 0 6px; }
  .divider { border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  .totals td { padding: 2px 0; }
  .bold { font-weight: bold; }
  .small { font-size: 10px; }
  .xerox { font-size: 10px; padding: 0 0 4px 6px; border-bottom: 1px dotted #999; line-height: 1.4; }
</style>
</head>
<body>
  <div class="center">
    <div class="shop-name">SHIVKRUPA EMPORIUM</div>
    <div class="tagline">Jalna's Most Trusted Online Store</div>
    <div class="small">Kanhaiyya Nagar, Jalna, Maharashtra</div>
    <div class="small">Ph: 9975636622</div>
  </div>

  <div class="divider"></div>
  <div>Order #: <span class="bold">${esc(order.orderId)}</span></div>
  <div>Time: ${esc(order.timeStr || (order.time ? new Date(order.time).toLocaleString('en-IN') : ''))}</div>
  ${order.status ? `<div>Status: ${esc(order.status.toUpperCase())}</div>` : ''}
  <div class="divider"></div>

  <div class="bold">Customer:</div>
  <div>${esc(order.name)}</div>
  <div>${esc(order.phone)}</div>
  ${addr ? `<div>${esc(addr)}</div>` : ''}

  <div class="divider"></div>

  <table>
    <thead>
      <tr class="small bold">
        <td style="text-align:left;">Item</td>
        <td style="text-align:center;">Qty</td>
        <td style="text-align:right;">Amt</td>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>

  <div class="divider"></div>

  <table class="totals">
    <tr><td>Subtotal</td><td style="text-align:right;">${inr(order.subtotal)}</td></tr>
    <tr><td>Delivery</td><td style="text-align:right;">${freeDelivery ? 'FREE' : inr(order.delivery)}</td></tr>
    <tr class="bold"><td>Total</td><td style="text-align:right;">${inr(order.total)}</td></tr>
  </table>

  <div class="divider"></div>
  <div class="small">Payment: ${esc((order.paymentMethod || 'COD').toUpperCase())}</div>
  <div class="divider"></div>
  <div class="center small">Thank you for shopping with us!</div>

  <script>
    window.onload = function() {
      window.print();
      window.onafterprint = function() { window.close(); };
    };
  </script>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=400,height=600');
  if (w) {
    w.document.write(html);
    w.document.close();
  } else {
    alert('Please allow pop-ups to download the invoice.');
  }
}
