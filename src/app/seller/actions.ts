"use server";

import { revalidatePath } from "next/cache";
import type { ProductCategory, Order } from "@/data/products";
import {
  createProduct,
  softDeleteProduct,
  updateOrderStatus,
  updateProduct,
} from "@/db";

function revalidateSeller() {
  revalidatePath("/");
  revalidatePath("/seller");
  revalidatePath("/seller/products");
  revalidatePath("/seller/orders");
  revalidatePath("/seller/analytics");
}

export async function addSellerProduct(input: {
  title: string;
  description: string;
  price: number;
  stock: boolean;
  category: ProductCategory;
  imageMain: string;
}) {
  createProduct({
    title: input.title,
    description: input.description,
    price: input.price,
    inStock: input.stock,
    category: input.category,
    imageMain: input.imageMain,
  });
  revalidateSeller();
}

export async function saveSellerProduct(input: {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: boolean;
  category: ProductCategory;
  imageMain: string;
}) {
  updateProduct(input.id, {
    title: input.title,
    description: input.description,
    price: input.price,
    inStock: input.stock,
    category: input.category,
    imageMain: input.imageMain,
  });
  revalidateSeller();
}

export async function toggleSellerProductStock(id: number, inStock: boolean) {
  updateProduct(id, { inStock });
  revalidateSeller();
}

export async function archiveSellerProduct(id: number) {
  softDeleteProduct(id);
  revalidateSeller();
}

export async function saveOrderStatus(id: string, status: Order["status"]) {
  updateOrderStatus(id, status);
  revalidateSeller();
}
