import { string } from "zod";

type CollectionType = {
  _id: string;
  title: string;
  description: string;
  image: string;
  products: ProductType[];
}

type ProductType = {
  _id: string;
  title: string;
  description: string;
  media: [string];
  category: string;
  collections: [CollectionType];
  stock: number;
  tags: [string];
  colorVariants: ColorVariationsType[],
  sizes: [string];
  colors: [string];
  price: number;
  hidden: boolean,
  solde: boolean,
  newprice: number,
  brand: string;
  createdAt: Date;
  updatedAt: Date;
}

type OrderColumnType = {
  _id: string;
  customer: string;
  products: number;
  totalAmount: number;
  status: string,
  createdAt: string;
  name: string
}

type OrderItemType = {
  _id: string
  orderId: string
  product: ProductType
  color: string;
  size: string;
  quantity: number;
  totalAmount: number
}

type CustomerType = {
  clerkId: string;
  name: string;
  email: string;
}

type ColorVariationsType = {
  name: string,
  sizes: SizeVariationsType[],
}

type SizeVariationsType = {
  name: string,
  quantity: number
}