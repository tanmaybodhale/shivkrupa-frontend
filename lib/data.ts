import { Category, Product } from './types';

export const FREE_DELIVERY_THRESHOLD = 99;
export const DELIVERY_CHARGE = 30;
export const SHOPKEEPER_PASS = 'admin123';

export const CATEGORIES: Category[] = [
  { id: 'all',        label: 'All Items',    emoji: '🛍️' },
  { id: 'stationery', label: 'Stationery',   emoji: '✏️' },
  { id: 'snacks',     label: 'Snacks',       emoji: '🍫' },
  { id: 'gifts',      label: 'Gifts',        emoji: '🎁' },
  { id: 'jewellery',  label: 'Jewellery',    emoji: '💍' },
  { id: 'cutlery',    label: 'Cutlery',      emoji: '🍴' },
  { id: 'xerox',      label: 'Xerox / Print',emoji: '🖨️' },
  { id: 'cosmetics',  label: 'Cosmetics',    emoji: '💄' },
  { id: 'bags',       label: 'Bags & Pouches',emoji: '👜' },
  { id: 'toys',       label: 'Toys',         emoji: '🧸' },
  { id: 'household',  label: 'Household',    emoji: '🏠' },
];

export const PRODUCTS: Product[] = [
  // Stationery
  { id:1,  name:'Classmate Notebook A4 (200 pg)',    cat:'stationery', price:65,  emoji:'📓', tag:'bestseller', isNew:false },
  { id:2,  name:'Reynolds 045 Pens (Pack of 10)',    cat:'stationery', price:45,  emoji:'🖊️', tag:'',           isNew:false },
  { id:3,  name:'Stapler Set with Pins',             cat:'stationery', price:120, emoji:'📌', tag:'',           isNew:false },
  { id:4,  name:'Highlighter Set (5 colours)',       cat:'stationery', price:80,  emoji:'🖍️', tag:'',           isNew:true  },
  { id:5,  name:'Geometry Box – Premium',            cat:'stationery', price:95,  emoji:'📐', tag:'',           isNew:false },
  { id:6,  name:'Scissors & Craft Set',              cat:'stationery', price:55,  emoji:'✂️', tag:'',           isNew:false },
  // Snacks
  { id:7,  name:"Lay's Chips Mix (Combo 3)",         cat:'snacks',     price:60,  emoji:'🥔', tag:'popular',    isNew:false },
  { id:8,  name:'Dark Fantasy Bourbon (2 packs)',    cat:'snacks',     price:50,  emoji:'🍪', tag:'',           isNew:false },
  { id:9,  name:'Cadbury Dairy Milk (4 bars)',       cat:'snacks',     price:120, emoji:'🍫', tag:'bestseller', isNew:false },
  { id:10, name:'Kurkure Masala Munch',              cat:'snacks',     price:30,  emoji:'🌽', tag:'',           isNew:false },
  { id:11, name:'Haldiram Mixed Namkeen 400g',       cat:'snacks',     price:85,  emoji:'🫙', tag:'',           isNew:true  },
  // Gifts
  { id:12, name:'Gift Hamper – Sweet & Stationery',  cat:'gifts',      price:350, emoji:'🎁', tag:'premium',    isNew:false },
  { id:13, name:'Greeting Card Set (12 pcs)',        cat:'gifts',      price:75,  emoji:'💌', tag:'',           isNew:false },
  { id:14, name:'Photo Frame – Wooden',              cat:'gifts',      price:180, emoji:'🖼️', tag:'',           isNew:true  },
  { id:15, name:'Diwali Gift Box Deluxe',            cat:'gifts',      price:499, emoji:'🪔', tag:'sale',       isNew:false },
  { id:16, name:'Birthday Balloon Bouquet',          cat:'gifts',      price:150, emoji:'🎈', tag:'',           isNew:true  },
  // Jewellery
  { id:17, name:'Silver Anklet Pair',                cat:'jewellery',  price:220, emoji:'💍', tag:'',           isNew:false },
  { id:18, name:'Gold-Plated Jhumka Earrings',       cat:'jewellery',  price:280, emoji:'💎', tag:'bestseller', isNew:false },
  { id:19, name:'Oxidised Bangle Set (6 pc)',        cat:'jewellery',  price:160, emoji:'🔮', tag:'',           isNew:true  },
  { id:20, name:'Thread Bracelet Set',               cat:'jewellery',  price:65,  emoji:'🧵', tag:'',           isNew:false },
  // Cutlery
  { id:21, name:'Stainless Steel Lunch Box Set',     cat:'cutlery',    price:240, emoji:'🍱', tag:'premium',    isNew:false },
  { id:22, name:'Spoon & Fork Set (6+6)',            cat:'cutlery',    price:185, emoji:'🍴', tag:'',           isNew:false },
  { id:23, name:'Casserole Hot Pot 1.5L',            cat:'cutlery',    price:320, emoji:'🫕', tag:'',           isNew:true  },
  { id:24, name:'Serving Bowls Set (3 pcs)',         cat:'cutlery',    price:195, emoji:'🥣', tag:'',           isNew:false },
  // Xerox
  { id:25, name:'Photocopy A4 (per page)',           cat:'xerox',      price:2,   emoji:'🖨️', tag:'',           isNew:false },
  { id:26, name:'Colour Print A4 (per page)',        cat:'xerox',      price:10,  emoji:'🖨️', tag:'',           isNew:false },
  { id:27, name:'Lamination A4 Sheet',               cat:'xerox',      price:20,  emoji:'📄', tag:'',           isNew:false },
  { id:28, name:'Spiral Binding (per document)',     cat:'xerox',      price:35,  emoji:'📋', tag:'',           isNew:false },
  // Cosmetics
  { id:29, name:'Lakme Nail Colour Set',             cat:'cosmetics',  price:145, emoji:'💅', tag:'',           isNew:false },
  { id:30, name:'Face Pack Combo (3 types)',         cat:'cosmetics',  price:110, emoji:'🧴', tag:'',           isNew:true  },
  { id:31, name:'Kajal & Eyeliner Set',              cat:'cosmetics',  price:95,  emoji:'👁️', tag:'bestseller', isNew:false },
  // Bags
  { id:32, name:'Jute Shopping Bag',                 cat:'bags',       price:90,  emoji:'👜', tag:'eco',        isNew:false },
  { id:33, name:'Pencil Pouch – Printed',            cat:'bags',       price:75,  emoji:'✏️', tag:'',           isNew:true  },
  // Toys
  { id:34, name:'Puzzle Set 100 Pieces',             cat:'toys',       price:120, emoji:'🧩', tag:'',           isNew:false },
  { id:35, name:'Fidget Spinner Premium',            cat:'toys',       price:50,  emoji:'🌀', tag:'',           isNew:false },
  // Household
  { id:36, name:'Phenyl Floor Cleaner 1L',           cat:'household',  price:75,  emoji:'🧹', tag:'',           isNew:false },
  { id:37, name:'Incense Sticks Assorted Box',       cat:'household',  price:55,  emoji:'🕯️', tag:'popular',    isNew:false },
];
