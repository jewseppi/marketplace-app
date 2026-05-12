export const PRODUCT_CATEGORIES = [
  "all",
  "bags",
  "shoes",
  "clothing",
  "jewelry",
] as const;

export type ProductCategory = Exclude<
  (typeof PRODUCT_CATEGORIES)[number],
  "all"
>;

export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: {
    main: string;
    additional: string[];
  };
  inStock: boolean;
  sku: string;
};

export type CartItem = {
  productId: number;
  quantity: number;
};

export type Cart = {
  id: string;
  items: CartItem[];
  subtotal: number;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: string;
  cartId: string;
  customerEmail: string;
  paymentMethod: "BTC" | "ETH" | "USDT" | "USDC";
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  total: number;
  createdAt: string;
};

export const products: Product[] = [
  {
    id: 1,
    title: "Luxury Handbag",
    description: "A beautiful designer handbag for every occasion.",
    price: 250.0,
    category: "bags",
    images: {
      main: "/images/purse.png",
      additional: ["/images/purse-01.png"],
    },
    inStock: true,
    sku: "CC-BAG-001",
  },
  {
    id: 2,
    title: "Stylish Heels",
    description: "Comfortable and elegant heels for any event.",
    price: 150.0,
    category: "shoes",
    images: {
      main: "/images/heels.png",
      additional: ["/images/heels-01.png"],
    },
    inStock: true,
    sku: "CC-SHOE-001",
  },
  {
    id: 3,
    title: "Gold Watch",
    description: "Timeless 18k gold, with 14k gold band.",
    price: 450.0,
    category: "jewelry",
    images: {
      main: "/images/watch.png",
      additional: ["/images/heels-01.png"],
    },
    inStock: true,
    sku: "CC-JWL-001",
  },
  {
    id: 4,
    title: "Fancy Blouse",
    description: "Delicate blouse for a night on the town.",
    price: 285.0,
    category: "clothing",
    images: {
      main: "/images/blouse.png",
      additional: ["/images/heels-01.png"],
    },
    inStock: true,
    sku: "CC-CLTH-001",
  },
  {
    id: 5,
    title: "Evening Clutch",
    description: "Compact silk-lined clutch for formal evenings.",
    price: 320.0,
    category: "bags",
    images: {
      main: "/images/purse-01.png",
      additional: ["/images/purse.png"],
    },
    inStock: true,
    sku: "CC-BAG-002",
  },
  {
    id: 6,
    title: "Statement Heels",
    description: "Crystal-embellished heels for the boldest entrances.",
    price: 410.0,
    category: "shoes",
    images: {
      main: "/images/heels-01.png",
      additional: ["/images/heels.png"],
    },
    inStock: true,
    sku: "CC-SHOE-002",
  },
];
