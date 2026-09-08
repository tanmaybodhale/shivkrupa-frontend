// utils/printReceipt.ts
// Opens a small print-friendly window formatted for a thermal/till receipt
// printer (80mm width) showing the shop header, order details, and items.
// Call printReceipt(order) from a button anywhere in your admin panel.

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface ReceiptOrder {
  orderId: string;
  name: string;
  phone: string;
  timeStr?: string;
  time?: string | Date;
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

function formatAddress(addr: ReceiptOrder['deliveryAddress']): string {
  if (!addr) return '';
  return [addr.street, addr.area, addr.city, addr.state, addr.pincode]
    .filter(Boolean)
    .join(', ');
}

export function printReceipt(order: ReceiptOrder) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="text-align:left; padding:2px 0;">${item.name}</td>
        <td style="text-align:center; padding:2px 0;">${item.qty}</td>
        <td style="text-align:right; padding:2px 0;">₹${((item.price || 0) * item.qty).toFixed(0)}</td>
      </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Order ${order.orderId}</title>
<style>
  @page {
    size: 80mm auto;
    margin: 0;
  }
  body {
    width: 80mm;
    margin: 0;
    padding: 8px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: #000;
  }
  .center { text-align: center; }
  .shop-name { font-size: 16px; font-weight: bold; }
  .tagline { font-size: 10px; font-style: italic; margin: 2px 0 6px; }
  .divider { border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  .totals td { padding: 2px 0; }
  .bold { font-weight: bold; }
  .small { font-size: 10px; }
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

  <div>Order #: <span class="bold">${order.orderId}</span></div>
  <div>Time: ${order.timeStr || ''}</div>
  <div class="divider"></div>

  <div class="bold">Customer:</div>
  <div>${order.name}</div>
  <div>${order.phone}</div>
  ${order.deliveryAddress ? `<div>${formatAddress(order.deliveryAddress)}</div>` : ''}

  <div class="divider"></div>

  <table>
    <thead>
      <tr class="small bold">
        <td style="text-align:left;">Item</td>
        <td style="text-align:center;">Qty</td>
        <td style="text-align:right;">Amt</td>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="divider"></div>

  <table class="totals">
    <tr><td>Subtotal</td><td style="text-align:right;">₹${order.subtotal.toFixed(0)}</td></tr>
    <tr><td>Delivery</td><td style="text-align:right;">${order.delivery === 0 ? 'FREE' : '₹' + order.delivery.toFixed(0)}</td></tr>
    <tr class="bold"><td>Total</td><td style="text-align:right;">₹${order.total.toFixed(0)}</td></tr>
  </table>

  <div class="divider"></div>
  <div class="small">Payment: ${(order.paymentMethod || 'COD').toUpperCase()}</div>

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

  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
