export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  images: {
    main: string;
    additional: string[];
  };
};

export const products: Product[] = [
  {
    id: 1,
    title: "Luxury Handbag",
    description: "A beautiful designer handbag for every occasion.",
    price: 250.0,
    images: {
      main: "/images/purse.png",
      additional: ["/images/purse-01.png"],
    },
  },
  {
    id: 2,
    title: "Stylish Heels",
    description: "Comfortable and elegant heels for any event.",
    price: 150.0,
    images: {
      main: "/images/heels.png",
      additional: ["/images/heels-01.png"],
    },
  },
  {
    id: 3,
    title: "Gold Watch",
    description: "Timeless 18k gold, with 14k gold band.",
    price: 450.0,
    images: {
      main: "/images/watch.png",
      additional: ["/images/heels-01.png"],
    },
  },
  {
    id: 4,
    title: "Fancy Blouse",
    description: "Delicate blouse for a night on the town.",
    price: 285.0,
    images: {
      main: "/images/blouse.png",
      additional: ["/images/heels-01.png"],
    },
  },
];
